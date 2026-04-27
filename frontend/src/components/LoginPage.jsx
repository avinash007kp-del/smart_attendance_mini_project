"use client";

import { useState, useEffect } from 'react'
import { useRouter } from '../hooks/useRouter'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const ROLES = [
  { value: 'admin', label: 'Administrator', icon: '🛡️' },
  { value: 'teacher', label: 'Teacher / Faculty', icon: '👨‍🏫' },
  { value: 'student', label: 'Student', icon: '🎓' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, register, loading, error, clearError, user } = useAuth()

  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', role: 'student', name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [mounted, setMounted] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      const dest = user.role === 'teacher' ? '/faculty' : user.role === 'student' ? '/student' : '/dashboard'
      router.replace(dest)
    }
    setMounted(true)
  }, [user, router])

  const validate = () => {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (isRegister && !form.name.trim()) errs.name = 'Full name is required'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (error) clearError()
  }

  const handleRoleChange = (role) => {
    setForm(prev => ({ ...prev, role }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    try {
      if (isRegister) {
        await register(form.email, form.password, form.role, form.name)
        alert("Account created! You can now sign in.")
        setIsRegister(false)
      } else {
        const userData = await login(form.email, form.password, form.role)
        setLoginSuccess(true)
        const dest = userData?.role === 'teacher' ? '/faculty' : userData?.role === 'student' ? '/student' : '/dashboard'
        setTimeout(() => router.push(dest), 800)
      }
    } catch {
      // error is handled by context
    }
  }

  return (
    <div className={`login-root ${mounted ? 'mounted' : ''}`}>
      <div className="login-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
      </div>

      <aside className="login-aside">
        <div className="aside-content">
          <div className="brand-logo">
            <div className="logo-ring">
              <span className="logo-icon">A</span>
            </div>
          </div>
          <h1 className="aside-title">ATTENTIFY</h1>
          <p className="aside-subtitle">
            Next-generation attendance management powered by QR codes &amp; face recognition.
          </p>

          <div className="feature-list">
            {[
              { icon: '🔲', label: 'QR Code Scanning' },
              { icon: '👁️', label: 'Face Recognition' },
              { icon: '📊', label: 'Real-time Analytics' },
              { icon: '🔔', label: 'Instant Notifications' },
            ].map(f => (
              <div key={f.label} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <span className="feature-label">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="aside-stats">
            <div className="stat">
              <span className="stat-value">99.8%</span>
              <span className="stat-label">Accuracy</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">&lt;1s</span>
              <span className="stat-label">Recognition</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="login-main">
        <div className={`login-card ${loginSuccess ? 'success' : ''}`}>
          <div className="card-header">
            <div className="card-logo">A</div>
            <h2 className="card-title">{isRegister ? 'Create Account' : 'Welcome back'}</h2>
            <p className="card-description">{isRegister ? 'Join the Attentify community' : 'Sign in to your Attentify account'}</p>
          </div>

          <div className="role-selector" role="group" aria-label="Select your role">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                id={`role-${r.value}`}
                className={`role-btn ${form.role === r.value ? 'active' : ''}`}
                onClick={() => handleRoleChange(r.value)}
                aria-pressed={form.role === r.value}
              >
                <span className="role-btn-icon">{r.icon}</span>
                <span className="role-btn-label">{r.label}</span>
              </button>
            ))}
          </div>

          <form id="login-form" className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="alert alert-error" role="alert">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {isRegister && (
              <div className={`field ${fieldErrors.name ? 'field-error' : ''}`}>
                <label className="field-label" htmlFor="name">Full Name</label>
                <div className="field-input-wrap">
                  <span className="field-prefix-icon">👤</span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="field-input"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
              </div>
            )}

            <div className={`field ${fieldErrors.email ? 'field-error' : ''}`}>
              <label className="field-label" htmlFor="email">Email Address</label>
              <div className="field-input-wrap">
                <span className="field-prefix-icon">✉️</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
            </div>

            <div className={`field ${fieldErrors.password ? 'field-error' : ''}`}>
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-input-wrap">
                <span className="field-prefix-icon">🔑</span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
            </div>

            <button
              type="submit"
              className={`login-btn ${loading ? 'loading' : ''} ${loginSuccess ? 'success' : ''}`}
              disabled={loading || loginSuccess}
            >
              {loginSuccess ? (
                <>Redirecting…</>
              ) : loading ? (
                <>Processing…</>
              ) : (
                <>{isRegister ? 'Sign Up' : 'Sign In'}</>
              )}
            </button>
          </form>

          <p className="card-footer">
            {isRegister ? 'Already have an account?' : 'Need an account?'}
            {' '}
            <a href="#" className="card-footer-link" onClick={e => { e.preventDefault(); setIsRegister(!isRegister); clearError(); }}>
              {isRegister ? 'Sign In' : 'Create One'}
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
