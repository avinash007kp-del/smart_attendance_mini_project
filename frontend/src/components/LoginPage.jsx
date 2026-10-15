"use client";

import { useState, useEffect } from 'react';
import { useRouter } from '../hooks/useRouter';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

// ─────────────────────────────────────────────────────────────
// 1. BRAND LOGO COMPONENT
// Minimal geometric monogram logo resembling a thin-line, abstract letter A
// ─────────────────────────────────────────────────────────────
function BrandLogo() {
  return (
    <div className="att-brand">
      <svg
        className="att-logo-icon"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Attentify Monogram"
      >
        {/* Geometric thin-line abstract letter A */}
        <path
          d="M18 3.5L5 32.5H10.5L18 15L25.5 32.5H31L18 3.5Z"
          fill="#142E43"
        />
        <rect
          x="11"
          y="23"
          width="14"
          height="2"
          fill="#142E43"
          rx="0.5"
        />
      </svg>
      <span className="att-brand-name">ATTENTIFY</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. HERO SECTION COMPONENT (Left Column)
// Editorial typography with high-contrast serif and custom organic ellipse
// ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <div className="att-left-col">
      <h1 className="att-hero-headline">
        Presence,<br />made simple.
      </h1>

      <p className="att-hero-subhead">
        Next-generation attendance management,<br />
        powered by QR codes &amp; face recognition.
      </p>

      {/* Subtle, organic abstract ellipse tilted at approx -30 degrees */}
      <div className="att-decorative-ellipse" aria-hidden="true">
        <svg
          width="230"
          height="105"
          viewBox="0 0 250 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 52,88 C 28,62 48,28 108,18 C 172,8 228,24 238,48 C 248,72 212,98 152,106 C 88,114 62,100 52,88 Z"
            stroke="#9EAAB3"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(-26, 125, 60)"
          />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. PAGE FOOTER COMPONENT
// Minimalist, quiet footer with uppercase tagline and copyright
// ─────────────────────────────────────────────────────────────
function PageFooter() {
  return (
    <footer className="att-footer">
      <span className="att-footer-left">ATTENDANCE, SIMPLIFIED.</span>
      <span className="att-footer-right">© 2026 Attentify</span>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. MAIN LOGIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { login, register, loading, error, clearError, user } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', role: 'student', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(true);
  const [isSetupMode, setIsSetupMode] = useState(false);

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
      const dest = user.role === 'teacher' ? '/faculty' : user.role === 'student' ? '/student' : '/dashboard';
      router.replace(dest);
    }
  }, [user, router]);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      errs.password = 'Password is required';
    }

    if (isSetupMode && !form.name.trim()) {
      errs.name = 'Full name is required to initialize admin access';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    try {
      if (isSetupMode) {
        await register(form.email, form.password, 'admin', form.name, null, null);
        alert('Primary administrator account created! Please sign in.');
        setIsSetupMode(false);
        setHasAdmin(true);
        setForm(prev => ({ ...prev, password: '' }));
      } else {
        const userData = await login(form.email, form.password, 'student');
        setLoginSuccess(true);
        const dest = userData?.role === 'teacher' ? '/faculty' : userData?.role === 'student' ? '/student' : '/dashboard';
        setTimeout(() => router.push(dest), 600);
      }
    } catch {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="att-page-root">
      {/* A. Header / Brand */}
      <header className="att-header">
        <BrandLogo />
      </header>

      {/* B. Main Content — Two-Column Layout */}
      <main className="att-main-content">
        {/* Left Column: Brand Statement */}
        <HeroSection />

        {/* Right Column: Login Form */}
        <div className="att-right-col">
          <div className="att-form-container">
            <h2 className="att-form-heading">
              {isSetupMode ? "Setup Attentify" : "Welcome back"}
            </h2>
            <p className="att-form-subhead">
              {isSetupMode ? "Create the primary administrator account" : "Sign in to your Attentify account"}
            </p>

            {/* Error Message */}
            {error && (
              <div className="att-alert-error" role="alert">
                <span>{error}</span>
              </div>
            )}

            {/* First-Time Setup Notification */}
            {!hasAdmin && !isSetupMode && (
              <div className="att-setup-banner">
                <div className="att-setup-banner-text">
                  <strong>First-time setup:</strong> No admin account exists yet.
                </div>
                <button
                  type="button"
                  className="att-setup-banner-btn"
                  onClick={() => setIsSetupMode(true)}
                >
                  Setup Admin
                </button>
              </div>
            )}

            {/* Form */}
            <form id="login-form" className="att-form" onSubmit={handleSubmit} noValidate>
              {isSetupMode && (
                <div className="att-form-group">
                  <label className="att-label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`att-input ${fieldErrors.name ? 'input-error' : ''}`}
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  {fieldErrors.name && <span className="att-field-error">{fieldErrors.name}</span>}
                </div>
              )}

              {/* Email Address Field */}
              <div className="att-form-group">
                <label className="att-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`att-input ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {fieldErrors.email && <span className="att-field-error">{fieldErrors.email}</span>}
              </div>

              {/* Password Field */}
              <div className="att-form-group">
                <label className="att-label" htmlFor="password">Password</label>
                <div className="att-password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`att-input ${fieldErrors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="att-password-toggle"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707C85" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707C85" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <span className="att-field-error">{fieldErrors.password}</span>}
              </div>

              {/* Sign-In Primary Button */}
              <button
                type="submit"
                className="att-signin-btn"
                disabled={loading || loginSuccess}
              >
                <span className="att-btn-text">
                  {loginSuccess
                    ? "Redirecting…"
                    : loading
                    ? "Signing In…"
                    : isSetupMode
                    ? "Create Admin Account"
                    : "Sign In"}
                </span>
                <span className="att-btn-arrow">
                  {loading ? (
                    <span className="att-spinner" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </span>
              </button>

              {isSetupMode && (
                <button
                  type="button"
                  className="att-cancel-btn"
                  onClick={() => setIsSetupMode(false)}
                >
                  Cancel Setup
                </button>
              )}
            </form>

            {/* Divider and Account Notice */}
            <div className="att-divider" />
            <div className="att-account-notice">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#707C85" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Admin access is required to create new accounts.</span>
            </div>
          </div>
        </div>
      </main>

      {/* C. Footer */}
      <PageFooter />
    </div>
  );
}
