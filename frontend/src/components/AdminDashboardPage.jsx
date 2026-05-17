"use client";

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from '../hooks/useRouter'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './AdminDashboardPage.css'

// ─── Mock data ────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'CS',   name: 'Computer Science',       hod: 'Dr. Rajan Kumar',   faculty: 12, students: 320, avgAttend: 88, color: '#a78bfa' },
  { id: 'EC',   name: 'Electronics & Comm.',     hod: 'Prof. Meera Iyer',  faculty: 10, students: 280, avgAttend: 82, color: '#38bdf8' },
  { id: 'ME',   name: 'Mechanical Engineering',  hod: 'Dr. Anand V.',      faculty: 9,  students: 260, avgAttend: 79, color: '#34d399' },
  { id: 'CV',   name: 'Civil Engineering',       hod: 'Prof. Suresh R.',   faculty: 8,  students: 240, avgAttend: 85, color: '#fbbf24' },
  { id: 'BT',   name: 'Biotechnology',           hod: 'Dr. Priya Nair',    faculty: 7,  students: 180, avgAttend: 91, color: '#f87171' },
  { id: 'MBA',  name: 'Business Administration', hod: 'Prof. Kiran Das',   faculty: 6,  students: 150, avgAttend: 76, color: '#fb923c' },
]

const SUBJECTS = {
  'CS': ['Data Structures', 'Operating Systems', 'Database Systems', 'Computer Networks', 'Machine Learning'],
  'EC': ['Signals & Systems', 'Microprocessors', 'Digital Logic', 'VLSI Design'],
  'ME': ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Robotics'],
  'CV': ['Structural Analysis', 'Fluid Mechanics', 'Geotechnical Engg', 'Transportation'],
  'BT': ['Genetics', 'Bioinformatics', 'Cell Biology', 'Immunology'],
  'MBA': ['Marketing Management', 'Financial Accounting', 'Business Ethics', 'HR Management']
}



const ACTIVITY_LOG = [
  { time: '2 min ago',   msg: 'Rahul Verma marked present via QR — CS101',        type: 'success' },
  { time: '5 min ago',   msg: 'New QR session started by Prof. Sharma for CS205', type: 'info'    },
  { time: '12 min ago',  msg: 'Priya Singh account deactivated by Admin',          type: 'warn'    },
  { time: '28 min ago',  msg: 'Weekly attendance report generated (CS dept)',       type: 'neutral' },
  { time: '1 hr ago',    msg: 'New department "Biotechnology" added',              type: 'info'    },
  { time: '3 hrs ago',   msg: 'System backup completed successfully',              type: 'success' },
  { time: 'Yesterday',   msg: 'Dr. Rajan Kumar added as HOD — EC dept',           type: 'info'    },
  { time: 'Yesterday',   msg: '3 students suspended pending attendance review',    type: 'warn'    },
]

const NAV_ITEMS = [
  { id: 'overview',    icon: '🏠', label: 'Overview'        },
  { id: 'departments', icon: '🏛️', label: 'Departments'     },
  { id: 'users',       icon: '👥', label: 'User Management' },
  { id: 'settings',    icon: '⚙️',  label: 'Settings'       },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const totalStudents = DEPARTMENTS.reduce((s, d) => s + d.students, 0)
const totalFaculty  = DEPARTMENTS.reduce((s, d) => s + d.faculty, 0)
const avgAttend     = Math.round(DEPARTMENTS.reduce((s, d) => s + d.avgAttend, 0) / DEPARTMENTS.length)

function pctColor(p) {
  if (p >= 85) return '#34d399'
  if (p >= 75) return '#fbbf24'
  return '#f87171'
}

function StatCard({ icon, label, value, sub, color, trend }) {
  return (
    <div className="ad-stat-card" style={{ '--accent': color }}>
      <div className="ad-stat-icon">{icon}</div>
      <div className="ad-stat-body">
        <span className="ad-stat-value">{value}</span>
        <span className="ad-stat-label">{label}</span>
        {sub   && <span className="ad-stat-sub">{sub}</span>}
        {trend && <span className="ad-stat-trend">{trend}</span>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════
function TabOverview({ user, users, onNav }) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const activeUsers   = users.filter(u => u.status === 'active').length
  const inactiveUsers = users.filter(u => u.status === 'inactive').length

  return (
    <div className="ad-tab-content">
      {/* Welcome banner */}
      <div className="ad-welcome-banner">
        <div>
          <h2 className="ad-welcome-title">Welcome back, <span>{user?.name || 'Admin'}</span> 🛡️</h2>
          <p className="ad-welcome-date">{today}</p>
        </div>
        <div className="ad-banner-actions">
          <button className="ad-outline-btn" onClick={() => onNav('users')}>👥 Manage Users</button>
          <button className="ad-primary-btn" onClick={() => onNav('departments')}>🏛️ Departments</button>
        </div>
      </div>

      {/* Stat row */}
      <div className="ad-stats-row">
        <StatCard icon="🎓" label="Total Students"   value={totalStudents.toLocaleString()} sub={`Across ${DEPARTMENTS.length} depts`} color="#a78bfa" trend="+12 this week" />
        <StatCard icon="👨‍🏫" label="Faculty Members"  value={totalFaculty}                   sub="Active instructors"                  color="#38bdf8" trend="+2 this month" />
        <StatCard icon="📊" label="Avg. Attendance"  value={`${avgAttend}%`}                sub="All departments"                     color="#34d399" trend="+1.4% vs last week" />
        <StatCard icon="⚠️" label="Inactive Users"   value={inactiveUsers}                  sub="Requires review"                     color="#f87171" />
      </div>

      {/* Dept attendance bars + Activity */}
      <div className="ad-section-grid">
        {/* Dept bars */}
        <div className="ad-card">
          <div className="ad-card-title-row">
            <h3 className="ad-card-title">🏛️ Department Attendance</h3>
            <button className="ad-text-btn" onClick={() => onNav('departments')}>View all →</button>
          </div>
          <div className="ad-dept-bars">
            {DEPARTMENTS.map(d => (
              <div key={d.id} className="ad-dept-bar-row">
                <span className="ad-dept-bar-name">{d.name}</span>
                <div className="ad-bar-track">
                  <div className="ad-bar-fill" style={{ width: `${d.avgAttend}%`, background: pctColor(d.avgAttend) }} />
                  <div className="ad-bar-min-line" title="75% minimum" />
                </div>
                <span className="ad-bar-pct" style={{ color: pctColor(d.avgAttend) }}>{d.avgAttend}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="ad-card">
          <h3 className="ad-card-title">🕒 System Activity</h3>
          <div className="ad-activity-list">
            {ACTIVITY_LOG.slice(0, 6).map((a, i) => (
              <div key={i} className={`ad-activity-item ad-act-${a.type}`}>
                <span className="ad-activity-time">{a.time}</span>
                <span className="ad-activity-msg">{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="ad-section-grid-3">
        <div className="ad-card ad-health-card">
          <h3 className="ad-card-title">💻 System Health</h3>
          {[
            { label: 'API Server',          status: 'online',  dot: '#34d399' },
            { label: 'Face Recognition AI', status: 'online',  dot: '#34d399' },
            { label: 'QR Session Engine',   status: 'online',  dot: '#34d399' },
            { label: 'Email Service',        status: 'warning', dot: '#fbbf24' },
            { label: 'Database',             status: 'online',  dot: '#34d399' },
          ].map((s, i) => (
            <div key={i} className="ad-health-row">
              <span className="ad-health-dot" style={{ background: s.dot }} />
              <span className="ad-health-label">{s.label}</span>
              <span className="ad-health-status" style={{ color: s.dot }}>{s.status}</span>
            </div>
          ))}
        </div>

        <div className="ad-card">
          <h3 className="ad-card-title">👥 User Breakdown</h3>
          <div className="ad-user-breakdown">
            {[
              { role: 'Admin',   count: users.filter(u=>u.role==='admin').length,   color: '#a78bfa', icon: '🛡️' },
              { role: 'Faculty', count: users.filter(u=>u.role==='teacher').length, color: '#38bdf8', icon: '👨‍🏫' },
              { role: 'Student', count: users.filter(u=>u.role==='student').length, color: '#34d399', icon: '🎓' },
            ].map(u => (
              <div key={u.role} className="ad-user-type-row">
                <div className="ad-user-type-icon">{u.icon}</div>
                <div className="ad-user-type-body">
                  <span className="ad-user-type-name">{u.role}</span>
                  <div className="ad-bar-track ad-bar-sm">
                    <div className="ad-bar-fill" style={{ width: `${users.length ? (u.count / users.length * 100) : 0}%`, background: u.color }} />
                  </div>
                </div>
                <span className="ad-user-type-count" style={{ color: u.color }}>{u.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-card">
          <h3 className="ad-card-title">⚡ Quick Actions</h3>
          <div className="ad-quick-actions">
            {[
              { icon: '👤', label: 'Add User',       id: 'qa-adduser',   nav: 'users'       },
              { icon: '🏛️', label: 'Add Dept',       id: 'qa-adddept',   nav: 'departments' },
              { icon: '📤', label: 'Export Report',  id: 'qa-export',    nav: null          },
              { icon: '🔔', label: 'Broadcast Alert',id: 'qa-broadcast', nav: null          },
              { icon: '🔒', label: 'Lock System',    id: 'qa-lock',      nav: null          },
              { icon: '📋', label: 'View Logs',      id: 'qa-logs',      nav: null          },
            ].map(a => (
              <button key={a.id} id={a.id} className="ad-qa-btn" onClick={() => a.nav && onNav(a.nav)}>
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: DEPARTMENTS
// ═══════════════════════════════════════════════════════════
function TabDepartments() {
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [depts, setDepts]       = useState(DEPARTMENTS)
  const [form, setForm]         = useState({ name: '', hod: '', id: '' })
  const [saved, setSaved]       = useState(false)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const newDept = {
      id: form.id || form.name.slice(0, 3).toUpperCase(),
      name: form.name, hod: form.hod,
      faculty: 0, students: 0, avgAttend: 0,
      color: '#a78bfa',
    }
    setDepts(p => [newDept, ...p])
    setForm({ name: '', hod: '', id: '' })
    setShowForm(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="ad-tab-content">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">🏛️ Departments</h2>
          <p className="ad-section-sub">Manage all academic departments</p>
        </div>
        <button id="add-dept-btn" className="ad-primary-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '＋ Add Department'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="ad-card ad-form-card">
          <h3 className="ad-card-title">➕ New Department</h3>
          <form onSubmit={handleAdd} className="ad-inline-form">
            <div className="ad-form-group">
              <label htmlFor="dept-code">Code</label>
              <input id="dept-code" className="ad-input" placeholder="e.g. EE" value={form.id} onChange={e => setForm(p => ({ ...p, id: e.target.value.toUpperCase() }))} maxLength={5} />
            </div>
            <div className="ad-form-group ad-fg-wide">
              <label htmlFor="dept-name">Department Name</label>
              <input id="dept-name" className="ad-input" placeholder="e.g. Electrical Engineering" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="ad-form-group ad-fg-wide">
              <label htmlFor="dept-hod">Head of Department</label>
              <input id="dept-hod" className="ad-input" placeholder="e.g. Dr. Name" value={form.hod} onChange={e => setForm(p => ({ ...p, hod: e.target.value }))} />
            </div>
            <button type="submit" id="save-dept-btn" className="ad-primary-btn" style={{ alignSelf: 'flex-end' }}>Save</button>
          </form>
        </div>
      )}

      {saved && <div className="ad-toast">✅ Department added successfully</div>}

      {/* Dept stats summary */}
      <div className="ad-dept-summary-row">
        <StatCard icon="🏛️" label="Departments" value={depts.length}   color="#a78bfa" />
        <StatCard icon="🎓" label="Students"     value={totalStudents.toLocaleString()} color="#34d399" />
        <StatCard icon="👨‍🏫" label="Faculty"     value={totalFaculty}  color="#38bdf8" />
        <StatCard icon="📊" label="Avg. Attend"  value={`${avgAttend}%`} color="#fbbf24" />
      </div>

      {/* Dept cards */}
      <div className="ad-dept-cards">
        {depts.map(d => {
          const isOpen = selected === d.id
          return (
            <div
              key={d.id}
              id={`dept-${d.id}`}
              className={`ad-dept-card ${isOpen ? 'open' : ''}`}
              style={{ '--dcolor': d.color }}
            >
              <div className="ad-dept-card-header" onClick={() => setSelected(isOpen ? null : d.id)}>
                <div className="ad-dept-badge" style={{ background: `${d.color}22`, color: d.color, border: `1px solid ${d.color}44` }}>
                  {d.id}
                </div>
                <div className="ad-dept-header-body">
                  <h4 className="ad-dept-name">{d.name}</h4>
                  <span className="ad-dept-hod">👤 {d.hod}</span>
                </div>
                <span className="ad-dept-pct" style={{ color: pctColor(d.avgAttend) }}>{d.avgAttend}%</span>
                <span className="ad-dept-chevron">{isOpen ? '▲' : '▼'}</span>
              </div>

              <div className="ad-dept-bar-wrap">
                <div className="ad-bar-track">
                  <div className="ad-bar-fill" style={{ width: `${d.avgAttend}%`, background: pctColor(d.avgAttend) }} />
                  <div className="ad-bar-min-line" />
                </div>
              </div>

              {isOpen && (
                <div className="ad-dept-detail">
                  <div className="ad-dept-detail-grid">
                    <div className="ad-detail-box">
                      <span className="ad-detail-box-val">{d.students}</span>
                      <span className="ad-detail-box-label">Students</span>
                    </div>
                    <div className="ad-detail-box">
                      <span className="ad-detail-box-val">{d.faculty}</span>
                      <span className="ad-detail-box-label">Faculty</span>
                    </div>
                    <div className="ad-detail-box">
                      <span className="ad-detail-box-val" style={{ color: pctColor(d.avgAttend) }}>{d.avgAttend}%</span>
                      <span className="ad-detail-box-label">Avg Attend</span>
                    </div>
                    <div className="ad-detail-box">
                      <span className="ad-detail-box-val">{Math.round(d.students / (d.faculty || 1))}</span>
                      <span className="ad-detail-box-label">Student/Faculty</span>
                    </div>
                  </div>
                  <div className="ad-dept-detail-actions">
                    <button className="ad-sm-btn">✏️ Edit</button>
                    <button className="ad-sm-btn ad-sm-danger">🗑️ Remove</button>
                    <button className="ad-sm-btn">📤 Export</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: USER MANAGEMENT
// ═══════════════════════════════════════════════════════════
function TabUsers({ users, setUsers }) {
  const [searchQ, setSearch]        = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [showForm, setShowForm]     = useState(false)
  const { register } = useAuth()
  const [newUser, setNewUser]       = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', dept: 'CS', subject: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [toast, setToast]           = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const filtered = useMemo(() => users.filter(u => {
    const q = searchQ.toLowerCase()
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    const matchDept   = deptFilter === 'all' || u.dept === deptFilter
    return matchSearch && matchRole && matchDept
  }), [users, searchQ, roleFilter, deptFilter])

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ))
  }

  const deleteUser = async (id, email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      if (email.endsWith('@smartattend.com')) {
        // Just mock deletion for mock users that don't exist in DB
        setUsers(prev => prev.filter(u => u.id !== id))
        showToast('🗑️ User removed (Mock Data)')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/users/${email}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete user");
      }
      setUsers(prev => prev.filter(u => u.id !== id))
      showToast('🗑️ User removed from database')
    } catch (err) {
      showToast(`❌ Error: ${err.message}`)
    }
  }

  const addUser = async (e) => {
    e.preventDefault()
    if (newUser.password !== newUser.confirmPassword) { showToast('❌ Passwords do not match'); return }
    if (newUser.password.length < 8) { showToast('❌ Password must be at least 8 chars'); return }
    if (!/(?=.*[A-Z])/.test(newUser.password)) { showToast('❌ Password needs an uppercase letter'); return }
    if (!/(?=.*\d)/.test(newUser.password)) { showToast('❌ Password needs a number'); return }
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\\/?])/.test(newUser.password)) { showToast('❌ Password needs a special symbol'); return }
    
    const btn = document.getElementById('save-user-btn')
    if(btn) btn.disabled = true;

    try {
      await register(newUser.email, newUser.password, newUser.role, newUser.name, newUser.dept, newUser.role === 'teacher' ? newUser.subject : '')
      
      const u = {
        ...newUser,
        id: `U${String(users.length + 1).padStart(3, '0')}`,
        status: 'active', joined: 'Just now',
      }
      setUsers(prev => [u, ...prev])
      setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'student', dept: 'CS', subject: '' })
      setShowForm(false)
      showToast('✅ User added to database successfully')
    } catch (err) {
      showToast(`❌ Failed: ${err.message}`)
    } finally {
      if(btn) btn.disabled = false;
    }
  }

  const roleMeta = { admin: { color: '#a78bfa', icon: '🛡️' }, teacher: { color: '#38bdf8', icon: '👨‍🏫' }, student: { color: '#34d399', icon: '🎓' } }
  const active   = users.filter(u => u.status === 'active').length

  return (
    <div className="ad-tab-content">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">👥 User Management</h2>
          <p className="ad-section-sub">View, add, and manage all system users</p>
        </div>
        <button id="add-user-btn" className="ad-primary-btn" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '＋ Add User'}
        </button>
      </div>

      {toast && <div className="ad-toast">{toast}</div>}

      {/* Add user form */}
      {showForm && (
        <div className="ad-card ad-form-card">
          <h3 className="ad-card-title">➕ New User</h3>
          <form onSubmit={addUser} className="ad-inline-form">
            <div className="ad-form-group ad-fg-wide">
              <label htmlFor="u-name">Full Name</label>
              <input id="u-name" className="ad-input" placeholder="Full name" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="ad-form-group ad-fg-wide">
              <label htmlFor="u-email">Email</label>
              <input id="u-email" className="ad-input" type="email" placeholder="user@smartattend.com" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="ad-form-group ad-fg-wide">
              <label htmlFor="u-password">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input id="u-password" className="ad-input" type={showPassword ? "text" : "password"} placeholder="••••••••" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required style={{ flex: 1, paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="ad-form-group ad-fg-wide">
              <label htmlFor="u-confirm-password">Confirm Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input id="u-confirm-password" className="ad-input" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={newUser.confirmPassword} onChange={e => setNewUser(p => ({ ...p, confirmPassword: e.target.value }))} required style={{ flex: 1, paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowConfirmPassword(p => !p)} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7 }}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="ad-form-group">
              <label htmlFor="u-role">Role</label>
              <select id="u-role" className="ad-select" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                <option value="student">Student</option>
                <option value="teacher">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="ad-form-group">
              <label htmlFor="u-dept">Department</label>
              <select id="u-dept" className="ad-select" value={newUser.dept} onChange={e => {
                const newDept = e.target.value;
                setNewUser(p => ({ ...p, dept: newDept, subject: SUBJECTS[newDept]?.[0] || '' }))
              }}>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
              </select>
            </div>
            {newUser.role === 'teacher' && (
              <div className="ad-form-group ad-fg-wide">
                <label htmlFor="u-subject">Subject</label>
                <select id="u-subject" className="ad-select" value={newUser.subject || (SUBJECTS[newUser.dept]?.[0] || '')} onChange={e => setNewUser(p => ({ ...p, subject: e.target.value }))}>
                  {SUBJECTS[newUser.dept]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <button type="submit" id="save-user-btn" className="ad-primary-btn" style={{ alignSelf: 'flex-end' }}>Add User</button>
          </form>

          {newUser.role === 'student' && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>📸 Manage Face Profile</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--ad-muted)', marginBottom: '1rem' }}>Register the student's face profile for attendance. <strong style={{color:'var(--ad-primary)'}}>Make sure to enter their Email above first.</strong></p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: '160px', height: '160px', background: '#000', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  <video id="add-register-video" autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <button 
                    type="button"
                    className="ad-outline-btn ad-btn-full" 
                    onClick={() => {
                      navigator.mediaDevices.getUserMedia({ video: true })
                        .then(s => {
                          const v = document.getElementById('add-register-video')
                          v.srcObject = s
                          v.play()
                          v.setAttribute('data-active', 'true')
                          window._addRegisterStream = s;
                        })
                        .catch(e => alert('Camera error: ' + e.message))
                    }}>
                    1. Turn On Camera
                  </button>
                  <button 
                    type="button"
                    className="ad-primary-btn ad-btn-full" 
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => {
                      if (!newUser.email.trim()) { alert("Please enter the student's Email in the form above first!"); return; }
                      const v = document.getElementById('add-register-video')
                      if (!v || v.getAttribute('data-active') !== 'true') return;
                      const c = document.createElement('canvas')
                      c.width = v.videoWidth; c.height = v.videoHeight;
                      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
                      const btn = document.activeElement;
                      const originalHtml = btn.innerHTML;
                      btn.innerHTML = '<span class="ad-spinner"></span> Uploading...';
                      c.toBlob(async blob => {
                        const fd = new FormData();
                        fd.append('file', blob, 'face.jpg')
                        fd.append('student_id', newUser.email)
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/register`, { method: "POST", body: fd })
                          const d = await res.json()
                          if(!res.ok) throw new Error(d.detail)
                          alert("✅ Face Registered Successfully!")
                        } catch(e) { 
                          alert("❌ Registration failed: " + e.message) 
                        } finally {
                          btn.innerHTML = originalHtml;
                          if (window._addRegisterStream) {
                            window._addRegisterStream.getTracks().forEach(t => t.stop());
                            v.removeAttribute('data-active');
                          }
                        }
                      }, 'image/jpeg')
                    }}>
                    2. Capture & Register Face
                  </button>
                  <div style={{ marginTop: '0.75rem' }}>
                    <label className="ad-outline-btn ad-btn-full" style={{ cursor: 'pointer', textAlign: 'center', display: 'block' }}>
                      Upload Photo Instead
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                        if (!newUser.email.trim()) { alert("Please enter the student's Email in the form above first!"); e.target.value = ''; return; }
                        const file = e.target.files[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file, 'face.jpg');
                        fd.append('student_id', newUser.email);
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/register`, { method: "POST", body: fd })
                          const d = await res.json()
                          if(!res.ok) throw new Error(d.detail)
                          alert("✅ Face Registered Successfully from Upload!")
                        } catch(err) {
                          alert("❌ Registration failed: " + err.message)
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit user form & Face registration */}
      {editingUser && (
        <div className="ad-card ad-form-card" style={{ border: '1px solid var(--ad-primary)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="ad-card-title" style={{ margin: 0 }}>✏️ Edit User: {editingUser.name}</h3>
            <button className="ad-text-btn" onClick={() => {
              setEditingUser(null)
              if (window._registerStream) window._registerStream.getTracks().forEach(t => t.stop())
            }}>✕ Close</button>
          </div>
          <form className="ad-inline-form" style={{ marginBottom: '1.5rem' }}>
            <div className="ad-form-group ad-fg-wide">
              <label>Full Name</label>
              <input className="ad-input" value={editingUser.name} onChange={e => setEditingUser(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="ad-form-group ad-fg-wide">
              <label>Email</label>
              <input className="ad-input" value={editingUser.email} onChange={e => setEditingUser(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="ad-form-group">
              <label>Role</label>
              <select className="ad-select" value={editingUser.role} onChange={e => setEditingUser(p => ({ ...p, role: e.target.value }))}>
                <option value="student">Student</option>
                <option value="teacher">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="ad-form-group">
              <label>Department</label>
              <select className="ad-select" value={editingUser.dept} onChange={e => setEditingUser(p => ({ ...p, dept: e.target.value }))}>
                <option value="—">—</option>
                {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
              </select>
            </div>
            <button type="button" className="ad-primary-btn" style={{ alignSelf: 'flex-end' }} onClick={() => {
              setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
              setEditingUser(null);
              showToast('✅ User updated successfully');
            }}>Save Changes</button>
          </form>

          {editingUser.role === 'student' && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '600' }}>📸 Manage Face Profile</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--ad-muted)', marginBottom: '1rem' }}>Register or update the student's face profile for attendance.</p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: '160px', height: '160px', background: '#000', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                  <video id="admin-register-video" autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <button 
                    className="ad-outline-btn ad-btn-full" 
                    onClick={() => {
                      navigator.mediaDevices.getUserMedia({ video: true })
                        .then(s => {
                          const v = document.getElementById('admin-register-video')
                          v.srcObject = s
                          v.play()
                          v.setAttribute('data-active', 'true')
                          window._registerStream = s;
                        })
                        .catch(e => alert('Camera error: ' + e.message))
                    }}>
                    1. Turn On Camera
                  </button>
                  <button 
                    className="ad-primary-btn ad-btn-full" 
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => {
                      const v = document.getElementById('admin-register-video')
                      if (!v || v.getAttribute('data-active') !== 'true') return;
                      const c = document.createElement('canvas')
                      c.width = v.videoWidth; c.height = v.videoHeight;
                      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
                      const btn = document.activeElement;
                      if(btn) btn.innerHTML = '<span class="ad-spinner"></span> Uploading...';
                      c.toBlob(async blob => {
                        const fd = new FormData();
                        fd.append('file', blob, 'face.jpg')
                        fd.append('student_id', editingUser.email)
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/register`, { method: "POST", body: fd })
                          const d = await res.json()
                          if(!res.ok) throw new Error(d.detail)
                          alert("✅ Face Registered Successfully!")
                        } catch(e) { 
                          alert("❌ Registration failed: " + e.message) 
                        } finally {
                          if(btn) btn.innerHTML = '2. Capture & Register Face';
                          if (window._registerStream) {
                            window._registerStream.getTracks().forEach(t => t.stop());
                            v.removeAttribute('data-active');
                          }
                        }
                      }, 'image/jpeg')
                    }}>
                    2. Capture & Register Face
                  </button>
                  <div style={{ marginTop: '0.75rem' }}>
                    <label className="ad-outline-btn ad-btn-full" style={{ cursor: 'pointer', textAlign: 'center', display: 'block' }}>
                      Upload Photo Instead
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.append('file', file, 'face.jpg');
                        fd.append('student_id', editingUser.email);
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/register`, { method: "POST", body: fd })
                          const d = await res.json()
                          if(!res.ok) throw new Error(d.detail)
                          alert("✅ Face Registered Successfully from Upload!")
                        } catch(err) {
                          alert("❌ Registration failed: " + err.message)
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="ad-user-summary">
        <div className="ad-user-summary-pills">
          <span className="ad-sum-pill" style={{ color: '#34d399' }}>● Active: {active}</span>
          <span className="ad-sum-pill" style={{ color: '#f87171' }}>● Inactive: {users.length - active}</span>
          <span className="ad-sum-pill" style={{ color: '#a78bfa' }}>🛡️ Admins: {users.filter(u=>u.role==='admin').length}</span>
          <span className="ad-sum-pill" style={{ color: '#38bdf8' }}>👨‍🏫 Faculty: {users.filter(u=>u.role==='teacher').length}</span>
          <span className="ad-sum-pill" style={{ color: '#34d399' }}>🎓 Students: {users.filter(u=>u.role==='student').length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="ad-filters">
        <input id="user-search" className="ad-input ad-input-search" placeholder="🔍  Search name, email or ID…" value={searchQ} onChange={e => setSearch(e.target.value)} />
        <select id="role-filter" className="ad-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Faculty</option>
          <option value="student">Student</option>
        </select>
        <select id="dept-filter" className="ad-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="all">All Depts</option>
          {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="ad-card ad-table-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Dept</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="ad-empty-row">No users found</td></tr>
            )}
            {filtered.map(u => {
              const rm = roleMeta[u.role] || roleMeta.student
              return (
                <tr key={u.id}>
                  <td><code className="ad-id-code">{u.id}</code></td>
                  <td className="ad-td-name">{u.name}</td>
                  <td className="ad-td-email">{u.email}</td>
                  <td>
                    <span className="ad-role-pill" style={{ background: `${rm.color}18`, color: rm.color, border: `1px solid ${rm.color}33` }}>
                      {rm.icon} {u.role}
                    </span>
                  </td>
                  <td>
                    {u.dept !== '—'
                      ? <span className="ad-dept-code-chip">{u.dept}</span>
                      : <span style={{ color: 'var(--ad-muted)' }}>—</span>}
                  </td>
                  <td className="ad-td-date">{u.joined}</td>
                  <td>
                    <span className={`ad-status-badge ${u.status === 'active' ? 'ad-status-active' : 'ad-status-inactive'}`}>
                      {u.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="ad-row-actions">
                      <button id={`toggle-${u.id}`} className="ad-icon-btn" title="Toggle status" onClick={() => toggleStatus(u.id)}>⇄</button>
                      <button id={`edit-${u.id}`}   className="ad-icon-btn" title="Edit user" onClick={() => setEditingUser({ ...u })}>✏️</button>
                      <button id={`del-${u.id}`}    className="ad-icon-btn ad-icon-danger" title="Delete user" onClick={() => deleteUser(u.id, u.email)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
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
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: '+91 98765 00001',
    org:   'ATTENTIFY Institute of Technology',
  })
  const [system, setSystem] = useState({
    minAttend:    75,
    lateWindow:   15,
    qrExpiry:     10,
    autoNotif:    true,
    faceEnable:   true,
    qrEnable:     true,
    backupAuto:   true,
    maintenanceMode: false,
  })
  const [notif, setNotif] = useState({
    emailDigest: true,
    alerts:      true,
    reports:     true,
    security:    true,
  })
  const [saved, setSaved]   = useState(false)
  const [danger, setDanger] = useState(false)

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="ad-tab-content">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">⚙️ System Settings</h2>
          <p className="ad-section-sub">Configure global system behaviour and preferences</p>
        </div>
        <button id="save-settings-btn" className={`ad-primary-btn ${saved ? 'ad-btn-success' : ''}`} onClick={save}>
          {saved ? '✅ Saved!' : '💾 Save Changes'}
        </button>
      </div>

      <div className="ad-settings-grid">
        {/* Admin profile */}
        <div className="ad-card">
          <h3 className="ad-card-title">👤 Admin Profile</h3>
          <div className="ad-profile-row">
            <div className="ad-avatar-lg">
              {profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="ad-avatar-name">{profile.name}</p>
              <p className="ad-avatar-sub">System Administrator</p>
            </div>
          </div>
          <div className="ad-form-grid">
            {[
              { id: 'set-name',  label: 'Full Name',    key: 'name',  type: 'text'  },
              { id: 'set-email', label: 'Email',         key: 'email', type: 'email' },
              { id: 'set-phone', label: 'Phone',         key: 'phone', type: 'tel'   },
              { id: 'set-org',   label: 'Organisation',  key: 'org',   type: 'text'  },
            ].map(f => (
              <div key={f.id} className="ad-form-group">
                <label htmlFor={f.id}>{f.label}</label>
                <input id={f.id} className="ad-input" type={f.type} value={profile[f.key]}
                  onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* System config */}
          <div className="ad-card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="ad-card-title">🔧 System Configuration</h3>
            <div className="ad-config-grid">
              <div className="ad-form-group">
                <label htmlFor="min-attend">Min. Attendance (%)</label>
                <div className="ad-range-wrap">
                  <input id="min-attend" type="range" min="50" max="90" step="5"
                    value={system.minAttend}
                    onChange={e => setSystem(p => ({ ...p, minAttend: Number(e.target.value) }))}
                    className="ad-range"
                  />
                  <span className="ad-range-val">{system.minAttend}%</span>
                </div>
              </div>
              <div className="ad-form-group">
                <label htmlFor="late-window">Late Window (minutes)</label>
                <div className="ad-range-wrap">
                  <input id="late-window" type="range" min="5" max="30" step="5"
                    value={system.lateWindow}
                    onChange={e => setSystem(p => ({ ...p, lateWindow: Number(e.target.value) }))}
                    className="ad-range"
                  />
                  <span className="ad-range-val">{system.lateWindow} min</span>
                </div>
              </div>
              <div className="ad-form-group">
                <label htmlFor="qr-expiry">Default QR Expiry (minutes)</label>
                <div className="ad-range-wrap">
                  <input id="qr-expiry" type="range" min="5" max="30" step="5"
                    value={system.qrExpiry}
                    onChange={e => setSystem(p => ({ ...p, qrExpiry: Number(e.target.value) }))}
                    className="ad-range"
                  />
                  <span className="ad-range-val">{system.qrExpiry} min</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--ad-border)', paddingTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>🎨 Appearance</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['dark', 'light', 'system'].map(t => (
                  <button
                    key={t}
                    className={`ad-outline-btn ${theme === t ? 'active' : ''}`}
                    style={{ flex: 1, textTransform: 'capitalize', background: theme === t ? 'var(--ad-primary)' : 'transparent', color: theme === t ? '#fff' : 'var(--ad-text)' }}
                    onClick={() => setTheme(t)}
                  >
                    {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'} {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="ad-toggle-list" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--ad-border)', paddingTop: '1.5rem' }}>
              {[
                { id: 'sys-autonotif', key: 'autoNotif',   label: 'Auto Notifications',  desc: 'Send automated alerts to users'            },
                { id: 'sys-face',      key: 'faceEnable',  label: 'Face Recognition',     desc: 'Enable AI face recognition attendance'     },
                { id: 'sys-qr',        key: 'qrEnable',    label: 'QR Code Attendance',   desc: 'Allow QR-based attendance marking'         },
                { id: 'sys-backup',    key: 'backupAuto',  label: 'Auto Backup',          desc: 'Scheduled daily database backup'            },
              ].map(t => (
                <div key={t.id} className="ad-toggle-row">
                  <div><span className="ad-toggle-label">{t.label}</span><span className="ad-toggle-desc">{t.desc}</span></div>
                  <button id={t.id} className={`ad-switch ${system[t.key] ? 'on' : ''}`}
                    onClick={() => setSystem(p => ({ ...p, [t.key]: !p[t.key] }))} aria-pressed={system[t.key]}>
                    <span className="ad-switch-thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="ad-card">
            <h3 className="ad-card-title">🔔 Admin Notifications</h3>
            <div className="ad-toggle-list">
              {[
                { id: 'n-digest',  key: 'emailDigest', label: 'Daily Email Digest',    desc: 'Get a daily summary of system activity'   },
                { id: 'n-alerts',  key: 'alerts',      label: 'Critical Alerts',       desc: 'Immediate alerts for system issues'        },
                { id: 'n-reports', key: 'reports',     label: 'Weekly Reports',         desc: 'Automated weekly attendance reports'        },
                { id: 'n-sec',     key: 'security',    label: 'Security Alerts',        desc: 'Alerts for login anomalies or breaches'     },
              ].map(n => (
                <div key={n.id} className="ad-toggle-row">
                  <div><span className="ad-toggle-label">{n.label}</span><span className="ad-toggle-desc">{n.desc}</span></div>
                  <button id={n.id} className={`ad-switch ${notif[n.key] ? 'on' : ''}`}
                    onClick={() => setNotif(p => ({ ...p, [n.key]: !p[n.key] }))} aria-pressed={notif[n.key]}>
                    <span className="ad-switch-thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="ad-card">
        <h3 className="ad-card-title">🔑 Change Password</h3>
        <div className="ad-form-grid-3">
          <div className="ad-form-group"><label htmlFor="cur-pass">Current Password</label><input id="cur-pass" className="ad-input" type="password" placeholder="••••••••" /></div>
          <div className="ad-form-group"><label htmlFor="new-pass">New Password</label><input id="new-pass" className="ad-input" type="password" placeholder="••••••••" /></div>
          <div className="ad-form-group"><label htmlFor="conf-pass">Confirm Password</label><input id="conf-pass" className="ad-input" type="password" placeholder="••••••••" /></div>
        </div>
        <button id="change-pass-btn" className="ad-outline-btn" style={{ marginTop: '0.75rem' }}>🔒 Update Password</button>
      </div>

      {/* Danger zone */}
      <div className="ad-card ad-danger-zone">
        <h3 className="ad-card-title" style={{ color: '#f87171' }}>🚨 Danger Zone</h3>
        <div className="ad-danger-actions">
          <div className="ad-danger-row">
            <div>
              <span className="ad-danger-label">Maintenance Mode</span>
              <span className="ad-danger-desc">Temporarily disables student and faculty access</span>
            </div>
            <button
              id="maintenance-btn"
              className={`ad-switch ${system.maintenanceMode ? 'on ad-switch-red' : ''}`}
              onClick={() => setSystem(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
            >
              <span className="ad-switch-thumb" />
            </button>
          </div>
          <div className="ad-danger-row">
            <div>
              <span className="ad-danger-label">Reset All Attendance Data</span>
              <span className="ad-danger-desc">Permanently deletes all attendance records. Cannot be undone.</span>
            </div>
            <button id="reset-attend-btn" className="ad-danger-btn" onClick={() => setDanger(true)}>Reset Data</button>
          </div>
        </div>
        {danger && (
          <div className="ad-confirm-bar">
            ⚠️ Are you sure? This cannot be undone.
            <button className="ad-danger-btn" style={{ marginLeft: '1rem' }} onClick={() => setDanger(false)}>Confirm</button>
            <button className="ad-outline-btn" style={{ marginLeft: '0.5rem' }} onClick={() => setDanger(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const router           = useRouter()
  const [activeTab, setActiveTab]     = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/users`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(u => ({
            ...u,
            id: u._id.slice(-6).toUpperCase(), // Use part of Mongo ID as display ID
            status: 'active',
            joined: 'Just now',
            dept: u.dept || 'CS'
          }));
          setUsers(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => { logout(); router.replace('/login') }
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD'

  return (
    <div className="ad-root">
      {sidebarOpen && <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="ad-sidebar-brand">
          <div className="ad-sidebar-logo">A</div>
          <span className="ad-sidebar-name">ATTENTIFY</span>
        </div>

        <nav className="ad-sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`ad-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="ad-nav-icon">{item.icon}</span>
              <span className="ad-nav-label">{item.label}</span>
              {activeTab === item.id && <span className="ad-nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-chip">
            <div className="ad-user-avatar">{initials}</div>
            <div className="ad-user-info">
              <span className="ad-user-name">{user?.name}</span>
              <span className="ad-user-role">Admin</span>
            </div>
          </div>
          <button id="logout-btn" className="ad-logout-btn" onClick={handleLogout} title="Sign out">↩</button>
        </div>
      </aside>

      {/* Main */}
      <div className="ad-main-wrap">
        <header className="ad-mobile-topbar">
          <button className="ad-hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <span className="ad-mobile-title">ATTENTIFY</span>
        </header>

        <header className="ad-topbar">
          <div className="ad-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="ad-hamburger-desktop" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle Sidebar">☰</button>
            <h1 className="ad-topbar-title">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
          </div>
          <div className="ad-topbar-right">
            <span className="ad-topbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="ad-role-badge">🛡️ Admin</span>
          </div>
        </header>

        <main className="ad-content">
          {activeTab === 'overview'    && <TabOverview     user={user} users={users} onNav={setActiveTab} />}
          {activeTab === 'departments' && <TabDepartments  />}
          {activeTab === 'users'       && <TabUsers        users={users} setUsers={setUsers} />}
          {activeTab === 'settings'    && <TabSettings     user={user} />}
        </main>
      </div>
    </div>
  )
}
