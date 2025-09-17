import { create } from 'zustand'
import type { UserProfile } from '@/components/app/ProfileSetupModal'

export type AppSettings = {
  notifications: boolean
  biometric: boolean
  darkMode: boolean
}

export type AppState = {
  profile: UserProfile | null
  settings: AppSettings
  setProfile: (p: UserProfile | null) => void
  updateSettings: (updates: Partial<AppSettings>) => void
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  settings: {
    notifications: true,
    biometric: false,
    darkMode: false,
  },
  setProfile: (p) => set({ profile: p }),
  updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
}))
