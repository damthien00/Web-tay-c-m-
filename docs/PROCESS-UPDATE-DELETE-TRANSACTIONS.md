# Process Update: Update/Delete Transactions with Real Backend

Last updated: 2025-09-17

This update wires the Transactions edit and delete flows to the real database via our existing Prisma server actions. We added API routes and refactored TransactionContext so UI components can call a single source of truth.

## What changed

1) API Routes
- PATCH /api/transactions/[id]
  - Delegates to actions/transactions/actions.ts#updateTransaction(userId, id, inputs)
  - Expects body: { userId, type?, amount?, category?, description?, paymentMethod?, location?, tags?, projectId? }
  - Converts amount to BigInt when provided.
- DELETE /api/transactions/[id]?userId=USER_ID
  - Delegates to actions/transactions/actions.ts#deleteTransaction(userId, id)

2) TransactionContext
- updateTransaction(id, partial): now async and persists changes by calling PATCH /api/transactions/[id]. Uses optimistic UI, then reloads from server via reloadRecentTransactions(). On error, logs and reloads to revert.
- deleteTransaction(id): now async and calls DELETE /api/transactions/[id]?userId=... with optimistic removal and server reload.
- The interface methods now return Promise<void> to reflect async behavior.

3) Components
- EditTransactionModal: awaits updateTransaction; shows success and handles error alerts.
- TransactionView: awaits deleteTransaction in the delete button handler.

## Affected files
- src/app/api/transactions/[id]/route.ts (new)
- src/contexts/TransactionContext.tsx (update/delete refactor; methods now async)
- src/components/app/EditTransactionModal.tsx (await update)
- src/components/app/TransactionView.tsx (await delete)

## How it works (flow)
- Edit flow: UI opens EditTransactionModal → user submits → context.updateTransaction(id, partial) → PATCH API → server action updateTransaction persists → context reloads recent list → UI re-renders.
- Delete flow: UI clicks delete → context.deleteTransaction(id) → DELETE API → server action deleteTransaction persists → context reloads recent list → UI re-renders.

## Notes
- userId: For now, derived on the client from localStorage key `userId` (fallback `demo-user`) and passed to the API. In production, derive userId on the server from session.
- Amount: Stored as BigInt in DB. API routes convert incoming number/string to BigInt. Responses serialize BigInt via server actions.
- Consistency: We always call reloadRecentTransactions() after mutations to replace optimistic state with authoritative data from the server.

## Quick client usage examples

```ts
import { useTransactions } from '@/src/contexts/TransactionContext';
const { updateTransaction, deleteTransaction } = useTransactions();

await updateTransaction('64f0...', { description: 'Cà phê sáng', amount: 35000 });
await deleteTransaction('64f0...');
```

## Backend references
- actions/transactions/actions.ts
  - updateTransaction(userId, id, inputs)
  - deleteTransaction(userId, id)
```
