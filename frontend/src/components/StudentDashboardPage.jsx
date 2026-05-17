"use client";

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from '../hooks/useRouter'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './StudentDashboardPage.css'

// ─── Mock data ────────────────────────────────────────────────────────────────
const COURSES = [
  { id: 'CS101', name: 'Data Structures',     faculty: 'Prof. Sharma',   schedule: 'Mon / Wed / Fri  9:00 AM',  room: 'Lab 3',   attended: 18, total: 20, color: '#a78bfa' },
  { id: 'CS205', name: 'Operating Systems',   faculty: 'Dr. Rajan',      schedule: 'Tue / Thu  11:00 AM',       room: 'Room 12', attended: 14, total: 18, color: '#60a5fa' },
  { id: 'CS312', name: 'Database Systems',    faculty: 'Prof. Meera',    schedule: 'Mon / Wed  2:00 PM',        room: 'Room 7',  attended: 15, total: 16, color: '#34d399' },
  { id: 'CS420', name: 'Computer Networks',   faculty: 'Dr. Anand',      schedule: 'Fri  3:00 PM',              room: 'Lab 1',   attended: 8,  total: 12, color: '#fbbf24' },
  { id: 'CS510', name: 'Machine Learning',    faculty: 'Prof. Divya',    schedule: 'Thu  10:00 AM',             room: 'Lab 5',   attended: 6,  total: 10, color: '#f87171' },
]

const LOGS = [
  { id: 1, date: 'Today, 9:04 AM',       course: 'CS101', method: 'QR Code',          status: 'present' },
  { id: 2, date: 'Today, 11:02 AM',      course: 'CS205', method: 'Face Recognition', status: 'present' },
  { id: 3, date: 'Yesterday, 9:10 AM',   course: 'CS101', method: 'QR Code',          status: 'late'    },
  { id: 4, date: 'Yesterday, 12:00 PM',  course: 'CS312', method: 'Manual',           status: 'present' },
  { id: 5, date: '14 Apr, 9:00 AM',      course: 'CS101', method: 'QR Code',          status: 'absent'  },
  { id: 6, date: '14 Apr, 11:00 AM',     course: 'CS205', method: 'QR Code',          status: 'present' },
  { id: 7, date: '13 Apr, 2:00 PM',      course: 'CS312', method: 'Face Recognition', status: 'present' },
  { id: 8, date: '12 Apr, 3:00 PM',      course: 'CS420', method: 'QR Code',          status: 'absent'  },
  { id: 9, date: '11 Apr, 9:00 AM',      course: 'CS101', method: 'QR Code',          status: 'present' },
  { id:10, date: '11 Apr, 10:00 AM',     course: 'CS510', method: 'Manual',           status: 'present' },
]

const TODAY_SCHEDULE = [
  { time: '9:00 AM',  course: 'CS101', name: 'Data Structures',   room: 'Lab 3',   status: 'done'     },
  { time: '11:00 AM', course: 'CS205', name: 'Operating Systems', room: 'Room 12', status: 'done'     },
  { time: '2:00 PM',  course: 'CS312', name: 'Database Systems',  room: 'Room 7',  status: 'upcoming' },
  { time: '3:00 PM',  course: 'CS420', name: 'Computer Networks', room: 'Lab 1',   status: 'upcoming' },
]

const NAV_ITEMS = [
  { id: 'overview',    icon: '🏠', label: 'Overview'    },
  { id: 'attendance',  icon: '📊', label: 'Attendance'  },
  { id: 'scanner',     icon: '📷', label: 'Scanner'     },
  { id: 'classes',     icon: '📚', label: 'Classes'     },
  { id: 'timetable',   icon: '📅', label: 'Timetable'   },
  { id: 'logs',        icon: '🗒️',  label: 'Logs'       },
  { id: 'settings',    icon: '⚙️',  label: 'Settings'   },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const totalAttended = COURSES.reduce((a, c) => a + c.attended, 0)
const totalClasses  = COURSES.reduce((a, c) => a + c.total, 0)
const overallPct    = Math.round(totalAttended / totalClasses * 100)

function pct(c) { return Math.round(c.attended / c.total * 100) }
function pctColor(p) {
  if (p >= 85) return '#34d399'
  if (p >= 75) return '#fbbf24'
  return '#f87171'
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="sd-stat-card" style={{ '--accent': color }}>
      <span className="sd-stat-icon">{icon}</span>
      <div>
        <div className="sd-stat-value">{value}</div>
        <div className="sd-stat-label">{label}</div>
        {sub && <div className="sd-stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════
function TabOverview({ user, onNav }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const absent  = LOGS.filter(l => l.status === 'absent').length
  const late    = LOGS.filter(l => l.status === 'late').length

  return (
    <div className="sd-tab-content">
      {/* Welcome banner */}
      <div className="sd-welcome-banner">
        <div>
          <h2 className="sd-welcome-title">Hey, <span>{user?.name?.split(' ')[0] || 'Student'}</span> 👋</h2>
          <p className="sd-welcome-date">{today}</p>
        </div>
        <button className="sd-primary-btn" onClick={() => onNav('scanner')}>
          📷 Scan
        </button>
      </div>

      {/* Stat row */}
      <div className="sd-stats-row">
        <StatCard icon="📊" label="Overall Attendance" value={`${overallPct}%`}          sub={`${totalAttended}/${totalClasses} classes`}  color="#a78bfa" />
        <StatCard icon="📚" label="Enrolled Courses"   value={COURSES.length}             sub="This semester"                                color="#60a5fa" />
        <StatCard icon="❌" label="Absences"           value={absent}                     sub="Total absences"                               color="#f87171" />
        <StatCard icon="⏰" label="Late Entries"       value={late}                       sub="Marked late"                                  color="#fbbf24" />
      </div>

      {/* Overall ring + Today's schedule */}
      <div className="sd-overview-grid">
        {/* Circular gauge */}
        <div className="sd-card sd-gauge-card">
          <h3 className="sd-card-title">🎯 Overall Attendance</h3>
          <div className="sd-gauge-wrap">
            <svg className="sd-gauge-svg" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={pctColor(overallPct)} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallPct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="sd-gauge-val">
              <span className="sd-gauge-pct" style={{ color: pctColor(overallPct) }}>{overallPct}%</span>
              <span className="sd-gauge-sub">{totalAttended}/{totalClasses} classes</span>
            </div>
          </div>
          <div className="sd-gauge-legend">
            <span style={{ color: '#34d399' }}>● ≥85% Safe</span>
            <span style={{ color: '#fbbf24' }}>● ≥75% Warning</span>
            <span style={{ color: '#f87171' }}>● &lt;75% Risk</span>
          </div>
        </div>

        {/* Today's schedule */}
        <div className="sd-card">
          <h3 className="sd-card-title">📅 Today's Schedule</h3>
          <div className="sd-schedule-list">
            {TODAY_SCHEDULE.map((s, i) => (
              <div key={i} className={`sd-schedule-item sd-schedule-${s.status}`}>
                <div className="sd-schedule-time">{s.time}</div>
                <div className="sd-schedule-dot" style={{ background: s.status === 'done' ? '#34d399' : '#a78bfa' }} />
                <div className="sd-schedule-body">
                  <span className="sd-schedule-name">{s.name}</span>
                  <span className="sd-schedule-meta">{s.course} · {s.room}</span>
                </div>
                <span className={`sd-schedule-badge ${s.status === 'done' ? 'badge-done' : 'badge-upcoming'}`}>
                  {s.status === 'done' ? '✅ Done' : '🕐 Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course % mini bars */}
      <div className="sd-card">
        <h3 className="sd-card-title">📈 Per-Course Attendance</h3>
        <div className="sd-mini-bars">
          {COURSES.map(c => (
            <div key={c.id} className="sd-mini-bar-row">
              <span className="sd-mini-bar-name">{c.name}</span>
              <div className="sd-mini-bar-track">
                <div className="sd-mini-bar-fill" style={{ width: `${pct(c)}%`, background: pctColor(pct(c)) }} />
              </div>
              <span className="sd-mini-bar-pct" style={{ color: pctColor(pct(c)) }}>{pct(c)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent logs */}
      <div className="sd-card">
        <div className="sd-card-title-row">
          <h3 className="sd-card-title">🕒 Recent Activity</h3>
          <button className="sd-text-btn" onClick={() => onNav('logs')}>View all →</button>
        </div>
        <div className="sd-log-list">
          {LOGS.slice(0, 5).map(l => (
            <div key={l.id} className="sd-log-item">
              <span className={`sd-log-dot sd-dot-${l.status}`} />
              <div className="sd-log-body">
                <span className="sd-log-course">{l.course}</span>
                <span className="sd-log-method">{l.method}</span>
              </div>
              <div className="sd-log-right">
                <span className={`sd-badge sd-badge-${l.status}`}>{l.status}</span>
                <span className="sd-log-date">{l.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: ATTENDANCE
// ═══════════════════════════════════════════════════════════
function TabAttendance() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? COURSES : COURSES.filter(c => {
    const p = pct(c)
    if (filter === 'safe')    return p >= 85
    if (filter === 'warning') return p >= 75 && p < 85
    if (filter === 'risk')    return p < 75
    return true
  })

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
        <StatCard icon="✅" label="Safe courses"    value={COURSES.filter(c => pct(c) >= 85).length} sub="≥ 85%"  color="#34d399" />
        <StatCard icon="⚠️" label="Warning courses" value={COURSES.filter(c => pct(c) >= 75 && pct(c) < 85).length} sub="75–84%" color="#fbbf24" />
        <StatCard icon="🚨" label="Risk courses"    value={COURSES.filter(c => pct(c) < 75).length} sub="< 75%"  color="#f87171" />
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
//  TAB: SCANNER (QR + Face)
// ═══════════════════════════════════════════════════════════
function TabScanner({ user }) {
  const [step, setStep] = useState(1)

  return (
    <div className="sd-tab-content">
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">🔒 2-Step Attendance Verification</h2>
          <p className="sd-section-sub">
            {step === 1 ? 'Step 1: Verify your identity using facial recognition' : 'Step 2: Scan the session QR code to mark attendance'}
          </p>
        </div>
        <div className="sd-step-indicator">
          <span className={`sd-step-badge ${step >= 1 ? 'active' : ''}`}>1. Face</span>
          <span className="sd-step-line" style={{ width: '30px', height: '2px', background: step === 2 ? 'var(--sd-accent)' : 'rgba(255,255,255,0.1)', display: 'inline-block', margin: '0 8px', verticalAlign: 'middle' }}></span>
          <span className={`sd-step-badge ${step === 2 ? 'active' : ''}`}>2. QR Code</span>
        </div>
      </div>
      {step === 1 ? <ScannerFaceContent user={user} onVerified={() => setStep(2)} /> : <ScannerQRContent user={user} />}
    </div>
  )
}

function ScannerQRContent({ user }) {
  const [scanning, setScanning]   = useState(false)
  const [sessionCode, setCode]    = useState('')
  const [result, setResult]       = useState(null) // 'success' | 'error' | null
  const [resultMsg, setMsg]       = useState('')
  const [manualCode, setManual]   = useState('')
  const [history, setHistory]     = useState([
    { id: 1, course: 'CS101', time: 'Today, 9:04 AM',    status: 'success' },
    { id: 2, course: 'CS205', time: 'Today, 11:02 AM',   status: 'success' },
    { id: 3, course: 'CS101', time: 'Yesterday, 9:10 AM',status: 'success' },
  ])
  const timerRef = useRef(null)

  const submitTokenToBackend = async (code) => {
    try {
      const formData = new FormData();
      formData.append("token", code);
      formData.append("student_id", user?.email || "mock_student@smartattend.com");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/qr`, {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Invalid QR Code");
      }
      
      const data = await res.json();
      
      setResult('success');
      setMsg(`Attendance marked successfully for ${data.course_id || 'Class'}!`);
      setHistory(prev => [
        { id: Date.now(), course: data.course_id || '—', time: 'Just now', status: 'success' },
        ...prev,
      ])
    } catch(err) {
      setResult('error');
      setMsg(err.message);
    } finally {
      setScanning(false);
    }
  }

  const startScan = useCallback(() => {
    setScanning(true)
    setResult(null)
    setMsg('')
    
    // Simulate real QR detection logic
    timerRef.current = setTimeout(() => {
      // In a real environment with html5-qrcode, this would be a real scan event.
      // For now, we simulate the "Detecting..." phase and then ask for the token.
      const code = prompt("📸 [SIMULATION] QR Code Detected!\n\nPlease enter the Faculty Token displayed on the teacher's screen:");
      if (code) {
        submitTokenToBackend(code.trim());
      } else {
        setScanning(false);
        setResult('error');
        setMsg("Scan cancelled or timed out.");
      }
    }, 2000)
  }, [user])

  useEffect(() => {
    // Automatically start scanning when the student reaches this step
    const autoStart = setTimeout(() => {
      startScan();
    }, 1500);
    return () => {
      clearTimeout(autoStart);
      clearTimeout(timerRef.current);
    }
  }, [startScan])

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    submitTokenToBackend(manualCode.trim())
    setManual('')
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <>
      <div className="sd-qr-layout">
        {/* Scanner area */}
        <div className="sd-card sd-scanner-card">
          <h3 className="sd-card-title">📸 Camera Scanner</h3>
          <div style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--sd-green-lt)', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            <span>✅</span> Identity Verified successfully! Please scan the QR code to finish.
          </div>

          <div className={`sd-viewfinder ${scanning ? 'scanning' : ''} ${result === 'success' ? 'vf-success' : result === 'error' ? 'vf-error' : ''}`}>
            {scanning ? (
              <>
                <div className="sd-scan-lines" />
                <div className="sd-scan-corner sd-sc-tl" />
                <div className="sd-scan-corner sd-sc-tr" />
                <div className="sd-scan-corner sd-sc-bl" />
                <div className="sd-scan-corner sd-sc-br" />
                <div className="sd-scan-laser" />
                <p className="sd-scanning-label">Scanning…</p>
              </>
            ) : result === 'success' ? (
              <div className="sd-scan-result-icon">✅</div>
            ) : result === 'error' ? (
              <div className="sd-scan-result-icon">❌</div>
            ) : (
              <>
                <div className="sd-scan-corner sd-sc-tl" />
                <div className="sd-scan-corner sd-sc-tr" />
                <div className="sd-scan-corner sd-sc-bl" />
                <div className="sd-scan-corner sd-sc-br" />
                <span className="sd-vf-hint">📷 Camera preview appears here</span>
              </>
            )}
          </div>

          {result && (
            <div className={`sd-result-banner ${result}`}>
              <span>{result === 'success' ? '✅' : '❌'}</span>
              <span>{resultMsg}</span>
            </div>
          )}

          <div className="sd-scanner-actions">
            <button
              id="start-scan-btn"
              className={`sd-primary-btn sd-btn-full ${scanning ? 'loading' : ''}`}
              onClick={startScan}
              disabled={scanning}
            >
              {scanning ? (
                <><span className="sd-spinner" /> Scanning…</>
              ) : (
                <><span>📷</span> {result ? 'Scan Again' : 'Start Scanning'}</>
              )}
            </button>
          </div>

          <div className="sd-divider"><span>or enter code manually</span></div>

          <form id="manual-code-form" onSubmit={handleManualSubmit} className="sd-manual-form">
            <input
              id="manual-code-input"
              className="sd-input"
              placeholder="Paste the raw encrypted JWT token here..."
              value={manualCode}
              onChange={e => setManual(e.target.value.toUpperCase())}
            />
            <button id="manual-submit-btn" type="submit" className="sd-primary-btn">Submit</button>
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
function ScannerFaceContent({ user, onVerified }) {
  const [scanning, setScanning]   = useState(false)
  const [result, setResult]       = useState(null)
  const [resultMsg, setMsg]       = useState('')
  const [history, setHistory]     = useState([
    { id: 1, method: 'Face Recognition', time: 'Today, 11:02 AM', status: 'success' },
    { id: 2, method: 'Face Recognition', time: '13 Apr, 2:00 PM', status: 'success' },
  ])
  const timerRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    } catch (err) {
      setResult('error')
      setMsg("Camera access denied: " + err.message)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, []) // Stop camera when user navigates away from tab

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setScanning(true)
    setResult(null)
    setMsg('')

    try {
      const formData = new FormData()
      formData.append("file", file, "face.jpg")
      formData.append("student_id", user?.email || "mock_student@smartattend.com")
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/verify-only`, {
        method: "POST",
        body: formData
      })
      
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Face not recognized")
      }
      
      const data = await res.json()
      setResult('success')
      setMsg(data.detail || 'Identity verified successfully! Moving to QR Step...')
      
      setTimeout(() => {
        if (onVerified) onVerified()
      }, 2000)
    } catch(err) {
      setResult('error')
      setMsg(err.message)
    } finally {
      setScanning(false)
    }
  }

  const startScan = () => {
    if (!videoRef.current || !canvasRef.current) return
    setScanning(true)
    setResult(null)
    setMsg('')
    
    // Simulate UI delay for scanning effect
    timerRef.current = setTimeout(() => {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setScanning(false);
          setResult('error');
          setMsg('Could not capture frame. Please make sure the camera is working.');
          return;
        }
        try {
          const formData = new FormData();
          formData.append("file", blob, "face.jpg");
          formData.append("student_id", user?.email || "mock_student@smartattend.com");
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/verify-only`, {
            method: "POST",
            body: formData
          });
          
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Face not recognized");
          }
          
          const data = await res.json();
          
          setResult('success');
          setMsg(data.detail || 'Identity verified successfully! Moving to QR Step...');
          
          // Stop camera before moving to next step
          stopCamera();

          setTimeout(() => {
            if (onVerified) onVerified();
          }, 1500);
        } catch(err) {
          setResult('error');
          setMsg(err.message);
        } finally {
          setScanning(false);
        }
      }, 'image/jpeg', 0.95)
    }, 1500)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <>
      <div className="sd-qr-layout">
        <div className="sd-card sd-scanner-card">
          <h3 className="sd-card-title">🎥 Webcam Verification</h3>

          <div className={`sd-viewfinder ${scanning ? 'scanning' : ''} ${result === 'success' ? 'vf-success' : result === 'error' ? 'vf-error' : ''}`} style={{ borderRadius: '50%', overflow: 'hidden', position: 'relative', background: '#000' }}>
            {stream ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span className="sd-vf-hint" style={{ textAlign: 'center' }}>No Camera Access</span>
                <label className="sd-outline-btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                  Upload Photo
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={scanning} />
                </label>
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {scanning && (
              <>
                <div className="sd-scan-lines" style={{ borderRadius: '50%' }} />
                <div className="sd-scan-laser" />
                <p className="sd-scanning-label" style={{ top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '4px', zIndex: 10 }}>Analyzing Face…</p>
              </>
            )}
          </div>

          {result && (
            <div className={`sd-result-banner ${result}`}>
              <span>{result === 'success' ? '✅' : '❌'}</span>
              <span>{resultMsg}</span>
            </div>
          )}

          <div className="sd-scanner-actions">
            <button
              className={`sd-primary-btn sd-btn-full ${scanning ? 'loading' : ''}`}
              onClick={startScan}
              disabled={scanning || !stream || result === 'success'}
            >
              {scanning ? (
                <><span className="sd-spinner" /> Verifying…</>
              ) : (
                <><span>👁️</span> {result === 'error' ? 'Try Again' : 'Verify Identity'}</>
              )}
            </button>
          </div>
        </div>

        <div className="sd-qr-right">
          <div className="sd-card">
            <h3 className="sd-card-title">ℹ️ How it works</h3>
            <ol className="sd-how-list">
              <li><span>1</span> Click <strong>Start Scan</strong> to open the webcam</li>
              <li><span>2</span> Position your face inside the circle</li>
              <li><span>3</span> Look directly at the camera</li>
              <li><span>4</span> Wait for AI facial recognition to verify you ✅</li>
            </ol>
            <div className="sd-info-note">💡 Ensure you are in a well-lit area without wearing sunglasses or masks.</div>
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
                      <span className="sd-course-code-sm">{h.method}</span>
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
  const [activeTab, setActiveTab]     = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleNav = (id) => {
    if (id === 'scanner') {
      const activeSession = localStorage.getItem('active_qr_session')
      if (activeSession) {
        alert("🚨 Access Denied\n\nYou must be in the Scanner dashboard BEFORE the QR session generates. You cannot enter now because a session is already active.")
        return
      }
    }
    setActiveTab(id)
    setSidebarOpen(false)
  }

  const handleLogout = () => { logout(); router.replace('/login') }
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ST'

  return (
    <div className="sd-root">
      {sidebarOpen && <div className="sd-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sd-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sd-sidebar-brand">
          <div className="sd-sidebar-logo">A</div>
          <span className="sd-sidebar-name">ATTENTIFY</span>
        </div>

        <nav className="sd-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`sd-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="sd-nav-icon">{item.icon}</span>
              <span className="sd-nav-label">{item.label}</span>
              {activeTab === item.id && <span className="sd-nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-footer">
          <div className="sd-user-chip">
            <div className="sd-user-avatar">{initials}</div>
            <div className="sd-user-info">
              <span className="sd-user-name">{user?.name}</span>
              <span className="sd-user-role">Student</span>
            </div>
          </div>
          <button id="logout-btn" className="sd-logout-btn" onClick={handleLogout} title="Sign out">↩</button>
        </div>
      </aside>

      {/* Main */}
      <div className="sd-main-wrap">
        <header className="sd-mobile-topbar">
          <button className="sd-hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span className="sd-mobile-title">ATTENTIFY</span>
        </header>

        <header className="sd-topbar">
          <div className="sd-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="sd-hamburger-desktop" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle Sidebar">☰</button>
            <h1 className="sd-topbar-title">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="sd-role-badge">
              {overallPct >= 75
                ? <span style={{ color: '#34d399' }}>✅ {overallPct}%</span>
                : <span style={{ color: '#f87171' }}>⚠️ {overallPct}%</span>}
            </span>
          </div>
        </header>

        <main className="sd-content">
          {activeTab === 'overview'   && <TabOverview   user={user} onNav={handleNav} />}
          {activeTab === 'attendance' && <TabAttendance />}
          {activeTab === 'scanner'    && <TabScanner user={user} />}
          {activeTab === 'classes'    && <TabClasses />}
          {activeTab === 'timetable'  && <TabTimetable />}
          {activeTab === 'logs'       && <TabLogs />}
          {activeTab === 'settings'   && <TabSettings user={user} />}
        </main>
      </div>
    </div>
  )
}
