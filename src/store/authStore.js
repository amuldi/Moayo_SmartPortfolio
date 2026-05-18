import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiFetch, readApiJson } from '../services/apiClient.js'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      sessionStatus: 'idle',

      setAuth: (user) => set({ user, isGuest: false, sessionStatus: 'authenticated' }),
      enterGuestMode: () => set({
        isGuest: true,
        sessionStatus: 'guest',
        user: { username: '게스트', email: 'guest@local', role: 'guest' },
      }),
      hydrateSession: async () => {
        if (get().isGuest) return get().user
        set({ sessionStatus: 'checking' })
        try {
          const meResponse = await apiFetch('/api/auth/me')
          if (meResponse.ok) {
            const user = await readApiJson(meResponse, '세션 확인 실패')
            set({ user, isGuest: false, sessionStatus: 'authenticated' })
            return user
          }

          const refreshResponse = await apiFetch('/api/auth/refresh', { method: 'POST' })
          if (!refreshResponse.ok) throw new Error('refresh failed')
          const data = await readApiJson(refreshResponse, '세션 갱신 실패')
          set({ user: data.user, isGuest: false, sessionStatus: 'authenticated' })
          return data.user
        } catch {
          set({ user: null, isGuest: false, sessionStatus: 'anonymous' })
          return null
        }
      },
      logout: async () => {
        try {
          await apiFetch('/api/auth/logout', { method: 'POST' })
        } catch {
          // 로컬 상태는 반드시 정리합니다.
        } finally {
          set({ user: null, isGuest: false, sessionStatus: 'anonymous' })
        }
      },
    }),
    {
      name: 'auth-data',
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
      }),
    }
  )
)

export default useAuthStore
