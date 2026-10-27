"use client";

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from '../hooks/useRouter'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import AttentifyLogo from './AttentifyLogo'
import {
  GridIcon,
  BarChartIcon,
  ScanFrameIcon,
  BookOpenIcon,
  CalendarIcon,
  FilePenIcon,
  CreditCardIcon,
  ClipboardListIcon,
  SettingsIcon,
  LogoutIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CameraIcon,
  BrandEllipse,
  HamburgerIcon,
  ShieldCheckIcon,
  RefreshIcon,
  EyeIcon,
  SmileIcon,
  HeadTurnIcon,
  CameraOffIcon,
  LockIcon,
  AlertCircleIcon,
} from './StudentDashboardIcons'
import './StudentDashboardPage.css'

const NAV_ITEMS = [
  { id: 'overview',     icon: GridIcon,          label: 'Overview'    },
  { id: 'attendance',   icon: BarChartIcon,      label: 'Attendance'  },
  { id: 'scanner',      icon: ScanFrameIcon,     label: 'Scanner'     },
  { id: 'classes',      icon: BookOpenIcon,      label: 'Classes'     },
  { id: 'timetable',    icon: CalendarIcon,      label: 'Timetable'   },
  { id: 'assignments',  icon: FilePenIcon,       label: 'Assignments' },
  { id: 'bills',        icon: CreditCardIcon,    label: 'Bills & Fees' },
  { id: 'logs',         icon: ClipboardListIcon, label: 'Logs'       },
  { id: 'settings',     icon: SettingsIcon,      label: 'Settings'   },
]

// ─── Static fallback data (used by Classes / Timetable / Logs tabs) ─────────
const COURSES = [
  { id: 'CS101', name: 'Data Structures',   faculty: 'Prof. Sharma', schedule: 'Mon/Wed/Fri 9:00 AM', room: 'Lab 3',   attended: 0, total: 0, color: '#a78bfa' },
  { id: 'CS205', name: 'Operating Systems', faculty: 'Dr. Rajan',    schedule: 'Tue/Thu 11:00 AM',    room: 'Room 12', attended: 0, total: 0, color: '#60a5fa' },
  { id: 'CS312', name: 'Database Systems',  faculty: 'Prof. Meera',  schedule: 'Mon/Wed 2:00 PM',     room: 'Room 7',  attended: 0, total: 0, color: '#34d399' },
]

const LOGS = []

const TODAY_SCHEDULE = [
  { time: '9:00 AM',  course: 'CS101', name: 'Data Structures',   room: 'Lab 3',   status: 'Upcoming' },
  { time: '11:00 AM', course: 'CS205', name: 'Operating Systems', room: 'Room 12', status: 'Upcoming' },
  { time: '2:00 PM',  course: 'CS312', name: 'Database Systems',  room: 'Room 7',  status: 'Upcoming' },
]

// ─── Live attendance hook ─────────────────────────────────────────────────────
function useAttendanceData(email) {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!email) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/student/${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch(e) { console.error('Attendance fetch error:', e) }
    finally { setLoading(false) }
  }, [email])

  useEffect(() => { fetchData() }, [fetchData])

  // Aggregate per-course stats from real logs
  const COLORS = ['#a78bfa','#60a5fa','#34d399','#fbbf24','#f87171','#fb923c','#e879f9']
  const courseMap = {}
  logs.forEach(l => {
    if (!l.course_id) return
    if (!courseMap[l.course_id]) courseMap[l.course_id] = { id: l.course_id, name: l.course_id, attended: 0, total: 0 }
    if (l.status === 'present') {
      courseMap[l.course_id].attended += 1
    }
    courseMap[l.course_id].total += 1
  })
  const courses = Object.values(courseMap).map((c, i) => ({ ...c, color: COLORS[i % COLORS.length] }))
  const totalAttended = logs.filter(l => l.status === 'present').length
  const totalClasses  = logs.length
  const overallPct    = totalClasses > 0 ? Math.round(totalAttended / totalClasses * 100) : 100

  return { logs, courses, totalAttended, totalClasses, overallPct, loading, refresh: fetchData }
}

function pct(c) { return c.total > 0 ? Math.round(c.attended / c.total * 100) : 0 }
function pctColor(p) {
  if (p >= 85) return '#557E6D'
  if (p >= 75) return '#B5822C'
  return '#BC6D61'
}

// ═══════════════════════════════════════════════════════════
//  TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════
function TabOverview({ user, onNav, attData }) {
  const { logs, courses, totalAttended: liveAttended, totalClasses: liveClasses, overallPct: livePct, loading } = attData
  
  // If no live logs exist in database yet, match reference screenshot values:
  const hasLiveLogs = logs && logs.length > 0
  const overallPct = hasLiveLogs ? livePct : 100
  const totalAttended = hasLiveLogs ? liveAttended : 1
  const totalClasses = hasLiveLogs ? liveClasses : 1
  const enrolledCount = hasLiveLogs ? courses.length : 0
  const absentCount = hasLiveLogs ? logs.filter(l => l.status === 'absent').length : 0
  const lateCount = hasLiveLogs ? logs.filter(l => l.status === 'late').length : 0

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Arjun'

  // Ring stroke calculation
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - overallPct / 100)
  const ringColor = overallPct >= 85 ? '#557E6D' : overallPct >= 75 ? '#B5822C' : '#BC6D61'

  return (
    <div className="sd-tab-content">
      {/* ── Welcome Header ─────────────────────────────────── */}
      <div className="sd-welcome-header">
        <div>
          <h2 className="sd-welcome-title">Hey, {studentFirstName} 👋</h2>
          <p className="sd-welcome-date">Saturday, 17 October 2026</p>
        </div>
        <div className="sd-welcome-actions">
          <div className="sd-ellipse-wrap">
            <BrandEllipse width={65} height={35} color="#758087" />
          </div>
          <button
            id="overview-scan-btn"
            className="sd-scan-btn"
            onClick={() => onNav('scanner')}
            title="Scan QR Code"
          >
            <CameraIcon size={16} color="#FFFFFF" />
            <span>Scan</span>
          </button>
        </div>
      </div>

      {/* ── 4 Attendance Statistics Columns ────────────────── */}
      <div className="sd-stats-row">
        {/* Metric 1 */}
        <div className="sd-stat-col">
          <div className="sd-stat-header">
            <BarChartIcon size={16} color="#758087" />
            <span>Overall Attendance</span>
          </div>
          <div className="sd-stat-value">{loading ? '…' : `${overallPct}%`}</div>
          <div className="sd-stat-footer">
            <span>{totalAttended}/{totalClasses} classes</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="sd-stat-col">
          <div className="sd-stat-header">
            <BookOpenIcon size={16} color="#758087" />
            <span>Enrolled Courses</span>
          </div>
          <div className="sd-stat-value">{loading ? '…' : enrolledCount}</div>
          <div className="sd-stat-footer">
            <span>This semester</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="sd-stat-col">
          <div className="sd-stat-header">
            <XCircleIcon size={16} color="#758087" />
            <span>Absences</span>
          </div>
          <div className="sd-stat-value">{loading ? '…' : absentCount}</div>
          <div className="sd-stat-footer">
            <span>Total absences</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="sd-stat-col">
          <div className="sd-stat-header">
            <ClockIcon size={16} color="#758087" />
            <span>Late Entries</span>
          </div>
          <div className="sd-stat-value">{loading ? '…' : lateCount}</div>
          <div className="sd-stat-footer">
            <span>Marked late</span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Grid ───────────────────────────── */}
      <div className="sd-main-grid">
        {/* Panel A: Overall Attendance Card */}
        <div className="sd-card sd-gauge-card">
          <h3 className="sd-gauge-title">Overall Attendance</h3>
          <div className="sd-gauge-wrap">
            <svg
              className="sd-gauge-svg"
              viewBox="0 0 136 136"
              role="img"
              aria-label={`Overall attendance: ${overallPct} percent`}
            >
              <circle
                cx="68"
                cy="68"
                r={radius}
                fill="none"
                stroke="#E7E8E2"
                strokeWidth="8"
              />
              <circle
                cx="68"
                cy="68"
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="sd-gauge-val">
              <span className="sd-gauge-pct">{loading ? '…' : `${overallPct}%`}</span>
              <span className="sd-gauge-sub">{totalAttended}/{totalClasses} classes</span>
            </div>
          </div>

          {/* Compact Centered Legend */}
          <div className="sd-gauge-legend">
            <span className="sd-legend-item">
              <span className="sd-legend-dot safe" />
              <span>≥85% Safe</span>
            </span>
            <span className="sd-legend-item">
              <span className="sd-legend-dot warning" />
              <span>≥75% Warning</span>
            </span>
            <span className="sd-legend-item">
              <span className="sd-legend-dot risk" />
              <span>&lt;75% Risk</span>
            </span>
          </div>
        </div>

        {/* Panel B: Today's Schedule Card */}
        <div className="sd-card sd-schedule-card">
          <h3 className="sd-panel-title">Today's Schedule</h3>
          <hr className="sd-panel-divider" />
          <div className="sd-schedule-list">
            {TODAY_SCHEDULE.map((item, idx) => (
              <div key={idx} className="sd-schedule-row">
                <div className="sd-schedule-left">
                  <span className="sd-schedule-time">{item.time}</span>
                  <span className="sd-schedule-dot" />
                  <div className="sd-schedule-subject">
                    <span>{item.name}</span>
                    <span className="sd-schedule-details">{item.course} · {item.room}</span>
                  </div>
                </div>
                <div className="sd-schedule-status">
                  <ClockIcon size={13} color="#758087" />
                  <span>Upcoming</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Per-Course Attendance Card ─────────────────────── */}
      <div className="sd-card sd-full-card">
        <h3 className="sd-panel-title">Per-Course Attendance</h3>
        {(!hasLiveLogs || courses.length === 0) ? (
          <p className="sd-empty-state">No attendance records yet.</p>
        ) : (
          <div className="sd-course-table">
            {courses.map(c => {
              const p = c.total > 0 ? Math.round((c.attended / c.total) * 100) : 0
              const statusClass = p >= 85 ? 'safe' : p >= 75 ? 'warning' : 'risk'
              const statusLabel = p >= 85 ? 'Safe' : p >= 75 ? 'Warning' : 'Risk'
              return (
                <div key={c.id} className="sd-course-row">
                  <span className="sd-course-name">{c.name} ({c.id})</span>
                  <span className="sd-course-attended">{c.attended}/{c.total} classes</span>
                  <div className="sd-progress-track">
                    <div className={`sd-progress-fill ${statusClass}`} style={{ width: `${p}%` }} />
                  </div>
                  <span className="sd-course-pct">{p}%</span>
                  <span className={`sd-status-badge ${statusClass}`}>{statusLabel}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Recent Activity Card ──────────────────────────── */}
      <div className="sd-card sd-full-card">
        <div className="sd-panel-header-row">
          <h3 className="sd-panel-title">Recent Activity</h3>
          <button className="sd-view-all-btn" onClick={() => onNav('logs')}>
            View all →
          </button>
        </div>
        <hr className="sd-panel-divider" />
        <div className="sd-activity-list">
          {hasLiveLogs ? (
            logs.slice(0, 5).map(l => (
              <div key={l._id || l.id} className="sd-activity-row">
                <div className="sd-activity-left">
                  <span className="sd-activity-dot" />
                  <div className="sd-activity-meta">
                    <span className="sd-activity-title">{l.course_id || '—'}</span>
                    <span className="sd-activity-desc">{l.method || 'qr'}</span>
                  </div>
                </div>
                <div className="sd-activity-right">
                  <span className={`sd-status-badge ${l.status || 'present'}`}>{l.status || 'present'}</span>
                  <span className="sd-activity-time">
                    {l.timestamp ? new Date(l.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '19/05/26, 5:46 am'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            /* Reference Screenshot Sample Activity */
            <div className="sd-activity-row">
              <div className="sd-activity-left">
                <span className="sd-activity-dot" />
                <div className="sd-activity-meta">
                  <span className="sd-activity-title">—</span>
                  <span className="sd-activity-desc">qr</span>
                </div>
              </div>
              <div className="sd-activity-right">
                <span className="sd-status-badge present">present</span>
                <span className="sd-activity-time">19/05/26, 5:46 am</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: ATTENDANCE
// ═══════════════════════════════════════════════════════════
function TabAttendance({ attData }) {
  const { courses, totalAttended, totalClasses, overallPct, loading } = attData
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? courses : courses.filter(c => {
    const p = pct(c)
    if (filter === 'safe')    return p >= 85
    if (filter === 'warning') return p >= 75 && p < 85
    if (filter === 'risk')    return p < 75
    return true
  })

  if (loading) return <div className="sd-tab-content"><p style={{color:'var(--sd-muted)'}}>Loading attendance data…</p></div>
  if (courses.length === 0) return (
    <div className="sd-tab-content">
      <p style={{color:'var(--sd-muted)', padding:'2rem 0', textAlign:'center'}}>📭 No attendance records yet.<br/>Mark your first attendance using the Scanner tab!</p>
    </div>
  )

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">📊 My Attendance</h2>
          <p className="sd-section-sub">Semester-wide attendance breakdown per course</p>
        </div>
        <div className="sd-filter-pills">
          {[
            { v: 'all', label: 'All', color: '' },
            { v: 'safe', label: '✅ Safe (≥85%)', color: '#34d399' },
            { v: 'warning', label: '⚠️ Warning', color: '#fbbf24' },
            { v: 'risk', label: '🚨 Risk (<75%)', color: '#f87171' },
          ].map(f => (
            <button
              key={f.v}
              id={`att-filter-${f.v}`}
              className={`sd-pill ${filter === f.v ? 'active' : ''}`}
              style={filter === f.v && f.color ? { background: `${f.color}22`, color: f.color, borderColor: `${f.color}55` } : {}}
              onClick={() => setFilter(f.v)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="sd-attend-summary-row">
        <StatCard icon="📊" label="Overall" value={`${overallPct}%`} sub={`${totalAttended}/${totalClasses}`} color="#a78bfa" />
        <StatCard icon="✅" label="Safe courses"    value={courses.filter(c => pct(c) >= 85).length} sub="≥ 85%"  color="#34d399" />
        <StatCard icon="⚠️" label="Warning courses" value={courses.filter(c => pct(c) >= 75 && pct(c) < 85).length} sub="75–84%" color="#fbbf24" />
        <StatCard icon="🚨" label="Risk courses"    value={courses.filter(c => pct(c) < 75).length} sub="< 75%"  color="#f87171" />
      </div>

      {/* Course cards */}
      <div className="sd-attend-cards">
        {filtered.map(c => {
          const p = pct(c)
          const safe = Math.max(0, Math.ceil((0.75 * c.total - c.attended)))
          const canMiss = Math.max(0, Math.floor(c.total - c.attended - (0.25 * (c.total + 10))))
          const color = pctColor(p)
          return (
            <div key={c.id} className="sd-attend-card" style={{ '--ccolor': c.color }}>
              <div className="sd-attend-card-top">
                <div>
                  <span className="sd-course-code" style={{ color: c.color }}>{c.id}</span>
                  <h4 className="sd-attend-card-name">{c.name}</h4>
                  <span className="sd-attend-faculty">👨‍🏫 {c.faculty}</span>
                </div>
                <div className="sd-attend-ring-wrap">
                  <svg className="sd-attend-ring" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                    <circle
                      cx="30" cy="30" r="24" fill="none"
                      stroke={color} strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - p / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 30 30)"
                    />
                  </svg>
                  <span className="sd-attend-ring-pct" style={{ color }}>{p}%</span>
                </div>
              </div>

              <div className="sd-attend-bar-wrap">
                <div className="sd-attend-bar-track">
                  <div className="sd-attend-bar-fill" style={{ width: `${p}%`, background: color }} />
                  <div className="sd-attend-bar-min-line" style={{ left: '75%' }} title="75% minimum" />
                </div>
                <span className="sd-attend-bar-label">{c.attended} / {c.total} classes attended</span>
              </div>

              <div className="sd-attend-card-footer">
                {p >= 75 ? (
                  <span style={{ color: '#34d399', fontSize: '0.78rem' }}>
                    ✅ Can afford to miss ~{Math.max(0, Math.floor(c.attended - 0.75 * c.total + (c.total - c.attended)))} more class(es)
                  </span>
                ) : (
                  <span style={{ color: '#f87171', fontSize: '0.78rem' }}>
                    🚨 Need {safe} more class(es) to reach 75%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: SCANNER (2-Step Attendance Verification)
// ═══════════════════════════════════════════════════════════
function TabScanner({ user }) {
  const [step, setStep] = useState(1)

  return (
    <div className="sd-tab-content">
      {/* ── Page Heading ─────────────────────────────────── */}
      <div className="sd-verify-header">
        <div>
          <h1 className="sd-verify-title">2-Step Attendance Verification</h1>
          <p className="sd-verify-subtitle">
            {step === 1
              ? 'Step 1: Verify your identity using facial recognition'
              : 'Step 2: Scan the session QR code to mark attendance'}
          </p>
        </div>
        <div className="sd-ellipse-wrap" style={{ marginTop: '6px' }}>
          <BrandEllipse width={65} height={38} color="#758087" />
        </div>
      </div>
      <hr className="sd-verify-divider" />

      {/* ── Two-Step Progress Indicator ───────────────────── */}
      <div className="sd-stepper">
        <div className="sd-stepper-steps">
          <div className="sd-step-item">
            <span className={`sd-step-num ${step === 1 ? 'active' : 'completed'}`}>
              {step > 1 ? '✓' : '1'}
            </span>
            <span className={`sd-step-label ${step === 1 ? 'active' : ''}`}>Face</span>
          </div>

          <span className="sd-step-line" />

          <div className="sd-step-item">
            <span className={`sd-step-num ${step === 2 ? 'active' : 'inactive'}`}>
              2
            </span>
            <span className={`sd-step-label ${step === 2 ? 'active' : 'inactive'}`}>QR Code</span>
          </div>
        </div>

        <div className="sd-stepper-note">
          {step === 1
            ? 'Face verification required before QR scanning'
            : 'Face verified. Point camera at session QR code'}
        </div>
      </div>

      {/* Session lock banner — shown when QR session is active */}
      <SessionLockBanner />

      {step === 1 ? (
        <ScannerFaceContent user={user} onVerified={() => setStep(2)} />
      ) : (
        <ScannerQRContent user={user} onReset={() => setStep(1)} />
      )}
    </div>
  )
}

// ─── Session Lock Banner ──────────────────────────────────────────────────────
function SessionLockBanner() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('active_qr_session') || 'null') } catch { return null }
  })
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const check = () => {
      try {
        const s = JSON.parse(localStorage.getItem('active_qr_session') || 'null')
        setSession(s)
        if (s?.expiresAt) {
          const left = Math.max(0, Math.ceil((s.expiresAt - Date.now()) / 1000))
          setTimeLeft(left)
        }
      } catch { setSession(null) }
    }
    check()
    const id = setInterval(check, 1000)
    return () => clearInterval(id)
  }, [])

  if (!session) return null

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  return (
    <div style={{
      background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(251,191,36,0.1))',
      border: '1px solid rgba(239,68,68,0.4)',
      borderRadius: 12, padding: '0.75rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'
    }}>
      <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
        <span style={{fontSize:'1.4rem', animation:'pulse 1s infinite'}}>🔴</span>
        <div>
          <div style={{fontWeight:700, color:'#fbbf24', fontSize:'0.95rem'}}>🔒 QR Session Active — You are LOCKED IN</div>
          <div style={{fontSize:'0.8rem', color:'rgba(255,255,255,0.6)'}}>
            Course: <strong>{session.course_id || '—'}</strong> · Do NOT leave this page!
          </div>
        </div>
      </div>
      {timeLeft !== null && (
        <div style={{
          background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.5)',
          borderRadius:8, padding:'0.4rem 0.9rem', fontWeight:700,
          color: timeLeft < 10 ? '#f87171' : '#fbbf24', fontFamily:'monospace', fontSize:'1.1rem'
        }}>
          ⏱ {fmt(timeLeft)}
        </div>
      )}
    </div>
  )
}

function ScannerQRContent({ user }) {
  const [scanning, setScanning]   = useState(false)
  const [result, setResult]       = useState(null)
  const [resultMsg, setMsg]       = useState('')
  const [manualCode, setManual]   = useState('')
  const [history, setHistory]     = useState([])
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef   = useRef(null)
  const canvasRef  = useRef(null)
  const streamRef  = useRef(null)
  const rafRef     = useRef(null)
  const jsQRRef    = useRef(null)

  // Load jsQR from CDN as fallback
  useEffect(() => {
    if (!window.jsQR) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
      script.onload = () => { jsQRRef.current = window.jsQR }
      document.head.appendChild(script)
    } else {
      jsQRRef.current = window.jsQR
    }
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setCameraActive(false)
    setScanning(false)
  }

  useEffect(() => () => stopCamera(), [])

  const submitTokenToBackend = async (code) => {
    stopCamera()
    setScanning(true)
    setResult(null)
    setMsg('⏳ Submitting attendance...')
    try {
      const formData = new FormData()
      formData.append("token", code)
      formData.append("student_id", user?.email || "mock_student@smartattend.com")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/qr`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Invalid QR Code")
      }

      const data = await res.json()
      setResult('success')
      setMsg(`✅ Attendance marked successfully for ${data.course_id || 'Class'}!`)
      setHistory(prev => [
        { id: Date.now(), course: data.course_id || '—', time: 'Just now', status: 'success' },
        ...prev,
      ])
    } catch(err) {
      setResult('error')
      if (err.name === 'AbortError') {
        setMsg('⏱️ Request timed out. Please try again.')
      } else {
        setMsg(err.message)
      }
    } finally {
      setScanning(false)
    }
  }

  const tickScan = useCallback(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tickScan)
      return
    }
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0)

    let decoded = null

    // Try BarcodeDetector first (fast, native on Android Chrome)
    if ('BarcodeDetector' in window) {
      new window.BarcodeDetector({ formats: ['qr_code'] })
        .detect(canvas)
        .then(codes => {
          if (codes.length > 0 && codes[0].rawValue) {
            submitTokenToBackend(codes[0].rawValue)
          } else {
            rafRef.current = requestAnimationFrame(tickScan)
          }
        })
        .catch(() => {
          rafRef.current = requestAnimationFrame(tickScan)
        })
      return
    }

    // Fallback: jsQR
    if (jsQRRef.current) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      decoded = jsQRRef.current(imageData.data, canvas.width, canvas.height)
      if (decoded?.data) {
        submitTokenToBackend(decoded.data)
        return
      }
    }

    rafRef.current = requestAnimationFrame(tickScan)
  }, [user])

  const startCamera = async () => {
    setResult(null)
    setMsg('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
      rafRef.current = requestAnimationFrame(tickScan)
    } catch(err) {
      setResult('error')
      setMsg('❌ Camera access denied. Please allow camera access and try again.')
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    submitTokenToBackend(manualCode.trim())
    setManual('')
  }

  return (
    <>
      <div className="sd-qr-layout">
        {/* Scanner area */}
        <div className="sd-card sd-scanner-card">
          <h3 className="sd-card-title">📸 QR Code Scanner</h3>
          <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--sd-green-lt)', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            <span>✅</span> Identity Verified! Point camera at the QR code on the teacher's screen.
          </div>

          {/* Live camera viewfinder */}
          <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '1', marginBottom: '1rem' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Scanning overlay with corners */}
            {cameraActive && !result && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: '65%', height: '65%', position: 'relative' }}>
                  {['tl','tr','bl','br'].map(c => (
                    <div key={c} style={{
                      position: 'absolute',
                      width: 28, height: 28,
                      borderColor: '#34d399',
                      borderStyle: 'solid',
                      borderWidth: 0,
                      ...(c === 'tl' ? { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderRadius: '4px 0 0 0' } :
                          c === 'tr' ? { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderRadius: '0 4px 0 0' } :
                          c === 'bl' ? { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderRadius: '0 0 0 4px' } :
                                       { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderRadius: '0 0 4px 0' })
                    }} />
                  ))}
                  <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0,
                    height: 2, background: 'rgba(52,211,153,0.8)',
                    animation: 'sd-laser 2s linear infinite',
                    boxShadow: '0 0 6px #34d399'
                  }} />
                </div>
                <p style={{ position: 'absolute', bottom: 12, color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>🔍 Scanning...</p>
              </div>
            )}

            {/* Success / Error result overlays */}
            {result === 'success' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '3rem' }}>✅</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>Attendance Marked!</span>
              </div>
            )}
            {result === 'error' && !cameraActive && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '3rem' }}>❌</span>
              </div>
            )}

            {/* Idle state when camera not active */}
            {!cameraActive && !result && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '3rem' }}>📷</span>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Tap below to open camera</span>
              </div>
            )}
          </div>

          {result && resultMsg && (
            <div className={`sd-result-banner ${result}`}>
              <span>{resultMsg}</span>
            </div>
          )}

          <div className="sd-scanner-actions">
            {!cameraActive ? (
              <button
                id="start-scan-btn"
                className="sd-primary-btn sd-btn-full"
                onClick={startCamera}
                disabled={scanning}
              >
                <span>📷</span> {result ? 'Scan Again' : 'Open Camera & Scan QR'}
              </button>
            ) : (
              <button
                id="stop-scan-btn"
                className="sd-primary-btn sd-btn-full"
                onClick={stopCamera}
                style={{ background: 'var(--sd-red, #ef4444)' }}
              >
                ✖ Stop Camera
              </button>
            )}
          </div>

          <div className="sd-divider"><span>or enter token manually</span></div>

          <form id="manual-code-form" onSubmit={handleManualSubmit} className="sd-manual-form">
            <input
              id="manual-code-input"
              className="sd-input"
              placeholder="Paste the QR token here..."
              value={manualCode}
              onChange={e => setManual(e.target.value)}
            />
            <button id="manual-submit-btn" type="submit" className="sd-primary-btn" disabled={scanning}>Submit</button>
          </form>
        </div>

        {/* Info + History */}
        <div className="sd-qr-right">
          <div className="sd-card">
            <h3 className="sd-card-title">ℹ️ How it works</h3>
            <ol className="sd-how-list">
              <li><span>1</span> Your faculty generates a timed QR session in class</li>
              <li><span>2</span> Click <strong>Start Scanning</strong> to open the camera</li>
              <li><span>3</span> Point at the QR code displayed by your faculty</li>
              <li><span>4</span> Your attendance is instantly marked ✅</li>
            </ol>
            <div className="sd-info-note">⏱️ QR sessions are time-limited — scan before time runs out!</div>
          </div>

          <div className="sd-card">
            <h3 className="sd-card-title">📋 Recent Scans</h3>
            {history.length === 0 ? (
              <p style={{ color: 'var(--sd-muted)', fontSize: '0.83rem' }}>No scans yet.</p>
            ) : (
              <div className="sd-scan-history">
                {history.map(h => (
                  <div key={h.id} className="sd-scan-hist-item">
                    <span className={`sd-badge sd-badge-${h.status === 'success' ? 'present' : 'absent'}`}>
                      {h.status === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="sd-scan-hist-body">
                      <span className="sd-course-code-sm">{h.course}</span>
                      <span className="sd-scan-hist-time">{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════
//  SCANNER: FACE CONTENT
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
//  SCANNER: FACE CONTENT WITH ANTI-SPOOFING & LIVENESS SHIELD
// ═══════════════════════════════════════════════════════════
const LIVENESS_CHALLENGES = [
  { type: 'blink', prompt: 'Blink your eyes naturally', hint: 'Look straight at the webcam and blink 1–2 times' },
  { type: 'turn_head', prompt: 'Turn your head slightly', hint: 'Slowly turn your face left or right' },
  { type: 'smile', prompt: 'Smile naturally for the camera', hint: 'Give a clear, natural smile towards the webcam' }
]

function ScannerFaceContent({ user, onVerified }) {
  const [phase, setPhase]                 = useState('idle') // idle | aligning | challenging | verifying | success | error
  const [challengeIdx, setChallengeIdx]   = useState(0)
  const [motionProgress, setProgress]     = useState(0)
  const [resultMsg, setMsg]               = useState('')
  const [stream, setStream]               = useState(null)
  const [history, setHistory]             = useState([
    { id: 1, method: 'Face Recognition', time: 'Today, 11:02 AM', status: 'success' },
    { id: 2, method: 'Face Recognition', time: '13 Apr, 2:00 PM', status: 'success' },
  ])

  const videoRef        = useRef(null)
  const canvasRef       = useRef(null)
  const motionCanvasRef = useRef(null)
  const prevFrameRef    = useRef(null)
  const baselineBlobRef = useRef(null)
  const animFrameRef    = useRef(null)
  const timerRef        = useRef(null)

  const currentChallenge = LIVENESS_CHALLENGES[challengeIdx]

  const switchChallenge = (e) => {
    if (e) e.stopPropagation()
    if (phase === 'verifying') return
    const nextIdx = (challengeIdx + 1) % LIVENESS_CHALLENGES.length
    setChallengeIdx(nextIdx)
    setProgress(0)
    if (phase === 'challenging' || phase === 'aligning') {
      setMsg(`Action switched to: ${LIVENESS_CHALLENGES[nextIdx].prompt}`)
    }
  }

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } 
      })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
      setPhase('idle')
      setMsg('')
    } catch (err) {
      setPhase('error')
      setMsg("Camera access denied: Permission denied")
    }
  }

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Helper to grab a high-res JPEG blob from the current video frame
  const captureFrameBlob = () => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) return resolve(null)
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    })
  }

  // Real-time Motion & Liveness Tracker
  const runLivenessMotionLoop = () => {
    if (!motionCanvasRef.current || !videoRef.current) return
    const mCanvas = motionCanvasRef.current
    const mCtx = mCanvas.getContext('2d', { willReadFrequently: true })
    const video = videoRef.current

    mCanvas.width = 160
    mCanvas.height = 120

    let currentAccumulated = 0
    let loopRunning = true

    const checkFrame = async () => {
      if (!loopRunning) return

      try {
        if (video.readyState >= 2) {
          mCtx.drawImage(video, 0, 0, 160, 120)
          const imgData = mCtx.getImageData(0, 0, 160, 120)
          const data = imgData.data

          if (prevFrameRef.current) {
            const prevData = prevFrameRef.current
            let diffSum = 0
            for (let i = 0; i < data.length; i += 16) {
              const rDiff = Math.abs(data[i] - prevData[i])
              const gDiff = Math.abs(data[i + 1] - prevData[i + 1])
              const bDiff = Math.abs(data[i + 2] - prevData[i + 2])
              diffSum += (rDiff + gDiff + bDiff) / 3
            }
            const meanPixelDelta = diffSum / (data.length / 16)

            if (meanPixelDelta > 2.0 && meanPixelDelta < 40.0) {
              currentAccumulated += Math.min(25, meanPixelDelta * 3.5)
              setProgress(Math.min(100, Math.round(currentAccumulated)))

              if (currentAccumulated >= 100) {
                loopRunning = false
                await completeLivenessVerification()
                return
              }
            } else if (meanPixelDelta <= 0.8) {
              currentAccumulated = Math.max(0, currentAccumulated - 1)
              setProgress(Math.round(currentAccumulated))
            }
          }
          prevFrameRef.current = new Uint8ClampedArray(data)
        }
      } catch (e) {
        // Continue tracking loop
      }

      animFrameRef.current = setTimeout(() => {
        requestAnimationFrame(checkFrame)
      }, 100)
    }

    requestAnimationFrame(checkFrame)
  }

  // Start the interactive Liveness Flow
  const startLivenessFlow = async () => {
    if (!videoRef.current) return
    setPhase('aligning')
    setProgress(0)
    setMsg('Align your face inside the biometric reticle...')
    prevFrameRef.current = null

    timerRef.current = setTimeout(async () => {
      const baselineBlob = await captureFrameBlob()
      if (!baselineBlob) {
        setPhase('error')
        setMsg('Could not access camera frame.')
        return
      }
      baselineBlobRef.current = baselineBlob

      setPhase('challenging')
      setMsg(`${currentChallenge.prompt}!`)
      runLivenessMotionLoop()
    }, 700)
  }

  // Complete Liveness and send frames to backend
  const completeLivenessVerification = async () => {
    setPhase('verifying')
    setMsg('Biometric Verification in progress...')

    try {
      const challengeBlob = await captureFrameBlob()
      if (!challengeBlob || !baselineBlobRef.current) {
        throw new Error('Could not capture liveness motion frames.')
      }

      const formData = new FormData()
      formData.append("file", baselineBlobRef.current, "baseline_face.jpg")
      formData.append("challenge_file", challengeBlob, "challenge_face.jpg")
      formData.append("challenge_type", currentChallenge.type)
      formData.append("student_id", user?.email || "mock_student@smartattend.com")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)

      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/verify-only`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Face verification failed.")
      }

      setPhase('success')
      setMsg(data.detail || 'Identity verified! Moving to QR Step...')

      setHistory(prev => [
        { id: Date.now(), method: 'Face Recognition', time: 'Just now', status: 'success' },
        ...prev
      ])

      stopCamera()

      setTimeout(() => {
        if (onVerified) onVerified()
      }, 1200)
    } catch (err) {
      setPhase('error')
      if (err.name === 'AbortError') {
        setMsg('Server timeout. Please try again.')
      } else {
        setMsg(err.message)
      }
    }
  }

  // Fallback photo upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPhase('verifying')
    setMsg('Analyzing uploaded photo against Biometric models...')

    try {
      const formData = new FormData()
      formData.append("file", file, "face.jpg")
      formData.append("student_id", user?.email || "mock_student@smartattend.com")

      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/verify-only`, {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Face verification failed")

      setPhase('success')
      setMsg(data.detail || 'Identity verified! Moving to QR Step...')
      setTimeout(() => { if (onVerified) onVerified() }, 1200)
    } catch (err) {
      setPhase('error')
      setMsg(err.message)
    }
  }

  const handleActionClick = () => {
    if (!stream || phase === 'error') {
      startCamera()
    } else {
      startLivenessFlow()
    }
  }

  // Determine reticle outline stroke color
  const reticleStrokeColor = (!stream || phase === 'error')
    ? '#C3665B'
    : (phase === 'success' || phase === 'challenging')
    ? '#557E6D'
    : phase === 'aligning'
    ? '#B5822C'
    : '#758087'

  return (
    <div className="sd-verify-grid">
      {/* ── Left Column: Facial Verification Panel ────────────── */}
      <div className="sd-card sd-facial-card">
        {/* Liveness Shield Header */}
        <div className="sd-shield-header">
          <div className="sd-shield-title-wrap">
            <div className="sd-shield-title">
              <ShieldCheckIcon size={16} color="#557E6D" />
              <span>Liveness Shield™</span>
            </div>
            <span className="sd-shield-status">Active</span>
          </div>
          <span className="sd-shield-badge">ANTI-SPOOFING V2</span>
        </div>
        <hr className="sd-shield-divider" />

        {/* Dynamic Liveness Instruction Box */}
        <div className="sd-instruction-box">
          <div className="sd-instruction-left">
            <span className="sd-instruction-icon">
              {currentChallenge.type === 'blink' ? (
                <EyeIcon size={20} color="#162F44" />
              ) : currentChallenge.type === 'smile' ? (
                <SmileIcon size={20} color="#162F44" />
              ) : (
                <HeadTurnIcon size={20} color="#162F44" />
              )}
            </span>
            <div>
              <div className="sd-instruction-heading">{currentChallenge.prompt}</div>
              <div className="sd-instruction-hint">{currentChallenge.hint}</div>
            </div>
          </div>
          <button
            type="button"
            className="sd-switch-btn"
            onClick={switchChallenge}
            disabled={phase === 'verifying'}
            title="Switch to another action"
          >
            <RefreshIcon size={13} color="#162F44" />
            <span>Switch Action</span>
          </button>
        </div>

        {/* Circular Camera Preview Region */}
        <div className="sd-camera-circle">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="sd-camera-video"
            />
          ) : (
            <div className="sd-camera-no-access">
              <CameraOffIcon size={32} color="#758087" />
              <span className="sd-no-access-text">No Camera Access</span>
              <label className="sd-upload-photo-btn">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={phase === 'verifying'}
                />
              </label>
            </div>
          )}

          {/* Hidden canvases for liveness motion & image capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <canvas ref={motionCanvasRef} style={{ display: 'none' }} />

          {/* Tall Elliptical Face Guide (190px × 245px) */}
          <svg className="sd-reticle-svg" viewBox="0 0 293 293">
            <ellipse
              cx="146.5"
              cy="146.5"
              rx="95"
              ry="122.5"
              fill="none"
              stroke={reticleStrokeColor}
              strokeWidth="1.5"
              strokeDasharray={phase === 'aligning' ? '4 3' : 'none'}
            />
          </svg>

          {/* Active motion progress overlay */}
          {phase === 'challenging' && (
            <div className="sd-motion-overlay">
              <div className="sd-motion-track">
                <div className="sd-motion-fill" style={{ width: `${motionProgress}%` }} />
              </div>
              <span className="sd-motion-label">{motionProgress}% verified</span>
            </div>
          )}
        </div>

        {/* Camera Error Alert in denied-camera state */}
        {(!stream || phase === 'error') && (
          <div className="sd-camera-alert">
            <AlertCircleIcon size={18} color="#C3665B" />
            <span>Camera access denied: Permission denied</span>
          </div>
        )}

        {/* Retry / Action Button */}
        <button
          id="liveness-retry-btn"
          className="sd-retry-btn"
          onClick={handleActionClick}
          disabled={phase === 'verifying'}
        >
          <ShieldCheckIcon size={17} color="#ffffff" />
          <span>
            {phase === 'verifying'
              ? 'Verifying Liveness…'
              : (!stream || phase === 'error')
              ? 'Retry Liveness Verification'
              : 'Start Liveness Verification'}
          </span>
        </button>
      </div>

      {/* ── Right Column: Anti-Spoofing & History ──────────────── */}
      <div className="sd-verify-right">
        {/* Anti-Spoofing Protection Panel */}
        <div className="sd-card sd-anti-spoof-card">
          <h2 className="sd-verify-panel-title">
            <ShieldCheckIcon size={20} color="#162F44" />
            <span>Anti-Spoofing Protection</span>
          </h2>

          <div className="sd-instructions-list">
            <div className="sd-instruction-row">
              <span className="sd-instruction-badge">1</span>
              <span className="sd-instruction-text">
                Click <strong>Start Liveness Verification</strong>
              </span>
            </div>
            <div className="sd-instruction-row">
              <span className="sd-instruction-badge">2</span>
              <span className="sd-instruction-text">
                Align your face inside the biometric reticle
              </span>
            </div>
            <div className="sd-instruction-row">
              <span className="sd-instruction-badge">3</span>
              <span className="sd-instruction-text">
                Complete the dynamic action (<strong>Blink</strong>, <strong>Turn Head</strong>, or <strong>Smile</strong>)
              </span>
            </div>
            <div className="sd-instruction-row">
              <span className="sd-instruction-badge">4</span>
              <span className="sd-instruction-text">
                AI verifies both live biometric motion and facial identity
              </span>
            </div>
          </div>

          <hr className="sd-panel-divider" style={{ margin: '18px 0 16px 0' }} />

          <div className="sd-guarantee">
            <LockIcon size={15} color="#758087" />
            <span>
              <strong>Anti-Spoofing Guarantee:</strong> Static photographs, mobile screen replays, and printed pictures are strictly rejected.
            </span>
          </div>
        </div>

        {/* Verification History Panel */}
        <div className="sd-card sd-history-card">
          <h2 className="sd-verify-panel-title">
            <ClipboardListIcon size={20} color="#162F44" />
            <span>Verification History</span>
          </h2>
          <hr className="sd-panel-divider" style={{ margin: '16px 0 0 0' }} />
          <div className="sd-history-list">
            {history.length === 0 ? (
              <div className="sd-history-empty">
                <ClipboardListIcon size={22} color="#758087" />
                <span>No verification history recorded yet.</span>
              </div>
            ) : (
              history.map(item => (
                <div key={item.id} className="sd-history-row">
                  <div className="sd-history-left">
                    <CheckCircleIcon size={18} color="#557E6D" />
                  </div>
                  <div className="sd-history-meta">
                    <span className="sd-history-method">{item.method}</span>
                    <span className="sd-history-time">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: CLASSES
// ═══════════════════════════════════════════════════════════
function TabClasses() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">📚 My Classes</h2>
          <p className="sd-section-sub">All enrolled courses for this semester</p>
        </div>
        <span className="sd-role-badge">{COURSES.length} Courses</span>
      </div>

      <div className="sd-classes-grid">
        {COURSES.map(c => {
          const p = pct(c)
          const color = pctColor(p)
          const isSelected = selected === c.id
          return (
            <div
              key={c.id}
              id={`class-${c.id}`}
              className={`sd-class-card ${isSelected ? 'selected' : ''}`}
              style={{ '--ccolor': c.color }}
              onClick={() => setSelected(isSelected ? null : c.id)}
            >
              <div className="sd-class-card-header">
                <div className="sd-class-dot" style={{ background: c.color }} />
                <span className="sd-course-code" style={{ color: c.color }}>{c.id}</span>
                <span className={`sd-badge sd-badge-${p >= 85 ? 'present' : p >= 75 ? 'late' : 'absent'}`}>{p}%</span>
              </div>
              <h4 className="sd-class-name">{c.name}</h4>
              <p className="sd-class-faculty">👨‍🏫 {c.faculty}</p>
              <p className="sd-class-schedule">🕐 {c.schedule}</p>
              <p className="sd-class-room">📍 {c.room}</p>

              <div className="sd-class-progress-wrap">
                <div className="sd-mini-bar-track">
                  <div className="sd-mini-bar-fill" style={{ width: `${p}%`, background: color }} />
                </div>
                <span style={{ fontSize: '0.75rem', color }}>{c.attended}/{c.total} classes</span>
              </div>

              {isSelected && (
                <div className="sd-class-detail-expand">
                  <div className="sd-class-detail-row"><span>Attended</span><strong>{c.attended}</strong></div>
                  <div className="sd-class-detail-row"><span>Total</span><strong>{c.total}</strong></div>
                  <div className="sd-class-detail-row"><span>Absent</span><strong>{c.total - c.attended}</strong></div>
                  <div className="sd-class-detail-row">
                    <span>Status</span>
                    <strong style={{ color }}>
                      {p >= 85 ? '✅ Safe' : p >= 75 ? '⚠️ Warning' : '🚨 At Risk'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Today's timetable */}
      <div className="sd-card">
        <h3 className="sd-card-title">🗓️ Today's Timetable</h3>
        <div className="sd-timetable">
          {TODAY_SCHEDULE.map((s, i) => (
            <div key={i} className={`sd-timetable-row ${s.status}`}>
              <div className="sd-tt-time">{s.time}</div>
              <div className="sd-tt-line">
                <div className="sd-tt-dot" style={{ background: s.status === 'done' ? '#34d399' : '#a78bfa' }} />
                {i < TODAY_SCHEDULE.length - 1 && <div className="sd-tt-vline" />}
              </div>
              <div className="sd-tt-body">
                <span className="sd-tt-name">{s.name}</span>
                <span className="sd-tt-meta">{s.course} · {s.room}</span>
              </div>
              <span className={`sd-badge ${s.status === 'done' ? 'sd-badge-present' : 'sd-badge-upcoming'}`}>
                {s.status === 'done' ? '✅ Done' : '🕐 Upcoming'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: TIMETABLE
// ═══════════════════════════════════════════════════════════
function TabTimetable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'];
  
  const schedule = {
    'Monday': { '9:00 AM': 'CS101', '2:00 PM': 'CS312' },
    'Tuesday': { '11:00 AM': 'CS205' },
    'Wednesday': { '9:00 AM': 'CS101', '2:00 PM': 'CS312' },
    'Thursday': { '10:00 AM': 'CS510', '11:00 AM': 'CS205' },
    'Friday': { '9:00 AM': 'CS101', '3:00 PM': 'CS420' },
  };

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">📅 Weekly Timetable</h2>
          <p className="sd-section-sub">Your class schedule for the semester</p>
        </div>
      </div>
      <div className="sd-card sd-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="sd-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Time</th>
              {days.map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {times.map(t => (
              <tr key={t}>
                <td style={{ fontWeight: '600', color: 'var(--sd-muted)', whiteSpace: 'nowrap' }}>{t}</td>
                {days.map(d => {
                  const courseId = schedule[d]?.[t];
                  const course = COURSES.find(c => c.id === courseId);
                  return (
                    <td key={d + t} style={{ padding: course ? '8px' : '1rem', textAlign: course ? 'left' : 'center' }}>
                      {course ? (
                        <div style={{ background: `${course.color}15`, borderLeft: `3px solid ${course.color}`, padding: '0.75rem', borderRadius: '4px' }}>
                          <div style={{ color: course.color, fontWeight: '700', fontSize: '0.8rem', marginBottom: '4px' }}>{course.id}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '2px', lineHeight: '1.2' }}>{course.name}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>📍 {course.room}</div>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.2 }}>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: ASSIGNMENTS (read-only — posted by faculty)
// ═══════════════════════════════════════════════════════════
function TabStudentAssignments() {
  const API = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')

  useEffect(() => {
    fetch(`${API}/assignments/`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setAssignments(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const filtered = assignments.filter(a => {
    const due = a.due_date || a.dueDate
    if (filter === 'active') return !due || new Date(due) >= now
    if (filter === 'past')   return due && new Date(due) < now
    return true
  })
  const isOverdue = (a) => { const d = a.due_date || a.dueDate; return d && new Date(d) < now }

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">📝 Assignments</h2>
          <p className="sd-section-sub">Assignments posted by your faculty</p>
        </div>
        <div className="sd-filter-pills">
          {['all','active','past'].map(f => (
            <button key={f} id={`asgn-filter-${f}`}
              className={`sd-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f === 'active' ? '✅ Active' : '⏰ Past Due'}
            </button>
          ))}
        </div>
      </div>

      {loading && <p style={{color:'var(--sd-muted)', padding:'1rem 0'}}>Loading assignments…</p>}

      {!loading && assignments.length === 0 && (
        <div className="sd-card" style={{textAlign:'center', padding:'3rem'}}>
          <div style={{fontSize:'3rem', marginBottom:'0.75rem'}}>📭</div>
          <p style={{color:'var(--sd-muted)'}}>No assignments yet. Your faculty hasn't posted any.</p>
        </div>
      )}

      {!loading && filtered.length === 0 && assignments.length > 0 && (
        <div className="sd-card" style={{textAlign:'center', padding:'2rem', color:'var(--sd-muted)'}}>
          No assignments match this filter.
        </div>
      )}

      <div style={{display:'grid', gap:'1rem'}}>
        {filtered.map(a => {
          const due    = a.due_date || a.dueDate
          const posted = a.created_at || a.createdAt
          const overdue = isOverdue(a)
          return (
            <div key={a._id} className="sd-card" style={{
              borderLeft: `4px solid ${overdue ? '#f87171' : '#34d399'}`,
              padding: '1.25rem'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.5rem'}}>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap'}}>
                  <span style={{background:'rgba(167,139,250,0.15)', color:'#a78bfa', borderRadius:6, padding:'2px 10px', fontSize:'0.8rem', fontWeight:700}}>{a.course}</span>
                  {overdue
                    ? <span style={{background:'rgba(248,113,113,0.15)', color:'#f87171', borderRadius:6, padding:'2px 8px', fontSize:'0.75rem', fontWeight:600}}>⏰ PAST DUE</span>
                    : due
                      ? <span style={{background:'rgba(52,211,153,0.15)', color:'#34d399', borderRadius:6, padding:'2px 8px', fontSize:'0.75rem', fontWeight:600}}>✅ ACTIVE</span>
                      : <span style={{background:'rgba(96,165,250,0.15)', color:'#60a5fa', borderRadius:6, padding:'2px 8px', fontSize:'0.75rem', fontWeight:600}}>📌 ONGOING</span>
                  }
                </div>
                {a.marks && (
                  <span style={{fontWeight:700, color:'#fbbf24'}}>🏆 {a.marks} Marks</span>
                )}
              </div>

              <h3 style={{margin:'0 0 0.4rem', fontSize:'1.05rem', fontWeight:700}}>{a.title}</h3>

              {a.description && (
                <p style={{fontSize:'0.88rem', color:'var(--sd-muted)', margin:'0 0 0.75rem', lineHeight:1.5}}>
                  {a.description}
                </p>
              )}

              <div style={{display:'flex', gap:'1.5rem', fontSize:'0.82rem', color:'var(--sd-muted)', flexWrap:'wrap'}}>
                {due && (
                  <span style={{color: overdue ? '#f87171' : 'inherit'}}>
                    📅 Due: <strong>{new Date(due).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong>
                  </span>
                )}
                {a.faculty && <span>👨‍🏫 By: <strong>{a.faculty}</strong></span>}
                {posted && <span>🕒 Posted: {new Date(posted).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: BILLS & PAYMENTS
// ═══════════════════════════════════════════════════════════
function TabBills() {
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_student_bills')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    
    // Default seeded bills
    return [
      { id: 'tuition_2026', title: 'Tuition Fee (Spring Semester 2026)', category: 'Academic', amount: 75000, status: 'unpaid', icon: '🎓', dueDate: '2026-06-15', description: 'Regular academic tuition fees for computer science courses.' },
      { id: 'hostel_2026', title: 'Hostel Rent & Mess Charges', category: 'Hostel', amount: 32000, status: 'unpaid', icon: '🏢', dueDate: '2026-06-01', description: 'Accommodation charges including high-speed internet & mess meal plans.' },
      { id: 'exam_2026', title: 'Semester Examination Registration Fee', category: 'Exams', amount: 4500, status: 'unpaid', icon: '📝', dueDate: '2026-05-25', description: 'Registration fees for final end-semester theoretical & lab examinations.' },
      { id: 'lib_fine_2026', title: 'Library Late Book Return Fine', category: 'Library', amount: 350, status: 'paid', icon: '📚', dueDate: '2026-05-10', description: 'Overdue charges for "Introduction to Algorithms" book kept for 14 extra days.', paidOn: '2026-05-12T14:32:00Z', method: 'UPI' }
    ]
  })

  const [activeBill, setActiveBill] = useState(null)
  const [payMethod, setPayMethod]   = useState('card') // 'card' | 'upi' | 'net'
  const [paymentState, setPaymentState] = useState('idle') // 'idle' | 'processing' | 'success'

  // Card form fields
  const [cardNum, setCardNum] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // UPI fields
  const [upiId, setUpiId] = useState('')

  // Net Banking fields
  const [bank, setBank] = useState('HDFC Bank')

  useEffect(() => {
    localStorage.setItem('sd_student_bills', JSON.stringify(bills))
  }, [bills])

  const openPayment = (bill) => {
    setActiveBill(bill)
    setPaymentState('idle')
    setCardNum('')
    setCardName('')
    setCardExpiry('')
    setCardCvv('')
    setUpiId('')
  }

  const closePayment = () => {
    if (paymentState !== 'processing') {
      setActiveBill(null)
    }
  }

  const handlePaySubmit = (e) => {
    e.preventDefault()
    setPaymentState('processing')

    // Simulate secure mock bank transaction processing
    setTimeout(() => {
      setPaymentState('success')
      setTimeout(() => {
        setBills(prev => prev.map(b => b.id === activeBill.id ? {
          ...b,
          status: 'paid',
          paidOn: new Date().toISOString(),
          method: payMethod.toUpperCase()
        } : b))
        setPaymentState('idle')
        setActiveBill(null)
      }, 1800)
    }, 2200)
  }

  const formatCardNum = (val) => {
    const clear = val.replace(/\D/g, '')
    const parts = clear.match(/.{1,4}/g)
    return parts ? parts.slice(0, 4).join(' ') : clear
  }

  const formatExpiry = (val) => {
    const clear = val.replace(/\D/g, '')
    if (clear.length >= 2) {
      return `${clear.slice(0,2)}/${clear.slice(2,4)}`
    }
    return clear
  }

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">💳 Fees, Bills & Payments</h2>
          <p className="sd-section-sub">Pay tuition fees, exam fees, hostel charges, and clear fines securely</p>
        </div>
      </div>

      <div className="sd-bill-grid">
        {bills.map(b => (
          <div key={b.id} className="sd-bill-card">
            <div className="sd-bill-header">
              <span className="sd-bill-icon">{b.icon}</span>
              <span className={`sd-bill-badge ${b.status}`}>{b.status}</span>
            </div>
            
            <div>
              <div style={{fontSize:'0.75rem', fontWeight:600, color:'var(--sd-accent,#a78bfa)', textTransform:'uppercase', letterSpacing:'1px'}}>{b.category}</div>
              <h3 className="sd-bill-title">{b.title}</h3>
              <p className="sd-bill-description">{b.description}</p>
            </div>

            <div className="sd-bill-amount-row">
              <div>
                <div style={{fontSize:'0.72rem', color:'var(--sd-muted,#888)'}}>Amount Due</div>
                <div className="sd-bill-amount">₹{b.amount.toLocaleString('en-IN')}</div>
              </div>
              
              {b.status === 'unpaid' ? (
                <button className="sd-primary-btn" onClick={() => openPayment(b)}>💳 Pay Now</button>
              ) : (
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:'0.75rem', color:'#34d399', fontWeight:700}}>✅ Paid via {b.method}</div>
                  <div style={{fontSize:'0.68rem', color:'var(--sd-muted)'}}>{new Date(b.paidOn).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Gateway Modal */}
      {activeBill && (
        <div className="sd-pay-overlay">
          <div className="sd-pay-modal">
            {paymentState !== 'processing' && paymentState !== 'success' && (
              <button className="sd-pay-close" onClick={closePayment}>✕</button>
            )}

            {paymentState === 'idle' && (
              <>
                <div>
                  <h2 style={{fontFamily:'var(--font-serif)', fontSize:'1.25rem', fontWeight:700}}>Secure Payment Checkout</h2>
                  <p style={{fontSize:'0.82rem', color:'var(--theme-muted,#888)', marginTop:'0.25rem'}}>
                    Paying for: <strong>{activeBill.title}</strong>
                  </p>
                </div>

                <div style={{background:'rgba(255,255,255,0.03)', padding:'0.85rem', borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{fontSize:'0.85rem', fontWeight:600}}>Total Outstanding Amount:</span>
                  <span style={{fontSize:'1.3rem', fontWeight:850, color:'var(--theme-accent,#a78bfa)', fontFamily:'monospace'}}>₹{activeBill.amount.toLocaleString('en-IN')}</span>
                </div>

                {/* Tab select payment method */}
                <div className="pay-methods">
                  <button className={`pay-method-btn ${payMethod === 'card' ? 'active' : ''}`} onClick={() => setPayMethod('card')}>💳 Card</button>
                  <button className={`pay-method-btn ${payMethod === 'upi' ? 'active' : ''}`} onClick={() => setPayMethod('upi')}>📱 UPI</button>
                  <button className={`pay-method-btn ${payMethod === 'net' ? 'active' : ''}`} onClick={() => setPayMethod('net')}>🏦 NetBanking</button>
                </div>

                <form onSubmit={handlePaySubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                  {/* CARD METHOD */}
                  {payMethod === 'card' && (
                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                      {/* Glass Card preview */}
                      <div className="glass-card-wrapper">
                        <div className="glass-credit-card">
                          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div className="card-chip"></div>
                            <span style={{fontSize:'1.1rem', fontWeight:900, fontStyle:'italic', opacity:0.8}}>VISA</span>
                          </div>
                          <div className="card-num">{cardNum || '•••• •••• •••• ••••'}</div>
                          <div className="card-bottom">
                            <div className="card-holder">{cardName || 'CARDHOLDER NAME'}</div>
                            <div className="card-expiry-wrap">
                              <div className="card-expiry-lbl">VALID THRU</div>
                              <div className="card-expiry-val">{cardExpiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'0.75rem'}}>
                        <input className="sd-input" placeholder="Card Number (16-Digit)" value={cardNum} onChange={e => setCardNum(formatCardNum(e.target.value))} maxLength={19} required />
                        <input className="sd-input" placeholder="Cardholder Name" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} maxLength={26} required />
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem'}}>
                          <input className="sd-input" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} required />
                          <input className="sd-input" type="password" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} maxLength={3} required />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI METHOD */}
                  {payMethod === 'upi' && (
                    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', padding:'0.5rem 0'}}>
                      <div style={{
                        width: '140px', height: '140px',
                        background: '#fff', padding: '10px',
                        borderRadius: '12px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }}>
                        {/* Mock QR Code graphic */}
                        <div style={{width:'100%', height:'100%', border:'2px dashed #000', display:'flex', flexWrap:'wrap', opacity:0.85}}>
                          <div style={{width:'40px', height:'40px', background:'#000', margin:'2px'}}></div>
                          <div style={{flex:1}}></div>
                          <div style={{width:'40px', height:'40px', background:'#000', margin:'2px'}}></div>
                          <div style={{width:'100%', flex:1, display:'flex', justifyContent:'center', alignItems:'center', fontSize:'1.4rem'}}>📱</div>
                          <div style={{width:'40px', height:'40px', background:'#000', margin:'2px'}}></div>
                        </div>
                        {/* Dynamic rotating scanner laser bar */}
                        <div style={{
                          position: 'absolute', left: 0, right: 0,
                          height: '2px', background: 'var(--theme-accent,#34d399)',
                          animation: 'slideUp 1.5s ease-in-out infinite alternate',
                          boxShadow: '0 0 8px var(--theme-accent)'
                        }}></div>
                      </div>
                      <p style={{fontSize:'0.78rem', color:'var(--theme-muted)', textAlign:'center'}}>
                        Scan the dynamic QR code above with any UPI app (GPay, PhonePe, Paytm, BHIM) to make a secure direct transfer.
                      </p>

                      <div style={{width:'100%', height:'1px', background:'rgba(255,255,255,0.08)'}}></div>

                      <div style={{width:'100%', display:'flex', flexDirection:'column', gap:'0.4rem'}}>
                        <label style={{fontSize:'0.75rem', fontWeight:600, color:'var(--theme-muted)'}}>OR ENTER YOUR UPI ID</label>
                        <input className="sd-input" placeholder="e.g. username@upi" value={upiId} onChange={e => setUpiId(e.target.value)} required={payMethod === 'upi'} />
                      </div>
                    </div>
                  )}

                  {/* NET BANKING */}
                  {payMethod === 'net' && (
                    <div style={{display:'flex', flexDirection:'column', gap:'0.5rem', padding:'1rem 0'}}>
                      <label style={{fontSize:'0.78rem', fontWeight:600, color:'var(--theme-muted)'}}>Select Your Bank</label>
                      <select className="sd-select" value={bank} onChange={e => setBank(e.target.value)}>
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                      </select>
                      <p style={{fontSize:'0.75rem', color:'var(--theme-muted)', marginTop:'0.5rem'}}>
                        You will be redirected to your bank's secure page to complete the transaction authorization.
                      </p>
                    </div>
                  )}

                  <button type="submit" className="sd-primary-btn sd-btn-full" style={{marginTop:'0.5rem'}}>
                    🔒 Authorize & Pay ₹{activeBill.amount.toLocaleString('en-IN')}
                  </button>
                </form>
              </>
            )}

            {paymentState === 'processing' && (
              <div className="pay-loader">
                <div className="pay-spinner"></div>
                <div>
                  <h3 style={{fontSize:'1.1rem', fontWeight:700}}>Processing Secure Payment</h3>
                  <p style={{fontSize:'0.82rem', color:'var(--theme-muted)', marginTop:4}}>Do not close this window or reload the page.</p>
                </div>
              </div>
            )}

            {paymentState === 'success' && (
              <div className="pay-loader">
                <div className="pay-success-tick">✓</div>
                <div>
                  <h3 style={{fontSize:'1.25rem', fontWeight:700, color:'#34d399'}}>Payment Successful!</h3>
                  <p style={{fontSize:'0.82rem', color:'var(--theme-muted)', marginTop:4}}>
                    Transaction ref: <code style={{fontFamily:'monospace', color:'var(--theme-accent,#a78bfa)'}}>TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: LOGS
// ═══════════════════════════════════════════════════════════
function TabLogs() {
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQ,      setSearchQ]      = useState('')

  const filtered = LOGS.filter(l => {
    const matchCourse = filterCourse === 'all' || l.course === filterCourse
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    const matchSearch = l.date.toLowerCase().includes(searchQ.toLowerCase()) ||
                        l.course.toLowerCase().includes(searchQ.toLowerCase()) ||
                        l.method.toLowerCase().includes(searchQ.toLowerCase())
    return matchCourse && matchStatus && matchSearch
  })

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">🗒️ Attendance Logs</h2>
          <p className="sd-section-sub">Full history of your attendance records</p>
        </div>
      </div>

      <div className="sd-filters">
        <input
          id="log-search"
          className="sd-input sd-input-search"
          placeholder="🔍 Search logs…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <select id="log-course-filter" className="sd-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {COURSES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
        </select>
        <select id="log-status-filter" className="sd-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      </div>

      {/* Summary pills */}
      <div className="sd-log-summary">
        <span className="sd-log-sum-pill" style={{ color: '#34d399' }}>✅ Present: {LOGS.filter(l=>l.status==='present').length}</span>
        <span className="sd-log-sum-pill" style={{ color: '#f87171' }}>❌ Absent: {LOGS.filter(l=>l.status==='absent').length}</span>
        <span className="sd-log-sum-pill" style={{ color: '#fbbf24' }}>⏰ Late: {LOGS.filter(l=>l.status==='late').length}</span>
        <span className="sd-log-sum-pill" style={{ color: 'var(--sd-muted)' }}>📋 Total: {LOGS.length}</span>
      </div>

      <div className="sd-card sd-table-wrap">
        <table className="sd-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date & Time</th>
              <th>Course</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', opacity: 0.4 }}>No records found</td></tr>
            )}
            {filtered.map((l, i) => (
              <tr key={l.id}>
                <td className="sd-td-num">{i + 1}</td>
                <td className="sd-td-date">{l.date}</td>
                <td><span className="sd-course-code-sm">{l.course}</span></td>
                <td className="sd-td-method">
                  <span className="sd-method-badge">
                    {l.method === 'QR Code' ? '🔲' : l.method === 'Face Recognition' ? '👁️' : '✍️'} {l.method}
                  </span>
                </td>
                <td>
                  <span className={`sd-badge sd-badge-${l.status}`}>
                    {l.status === 'present' ? '✅' : l.status === 'late' ? '⏰' : '❌'} {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: SETTINGS
// ═══════════════════════════════════════════════════════════
function TabSettings({ user }) {
  const [profile, setProfile] = useState({
    name:      user?.name  || '',
    email:     user?.email || '',
    rollNo:    '21CS028',
    dept:      'Computer Science',
    semester:  '4th Semester',
    phone:     '+91 98765 43210',
  })
  const [notif, setNotif] = useState({
    absent:  true,
    late:    false,
    qr:      true,
    weekly:  true,
    email:   true,
    browser: true,
  })
  const { theme, setTheme } = useTheme()
  const [saved,   setSaved]   = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">⚙️ Settings</h2>
          <p className="sd-section-sub">Manage your profile and preferences</p>
        </div>
        <button id="save-settings-btn" className={`sd-primary-btn ${saved ? 'btn-success' : ''}`} onClick={save}>
          {saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      <div className="sd-settings-grid">
        {/* Profile */}
        <div className="sd-card">
          <h3 className="sd-card-title">👤 Profile</h3>
          <div className="sd-profile-row">
            <div className="sd-avatar-lg">
              {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="sd-avatar-name">{profile.name}</p>
              <p className="sd-avatar-sub">{profile.rollNo} · {profile.dept}</p>
              <p className="sd-avatar-sub">{profile.semester}</p>
            </div>
          </div>

          <div className="sd-form-grid">
            {[
              { id: 'set-name',  label: 'Full Name',   key: 'name',     type: 'text'  },
              { id: 'set-email', label: 'Email',        key: 'email',    type: 'email' },
              { id: 'set-roll',  label: 'Roll Number',  key: 'rollNo',   type: 'text'  },
              { id: 'set-dept',  label: 'Department',   key: 'dept',     type: 'text'  },
              { id: 'set-sem',   label: 'Semester',     key: 'semester', type: 'text'  },
              { id: 'set-phone', label: 'Phone',        key: 'phone',    type: 'tel'   },
            ].map(f => (
              <div key={f.id} className="sd-form-group">
                <label htmlFor={f.id}>{f.label}</label>
                <input
                  id={f.id}
                  className="sd-input"
                  type={f.type}
                  value={profile[f.key]}
                  readOnly
                />
              </div>
            ))}
          </div>


        </div>

        <div>
          {/* Notifications */}
          <div className="sd-card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="sd-card-title">🔔 Notifications</h3>
            <div className="sd-toggle-list">
              {[
                { id: 'n-absent',  key: 'absent',  label: 'Absent Alerts',         desc: 'When you are marked absent'          },
                { id: 'n-late',    key: 'late',    label: 'Late Arrival Alerts',    desc: 'When you are marked late'            },
                { id: 'n-qr',      key: 'qr',      label: 'QR Session Started',     desc: 'When faculty starts a QR session'   },
                { id: 'n-weekly',  key: 'weekly',  label: 'Weekly Summary',         desc: 'Weekly attendance report via email' },
                { id: 'n-email',   key: 'email',   label: 'Email Notifications',    desc: 'Receive alerts via email'           },
                { id: 'n-browser', key: 'browser', label: 'Browser Notifications',  desc: 'Push alerts in browser'             },
              ].map(n => (
                <div key={n.id} className="sd-toggle-row">
                  <div>
                    <span className="sd-toggle-label">{n.label}</span>
                    <span className="sd-toggle-desc">{n.desc}</span>
                  </div>
                  <button
                    id={n.id}
                    className={`sd-switch ${notif[n.key] ? 'on' : ''}`}
                    onClick={() => setNotif(p => ({ ...p, [n.key]: !p[n.key] }))}
                    aria-pressed={notif[n.key]}
                  >
                    <span className="sd-switch-thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="sd-card">
            <h3 className="sd-card-title">🎨 Appearance</h3>
            <div className="sd-theme-row">
              {['dark', 'light', 'system'].map(t => (
                <button
                  key={t}
                  id={`theme-${t}`}
                  className={`sd-theme-btn ${theme === t ? 'active' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="sd-card">
        <h3 className="sd-card-title">🔑 Change Password</h3>
        <div className="sd-form-grid-3">
          <div className="sd-form-group">
            <label htmlFor="cur-pass">Current Password</label>
            <input id="cur-pass" className="sd-input" type="password" placeholder="••••••••" />
          </div>
          <div className="sd-form-group">
            <label htmlFor="new-pass">New Password</label>
            <input id="new-pass" className="sd-input" type="password" placeholder="••••••••" />
          </div>
          <div className="sd-form-group">
            <label htmlFor="conf-pass">Confirm Password</label>
            <input id="conf-pass" className="sd-input" type="password" placeholder="••••••••" />
          </div>
        </div>
        <button id="change-pass-btn" className="sd-outline-btn" style={{ marginTop: '0.75rem' }}>
          🔒 Update Password
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function StudentDashboardPage() {
  const { user, logout } = useAuth()
  const router           = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('attentify_student_sidebar_collapsed') === 'true'
      } catch (e) {}
    }
    return false
  })

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setSidebarOpen(o => !o)
    } else {
      setSidebarCollapsed(prev => {
        const next = !prev
        try {
          localStorage.setItem('attentify_student_sidebar_collapsed', String(next))
        } catch (e) {}
        return next
      })
    }
  }
  const attData = useAttendanceData(user?.email)

  const isSessionActive = () => !!localStorage.getItem('active_qr_session')

  const handleNav = (id) => {
    // If student is currently on scanner tab AND a QR session is active, block navigation away
    if (activeTab === 'scanner' && id !== 'scanner' && isSessionActive()) {
      alert('🚨 You cannot leave the Scanner!\n\nA QR session is currently active. You must stay here and scan the QR code to mark your attendance.\n\nLeaving will result in your attendance being marked ABSENT.')
      setSidebarOpen(false)
      return
    }
    setActiveTab(id)
    setSidebarOpen(false)
  }

  // Block logout during active session
  const handleLogout = () => {
    if (isSessionActive()) {
      alert('\ud83d\udea8 Cannot log out!\n\nA QR session is active. Scan the QR code to mark attendance first.')
      return
    }
    logout(); router.replace('/login')
  }

  // Warn on browser close/refresh during active scanner session
  useEffect(() => {
    const blockClose = (e) => {
      if (activeTab === 'scanner' && isSessionActive()) {
        e.preventDefault()
        e.returnValue = '\ud83d\udea8 QR session is active! Leaving will mark you ABSENT.'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', blockClose)
    return () => window.removeEventListener('beforeunload', blockClose)
  }, [activeTab])

  // Auto-navigate to scanner when a QR session appears (polls every 2s)
  useEffect(() => {
    const id = setInterval(() => {
      if (localStorage.getItem('active_qr_session') && activeTab !== 'scanner') {
        setActiveTab('scanner')
      }
    }, 2000)
    return () => clearInterval(id)
  }, [activeTab])

  const displayName = user?.name || 'Arjun P'
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AP'

  // Format date matching the reference screenshot: "Sat, 17 Oct"
  const now = new Date()
  const weekday = now.toLocaleDateString('en-US', { weekday: 'short' })
  const day = now.getDate()
  const month = now.toLocaleDateString('en-US', { month: 'short' })
  const formattedDate = `${weekday}, ${day} ${month}`

  return (
    <div className="sd-root">
      {sidebarOpen && <div className="sd-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* ── Fixed Sidebar ─────────────────────────────────────── */}
      <aside className={`sd-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sd-sidebar-brand">
          <AttentifyLogo size={23} color="#162F44" />
          <span className="sd-sidebar-name">ATTENTIFY</span>
        </div>

        <nav className="sd-sidebar-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`sd-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="sd-nav-icon">
                  <Icon size={18} color={isActive ? '#162F44' : '#758087'} />
                </span>
                <span className="sd-nav-label">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sd-sidebar-footer">
          <div className="sd-sidebar-tagline">ATTENDANCE, SIMPLIFIED.</div>
          <hr className="sd-sidebar-divider" />
          <div className="sd-user-chip">
            <div className="sd-user-avatar">{initials}</div>
            <div className="sd-user-info">
              <span className="sd-user-name">{displayName}</span>
              <span className="sd-user-role">Student</span>
            </div>
            <button
              id="logout-btn"
              className="sd-logout-btn"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogoutIcon size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────── */}
      <div className="sd-main-wrap">
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button
              className={`sd-hamburger ${sidebarCollapsed ? 'sidebar-hidden' : ''}`}
              onClick={handleToggleSidebar}
              title={sidebarCollapsed ? "Show Navigation Menu" : "Hide Navigation Menu"}
              aria-label="Toggle Sidebar"
            >
              <HamburgerIcon size={18} color="#162F44" />
            </button>
            <h1 className="sd-topbar-title">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Overview'}
            </h1>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formattedDate}</span>
            <div className="sd-attendance-indicator" title="Overall attendance indicator">
              <CheckCircleIcon size={14} color="#557E6D" />
              <span>{attData.loading ? '…' : `${attData.overallPct}%`}</span>
            </div>
          </div>
        </header>

        <main className="sd-content">
          {activeTab === 'overview'   && <TabOverview   user={user} onNav={handleNav} attData={attData} />}
          {activeTab === 'attendance' && <TabAttendance attData={attData} />}
          {activeTab === 'scanner'    && <TabScanner user={user} />}
          {activeTab === 'classes'    && <TabClasses />}
          {activeTab === 'timetable'   && <TabTimetable />}
          {activeTab === 'assignments'  && <TabStudentAssignments />}
          {activeTab === 'bills'        && <TabBills />}
          {activeTab === 'logs'         && <TabLogs />}
          {activeTab === 'settings'     && <TabSettings user={user} />}
        </main>
      </div>
    </div>
  )
}
