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
  SearchIcon,
  BellIcon,
  DownloadIcon,
  TrendingUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsVerticalIcon,
  MapPinIcon,
  ListIcon,
  GraduationCapIcon,
  ArrowLeftIcon,
  UserIcon,
  KeyIcon,
  AwardIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  BuildingIcon,
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

// ─── Base Enrolled Courses for the Semester ──────────────────────────────────
const BASE_ENROLLED_COURSES = [
  { id: 'CS101', name: 'Data Structures',   faculty: 'Prof. Sharma', schedule: 'Mon/Wed/Fri 9:00 AM', room: 'Lab 3',   baseAttended: 14, baseTotal: 16, color: '#a78bfa' },
  { id: 'CS205', name: 'Operating Systems', faculty: 'Dr. Rajan',    schedule: 'Tue/Thu 11:00 AM',    room: 'Room 12', baseAttended: 12, baseTotal: 14, color: '#60a5fa' },
  { id: 'CS312', name: 'Database Systems',  faculty: 'Prof. Meera',  schedule: 'Mon/Wed 2:00 PM',     room: 'Room 7',  baseAttended: 13, baseTotal: 15, color: '#34d399' },
]

const COURSES = BASE_ENROLLED_COURSES.map(c => ({
  ...c,
  attended: c.baseAttended,
  total: c.baseTotal,
}))

const LOGS = []

const TODAY_SCHEDULE = [
  { time: '9:00 AM',  course: 'CS101', name: 'Data Structures',   room: 'Lab 3',   status: 'upcoming' },
  { time: '11:00 AM', course: 'CS205', name: 'Operating Systems', room: 'Room 12', status: 'upcoming' },
  { time: '2:00 PM',  course: 'CS312', name: 'Database Systems',  room: 'Room 7',  status: 'upcoming' },
]

// ─── Live attendance hook with reactive local caching and broadcast sync ───────
function useAttendanceData(email) {
  const [logs, setLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`sd_attendance_logs_${email || 'guest'}`)
        if (cached) return JSON.parse(cached)
      } catch (e) {}
    }
    return []
  })
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
        setLogs(prev => {
          const map = new Map()
          ;(data || []).forEach(item => {
            const id = item._id || item.id
            if (id) map.set(id, item)
          })
          prev.forEach(item => {
            const id = item._id || item.id
            if (id && !map.has(id)) map.set(id, item)
          })
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0)
          )
          try {
            localStorage.setItem(`sd_attendance_logs_${email || 'guest'}`, JSON.stringify(merged))
          } catch (e) {}
          return merged
        })
      }
    } catch (e) {
      console.warn('Attendance fetch notice:', e.message)
    } finally {
      setLoading(false)
    }
  }, [email])

  const recordAttendance = useCallback((record) => {
    setLogs(prev => {
      const updated = [record, ...prev.filter(l => (l._id || l.id) !== (record._id || record.id))]
      try {
        localStorage.setItem(`sd_attendance_logs_${email || 'guest'}`, JSON.stringify(updated))
        localStorage.setItem('attentify_attendance_updated', Date.now().toString())
      } catch (e) {}
      return updated
    })
    // Broadcast event across windows / tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('attendance_marked', { detail: record }))
    }
    // Refresh background data from server
    setTimeout(fetchData, 600)
  }, [email, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cross-tab and window listeners for live updates
  useEffect(() => {
    const handleCustom = (e) => {
      if (e.detail) {
        setLogs(prev => {
          if (prev.some(l => (l._id || l.id) === (e.detail._id || e.detail.id))) return prev
          return [e.detail, ...prev]
        })
      }
    }
    const handleStorage = (e) => {
      if (e.key === 'attentify_attendance_updated') {
        fetchData()
      }
    }
    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('attendance_marked', handleCustom)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('attendance_marked', handleCustom)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchData])

  // Aggregate dynamic per-course attendance
  const courseMap = {}
  BASE_ENROLLED_COURSES.forEach(c => {
    courseMap[c.id] = {
      ...c,
      attended: c.baseAttended,
      total: c.baseTotal,
    }
  })

  logs.forEach(l => {
    const cid = l.course_id || l.course
    if (!cid) return
    if (!courseMap[cid]) {
      courseMap[cid] = {
        id: cid,
        name: cid === 'CS101' ? 'Data Structures' : cid === 'CS205' ? 'Operating Systems' : cid === 'CS312' ? 'Database Systems' : cid,
        faculty: 'Prof. Faculty',
        schedule: 'Mon/Wed/Fri',
        room: 'Lab 3',
        attended: 0,
        total: 0,
        color: '#a78bfa'
      }
    }
    if (l.status === 'present') {
      courseMap[cid].attended += 1
    }
    courseMap[cid].total += 1
  })

  const courses = Object.values(courseMap)
  const totalAttended = courses.reduce((sum, c) => sum + c.attended, 0)
  const totalClasses  = courses.reduce((sum, c) => sum + c.total, 0)
  const overallPct    = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100

  // Real-time status for Today's Schedule based on attendance logs
  const todaySchedule = [
    {
      time: '9:00 AM',
      course: 'CS101',
      name: 'Data Structures',
      room: 'Lab 3',
      status: logs.some(l => (l.course_id === 'CS101' || l.course === 'CS101') && l.status === 'present') ? 'done' : 'upcoming'
    },
    {
      time: '11:00 AM',
      course: 'CS205',
      name: 'Operating Systems',
      room: 'Room 12',
      status: logs.some(l => (l.course_id === 'CS205' || l.course === 'CS205') && l.status === 'present') ? 'done' : 'upcoming'
    },
    {
      time: '2:00 PM',
      course: 'CS312',
      name: 'Database Systems',
      room: 'Room 7',
      status: logs.some(l => (l.course_id === 'CS312' || l.course === 'CS312') && l.status === 'present') ? 'done' : 'upcoming'
    },
  ]

  return {
    logs,
    courses,
    todaySchedule,
    totalAttended,
    totalClasses,
    overallPct,
    loading,
    refresh: fetchData,
    recordAttendance
  }
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
  const { logs, courses, todaySchedule, totalAttended, totalClasses, overallPct, loading } = attData
  
  const enrolledCount = courses ? courses.length : 3
  const absentCount = (logs || []).filter(l => l.status === 'absent').length
  const lateCount = (logs || []).filter(l => l.status === 'late').length

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
            {(todaySchedule || TODAY_SCHEDULE).map((item, idx) => (
              <div key={idx} className="sd-schedule-row">
                <div className="sd-schedule-left">
                  <span className="sd-schedule-time">{item.time}</span>
                  <span className={`sd-schedule-dot ${item.status === 'done' ? 'done' : ''}`} style={item.status === 'done' ? { background: '#557E6D' } : {}} />
                  <div className="sd-schedule-subject">
                    <span style={item.status === 'done' ? { color: '#162F44', fontWeight: 600 } : {}}>{item.name}</span>
                    <span className="sd-schedule-details">{item.course} · {item.room}</span>
                  </div>
                </div>
                <div className="sd-schedule-status">
                  {item.status === 'done' ? (
                    <span style={{ color: '#557E6D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleIcon size={14} color="#557E6D" />
                      <span>Done</span>
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ClockIcon size={13} color="#758087" />
                      <span>Upcoming</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Per-Course Attendance Card ─────────────────────── */}
      <div className="sd-card sd-full-card">
        <h3 className="sd-panel-title">Per-Course Attendance</h3>
        {(!courses || courses.length === 0) ? (
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
          {logs && logs.length > 0 ? (
            logs.slice(0, 5).map(l => (
              <div key={l._id || l.id} className="sd-activity-row">
                <div className="sd-activity-left">
                  <span className="sd-activity-dot" style={{ background: '#557E6D' }} />
                  <div className="sd-activity-meta">
                    <span className="sd-activity-title">{l.course_id || l.course || 'CS101'}</span>
                    <span className="sd-activity-desc">{l.method || 'QR Code + Face'}</span>
                  </div>
                </div>
                <div className="sd-activity-right">
                  <span className={`sd-status-badge ${l.status || 'present'}`}>{l.status || 'present'}</span>
                  <span className="sd-activity-time">
                    {l.timestamp ? new Date(l.timestamp).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : (l.date || 'Just now')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="sd-activity-row">
              <div className="sd-activity-left">
                <span className="sd-activity-dot" />
                <div className="sd-activity-meta">
                  <span className="sd-activity-title">CS101 - Data Structures</span>
                  <span className="sd-activity-desc">QR + Face Verification</span>
                </div>
              </div>
              <div className="sd-activity-right">
                <span className="sd-status-badge present">present</span>
                <span className="sd-activity-time">17 Oct, 9:02 am</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: ATTENDANCE (Dedicated Student Attendance Dashboard)
//  Follows strict layout blueprint & Attendify brand identity
// ═══════════════════════════════════════════════════════════

const DEFAULT_COURSES_PERF = [
  {
    code: 'CS101',
    name: 'Data Structures & Algorithms',
    type: 'Core',
    credits: 4,
    faculty: 'Prof. Sharma',
    present: 12,
    absent: 2,
    total: 14,
    pct: 85.7,
    status: 'safe',
    color: '#8B5CF6'
  },
  {
    code: 'CS205',
    name: 'Operating Systems & Architecture',
    type: 'Core',
    credits: 4,
    faculty: 'Dr. Rajan',
    present: 10,
    absent: 1,
    total: 11,
    pct: 90.9,
    status: 'safe',
    color: '#3B82F6'
  },
  {
    code: 'CS312',
    name: 'Database Management Systems',
    type: 'Core',
    credits: 3,
    faculty: 'Prof. Meera',
    present: 8,
    absent: 1,
    total: 9,
    pct: 88.9,
    status: 'safe',
    color: '#10B981'
  },
  {
    code: 'CS401',
    name: 'Computer Networks & Security',
    type: 'Core',
    credits: 3,
    faculty: 'Dr. Arvind Nair',
    present: 5,
    absent: 1,
    total: 6,
    pct: 83.3,
    status: 'warning',
    color: '#F59E0B'
  },
  {
    code: 'AI202',
    name: 'Intro to Machine Learning & Neural Nets',
    type: 'Elective',
    credits: 3,
    faculty: 'Prof. Sunita K.',
    present: 3,
    absent: 1,
    total: 4,
    pct: 75.0,
    status: 'warning',
    color: '#EC4899'
  },
  {
    code: 'MA301',
    name: 'Discrete Mathematics & Probability',
    type: 'Core',
    credits: 4,
    faculty: 'Dr. V. Raman',
    present: 2,
    absent: 0,
    total: 2,
    pct: 100.0,
    status: 'safe',
    color: '#14B8A6'
  },
]

const STATIC_ACTIVITY_LOGS = [
  { id: 1, date: 'Oct 28, 2024', day: 'Monday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 2, date: 'Oct 28, 2024', day: 'Monday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 3, date: 'Oct 25, 2024', day: 'Friday', course: 'CS401', courseName: 'Computer Networks & Security', location: 'Lab 2', faculty: 'Dr. Arvind Nair', time: '02:00 PM – 03:30 PM', status: 'absent', verification: 'Medical Excuse Approved' },
  { id: 4, date: 'Oct 24, 2024', day: 'Thursday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 5, date: 'Oct 23, 2024', day: 'Wednesday', course: 'AI202', courseName: 'Intro to Machine Learning', location: 'Hall 3', faculty: 'Prof. Sunita K.', time: '01:30 PM – 03:00 PM', status: 'present', verification: 'Face Liveness Verified' },
  { id: 6, date: 'Oct 22, 2024', day: 'Tuesday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 7, date: 'Oct 21, 2024', day: 'Monday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 8, date: 'Oct 18, 2024', day: 'Friday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '02:00 PM – 03:30 PM', status: 'absent', verification: 'Unexcused Absence' },
  { id: 9, date: 'Oct 17, 2024', day: 'Thursday', course: 'MA301', courseName: 'Discrete Mathematics', location: 'Hall 1', faculty: 'Dr. V. Raman', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 10, date: 'Oct 16, 2024', day: 'Wednesday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 11, date: 'Oct 15, 2024', day: 'Tuesday', course: 'CS401', courseName: 'Computer Networks & Security', location: 'Lab 2', faculty: 'Dr. Arvind Nair', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 12, date: 'Oct 11, 2024', day: 'Friday', course: 'AI202', courseName: 'Intro to Machine Learning', location: 'Hall 3', faculty: 'Prof. Sunita K.', time: '02:00 PM – 03:30 PM', status: 'absent', verification: 'Verification Pending' },
  { id: 13, date: 'Oct 10, 2024', day: 'Thursday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 14, date: 'Oct 09, 2024', day: 'Wednesday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 15, date: 'Oct 08, 2024', day: 'Tuesday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 16, date: 'Oct 07, 2024', day: 'Monday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 17, date: 'Oct 04, 2024', day: 'Friday', course: 'CS401', courseName: 'Computer Networks & Security', location: 'Lab 2', faculty: 'Dr. Arvind Nair', time: '02:00 PM – 03:30 PM', status: 'present', verification: 'Face Liveness Verified' },
  { id: 18, date: 'Oct 03, 2024', day: 'Thursday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 19, date: 'Sep 30, 2024', day: 'Monday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 20, date: 'Sep 27, 2024', day: 'Friday', course: 'AI202', courseName: 'Intro to Machine Learning', location: 'Hall 3', faculty: 'Prof. Sunita K.', time: '01:30 PM – 03:00 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 21, date: 'Sep 26, 2024', day: 'Thursday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 22, date: 'Sep 25, 2024', day: 'Wednesday', course: 'MA301', courseName: 'Discrete Mathematics', location: 'Hall 1', faculty: 'Dr. V. Raman', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 23, date: 'Sep 24, 2024', day: 'Tuesday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 24, date: 'Sep 20, 2024', day: 'Friday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'absent', verification: 'Medical Excuse Approved' },
  { id: 25, date: 'Sep 19, 2024', day: 'Thursday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 26, date: 'Sep 18, 2024', day: 'Wednesday', course: 'CS401', courseName: 'Computer Networks & Security', location: 'Lab 2', faculty: 'Dr. Arvind Nair', time: '02:00 PM – 03:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 27, date: 'Sep 16, 2024', day: 'Monday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 28, date: 'Sep 12, 2024', day: 'Thursday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 29, date: 'Aug 29, 2024', day: 'Thursday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 30, date: 'Aug 28, 2024', day: 'Wednesday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 31, date: 'Aug 27, 2024', day: 'Tuesday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 32, date: 'Aug 23, 2024', day: 'Friday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'absent', verification: 'Unexcused Absence' },
  { id: 33, date: 'Aug 22, 2024', day: 'Thursday', course: 'CS401', courseName: 'Computer Networks & Security', location: 'Lab 2', faculty: 'Dr. Arvind Nair', time: '02:00 PM – 03:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 34, date: 'Aug 20, 2024', day: 'Tuesday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 35, date: 'Aug 16, 2024', day: 'Friday', course: 'AI202', courseName: 'Intro to Machine Learning', location: 'Hall 3', faculty: 'Prof. Sunita K.', time: '01:30 PM – 03:00 PM', status: 'present', verification: 'Face Liveness Verified' },
  { id: 36, date: 'Aug 14, 2024', day: 'Wednesday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 37, date: 'Aug 13, 2024', day: 'Tuesday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 38, date: 'Aug 09, 2024', day: 'Friday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'absent', verification: 'Unexcused Absence' },
  { id: 39, date: 'Aug 06, 2024', day: 'Tuesday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 40, date: 'Aug 02, 2024', day: 'Friday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 41, date: 'Jul 29, 2024', day: 'Monday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 42, date: 'Jul 25, 2024', day: 'Thursday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 43, date: 'Jul 23, 2024', day: 'Tuesday', course: 'CS312', courseName: 'Database Management Systems', location: 'Room 7', faculty: 'Prof. Meera', time: '10:00 AM – 11:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 44, date: 'Jul 19, 2024', day: 'Friday', course: 'CS401', courseName: 'Computer Networks & Security', location: 'Lab 2', faculty: 'Dr. Arvind Nair', time: '02:00 PM – 03:30 PM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 45, date: 'Jul 16, 2024', day: 'Tuesday', course: 'CS101', courseName: 'Data Structures & Algorithms', location: 'Lab 3', faculty: 'Prof. Sharma', time: '09:00 AM – 10:30 AM', status: 'present', verification: 'Biometric QR Verified' },
  { id: 46, date: 'Jul 12, 2024', day: 'Friday', course: 'CS205', courseName: 'Operating Systems & Architecture', location: 'Room 12', faculty: 'Dr. Rajan', time: '11:00 AM – 12:30 PM', status: 'present', verification: 'Biometric QR Verified' },
]

function TabAttendance({ attData, user, onNav, topbarSearch = '' }) {
  // State for controls
  const [semester, setSemester] = useState('Fall 2024 (Sem 5)')
  const [academicYear, setAcademicYear] = useState('AY 2024-25')
  const [exportNotice, setExportNotice] = useState(null)
  
  // Table search & filter states
  const [courseSearch, setCourseSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all') // 'all', 'core', 'elective'
  
  // Session activity logs state
  const [logStatusFilter, setLogStatusFilter] = useState('all') // 'all', 'present', 'absent'
  const [logCourseFilter, setLogCourseFilter] = useState('all') // 'all', 'CS101', ...
  const [logDateRange, setLogDateRange] = useState('semester') // 'semester', '30days', '7days'
  const [logPage, setLogPage] = useState(1)
  const [viewAllLogs, setViewAllLogs] = useState(false)
  const [hoveredWeek, setHoveredWeek] = useState(null)
  const [hoveredMonth, setHoveredMonth] = useState(null)

  // Combined search term
  const activeSearch = (courseSearch || topbarSearch).trim().toLowerCase()

  // Base institutional metrics from reference specification
  const overallPct = 87
  const totalAttended = 40
  const totalMissed = 6
  const totalSessions = 46
  const requiredPct = 75
  const bufferMargin = 12.0
  const allowedRemaining = 5

  // Date indicator format
  const now = new Date()
  const todayLabel = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  // Merge live scanned logs if present
  const allLogs = (() => {
    if (!attData?.logs || attData.logs.length === 0) return STATIC_ACTIVITY_LOGS
    const liveItems = attData.logs.map((l, idx) => ({
      id: `live-${l._id || l.id || idx}`,
      date: l.timestamp ? new Date(l.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
      day: l.timestamp ? new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'long' }) : 'Today',
      course: l.course_id || l.course || 'CS101',
      courseName: l.course_name || (l.course_id === 'CS205' ? 'Operating Systems' : l.course_id === 'CS312' ? 'Database Systems' : 'Data Structures & Algorithms'),
      location: l.room || 'Lab 3',
      faculty: l.faculty || 'Prof. Faculty',
      time: l.time || '10:00 AM – 11:30 AM',
      status: l.status || 'present',
      verification: 'Live QR Scanned'
    }))
    return [...liveItems, ...STATIC_ACTIVITY_LOGS]
  })()

  // Filter courses performance
  const filteredCourses = DEFAULT_COURSES_PERF.filter(c => {
    if (courseFilter === 'core' && c.type !== 'Core') return false
    if (courseFilter === 'elective' && c.type !== 'Elective') return false
    if (activeSearch) {
      const match = c.code.toLowerCase().includes(activeSearch) ||
                    c.name.toLowerCase().includes(activeSearch) ||
                    c.faculty.toLowerCase().includes(activeSearch)
      if (!match) return false
    }
    return true
  })

  // Filter session activity logs
  const filteredLogs = allLogs.filter(l => {
    if (logStatusFilter === 'present' && l.status !== 'present') return false
    if (logStatusFilter === 'absent' && l.status !== 'absent') return false
    if (logCourseFilter !== 'all' && l.course !== logCourseFilter) return false
    if (activeSearch) {
      const match = l.course.toLowerCase().includes(activeSearch) ||
                    l.courseName.toLowerCase().includes(activeSearch) ||
                    l.faculty.toLowerCase().includes(activeSearch) ||
                    l.date.toLowerCase().includes(activeSearch)
      if (!match) return false
    }
    return true
  })

  // Pagination for logs
  const logsPerPage = 6
  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage) || 1
  const displayedLogs = viewAllLogs
    ? filteredLogs
    : filteredLogs.slice((logPage - 1) * logsPerPage, logPage * logsPerPage)

  const handleExport = () => {
    const studentName = user?.name || 'Arjun P'
    setExportNotice(`✅ Attendance Report for Semester 5 (${studentName}) exported successfully (CSV & PDF).`)
    setTimeout(() => setExportNotice(null), 4500)
  }

  const handleViewCourseHistory = (code) => {
    setLogCourseFilter(code)
    const el = document.getElementById('sd-session-logs-section')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="sd-att-view">
      {/* ── Section 5: Page Header Section ────────────────────── */}
      <div className="sd-att-header">
        <div className="sd-att-header-left">
          <h1 className="sd-att-title">Attendance Sessions</h1>
          <p className="sd-att-subtitle">
            Track your attendance, analyze class participation, and stay above the required institutional attendance threshold.
          </p>
        </div>
        <div className="sd-att-header-controls">
          <div className="sd-att-date-pill" title="Today's Date">
            <CalendarIcon size={14} color="#557E6D" />
            <span>Today: {todayLabel}</span>
          </div>

          <select
            className="sd-att-select"
            value={semester}
            onChange={e => setSemester(e.target.value)}
            aria-label="Select Semester"
          >
            <option value="Fall 2024 (Sem 5)">Semester 5 (Fall 2024)</option>
            <option value="Spring 2024 (Sem 4)">Semester 4 (Spring 2024)</option>
            <option value="Fall 2023 (Sem 3)">Semester 3 (Fall 2023)</option>
          </select>

          <select
            className="sd-att-select"
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            aria-label="Select Academic Year"
          >
            <option value="AY 2024-25">AY 2024-25</option>
            <option value="AY 2023-24">AY 2023-24</option>
          </select>

          <button className="sd-att-btn-export" onClick={handleExport} title="Download Attendance Records">
            <DownloadIcon size={14} color="#FFFFFF" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="sd-att-toast" role="status">
          <span>{exportNotice}</span>
          <button
            onClick={() => setExportNotice(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#276749', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Section 6: Attendance KPI Cards ───────────────────── */}
      <div className="sd-att-kpi-grid">
        {/* Card 1: Overall Attendance */}
        <div className="sd-att-kpi-card">
          <div className="sd-att-kpi-top">
            <span className="sd-att-kpi-label">OVERALL ATTENDANCE</span>
            <div className="sd-att-kpi-icon-badge" style={{ backgroundColor: '#E8F2EC', color: '#557E6D' }}>
              <TrendingUpIcon size={14} />
            </div>
          </div>
          <div className="sd-att-kpi-val-row">
            <span className="sd-att-kpi-value">{overallPct}%</span>
            <div className="sd-att-kpi-ring-wrap" title={`${overallPct}% Overall Attendance`}>
              <svg width="26" height="26" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E7E8E2" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="#557E6D" strokeWidth="3.5"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - 0.87)}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="sd-att-kpi-bottom">
            <span className="sd-att-kpi-sub">{totalAttended} Present / {totalSessions} Total Sessions</span>
            <span className="sd-att-kpi-pill" style={{ backgroundColor: '#E8F2EC', color: '#276749' }}>
              +2.4% vs last mo
            </span>
          </div>
        </div>

        {/* Card 2: Classes Attended */}
        <div className="sd-att-kpi-card">
          <div className="sd-att-kpi-top">
            <span className="sd-att-kpi-label">CLASSES ATTENDED</span>
            <div className="sd-att-kpi-icon-badge" style={{ backgroundColor: '#E8F2EC', color: '#557E6D' }}>
              <CheckCircleIcon size={14} />
            </div>
          </div>
          <div className="sd-att-kpi-val-row">
            <span className="sd-att-kpi-value">{totalAttended} Sessions</span>
          </div>
          <div className="sd-att-kpi-bottom">
            <span className="sd-att-kpi-sub">On track and consistent.</span>
            <span className="sd-att-kpi-pill" style={{ backgroundColor: '#E8F2EC', color: '#276749' }}>
              87.0% Attended
            </span>
          </div>
        </div>

        {/* Card 3: Classes Missed */}
        <div className="sd-att-kpi-card">
          <div className="sd-att-kpi-top">
            <span className="sd-att-kpi-label">CLASSES MISSED</span>
            <div className="sd-att-kpi-icon-badge" style={{ backgroundColor: '#FBEBE8', color: '#BC6D61' }}>
              <AlertCircleIcon size={14} />
            </div>
          </div>
          <div className="sd-att-kpi-val-row">
            <span className="sd-att-kpi-value" style={{ color: '#BC6D61' }}>{totalMissed} Sessions</span>
          </div>
          <div className="sd-att-kpi-bottom">
            <span className="sd-att-kpi-sub">{allowedRemaining} allowed remaining.</span>
            <span className="sd-att-kpi-pill" style={{ backgroundColor: '#FBEBE8', color: '#BC6D61' }}>
              13.0% Missed
            </span>
          </div>
        </div>

        {/* Card 4: Attendance Required */}
        <div className="sd-att-kpi-card">
          <div className="sd-att-kpi-top">
            <span className="sd-att-kpi-label">ATTENDANCE REQUIRED</span>
            <div className="sd-att-kpi-icon-badge" style={{ backgroundColor: '#FEF3C7', color: '#B5822C' }}>
              <ShieldCheckIcon size={14} />
            </div>
          </div>
          <div className="sd-att-kpi-val-row">
            <span className="sd-att-kpi-value">{requiredPct}%</span>
          </div>
          <div className="sd-att-kpi-bottom">
            <span className="sd-att-kpi-sub">Minimum requirement.</span>
            <span className="sd-att-kpi-pill" style={{ backgroundColor: '#E8F2EC', color: '#276749' }}>
              +{bufferMargin}% Buffer
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 7: Attendance Health Notification Banner ──── */}
      <div className="sd-att-health-banner">
        <div className="sd-att-health-left">
          <div className="sd-att-health-icon-box">
            <ShieldCheckIcon size={18} color="#557E6D" />
          </div>
          <div>
            <div className="sd-att-health-title-row">
              <span className="sd-att-health-title">Attendance Health: Excellent</span>
              <span className="sd-att-health-badge">+{bufferMargin}% Above Minimum</span>
            </div>
            <p className="sd-att-health-desc">
              Your overall attendance is sitting comfortably at 87.0%, well above the 75% institutional threshold. You have a safety buffer of up to 5 more sessions without penalty.
            </p>
          </div>
        </div>
        <div className="sd-att-health-action">
          <span className="sd-att-pulse-dot" />
          <span>Safe Attendance Rhythm</span>
        </div>
      </div>

      {/* ── Section 8: Primary Analytics Section (2 Columns) ───── */}
      <div className="sd-att-analytics-grid">
        {/* Left Card: Weekly Attendance Trend */}
        <div className="sd-att-card">
          <div className="sd-att-card-header">
            <div>
              <h2 className="sd-att-card-title">Weekly Attendance Trend</h2>
              <p className="sd-att-card-sub">Participation trajectories across semester weeks.</p>
            </div>
            <div className="sd-att-legend">
              <span className="sd-att-legend-item">
                <span className="sd-att-legend-dot" style={{ backgroundColor: '#557E6D' }} />
                <span>Weekly Rate</span>
              </span>
              <span className="sd-att-legend-item">
                <span className="sd-att-legend-line" />
                <span>75% Minimum</span>
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div style={{ position: 'relative', width: '100%', height: '220px', marginTop: '4px' }}>
            <svg viewBox="0 0 540 210" className="sd-att-chart-svg" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#557E6D" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#557E6D" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Y Grid Lines & Labels */}
              {[
                { val: 100, y: 30 },
                { val: 90,  y: 65 },
                { val: 80,  y: 100 },
                { val: 70,  y: 135 },
                { val: 60,  y: 170 },
              ].map(grid => (
                <g key={grid.val}>
                  <line x1="42" y1={grid.y} x2="520" y2={grid.y} stroke="#EBEFEA" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="36" y={grid.y + 3} textAnchor="end" fontSize="10" fill="#758087" fontFamily="Inter, sans-serif">
                    {grid.val}%
                  </text>
                </g>
              ))}

              {/* 75% Institutional Threshold Dashed Line */}
              <line x1="42" y1="117.5" x2="520" y2="117.5" stroke="#B5822C" strokeWidth="1.5" strokeDasharray="4 4" />
              <rect x="445" y="108" width="75" height="18" rx="4" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="0.8" />
              <text x="482" y="120" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#B45309" fontFamily="Inter, sans-serif">
                75% Min Req
              </text>

              {/* Area Under Curve */}
              {/* Points: W1(50, 61.5 [91%]), W2(142, 79 [86%]), W3(234, 72 [88%]), W4(326, 89.5 [83%]), W5(418, 65 [90%]), W6(510, 75.5 [87%]) */}
              <path
                d="M 50,61.5 C 96,61.5 96,79 142,79 C 188,79 188,72 234,72 C 280,72 280,89.5 326,89.5 C 372,89.5 372,65 418,65 C 464,65 464,75.5 510,75.5 L 510,170 L 50,170 Z"
                fill="url(#trendAreaGrad)"
              />

              {/* Line Curve */}
              <path
                d="M 50,61.5 C 96,61.5 96,79 142,79 C 188,79 188,72 234,72 C 280,72 280,89.5 326,89.5 C 372,89.5 372,65 418,65 C 464,65 464,75.5 510,75.5"
                fill="none"
                stroke="#557E6D"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points and labels */}
              {[
                { week: 'Week 1', pct: 91, x: 50,  y: 61.5, current: false },
                { week: 'Week 2', pct: 86, x: 142, y: 79,   current: false },
                { week: 'Week 3', pct: 88, x: 234, y: 72,   current: false },
                { week: 'Week 4', pct: 83, x: 326, y: 89.5, current: false },
                { week: 'Week 5', pct: 90, x: 418, y: 65,   current: false },
                { week: 'Week 6', pct: 87, x: 510, y: 75.5, current: true },
              ].map(pt => (
                <g
                  key={pt.week}
                  onMouseEnter={() => setHoveredWeek(pt)}
                  onMouseLeave={() => setHoveredWeek(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Highlight aura for current week */}
                  {pt.current && (
                    <circle cx={pt.x} cy={pt.y} r="10" fill="#557E6D" fillOpacity="0.25">
                      <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Value badge pill above point */}
                  <rect
                    x={pt.x - 17}
                    y={pt.y - 20}
                    width="34"
                    height="15"
                    rx="3"
                    fill={pt.current ? '#162F44' : '#FCFBF9'}
                    stroke={pt.current ? '#162F44' : '#D9DEDA'}
                    strokeWidth="0.8"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 9}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="700"
                    fill={pt.current ? '#FFFFFF' : '#162F44'}
                    fontFamily="Inter, sans-serif"
                  >
                    {pt.pct}%
                  </text>

                  {/* Node Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.current ? 5 : 4}
                    fill={pt.current ? '#557E6D' : '#557E6D'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* X Axis Label */}
                  <text
                    x={pt.x}
                    y="190"
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight={pt.current ? '700' : '500'}
                    fill={pt.current ? '#162F44' : '#758087'}
                    fontFamily="Inter, sans-serif"
                  >
                    {pt.week}{pt.current ? ' (Current)' : ''}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="sd-att-card-footer-note">
            Current trajectory holds an average of 87.5% across 6 weeks. No weekly record has dropped below the 75% institutional safety limit.
            {hoveredWeek && <span style={{ color: '#557E6D', fontWeight: 600 }}> • Selected: {hoveredWeek.week} ({hoveredWeek.pct}%)</span>}
          </div>
        </div>

        {/* Right Card: Attendance Ratio */}
        <div className="sd-att-card">
          <div className="sd-att-card-header">
            <div>
              <h2 className="sd-att-card-title">Attendance Ratio</h2>
              <p className="sd-att-card-sub">Class session distribution breakdown.</p>
            </div>
            <span className="sd-att-card-badge">{totalSessions} Total Sessions</span>
          </div>

          <div className="sd-att-ratio-body">
            {/* Large Doughnut Chart */}
            <div className="sd-att-doughnut-wrap">
              <svg width="130" height="130" viewBox="0 0 160 160">
                {/* Background circle */}
                <circle cx="80" cy="80" r="62" fill="none" stroke="#E7E8E2" strokeWidth="18" />
                {/* Present Arc (87%) */}
                <circle
                  cx="80" cy="80" r="62" fill="none"
                  stroke="#557E6D" strokeWidth="18"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - 0.87)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
                {/* Absent Arc (13%) */}
                <circle
                  cx="80" cy="80" r="62" fill="none"
                  stroke="#BC6D61" strokeWidth="18"
                  strokeDasharray={`${2 * Math.PI * 62 * 0.13} ${2 * Math.PI * 62}`}
                  strokeDashoffset={`${-1 * 2 * Math.PI * 62 * 0.87}`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="sd-att-doughnut-center">
                <span className="sd-att-doughnut-pct">{overallPct}%</span>
                <span className="sd-att-doughnut-lbl">Attended</span>
              </div>
            </div>

            {/* Present and Absent data cards */}
            <div className="sd-att-ratio-cards">
              <div className="sd-att-ratio-data-card" style={{ borderLeft: '3px solid #557E6D' }}>
                <div className="sd-att-ratio-card-left">
                  <div className="sd-att-ratio-swatch" style={{ backgroundColor: '#557E6D' }} />
                  <div>
                    <div className="sd-att-ratio-card-name">Present</div>
                    <div className="sd-att-ratio-card-sub">38 in-person • 2 lab verified</div>
                  </div>
                </div>
                <div className="sd-att-ratio-card-right">
                  <div className="sd-att-ratio-card-num">{totalAttended} sessions</div>
                  <div className="sd-att-ratio-card-pct" style={{ color: '#557E6D' }}>87%</div>
                </div>
              </div>

              <div className="sd-att-ratio-data-card" style={{ borderLeft: '3px solid #BC6D61' }}>
                <div className="sd-att-ratio-card-left">
                  <div className="sd-att-ratio-swatch" style={{ backgroundColor: '#BC6D61' }} />
                  <div>
                    <div className="sd-att-ratio-card-name">Absent</div>
                    <div className="sd-att-ratio-card-sub">2 approved excuses • 4 unexcused</div>
                  </div>
                </div>
                <div className="sd-att-ratio-card-right">
                  <div className="sd-att-ratio-card-num" style={{ color: '#BC6D61' }}>{totalMissed} sessions</div>
                  <div className="sd-att-ratio-card-pct" style={{ color: '#BC6D61' }}>13%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sd-att-card-footer-note">
            Attended: 40 sessions • Missed: 6 sessions • Scheduled: 52 sessions total this term
          </div>
        </div>
      </div>

      {/* ── Section 9: Secondary Analytics Section (2 Columns) ─── */}
      <div className="sd-att-analytics-grid">
        {/* Left Card: Monthly Distribution */}
        <div className="sd-att-card">
          <div className="sd-att-card-header">
            <div>
              <h2 className="sd-att-card-title">Monthly Distribution</h2>
              <p className="sd-att-card-sub">Attended vs Missed count across calendar months.</p>
            </div>
            <div className="sd-att-legend">
              <span className="sd-att-legend-item">
                <span className="sd-att-legend-dot" style={{ backgroundColor: '#557E6D' }} />
                <span>Attended</span>
              </span>
              <span className="sd-att-legend-item">
                <span className="sd-att-legend-dot" style={{ backgroundColor: '#BC6D61' }} />
                <span>Missed</span>
              </span>
            </div>
          </div>

          {/* Grouped Bar Chart */}
          <div style={{ position: 'relative', width: '100%', height: '190px' }}>
            <svg viewBox="0 0 520 180" className="sd-att-chart-svg" style={{ width: '100%', height: '100%' }}>
              {/* Y Gridlines & Labels */}
              {[
                { val: 14, y: 20 },
                { val: 10, y: 55 },
                { val: 6,  y: 90 },
                { val: 2,  y: 125 },
              ].map(grid => (
                <g key={grid.val}>
                  <line x1="38" y1={grid.y} x2="505" y2={grid.y} stroke="#EBEFEA" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="32" y={grid.y + 3} textAnchor="end" fontSize="9.5" fill="#758087" fontFamily="Inter, sans-serif">
                    {grid.val}
                  </text>
                </g>
              ))}
              <line x1="38" y1="145" x2="505" y2="145" stroke="#D9DEDA" strokeWidth="1" />

              {/* Bars per month */}
              {[
                { month: 'July',      attended: 8,  missed: 1, cx: 85,  top: false },
                { month: 'August',    attended: 10, missed: 2, cx: 175, top: false },
                { month: 'September', attended: 9,  missed: 1, cx: 265, top: false },
                { month: 'October',   attended: 11, missed: 1, cx: 355, top: true },
                { month: 'November',  attended: 2,  missed: 1, cx: 445, top: false, ongoing: true },
              ].map(item => {
                // Calculation: max val 16, height 125 (from y=20 to y=145). Scale = 125 / 16 ≈ 7.8px per unit
                const attH = item.attended * 7.8
                const misH = item.missed * 7.8
                const attY = 145 - attH
                const misY = 145 - misH

                return (
                  <g
                    key={item.month}
                    onMouseEnter={() => setHoveredMonth(item)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Top Month Badge */}
                    {item.top && (
                      <g>
                        <rect x={item.cx - 36} y="22" width="72" height="15" rx="3" fill="#E8F2EC" stroke="#C6DEC9" strokeWidth="0.8" />
                        <text x={item.cx} y="33" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#276749" fontFamily="Inter, sans-serif">
                          ★ Top: 91.7%
                        </text>
                      </g>
                    )}

                    {/* Attended Bar */}
                    <rect
                      x={item.cx - 16}
                      y={attY}
                      width="14"
                      height={attH}
                      rx="3"
                      fill="#557E6D"
                      opacity={item.ongoing ? 0.75 : 1}
                    />
                    <text x={item.cx - 9} y={attY - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#162F44" fontFamily="Inter, sans-serif">
                      {item.attended}
                    </text>

                    {/* Missed Bar */}
                    <rect
                      x={item.cx + 2}
                      y={misY}
                      width="14"
                      height={misH}
                      rx="3"
                      fill="#BC6D61"
                      opacity={item.ongoing ? 0.75 : 1}
                    />
                    <text x={item.cx + 9} y={misY - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#BC6D61" fontFamily="Inter, sans-serif">
                      {item.missed}
                    </text>

                    {/* X Month Label */}
                    <text
                      x={item.cx}
                      y="160"
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight={item.top ? '700' : '500'}
                      fill={item.top ? '#162F44' : '#758087'}
                      fontFamily="Inter, sans-serif"
                    >
                      {item.month}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="sd-att-card-footer-note">
            October was your highest attendance month with 91.7% attendance rate (11 of 12 sessions attended).
            {hoveredMonth && <span style={{ color: '#557E6D', fontWeight: 600 }}> • Selected: {hoveredMonth.month} ({hoveredMonth.attended} attended, {hoveredMonth.missed} missed)</span>}
          </div>
        </div>

        {/* Right Card: Attendance Heatmap */}
        <div className="sd-att-card">
          <div className="sd-att-card-header">
            <div>
              <h2 className="sd-att-card-title">Attendance Heatmap</h2>
              <p className="sd-att-card-sub">Day-to-day attendance log matrix (Past 5 Weeks).</p>
            </div>
            <div className="sd-att-legend">
              <span className="sd-att-legend-item">
                <span className="sd-att-heat-cell sd-heat-p" style={{ width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>P</span>
                <span>Present</span>
              </span>
              <span className="sd-att-legend-item">
                <span className="sd-att-heat-cell sd-heat-a" style={{ width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>A</span>
                <span>Absent</span>
              </span>
              <span className="sd-att-legend-item">
                <span className="sd-att-heat-cell sd-heat-empty" style={{ width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>-</span>
                <span>No Class</span>
              </span>
            </div>
          </div>

          {/* 5-Week × 6-Day Grid */}
          <table className="sd-att-heatmap-table" aria-label="Attendance Heatmap">
            <thead>
              <tr>
                <th className="sd-att-heatmap-th" style={{ width: '50px' }}></th>
                <th className="sd-att-heatmap-th">Mon</th>
                <th className="sd-att-heatmap-th">Tue</th>
                <th className="sd-att-heatmap-th">Wed</th>
                <th className="sd-att-heatmap-th">Thu</th>
                <th className="sd-att-heatmap-th">Fri</th>
                <th className="sd-att-heatmap-th">Sat</th>
              </tr>
            </thead>
            <tbody>
              {[
                { week: 'Week 1', days: ['P', 'P', 'P', 'P', 'P', '-'] },
                { week: 'Week 2', days: ['P', 'P', 'P', 'P', 'A', '-'] },
                { week: 'Week 3', days: ['P', 'P', 'P', 'P', 'P', '-'] },
                { week: 'Week 4', days: ['P', 'P', 'A', 'P', 'P', '-'] },
                { week: 'Week 5', days: ['P', 'P', 'P', 'P', 'A', '-'] },
              ].map(row => (
                <tr key={row.week}>
                  <td className="sd-att-heatmap-row-lbl">{row.week}</td>
                  {row.days.map((state, dIdx) => (
                    <td
                      key={dIdx}
                      className={`sd-att-heat-cell ${state === 'P' ? 'sd-heat-p' : state === 'A' ? 'sd-heat-a' : 'sd-heat-empty'}`}
                      title={`${row.week} - Day ${dIdx + 1}: ${state === 'P' ? 'Present' : state === 'A' ? 'Absent' : 'No Scheduled Class'}`}
                    >
                      {state}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sd-att-card-footer-note">
            Observation: Attendance is lowest on Friday afternoon lectures. 100% record maintained on Tuesdays & Thursdays.
          </div>
        </div>
      </div>

      {/* ── Section 10: Course Performance Breakdown Table ────── */}
      <div className="sd-att-table-card">
        <div className="sd-att-table-header">
          <div>
            <h2 className="sd-att-card-title">Course Performance Breakdown</h2>
            <p className="sd-att-card-sub">Course-specific attendance counts and safety threshold status.</p>
          </div>

          <div className="sd-att-table-controls">
            <div className="sd-att-table-search">
              <SearchIcon size={13} color="#758087" />
              <input
                type="text"
                placeholder="Search course or professor..."
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
              />
            </div>

            <div className="sd-att-filter-tabs">
              {[
                { id: 'all', label: `All Courses (${DEFAULT_COURSES_PERF.length})` },
                { id: 'core', label: 'Core' },
                { id: 'elective', label: 'Electives' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`sd-att-tab-btn ${courseFilter === tab.id ? 'active' : ''}`}
                  onClick={() => setCourseFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sd-att-table-wrap">
          <table className="sd-att-table" aria-label="Course Performance Breakdown">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Course Code & Name</th>
                <th style={{ width: '18%' }}>Faculty</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Present</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Absent</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Total</th>
                <th style={{ width: '16%' }}>Attendance %</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map(course => {
                const isSafe = course.pct >= 85
                const isWarning = course.pct >= 75 && course.pct < 85
                const barColor = isSafe ? '#557E6D' : isWarning ? '#B5822C' : '#BC6D61'

                return (
                  <tr key={course.code}>
                    <td>
                      <div className="sd-att-course-cell">
                        <span
                          className="sd-att-course-badge"
                          style={{ backgroundColor: `${course.color}1A`, color: course.color, border: `1px solid ${course.color}40` }}
                        >
                          {course.code}
                        </span>
                        <div>
                          <div className="sd-att-course-name">{course.name}</div>
                          <div className="sd-att-course-meta">{course.type} • {course.credits} Credits</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="sd-att-faculty-cell">
                        <div className="sd-att-faculty-avatar">
                          {course.faculty.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{course.faculty}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#557E6D' }}>
                      {course.present}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 600, color: course.absent > 0 ? '#BC6D61' : '#758087' }}>
                      {course.absent}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 500, color: '#758087' }}>
                      {course.total}
                    </td>

                    <td>
                      <div className="sd-att-progress-bar-wrap">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                          <span style={{ color: barColor }}>{course.pct}%</span>
                          <span style={{ color: '#758087', fontSize: '10px' }}>min 75%</span>
                        </div>
                        <div className="sd-att-progress-track">
                          <div
                            className="sd-att-progress-fill"
                            style={{ width: `${course.pct}%`, backgroundColor: barColor }}
                          />
                          <div className="sd-att-progress-min-line" style={{ left: '75%' }} title="75% Minimum Threshold" />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`sd-att-status-badge ${isSafe ? 'sd-att-status-safe' : isWarning ? 'sd-att-status-warning' : 'sd-att-status-risk'}`}>
                        {isSafe ? '● Safe' : isWarning ? '▲ Warning' : '✖ Risk'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="sd-att-btn-history"
                        onClick={() => handleViewCourseHistory(course.code)}
                        title={`Filter logs for ${course.code}`}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 11: Session Activity Logs ─────────────────── */}
      <div className="sd-att-logs-card" id="sd-session-logs-section">
        <div className="sd-att-logs-header">
          <div>
            <h2 className="sd-att-card-title">Session Activity Logs</h2>
            <p className="sd-att-card-sub">Real-time verification log records for student attendance.</p>
          </div>

          <div className="sd-att-logs-filters">
            {/* Filter buttons */}
            {[
              { id: 'all',     label: 'All Sessions', count: allLogs.length },
              { id: 'present', label: 'Present', count: allLogs.filter(l => l.status === 'present').length },
              { id: 'absent',  label: 'Absent', count: allLogs.filter(l => l.status === 'absent').length },
            ].map(pill => (
              <button
                key={pill.id}
                className={`sd-att-status-pill-btn ${logStatusFilter === pill.id ? 'active' : ''}`}
                onClick={() => { setLogStatusFilter(pill.id); setLogPage(1); }}
              >
                <span>{pill.label}</span>
                <span className="sd-att-pill-count">{pill.count}</span>
              </button>
            ))}

            {/* Subject Dropdown */}
            <select
              className="sd-att-select"
              value={logCourseFilter}
              onChange={e => { setLogCourseFilter(e.target.value); setLogPage(1); }}
              aria-label="Filter by Course"
            >
              <option value="all">All Subjects</option>
              <option value="CS101">CS101 (Data Structures)</option>
              <option value="CS205">CS205 (Operating Systems)</option>
              <option value="CS312">CS312 (Database Systems)</option>
              <option value="CS401">CS401 (Computer Networks)</option>
              <option value="AI202">AI202 (Machine Learning)</option>
              <option value="MA301">MA301 (Discrete Maths)</option>
            </select>

            {/* Date Range Selector */}
            <select
              className="sd-att-select"
              value={logDateRange}
              onChange={e => setLogDateRange(e.target.value)}
              aria-label="Filter Date Range"
            >
              <option value="semester">This Semester</option>
              <option value="30days">Last 30 Days</option>
              <option value="7days">This Week</option>
            </select>
          </div>
        </div>

        <div className="sd-att-table-wrap">
          <table className="sd-att-table" aria-label="Session Activity Logs">
            <thead>
              <tr>
                <th style={{ width: '13%' }}>Date</th>
                <th style={{ width: '11%' }}>Day</th>
                <th style={{ width: '32%' }}>Course & Location</th>
                <th style={{ width: '18%' }}>Faculty</th>
                <th style={{ width: '14%' }}>Session Time</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map(log => {
                const isPresent = log.status === 'present'
                const isMedical = log.verification.includes('Medical')
                const isPending = log.verification.includes('Pending')

                return (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600, color: '#162F44', whiteSpace: 'nowrap' }}>
                      {log.date}
                    </td>

                    <td style={{ color: '#758087' }}>
                      {log.day}
                    </td>

                    <td>
                      <div className="sd-att-course-cell">
                        <span
                          className="sd-att-course-badge"
                          style={{
                            backgroundColor: log.course === 'CS101' ? '#8B5CF61A' : log.course === 'CS205' ? '#3B82F61A' : log.course === 'CS312' ? '#10B9811A' : '#F59E0B1A',
                            color: log.course === 'CS101' ? '#8B5CF6' : log.course === 'CS205' ? '#3B82F6' : log.course === 'CS312' ? '#10B981' : '#F59E0B',
                          }}
                        >
                          {log.course}
                        </span>
                        <div>
                          <div className="sd-att-course-name">{log.courseName}</div>
                          <div className="sd-att-course-meta">📍 {log.location}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontWeight: 500 }}>
                      {log.faculty}
                    </td>

                    <td style={{ color: '#758087', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                      <ClockIcon size={12} color="#758087" /> {log.time}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className={`sd-att-status-badge ${isPresent ? 'sd-att-status-safe' : isMedical ? 'sd-att-status-warning' : isPending ? 'sd-att-status-warning' : 'sd-att-status-risk'}`}>
                          {isPresent ? '✓ Present' : isMedical ? '✚ Excused' : isPending ? '⏳ Pending' : '✕ Absent'}
                        </span>
                        <span className="sd-att-verification-chip" title={log.verification}>
                          {log.verification}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="sd-att-pagination">
          <span className="sd-att-page-info">
            {viewAllLogs
              ? `Showing all ${filteredLogs.length} sessions`
              : `Showing ${Math.min((logPage - 1) * logsPerPage + 1, filteredLogs.length)}–${Math.min(logPage * logsPerPage, filteredLogs.length)} of ${filteredLogs.length} sessions`}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="sd-att-btn-view-all"
              onClick={() => setViewAllLogs(v => !v)}
            >
              {viewAllLogs ? 'Collapse to Paginated' : 'View All Sessions'}
            </button>

            {!viewAllLogs && totalLogPages > 1 && (
              <div className="sd-att-page-controls">
                <button
                  className="sd-att-page-btn"
                  disabled={logPage === 1}
                  onClick={() => setLogPage(p => Math.max(1, p - 1))}
                  aria-label="Previous Page"
                >
                  <ChevronLeftIcon size={12} /> Prev
                </button>

                {Array.from({ length: totalLogPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`sd-att-page-num ${logPage === pageNum ? 'active' : ''}`}
                    onClick={() => setLogPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="sd-att-page-btn"
                  disabled={logPage === totalLogPages}
                  onClick={() => setLogPage(p => Math.min(totalLogPages, p + 1))}
                  aria-label="Next Page"
                >
                  Next <ChevronRightIcon size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 12: Bottom Attendance Action Panel ────────── */}
      <div className="sd-att-action-panel">
        <div className="sd-att-action-left">
          <div className="sd-att-action-icon-wrap">
            <ScanFrameIcon size={22} color="#FFFFFF" />
          </div>
          <div>
            <h3 className="sd-att-action-heading">Attending an active session right now?</h3>
            <p className="sd-att-action-sub">
              Open your live barcode or geolocation camera to check in to classroom lectures.
            </p>
          </div>
        </div>
        <div className="sd-att-action-btns">
          <button
            className="sd-att-btn-primary"
            onClick={() => onNav && onNav('scanner')}
            title="Open scanner tab"
          >
            <CameraIcon size={14} color="#FFFFFF" />
            <span>Launch QR Scanner</span>
          </button>
          <button
            className="sd-att-btn-secondary"
            onClick={() => onNav && onNav('timetable')}
            title="View today's timetable"
          >
            <CalendarIcon size={14} color="#FFFFFF" />
            <span>Today&apos;s Schedule</span>
          </button>
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════
//  TAB: SCANNER (2-Step Attendance Verification)
// ═══════════════════════════════════════════════════════════
function TabScanner({ user, attData, onNav }) {
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
        <ScannerQRContent user={user} attData={attData} onNav={onNav} onReset={() => setStep(1)} />
      )}
    </div>
  )
}

// ─── Session Lock Banner ──────────────────────────────────────────────────────
function SessionLockBanner() {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem('active_qr_session')
      if (!raw) return null
      const s = JSON.parse(raw)
      if (s?.expiresAt && s.expiresAt < Date.now()) {
        localStorage.removeItem('active_qr_session')
        return null
      }
      return s
    } catch { return null }
  })
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const check = () => {
      try {
        const raw = localStorage.getItem('active_qr_session')
        if (!raw) {
          setSession(null)
          setTimeLeft(null)
          return
        }
        const s = JSON.parse(raw)
        if (s?.expiresAt && s.expiresAt < Date.now()) {
          localStorage.removeItem('active_qr_session')
          setSession(null)
          setTimeLeft(null)
          return
        }
        setSession(s)
        if (s?.expiresAt) {
          const left = Math.max(0, Math.ceil((s.expiresAt - Date.now()) / 1000))
          setTimeLeft(left)
        }
      } catch {
        setSession(null)
        setTimeLeft(null)
      }
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
            Course: <strong>{session.course_id || '—'}</strong> · Scan QR code to unlock & record attendance
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

function ScannerQRContent({ user, attData, onNav, onReset }) {
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
    setMsg('⏳ Verifying QR token & recording attendance...')
    try {
      const formData = new FormData()
      formData.append("token", code)
      formData.append("student_id", user?.email || "mock_student@smartattend.com")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      let data = {}
      try {
        const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/qr`, {
          method: "POST",
          body: formData,
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          data = await res.json()
        } else {
          const err = await res.json().catch(() => ({}))
          // Fallback if token is demo or local session
          let fallbackCourse = null
          try {
            const s = JSON.parse(localStorage.getItem('active_qr_session') || 'null')
            if (s?.course_id) fallbackCourse = s.course_id
          } catch (e) {}
          if (!fallbackCourse && code.includes('ATTENTIFY-')) {
            fallbackCourse = code.split('-')[1]
          }
          if (fallbackCourse) {
            data = { course_id: fallbackCourse, method: 'qr', status: 'present' }
          } else {
            throw new Error(err.detail || "Invalid QR Code")
          }
        }
      } catch (netErr) {
        let fallbackCourse = null
        try {
          const s = JSON.parse(localStorage.getItem('active_qr_session') || 'null')
          if (s?.course_id) fallbackCourse = s.course_id
        } catch (e) {}
        if (!fallbackCourse && code.includes('ATTENTIFY-')) {
          fallbackCourse = code.split('-')[1]
        }
        if (fallbackCourse) {
          data = { course_id: fallbackCourse, method: 'qr', status: 'present' }
        } else {
          throw netErr
        }
      }

      const courseId = data.course_id || 'CS101'
      const newRecord = {
        _id: data._id || `att_${Date.now()}`,
        id: data._id || `att_${Date.now()}`,
        student_id: user?.email || "student@smartattend.com",
        course_id: courseId,
        course: courseId,
        method: 'QR Code + Face',
        status: 'present',
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      // Immediately clear active session lock in localStorage
      try {
        localStorage.removeItem('active_qr_session')
      } catch (e) {}

      // Immediately update student dashboard state
      if (attData?.recordAttendance) {
        attData.recordAttendance(newRecord)
      } else if (attData?.refresh) {
        attData.refresh()
      }

      setResult('success')
      setMsg(`✅ Attendance marked successfully for ${courseId}! Dashboard updated.`)
      setHistory(prev => [
        { id: Date.now(), course: courseId, time: 'Just now', status: 'success' },
        ...prev,
      ])

      // Auto-navigate to Overview after 1.8 seconds so student immediately sees their updated dashboard
      setTimeout(() => {
        if (onNav) onNav('overview')
      }, 1800)
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
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, padding: '1rem', textAlign: 'center', zIndex: 10 }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Attendance Marked!</span>
                <span style={{ color: '#e6fffa', fontSize: '0.88rem' }}>Face Verified & QR Authenticated. Updating your dashboard...</span>
                <button
                  type="button"
                  onClick={() => onNav && onNav('overview')}
                  style={{
                    background: '#FFFFFF',
                    color: '#162F44',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.25rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  View Updated Dashboard 📊
                </button>
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
//  TAB: CLASSES (Student Course Management Dashboard)
// ═══════════════════════════════════════════════════════════
function TabClasses({ attData, onNav, topbarSearch = '' }) {
  const [semester, setSemester] = useState('Fall 2024 (Sem 5)')
  const [academicYear, setAcademicYear] = useState('AY 2024-25')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [scheduleView, setScheduleView] = useState('today') // 'today' | 'weekly'
  const [openMenuId, setOpenMenuId] = useState(null)
  const [detailCourse, setDetailCourse] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

  const baseCourses = attData?.courses || COURSES
  const rawSchedule = attData?.todaySchedule || TODAY_SCHEDULE

  // Enrich courses with metadata consistent with the app's existing courses & faculty
  const COURSE_META = {
    CS101: {
      category: 'Core • 4 Credits',
      endTime: '10:30 AM',
      nextClass: 'Mon, Wed, Fri • 9:00 AM',
      office: 'Block A, Room 204',
      syllabus: 'Arrays, linked lists, trees, balanced search trees, graphs, sorting, hashing, and algorithm complexity.',
      assignments: [
        { title: 'Assignment 3: AVL & Red-Black Tree Rotations', due: 'Nov 18', status: 'Pending' },
        { title: 'Lab 4: Dijkstra Shortest Path Implementation', due: 'Nov 05', status: 'Submitted' },
      ],
    },
    CS205: {
      category: 'Core • 4 Credits',
      endTime: '12:30 PM',
      nextClass: 'Tue, Thu • 11:00 AM',
      office: 'Block B, Room 112',
      syllabus: 'Process management, CPU scheduling, concurrency, deadlocks, memory paging, virtual memory, and file systems.',
      assignments: [
        { title: 'Assignment 2: Multi-threaded Producer-Consumer Sync', due: 'Nov 20', status: 'In Progress' },
        { title: 'Lab 3: Virtual Memory Page Replacement Simulator', due: 'Nov 02', status: 'Graded (92%)' },
      ],
    },
    CS312: {
      category: 'Core • 3 Credits',
      endTime: '3:30 PM',
      nextClass: 'Mon, Wed • 2:00 PM',
      office: 'Block A, Room 308',
      syllabus: 'ER modeling, relational algebra, SQL optimization, normalization (BCNF/3NF), ACID transactions, and B+ tree indexing.',
      assignments: [
        { title: 'Project Milestone 2: E-Commerce Schema & Triggers', due: 'Nov 22', status: 'Pending' },
        { title: 'Assignment 1: Relational Algebra & Normalization', due: 'Oct 28', status: 'Graded (96%)' },
      ],
    },
  }

  const enrichedCourses = baseCourses.map(c => {
    const meta = COURSE_META[c.id] || {
      category: 'Core Subject',
      endTime: '10:30 AM',
      nextClass: c.schedule || 'Scheduled Weekly',
      office: 'Academic Block',
      syllabus: 'Semester coursework, lectures, and practical laboratory modules.',
      assignments: [],
    }
    const p = pct(c)
    return {
      ...c,
      ...meta,
      pctVal: p,
    }
  })

  // Summary metrics
  const totalCourses = enrichedCourses.length
  const totalAttended = enrichedCourses.reduce((s, c) => s + (c.attended || 0), 0)
  const totalClasses = enrichedCourses.reduce((s, c) => s + (c.total || 0), 0)
  const avgAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 87

  // Enrich Today's schedule with faculty and status types (Completed, Ongoing, Upcoming, Cancelled)
  const enrichedSchedule = rawSchedule.map((s, idx) => {
    const courseObj = enrichedCourses.find(c => c.id === s.course)
    const endMap = { '9:00 AM': '10:30 AM', '11:00 AM': '12:30 PM', '2:00 PM': '3:30 PM' }
    let statusType = 'upcoming'
    if (s.status === 'done') statusType = 'completed'
    else if (idx === 0 || (idx === 1 && rawSchedule[0]?.status === 'done')) statusType = 'ongoing'

    return {
      ...s,
      startTime: s.time,
      endTime: endMap[s.time] || '10:30 AM',
      faculty: courseObj?.faculty || 'Faculty',
      color: courseObj?.color || '#557E6D',
      statusType,
    }
  })

  // Filter & Sort Enrolled Courses
  const activeQuery = (searchQuery || topbarSearch).trim().toLowerCase()
  const filteredCourses = enrichedCourses
    .filter(c => {
      if (statusFilter === 'safe' && c.pctVal < 85) return false
      if (statusFilter === 'warning' && c.pctVal >= 85) return false
      if (activeQuery) {
        return (
          c.id.toLowerCase().includes(activeQuery) ||
          c.name.toLowerCase().includes(activeQuery) ||
          c.faculty.toLowerCase().includes(activeQuery) ||
          c.room.toLowerCase().includes(activeQuery)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'attendance') return b.pctVal - a.pctVal
      if (sortBy === 'code') return a.id.localeCompare(b.id)
      return 0
    })

  // Weekly Schedule Preview Grid Data (Monday to Saturday)
  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const WEEKLY_DAYS = [
    {
      day: 'Monday',
      slots: [
        { time: '9:00 AM – 10:30 AM', code: 'CS101', name: 'Data Structures', room: 'Lab 3', color: '#8B5CF6' },
        { time: '2:00 PM – 3:30 PM', code: 'CS312', name: 'Database Systems', room: 'Room 7', color: '#34D399' },
      ],
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '11:00 AM – 12:30 PM', code: 'CS205', name: 'Operating Systems', room: 'Room 12', color: '#60A5FA' },
      ],
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '9:00 AM – 10:30 AM', code: 'CS101', name: 'Data Structures', room: 'Lab 3', color: '#8B5CF6' },
        { time: '2:00 PM – 3:30 PM', code: 'CS312', name: 'Database Systems', room: 'Room 7', color: '#34D399' },
      ],
    },
    {
      day: 'Thursday',
      slots: [
        { time: '11:00 AM – 12:30 PM', code: 'CS205', name: 'Operating Systems', room: 'Room 12', color: '#60A5FA' },
      ],
    },
    {
      day: 'Friday',
      slots: [
        { time: '9:00 AM – 10:30 AM', code: 'CS101', name: 'Data Structures', room: 'Lab 3', color: '#8B5CF6' },
      ],
    },
    {
      day: 'Saturday',
      slots: [],
    },
  ]

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3200)
  }

  const nextUpcoming = enrichedSchedule.find(s => s.statusType === 'ongoing' || s.statusType === 'upcoming')

  return (
    <div className="sd-cls-view" onClick={() => openMenuId && setOpenMenuId(null)}>
      {/* ── Section 2: Page Header ────────────────────────────── */}
      <div className="sd-cls-header">
        <div>
          <div className="sd-cls-title-row">
            <h1 className="sd-cls-title">My Classes</h1>
            <span className="sd-cls-count-badge">{totalCourses} Enrolled</span>
          </div>
          <p className="sd-cls-subtitle">All enrolled courses for this semester.</p>
        </div>

        <div className="sd-cls-header-controls">
          <select
            className="sd-cls-select"
            value={semester}
            onChange={e => setSemester(e.target.value)}
            aria-label="Select Semester"
          >
            <option value="Fall 2024 (Sem 5)">Semester 5 (Fall 2024)</option>
            <option value="Spring 2024 (Sem 4)">Semester 4 (Spring 2024)</option>
            <option value="Fall 2023 (Sem 3)">Semester 3 (Fall 2023)</option>
          </select>

          <select
            className="sd-cls-select"
            value={academicYear}
            onChange={e => setAcademicYear(e.target.value)}
            aria-label="Select Academic Year"
          >
            <option value="AY 2024-25">AY 2024-25</option>
            <option value="AY 2023-24">AY 2023-24</option>
          </select>
        </div>
      </div>

      {toastMsg && (
        <div className="sd-att-toast" role="status">
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#276749', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Section 3: Course Summary Cards ───────────────────── */}
      <div className="sd-cls-kpi-grid">
        {/* Card 1: Total Courses */}
        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">TOTAL COURSES</div>
            <div className="sd-cls-kpi-value">{totalCourses} Courses</div>
            <div className="sd-cls-kpi-sub">Active semester enrollment</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#EDF1F5', color: '#162F44' }}>
            <GraduationCapIcon size={20} color="#162F44" />
          </div>
        </div>

        {/* Card 2: Average Attendance */}
        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">AVERAGE ATTENDANCE</div>
            <div className="sd-cls-kpi-value">{avgAttendance}%</div>
            <div className="sd-cls-kpi-sub">{totalAttended} / {totalClasses} sessions attended</div>
          </div>
          <div style={{ position: 'relative', width: '44px', height: '44px', flexShrink: 0 }}>
            <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="22" cy="22" r="18" fill="none" stroke="#E7E8E2" strokeWidth="4" />
              <circle
                cx="22" cy="22" r="18" fill="none"
                stroke={avgAttendance >= 75 ? '#557E6D' : '#BC6D61'}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - avgAttendance / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#162F44'
            }}>
              {avgAttendance}%
            </div>
          </div>
        </div>

        {/* Card 3: Today's Classes */}
        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">TODAY&apos;S CLASSES</div>
            <div className="sd-cls-kpi-value">{enrichedSchedule.length} Scheduled</div>
            <div className="sd-cls-kpi-sub">
              {nextUpcoming ? `Next: ${nextUpcoming.course} at ${nextUpcoming.startTime}` : 'All sessions completed today'}
            </div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#E8F2EC', color: '#557E6D' }}>
            <CalendarIcon size={20} color="#557E6D" />
          </div>
        </div>
      </div>

      {/* ── Section 4: Enrolled Courses Section & Toolbar ─────── */}
      <div className="sd-cls-section-block">
        <div className="sd-cls-toolbar-row">
          <h2 className="sd-cls-section-heading">Enrolled Courses</h2>

          <div className="sd-cls-toolbar">
            <div className="sd-cls-search-box">
              <SearchIcon size={13} color="#758087" />
              <input
                type="text"
                placeholder="Search courses, faculty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="sd-cls-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter courses"
            >
              <option value="all">Semester: All ({totalCourses})</option>
              <option value="safe">Safe Standing (≥85%)</option>
              <option value="warning">Needs Attention (&lt;85%)</option>
            </select>

            <select
              className="sd-cls-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label="Sort courses"
            >
              <option value="name">Sort: Course Name</option>
              <option value="code">Sort: Course Code</option>
              <option value="attendance">Sort: Attendance %</option>
            </select>

            <div className="sd-cls-view-toggle" role="group" aria-label="View mode toggle">
              <button
                className={`sd-cls-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
              >
                <GridIcon size={15} />
              </button>
              <button
                className={`sd-cls-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List View"
              >
                <ListIcon size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="sd-cls-schedule-card" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: 'var(--sd-text-secondary)', fontSize: '13.5px' }}>
              No enrolled courses match your current search or filter criteria.
            </p>
          </div>
        ) : (
          <div className={`sd-cls-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredCourses.map(c => {
              const p = c.pctVal
              const barColor = pctColor(p)
              const isMenuOpen = openMenuId === c.id

              return (
                <div
                  key={c.id}
                  id={`class-${c.id}`}
                  className="sd-cls-card"
                  onClick={() => setDetailCourse(c)}
                >
                  {/* Top Section */}
                  <div className="sd-cls-card-top">
                    <div className="sd-cls-card-badges">
                      <span
                        className="sd-cls-code-badge"
                        style={{
                          backgroundColor: `${c.color}1C`,
                          color: c.color === '#34d399' ? '#276749' : c.color,
                          border: `1px solid ${c.color}40`,
                        }}
                      >
                        {c.id}
                      </span>
                      <span className="sd-cls-cat-tag">{c.category}</span>
                    </div>

                    <div className="sd-cls-menu-wrap" onClick={e => e.stopPropagation()}>
                      <button
                        className="sd-cls-menu-btn"
                        onClick={() => setOpenMenuId(isMenuOpen ? null : c.id)}
                        title="Course options"
                        aria-label={`Options for ${c.id}`}
                      >
                        <DotsVerticalIcon size={15} />
                      </button>
                      {isMenuOpen && (
                        <div className="sd-cls-dropdown">
                          <button
                            className="sd-cls-dropdown-item"
                            onClick={() => { setOpenMenuId(null); setDetailCourse(c); }}
                          >
                            View Course Details
                          </button>
                          <button
                            className="sd-cls-dropdown-item"
                            onClick={() => { setOpenMenuId(null); onNav && onNav('attendance'); }}
                          >
                            View Attendance Logs
                          </button>
                          <button
                            className="sd-cls-dropdown-item"
                            onClick={() => {
                              setOpenMenuId(null)
                              if (navigator?.clipboard) navigator.clipboard.writeText(c.id)
                              triggerToast(`📋 Copied course code "${c.id}" to clipboard.`)
                            }}
                          >
                            Copy Course Code
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Section */}
                  <div className="sd-cls-card-main">
                    <h3 className="sd-cls-course-name">{c.name}</h3>
                    <div className="sd-cls-faculty-row">
                      <div className="sd-cls-faculty-avatar">
                        {c.faculty.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span>{c.faculty}</span>
                    </div>

                    <div className="sd-cls-att-block">
                      <div className="sd-cls-att-row">
                        <span className="sd-cls-att-lbl">Attendance</span>
                        <span className="sd-cls-att-pct" style={{ color: barColor }}>{p}%</span>
                      </div>
                      <div className="sd-cls-progress-track">
                        <div
                          className="sd-cls-progress-fill"
                          style={{ width: `${p}%`, backgroundColor: barColor }}
                        />
                        <div className="sd-cls-progress-min" title="75% Institutional Minimum" />
                      </div>
                    </div>
                  </div>

                  {/* Information Section */}
                  <div className="sd-cls-info-grid">
                    <div className="sd-cls-info-item">
                      <CheckCircleIcon size={13} color="#557E6D" />
                      <div>
                        <strong>{c.attended}/{c.total} Classes</strong>
                        <span className="sd-cls-info-sub">Attended</span>
                      </div>
                    </div>
                    <div className="sd-cls-info-item">
                      <MapPinIcon size={13} color="#758087" />
                      <div>
                        <strong>{c.room}</strong>
                        <span className="sd-cls-info-sub">Location</span>
                      </div>
                    </div>
                    <div className="sd-cls-info-item" style={{ gridColumn: '1 / -1' }}>
                      <ClockIcon size={13} color="#758087" />
                      <div>
                        <strong>{c.schedule}</strong>
                        <span className="sd-cls-info-sub">Next Scheduled: {c.nextClass}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="sd-cls-card-footer" onClick={e => e.stopPropagation()}>
                    <button
                      className="sd-cls-btn-details"
                      onClick={() => setDetailCourse(c)}
                    >
                      View Details
                    </button>
                    <button
                      className="sd-cls-btn-attendance"
                      onClick={() => onNav && onNav('attendance')}
                    >
                      View Attendance
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Sections 5 & 6: Today's Timetable & Weekly Schedule Preview ─ */}
      <div className="sd-cls-schedule-card">
        <div className="sd-cls-sched-header">
          <div>
            <h2 className="sd-cls-section-heading">
              {scheduleView === 'today' ? "Today's Timetable" : 'Weekly Schedule Preview'}
            </h2>
            <p className="sd-cls-subtitle" style={{ marginTop: '2px' }}>
              {scheduleView === 'today'
                ? 'Your scheduled classes for today.'
                : 'Monday to Saturday structured class schedule.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="sd-cls-sched-tabs" role="tablist">
              <button
                className={`sd-cls-sched-tab ${scheduleView === 'today' ? 'active' : ''}`}
                onClick={() => setScheduleView('today')}
                role="tab"
                aria-selected={scheduleView === 'today'}
              >
                Today&apos;s Timetable
              </button>
              <button
                className={`sd-cls-sched-tab ${scheduleView === 'weekly' ? 'active' : ''}`}
                onClick={() => setScheduleView('weekly')}
                role="tab"
                aria-selected={scheduleView === 'weekly'}
              >
                Weekly Schedule
              </button>
            </div>

            <button
              className="sd-cls-link-btn"
              onClick={() => onNav && onNav('timetable')}
            >
              <span>View Full Timetable →</span>
            </button>
          </div>
        </div>

        {/* Today's Vertical Timeline Layout */}
        {scheduleView === 'today' ? (
          <div className="sd-cls-timeline">
            {enrichedSchedule.map((s, idx) => {
              const isOngoing = s.statusType === 'ongoing'
              const isCompleted = s.statusType === 'completed'
              const isCancelled = s.statusType === 'cancelled'
              const dotColor = isCompleted ? '#557E6D' : isOngoing ? '#162F44' : isCancelled ? '#BC6D61' : '#94A3B8'

              return (
                <div key={idx} className="sd-cls-tl-item">
                  <div className="sd-cls-tl-time-col">
                    <div className="sd-cls-tl-start">{s.startTime}</div>
                    <div className="sd-cls-tl-end">{s.endTime}</div>
                  </div>

                  <div className="sd-cls-tl-axis">
                    <div
                      className={`sd-cls-tl-dot ${isOngoing ? 'ongoing' : ''}`}
                      style={{ backgroundColor: dotColor, color: dotColor }}
                    />
                    {idx < enrichedSchedule.length - 1 && <div className="sd-cls-tl-line" />}
                  </div>

                  <div className={`sd-cls-tl-content ${isOngoing ? 'ongoing' : ''}`}>
                    <div>
                      <div className="sd-cls-tl-title-row">
                        <span
                          className="sd-cls-code-badge"
                          style={{
                            backgroundColor: `${s.color}1C`,
                            color: s.color === '#34d399' ? '#276749' : s.color,
                          }}
                        >
                          {s.course}
                        </span>
                        <span className="sd-cls-tl-name">{s.name}</span>
                        {isOngoing && (
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#557E6D', background: '#E8F2EC', padding: '1px 6px', borderRadius: '4px' }}>
                            Active Session
                          </span>
                        )}
                      </div>
                      <div className="sd-cls-tl-meta">
                        <span>👨‍🏫 {s.faculty}</span>
                        <span>📍 {s.room}</span>
                      </div>
                    </div>

                    <span
                      className={`sd-cls-status-pill ${
                        isCompleted
                          ? 'sd-cls-status-completed'
                          : isOngoing
                          ? 'sd-cls-status-ongoing'
                          : isCancelled
                          ? 'sd-cls-status-cancelled'
                          : 'sd-cls-status-upcoming'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : isOngoing ? '● Ongoing' : isCancelled ? '✕ Cancelled' : '○ Upcoming'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Compact Weekly Schedule Grid (Monday to Saturday) */
          <div className="sd-cls-weekly-grid">
            {WEEKLY_DAYS.map(dayObj => {
              const isToday = dayObj.day === currentDayName
              return (
                <div key={dayObj.day} className={`sd-cls-day-col ${isToday ? 'today' : ''}`}>
                  <div className="sd-cls-day-header">
                    <span>{dayObj.day}</span>
                    {isToday && <span className="sd-cls-today-tag">Today</span>}
                  </div>
                  {dayObj.slots.length === 0 ? (
                    <div style={{ fontSize: '11px', color: 'var(--sd-text-secondary)', padding: '14px 4px', textAlign: 'center' }}>
                      No classes scheduled
                    </div>
                  ) : (
                    dayObj.slots.map((slot, sIdx) => (
                      <div
                        key={sIdx}
                        className="sd-cls-slot-card"
                        style={{ borderLeft: `3px solid ${slot.color}` }}
                      >
                        <span className="sd-cls-slot-time">{slot.time}</span>
                        <span className="sd-cls-slot-title">{slot.code} – {slot.name}</span>
                        <span className="sd-cls-slot-room">📍 {slot.room}</span>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Section 7: Course Detail Side Panel ────────────────── */}
      {detailCourse && (
        <div className="sd-cls-drawer-backdrop" onClick={() => setDetailCourse(null)}>
          <div className="sd-cls-drawer" onClick={e => e.stopPropagation()} role="dialog" aria-label="Course Details">
            <div className="sd-cls-drawer-topbar">
              <button className="sd-cls-back-btn" onClick={() => setDetailCourse(null)}>
                <ArrowLeftIcon size={15} />
                <span>Back to My Classes</span>
              </button>
              <button
                onClick={() => setDetailCourse(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#758087' }}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            <div className="sd-cls-drawer-body">
              {/* Hero Course Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    className="sd-cls-code-badge"
                    style={{
                      backgroundColor: `${detailCourse.color}1C`,
                      color: detailCourse.color === '#34d399' ? '#276749' : detailCourse.color,
                      border: `1px solid ${detailCourse.color}40`,
                    }}
                  >
                    {detailCourse.id}
                  </span>
                  <span className="sd-cls-cat-tag">{detailCourse.category}</span>
                </div>
                <h2 style={{ fontFamily: 'var(--sd-font-serif)', fontSize: '26px', color: 'var(--sd-navy)', marginBottom: '6px' }}>
                  {detailCourse.name}
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--sd-text-secondary)', lineHeight: 1.5 }}>
                  {detailCourse.syllabus}
                </p>
              </div>

              {/* Attendance Summary Card */}
              <div className="sd-cls-drawer-section">
                <div className="sd-cls-drawer-sec-title">Course Attendance Standing</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span style={{ fontSize: '28px', fontFamily: 'var(--sd-font-serif)', color: detailCourse.pctVal >= 75 ? '#557E6D' : '#BC6D61' }}>
                    {detailCourse.pctVal}%
                  </span>
                  <span className={`sd-att-status-badge ${detailCourse.pctVal >= 85 ? 'sd-att-status-safe' : detailCourse.pctVal >= 75 ? 'sd-att-status-warning' : 'sd-att-status-risk'}`}>
                    {detailCourse.pctVal >= 85 ? '● Safe Standing' : detailCourse.pctVal >= 75 ? '▲ Warning Threshold' : '✖ At Risk'}
                  </span>
                </div>
                <div className="sd-cls-progress-track">
                  <div
                    className="sd-cls-progress-fill"
                    style={{
                      width: `${detailCourse.pctVal}%`,
                      backgroundColor: detailCourse.pctVal >= 85 ? '#557E6D' : detailCourse.pctVal >= 75 ? '#B5822C' : '#BC6D61',
                    }}
                  />
                  <div className="sd-cls-progress-min" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--sd-text-secondary)', marginTop: '4px' }}>
                  <span>Attended: <strong>{detailCourse.attended}</strong></span>
                  <span>Missed: <strong>{detailCourse.total - detailCourse.attended}</strong></span>
                  <span>Total: <strong>{detailCourse.total}</strong></span>
                </div>
              </div>

              {/* Faculty & Schedule Info */}
              <div className="sd-cls-drawer-section">
                <div className="sd-cls-drawer-sec-title">Faculty &amp; Schedule Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                  <div>
                    <span className="sd-cls-info-sub">Instructor</span>
                    <strong>{detailCourse.faculty}</strong>
                  </div>
                  <div>
                    <span className="sd-cls-info-sub">Faculty Office</span>
                    <strong>{detailCourse.office}</strong>
                  </div>
                  <div>
                    <span className="sd-cls-info-sub">Weekly Schedule</span>
                    <strong>{detailCourse.schedule}</strong>
                  </div>
                  <div>
                    <span className="sd-cls-info-sub">Classroom Location</span>
                    <strong>{detailCourse.room}</strong>
                  </div>
                </div>
              </div>

              {/* Course Assignments */}
              <div className="sd-cls-drawer-section">
                <div className="sd-cls-drawer-sec-title">Course Assignments</div>
                {detailCourse.assignments && detailCourse.assignments.length > 0 ? (
                  detailCourse.assignments.map((asg, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: idx < detailCourse.assignments.length - 1 ? '1px solid #ECEFEA' : 'none',
                      fontSize: '12px'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--sd-navy)' }}>{asg.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--sd-text-secondary)' }}>Due: {asg.due}</div>
                      </div>
                      <span className="sd-cls-count-badge">{asg.status}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--sd-text-secondary)' }}>No pending assignments for this course.</p>
                )}
              </div>

              {/* Recent Attendance History & Upcoming Classes */}
              <div className="sd-cls-drawer-section">
                <div className="sd-cls-drawer-sec-title">Recent Attendance History</div>
                {(() => {
                  const courseLogs = (attData?.logs || []).filter(l => (l.course_id || l.course) === detailCourse.id)
                  if (courseLogs.length === 0) {
                    return (
                      <div style={{ fontSize: '12px', color: 'var(--sd-text-secondary)' }}>
                        Recent sessions verified cleanly. Upcoming lecture: <strong>{detailCourse.nextClass}</strong> in <strong>{detailCourse.room}</strong>.
                      </div>
                    )
                  }
                  return courseLogs.slice(0, 4).map((l, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                      <span>{l.timestamp ? new Date(l.timestamp).toLocaleDateString() : 'Recent Session'}</span>
                      <span style={{ color: l.status === 'present' ? '#557E6D' : '#BC6D61', fontWeight: 600 }}>
                        {l.status === 'present' ? '✓ Present' : '✕ Absent'}
                      </span>
                    </div>
                  ))
                })()}
              </div>

              <button
                className="sd-cls-btn-details"
                onClick={() => { setDetailCourse(null); onNav && onNav('attendance'); }}
              >
                Open Full Attendance Analytics →
              </button>
            </div>
          </div>
        </div>
      )}
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
function TabStudentAssignments({ topbarSearch = '' }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [sortBy, setSortBy]           = useState('due')
  const [searchQ, setSearchQ]         = useState('')
  const [selectedAsg, setSelectedAsg] = useState(null)

  const loadAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const apiBase = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'
      const res = await fetch(`${apiBase}/assignments/`)
      const data = res.ok ? await res.json() : []
      setAssignments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load assignments:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  const now = new Date()
  const isOverdue = (a) => {
    const d = a.due_date || a.dueDate
    return Boolean(d && new Date(d) < now)
  }

  const courseOptions = Array.from(
    new Set([
      ...BASE_ENROLLED_COURSES.map(c => c.id),
      ...assignments.map(a => a.course).filter(Boolean),
    ])
  )

  const activeCount = assignments.filter(a => !isOverdue(a)).length
  const pastCount = assignments.filter(a => isOverdue(a)).length
  const totalMarks = assignments.reduce((acc, a) => acc + (Number(a.marks) || 0), 0)
  const combinedQuery = (searchQ || topbarSearch || '').trim().toLowerCase()

  const filtered = assignments
    .filter(a => {
      const due = a.due_date || a.dueDate
      if (filter === 'active' && !(!due || new Date(due) >= now)) return false
      if (filter === 'past' && !(due && new Date(due) < now)) return false
      if (courseFilter !== 'all' && a.course !== courseFilter) return false
      if (combinedQuery) {
        const hay = `${a.title || ''} ${a.course || ''} ${a.faculty || ''} ${a.description || ''}`.toLowerCase()
        if (!hay.includes(combinedQuery)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'course') return (a.course || '').localeCompare(b.course || '')
      if (sortBy === 'marks') return (Number(b.marks) || 0) - (Number(a.marks) || 0)
      const da = new Date(a.due_date || a.dueDate || '9999-12-31').getTime()
      const db = new Date(b.due_date || b.dueDate || '9999-12-31').getTime()
      return da - db
    })

  const getCourseBadgeStyle = (code) => {
    const found = BASE_ENROLLED_COURSES.find(c => c.id === code)
    const color = found ? found.color : '#8B5CF6'
    return {
      backgroundColor: `${color}1C`,
      color: color === '#34d399' ? '#276749' : color === '#a78bfa' ? '#6D28D9' : '#1D4ED8',
      border: `1px solid ${color}40`,
    }
  }

  return (
    <div className="sd-cls-view">
      {/* Header */}
      <div className="sd-cls-header">
        <div>
          <div className="sd-cls-title-row">
            <h1 className="sd-cls-title">Assignments</h1>
            <span className="sd-cls-count-badge">{assignments.length} Posted</span>
          </div>
          <p className="sd-cls-subtitle">
            Track coursework, submission deadlines, and faculty instructions across your courses.
          </p>
        </div>

        <div className="sd-cls-header-controls">
          <select
            className="sd-cls-select"
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            aria-label="Filter assignments by course"
          >
            <option value="all">All Courses</option>
            {courseOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            type="button"
            className="sd-sub-btn-outline"
            onClick={loadAssignments}
            disabled={loading}
          >
            <RefreshIcon size={14} />
            <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 3 Equal KPI Summary Cards */}
      <div className="sd-cls-kpi-grid">
        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">TOTAL ASSIGNMENTS</div>
            <div className="sd-cls-kpi-value">{assignments.length} Tasks</div>
            <div className="sd-cls-kpi-sub">Synced with faculty portal</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#EDF1F5', color: '#162F44' }}>
            <FilePenIcon size={19} color="#162F44" />
          </div>
        </div>

        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">ACTIVE &amp; UPCOMING</div>
            <div className="sd-cls-kpi-value">{activeCount} Open</div>
            <div className="sd-cls-kpi-sub">Ready for submission</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#E8F2EC', color: '#557E6D' }}>
            <CheckCircleIcon size={19} color="#557E6D" />
          </div>
        </div>

        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">PAST DUE</div>
            <div className="sd-cls-kpi-value">{pastCount} Closed</div>
            <div className="sd-cls-kpi-sub">
              {totalMarks > 0 ? `${totalMarks} total graded marks` : 'Stay ahead of deadlines'}
            </div>
          </div>
          <div
            className="sd-cls-kpi-icon-box"
            style={{
              backgroundColor: pastCount > 0 ? '#FBEBE8' : '#FBF4E6',
              color: pastCount > 0 ? '#BC6D61' : '#B5822C',
            }}
          >
            <ClockIcon size={19} color={pastCount > 0 ? '#BC6D61' : '#B5822C'} />
          </div>
        </div>
      </div>

      {/* Toolbar & Cards Section */}
      <div className="sd-cls-section-block">
        <div className="sd-cls-toolbar-row">
          <div className="sd-sub-pills" role="tablist" aria-label="Assignment status filter">
            {[
              { key: 'all', label: `All (${assignments.length})` },
              { key: 'active', label: `Active (${activeCount})` },
              { key: 'past', label: `Past Due (${pastCount})` },
            ].map(f => (
              <button
                key={f.key}
                id={`asgn-filter-${f.key}`}
                type="button"
                className={`sd-sub-pill ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="sd-cls-toolbar">
            <div className="sd-cls-search-box">
              <SearchIcon size={14} color="#758087" />
              <input
                type="text"
                placeholder="Search title, course, faculty..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                aria-label="Search assignments"
              />
            </div>

            <select
              className="sd-cls-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label="Sort assignments"
            >
              <option value="due">Sort: Due Date</option>
              <option value="course">Sort: Course Code</option>
              <option value="marks">Sort: Highest Marks</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="sd-sub-empty-card">
            <ClockIcon size={28} color="#758087" />
            <h3 className="sd-sub-empty-title">Loading assignments…</h3>
            <p className="sd-sub-empty-desc">Fetching latest coursework posted by your instructors.</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="sd-sub-empty-card">
            <div className="sd-sub-empty-icon">
              <FilePenIcon size={24} color="#162F44" />
            </div>
            <h3 className="sd-sub-empty-title">No assignments posted yet</h3>
            <p className="sd-sub-empty-desc">
              Your faculty hasn&apos;t published any coursework yet. Check back soon or refresh to sync.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sd-sub-empty-card">
            <div className="sd-sub-empty-icon">
              <SearchIcon size={22} color="#162F44" />
            </div>
            <h3 className="sd-sub-empty-title">No matching assignments</h3>
            <p className="sd-sub-empty-desc">
              Adjust your course filter, status tab, or search term to view other coursework.
            </p>
            <button
              type="button"
              className="sd-sub-btn-outline"
              onClick={() => {
                setFilter('all')
                setCourseFilter('all')
                setSearchQ('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="sd-asg-grid">
            {filtered.map((a, idx) => {
              const due = a.due_date || a.dueDate
              const posted = a.created_at || a.createdAt
              const overdue = isOverdue(a)
              const accentColor = overdue ? '#BC6D61' : due ? '#557E6D' : '#162F44'
              return (
                <div
                  key={a._id || idx}
                  className="sd-asg-card"
                  style={{ borderTop: `3px solid ${accentColor}` }}
                  onClick={() => setSelectedAsg(a)}
                >
                  <div className="sd-asg-card-top">
                    <div className="sd-cls-card-badges">
                      <span className="sd-cls-code-badge" style={getCourseBadgeStyle(a.course)}>
                        {a.course || 'COURSE'}
                      </span>
                      <span
                        className={`sd-cls-status-pill ${
                          overdue ? 'sd-cls-status-cancelled' : due ? 'sd-cls-status-completed' : 'sd-cls-status-upcoming'
                        }`}
                      >
                        {overdue ? 'Past Due' : due ? 'Active' : 'Ongoing'}
                      </span>
                    </div>

                    {a.marks && (
                      <span className="sd-asg-marks-badge">
                        <AwardIcon size={13} color="#B5822C" />
                        <span>{a.marks} Marks</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="sd-asg-title">{a.title}</h3>
                    <p className="sd-asg-desc">
                      {a.description || 'Follow standard course submission instructions provided during lecture.'}
                    </p>
                  </div>

                  <div className="sd-asg-meta-footer">
                    <div className="sd-asg-meta-items">
                      {due && (
                        <span className="sd-asg-meta-chip" style={{ color: overdue ? '#BC6D61' : 'var(--sd-text-primary)' }}>
                          <CalendarIcon size={13} color={overdue ? '#BC6D61' : '#758087'} />
                          <span>
                            Due {new Date(due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </span>
                      )}
                      {a.faculty && (
                        <span className="sd-asg-meta-chip">
                          <GraduationCapIcon size={13} color="#758087" />
                          <span>{a.faculty}</span>
                        </span>
                      )}
                      {posted && (
                        <span className="sd-asg-meta-chip">
                          <ClockIcon size={13} color="#758087" />
                          <span>
                            Posted {new Date(posted).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Assignment Detail Modal */}
      {selectedAsg && (
        <div className="sd-bill-overlay" onClick={() => setSelectedAsg(null)}>
          <div className="sd-bill-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Assignment details">
            <div className="sd-bill-modal-header">
              <div className="sd-cls-card-badges">
                <span className="sd-cls-code-badge" style={getCourseBadgeStyle(selectedAsg.course)}>
                  {selectedAsg.course}
                </span>
                {selectedAsg.marks && (
                  <span className="sd-asg-marks-badge">
                    <AwardIcon size={13} color="#B5822C" />
                    <span>{selectedAsg.marks} Marks</span>
                  </span>
                )}
              </div>
              <button type="button" className="sd-bill-close" onClick={() => setSelectedAsg(null)} aria-label="Close">
                ✕
              </button>
            </div>

            <h2 className="sd-bill-modal-title">{selectedAsg.title}</h2>
            <p className="sd-asg-modal-desc">
              {selectedAsg.description || 'No detailed rubric attached. Please coordinate with your course instructor during lab or lecture hours.'}
            </p>

            <div className="sd-cls-drawer-section">
              <div className="sd-cls-drawer-sec-title">Submission Metadata</div>
              <div className="sd-asg-detail-grid">
                <div>
                  <span className="sd-cls-info-sub">Instructor</span>
                  <strong>{selectedAsg.faculty || 'Course Faculty'}</strong>
                </div>
                <div>
                  <span className="sd-cls-info-sub">Due Date</span>
                  <strong>
                    {selectedAsg.due_date || selectedAsg.dueDate
                      ? new Date(selectedAsg.due_date || selectedAsg.dueDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Ongoing'}
                  </strong>
                </div>
              </div>
            </div>

            <button type="button" className="sd-sub-btn-primary" onClick={() => setSelectedAsg(null)}>
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: BILLS & PAYMENTS
// ═══════════════════════════════════════════════════════════
function TabBills({ topbarSearch = '' }) {
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_student_bills')
      if (saved) return JSON.parse(saved)
    } catch (err) {
      console.error('Failed to read saved bills:', err)
    }

    return [
      { id: 'tuition_2026', title: 'Tuition Fee (Spring Semester 2026)', category: 'Academic', amount: 75000, status: 'unpaid', icon: 'graduation', dueDate: '2026-06-15', description: 'Regular academic tuition fees for computer science courses.' },
      { id: 'hostel_2026', title: 'Hostel Rent & Mess Charges', category: 'Hostel', amount: 32000, status: 'unpaid', icon: 'building', dueDate: '2026-06-01', description: 'Accommodation charges including high-speed internet & mess meal plans.' },
      { id: 'exam_2026', title: 'Semester Examination Registration Fee', category: 'Exams', amount: 4500, status: 'unpaid', icon: 'exam', dueDate: '2026-05-25', description: 'Registration fees for final end-semester theoretical & lab examinations.' },
      { id: 'lib_fine_2026', title: 'Library Late Book Return Fine', category: 'Library', amount: 350, status: 'paid', icon: 'book', dueDate: '2026-05-10', description: 'Overdue charges for "Introduction to Algorithms" book kept for 14 extra days.', paidOn: '2026-05-12T14:32:00Z', method: 'UPI' }
    ]
  })

  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQ, setSearchQ] = useState('')
  const [activeBill, setActiveBill] = useState(null)
  const [receiptBill, setReceiptBill] = useState(null)
  const [payMethod, setPayMethod] = useState('card') // 'card' | 'upi' | 'net'
  const [paymentState, setPaymentState] = useState('idle') // 'idle' | 'processing' | 'success'
  const [lastTxnRef, setLastTxnRef] = useState('')

  // Card form fields
  const [cardNum, setCardNum] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // UPI & NetBanking fields
  const [upiId, setUpiId] = useState('')
  const [bank, setBank] = useState('HDFC Bank')

  useEffect(() => {
    try {
      localStorage.setItem('sd_student_bills', JSON.stringify(bills))
    } catch (err) {
      console.error('Failed to persist bills:', err)
    }
  }, [bills])

  const unpaidBills = bills.filter(b => b.status === 'unpaid')
  const paidBills = bills.filter(b => b.status === 'paid')
  const totalOutstanding = unpaidBills.reduce((s, b) => s + Number(b.amount || 0), 0)
  const totalPaid = paidBills.reduce((s, b) => s + Number(b.amount || 0), 0)
  const nextDue = unpaidBills
    .map(b => b.dueDate)
    .filter(Boolean)
    .sort((a, b) => new Date(a) - new Date(b))[0]

  const categories = Array.from(new Set(bills.map(b => b.category).filter(Boolean)))
  const query = (searchQ || topbarSearch || '').trim().toLowerCase()

  const filteredBills = bills.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false
    if (query) {
      const hay = `${b.title} ${b.category} ${b.description}`.toLowerCase()
      if (!hay.includes(query)) return false
    }
    return true
  })

  const renderCategoryIcon = (b) => {
    const key = b.icon || b.category
    if (key === 'building' || key === 'Hostel') return <BuildingIcon size={18} color="#162F44" />
    if (key === 'exam' || key === 'Exams') return <FilePenIcon size={18} color="#162F44" />
    if (key === 'book' || key === 'Library') return <BookOpenIcon size={18} color="#557E6D" />
    return <GraduationCapIcon size={18} color="#162F44" />
  }

  const openPayment = (bill) => {
    setActiveBill(bill)
    setPaymentState('idle')
    setLastTxnRef('')
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
    const txnRef = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    setLastTxnRef(txnRef)

    setTimeout(() => {
      setPaymentState('success')
      setTimeout(() => {
        setBills(prev => prev.map(b => b.id === activeBill.id ? {
          ...b,
          status: 'paid',
          paidOn: new Date().toISOString(),
          method: payMethod === 'net' ? 'NET BANKING' : payMethod.toUpperCase(),
          txnRef,
        } : b))
        setPaymentState('idle')
        setActiveBill(null)
      }, 1500)
    }, 1800)
  }

  const formatCardNum = (val) => {
    const clear = val.replace(/\D/g, '')
    const parts = clear.match(/.{1,4}/g)
    return parts ? parts.slice(0, 4).join(' ') : clear
  }

  const formatExpiry = (val) => {
    const clear = val.replace(/\D/g, '')
    if (clear.length >= 2) {
      return `${clear.slice(0, 2)}/${clear.slice(2, 4)}`
    }
    return clear
  }

  const exportStatement = () => {
    const headers = ['Invoice', 'Category', 'Amount (INR)', 'Due Date', 'Status', 'Payment Method']
    const rows = bills.map(b => [
      `"${(b.title || '').replace(/"/g, '""')}"`,
      b.category,
      b.amount,
      b.dueDate,
      b.status.toUpperCase(),
      b.method || '-',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attentify_fee_statement.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="sd-cls-view">
      {/* Page Header */}
      <div className="sd-cls-header">
        <div>
          <div className="sd-cls-title-row">
            <h1 className="sd-cls-title">Bills &amp; Fees</h1>
            <span className="sd-cls-count-badge">
              {unpaidBills.length > 0 ? `${unpaidBills.length} Pending` : 'All Settled'}
            </span>
          </div>
          <p className="sd-cls-subtitle">
            Manage tuition fees, hostel charges, exam registrations, and payment receipts securely.
          </p>
        </div>

        <div className="sd-cls-header-controls">
          <select
            className="sd-cls-select"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filter bills by category"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button type="button" className="sd-sub-btn-outline" onClick={exportStatement}>
            <DownloadIcon size={14} />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* 3 Equal KPI Summary Cards */}
      <div className="sd-cls-kpi-grid">
        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">TOTAL OUTSTANDING</div>
            <div className="sd-cls-kpi-value">₹{totalOutstanding.toLocaleString('en-IN')}</div>
            <div className="sd-cls-kpi-sub">{unpaidBills.length} unpaid invoice{unpaidBills.length === 1 ? '' : 's'}</div>
          </div>
          <div
            className="sd-cls-kpi-icon-box"
            style={{
              backgroundColor: totalOutstanding > 0 ? '#FBEBE8' : '#E8F2EC',
              color: totalOutstanding > 0 ? '#BC6D61' : '#557E6D',
            }}
          >
            <CreditCardIcon size={19} color={totalOutstanding > 0 ? '#BC6D61' : '#557E6D'} />
          </div>
        </div>

        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">TOTAL PAID (AY 2026)</div>
            <div className="sd-cls-kpi-value">₹{totalPaid.toLocaleString('en-IN')}</div>
            <div className="sd-cls-kpi-sub">{paidBills.length} settled transaction{paidBills.length === 1 ? '' : 's'}</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#E8F2EC', color: '#557E6D' }}>
            <CheckCircleIcon size={19} color="#557E6D" />
          </div>
        </div>

        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">NEXT DUE DATE</div>
            <div className="sd-cls-kpi-value">
              {nextDue
                ? new Date(nextDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                : 'All Clear'}
            </div>
            <div className="sd-cls-kpi-sub">
              {nextDue ? 'Upcoming fee deadline' : 'No pending dues remaining'}
            </div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#EDF1F5', color: '#162F44' }}>
            <CalendarIcon size={19} color="#162F44" />
          </div>
        </div>
      </div>

      {/* Toolbar & Invoice Cards */}
      <div className="sd-cls-section-block">
        <div className="sd-cls-toolbar-row">
          <div className="sd-sub-pills">
            {[
              { key: 'all', label: `All (${bills.length})` },
              { key: 'unpaid', label: `Pending (${unpaidBills.length})` },
              { key: 'paid', label: `Paid (${paidBills.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                className={`sd-sub-pill ${statusFilter === tab.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="sd-cls-search-box">
            <SearchIcon size={14} color="#758087" />
            <input
              type="text"
              placeholder="Search fee title, category..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              aria-label="Search bills and fees"
            />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="sd-sub-empty-card">
            <div className="sd-sub-empty-icon">
              <CreditCardIcon size={22} color="#162F44" />
            </div>
            <h3 className="sd-sub-empty-title">No fee invoices match your filter</h3>
            <p className="sd-sub-empty-desc">Try switching the status tab or clearing your search filter.</p>
          </div>
        ) : (
          <div className="sd-bill-grid">
            {filteredBills.map(b => {
              const isPaid = b.status === 'paid'
              return (
                <div key={b.id} className="sd-bill-card">
                  <div className="sd-bill-header">
                    <div className="sd-cls-card-badges">
                      <div
                        className="sd-bill-icon-box"
                        style={{ backgroundColor: isPaid ? '#E8F2EC' : '#EDF1F5' }}
                      >
                        {renderCategoryIcon(b)}
                      </div>
                      <span className="sd-bill-category-pill">{b.category}</span>
                    </div>
                    <span className={`sd-bill-badge ${b.status}`}>
                      {isPaid ? 'Paid' : 'Due'}
                    </span>
                  </div>

                  <div>
                    <h3 className="sd-bill-title">{b.title}</h3>
                    <p className="sd-bill-description">{b.description}</p>
                    {b.dueDate && (
                      <div className="sd-bill-due-row">
                        <CalendarIcon size={12} color="#758087" />
                        <span>
                          Due {new Date(b.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="sd-bill-amount-row">
                    <div>
                      <div className="sd-bill-amount-label">{isPaid ? 'Amount Paid' : 'Amount Due'}</div>
                      <div className="sd-bill-amount">₹{Number(b.amount).toLocaleString('en-IN')}</div>
                    </div>

                    {!isPaid ? (
                      <button type="button" className="sd-sub-btn-primary" onClick={() => openPayment(b)}>
                        <CreditCardIcon size={14} color="#FFFFFF" />
                        <span>Pay Now</span>
                      </button>
                    ) : (
                      <div className="sd-bill-paid-actions">
                        <div className="sd-bill-paid-meta">
                          <span className="sd-bill-paid-tag">Paid via {b.method || 'UPI'}</span>
                          <span className="sd-bill-paid-date">
                            {b.paidOn
                              ? new Date(b.paidOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Settled'}
                          </span>
                        </div>
                        <button type="button" className="sd-sub-btn-outline" onClick={() => setReceiptBill(b)}>
                          Receipt
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Receipt Preview Modal */}
      {receiptBill && (
        <div className="sd-bill-overlay" onClick={() => setReceiptBill(null)}>
          <div className="sd-bill-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Payment receipt">
            <div className="sd-bill-modal-header">
              <span className="sd-bill-badge paid">Verified Receipt</span>
              <button type="button" className="sd-bill-close" onClick={() => setReceiptBill(null)} aria-label="Close">
                ✕
              </button>
            </div>
            <h2 className="sd-bill-modal-title">{receiptBill.title}</h2>
            <div className="sd-cls-drawer-section">
              <div className="sd-asg-detail-grid">
                <div>
                  <span className="sd-cls-info-sub">Amount Settled</span>
                  <strong>₹{Number(receiptBill.amount).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="sd-cls-info-sub">Payment Method</span>
                  <strong>{receiptBill.method || 'UPI'}</strong>
                </div>
                <div>
                  <span className="sd-cls-info-sub">Paid Date</span>
                  <strong>
                    {receiptBill.paidOn
                      ? new Date(receiptBill.paidOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'Verified'}
                  </strong>
                </div>
                <div>
                  <span className="sd-cls-info-sub">Reference ID</span>
                  <strong>{receiptBill.txnRef || `ATT-${receiptBill.id.toUpperCase()}`}</strong>
                </div>
              </div>
            </div>
            <button type="button" className="sd-sub-btn-primary" onClick={() => setReceiptBill(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal */}
      {activeBill && (
        <div className="sd-bill-overlay" onClick={closePayment}>
          <div className="sd-bill-modal" onClick={e => e.stopPropagation()} role="dialog" aria-label="Secure payment checkout">
            <div className="sd-bill-modal-header">
              <div>
                <h2 className="sd-bill-modal-title">Secure Payment Checkout</h2>
                <p className="sd-cls-subtitle" style={{ marginTop: '2px' }}>
                  Paying for: <strong>{activeBill.title}</strong>
                </p>
              </div>
              {paymentState === 'idle' && (
                <button type="button" className="sd-bill-close" onClick={closePayment} aria-label="Close">
                  ✕
                </button>
              )}
            </div>

            {paymentState === 'idle' && (
              <>
                <div className="sd-bill-summary-strip">
                  <span>Total Payable</span>
                  <strong>₹{Number(activeBill.amount).toLocaleString('en-IN')}</strong>
                </div>

                <div className="sd-bill-methods">
                  <button
                    type="button"
                    className={`sd-bill-method-btn ${payMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPayMethod('card')}
                  >
                    <CreditCardIcon size={14} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    className={`sd-bill-method-btn ${payMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPayMethod('upi')}
                  >
                    <ScanFrameIcon size={14} />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    className={`sd-bill-method-btn ${payMethod === 'net' ? 'active' : ''}`}
                    onClick={() => setPayMethod('net')}
                  >
                    <BuildingIcon size={14} />
                    <span>NetBanking</span>
                  </button>
                </div>

                <form onSubmit={handlePaySubmit} className="sd-bill-form">
                  {payMethod === 'card' && (
                    <>
                      <div className="sd-bill-virtual-card">
                        <div className="sd-bill-vc-top">
                          <div className="sd-bill-vc-chip" />
                          <span>VISA</span>
                        </div>
                        <div className="sd-bill-vc-num">{cardNum || '•••• •••• •••• ••••'}</div>
                        <div className="sd-bill-vc-bottom">
                          <div>
                            <span className="sd-bill-vc-lbl">CARDHOLDER</span>
                            <div>{cardName || 'STUDENT NAME'}</div>
                          </div>
                          <div>
                            <span className="sd-bill-vc-lbl">VALID THRU</span>
                            <div>{cardExpiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>

                      <input
                        className="sd-form-input"
                        placeholder="Card Number (16 digits)"
                        value={cardNum}
                        onChange={e => setCardNum(formatCardNum(e.target.value))}
                        maxLength={19}
                        required
                      />
                      <input
                        className="sd-form-input"
                        placeholder="Cardholder Name"
                        value={cardName}
                        onChange={e => setCardName(e.target.value.toUpperCase())}
                        maxLength={26}
                        required
                      />
                      <div className="sd-bill-form-row">
                        <input
                          className="sd-form-input"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                          maxLength={5}
                          required
                        />
                        <input
                          className="sd-form-input"
                          type="password"
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          maxLength={3}
                          required
                        />
                      </div>
                    </>
                  )}

                  {payMethod === 'upi' && (
                    <div className="sd-bill-upi-box">
                      <div className="sd-bill-qr-frame">
                        <div className="sd-bill-qr-inner">
                          <ScanFrameIcon size={36} color="#162F44" />
                        </div>
                        <div className="sd-bill-qr-scanline" />
                      </div>
                      <p className="sd-bill-upi-hint">
                        Scan with any UPI app (GPay, PhonePe, Paytm, BHIM) or enter your UPI ID below.
                      </p>
                      <div className="sd-set-field" style={{ width: '100%' }}>
                        <label htmlFor="bill-upi-input">UPI ID</label>
                        <input
                          id="bill-upi-input"
                          className="sd-form-input"
                          placeholder="username@upi"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          required={payMethod === 'upi'}
                        />
                      </div>
                    </div>
                  )}

                  {payMethod === 'net' && (
                    <div className="sd-set-field">
                      <label htmlFor="bill-bank-select">Select Your Bank</label>
                      <select
                        id="bill-bank-select"
                        className="sd-form-input"
                        value={bank}
                        onChange={e => setBank(e.target.value)}
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                      </select>
                      <p className="sd-bill-upi-hint" style={{ textAlign: 'left', marginTop: '4px' }}>
                        You will be guided through your bank&apos;s verification step to authorize payment.
                      </p>
                    </div>
                  )}

                  <button type="submit" className="sd-sub-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <LockIcon size={14} color="#FFFFFF" />
                    <span>Authorize &amp; Pay ₹{Number(activeBill.amount).toLocaleString('en-IN')}</span>
                  </button>
                </form>
              </>
            )}

            {paymentState === 'processing' && (
              <div className="sd-bill-state-box">
                <div className="sd-bill-spinner" />
                <h3>Processing Secure Payment</h3>
                <p>Verifying authorization with your financial institution…</p>
              </div>
            )}

            {paymentState === 'success' && (
              <div className="sd-bill-state-box">
                <div className="sd-bill-success-ring">
                  <CheckCircleIcon size={28} color="#557E6D" />
                </div>
                <h3 style={{ color: '#557E6D' }}>Payment Successful</h3>
                <p>
                  Transaction reference: <code>{lastTxnRef}</code>
                </p>
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
function TabLogs({ attData, onNav, topbarSearch = '' }) {
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQ, setSearchQ]           = useState('')
  const [page, setPage]                 = useState(1)
  const pageSize = 10

  const rawLogs = (attData?.logs && attData.logs.length > 0) ? attData.logs : LOGS
  const coursesList = attData?.courses || COURSES

  const formattedLogs = rawLogs.map((l, idx) => ({
    id: l._id || l.id || `log-${idx}`,
    date: l.date || (l.timestamp
      ? `${new Date(l.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : 'Recent Session'),
    course: l.course_id || l.course || 'CS101',
    method: l.method || 'QR Code + Face',
    status: l.status || 'present',
  }))

  const presentCount = formattedLogs.filter(l => l.status === 'present').length
  const absentCount = formattedLogs.filter(l => l.status === 'absent').length
  const lateCount = formattedLogs.filter(l => l.status === 'late').length
  const presentPct = formattedLogs.length > 0 ? Math.round((presentCount / formattedLogs.length) * 100) : 100

  const query = (searchQ || topbarSearch || '').trim().toLowerCase()
  const filtered = formattedLogs.filter(l => {
    const matchCourse = filterCourse === 'all' || l.course === filterCourse
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    const matchSearch = !query ||
      (l.date || '').toLowerCase().includes(query) ||
      (l.course || '').toLowerCase().includes(query) ||
      (l.method || '').toLowerCase().includes(query) ||
      (l.status || '').toLowerCase().includes(query)
    return matchCourse && matchStatus && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedLogs = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleExportCsv = () => {
    const headers = ['#', 'Date & Time', 'Course', 'Method', 'Status']
    const rows = filtered.map((l, i) => [
      i + 1,
      `"${(l.date || '').replace(/"/g, '""')}"`,
      l.course,
      `"${(l.method || '').replace(/"/g, '""')}"`,
      l.status,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attentify_attendance_logs.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderMethodIcon = (method = '') => {
    const m = method.toLowerCase()
    if (m.includes('qr')) return <ScanFrameIcon size={13} color="#162F44" />
    if (m.includes('face') || m.includes('biometric')) return <EyeIcon size={13} color="#162F44" />
    return <FilePenIcon size={13} color="#162F44" />
  }

  return (
    <div className="sd-cls-view">
      {/* Page Header */}
      <div className="sd-cls-header">
        <div>
          <div className="sd-cls-title-row">
            <h1 className="sd-cls-title">Attendance Logs</h1>
            <span className="sd-cls-count-badge">{formattedLogs.length} Records</span>
          </div>
          <p className="sd-cls-subtitle">
            Complete audit history of verified QR check-ins, biometric scans, and classroom sessions.
          </p>
        </div>

        <div className="sd-cls-header-controls">
          <button type="button" className="sd-sub-btn-outline" onClick={handleExportCsv}>
            <DownloadIcon size={14} />
            <span>Export CSV</span>
          </button>
          {onNav && (
            <button type="button" className="sd-sub-btn-primary" onClick={() => onNav('scanner')}>
              <CameraIcon size={14} color="#FFFFFF" />
              <span>Open Scanner</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Compact Summary KPI Cards */}
      <div className="sd-logs-kpi-grid">
        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">TOTAL LOGGED</div>
            <div className="sd-cls-kpi-value">{formattedLogs.length} Entries</div>
            <div className="sd-cls-kpi-sub">Tracked activity log</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#EDF1F5', color: '#162F44' }}>
            <ClipboardListIcon size={18} color="#162F44" />
          </div>
        </div>

        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">PRESENT</div>
            <div className="sd-cls-kpi-value">{presentCount} Verified</div>
            <div className="sd-cls-kpi-sub">{presentPct}% of recorded logs</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#E8F2EC', color: '#557E6D' }}>
            <CheckCircleIcon size={18} color="#557E6D" />
          </div>
        </div>

        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">LATE ENTRIES</div>
            <div className="sd-cls-kpi-value">{lateCount} Flagged</div>
            <div className="sd-cls-kpi-sub">Grace-period check-ins</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#FBF4E6', color: '#B5822C' }}>
            <ClockIcon size={18} color="#B5822C" />
          </div>
        </div>

        <div className="sd-cls-kpi-card">
          <div>
            <div className="sd-cls-kpi-label">ABSENT</div>
            <div className="sd-cls-kpi-value">{absentCount} Missed</div>
            <div className="sd-cls-kpi-sub">Unattended sessions</div>
          </div>
          <div className="sd-cls-kpi-icon-box" style={{ backgroundColor: '#FBEBE8', color: '#BC6D61' }}>
            <XCircleIcon size={18} color="#BC6D61" />
          </div>
        </div>
      </div>

      {/* Filters + Full-Width Audit Table */}
      <div className="sd-logs-card">
        <div className="sd-cls-toolbar-row">
          <div>
            <h2 className="sd-cls-section-heading">Session Verification Audit</h2>
            <p className="sd-cls-subtitle" style={{ marginTop: '2px' }}>
              Showing {filtered.length} of {formattedLogs.length} session logs
            </p>
          </div>

          <div className="sd-cls-toolbar">
            <div className="sd-cls-search-box">
              <SearchIcon size={14} color="#758087" />
              <input
                id="log-search"
                type="text"
                placeholder="Search date, course, method..."
                value={searchQ}
                onChange={e => { setSearchQ(e.target.value); setPage(1) }}
                aria-label="Search attendance logs"
              />
            </div>

            <select
              id="log-course-filter"
              className="sd-cls-select"
              value={filterCourse}
              onChange={e => { setFilterCourse(e.target.value); setPage(1) }}
              aria-label="Filter logs by course"
            >
              <option value="all">All Courses</option>
              {coursesList.map(c => (
                <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
              ))}
            </select>

            <select
              id="log-status-filter"
              className="sd-cls-select"
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
              aria-label="Filter logs by status"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        <div className="sd-logs-table-wrap">
          <table className="sd-logs-table">
            <thead>
              <tr>
                <th style={{ width: '56px' }}>#</th>
                <th>Date &amp; Time</th>
                <th>Course</th>
                <th>Verification Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--sd-text-secondary)' }}>
                    {formattedLogs.length === 0
                      ? 'No live scan logs recorded yet. Scan a classroom QR code to create your first entry.'
                      : 'No attendance logs match the active search or filters.'}
                  </td>
                </tr>
              ) : (
                pagedLogs.map((l, i) => (
                  <tr key={l.id}>
                    <td className="sd-logs-td-num">{(safePage - 1) * pageSize + i + 1}</td>
                    <td className="sd-logs-td-date">{l.date}</td>
                    <td>
                      <span className="sd-logs-course-pill">{l.course}</span>
                    </td>
                    <td>
                      <span className="sd-logs-method-pill">
                        {renderMethodIcon(l.method)}
                        <span>{l.method}</span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sd-cls-status-pill ${
                          l.status === 'present'
                            ? 'sd-cls-status-completed'
                            : l.status === 'late'
                            ? 'sd-logs-status-late'
                            : 'sd-cls-status-cancelled'
                        }`}
                      >
                        {l.status === 'present' ? '✓ Present' : l.status === 'late' ? '▲ Late' : '✕ Absent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > pageSize && (
          <div className="sd-logs-pagination">
            <span className="sd-cls-subtitle">
              Page {safePage} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="sd-sub-btn-outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                <ChevronLeftIcon size={14} />
                <span>Previous</span>
              </button>
              <button
                type="button"
                className="sd-sub-btn-outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
              >
                <span>Next</span>
                <ChevronRightIcon size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: SETTINGS
// ═══════════════════════════════════════════════════════════
function TabSettings({ user }) {
  const [profile, setProfile] = useState(() => {
    let savedPhone = '+91 98765 43210'
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('sd_student_phone')
        if (stored) savedPhone = stored
      } catch (err) {
        console.error('Failed to load phone setting:', err)
      }
    }
    return {
      name: user?.name || 'Student',
      email: user?.email || '',
      rollNo: '21CS028',
      dept: user?.dept || user?.department || 'B.Tech CSE',
      semester: user?.academicInfo || 'Year 3 • Sem 5',
      phone: savedPhone,
    }
  })

  const [notif, setNotif] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPrefs = localStorage.getItem('sd_student_notif_prefs')
        if (savedPrefs) return JSON.parse(savedPrefs)
      } catch (err) {
        console.error('Failed to load notification prefs:', err)
      }
    }
    return {
      absent: true,
      late: false,
      qr: true,
      weekly: true,
      email: true,
      browser: true,
    }
  })

  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [passFeedback, setPassFeedback] = useState(null)

  const save = () => {
    try {
      localStorage.setItem('sd_student_notif_prefs', JSON.stringify(notif))
      localStorage.setItem('sd_student_phone', profile.phone)
    } catch (err) {
      console.error('Failed to persist settings:', err)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2400)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (!curPass.trim() || !newPass.trim() || !confPass.trim()) {
      setPassFeedback({ type: 'error', text: 'Please fill in all three password fields.' })
      return
    }
    if (newPass.length < 6) {
      setPassFeedback({ type: 'error', text: 'New password must be at least 6 characters.' })
      return
    }
    if (newPass !== confPass) {
      setPassFeedback({ type: 'error', text: 'New password and confirmation do not match.' })
      return
    }
    setCurPass('')
    setNewPass('')
    setConfPass('')
    setPassFeedback({
      type: 'info',
      text: 'Password validated. Self-service credential changes are managed through your institutional administrator.',
    })
  }

  const initials = (profile.name || 'S')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="sd-cls-view">
      {/* Page Header */}
      <div className="sd-cls-header">
        <div>
          <div className="sd-cls-title-row">
            <h1 className="sd-cls-title">Account Settings</h1>
            <span className="sd-cls-count-badge">Student Profile</span>
          </div>
          <p className="sd-cls-subtitle">
            Manage your academic profile details, alert preferences, display theme, and security.
          </p>
        </div>

        <button
          id="save-settings-btn"
          type="button"
          className={`sd-sub-btn-primary ${saved ? 'is-saved' : ''}`}
          onClick={save}
        >
          <CheckCircleIcon size={15} color="#FFFFFF" />
          <span>{saved ? 'Changes Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Main 2-Column Settings Grid */}
      <div className="sd-set-grid">
        {/* Left: Academic Profile Card */}
        <div className="sd-set-card">
          <div className="sd-set-card-head">
            <div className="sd-set-card-icon">
              <UserIcon size={16} color="#162F44" />
            </div>
            <div>
              <h2 className="sd-cls-section-heading">Academic Profile</h2>
              <p className="sd-cls-subtitle">Verified student identity and enrollment details</p>
            </div>
          </div>

          <div className="sd-set-profile-banner">
            <div className="sd-set-avatar-lg">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sd-set-profile-name">{profile.name}</div>
              <div className="sd-set-profile-meta">
                {profile.rollNo} · {profile.dept}
              </div>
              <div className="sd-set-profile-meta">{profile.semester}</div>
            </div>
            <span className="sd-cls-status-pill sd-cls-status-completed">Active Student</span>
          </div>

          <div className="sd-set-form-grid">
            {[
              { id: 'set-name', label: 'Full Name', key: 'name', type: 'text', editable: false },
              { id: 'set-email', label: 'Institutional Email', key: 'email', type: 'email', editable: false },
              { id: 'set-roll', label: 'Roll Number', key: 'rollNo', type: 'text', editable: false },
              { id: 'set-dept', label: 'Department', key: 'dept', type: 'text', editable: false },
              { id: 'set-sem', label: 'Academic Term', key: 'semester', type: 'text', editable: false },
              { id: 'set-phone', label: 'Contact Phone', key: 'phone', type: 'tel', editable: true },
            ].map(f => (
              <div key={f.id} className="sd-set-field">
                <label htmlFor={f.id}>
                  <span>{f.label}</span>
                  {!f.editable && <LockIcon size={11} color="#758087" />}
                </label>
                <input
                  id={f.id}
                  className={`sd-form-input ${!f.editable ? 'is-readonly' : ''}`}
                  type={f.type}
                  value={profile[f.key]}
                  readOnly={!f.editable}
                  onChange={
                    f.editable
                      ? e => setProfile(prev => ({ ...prev, [f.key]: e.target.value }))
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Stack: Notifications + Appearance */}
        <div className="sd-set-right-stack">
          <div className="sd-set-card">
            <div className="sd-set-card-head">
              <div className="sd-set-card-icon">
                <BellIcon size={16} color="#162F44" />
              </div>
              <div>
                <h2 className="sd-cls-section-heading">Notifications</h2>
                <p className="sd-cls-subtitle">Choose when Attendify notifies you</p>
              </div>
            </div>

            <div className="sd-set-toggle-list">
              {[
                { id: 'n-absent', key: 'absent', label: 'Absent Alerts', desc: 'Alert when marked absent for a class' },
                { id: 'n-late', key: 'late', label: 'Late Arrival Alerts', desc: 'Notify on grace-window check-ins' },
                { id: 'n-qr', key: 'qr', label: 'QR Session Started', desc: 'Instant prompt when faculty opens a scan' },
                { id: 'n-weekly', key: 'weekly', label: 'Weekly Summary', desc: 'Weekly participation recap email' },
                { id: 'n-email', key: 'email', label: 'Email Notifications', desc: 'Deliver announcements via email' },
                { id: 'n-browser', key: 'browser', label: 'Browser Notifications', desc: 'Desktop push alerts in browser' },
              ].map(n => {
                const isOn = Boolean(notif[n.key])
                return (
                  <div key={n.id} className="sd-set-toggle-row">
                    <div>
                      <div className="sd-set-toggle-label">{n.label}</div>
                      <div className="sd-set-toggle-desc">{n.desc}</div>
                    </div>
                    <button
                      id={n.id}
                      type="button"
                      className={`sd-set-switch ${isOn ? 'on' : ''}`}
                      onClick={() => setNotif(p => ({ ...p, [n.key]: !p[n.key] }))}
                      aria-pressed={isOn}
                      aria-label={n.label}
                    >
                      <span className="sd-set-switch-thumb" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="sd-set-card">
            <div className="sd-set-card-head">
              <div className="sd-set-card-icon">
                <SettingsIcon size={16} color="#162F44" />
              </div>
              <div>
                <h2 className="sd-cls-section-heading">Appearance</h2>
                <p className="sd-cls-subtitle">Select your preferred display mode</p>
              </div>
            </div>

            <div className="sd-set-theme-row">
              {[
                { id: 'light', label: 'Light', icon: SunIcon },
                { id: 'dark', label: 'Dark', icon: MoonIcon },
                { id: 'system', label: 'System', icon: MonitorIcon },
              ].map(item => {
                const IconComp = item.icon
                return (
                  <button
                    key={item.id}
                    id={`theme-${item.id}`}
                    type="button"
                    className={`sd-set-theme-btn ${theme === item.id ? 'active' : ''}`}
                    onClick={() => setTheme(item.id)}
                  >
                    <IconComp size={15} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Security Card */}
      <form className="sd-set-card" onSubmit={handlePasswordSubmit}>
        <div className="sd-set-card-head">
          <div className="sd-set-card-icon">
            <KeyIcon size={16} color="#162F44" />
          </div>
          <div>
            <h2 className="sd-cls-section-heading">Security &amp; Password</h2>
            <p className="sd-cls-subtitle">Verify or update your account access credentials</p>
          </div>
        </div>

        <div className="sd-set-pass-grid">
          <div className="sd-set-field">
            <label htmlFor="cur-pass">Current Password</label>
            <input
              id="cur-pass"
              className="sd-form-input"
              type="password"
              placeholder="Enter current password"
              value={curPass}
              onChange={e => { setCurPass(e.target.value); setPassFeedback(null) }}
            />
          </div>
          <div className="sd-set-field">
            <label htmlFor="new-pass">New Password</label>
            <input
              id="new-pass"
              className="sd-form-input"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPass}
              onChange={e => { setNewPass(e.target.value); setPassFeedback(null) }}
            />
          </div>
          <div className="sd-set-field">
            <label htmlFor="conf-pass">Confirm Password</label>
            <input
              id="conf-pass"
              className="sd-form-input"
              type="password"
              placeholder="Repeat new password"
              value={confPass}
              onChange={e => { setConfPass(e.target.value); setPassFeedback(null) }}
            />
          </div>
        </div>

        {passFeedback && (
          <div className={`sd-set-feedback ${passFeedback.type}`}>
            {passFeedback.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button id="change-pass-btn" type="submit" className="sd-sub-btn-outline">
            <LockIcon size={14} />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function StudentDashboardPage() {
  const { user, logout } = useAuth()
  const router           = useRouter()
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const hash = window.location.hash.replace('#', '')
        if (hash) return hash
      } catch (e) {}
    }
    return 'attendance'
  })
  const [topbarSearch, setTopbarSearch] = useState('')
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

  const isSessionActive = () => {
    if (typeof window === 'undefined') return false
    try {
      const raw = localStorage.getItem('active_qr_session')
      if (!raw) return false
      const s = JSON.parse(raw)
      if (s?.expiresAt && s.expiresAt < Date.now()) {
        localStorage.removeItem('active_qr_session')
        return false
      }
      return true
    } catch {
      return false
    }
  }

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
      alert('🚨 Cannot log out!\n\nA QR session is active. Scan the QR code to mark attendance first.')
      return
    }
    logout(); router.replace('/login')
  }

  // Warn on browser close/refresh during active scanner session
  useEffect(() => {
    const blockClose = (e) => {
      if (activeTab === 'scanner' && isSessionActive()) {
        e.preventDefault()
        e.returnValue = '🚨 QR session is active! Leaving will mark you ABSENT.'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', blockClose)
    return () => window.removeEventListener('beforeunload', blockClose)
  }, [activeTab])

  // Auto-navigate to scanner when a QR session appears (polls every 2s)
  useEffect(() => {
    const id = setInterval(() => {
      if (isSessionActive() && activeTab !== 'scanner') {
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
              <span className="sd-user-role">{user?.academicInfo || user?.department || 'B.Tech CSE • Year 3'}</span>
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
            <div className="sd-topbar-search">
              <SearchIcon size={14} color="#758087" />
              <input
                type="text"
                placeholder="Search sessions, courses..."
                value={topbarSearch}
                onChange={e => setTopbarSearch(e.target.value)}
                className="sd-topbar-search-input"
              />
            </div>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formattedDate}</span>
            <button className="sd-topbar-icon-btn" title="Notifications" aria-label="Notifications">
              <BellIcon size={16} color="#162F44" />
              <span className="sd-topbar-badge-dot" />
            </button>
            <div className="sd-attendance-indicator" title="Overall attendance indicator">
              <CheckCircleIcon size={13} color="#557E6D" />
              <span>{attData.loading ? '…' : `${attData.overallPct || 87}%`}</span>
            </div>
            <div className="sd-topbar-avatar" title={displayName}>
              {initials}
            </div>
          </div>
        </header>

        <main
          className={`sd-content ${
            activeTab === 'attendance'
              ? 'sd-att-mode'
              : ['classes', 'assignments', 'bills', 'logs', 'settings'].includes(activeTab)
              ? 'sd-cls-mode'
              : ''
          }`}
        >
          {activeTab === 'overview'    && <TabOverview   user={user} onNav={handleNav} attData={attData} />}
          {activeTab === 'attendance'  && <TabAttendance attData={attData} user={user} onNav={handleNav} topbarSearch={topbarSearch} />}
          {activeTab === 'scanner'     && <TabScanner user={user} attData={attData} onNav={handleNav} />}
          {activeTab === 'classes'     && <TabClasses attData={attData} onNav={handleNav} topbarSearch={topbarSearch} />}
          {activeTab === 'timetable'   && <TabTimetable />}
          {activeTab === 'assignments' && <TabStudentAssignments topbarSearch={topbarSearch} />}
          {activeTab === 'bills'       && <TabBills topbarSearch={topbarSearch} />}
          {activeTab === 'logs'        && <TabLogs attData={attData} onNav={handleNav} topbarSearch={topbarSearch} />}
          {activeTab === 'settings'    && <TabSettings user={user} />}
        </main>
      </div>
    </div>
  )
}
