# Process Update: Use Real Savings Goals Data in SavingsGoalContext

Last updated: 2025-09-17

This update migrates the SavingsGoalContext from local sample data to real, database-backed goals using our Prisma (MongoDB) server actions, exposed via new API routes.

## What changed

1) API Route
- New endpoint: `/api/savings-goals`
  - GET: Lists the user's savings goals (paginated). Query params: `userId`, optional `page` (default 1), `per_page` (default 50), `sort` (default `updatedAt.desc`).
  - POST: Creates a savings goal using the server action `createSavingsGoal`. Accepts `{ userId, title, targetAmount, deadline, category }`. Converts `targetAmount` to BigInt and `deadline` to Date on the server.

2) SavingsGoalContext
- Removes the sample goals fallback.
- On mount, hydrates from localStorage (fast first paint), then fetches the real list from `GET /api/savings-goals?userId=...` and stores it in state and localStorage.
- `addGoal(...)` is now async and persists to the backend by calling `POST /api/savings-goals`. It performs an optimistic insert and then refreshes the state by refetching from the server.

3) SavingsGoalModal
- Submits via `await addGoal(...)` and shows success UI on completion.

## Affected Files
- src/app/api/savings-goals/route.ts (new)
- src/contexts/SavingsGoalContext.tsx (refactored: fetch real data; async addGoal)
- src/components/app/SavingsGoalModal.tsx (await addGoal)

## How it works (flow)
- App boot: SavingsGoalContext loads cached goals from localStorage, then calls the API to refresh with real data.
- Create goal: UI calls `await addGoal({ title, targetAmount, deadline, category })`. The context posts to `/api/savings-goals`, then reloads the list from the server.

## Notes
- User identification: Read from `localStorage.getItem('userId')` with fallback to `demo-user`. In production, derive userId on the server-side from the authenticated session.
- Amounts: Stored as BigInt in DB; API responses serialize BigInt to strings. The context maps amounts to number for UI purposes.
- Completion status: The backend maintains `currentAmount` and `isCompleted` via contributions logic. The context renders these fields from server data.

## Quick usage example
```ts
import { useSavingsGoals } from '@/src/contexts/SavingsGoalContext';

const { goals, addGoal } = useSavingsGoals();
await addGoal({
  title: 'Quỹ khẩn cấp',
  targetAmount: 50000000,
  deadline: new Date(Date.now() + 180*24*60*60*1000).toISOString(),
  category: 'emergency'
});
console.log(goals); // Will update after reload
```

## Next steps (optional)
- Implement backend-backed update/delete for goals and wire `addToGoal` to savings-contributions API, recomputing parent totals server-side.
- Derive userId on the server from session instead of query/body.
- Add error states/spinners in the UI for loading goals and creating goals.
