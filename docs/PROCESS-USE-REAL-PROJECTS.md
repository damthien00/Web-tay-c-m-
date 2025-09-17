# Process Update: Use Real Projects, Revenues, and Expenses in ProjectContext

Last updated: 2025-09-17

This update migrates the ProjectContext from local mock data to real, database-backed data via our Prisma (MongoDB) server actions, exposed through new API routes. It also wires addProject/updateProject/deleteProject and addExpense/addRevenue to call the backend with optimistic UI updates.

## What changed

1) New API Routes (Next.js App Router)
- `/api/projects`
  - GET: Lists projects for a user (paginated)
    - Query: `userId` (required), optional `q`, `status`, `category`, `currency`, `from`, `to`, `page`, `per_page`, `sort` (default: `createdAt.desc`)
  - POST: Creates a project via `actions/projects/createProject`
    - Body: `{ userId, name, description, budget, status, startDate, endDate?, category, currency }`
    - Converts `budget` to BigInt, `startDate/endDate` to Date on server
- `/api/projects/[id]`
  - PATCH: Updates a project via `updateProject(userId, id, inputs)`
    - Body: Partial project fields plus `userId`. Converts BigInt/Date fields on server.
  - DELETE: Deletes a project via `deleteProject(userId, id)`
    - Query: `userId` (required)
- `/api/project-expenses`
  - GET: Lists project expenses for a user (paginated)
    - Query: `userId` (required), optional `projectId`, `category`, `from`, `to`, `page`, `per_page`, `sort` (default: `date.desc`)
  - POST: Creates an expense via `createProjectExpense`
    - Body: `{ userId, projectId, amount, description, category, date }`
    - Converts `amount` to BigInt, `date` to Date
- `/api/project-revenues`
  - GET: Lists project revenues for a user (paginated)
    - Query: `userId` (required), optional `projectId`, `status`, `source`, `from`, `to`, `page`, `per_page`, `sort` (default: `date.desc`)
  - POST: Creates a revenue via `createProjectRevenue`
    - Body: `{ userId, projectId, amount, description, source, status, paidAmount?, invoiceNumber?, dueDate?, date }`
    - Converts `amount/paidAmount` to BigInt and `date/dueDate` to Date

All endpoints return `{ data, error }` and rely on the server actions to enforce user scoping and revalidate caches (`/projects`, `/dashboard`).

2) ProjectContext (src/contexts/ProjectContext.tsx)
- Removes sample data fallback; instead:
  - Hydrates from localStorage caches for fast initial render:
    - `vietnamese-money-tracker-projects`
    - `vietnamese-money-tracker-project-expenses`
    - `vietnamese-money-tracker-project-revenues`
  - Then fetches real data via API routes and persists back to the cache.
- Exposes async mutations backed by the API:
  - `addProject(project)` (async): optimistic insert, POST `/api/projects`, then reloads projects from server.
  - `updateProject(id, partial)` (fire-and-forget): optimistic update, PATCH `/api/projects/:id`, then reload projects.
  - `deleteProject(id)` (fire-and-forget): optimistic remove, DELETE `/api/projects/:id?userId=...`, then reload all.
  - `addExpense(expense)` (fire-and-forget): optimistic insert, POST `/api/project-expenses`, then reload expenses and projects (to refresh totals).
  - `addRevenue(revenue)` (fire-and-forget): optimistic insert (auto-sets `paidAmount` if status=`received`), POST `/api/project-revenues`, then reload revenues and projects (to refresh totals).
- Keeps all calculation helpers intact (profit, utilization, portfolio totals, paid/unpaid revenue, etc.).

3) UI updates
- `AddProjectModal` now awaits `addProject(...)` to ensure proper success UX and data freshness.
- Other modals (`AddProjectExpenseModal`, `AddProjectRevenueModal`) continue using fire-and-forget, as the context reloads immediately after.

## How userId is determined

- For now, `userId` is read from `localStorage.getItem('userId')` with a fallback to `demo-user` (same as other contexts). In production, derive the userId on the server from the authenticated session.

## Data shape notes

- Monetary amounts come from the DB as BigInt and are serialized to strings by server actions. API routes map to JSON; the context converts to Number for rendering.
- Project totals (`totalExpenses`, `totalRevenue`) are recomputed server-side when expenses/revenues change. The context refresh ensures consistency after optimistic updates.

## Affected Files
- New: src/app/api/projects/route.ts (GET, POST)
- New: src/app/api/projects/[id]/route.ts (PATCH, DELETE)
- New: src/app/api/project-expenses/route.ts (GET, POST)
- New: src/app/api/project-revenues/route.ts (GET, POST)
- Updated: src/contexts/ProjectContext.tsx (real data integration, optimistic mutations, reload helpers)
- Updated: src/components/app/AddProjectModal.tsx (await addProject)

## Quick usage examples (client)

- List projects (context handles):
```ts
const { projects } = useProjects();
```

- Create project:
```ts
await addProject({
  name: 'Website thương mại',
  description: 'Xây dựng website bán hàng',
  budget: 50000000,
  status: 'planning',
  startDate: new Date().toISOString(),
  category: 'e-commerce',
  currency: 'VND'
});
```

- Add expense:
```ts
addExpense({
  projectId,
  amount: 1000000,
  description: 'Mua domain',
  category: 'infrastructure',
  date: new Date().toISOString(),
});
```

- Add revenue:
```ts
addRevenue({
  projectId,
  amount: 3000000,
  description: 'Thanh toán milestone 1',
  source: 'milestone-payment',
  status: 'received',
  date: new Date().toISOString(),
});
```

## Edge cases
- Network failure after optimistic update: context immediately reloads from server to reconcile state.
- Extremely large amounts: UI uses Number for display; if you expect amounts > Number.MAX_SAFE_INTEGER, switch to BigInt-aware formatting on the client.
- Pagination: API defaults fetch up to 100–200 items. For large datasets, add project-level paginated views as needed.

---
This completes the migration of ProjectContext to use real data for projects, revenues, and expenses, and wires the required CRUD/add flows to the backend.
