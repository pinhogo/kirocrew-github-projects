---
name: github-projects
description: Manage tasks, draft issues, and Kanban status columns in GitHub Projects v2 through the Kiro Crew app backend or gh CLI.
always: false
---

# GitHub Projects Management Skill

Use this skill when working with a user's GitHub Projects v2 board via the `github-projects` Kiro Crew app or `gh` CLI.

## When to Use

- Listing open GitHub Projects v2 boards for the authenticated user or a specific organization/owner.
- Listing, filtering, creating, updating status columns, or deleting items in a GitHub Project v2.
- Moving tasks to target columns (for example `Todo`, `In Progress`, `Review`, or `Done`) while preserving exact column option names.

## App Backend Routes

When calling the app's local backend (via the Kiro Crew gateway proxy under `/apps/github-projects/api/*`), `owner` is optional and defaults to the currently authenticated `gh` user:

1. **List Available Projects:**
   `GET /apps/github-projects/api/projects` (optional query param `?owner=<login>`)

2. **List Project Tasks:**
   `POST /apps/github-projects/api/tasks`
   ```json
   { "owner": "", "project_number": 1, "limit": 300 }
   ```

3. **Create New Draft Task:**
   `POST /apps/github-projects/api/task/create`
   ```json
   {
     "owner": "<owner>",
     "project_number": 1,
     "title": "[FEAT-101] Implement feature",
     "body": "Acceptance criteria and implementation notes...",
     "status": "Todo"
   }
   ```

4. **Move Task to Another Status Column:**
   `POST /apps/github-projects/api/task/update-status`
   ```json
   {
     "owner": "<owner>",
     "project_number": 1,
     "item_id": "<ITEM_ID>",
     "status": "Done"
   }
   ```

5. **Delete Task from Project:**
   `POST /apps/github-projects/api/task/delete`
   ```json
   {
     "owner": "<owner>",
     "project_number": 1,
     "item_id": "<ITEM_ID>"
   }
   ```

## Best Practices

- Discover valid status option names from `project.status_fields` before moving or creating items.
- Confirm destructive actions before deleting items from an active board.
- Ensure `gh auth status` includes the `project` scope (`gh auth refresh -s project` if missing).
