# Process Update: Use Real Transactions Data in Dashboard

Last updated: 2025-09-17

This update switches the Dashboard view from local sample data to real database-backed transactions using the server actions we implemented earlier (Prisma + MongoDB).

## What changed

- Created API routes that expose analytics and recent transactions backed by Prisma:
  - GET /api/analytics/current-balance?userId=USER_ID
    - Response: { data: { incomeTotal, expenseTotal, balance }, error }
  - GET /api/analytics/totals?userId=USER_ID&from=ISO&to=ISO
    - Response: { data: { range, incomeTotal, expenseTotal, net }, error }
  - GET /api/transactions/recent?userId=USER_ID&limit=5
    - Response: { data: Transaction[], error }
- Updated src/components/app/DashboardView.tsx to fetch these endpoints on mount and render:
  - Current balance (and income/expense totals) from /api/analytics/current-balance
  - Recent transactions (5 items) from /api/transactions/recent
  - Keeps existing UI/UX (toggle hide/show amounts, savings/projects summaries)

## How userId is determined

- For now, DashboardView obtains the userId from localStorage key `userId`.
- If it is not set, it falls back to `demo-user` so the page remains functional. In real usage, set `localStorage.setItem('userId', '<AUTH_USER_ID>')` after login, or update the API routes to read the authenticated session and derive the userId server-side.

## Prerequisites

- Ensure your .env contains a valid MongoDB connection string:
  - DATABASE_URL="mongodb+srv://..."
- Generate Prisma client and push the schema if you haven’t yet:
  - npx prisma generate
  - npx prisma db push

## Data shape notes

- All monetary totals are stored as BigInt in the DB and serialized to strings by server actions. The dashboard converts them to Number for display (acceptable for typical VND ranges; for extremely large values, consider a BigInt-aware formatter in the UI).
- Recent transactions returned from the API include the core fields the UI needs (id, type, amount, category, description, paymentMethod, createdAt, etc.). Amounts are converted to Number for formatting in the UI.

## Next steps (optional)

- Migrate other client contexts (TransactionContext, ProjectContext, SavingsGoalContext) from localStorage to backend-backed sources incrementally.
- Derive userId on the server (API routes) from the authenticated session instead of passing it via query string to avoid spoofing.
- Add loaders/skeletons and error states for a smoother UX while fetching.
- Wire the Transactions view to the backend CRUD actions for full end-to-end behavior.


## Update (2025-09-17): TransactionContext now stores real data

- Removed the sampleTransactions fallback from src/contexts/TransactionContext.tsx.
- On mount, the context now:
  - Hydrates from localStorage (key: vietnamese-money-tracker-transactions) if available.
  - Fetches real recent transactions from GET /api/transactions/recent?userId=...&limit=20 and maps them into the context state.
  - Persists the fetched list back into localStorage for fast subsequent loads.
- This allows any component to consume recent transactions via useTransactions() without duplicating fetch logic.
- DashboardView was updated to consume transactions from TransactionContext rather than fetching its own recent list.

Notes:
- DashboardView now also derives and displays balance, income, and expense via TransactionContext helpers (computed over the cached transactions list). The analytics endpoints remain available if you need full-history totals across the entire dataset.
- If you want full-history correctness in context, switch the fetch to a paginated list/infinite loader to hydrate more history, or compute totals server-side and store them in context.

## Update (2025-09-17): Centralize Add Transaction API in TransactionContext

- addTransaction(transaction) in TransactionContext now performs the API POST to /api/transactions and then refreshes state via reloadRecentTransactions().
- AddTransactionModal no longer calls the API directly; it simply calls addTransaction with form values. This prevents code duplication and keeps API details in one place.
- Existing consumers (e.g., useProjectIntegration) can continue to call addTransaction; it now returns a Promise<void>. You may await it or fire-and-forget.
- Error handling: the context uses optimistic insert, then reloads from server. On failure, it reloads to revert the optimistic change and rethrows so the UI can inform the user.
