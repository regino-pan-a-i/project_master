# Project Master

A personal Kanban board for tracking portfolio and resume projects. The core idea is simple: every project gets sized *before* you start it, so you're always working within a clear time commitment rather than open-ended ambiguity.

## What it does

Projects live on a board with four columns:

| Column | Time commitment |
|---|---|
| 1–3 Hours | Small, fast, low-commitment |
| 1–3 Days | A focused short build |
| 1–2 Weeks | The biggest thing you'll take on |
| Done | Completed projects |

Within each active column, projects are grouped into **Started** (work has begun) and **Backlog** (not yet started). You can drag projects between the three active columns to reclassify them at any time.

### Project detail

Clicking a project opens its detail view, where you can:

- Edit the title, description, inspiration, and expected outcomes
- Manage a **steps checklist** — a lightweight list of checkboxes for quick reference
- Mark the project as done, which triggers a short **retrospective form** (what was possible, what wasn't, what you learned)
- Reopen a completed project if you pick it back up — the retrospective data is preserved

### Task sub-board

Any project can optionally have its own mini Kanban board with four columns: Not Started, In Progress, Stuck, and Done. Tasks are simpler than projects — just a title and a status. They're useful for breaking down the work once you've decided to start.

If a project already has steps defined, the task board shows a suggestion card to convert those steps into tasks in one click, so you don't have to retype them.

Moving a task to In Progress for the first time automatically marks the parent project as started.

### Dashboard

A separate momentum view shows all projects that are actively in progress (started but not done). For each project it displays:

- **Task progress** — how many tasks are completed out of the total
- **Cycle time** — how long a task takes from the moment you start it to when you finish it
- **Lead time** — how long a task takes from the moment it's created to when it's finished, including time sitting untouched

A large gap between lead time and cycle time means tasks are piling up before you get to them. A short cycle time means once you start something, you finish it quickly.

## Tech stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (Postgres)
- **Drag and drop**: `@hello-pangea/dnd`
- **Styling**: Tailwind CSS
- **Deployment**: Render

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to the board automatically.

## Project structure

```
app/
  board/
    page.tsx              # Main Kanban board
    [id]/
      page.tsx            # Project detail view
      tasks/
        page.tsx          # Per-project task sub-board
  dashboard/
    page.tsx              # Momentum dashboard

components/
  board/                  # Board columns, project cards, modals
  detail/                 # Steps checklist, retrospective form
  tasks/                  # Task cards

lib/
  types.ts                # TypeScript interfaces
  supabase/               # Supabase client setup
  hooks/                  # Data access hooks (useProjects, useSteps, useTasks)

supabase/
  migrations/             # SQL schema
```

## Out of scope

This is a single-user personal tool. There is no authentication, no multi-user support, and no collaboration features.
