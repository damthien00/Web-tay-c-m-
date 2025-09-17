# Dashboard Metrics — Process Log

Last updated: 2025-09-17

This document tracks the implementation of read-only analytics for the Money Tracker dashboard: current balance, totals by date range, and recent transactions.

Related docs:
- Plan: docs/PLAN-DASHBOARD-METRICS.md
- Transactions actions: actions/transactions/actions.ts
- Shared helpers: actions/shared/{schemas.ts,utils.ts}

## Implemented in this iteration

1) Analytics Validations
- actions/analytics/validations.ts
  - getCurrentBalanceSchema: { userId }
  - getTotalsByDateRangeSchema: { userId, from?, to? } (from/to accept Date or ISO string)
  - getRecentTransactionsSchema: { userId, limit? } (1..100, default 10)

2) Analytics Actions (read-only)
- actions/analytics/actions.ts
  - getCurrentBalance(userId)
    - Computes incomeTotal and expenseTotal via Prisma aggregate on Transaction and returns balance = income - expense.
  - getTotalsByDateRange({ userId, from?, to? })
    - Applies createdAt range filter and returns incomeTotal, expenseTotal, and net.
  - Re-export recentTransactions from actions/transactions/actions for convenience.

Notes:
- All money amounts are BigInt in DB; responses are BigInt-safe via serializeBigInt (amounts are stringified).
- These actions are read-only; no revalidatePath is used.

## Return shapes

getCurrentBalance →
{
  data: {
    incomeTotal: "123456",
    expenseTotal: "45678",
    balance: "77878"
  },
  error: null
}

getTotalsByDateRange →
{
  data: {
    range: { from: "2025-09-01T00:00:00.000Z", to: "2025-09-30T23:59:59.999Z" },
    incomeTotal: "4000000",
    expenseTotal: "2500000",
    net: "1500000"
  },
  error: null
}

recentTransactions → see actions/transactions/actions.ts; we re-export it from analytics for convenience.

## Usage examples

```ts
import { getCurrentBalance, getTotalsByDateRange, recentTransactions } from "@/actions/analytics/actions";

const { data: balance } = await getCurrentBalance(session.user.id);

const { data: totals } = await getTotalsByDateRange({
  userId: session.user.id,
  from: new Date('2025-09-01'),
  to: new Date('2025-09-30'),
});

const { data: recents } = await recentTransactions(session.user.id, 10);
```

## Edge cases and notes
- Users with no transactions → all totals are "0".
- Negative amounts are not allowed by our validations; if legacy data exists, analytics will include raw stored values.
- Dates are treated as UTC on the server; pass ISO strings or Date objects from the UI.
- Performance: Queries leverage existing indexes on transactions (userId, createdAt, type).

---
This completes the first set of dashboard analytics needed to wire up the UI. If you want to include Project revenues/expenses directly, see the optional extension discussion in docs/PLAN-DASHBOARD-METRICS.md.
