"use client";

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from '../hooks/useRouter'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './FacultyDashboardPage.css'

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',   icon: '🏠', label: 'Dashboard'   },
  { id: 'attendance',  icon: '📋', label: 'Attendance'  },
  { id: 'qr',          icon: '🔲', label: 'QR Code'     },
  { id: 'timetable',   icon: '📅', label: 'Timetable'   },
  { id: 'assignments', icon: '📝', label: 'Assignments'  },
  { id: 'settings',    icon: '⚙️',  label: 'Settings'   },
]

// ─── Live data hook ────────────────────────────────────────────────────────────
function useFacultyData() {
  const [records, setRecords] = useState([])
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const API = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [attRes, usersRes] = await Promise.all([
        fetch(`${API}/attendance/`),
        fetch(`${API}/auth/users`),
      ])
      if (attRes.ok)   setRecords(await attRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
    } catch(e) { console.error('Faculty data fetch error:', e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const students   = users.filter(u => u.role === 'student')
  const present    = records.filter(r => r.status === 'present').length
  const courseIds  = [...new Set(records.map(r => r.course_id).filter(Boolean))]

  return { records, students, present, courseIds, loading, refresh: fetchAll }
}


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
function TabDashboard({ user, onNav, liveData }) {
  const { present, absent, students, courseIds, records, loading } = liveData
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const rate = students.length > 0 ? Math.round(present / Math.max(records.length, 1) * 100) : 0

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
        <StatCard icon="📚" label="Active Courses"  value={loading ? '…' : courseIds.length || 0}  trend="From scans"               color="#a78bfa" />
        <StatCard icon="✅" label="Total Present"  value={loading ? '…' : present}               trend={`${rate}% rate`}          color="#34d399" />
        <StatCard icon="👥" label="Students"       value={loading ? '…' : students.length}         trend="Registered"               color="#60a5fa" />
        <StatCard icon="📋" label="Total Scans"    value={loading ? '…' : records.length}          trend="All time"                  color="#fbbf24" />
      </div>

      <div className="fd-section-grid">
        <div className="fd-card">
          <h3 className="fd-card-title">📈 Active Course Sessions</h3>
          {loading && <p style={{color:'var(--fd-muted,#888)', fontSize:'0.85rem'}}>Loading…</p>}
          {!loading && courseIds.length === 0 && (
            <p style={{color:'var(--fd-muted,#888)', fontSize:'0.85rem', padding:'1rem 0'}}>
              💭 No QR scans yet. Generate a QR code and ask students to scan it!
            </p>
          )}
          <div className="fd-course-list">
            {courseIds.map(id => {
              const count = records.filter(r => r.course_id === id && r.status === 'present').length
              return (
                <div key={id} className="fd-course-item">
                  <div className="fd-course-dot" />
                  <div className="fd-course-info">
                    <span className="fd-course-name">{id}</span>
                    <span className="fd-course-meta">{count} present scans recorded</span>
                  </div>
                  <button className="fd-sm-btn" onClick={() => onNav('qr')}>QR</button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="fd-card">
          <h3 className="fd-card-title">⚡ Quick Actions</h3>
          <div className="fd-quick-actions">
            {[
              { icon: '🔲', label: 'Generate QR',    id: 'qa-qr',       nav: 'qr'         },
              { icon: '📋', label: 'View Attendance', id: 'qa-attend',   nav: 'attendance' },
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
        <h3 className="fd-card-title">🕒 Recent Scans</h3>
        <div className="fd-activity-list">
          {loading && <p style={{color:'var(--fd-muted,#888)', fontSize:'0.85rem'}}>Loading…</p>}
          {!loading && records.length === 0 && (
            <p style={{color:'var(--fd-muted,#888)', fontSize:'0.85rem'}}>No attendance records yet.</p>
          )}
          {records.slice(0, 5).map((r, i) => (
            <div key={r._id || i} className="fd-activity-item fd-activity-success">
              <span className="fd-activity-time">{r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'}) : '—'}</span>
              <span className="fd-activity-msg">{r.student_id} — {r.course_id || '—'} — {r.method || 'scan'} ({r.status})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Attendance ─────────────────────────────────────────────────────────
function TabAttendance({ liveData }) {
  const { records, students, courseIds, loading } = liveData
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [searchQ, setSearchQ]               = useState('')

  const filtered = records.filter(r => {
    const matchCourse = selectedCourse === 'all' || r.course_id === selectedCourse
    const q = searchQ.toLowerCase()
    const matchSearch = (r.student_id || '').toLowerCase().includes(q) || (r.course_id || '').toLowerCase().includes(q)
    return matchCourse && matchSearch
  })

  const present = filtered.filter(r => r.status === 'present').length
  const total   = filtered.length
  const pct     = total ? Math.round(present / total * 100) : 0

  return (
    <div className="fd-tab-content">
      <div className="fd-section-header">
        <div>
          <h2 className="fd-section-title">📋 Attendance Register</h2>
          <p className="fd-section-sub">Live attendance records from the database</p>
        </div>
      </div>

      {/* Filters */}
      <div className="fd-filters">
        <input
          id="attendance-search"
          className="fd-search"
          type="text"
          placeholder="🔍  Search by student email or course…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <select id="course-filter" className="fd-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {courseIds.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </div>

      {/* Summary bar */}
      <div className="fd-attend-summary">
        <div className="fd-attend-summary-text">
          <span><strong>{present}</strong> Present</span>
          <span><strong>{filtered.filter(r => r.status === 'absent').length}</strong> Absent</span>
          <span><strong>{total}</strong> Total Records</span>
        </div>
        <div className="fd-progress-bar">
          <div className="fd-progress-fill" style={{ width: `${pct}%` }} />
          <span className="fd-progress-label">{pct}% Present Rate</span>
        </div>
      </div>

      {/* Table */}
      <div className="fd-card fd-table-wrap">
        {loading && <p style={{color:'var(--fd-muted,#888)', padding:'1rem', fontSize:'0.9rem'}}>Loading records…</p>}
        <table className="fd-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Course</th>
              <th>Method</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', opacity: 0.4 }}>No records found. Students need to scan a QR code first.</td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={r._id || i} className={`fd-tr-${r.status}`}>
                <td className="fd-td-num">{i + 1}</td>
                <td className="fd-td-name">{r.student_id}</td>
                <td><span className="fd-course-tag">{r.course_id || '—'}</span></td>
                <td>{r.method || '—'}</td>
                <td className="fd-td-time">{r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN',{dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                <td>
                  <span className={`fd-status-badge fd-status-${r.status}`}>
                    {r.status === 'present' ? '✅' : '❌'} {r.status}
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


// ─── Tab: QR Code Generator ──────────────────────────────────────────────────
function TabQR() {
  const [course, setCourse]       = useState('')
  const [duration, setDuration]   = useState(30)
  const [sessionNote, setNote]    = useState('')
  const [active, setActive]       = useState(false)
  const [timeLeft, setTimeLeft]   = useState(0)
  const [sessionId, setSessionId] = useState('')
  const [scanCount, setScanCount] = useState(0)
  const [tokenPayload, setTokenPayload] = useState('')
  const timerRef = useRef(null)

  const selectedCourse = { name: course || 'Course', room: '—', time: '—', students: 0 }

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

      // No simulated scan count

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

  const pct = 0


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
            <label htmlFor="qr-course">Course ID</label>
            <input
              id="qr-course"
              className="fd-input"
              type="text"
              placeholder="e.g. CS101, MATH201…"
              value={course}
              onChange={e => setCourse(e.target.value)}
              disabled={active}
            />
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
            <div className="fd-ci-row"><span>📚 Course ID</span><strong>{course || '—'}</strong></div>
            <div className="fd-ci-row"><span>⏱ Duration</span><strong>{duration}s</strong></div>
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

// ─── Tab: Timetable ───────────────────────────────────────────────────────────────
const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM']

function TabTimetable() {
  const STORE_KEY = 'fd_timetable'
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') } catch { return [] }
  })
  const [form, setForm] = useState({ day: 'Monday', slot: '8:00 AM', course: '', room: '' })
  const [editId, setEditId] = useState(null)
  const [saved, setSaved] = useState(false)

  const save = (list) => {
    setEntries(list)
    localStorage.setItem(STORE_KEY, JSON.stringify(list))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleAdd = () => {
    if (!form.course.trim()) return
    if (editId !== null) {
      save(entries.map(e => e.id === editId ? { ...form, id: editId } : e))
      setEditId(null)
    } else {
      save([...entries, { ...form, id: Date.now() }])
    }
    setForm(f => ({ ...f, course: '', room: '' }))
  }

  const handleEdit = (e) => {
    setForm({ day: e.day, slot: e.slot, course: e.course, room: e.room })
    setEditId(e.id)
  }

  const handleDelete = (id) => save(entries.filter(e => e.id !== id))

  // Build grid: day -> slot -> entry
  const grid = {}
  DAYS.forEach(d => { grid[d] = {} })
  entries.forEach(e => { if (grid[e.day]) grid[e.day][e.slot] = e })

  return (
    <div className="fd-tab-content">
      <div className="fd-section-header">
        <div>
          <h2 className="fd-section-title">📅 Manage Timetable</h2>
          <p className="fd-section-sub">Add and manage your weekly class schedule</p>
        </div>
        {saved && <span style={{color:'#34d399', fontWeight:600}}>✅ Saved!</span>}
      </div>

      {/* Add / Edit form */}
      <div className="fd-card" style={{marginBottom:'1.5rem'}}>
        <h3 className="fd-card-title">{editId ? '✏️ Edit Entry' : '➕ Add Class'}</h3>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'0.75rem', marginTop:'0.75rem'}}>
          <div>
            <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Day</label>
            <select className="fd-select" value={form.day} onChange={e => setForm(f => ({...f, day: e.target.value}))}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Time Slot</label>
            <select className="fd-select" value={form.slot} onChange={e => setForm(f => ({...f, slot: e.target.value}))}>
              {SLOTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Course ID</label>
            <input className="fd-input" placeholder="e.g. CS101" value={form.course} onChange={e => setForm(f => ({...f, course: e.target.value}))} />
          </div>
          <div>
            <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Room</label>
            <input className="fd-input" placeholder="e.g. Lab 3" value={form.room} onChange={e => setForm(f => ({...f, room: e.target.value}))} />
          </div>
        </div>
        <div style={{display:'flex', gap:'0.5rem', marginTop:'0.75rem'}}>
          <button className="fd-primary-btn" onClick={handleAdd}>{editId ? 'Update Entry' : '➕ Add to Timetable'}</button>
          {editId && <button className="fd-sm-btn" onClick={() => { setEditId(null); setForm(f => ({...f, course:'', room:''})) }}>Cancel</button>}
        </div>
      </div>

      {/* Timetable grid */}
      {entries.length === 0 ? (
        <div className="fd-card" style={{textAlign:'center', padding:'3rem', color:'var(--fd-muted,#888)'}}>
          📅 No classes added yet. Use the form above to build your timetable!
        </div>
      ) : (
        <div className="fd-card fd-table-wrap">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Course</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.flatMap(day =>
                SLOTS
                  .filter(slot => grid[day][slot])
                  .map(slot => {
                    const e = grid[day][slot]
                    return (
                      <tr key={e.id}>
                        <td><strong>{e.day}</strong></td>
                        <td><span className="fd-course-tag">{e.slot}</span></td>
                        <td className="fd-td-name">{e.course}</td>
                        <td>{e.room || '—'}</td>
                        <td>
                          <div style={{display:'flex', gap:'0.4rem'}}>
                            <button className="fd-sm-btn" onClick={() => handleEdit(e)}>✏️</button>
                            <button className="fd-toggle-btn" style={{color:'#f87171'}} onClick={() => handleDelete(e.id)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Assignments ───────────────────────────────────────────────────────────────
function TabAssignments() {
  const STORE_KEY = 'fd_assignments'
  const [assignments, setAssignments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') } catch { return [] }
  })
  const [form, setForm] = useState({ title: '', course: '', dueDate: '', description: '', marks: '' })
  const [editId, setEditId] = useState(null)
  const [filter, setFilter] = useState('all')

  const save = (list) => {
    setAssignments(list)
    localStorage.setItem(STORE_KEY, JSON.stringify(list))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.course.trim()) return
    if (editId !== null) {
      save(assignments.map(a => a.id === editId ? { ...form, id: editId, createdAt: a.createdAt } : a))
      setEditId(null)
    } else {
      save([{ ...form, id: Date.now(), createdAt: new Date().toISOString() }, ...assignments])
    }
    setForm({ title: '', course: '', dueDate: '', description: '', marks: '' })
  }

  const handleEdit = (a) => {
    setForm({ title: a.title, course: a.course, dueDate: a.dueDate, description: a.description, marks: a.marks })
    setEditId(a.id)
  }

  const handleDelete = (id) => save(assignments.filter(a => a.id !== id))

  const now = new Date()
  const filtered = assignments.filter(a => {
    if (filter === 'active') return !a.dueDate || new Date(a.dueDate) >= now
    if (filter === 'past')   return a.dueDate && new Date(a.dueDate) < now
    return true
  })

  const isOverdue = (a) => a.dueDate && new Date(a.dueDate) < now

  return (
    <div className="fd-tab-content">
      <div className="fd-section-header">
        <div>
          <h2 className="fd-section-title">📝 Assignments</h2>
          <p className="fd-section-sub">Create and manage assignments for your students</p>
        </div>
        <div className="fd-filter-pills" style={{display:'flex', gap:'0.5rem'}}>
          {['all','active','past'].map(f => (
            <button key={f} className={`fd-sm-btn ${filter === f ? 'active' : ''}`}
              style={filter === f ? {background:'var(--fd-accent,#a78bfa)', color:'#fff', border:'none'} : {}}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="fd-card" style={{marginBottom:'1.5rem'}}>
        <h3 className="fd-card-title">{editId ? '✏️ Edit Assignment' : '➕ New Assignment'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'0.75rem', marginTop:'0.75rem'}}>
            <div>
              <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Title *</label>
              <input className="fd-input" placeholder="e.g. Mini Project Report" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
            </div>
            <div>
              <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Course ID *</label>
              <input className="fd-input" placeholder="e.g. CS101" value={form.course} onChange={e => setForm(f => ({...f, course: e.target.value}))} required />
            </div>
            <div>
              <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Due Date</label>
              <input className="fd-input" type="date" value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} />
            </div>
            <div>
              <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Max Marks</label>
              <input className="fd-input" type="number" placeholder="e.g. 100" value={form.marks} onChange={e => setForm(f => ({...f, marks: e.target.value}))} />
            </div>
          </div>
          <div style={{marginTop:'0.75rem'}}>
            <label style={{fontSize:'0.8rem', color:'var(--fd-muted,#888)', display:'block', marginBottom:4}}>Description / Instructions</label>
            <textarea className="fd-input" rows={3} placeholder="Describe the assignment, submission guidelines, topics…" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{resize:'vertical', width:'100%', fontFamily:'inherit'}} />
          </div>
          <div style={{display:'flex', gap:'0.5rem', marginTop:'0.75rem'}}>
            <button type="submit" className="fd-primary-btn">{editId ? '✅ Update' : '📎 Post Assignment'}</button>
            {editId && <button type="button" className="fd-sm-btn" onClick={() => { setEditId(null); setForm({ title:'', course:'', dueDate:'', description:'', marks:'' }) }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* Assignment cards */}
      {filtered.length === 0 ? (
        <div className="fd-card" style={{textAlign:'center', padding:'3rem', color:'var(--fd-muted,#888)'}}>
          📝 No assignments yet. Create one using the form above!
        </div>
      ) : (
        <div style={{display:'grid', gap:'1rem'}}>
          {filtered.map(a => (
            <div key={a.id} className="fd-card" style={{
              borderLeft: `4px solid ${isOverdue(a) ? '#f87171' : '#34d399'}`,
              opacity: isOverdue(a) ? 0.85 : 1
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem'}}>
                <div>
                  <span className="fd-course-tag" style={{marginRight:'0.5rem'}}>{a.course}</span>
                  {isOverdue(a) && <span style={{background:'#f871711a', color:'#f87171', borderRadius:4, padding:'2px 8px', fontSize:'0.75rem', fontWeight:600}}>PAST DUE</span>}
                  {!isOverdue(a) && a.dueDate && <span style={{background:'#34d3991a', color:'#34d399', borderRadius:4, padding:'2px 8px', fontSize:'0.75rem', fontWeight:600}}>ACTIVE</span>}
                </div>
                <div style={{display:'flex', gap:'0.4rem'}}>
                  <button className="fd-sm-btn" onClick={() => handleEdit(a)}>✏️ Edit</button>
                  <button className="fd-toggle-btn" style={{color:'#f87171'}} onClick={() => handleDelete(a.id)}>🗑️</button>
                </div>
              </div>
              <h3 style={{margin:'0.5rem 0 0.25rem', fontSize:'1.05rem'}}>{a.title}</h3>
              {a.description && <p style={{fontSize:'0.88rem', color:'var(--fd-muted,#888)', margin:'0 0 0.5rem'}}>{a.description}</p>}
              <div style={{display:'flex', gap:'1.5rem', fontSize:'0.82rem', color:'var(--fd-muted,#888)', flexWrap:'wrap'}}>
                {a.dueDate && <span>📅 Due: <strong>{new Date(a.dueDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong></span>}
                {a.marks && <span>🏆 Marks: <strong>{a.marks}</strong></span>}
                <span>🕒 Posted: {new Date(a.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Settings ───────────────────────────────────────────────────────────────
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
  const liveData = useFacultyData()

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
          {activeTab === 'dashboard'   && <TabDashboard user={user} onNav={setActiveTab} liveData={liveData} />}
          {activeTab === 'attendance'  && <TabAttendance liveData={liveData} />}
          {activeTab === 'qr'          && <TabQR />}
          {activeTab === 'timetable'   && <TabTimetable />}
          {activeTab === 'assignments' && <TabAssignments />}
          {activeTab === 'settings'    && <TabSettings user={user} />}
        </main>
      </div>
    </div>
  )
}
