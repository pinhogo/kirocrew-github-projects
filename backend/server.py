"""Minimal, robust HTTP backend for the github-projects Kiro Crew App.

Proxied by the Kiro Crew Gateway under /apps/github-projects/api/*
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import github_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("github-projects-backend")

PORT = int(os.environ.get("PORT", 9100))
APP_NAME = os.environ.get("KIROCREW_APP_NAME", "github-projects")
_PROXY_SECRET_ENV = "KIROCREW_PROXY_SECRET"
_MAX_BODY_BYTES = 1024 * 1024  # 1 MiB
_MAX_SKEW_SECONDS = 60
_MAX_TS_DIGITS = 12


class _ReplayCache:
    """Thread-safe one-time nonce tracker matching Kiro Crew's proxy-v2 window."""

    def __init__(self, max_entries: int = 4096) -> None:
        self._max_entries = max_entries
        self._seen: dict[str, float] = {}
        self._lock = threading.Lock()

    def accept(self, nonce: str, expires_at: float, now: float) -> bool:
        with self._lock:
            expired = [k for k, exp in self._seen.items() if exp < now]
            for k in expired:
                del self._seen[k]
            if nonce in self._seen or len(self._seen) >= self._max_entries:
                return False
            self._seen[nonce] = expires_at
            return True


_NONCE_CACHE = _ReplayCache()


def _is_valid_nonce(nonce: str) -> bool:
    return len(nonce) == 32 and all(ch in "0123456789abcdef" for ch in nonce)


def _verify_gateway_hmac(method: str, target: str, body: bytes, headers) -> bool:
    """Fail closed when KIROCREW_PROXY_SECRET is present and proxy HMAC is missing/invalid."""
    secret = os.environ.get(_PROXY_SECRET_ENV, "")
    if not secret:
        # Standalone local dev execution outside gateway
        return True

    now = time.time()
    body_hash = hashlib.sha256(body or b"").hexdigest()

    v2_header = headers.get("X-KiroCrew-Proxy-V2", "")
    nonce = headers.get("X-KiroCrew-Proxy-Nonce", "")
    if v2_header and nonce:
        if not _is_valid_nonce(nonce) or ":" not in v2_header:
            return False
        ts_str, _, sig = v2_header.partition(":")
        if not (ts_str.isascii() and ts_str.isdigit()) or len(ts_str) > _MAX_TS_DIGITS or not sig:
            return False
        ts = int(ts_str)
        if abs(now - ts) > _MAX_SKEW_SECONDS:
            return False
        msg = f"v2:{ts_str}:{nonce}:{method}:{target}:{body_hash}"
        expected = hmac.new(secret.encode("utf-8"), msg.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected.encode("utf-8"), sig.encode("utf-8", "surrogatepass")):
            return False
        return _NONCE_CACHE.accept(nonce, ts + _MAX_SKEW_SECONDS, now)

    v1_header = headers.get("X-KiroCrew-Proxy", "")
    if not v1_header or ":" not in v1_header:
        return False
    ts_str, _, sig = v1_header.partition(":")
    if not (ts_str.isascii() and ts_str.isdigit()) or len(ts_str) > _MAX_TS_DIGITS or not sig:
        return False
    ts = int(ts_str)
    if abs(now - ts) > _MAX_SKEW_SECONDS:
        return False
    msg = f"{ts_str}:{method}:{target}:{body_hash}"
    expected = hmac.new(secret.encode("utf-8"), msg.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected.encode("utf-8"), sig.encode("utf-8", "surrogatepass"))


def _parse_project_number(value) -> int | None:
    if value is None or value == "":
        return None
    try:
        num = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("project_number must be an integer") from exc
    return num if num > 0 else None


class AppHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        gateway_origin = os.environ.get("KIROCREW_GATEWAY_ORIGIN", "").strip()
        if gateway_origin:
            self.send_header("Access-Control-Allow-Origin", gateway_origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        gateway_origin = os.environ.get("KIROCREW_GATEWAY_ORIGIN", "").strip()
        if gateway_origin:
            self.send_header("Access-Control-Allow-Origin", gateway_origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _read_raw_body(self) -> bytes:
        try:
            content_length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            return b""
        if content_length <= 0:
            return b""
        if content_length > _MAX_BODY_BYTES:
            raise ValueError("Request body exceeds maximum allowed size")
        return self.rfile.read(content_length)

    def _parse_json_body(self, raw: bytes) -> dict:
        if not raw:
            return {}
        try:
            parsed = json.loads(raw.decode("utf-8"))
            return parsed if isinstance(parsed, dict) else {}
        except Exception as exc:
            logger.warning("Failed to parse JSON body: %s", exc)
            return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Health probe runs unsigned directly from the gateway
        if path in ("/health", "/api/health"):
            return self._send_json(200, {"status": "ok", "app": APP_NAME})

        if not _verify_gateway_hmac("GET", self.path, b"", self.headers):
            return self._send_json(401, {"ok": False, "error": "Unauthorized proxy request"})

        query = parse_qs(parsed.query)

        # List projects for an owner (or auto-detect authenticated gh user)
        if path in ("/api/projects", "/projects", "/api/apps/github-projects/projects"):
            owner = query.get("owner", [""])[0] or None
            try:
                resolved_owner, projects = github_client.list_projects(owner)
                return self._send_json(200, {"ok": True, "owner": resolved_owner, "projects": projects})
            except Exception as exc:
                logger.error("Error listing projects: %s", exc)
                return self._send_json(500, {"ok": False, "error": str(exc)})

        if path in ("/api/status", "/status", "/api/apps/github-projects/status"):
            return self._send_json(200, {"app": APP_NAME, "version": "1.0.1", "status": "active"})

        return self._send_json(404, {"ok": False, "error": f"Path not found: {path}"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        try:
            raw_body = self._read_raw_body()
        except ValueError as exc:
            return self._send_json(413, {"ok": False, "error": str(exc)})

        if not _verify_gateway_hmac("POST", self.path, raw_body, self.headers):
            return self._send_json(401, {"ok": False, "error": "Unauthorized proxy request"})

        body = self._parse_json_body(raw_body)
        owner = (body.get("owner") or "").strip() or None

        try:
            project_number = _parse_project_number(body.get("project_number"))
            raw_limit = body.get("limit", 300)
            limit = max(1, min(int(300 if raw_limit is None else raw_limit), 1000))
        except (TypeError, ValueError) as exc:
            return self._send_json(400, {"ok": False, "error": str(exc)})

        # List tasks
        if path in ("/api/tasks", "/tasks", "/api/apps/github-projects/tasks"):
            try:
                resolved_owner = github_client.resolve_owner(owner)
                if project_number is None:
                    _, projects = github_client.list_projects(resolved_owner)
                    if not projects:
                        return self._send_json(
                            200,
                            {"ok": True, "owner": resolved_owner, "project": None, "tasks": []},
                        )
                    project_number = projects[0]["number"]
                res = github_client.list_project_tasks(resolved_owner, project_number, limit)
                return self._send_json(200, {"ok": True, **res})
            except Exception as exc:
                logger.error("Error listing tasks: %s", exc)
                return self._send_json(500, {"ok": False, "error": str(exc)})

        # Create task
        if path in ("/api/task/create", "/task/create", "/api/apps/github-projects/task/create"):
            title = (body.get("title") or "").strip()
            task_body = body.get("body", "")
            status = body.get("status")
            if not project_number:
                return self._send_json(400, {"ok": False, "error": "project_number is required"})
            if not title:
                return self._send_json(400, {"ok": False, "error": "Title is required"})

            try:
                res = github_client.create_task(owner, project_number, title, task_body, status)
                return self._send_json(200, {"ok": True, **res})
            except Exception as exc:
                logger.error("Error creating task: %s", exc)
                return self._send_json(500, {"ok": False, "error": str(exc)})

        # Update task status (Move to any column)
        if path in ("/api/task/update-status", "/task/update-status", "/api/apps/github-projects/task/update-status"):
            item_id = body.get("item_id") or body.get("task_id")
            status_name = body.get("status") or body.get("status_name")
            if not project_number:
                return self._send_json(400, {"ok": False, "error": "project_number is required"})
            if not item_id or not status_name:
                return self._send_json(400, {"ok": False, "error": "item_id and status are required"})

            try:
                res = github_client.update_task_status(owner, project_number, item_id, status_name)
                return self._send_json(200, {"ok": True, **res})
            except Exception as exc:
                logger.error("Error updating task status: %s", exc)
                return self._send_json(500, {"ok": False, "error": str(exc)})

        # Delete task
        if path in ("/api/task/delete", "/task/delete", "/api/apps/github-projects/task/delete"):
            item_id = body.get("item_id") or body.get("task_id")
            if not project_number:
                return self._send_json(400, {"ok": False, "error": "project_number is required"})
            if not item_id:
                return self._send_json(400, {"ok": False, "error": "item_id is required"})

            try:
                res = github_client.delete_task(owner, project_number, item_id)
                return self._send_json(200, {"ok": True, **res})
            except Exception as exc:
                logger.error("Error deleting task: %s", exc)
                return self._send_json(500, {"ok": False, "error": str(exc)})

        return self._send_json(404, {"ok": False, "error": f"Path not found: {path}"})

    def log_message(self, format, *args):
        logger.info("%s - %s", self.address_string(), format % args)


class Server(ThreadingHTTPServer):
    allow_reuse_address = not sys.platform.startswith("win")
    daemon_threads = True


if __name__ == "__main__":
    logger.info("Starting %s backend on port %s", APP_NAME, PORT)
    Server(("127.0.0.1", PORT), AppHandler).serve_forever()
