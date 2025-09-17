# Process Update: Add Transaction via Modal using createTransaction

Last updated: 2025-09-17

This update wires the "Add Transaction" modal to create real transactions in the database by calling the existing server action `createTransaction` through a POST API route. After a successful create, the app refreshes the TransactionContext from the server so the dashboard and other components immediately reflect the new data.

## What changed

1) API Route
- New POST endpoint: `POST /api/transactions`
  - Delegates to `actions/transactions/actions.ts#createTransaction`
  - Converts incoming `amount` (number/string) to BigInt on the server
  - Returns `{ data, error }` JSON

2) TransactionContext
- Added `reloadRecentTransactions(): Promise<void>` that fetches real recent transactions from `GET /api/transactions/recent?userId=...&limit=20` and updates both context state and localStorage cache.
- Initial hydration now reuses this helper.
- Existing `addTransaction` (local-only) remains for legacy flows (e.g., project integration) to minimize changes. UI modal no longer uses this for persistence.

3) AddTransactionModal
- On submit, the modal now:
  - Reads `userId` from localStorage (fallback: `demo-user`).
  - Calls `POST /api/transactions` with `{ userId, type, amount, category, description, paymentMethod }`.
  - On success, calls `reloadRecentTransactions()` to refresh context state from the server.
  - Shows a success notification and closes shortly after.

## Affected Files
- src/app/api/transactions/route.ts (new)
- src/contexts/TransactionContext.tsx (extended with `reloadRecentTransactions` and refactored initial load)
- src/components/app/AddTransactionModal.tsx (submit now uses API and reloads context)

## How it works (flow)
- User opens modal → fills fields → submits
- Client POSTs to `/api/transactions` → server action `createTransaction` persists to MongoDB via Prisma
- Client calls `reloadRecentTransactions()` → GET recent list and update context
- UI (Dashboard/RecentTransactions/etc.) re-renders with the new transaction and updated totals derived from the context

## Notes
- User identification: For now, `userId` is read from `localStorage.getItem('userId')` or defaults to `demo-user`. In production, derive the `userId` in the API route from the authenticated session.
- Amounts: Stored as BigInt in DB; endpoints serialize BigInt to string where needed. The context maps amounts to `number` for rendering.
- Totals: Dashboard balance, income, and expense are computed from the transactions held in context (recent set). If you need full-history totals, you can still use the analytics endpoints.
- Backward compatibility: `addTransaction` is still available for internal sync flows; consider migrating those to the backend as a follow-up to avoid divergence between local and server data.

## Quick usage example (client)
```ts
// inside the modal submit (already implemented)
await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, type, amount, category, description, paymentMethod })
});
await reloadRecentTransactions();
```

## Next steps (optional)
- Replace remaining local-only additions (e.g., project integration) with backend calls, and/or make the API route accept a `source` to prevent duplicates.
- Derive userId on the server from the authenticated session.
- Add error UI/validation and disabled states on the modal submit button.
