import { create } from 'zustand'
import type { AuthResponse, AuthUser } from '../types/auth.types'

const SESSION_KEY = 'restaurant-auth-session'

interface AuthState {
  token: string | null
  user: AuthUser | null
  setSession: (session: AuthResponse) => void
  logout: () => void
}

function loadSession(): Pick<AuthState, 'token' | 'user'> {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) {
    return { token: null, user: null }
  }

  try {
    const session = JSON.parse(raw) as AuthResponse
    return {
      token: session.token,
      user: { userId: session.userId, username: session.username },
    }
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return { token: null, user: null }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadSession(),
  setSession: (session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    set({ token: session.token, user: { userId: session.userId, username: session.username } })
  },
  logout: () => {
    localStorage.removeItem(SESSION_KEY)
    set({ token: null, user: null })
  },
}))
