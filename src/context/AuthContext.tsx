import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../api'
import type { AuthResponse } from '../types'

interface AuthState {
  token: string | null
  username: string | null
  rol: 'ADMIN' | 'DOCTOR' | 'PACIENTE' | null
  personaId: number | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isDoctor: boolean
  isPaciente: boolean
}

const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = 'rednorte_auth'

function loadFromStorage(): Omit<AuthState, 'login' | 'logout' | 'isAuthenticated' | 'isAdmin' | 'isDoctor' | 'isPaciente'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { token: null, username: null, rol: null, personaId: null }
}

function saveToStorage(data: AuthResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    token: data.token,
    username: data.username,
    rol: data.rol,
    personaId: data.personaId,
  }))
  localStorage.setItem('token', data.token)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadFromStorage)

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password)
    saveToStorage(res)
    setState({
      token: res.token,
      username: res.username,
      rol: res.rol,
      personaId: res.personaId,
    })
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('token')
    setState({ token: null, username: null, rol: null, personaId: null })
  }

  const value: AuthState = {
    ...state,
    login,
    logout,
    isAuthenticated: !!state.token,
    isAdmin: state.rol === 'ADMIN',
    isDoctor: state.rol === 'DOCTOR',
    isPaciente: state.rol === 'PACIENTE',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
