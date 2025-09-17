import { create } from 'zustand'

export type AuthState = {
  isAuthenticated: boolean
  userId: string | null
  email: string | null
  loginTime: string | null
  signIn: (email: string) => void
  signOut: () => void
  setUserId: (userId: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: null,
  email: null,
  loginTime: null,
  signIn: (email: string) => {
    // In absence of a backend, we treat email as user identifier
    set({
      isAuthenticated: true,
      email,
      userId: email,
      loginTime: new Date().toISOString(),
    })
  },
  signOut: () => set({ isAuthenticated: false, userId: null, email: null, loginTime: null }),
  setUserId: (userId: string | null) => set({ userId, isAuthenticated: !!userId }),
}))
