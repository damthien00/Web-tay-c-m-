# Money Tracker Actions/Validations/Queries — Process Log

Last updated: 2025-09-16

This document tracks the ongoing implementation of server actions, input validations (Zod), and query utilities for the Money Tracker domain modeled in Prisma (MongoDB).

Related docs:
- Database schema (Supabase reference): docs/DATABASE-SCHEMA-SUPABASE.md
- Prisma schema (MongoDB): prisma/schema.prisma
- Schema mapping guide: docs/DATABASE-SCHEMA-PRISMA-MONGODB.md
- Initial plan: docs/PLAN-ACTIONS-VALIDATIONS-QUERIES.md

## What’s implemented so far

1) Shared primitives/utilities
- actions/shared/schemas.ts: Zod primitives (ObjectId, userId, BigInt-like, date ranges, pagination, enums).
- actions/shared/utils.ts: Helpers for BigInt/date conversions and serializeBigInt for safe server action returns.

2) Transactions module
- actions/transactions/validations.ts: create/update/search schemas with user scoping and filters.
- actions/transactions/actions.ts: CRUD, list with pagination/sorting, recent list.
  - Enforces userId scoping for all reads/mutations.
  - Uses serializeBigInt to avoid serialization errors.
  - Revalidates /transactions and /dashboard on mutations.

## In this iteration (continuation)
We are extending the implementation to Projects, Project Expenses, Project Revenues, Savings Goals, and Savings Contributions. We will follow the same patterns as Posts/Transactions: strict user scoping, Zod validations, sorting whitelists, and BigInt-safe responses. Where applicable, we will recompute aggregate totals on parent entities after child mutations.

Planned modules this round:
- Projects (CRUD + list/search)
- Project Expenses (CRUD + list by project, recompute totalExpenses)
- Project Revenues (CRUD + list by project, recompute totalRevenue)
- Savings Goals (CRUD + list/search)
- Savings Contributions (CRUD + list by goal, recompute currentAmount)

Revalidation targets:
- Projects: /projects, /dashboard
- Project expenses/revenues: /projects, /dashboard
- Savings goals/contributions: /savings, /dashboard

Notes:
- Amount fields use BigInt in Prisma; all server action outputs pass through serializeBigInt.
- Sorting parameters are whitelisted to avoid arbitrary field ordering.
- Date filters accept either string (ISO) or Date and are validated via shared dateLike.

## How to use (dev workflow)
1) Ensure DATABASE_URL is set in .env to your MongoDB connection string.
2) Generate Prisma Client: `npx prisma generate`
3) Push schema (if needed): `npx prisma db push`
4) Use the server actions from your components or route handlers. Example:

```ts
import { listProjects } from "@/actions/projects/actions";

const { data, error } = await listProjects({
  userId: session.user.id,
  q: "website",
  status: "active",
  page: 1,
  per_page: 10,
  sort: "createdAt.desc",
});
```

## Next steps
- Hook up UI forms and pages to these actions.
- Add aggregate/analytics helpers (e.g., monthly spending by category, project profitability report).
- Add unit tests for validations and edge cases (negative amounts, invalid ObjectId, cross-tenant access).

---
This process log will be updated after each implementation round to reflect the latest modules, files, and usage guidance.


## Implemented in this iteration (2025-09-16)
- Projects module
  - actions/projects/validations.ts
  - actions/projects/actions.ts (CRUD, list/search, user scoping, whitelisted sorting; revalidates /projects and /dashboard)
- Project Expenses module
  - actions/project-expenses/validations.ts
  - actions/project-expenses/actions.ts (CRUD, list; recomputes Project.totalExpenses via aggregate after mutations; revalidates /projects and /dashboard)
- Project Revenues module
  - actions/project-revenues/validations.ts
  - actions/project-revenues/actions.ts (CRUD, list; recomputes Project.totalRevenue as sum of paidAmount after mutations; revalidates /projects and /dashboard)
- Savings Goals module
  - actions/savings-goals/validations.ts
  - actions/savings-goals/actions.ts (CRUD, list/search; user scoping; revalidates /savings and /dashboard)
- Savings Contributions module
  - actions/savings-contributions/validations.ts
  - actions/savings-contributions/actions.ts (CRUD, list; recomputes SavingsGoal.currentAmount after mutations; revalidates /savings and /dashboard)

All actions use serializeBigInt to safely return BigInt fields and enforce user scoping in queries and mutations.

## Verification (2025-09-16)
- Implemented and verified the following new modules are present in the repository:
  - actions/savings-goals/actions.ts, actions/savings-goals/validations.ts
  - actions/savings-contributions/actions.ts, actions/savings-contributions/validations.ts
- Savings contributions mutations recompute SavingsGoal.currentAmount and adjust isCompleted when currentAmount >= targetAmount.
- Revalidation is wired to /savings and /dashboard on all savings-related mutations.
- Example usage:

```ts
import { listSavingsGoals, createSavingsGoal } from "@/actions/savings-goals/actions";
import { listSavingsContributions, createSavingsContribution } from "@/actions/savings-contributions/actions";

await createSavingsGoal({
  userId: session.user.id,
  title: "Emergency Fund",
  targetAmount: 20000000n, // 20,000,000 VND
  deadline: new Date().toISOString(),
  category: "personal",
});

const { data: goals } = await listSavingsGoals({ userId: session.user.id, page: 1, per_page: 10 });

await createSavingsContribution({
  userId: session.user.id,
  goalId: goals?.items?.[0]?.id,
  amount: 500000n,
});
```
