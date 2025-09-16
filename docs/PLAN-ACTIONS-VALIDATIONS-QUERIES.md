# Plan: Server Actions, Validations, and Queries for Money Tracker (Prisma + MongoDB)

This plan proposes how to add server actions, Zod validations, and query utilities for the new Prisma MongoDB domain models, reusing the patterns in actions/posts and actions/post-categories. No code is implemented yet; this file is for review and approval.

Related references:
- Pattern sources: actions/posts/*, actions/post-categories/*
- Prisma schema: prisma/schema.prisma
- Supabase schema reference: docs/DATABASE-SCHEMA-SUPABASE.md
- MongoDB/Prisma mapping: docs/DATABASE-SCHEMA-PRISMA-MONGODB.md

## 1) Scope and Goals
We will implement server actions, validations, and queries for these domain areas:
- Transactions
- Projects
- Project Expenses
- Project Revenues
- Savings Goals
- Savings Contributions

Notes:
- There is an existing actions/profile; we’ll keep it as-is unless gaps appear against the new Profile model. Adjustments (if any) will be proposed separately.
- All actions must be scoped by userId (multi-tenant safety) and follow the same structure and error handling used by posts/post-categories.

## 2) File/Folder Structure (mirrors existing actions/* pattern)
- actions/
  - transactions/
    - actions.ts
    - validations.ts
  - projects/
    - actions.ts
    - validations.ts
  - project-expenses/
    - actions.ts
    - validations.ts
  - project-revenues/
    - actions.ts
    - validations.ts
  - savings-goals/
    - actions.ts
    - validations.ts
  - savings-contributions/
    - actions.ts
    - validations.ts
  - shared/
    - schemas.ts (shared Zod primitives: objectId, bigInt, date range)
    - utils.ts (helpers for parsing BigInt inputs, coercions, etc.)

All actions files will:
- start with "use server"
- import prisma from src/lib/prisma
- import getErrorMessage from actions/utils/utils
- export typed functions returning { data, error }
- call revalidatePath on relevant pages after mutations

## 3) Validation Strategy (Zod)
Shared primitives (actions/shared/schemas.ts):
- objectIdString: z.string().regex(/^[0-9a-fA-F]{24}$/) – Prisma stores ObjectId as string in schema; UI passes strings.
- userIdString: z.string().min(1) – aligns with User.id being String (not ObjectId)
- bigIntLike: z.union([z.string(), z.number(), z.bigint()]).refine(toBigInt > 0 for positive amounts)
- currencyEnum: z.enum(["VND", "USD"]) – match Prisma enum
- transactionTypeEnum: z.enum(["income", "expense"]) – match Prisma enum
- revenueStatusEnum: z.enum(["pending", "received", "overdue"]) – match Prisma enum
- dateLike: z.union([z.string().datetime({offset: true}).or(z.string().datetime().or(z.date()))]) → normalized to Date
- optionalString, nonEmptyString helpers
- tags: z.array(z.string()).default([])
- pagination: { limit?: number (1..100), cursor?: string, orderBy?: string, order?: "asc"|"desc" }
- dateRange: { from?: dateLike, to?: dateLike }

Per-domain schemas (create/update/search):
- Transactions
  - create: { userId, type, amount (>0), category, description, paymentMethod, location?, tags?, projectId? }
  - update: partial of create (no userId), with id param separate
  - search/list: { userId, dateRange?, category?, type?, projectId?, q?, pagination }
- Projects
  - create: { userId, name, description, budget (>0), status, startDate, endDate?, category, currency? }
  - update: partial of create (no userId), with computed totals excluded (server-managed)
  - search/list: { userId, status?, dateRange?, category?, q?, pagination }
- Project Expenses
  - create: { projectId, userId, amount (>0), description, category, date }
  - update: partial of create (no userId, projectId immutable)
  - list: { userId, projectId, dateRange?, category?, pagination }
- Project Revenues
  - create: { projectId, userId, amount (>0), description, source, status, dueDate?, date, invoiceNumber?, paidAmount? }
  - update: allow status transitions, paidAmount increments, edits to description/source/dates; id param separate
  - list: { userId, projectId, status?, dateRange?, pagination }
- Savings Goals
  - create: { userId, title, targetAmount (>0), deadline, category }
  - update: partial, includes isCompleted? (server may toggle based on progress)
  - list: { userId, isCompleted?, deadline range?, category?, pagination }
- Savings Contributions
  - create: { goalId, userId, amount (>0), description? }
  - update: partial of create
  - list: { userId, goalId, pagination }

Coercions:
- bigIntLike → BigInt
- dateLike → Date

## 4) Actions API Design (per domain)
Pattern: return Promise<{ data: X | null, error: string | null }>

- Transactions (actions/transactions/actions.ts)
  - createTransaction(inputs)
  - updateTransaction(id, inputs)
  - deleteTransaction(id)
  - deleteTransactions(ids)
  - getTransaction(id) – include project minimal fields
  - listTransactions(filters) – pagination; include project minimal fields
  - recentTransactions(userId, limit=10)
  - aggregateTransactionsByType(userId, dateRange)
  - aggregateTransactionsByCategory(userId, dateRange, type?)
  - aggregateTransactionsByDate(userId, dateRange, type?)
  - revalidatePath: ['/transactions', '/dashboard'] after mutations

- Projects (actions/projects/actions.ts)
  - createProject(inputs)
  - updateProject(id, inputs)
  - deleteProject(id)
  - deleteProjects(ids)
  - getProject(id) – include expense/revenue totals or compute
  - listProjects(filters)
  - computeProjectTotals(projectId) – recompute totalExpenses/totalRevenue
  - setProjectStatus(id, status)
  - revalidatePath: ['/projects', `/projects/${id}`, '/dashboard']

- Project Expenses (actions/project-expenses/actions.ts)
  - createProjectExpense(inputs)
  - updateProjectExpense(id, inputs)
  - deleteProjectExpense(id)
  - deleteProjectExpenses(ids)
  - listProjectExpenses({ userId, projectId, ...filters })
  - aggregateProjectExpensesByCategory(projectId, dateRange?)
  - revalidatePath: [`/projects/${projectId}`,'/projects']

- Project Revenues (actions/project-revenues/actions.ts)
  - createProjectRevenue(inputs)
  - updateProjectRevenue(id, inputs)
  - deleteProjectRevenue(id)
  - deleteProjectRevenues(ids)
  - listProjectRevenues({ userId, projectId, status?, ...filters })
  - aggregateProjectRevenues(projectId, { by: 'status' | 'source' | 'date', dateRange? })
  - revalidatePath: [`/projects/${projectId}`,'/projects','/dashboard']

- Savings Goals (actions/savings-goals/actions.ts)
  - createSavingsGoal(inputs)
  - updateSavingsGoal(id, inputs)
  - deleteSavingsGoal(id)
  - deleteSavingsGoals(ids)
  - getSavingsGoal(id) – include contributions summary
  - listSavingsGoals(filters)
  - markSavingsGoalCompleted(id) – or auto when progress >= 100%
  - revalidatePath: ['/goals', `/goals/${id}`, '/dashboard']

- Savings Contributions (actions/savings-contributions/actions.ts)
  - createSavingsContribution(inputs)
  - updateSavingsContribution(id, inputs)
  - deleteSavingsContribution(id)
  - deleteSavingsContributions(ids)
  - listSavingsContributions({ userId, goalId, ...filters })
  - revalidatePath: [`/goals/${goalId}`, '/goals', '/dashboard']

Includes/selects:
- Include minimal related data only (e.g., project { id, name } in transactions), not entire relations.

## 5) Query Design and Pagination
- Basic list queries use take/skip or cursor pagination based on id; mirror existing patterns used in posts if present.
- Filters combine AND conditions: userId, dateRange (createdAt or domain date field), category, type/status, projectId/goalId.
- Sorting defaults:
  - Transactions: createdAt desc
  - Expenses/Revenues: date desc
  - Projects: updatedAt desc
  - Goals: updatedAt desc
- Aggregations:
  - For MongoDB via Prisma, use aggregateRaw() if needed for group-by over BigInt. Where Prisma supports, use aggregate on numeric fields; otherwise, fallback to raw mongo pipeline with care.

## 6) Access Control and Safety
- Each action must:
  - determine current userId (e.g., via session util) or accept it and validate
  - enforce where: { userId, ... }
  - verify ownership for mutations (update/delete/get by id)
- Validate all inputs (Zod) and convert to DB types (BigInt/Date) before calling Prisma.
- Prevent negative money and invalid enums.
- When deleting projects/goals, consider cascading deletes are not enforced at DB level; actions should explicitly remove or rely on Prisma relation behavior if using nested operations. We’ll handle clean-up in actions as needed.

## 7) Cache Revalidation
- Use revalidatePath after every create/update/delete.
- Paths to revalidate are listed per domain above; may be adjusted to actual route structure in src/app.

## 8) Testing Strategy
- Unit test Zod schemas (valid/invalid cases).
- Integration test actions with a test MongoDB (local or in-memory) or mock prisma client.
- Verify revalidatePath is called appropriately (can be mocked in tests).

## 9) Rollout Plan
1) Implement transactions (validations, actions, list/aggregations) – highest impact.
2) Implement projects (core CRUD) + computeProjectTotals helper.
3) Implement project-expenses and project-revenues, integrate totals recomputation.
4) Implement savings-goals and savings-contributions.
5) Add shared schemas/utils and refactor to remove duplication.
6) Add tests incrementally for each domain.

## 10) Risks and Mitigations
- BigInt serialization: Convert for transport (string) and handle in UI; keep DB as BigInt.
- Date/timezones: Use UTC in server; parse incoming with timezone awareness.
- Prisma Mongo aggregation support: If needed, use aggregateRaw with pipelines.
- Cascading deletes: Implement explicit deletes of children where necessary before parent deletion.

## 11) Acceptance Criteria
- Each actions/* module exposes CRUD functions returning { data, error } and adheres to user scoping.
- Zod validations exist per domain and enforce core constraints.
- Queries support pagination and filter by date/type/category where applicable.
- Revalidation is wired for affected pages.
- No server code written outside the planned folders; structure mirrors posts/post-categories for consistency.

---
If you approve this plan, I will proceed to implement the folders/files incrementally, starting with transactions, following the existing patterns in actions/posts and actions/post-categories.
