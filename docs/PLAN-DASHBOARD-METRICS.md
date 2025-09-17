# Plan: How to get Current Balance, Income/Expense by Date Range, and Recent Transactions

Context: Money Tracker app using Prisma + MongoDB. We already have transactions CRUD and a recentTransactions action. Amount fields are BigInt (store smallest currency unit).

Scope of this plan:
- Current balance for a user
- Income and expense totals by date range
- Recent transactions (already implemented)

## 1) Data Sources and Assumptions
- Primary source: `Transaction` collection (fields: userId, type: income|expense, amount: BigInt, createdAt).
- Projects’ revenues/expenses have separate collections. By default, balance and date-range totals are computed from `transactions` only. If the product wants to include project records, ensure a mirror transaction is created for each project revenue/expense OR extend the aggregations to include those collections (see Optional Extension below).
- Amounts are BigInt; serialize as string in responses.

## 2) Validations (Zod)
Create shared validations for these inputs (actions/analytics/validations.ts):
- getCurrentBalanceSchema: { userId: string }
- getTotalsByDateRangeSchema: { userId: string, from?: string|Date, to?: string|Date }
- getRecentTransactionsSchema: { userId: string, limit?: number (1..100, default 10) } (already effectively supported by existing function signature)

We can reuse existing helpers in actions/shared/schemas.ts (userIdString, dateLike), e.g.:
- userId: userIdString
- from/to: dateLike.optional()
- limit: z.coerce.number().int().min(1).max(100).default(10)

## 3) Server Actions to Add (actions/analytics/actions.ts)
Two new read-only actions (no revalidation required):

1) getCurrentBalance(userId: string): Promise<{ data: { incomeTotal: string, expenseTotal: string, balance: string }, error: string|null }>
- Logic: Sum of income minus sum of expense across all transactions for the user.
- Implementation approach A (simple, 2 queries):
  - income = prisma.transaction.aggregate({ where: { userId, type: 'income' }, _sum: { amount: true } })
  - expense = prisma.transaction.aggregate({ where: { userId, type: 'expense' }, _sum: { amount: true } })
  - balance = (incomeSum || 0n) - (expenseSum || 0n)
- Implementation approach B (single round-trip): use prisma.$runCommandRaw or aggregateRaw with a Mongo pipeline that groups and conditionally sums by type.
- Return values must be passed through serializeBigInt.

2) getTotalsByDateRange({ userId, from?, to? }): Promise<{ data: { incomeTotal: string, expenseTotal: string, net: string, range: { from?: string, to?: string } }, error: string|null }>
- Logic: Same as above, but add createdAt filter between from/to if provided.
- Use two aggregates with a shared where { userId, createdAt: { gte?: from, lte?: to }, type: 'income' } and type: 'expense'.
- net = incomeTotal - expenseTotal.

Note: Both BigInt sums may come back as null; coerce to 0n when null.

## 4) Recent Transactions (already available)
- We already have actions/transactions/actions.ts → recentTransactions(userId: string, limit = 10)
- It returns the most recent N transactions for the given user, including minimal project info, and serializeBigInt is applied.
- We can re-export that in analytics if we want a consolidated module, but not required.

## 5) Optional Extension: Include Project Revenues/Expenses in Balance
If we want the “current balance” to also reflect project activity without duplicating as transactions:
- Option A (recommended for consistency): Ensure UI/business logic creates a matching `Transaction` record whenever a `ProjectExpense` or `ProjectRevenue` is created. Then no changes are needed to analytics.
- Option B: Extend analytics queries to sum:
  - Extra income from `ProjectRevenue` using `paidAmount` (not `amount`) where status = received (or include all `paidAmount` regardless of status).
  - Extra expense from `ProjectExpense` using `amount`.
  - Combine with Transaction sums: balance = (txnIncome + projIncome) - (txnExpense + projExpense)
  - For date ranges, use their `date` field instead of `createdAt`.
- This adds complexity and the risk of double counting if both Transactions and Project* records represent the same event. Choose one consistent source of truth.

## 6) Return Shapes and BigInt Safety
- All BigInt totals must be stringified via `serializeBigInt` before returning.
- Suggested shapes:

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

recentTransactions → existing shape: array of transactions with project { id, name } included; amounts serialized to string.

## 7) Folder and File Structure
- actions/
  - analytics/
    - validations.ts (schemas for balance and date-range totals)
    - actions.ts (getCurrentBalance, getTotalsByDateRange; optionally re-export recentTransactions)

Alternatively, add these two functions to actions/transactions/actions.ts to keep all transaction-related reads together. Either approach is fine; a separate analytics module keeps the intent clear.

## 8) Pseudocode (Prisma-based)

getCurrentBalance(userId) {
  const [inc, exp] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId, type: 'income' }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId, type: 'expense' }, _sum: { amount: true } }),
  ]);
  const incomeTotal = (inc._sum.amount ?? 0n) as bigint;
  const expenseTotal = (exp._sum.amount ?? 0n) as bigint;
  return serializeBigInt({ incomeTotal, expenseTotal, balance: incomeTotal - expenseTotal });
}

getTotalsByDateRange({ userId, from, to }) {
  const dateFilter = (from || to) ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};
  const base = { userId, ...dateFilter };
  const [inc, exp] = await Promise.all([
    prisma.transaction.aggregate({ where: { ...base, type: 'income' }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { ...base, type: 'expense' }, _sum: { amount: true } }),
  ]);
  const incomeTotal = (inc._sum.amount ?? 0n) as bigint;
  const expenseTotal = (exp._sum.amount ?? 0n) as bigint;
  return serializeBigInt({ range: { from, to }, incomeTotal, expenseTotal, net: incomeTotal - expenseTotal });
}

## 9) Performance Considerations
- Indexes already exist on transactions: userId, createdAt, type — these support the queries described.
- Two aggregate queries per call are acceptable. If you need a single round-trip, use `aggregateRaw` with a Mongo pipeline to compute both sums in one go.
- For large datasets, cache the computed balance in-session or on the dashboard level and invalidate on mutations (we already revalidate /dashboard after mutations).

## 10) Usage Examples

- Current balance:
```ts
import { getCurrentBalance } from "@/actions/analytics/actions";
const { data, error } = await getCurrentBalance(session.user.id);
```

- Totals by date range:
```ts
import { getTotalsByDateRange } from "@/actions/analytics/actions";
const { data, error } = await getTotalsByDateRange({
  userId: session.user.id,
  from: new Date('2025-09-01'),
  to: new Date('2025-09-30'),
});
```

- Recent transactions (existing):
```ts
import { recentTransactions } from "@/actions/transactions/actions";
const { data, error } = await recentTransactions(session.user.id, 10);
```

## 11) Edge Cases and Notes
- No transactions yet → return zeros.
- Negative amounts are not allowed by validations; if legacy data exists, filter out or take abs values accordingly.
- Timezone: Server treats dates as UTC. Ensure UI provides ISO strings or Date objects; we use shared dateLike to normalize.
- BigInt in JSON: Always serialize via `serializeBigInt` to strings.

## 12) Next Steps
- If approved, implement actions/analytics/{validations.ts,actions.ts} following this plan.
- Optionally, decide on whether project revenues/expenses should be mirrored into transactions or included directly in analytics to avoid double counts.
