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

  const [form, setForm] = useState({ email: '', password: '', role: 'student', name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [mounted, setMounted] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [hasAdmin, setHasAdmin] = useState(true) // assume true initially
  const [isSetupMode, setIsSetupMode] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/has_admin`);
        if (res.ok) {
          const data = await res.json();
          setHasAdmin(data.has_admin);
        }
      } catch (e) {
        console.error("Failed to check admin status", e);
      }
    };
    checkAdmin();
  }, []);

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
    
    if (!form.password) {
      errs.password = 'Password is required'
    }
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
    
    // Add name validation for setup mode
    if (isSetupMode && !form.name.trim()) errs.name = 'Name is required'
    
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    try {
      if (isSetupMode) {
        await register(form.email, form.password, 'admin', form.name, null, null)
        alert('Admin account created! Please sign in.')
        setIsSetupMode(false)
        setHasAdmin(true)
        setForm(prev => ({ ...prev, password: '' }))
      } else {
        const userData = await login(form.email, form.password, 'admin') // The backend ignores the role param for login
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
            <h2 className="card-title">{isSetupMode ? "Setup Attentify" : "Welcome back"}</h2>
            <p className="card-description">{isSetupMode ? "Create the primary administrator account" : "Sign in to your Attentify account"}</p>
          </div>



          <form id="login-form" className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="alert alert-error" role="alert">
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {!hasAdmin && !isSetupMode && (
              <div className="alert" style={{ background: '#fef3c7', color: '#92400e', borderColor: '#f59e0b', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <strong>Welcome to Attentify!</strong>
                  <span style={{ fontSize: '0.85rem' }}>No administrator account exists yet.</span>
                  <button type="button" onClick={() => setIsSetupMode(true)} style={{ background: '#d97706', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Setup First Admin
                  </button>
                </div>
              </div>
            )}

            {isSetupMode && (
              <div className={`field ${fieldErrors.name ? 'field-error' : ''}`}>
                <label className="field-label" htmlFor="name">Full Name</label>
                <div className="field-input-wrap">
                  <span className="field-prefix-icon">👤</span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="field-input"
                    placeholder="Enter your name"
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
              ) : isSetupMode ? (
                <>Create Admin Account</>
              ) : (
                <>Sign In</>
              )}
            </button>
            
            {isSetupMode && (
              <button
                type="button"
                onClick={() => setIsSetupMode(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--surface-500)', cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem' }}
              >
                Cancel Setup
              </button>
            )}
          </form>

          <p className="card-footer" style={{ textAlign: 'center', opacity: 0.7, fontSize: '0.85rem' }}>
            Admin access is required to create new accounts.
          </p>
        </div>
      </main>
    </div>
  )
}
