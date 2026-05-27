import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserProfile } from '@/types'

interface AuthState {
  isAuthenticated: boolean
  userProfile: UserProfile | null
  accessToken: string | null
  login: (profile: UserProfile, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userProfile: null,
      accessToken: null,
      login: (profile, token) =>
        set({
          isAuthenticated: true,
          userProfile: profile,
          accessToken: token,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          userProfile: null,
          accessToken: null,
        }),
    }),
    {
      name: 'cipherdrive-auth',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
