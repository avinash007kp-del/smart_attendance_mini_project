"use client";

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from '../hooks/useRouter'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './FacultyDashboardPage.css'

// ─── Static mock data ───────────────────────────────────────────────────────
const COURSES = [
  { id: 'CS101', name: 'Data Structures', room: 'Lab 3', time: '9:00 AM', students: 42 },
  { id: 'CS205', name: 'Operating Systems', room: 'Room 12', time: '11:00 AM', students: 38 },
  { id: 'CS312', name: 'Database Systems', room: 'Room 7', time: '2:00 PM', students: 35 },
]

const STUDENTS = [
  { id: 'S001', name: 'Rahul Verma',    roll: '21CS001', course: 'CS101', status: 'present', time: '9:04 AM' },
  { id: 'S002', name: 'Priya Singh',    roll: '21CS002', course: 'CS101', status: 'present', time: '9:07 AM' },
  { id: 'S003', name: 'Aditya Kumar',   roll: '21CS003', course: 'CS101', status: 'absent',  time: '—'      },
  { id: 'S004', name: 'Sneha Reddy',    roll: '21CS004', course: 'CS101', status: 'present', time: '9:02 AM' },
  { id: 'S005', name: 'Karan Mehta',    roll: '21CS005', course: 'CS205', status: 'present', time: '11:03 AM'},
  { id: 'S006', name: 'Ananya Gupta',   roll: '21CS006', course: 'CS205', status: 'present', time: '11:18 AM'},
  { id: 'S007', name: 'Vikram Nair',    roll: '21CS007', course: 'CS205', status: 'absent',  time: '—'      },
  { id: 'S008', name: 'Divya Patel',    roll: '21CS008', course: 'CS312', status: 'present', time: '2:01 AM' },
  { id: 'S009', name: 'Arjun Sharma',   roll: '21CS009', course: 'CS312', status: 'present', time: '2:05 AM' },
  { id: 'S010', name: 'Meera Iyer',     roll: '21CS010', course: 'CS312', status: 'absent',  time: '—'      },
]

const NAV_ITEMS = [
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard'  },
  { id: 'attendance', icon: '📋', label: 'Attendance'  },
  { id: 'qr',         icon: '🔲', label: 'QR Code'     },
  { id: 'settings',   icon: '⚙️',  label: 'Settings'   },
]

// ─── QR via Google Charts (no library needed) ────────────────────────────────
function buildQrUrl(data, size = 280) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=1a1a2e&color=a78bfa&format=png`
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value, trend, color }) {
  return (
    <div className="fd-stat-card" style={{ '--accent': color }}>
      <div className="fd-stat-icon">{icon}</div>
      <div className="fd-stat-body">
        <span className="fd-stat-value">{value}</span>
        <span className="fd-stat-label">{label}</span>
        <span className="fd-stat-trend">{trend}</span>
      </div>
    </div>
  )
}

// ─── Tab: Dashboard ──────────────────────────────────────────────────────────
function TabDashboard({ user, onNav }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const present = STUDENTS.filter(s => s.status === 'present').length
  const absent  = STUDENTS.filter(s => s.status === 'absent').length


  return (
    <div className="fd-tab-content">
      <div className="fd-welcome-banner">
        <div>
          <h2 className="fd-welcome-title">Welcome back, <span>{user?.name || 'Prof.'}</span> 👋</h2>
          <p className="fd-welcome-date">{today}</p>
        </div>
        <button className="fd-primary-btn" onClick={() => onNav('qr')}>
          <span>🔲</span> Generate QR
        </button>
      </div>

      <div className="fd-stats-row">
        <StatCard icon="📚" label="Today's Classes"  value={COURSES.length}           trend="Scheduled"         color="#a78bfa" />
        <StatCard icon="✅" label="Present"           value={present}                  trend={`${Math.round(present/STUDENTS.length*100)}% rate`} color="#34d399" />
        <StatCard icon="❌" label="Absent"            value={absent}                   trend="Notified via email" color="#f87171" />

      </div>

      <div className="fd-section-grid">
        <div className="fd-card">
          <h3 className="fd-card-title">📅 Today's Classes</h3>
          <div className="fd-course-list">
            {COURSES.map(c => (
              <div key={c.id} className="fd-course-item">
                <div className="fd-course-dot" />
                <div className="fd-course-info">
                  <span className="fd-course-name">{c.name}</span>
                  <span className="fd-course-meta">{c.id} · {c.room} · {c.time}</span>
                </div>
                <button className="fd-sm-btn" onClick={() => onNav('qr')}>QR</button>
              </div>
            ))}
          </div>
        </div>

        <div className="fd-card">
          <h3 className="fd-card-title">⚡ Quick Actions</h3>
          <div className="fd-quick-actions">
            {[
              { icon: '🔲', label: 'Generate QR',    id: 'qa-qr',       nav: 'qr'         },
              { icon: '📋', label: 'View Attendance', id: 'qa-attend',   nav: 'attendance' },
              { icon: '📤', label: 'Export Report',   id: 'qa-export',   nav: null         },
              { icon: '⚙️',  label: 'Settings',        id: 'qa-settings', nav: 'settings'  },
            ].map(a => (
              <button key={a.id} id={a.id} className="fd-qa-btn" onClick={() => a.nav && onNav(a.nav)}>
                <span className="fd-qa-icon">{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fd-card">
        <h3 className="fd-card-title">🕒 Recent Activity</h3>
        <div className="fd-activity-list">
          {[
            { t: 'Just now',    msg: 'QR session started for CS101 — Data Structures', type: 'info'    },
            { t: '9:05 AM',     msg: 'Rahul Verma marked present via Face Recognition',type: 'success' },

            { t: 'Yesterday',   msg: 'Attendance report exported for CS312',            type: 'neutral' },
            { t: '2 days ago',  msg: 'New QR session created for all courses',          type: 'info'    },
          ].map((a, i) => (
            <div key={i} className={`fd-activity-item fd-activity-${a.type}`}>
              <span className="fd-activity-time">{a.t}</span>
              <span className="fd-activity-msg">{a.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Attendance ─────────────────────────────────────────────────────────
function TabAttendance() {
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [searchQ, setSearchQ]               = useState('')
  const [students, setStudents]             = useState(STUDENTS)
  const [sortField, setSortField]           = useState('name')
  const [exported, setExported]             = useState(false)

  const filtered = students.filter(s => {
    const matchCourse = selectedCourse === 'all' || s.course === selectedCourse
    const q = searchQ.toLowerCase()
    const matchSearch = s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q)
    return matchCourse && matchSearch
  }).sort((a, b) => a[sortField]?.localeCompare(b[sortField]))

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s =>
      s.id === id
        ? { ...s, status: s.status === 'present' ? 'absent' : 'present', time: s.status === 'absent' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—' }
        : s
    ))
  }

  const handleExport = () => {
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  const present = filtered.filter(s => s.status === 'present').length
  const total   = filtered.length
  const pct     = total ? Math.round(present / total * 100) : 0

  return (
    <div className="fd-tab-content">
      <div className="fd-section-header">
        <div>
          <h2 className="fd-section-title">📋 Attendance Register</h2>
          <p className="fd-section-sub">Manage and review student attendance</p>
        </div>
        <button id="export-btn" className={`fd-primary-btn ${exported ? 'fd-btn-success' : ''}`} onClick={handleExport}>
          {exported ? '✅ Exported!' : '📤 Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="fd-filters">
        <input
          id="attendance-search"
          className="fd-search"
          type="text"
          placeholder="🔍  Search by name or roll no…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <select id="course-filter" className="fd-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {COURSES.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
        </select>
        <select id="sort-filter" className="fd-select" value={sortField} onChange={e => setSortField(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="roll">Sort: Roll No</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Summary bar */}
      <div className="fd-attend-summary">
        <div className="fd-attend-summary-text">
          <span><strong>{present}</strong> Present</span>
          <span><strong>{filtered.filter(s=>s.status==='absent').length}</strong> Absent</span>

        </div>
        <div className="fd-progress-bar">
          <div className="fd-progress-fill" style={{ width: `${pct}%` }} />
          <span className="fd-progress-label">{pct}% Attendance</span>
        </div>
      </div>

      {/* Table */}
      <div className="fd-card fd-table-wrap">
        <table className="fd-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Roll No</th>
              <th>Course</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', opacity: 0.4 }}>No records found</td></tr>
            )}
            {filtered.map((s, i) => (
              <tr key={s.id} className={`fd-tr-${s.status}`}>
                <td className="fd-td-num">{i + 1}</td>
                <td className="fd-td-name">{s.name}</td>
                <td><code className="fd-roll">{s.roll}</code></td>
                <td><span className="fd-course-tag">{s.course}</span></td>
                <td className="fd-td-time">{s.time}</td>
                <td>
                  <span className={`fd-status-badge fd-status-${s.status}`}>
                    {s.status === 'present' ? '✅' : '❌'} {s.status}
                  </span>
                </td>
                <td>
                  <button
                    id={`toggle-${s.id}`}
                    className="fd-toggle-btn"
                    onClick={() => toggleStatus(s.id)}
                    title="Toggle present/absent"
                  >
                    ⇄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab: QR Code Generator ──────────────────────────────────────────────────
function TabQR() {
  const [course, setCourse]       = useState(COURSES[0].id)
  const [duration, setDuration]   = useState(30)
  const [sessionNote, setNote]    = useState('')
  const [active, setActive]       = useState(false)
  const [timeLeft, setTimeLeft]   = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [scanCount, setScanCount] = useState(0)
  const [tokenPayload, setTokenPayload] = useState('')
  const timerRef = useRef(null)

  const selectedCourse = COURSES.find(c => c.id === course) || COURSES[0]

  const startSession = async () => {
    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/qr/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: course, duration_minutes: duration / 60.0 })
      })
      if (!res.ok) throw new Error("Backend generation failed")
      const data = await res.json()
      
      // Use part of the JWT signature as a mock session ID for UI aesthetics
      setSessionId("A-" + data.token.slice(-8).toUpperCase()) 
      setTokenPayload(data.token)
      
      localStorage.setItem('active_qr_session', JSON.stringify({ course_id: course, timestamp: Date.now() }))
      
      setActive(true)
      setTimeLeft(duration)
      setScanCount(0)

      // Simulate students scanning
      const scanInterval = setInterval(() => {
        setScanCount(p => p < selectedCourse.students ? p + Math.floor(Math.random() * 3 + 1) : p)
      }, 4000)

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            clearInterval(scanInterval)
            setActive(false)
            localStorage.removeItem('active_qr_session')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (e) {
      alert("Failed to generate QR on Backend. Ensure your backend is running and the URL is configured properly!")
      console.error(e)
    }
  }

  const stopSession = useCallback(() => {
    clearInterval(timerRef.current)
    setActive(false)
    setTimeLeft(0)
    localStorage.removeItem('active_qr_session')
  }, [])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const qrData = active
    ? tokenPayload
    : `SMARTATTEND::course=${course}::preview`

  const pct = active ? Math.round(scanCount / selectedCourse.students * 100) : 0

  return (
    <div className="fd-tab-content">
      <div className="fd-section-header">
        <div>
          <h2 className="fd-section-title">🔲 QR Code Generator</h2>
          <p className="fd-section-sub">Generate time-limited QR sessions for attendance marking</p>
        </div>
        {active && (
          <div className="fd-session-badge">
            <span className="fd-session-dot" /> Live Session
          </div>
        )}
      </div>

      <div className="fd-qr-layout">
        {/* Left: Config form */}
        <div className="fd-card fd-qr-config">
          <h3 className="fd-card-title">⚙️ Session Configuration</h3>

          <div className="fd-form-group">
            <label htmlFor="qr-course">Select Course</label>
            <select id="qr-course" className="fd-select fd-select-full" value={course} onChange={e => setCourse(e.target.value)} disabled={active}>
              {COURSES.map(c => (
                <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
              ))}
            </select>
          </div>

          <div className="fd-form-group">
            <label htmlFor="qr-duration">Session Duration</label>
            <div className="fd-duration-row">
              {[30, 45, 60].map(d => (
                <button
                  key={d}
                  id={`dur-${d}`}
                  className={`fd-dur-btn ${duration === d ? 'active' : ''}`}
                  onClick={() => setDuration(d)}
                  disabled={active}
                >
                  {d === 60 ? '1m' : `${d}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="fd-form-group">
            <label htmlFor="session-note">Session Note (optional)</label>
            <input
              id="session-note"
              className="fd-input"
              type="text"
              placeholder="e.g., Unit Test 2 — Chapter 5"
              value={sessionNote}
              onChange={e => setNote(e.target.value)}
              disabled={active}
            />
          </div>

          <div className="fd-course-info-card">
            <div className="fd-ci-row"><span>📚 Course</span><strong>{selectedCourse.name}</strong></div>
            <div className="fd-ci-row"><span>🏫 Room</span><strong>{selectedCourse.room}</strong></div>
            <div className="fd-ci-row"><span>🕐 Time</span><strong>{selectedCourse.time}</strong></div>
            <div className="fd-ci-row"><span>🎓 Students</span><strong>{selectedCourse.students}</strong></div>
          </div>

          {!active ? (
            <button id="start-qr-btn" className="fd-primary-btn fd-btn-full" onClick={startSession}>
              🚀 Start QR Session
            </button>
          ) : (
            <button id="stop-qr-btn" className="fd-danger-btn fd-btn-full" onClick={stopSession}>
              ⏹ Stop Session
            </button>
          )}
        </div>

        {/* Right: QR display */}
        <div className="fd-card fd-qr-display">
          {/* Timer ring */}
          {active && (
            <div className="fd-timer-ring">
              <div className="fd-timer-value">{formatTime(timeLeft)}</div>
              <div className="fd-timer-label">remaining</div>
            </div>
          )}

          <div className={`fd-qr-box ${active ? 'active' : 'idle'}`}>
            <img
              className="fd-qr-image"
              src={buildQrUrl(qrData, 260)}
              alt="Attendance QR Code"
            />
            {!active && <div className="fd-qr-overlay"><span>Start a session to activate</span></div>}
          </div>

          {active && (
            <>
              <div className="fd-session-info">
                <span className="fd-session-id">Session: <code>{sessionId}</code></span>
                <span className="fd-session-dur">Duration: {duration === 60 ? '1 min' : `${duration} sec`}</span>
              </div>

              <div className="fd-scan-progress">
                <div className="fd-scan-progress-header">
                  <span>Students Scanned</span>
                  <span><strong>{Math.min(scanCount, selectedCourse.students)}</strong> / {selectedCourse.students}</span>
                </div>
                <div className="fd-progress-bar">
                  <div className="fd-progress-fill fd-progress-green" style={{ width: `${pct}%` }} />
                </div>
                <span className="fd-scan-pct">{pct}% scanned</span>
              </div>

              <div className="fd-qr-hint">
                <span>📱 Students scan this QR using the ATTENTIFY mobile app</span>
              </div>
              
              <button 
                className="fd-outline-btn fd-btn-full" 
                style={{ marginTop: '0.5rem', background: 'rgba(52, 211, 153, 0.1)', borderColor: 'rgba(52, 211, 153, 0.4)', color: 'var(--sd-green-lt)' }}
                onClick={async (e) => {
                  const btn = e.target;
                  const originalText = btn.innerHTML;
                  btn.innerHTML = '<span class="sd-spinner"></span> Sending...';
                  try {
                    const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/qr/send`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ course_id: course, token: tokenPayload })
                    });
                    if (!res.ok) throw new Error("Failed to send");
                    const data = await res.json();
                    alert("✅ " + data.message);
                  } catch(err) {
                    alert("❌ Failed to send: " + err.message);
                  } finally {
                    btn.innerHTML = originalText;
                  }
                }}
              >
                📧 Send QR to Students
              </button>
            </>
          )}

          {!active && timeLeft === 0 && scanCount > 0 && (
            <div className="fd-session-ended">
              <span>✅ Session ended — <strong>{Math.min(scanCount, selectedCourse.students)}</strong> students marked present</span>
            </div>
          )}
        </div>
      </div>

      {/* Past sessions */}
      <div className="fd-card">
        <h3 className="fd-card-title">🕒 Recent QR Sessions</h3>
        <div className="fd-table-wrap fd-table-scroll">
          <table className="fd-table">
            <thead>
              <tr><th>Session ID</th><th>Course</th><th>Date</th><th>Duration</th><th>Scanned</th><th>Status</th></tr>
            </thead>
            <tbody>
              {[
                { id: 'A-CS101-ABCD1', course: 'CS101', date: 'Today, 9:05 AM',      dur: '10 min', scanned: '38/42', status: 'ended'  },
                { id: 'A-CS205-XYZ23', course: 'CS205', date: 'Today, 11:00 AM',     dur: '15 min', scanned: '35/38', status: 'ended'  },
                { id: 'A-CS312-MNOP4', course: 'CS312', date: 'Yesterday, 2:00 PM',  dur: '10 min', scanned: '30/35', status: 'ended'  },
                { id: 'A-CS101-QRST5', course: 'CS101', date: '2 days ago, 9:00 AM', dur: '20 min', scanned: '40/42', status: 'ended'  },
              ].map(r => (
                <tr key={r.id}>
                  <td><code className="fd-roll">{r.id}</code></td>
                  <td><span className="fd-course-tag">{r.course}</span></td>
                  <td className="fd-td-time">{r.date}</td>
                  <td>{r.dur}</td>
                  <td>{r.scanned}</td>
                  <td><span className="fd-status-badge fd-status-present">✅ {r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Settings ───────────────────────────────────────────────────────────
function TabSettings({ user }) {
  const [profile, setProfile] = useState({
    name:       user?.name || '',
    email:      user?.email || '',
    department: 'Computer Science',
    phone:      '+91 98765 43210',
    office:     'Room 204, CS Block',
  })
  const [notif, setNotif] = useState({
    email:   true,
    sms:     false,
    browser: true,
    absentAlert: true,
    lateAlert:   false,
    reportWeekly: true,
  })
  const { theme, setTheme } = useTheme()
  const [saved, setSaved]   = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fd-tab-content">
      <div className="fd-section-header">
        <div>
          <h2 className="fd-section-title">⚙️ Settings</h2>
          <p className="fd-section-sub">Manage your profile, notifications, and preferences</p>
        </div>
        <button id="save-settings-btn" className={`fd-primary-btn ${saved ? 'fd-btn-success' : ''}`} onClick={handleSave}>
          {saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      <div className="fd-settings-grid">
        {/* Profile */}
        <div className="fd-card">
          <h3 className="fd-card-title">👤 Profile Information</h3>
          <div className="fd-profile-avatar-row">
            <div className="fd-avatar-lg">
              {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="fd-avatar-name">{profile.name}</p>
              <p className="fd-avatar-role">Faculty · {profile.department}</p>
            </div>
          </div>
          <div className="fd-form-grid">
            {[
              { id: 'set-name',  label: 'Full Name',   key: 'name',       type: 'text'  },
              { id: 'set-email', label: 'Email',        key: 'email',      type: 'email' },
              { id: 'set-dept',  label: 'Department',   key: 'department', type: 'text'  },
              { id: 'set-phone', label: 'Phone',        key: 'phone',      type: 'tel'   },
              { id: 'set-off',   label: 'Office Room',  key: 'office',     type: 'text'  },
            ].map(f => (
              <div key={f.id} className="fd-form-group">
                <label htmlFor={f.id}>{f.label}</label>
                <input
                  id={f.id}
                  className="fd-input"
                  type={f.type}
                  value={profile[f.key]}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Notifications */}
          <div className="fd-card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="fd-card-title">🔔 Notification Preferences</h3>
            <div className="fd-toggle-list">
              {[
                { id: 'notif-email',   key: 'email',        label: 'Email Notifications',     desc: 'Receive alerts via email'             },
                { id: 'notif-sms',     key: 'sms',          label: 'SMS Notifications',        desc: 'Receive alerts via SMS'               },
                { id: 'notif-browser', key: 'browser',      label: 'Browser Notifications',    desc: 'Push alerts in browser'               },
                { id: 'notif-absent',  key: 'absentAlert',  label: 'Absent Student Alert',     desc: 'Alert when a student is absent'       },

                { id: 'notif-weekly',  key: 'reportWeekly', label: 'Weekly Report Digest',     desc: 'Automated weekly attendance report'   },
              ].map(n => (
                <div key={n.id} className="fd-toggle-row">
                  <div>
                    <span className="fd-toggle-label">{n.label}</span>
                    <span className="fd-toggle-desc">{n.desc}</span>
                  </div>
                  <button
                    id={n.id}
                    className={`fd-switch ${notif[n.key] ? 'on' : ''}`}
                    onClick={() => setNotif(p => ({ ...p, [n.key]: !p[n.key] }))}
                    aria-pressed={notif[n.key]}
                  >
                    <span className="fd-switch-thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="fd-card">
            <h3 className="fd-card-title">🎨 Appearance</h3>
            <div className="fd-theme-row">
              {['dark', 'light', 'system'].map(t => (
                <button
                  key={t}
                  id={`theme-${t}`}
                  className={`fd-theme-btn ${theme === t ? 'active' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'} {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div className="fd-card fd-qr-pref-card" style={{ marginTop: '1rem' }}>
              <h4 style={{ marginBottom: '0.75rem', opacity: 0.8 }}>🔲 Default QR Settings</h4>
              <div className="fd-form-group">
                <label htmlFor="default-dur">Default Session Duration</label>
                <select id="default-dur" className="fd-select fd-select-full">
                  <option>30 seconds</option>
                  <option>45 seconds</option>
                  <option>1 minute</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="fd-card">
        <h3 className="fd-card-title">🔑 Change Password</h3>
        <div className="fd-form-grid-3">
          <div className="fd-form-group">
            <label htmlFor="cur-pass">Current Password</label>
            <input id="cur-pass" className="fd-input" type="password" placeholder="••••••••" />
          </div>
          <div className="fd-form-group">
            <label htmlFor="new-pass">New Password</label>
            <input id="new-pass" className="fd-input" type="password" placeholder="••••••••" />
          </div>
          <div className="fd-form-group">
            <label htmlFor="conf-pass">Confirm Password</label>
            <input id="conf-pass" className="fd-input" type="password" placeholder="••••••••" />
          </div>
        </div>
        <button id="change-pass-btn" className="fd-outline-btn" style={{ marginTop: '0.75rem' }}>
          🔒 Update Password
        </button>
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function FacultyDashboardPage() {
  const { user, logout } = useAuth()
  const router           = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'FA'

  return (
    <div className="fd-root">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fd-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fd-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="fd-sidebar-brand">
          <div className="fd-sidebar-logo">A</div>
          <span className="fd-sidebar-name">ATTENTIFY</span>
        </div>

        <nav className="fd-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`fd-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="fd-nav-icon">{item.icon}</span>
              <span className="fd-nav-label">{item.label}</span>
              {activeTab === item.id && <span className="fd-nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="fd-sidebar-footer">
          <div className="fd-user-chip">
            <div className="fd-user-avatar">{initials}</div>
            <div className="fd-user-info">
              <span className="fd-user-name">{user?.name}</span>
              <span className="fd-user-role">Faculty</span>
            </div>
          </div>
          <button id="logout-btn" className="fd-logout-btn" onClick={handleLogout} title="Sign out">
            ↩
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="fd-main-wrap">
        {/* Mobile topbar */}
        <header className="fd-mobile-topbar">
          <button className="fd-hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span className="fd-mobile-title">SmartAttend</span>
        </header>

        {/* Page header */}
        <header className="fd-topbar">
          <div className="fd-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="fd-hamburger-desktop" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle Sidebar">☰</button>
            <h1 className="fd-topbar-title">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
          </div>
          <div className="fd-topbar-right">
            <span className="fd-topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="fd-role-badge">Faculty</span>
          </div>
        </header>

        {/* Tab content */}
        <main className="fd-content">
          {activeTab === 'dashboard'  && <TabDashboard user={user} onNav={setActiveTab} />}
          {activeTab === 'attendance' && <TabAttendance />}
          {activeTab === 'qr'         && <TabQR />}
          {activeTab === 'settings'   && <TabSettings user={user} />}
        </main>
      </div>
    </div>
  )
}
