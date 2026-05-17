"use client";

import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sa_user')
        return saved ? JSON.parse(saved) : null
      } catch {
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (email, password, role) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Login failed")
      }

      // data contains { access_token, token_type, user }
      const userData = { 
        ...data.user, 
        token: data.access_token 
      }
      
      localStorage.setItem('sa_user', JSON.stringify(userData))
      setUser(userData)
      setLoading(false)
      return userData
    } catch (err) {
      setLoading(false)
      const msg = typeof err.message === 'string' ? err.message : "An unexpected error occurred"
      setError(msg)
      throw err
    }
  }, [])

  const register = useCallback(async (email, password, role, name, dept, subject) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, name, dept, subject })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed")
      }

      setLoading(false)
      return data
    } catch (err) {
      setLoading(false)
      const msg = typeof err.message === 'string' ? err.message : "An unexpected error occurred"
      setError(msg)
      throw err
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sa_user')
    setUser(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
