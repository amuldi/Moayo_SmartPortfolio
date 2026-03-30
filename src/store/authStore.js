import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isGuest: false,

      setAuth: (token, user) => set({ token, user, isGuest: false }),
      enterGuestMode: () => set({
        token: null,
        isGuest: true,
        user: { username: '게스트', email: 'guest@local', role: 'guest' },
      }),
      logout: () => set({ token: null, user: null, isGuest: false }),
    }),
    { name: 'auth-data' }
  )
)

export default useAuthStore
