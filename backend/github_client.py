"""GitHub Projects v2 client for the github-projects Kiro Crew App.

Handles listing, creating, moving, and deleting tasks via GitHub's GraphQL API and gh CLI.
"""

from __future__ import annotations

import json
import logging
import re
import subprocess
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger(__name__)

GET_OWNER_PROJECTS_QUERY = """
query($owner: String!) {
  repositoryOwner(login: $owner) {
    ... on User {
      projectsV2(first: 20) {
        nodes {
          id
          number
          title
          url
          closed
        }
      }
    }
    ... on Organization {
      projectsV2(first: 20) {
        nodes {
          id
          number
          title
          url
          closed
        }
      }
    }
  }
}
"""

GET_PROJECT_DETAILS_QUERY = """
query($owner: String!, $number: Int!) {
  repositoryOwner(login: $owner) {
    ... on User {
      projectV2(number: $number) {
        id
        number
        title
        url
        closed
        fields(first: 50) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }
    ... on Organization {
      projectV2(number: $number) {
        id
        number
        title
        url
        closed
        fields(first: 50) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }
  }
}
"""

GET_PROJECT_ITEMS_PAGE_QUERY = """
query($owner: String!, $number: Int!, $cursor: String, $first: Int!) {
  repositoryOwner(login: $owner) {
    ... on User {
      projectV2(number: $number) {
        items(first: $first, after: $cursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            type
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
            content {
              ... on DraftIssue {
                title
                body
              }
              ... on Issue {
                number
                title
                url
                body
                repository {
                  nameWithOwner
                }
              }
              ... on PullRequest {
                number
                title
                url
                body
                repository {
                  nameWithOwner
                }
              }
            }
          }
        }
      }
    }
    ... on Organization {
      projectV2(number: $number) {
        items(first: $first, after: $cursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            type
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2SingleSelectField {
                      name
                    }
                  }
                }
              }
            }
            content {
              ... on DraftIssue {
                title
                body
              }
              ... on Issue {
                number
                title
                url
                body
                repository {
                  nameWithOwner
                }
              }
              ... on PullRequest {
                number
                title
                url
                body
                repository {
                  nameWithOwner
                }
              }
            }
          }
        }
      }
    }
  }
}
"""


def run_gh_command(args: list[str], timeout: float = 30.0) -> dict[str, Any]:
    """Execute gh CLI command safely and parse JSON output."""
    cmd = ["gh", *args]
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=True,
        )
        return json.loads(proc.stdout)
    except subprocess.CalledProcessError as e:
        logger.error(f"gh command failed: {e.stderr}")
        raise RuntimeError(f"GitHub CLI error: {e.stderr.strip() or e.stdout.strip()}") from e
    except subprocess.TimeoutExpired as e:
        raise TimeoutError(f"GitHub CLI timed out after {timeout}s") from e


def run_graphql_query(query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
    """Run GraphQL query via gh api graphql."""
    args = ["api", "graphql", "-f", f"query={query}"]
    if variables:
        for k, v in variables.items():
            if isinstance(v, (int, float, bool)):
                args.extend(["-F", f"{k}={v}"])
            elif v is not None:
                args.extend(["-f", f"{k}={v}"])
    return run_gh_command(args)


def get_current_user() -> str:
    """Retrieve current authenticated GitHub user login."""
    try:
        data = run_gh_command(["api", "user", "--jq", "{login: .login}"])
        return data.get("login", "")
    except Exception:
        return ""


def resolve_owner(owner: str | None = None) -> str:
    """Resolve explicit owner or fall back to the authenticated gh CLI user."""
    target = (owner or "").strip()
    if target:
        return target
    viewer = get_current_user()
    if not viewer:
        raise RuntimeError(
            "Unable to detect GitHub owner. Authenticate with `gh auth login --scopes project` or specify an owner."
        )
    return viewer


def list_projects(owner: str | None = None) -> tuple[str, list[dict[str, Any]]]:
    """List available open GitHub Projects v2 for an owner (defaults to current user)."""
    target_owner = resolve_owner(owner)

    data = run_graphql_query(GET_OWNER_PROJECTS_QUERY, {"owner": target_owner})
    owner_node = data.get("data", {}).get("repositoryOwner") or {}
    projects_node = owner_node.get("projectsV2") or {}
    nodes = projects_node.get("nodes") or []

    projects = [
        {
            "id": p.get("id"),
            "number": p.get("number"),
            "title": p.get("title"),
            "url": p.get("url"),
            "closed": p.get("closed", False),
            "owner": target_owner,
        }
        for p in nodes
        if not p.get("closed")
    ]
    return target_owner, projects


def get_project_details(owner: str | None, project_number: int) -> dict[str, Any]:
    """Fetch project details including custom single-select status fields."""
    target_owner = resolve_owner(owner)
    data = run_graphql_query(
        GET_PROJECT_DETAILS_QUERY, {"owner": target_owner, "number": project_number}
    )
    owner_node = data.get("data", {}).get("repositoryOwner") or {}
    project = owner_node.get("projectV2") or {}
    if not project:
        raise ValueError(f"Project #{project_number} for owner '{target_owner}' not found.")

    status_fields = []
    fields = (project.get("fields") or {}).get("nodes") or []
    for f in fields:
        if f.get("name") and f.get("options"):
            status_fields.append({
                "id": f.get("id"),
                "name": f.get("name"),
                "options": [{"id": opt.get("id"), "name": opt.get("name")} for opt in f.get("options", [])],
            })

    return {
        "id": project.get("id"),
        "number": project.get("number"),
        "title": project.get("title"),
        "url": project.get("url"),
        "owner": target_owner,
        "closed": project.get("closed"),
        "status_fields": status_fields,
    }


def list_project_tasks(owner: str | None, project_number: int, limit: int = 300) -> dict[str, Any]:
    """Fetch all tasks/items in a project with automatic pagination."""
    project_info = get_project_details(owner, project_number)
    target_owner = project_info["owner"]
    project_id = project_info["id"]

    all_tasks = []
    cursor = None
    has_next = True
    page_size = 100

    while has_next and len(all_tasks) < limit:
        batch_size = min(page_size, limit - len(all_tasks))
        vars_payload: dict[str, Any] = {
            "owner": target_owner,
            "number": project_number,
            "first": batch_size,
        }
        if cursor:
            vars_payload["cursor"] = cursor

        data = run_graphql_query(GET_PROJECT_ITEMS_PAGE_QUERY, vars_payload)
        owner_node = data.get("data", {}).get("repositoryOwner") or {}
        project = owner_node.get("projectV2") or {}
        items_conn = project.get("items") or {}

        page_info = items_conn.get("pageInfo") or {}
        has_next = page_info.get("hasNextPage", False)
        cursor = page_info.get("endCursor")

        nodes = items_conn.get("nodes") or []
        for node in nodes:
            item_id = node.get("id")
            item_type = node.get("type")
            content = node.get("content") or {}

            # Status field resolution
            status_name = "No Status"
            for fv in (node.get("fieldValues") or {}).get("nodes", []):
                if fv and fv.get("name"):
                    status_name = fv.get("name")
                    break

            all_tasks.append({
                "id": item_id,
                "type": item_type,
                "title": content.get("title") or "Untitled",
                "body": content.get("body") or "",
                "status": status_name,
                "number": content.get("number"),
                "url": content.get("url"),
                "repository": (content.get("repository") or {}).get("nameWithOwner"),
            })

    return {
        "owner": target_owner,
        "project": {
            "id": project_id,
            "number": project_number,
            "title": project_info["title"],
            "url": project_info.get("url"),
            "owner": target_owner,
            "status_fields": project_info["status_fields"],
        },
        "tasks": all_tasks,
    }


def update_task_status(owner: str | None, project_number: int, item_id: str, status_name: str) -> dict[str, Any]:
    """Move a task to any valid single-select status column."""
    project_info = get_project_details(owner, project_number)
    target_owner = project_info["owner"]
    project_id = project_info["id"]

    target_field_id = None
    target_option_id = None

    for sf in project_info["status_fields"]:
        # Procure pela opção correspondente
        for opt in sf["options"]:
            if opt["name"].strip().lower() == status_name.strip().lower():
                target_field_id = sf["id"]
                target_option_id = opt["id"]
                break
        if target_option_id:
            break

    if not target_field_id or not target_option_id:
        raise ValueError(f"Status '{status_name}' não encontrado nas colunas do projeto.")

    mutation = """
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
    """
    data = run_graphql_query(
        mutation,
        {
            "projectId": project_id,
            "itemId": item_id,
            "fieldId": target_field_id,
            "optionId": target_option_id,
        },
    )
    return {"ok": True, "itemId": item_id, "newStatus": status_name}


def create_task(
    owner: str | None,
    project_number: int,
    title: str,
    body: str = "",
    status: str | None = None,
) -> dict[str, Any]:
    """Create a new draft task in the project, optionally setting its initial status column."""
    project_info = get_project_details(owner, project_number)
    target_owner = project_info["owner"]
    project_id = project_info["id"]

    mutation = """
    mutation($projectId: ID!, $title: String!, $body: String) {
      addProjectV2DraftIssue(
        input: {
          projectId: $projectId
          title: $title
          body: $body
        }
      ) {
        projectItem {
          id
        }
      }
    }
    """
    res = run_graphql_query(mutation, {"projectId": project_id, "title": title, "body": body})
    item_id = res.get("data", {}).get("addProjectV2DraftIssue", {}).get("projectItem", {}).get("id")

    if not item_id:
        raise RuntimeError("Falha ao criar item no GitHub Project.")

    # Se um status inicial foi especificado, move para a coluna
    if status:
        try:
            update_task_status(target_owner, project_number, item_id, status)
        except Exception as e:
            logger.warning(f"Item criado com ID {item_id}, mas falha ao definir status inicial: {e}")

    return {"ok": True, "id": item_id, "title": title, "status": status}


def delete_task(owner: str | None, project_number: int, item_id: str) -> dict[str, Any]:
    """Delete an item completely from the project."""
    project_info = get_project_details(owner, project_number)
    project_id = project_info["id"]

    mutation = """
    mutation($projectId: ID!, $itemId: ID!) {
      deleteProjectV2Item(
        input: {
          projectId: $projectId
          itemId: $itemId
        }
      ) {
        deletedItemId
      }
    }
    """
    res = run_graphql_query(mutation, {"projectId": project_id, "itemId": item_id})
    deleted_id = res.get("data", {}).get("deleteProjectV2Item", {}).get("deletedItemId")
    return {"ok": True, "deletedItemId": deleted_id or item_id}
