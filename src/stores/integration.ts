import { create } from 'zustand'

export type IntegrationSyncState = {
  syncedProjectRevenueIds: Set<string>
  syncedProjectExpenseIds: Set<string>
  processedGoalContributionKeys: Set<string>
  hasSyncedRevenue: (id: string) => boolean
  markRevenueSynced: (id: string) => void
  hasSyncedExpense: (id: string) => boolean
  markExpenseSynced: (id: string) => void
  hasProcessedContribution: (key: string) => boolean
  markContributionProcessed: (key: string) => void
  clear: () => void
}

export const useIntegrationSyncStore = create<IntegrationSyncState>((set, get) => ({
  syncedProjectRevenueIds: new Set<string>(),
  syncedProjectExpenseIds: new Set<string>(),
  processedGoalContributionKeys: new Set<string>(),
  hasSyncedRevenue: (id) => get().syncedProjectRevenueIds.has(id),
  markRevenueSynced: (id) => set((state) => {
    const next = new Set(state.syncedProjectRevenueIds)
    next.add(id)
    return { syncedProjectRevenueIds: next }
  }),
  hasSyncedExpense: (id) => get().syncedProjectExpenseIds.has(id),
  markExpenseSynced: (id) => set((state) => {
    const next = new Set(state.syncedProjectExpenseIds)
    next.add(id)
    return { syncedProjectExpenseIds: next }
  }),
  hasProcessedContribution: (key) => get().processedGoalContributionKeys.has(key),
  markContributionProcessed: (key) => set((state) => {
    const next = new Set(state.processedGoalContributionKeys)
    next.add(key)
    return { processedGoalContributionKeys: next }
  }),
  clear: () => set({
    syncedProjectRevenueIds: new Set<string>(),
    syncedProjectExpenseIds: new Set<string>(),
    processedGoalContributionKeys: new Set<string>(),
  }),
}))
