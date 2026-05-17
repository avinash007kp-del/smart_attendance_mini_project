"use client";

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

/**
 * Resolves "system" to the OS preference.
 * Returns either 'dark' or 'light'.
 */
function resolveTheme(t) {
  if (t === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return t
}

export function ThemeProvider({ children }) {
  // preference can be 'dark' | 'light' | 'system'
  const [preference, setPreference] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('attentify-theme') || 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const resolved = resolveTheme(preference)
    document.documentElement.setAttribute('data-theme', resolved)
    localStorage.setItem('attentify-theme', preference)
  }, [preference])

  // Also listen to OS changes when set to 'system'
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'light' : 'dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  const setTheme = (t) => setPreference(t)
  const toggleTheme = () =>
    setPreference((p) => (resolveTheme(p) === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme: preference, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
