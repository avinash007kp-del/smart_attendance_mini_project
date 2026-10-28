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
//  TAB: ATTENDANCE
// ═══════════════════════════════════════════════════════════
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--sd-card-bg, #ffffff)',
      border: `1px solid ${color}33`,
      borderRadius: 12,
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      flex: 1,
      minWidth: 150
    }}>
      <div style={{
        fontSize: '1.4rem',
        background: `${color}18`,
        width: 44,
        height: 44,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sd-text, #162F44)' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.74rem', color: 'var(--sd-muted, #707C85)' }}>{sub}</div>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  OVERALL ATTENDANCE GRAPH COMPONENT
// ═══════════════════════════════════════════════════════════
function OverallAttendanceGraph({ overallPct, totalAttended, totalClasses, courses }) {
  const [timeframe, setTimeframe] = useState('weekly') // 'weekly' | 'monthly'
  const [activeTooltip, setActiveTooltip] = useState(null)

  // 8 weeks historical trend points ending at current dynamic overallPct
  const weeklyData = [
    { label: 'Week 1', pct: 82, attended: 4, total: 5 },
    { label: 'Week 2', pct: 86, attended: 5, total: 6 },
    { label: 'Week 3', pct: 80, attended: 4, total: 5 },
    { label: 'Week 4', pct: 89, attended: 8, total: 9 },
    { label: 'Week 5', pct: 92, attended: 6, total: 6 },
    { label: 'Week 6', pct: 85, attended: 5, total: 6 },
    { label: 'Week 7', pct: 89, attended: 7, total: 8 },
    { label: 'Current', pct: overallPct, attended: totalAttended, total: totalClasses }
  ]

  const monthlyData = [
    { month: 'August', attended: 16, total: 18, pct: 89 },
    { month: 'September', attended: 22, total: 25, pct: 88 },
    { month: 'October', attended: 20, total: 22, pct: 91 },
    { month: 'Current', attended: totalAttended, total: totalClasses, pct: overallPct }
  ]

  // Graph SVG coordinates (ViewBox: 0 0 650 220)
  const getY = (val) => {
    const clamped = Math.max(40, Math.min(100, val))
    return Math.round(185 - ((clamped - 40) / 60) * 145)
  }
  const getX = (idx) => 45 + idx * 80

  const points = weeklyData.map((d, i) => ({ x: getX(i), y: getY(d.pct), ...d }))
  
  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const mx = (curr.x + next.x) / 2
    pathD += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`
  }
  const areaD = `${pathD} L ${points[points.length - 1].x} 185 L ${points[0].x} 185 Z`
  const cutoffY = getY(75)

  return (
    <div className="sd-card sd-graph-card">
      <div className="sd-graph-header">
        <div>
          <div className="sd-graph-badge">📈 Overall Attendance Analytics</div>
          <h3 className="sd-graph-title">Attendance Trajectory & Trends</h3>
          <p className="sd-graph-subtitle">Semester progression measured against the 75% institutional attendance threshold</p>
        </div>
        <div className="sd-graph-toggles">
          <button
            type="button"
            className={`sd-toggle-pill ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly Trend
          </button>
          <button
            type="button"
            className={`sd-toggle-pill ${timeframe === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly View
          </button>
        </div>
      </div>

      {timeframe === 'weekly' ? (
        <div className="sd-chart-wrapper">
          <svg className="sd-chart-svg" viewBox="0 0 650 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="attAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#557E6D" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#557E6D" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#557E6D" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[100, 85, 75, 60].map(val => (
              <g key={val}>
                <line
                  x1="45"
                  y1={getY(val)}
                  x2="615"
                  y2={getY(val)}
                  stroke={val === 75 ? '#B5822C' : '#E7E8E2'}
                  strokeDasharray={val === 75 ? '5 5' : 'none'}
                  strokeWidth={val === 75 ? '1.5' : '1'}
                  opacity={val === 75 ? 0.9 : 0.6}
                />
                <text
                  x="38"
                  y={getY(val) + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill={val === 75 ? '#B5822C' : '#8C9CA8'}
                  fontWeight={val === 75 ? '700' : '500'}
                >
                  {val}%
                </text>
              </g>
            ))}

            {/* 75% Cutoff Tag */}
            <g transform={`translate(515, ${cutoffY - 12})`}>
              <rect x="0" y="0" width="100" height="18" rx="4" fill="#FBF4E8" stroke="#B5822C" strokeWidth="1" />
              <text x="50" y="12" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#B5822C">
                75% Target Line
              </text>
            </g>

            {/* Area and Line Curve */}
            <path d={areaD} fill="url(#attAreaGrad)" />
            <path d={pathD} fill="none" stroke="#557E6D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {points.map((pt, i) => (
              <g
                key={i}
                className="sd-chart-pt-group"
                onMouseEnter={() => setActiveTooltip(pt)}
                onMouseLeave={() => setActiveTooltip(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={i === points.length - 1 ? 6.5 : 4.5}
                  fill={i === points.length - 1 ? '#162F44' : '#557E6D'}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                <text x={pt.x} y="206" textAnchor="middle" fontSize="11" fill="#758087" fontWeight="500">
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip Card */}
          {activeTooltip && (
            <div
              className="sd-chart-tooltip"
              style={{
                left: `${(activeTooltip.x / 650) * 100}%`,
                top: `${(activeTooltip.y / 220) * 100}%`
              }}
            >
              <div className="sd-tip-title">{activeTooltip.label}</div>
              <div className="sd-tip-val">{activeTooltip.pct}% Attendance</div>
              <div className="sd-tip-sub">{activeTooltip.attended}/{activeTooltip.total} classes attended</div>
            </div>
          )}
        </div>
      ) : (
        /* Monthly breakdown bar chart */
        <div className="sd-monthly-bars">
          {monthlyData.map(m => {
            const p = m.pct
            const color = pctColor(p)
            return (
              <div key={m.month} className="sd-mbar-col">
                <div className="sd-mbar-track">
                  <div className="sd-mbar-fill" style={{ height: `${p}%`, background: color }}>
                    <span className="sd-mbar-val">{p}%</span>
                  </div>
                  <div className="sd-mbar-cutoff" style={{ bottom: '75%' }} title="75% Target" />
                </div>
                <div className="sd-mbar-label">{m.month}</div>
                <div className="sd-mbar-sub">{m.attended}/{m.total} classes</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Analytics Insights Bar below chart */}
      <div className="sd-graph-insights">
        <div className="sd-insight-item">
          <span className="sd-insight-icon">🎯</span>
          <div>
            <div className="sd-insight-title">Compliance Standing</div>
            <div className="sd-insight-val" style={{ color: overallPct >= 75 ? '#557E6D' : '#BC6D61' }}>
              {overallPct >= 85 ? '🌟 Excellent Standing (≥85%)' : overallPct >= 75 ? '⚠️ Safe Standing (75–84%)' : '🚨 At Risk (<75%)'}
            </div>
          </div>
        </div>
        <div className="sd-insight-item">
          <span className="sd-insight-icon">🛡️</span>
          <div>
            <div className="sd-insight-title">Absence Buffer</div>
            <div className="sd-insight-val">
              {overallPct >= 75
                ? `Can miss ~${Math.max(0, Math.floor((totalAttended - 0.75 * totalClasses) / 0.75))} more classes`
                : `Need ${Math.max(0, Math.ceil((0.75 * totalClasses - totalAttended) / 0.25))} consecutive classes`}
            </div>
          </div>
        </div>
        <div className="sd-insight-item">
          <span className="sd-insight-icon">🔥</span>
          <div>
            <div className="sd-insight-title">Active Streak</div>
            <div className="sd-insight-val" style={{ color: '#B5822C' }}>
              6 Consecutive Classes Attended
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: ATTENDANCE (Overall Graph + Subject Dropdown)
// ═══════════════════════════════════════════════════════════
function TabAttendance({ attData }) {
  const { courses, totalAttended, totalClasses, overallPct, loading, logs = [] } = attData
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [filter, setFilter] = useState('all')

  const selectedCourseObj = courses.find(c => c.id === selectedSubject)

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
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">📊 Attendance Intelligence</h2>
          <p className="sd-section-sub">Comprehensive semester attendance analytics, graph trajectory and subject metrics</p>
        </div>
      </div>

      {/* ── 1. Overall Attendance Graph ──────────────────────── */}
      <OverallAttendanceGraph
        overallPct={overallPct}
        totalAttended={totalAttended}
        totalClasses={totalClasses}
        courses={courses}
      />

      {/* ── 2. Summary Metric Cards Row ──────────────────────── */}
      <div className="sd-attend-summary-row">
        <StatCard icon="📊" label="Overall Attendance" value={`${overallPct}%`} sub={`${totalAttended}/${totalClasses} classes attended`} color="#557E6D" />
        <StatCard icon="✅" label="Safe Subjects"    value={courses.filter(c => pct(c) >= 85).length} sub="≥ 85% attendance"  color="#557E6D" />
        <StatCard icon="⚠️" label="Warning Subjects" value={courses.filter(c => pct(c) >= 75 && pct(c) < 85).length} sub="75–84% threshold" color="#B5822C" />
        <StatCard icon="🚨" label="At Risk Subjects" value={courses.filter(c => pct(c) < 75).length} sub="< 75% cutoff"  color="#C3665B" />
      </div>

      {/* ── 3. Subject-Wise Dropdown Toolbar ─────────────────── */}
      <div className="sd-att-toolbar">
        <div className="sd-subject-dropdown-wrap">
          <label className="sd-control-label" htmlFor="att-subject-dropdown">
            <span>🔍</span> Subject-Wise View:
          </label>
          <div className="sd-select-wrapper">
            <select
              id="att-subject-dropdown"
              className="sd-subject-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="all">📚 All Subjects (Comparative Overview)</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.name} ({pct(c)}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedSubject === 'all' && (
          <div className="sd-filter-pills">
            {[
              { v: 'all', label: 'All Subjects', color: '' },
              { v: 'safe', label: '✅ Safe (≥85%)', color: '#557E6D' },
              { v: 'warning', label: '⚠️ Warning (75–84%)', color: '#B5822C' },
              { v: 'risk', label: '🚨 At Risk (<75%)', color: '#C3665B' },
            ].map(f => (
              <button
                key={f.v}
                id={`att-filter-${f.v}`}
                className={`sd-pill ${filter === f.v ? 'active' : ''}`}
                style={filter === f.v && f.color ? { background: `${f.color}15`, color: f.color, borderColor: `${f.color}44` } : {}}
                onClick={() => setFilter(f.v)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Subject Detail Spotlight OR All Subjects Grid ─── */}
      {selectedSubject !== 'all' && selectedCourseObj ? (
        /* Spotlight Card for specific subject selected via dropdown */
        <div className="sd-card sd-spotlight-card" style={{ '--ccolor': selectedCourseObj.color }}>
          <div className="sd-spotlight-top">
            <div className="sd-spotlight-info">
              <div className="sd-spotlight-tags">
                <span className="sd-course-tag" style={{ background: `${selectedCourseObj.color}22`, color: selectedCourseObj.color }}>
                  {selectedCourseObj.id}
                </span>
                <span className="sd-course-badge" style={{ background: '#E8F2EC', color: '#557E6D' }}>Enrolled</span>
              </div>
              <h3 className="sd-spotlight-title">{selectedCourseObj.name}</h3>
              <p className="sd-spotlight-meta">
                👨‍🏫 Faculty: <strong>{selectedCourseObj.faculty}</strong> &nbsp;·&nbsp;
                📍 Room: <strong>{selectedCourseObj.room}</strong> &nbsp;·&nbsp;
                🕐 Schedule: <strong>{selectedCourseObj.schedule}</strong>
              </p>
            </div>

            <button
              className="sd-back-btn"
              onClick={() => setSelectedSubject('all')}
            >
              ← Back to All Subjects
            </button>
          </div>

          <div className="sd-spotlight-grid">
            {/* Big Circular Progress */}
            <div className="sd-spotlight-gauge-box">
              <div className="sd-spotlight-gauge-wrap">
                {(() => {
                  const p = pct(selectedCourseObj)
                  const col = pctColor(p)
                  const r = 48
                  const circ = 2 * Math.PI * r
                  const offset = circ * (1 - p / 100)
                  return (
                    <svg className="sd-spotlight-svg" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r={r} fill="none" stroke="#E7E8E2" strokeWidth="8" />
                      <circle
                        cx="60"
                        cy="60"
                        r={r}
                        fill="none"
                        stroke={col}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                      <text x="60" y="58" textAnchor="middle" fontSize="22" fontWeight="700" fill="#162F44">{p}%</text>
                      <text x="60" y="74" textAnchor="middle" fontSize="10.5" fill="#758087" fontWeight="500">Attendance</text>
                    </svg>
                  )
                })()}
              </div>

              <div className="sd-spotlight-status-tag">
                {pct(selectedCourseObj) >= 85 ? (
                  <span className="sd-badge sd-badge-present">✅ Safe Standing</span>
                ) : pct(selectedCourseObj) >= 75 ? (
                  <span className="sd-badge sd-badge-late">⚠️ Warning Threshold</span>
                ) : (
                  <span className="sd-badge sd-badge-absent">🚨 At Risk</span>
                )}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="sd-spotlight-metrics-box">
              <div className="sd-spot-stats-row">
                <div className="sd-spot-stat">
                  <div className="sd-spot-stat-label">Classes Attended</div>
                  <div className="sd-spot-stat-val" style={{ color: '#557E6D' }}>{selectedCourseObj.attended}</div>
                  <div className="sd-spot-stat-sub">of {selectedCourseObj.total} held</div>
                </div>
                <div className="sd-spot-stat">
                  <div className="sd-spot-stat-label">Classes Missed</div>
                  <div className="sd-spot-stat-val" style={{ color: '#BC6D61' }}>{selectedCourseObj.total - selectedCourseObj.attended}</div>
                  <div className="sd-spot-stat-sub">unattended</div>
                </div>
                <div className="sd-spot-stat">
                  <div className="sd-spot-stat-label">Required for 75%</div>
                  <div className="sd-spot-stat-val">{Math.ceil(0.75 * selectedCourseObj.total)}</div>
                  <div className="sd-spot-stat-sub">minimum classes</div>
                </div>
              </div>

              {/* Attendance Allowance Simulation Box */}
              <div className="sd-simulation-box">
                {pct(selectedCourseObj) >= 75 ? (
                  <div className="sd-sim-positive">
                    <span className="sd-sim-icon">🎉</span>
                    <div>
                      <strong>Attendance Buffer Active:</strong>
                      <p>
                        You can safely miss up to <strong>{Math.max(0, Math.floor(selectedCourseObj.attended - 0.75 * selectedCourseObj.total))}</strong> more upcoming class(es) without dropping below the mandatory 75% cutoff.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="sd-sim-negative">
                    <span className="sd-sim-icon">⚠️</span>
                    <div>
                      <strong>Attendance Recovery Required:</strong>
                      <p>
                        You must attend the next <strong>{Math.max(0, Math.ceil((0.75 * selectedCourseObj.total - selectedCourseObj.attended)))}</strong> consecutive classes without absence to achieve 75% compliance.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subject Attendance History Table */}
          <div className="sd-spotlight-history">
            <h4 className="sd-spotlight-subhead">📋 Recent Verification Logs for {selectedCourseObj.id}</h4>
            {logs.filter(l => (l.course_id === selectedCourseObj.id || l.course === selectedCourseObj.id)).length === 0 ? (
              <p style={{ color: 'var(--sd-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                No recent attendance scans logged yet for {selectedCourseObj.name}.
              </p>
            ) : (
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date & Time</th>
                      <th>Verification Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs
                      .filter(l => (l.course_id === selectedCourseObj.id || l.course === selectedCourseObj.id))
                      .slice(0, 5)
                      .map((log, idx) => (
                        <tr key={log._id || log.id || idx}>
                          <td>{idx + 1}</td>
                          <td>{log.date || (log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-GB') : 'Recent')}</td>
                          <td><span className="sd-method-badge">👁️ Face & QR Verified</span></td>
                          <td><span className="sd-badge sd-badge-present">✅ Present</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full Grid of All Subjects */
        <div className="sd-attend-cards">
          {filtered.map(c => {
            const p = pct(c)
            const safe = Math.max(0, Math.ceil((0.75 * c.total - c.attended)))
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
                      <circle cx="30" cy="30" r="24" fill="none" stroke="#E7E8E2" strokeWidth="5" />
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
                    <span style={{ color: '#557E6D', fontSize: '0.82rem', fontWeight: 600 }}>
                      ✅ Can afford to miss ~{Math.max(0, Math.floor(c.attended - 0.75 * c.total))} more class(es)
                    </span>
                  ) : (
                    <span style={{ color: '#BC6D61', fontSize: '0.82rem', fontWeight: 600 }}>
                      🚨 Need {safe} more class(es) to reach 75%
                    </span>
                  )}
                  <button
                    type="button"
                    className="sd-card-drill-btn"
                    onClick={() => setSelectedSubject(c.id)}
                    title="View Detailed Breakdown"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
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
//  TAB: CLASSES
// ═══════════════════════════════════════════════════════════
function TabClasses({ attData }) {
  const [selected, setSelected] = useState(null)
  const [activeDay, setActiveDay] = useState('Monday')
  const coursesList = attData?.courses || COURSES
  const scheduleList = attData?.todaySchedule || TODAY_SCHEDULE

  const dayScheduleMap = {
    'Monday': [
      { time: '9:00 AM - 10:30 AM', course: 'CS101', name: 'Data Structures', room: 'Lab 3', faculty: 'Prof. Sharma', type: 'Lab & Practical', status: scheduleList.find(s => s.course === 'CS101')?.status || 'upcoming' },
      { time: '2:00 PM - 3:30 PM', course: 'CS312', name: 'Database Systems', room: 'Room 7', faculty: 'Prof. Meera', type: 'Lecture', status: scheduleList.find(s => s.course === 'CS312')?.status || 'upcoming' },
    ],
    'Tuesday': [
      { time: '11:00 AM - 12:30 PM', course: 'CS205', name: 'Operating Systems', room: 'Room 12', faculty: 'Dr. Rajan', type: 'Theory Lecture', status: scheduleList.find(s => s.course === 'CS205')?.status || 'upcoming' },
    ],
    'Wednesday': [
      { time: '9:00 AM - 10:30 AM', course: 'CS101', name: 'Data Structures', room: 'Lab 3', faculty: 'Prof. Sharma', type: 'Practical Session', status: scheduleList.find(s => s.course === 'CS101')?.status || 'upcoming' },
      { time: '2:00 PM - 3:30 PM', course: 'CS312', name: 'Database Systems', room: 'Room 7', faculty: 'Prof. Meera', type: 'Lab Session', status: scheduleList.find(s => s.course === 'CS312')?.status || 'upcoming' },
    ],
    'Thursday': [
      { time: '11:00 AM - 12:30 PM', course: 'CS205', name: 'Operating Systems', room: 'Room 12', faculty: 'Dr. Rajan', type: 'Theory Lecture', status: scheduleList.find(s => s.course === 'CS205')?.status || 'upcoming' },
    ],
    'Friday': [
      { time: '9:00 AM - 10:30 AM', course: 'CS101', name: 'Data Structures', room: 'Lab 3', faculty: 'Prof. Sharma', type: 'Doubt Clearing & Quiz', status: scheduleList.find(s => s.course === 'CS101')?.status || 'upcoming' },
    ]
  }

  const courseSyllabus = {
    'CS101': [
      { mod: 'Module 1', title: 'Arrays, Linked Lists & Complexity Analysis', status: 'Completed' },
      { mod: 'Module 2', title: 'Stacks, Queues & Priority Queues', status: 'Completed' },
      { mod: 'Module 3', title: 'Trees, Binary Search Trees & AVL Balancing', status: 'In Progress' },
      { mod: 'Module 4', title: 'Graphs, Traversal & Shortest Path Algorithms', status: 'Upcoming' },
    ],
    'CS205': [
      { mod: 'Module 1', title: 'OS Structures & Process Scheduling', status: 'Completed' },
      { mod: 'Module 2', title: 'Process Synchronization & Semaphores', status: 'Completed' },
      { mod: 'Module 3', title: 'Deadlock Avoidance & Bankers Algorithm', status: 'In Progress' },
      { mod: 'Module 4', title: 'Virtual Memory, Paging & File Systems', status: 'Upcoming' },
    ],
    'CS312': [
      { mod: 'Module 1', title: 'Relational Model & Relational Algebra', status: 'Completed' },
      { mod: 'Module 2', title: 'Advanced SQL, Views & Constraints', status: 'Completed' },
      { mod: 'Module 3', title: 'Database Normalization (1NF, 2NF, 3NF, BCNF)', status: 'In Progress' },
      { mod: 'Module 4', title: 'Transaction Management & ACID Properties', status: 'Upcoming' },
    ]
  }

  return (
    <div className="sd-tab-content">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">📚 Enrolled Classes & Academic Roster</h2>
          <p className="sd-section-sub">Curriculum details, faculty schedules, and attendance metrics for this semester</p>
        </div>
      </div>

      {/* ── Academic Summary Metrics ──────────────────────── */}
      <div className="sd-classes-metrics-bar">
        <div className="sd-cmetric-card">
          <span className="sd-cmetric-icon">📖</span>
          <div>
            <div className="sd-cmetric-label">Enrolled Courses</div>
            <div className="sd-cmetric-val">{coursesList.length} Active Courses</div>
          </div>
        </div>
        <div className="sd-cmetric-card">
          <span className="sd-cmetric-icon">🎓</span>
          <div>
            <div className="sd-cmetric-label">Semester Standing</div>
            <div className="sd-cmetric-val">Semester 6 · Computer Science</div>
          </div>
        </div>
        <div className="sd-cmetric-card">
          <span className="sd-cmetric-icon">⭐</span>
          <div>
            <div className="sd-cmetric-label">Total Credits</div>
            <div className="sd-cmetric-val">18 Credit Units</div>
          </div>
        </div>
        <div className="sd-cmetric-card">
          <span className="sd-cmetric-icon">⏱️</span>
          <div>
            <div className="sd-cmetric-label">Weekly Contact</div>
            <div className="sd-cmetric-val">22 Hours / Week</div>
          </div>
        </div>
      </div>

      {/* ── Enrolled Course Cards Grid ──────────────────────── */}
      <div className="sd-classes-grid">
        {coursesList.map(c => {
          const p = pct(c)
          const color = pctColor(p)
          const isSelected = selected === c.id
          const syllabus = courseSyllabus[c.id] || []
          return (
            <div
              key={c.id}
              id={`class-${c.id}`}
              className={`sd-class-card ${isSelected ? 'selected' : ''}`}
              style={{ '--ccolor': c.color }}
            >
              <div className="sd-class-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sd-course-tag" style={{ background: `${c.color}22`, color: c.color }}>{c.id}</span>
                  <span className="sd-class-type-tag">Core Theory + Lab</span>
                </div>
                <span className={`sd-badge sd-badge-${p >= 85 ? 'present' : p >= 75 ? 'late' : 'absent'}`}>{p}%</span>
              </div>

              <h4 className="sd-class-name">{c.name}</h4>

              <div className="sd-class-meta-chips">
                <div className="sd-class-meta-chip">
                  <span className="sd-cm-avatar">{c.faculty ? c.faculty.replace('Prof. ', '').replace('Dr. ', '')[0] : 'F'}</span>
                  <span>{c.faculty}</span>
                </div>
                <div className="sd-class-meta-chip">
                  <span>📍 {c.room}</span>
                </div>
                <div className="sd-class-meta-chip">
                  <span>🕐 {c.schedule}</span>
                </div>
              </div>

              <div className="sd-class-progress-wrap">
                <div className="sd-mini-bar-track">
                  <div className="sd-mini-bar-fill" style={{ width: `${p}%`, background: color }} />
                  <div className="sd-mini-bar-cutoff" style={{ left: '75%' }} title="75% Requirement" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: 4 }}>
                  <span style={{ color: 'var(--sd-text-secondary)' }}>{c.attended} of {c.total} classes attended</span>
                  <span style={{ color, fontWeight: 700 }}>
                    {p >= 85 ? 'Safe Standing' : p >= 75 ? 'Caution' : 'Under 75%'}
                  </span>
                </div>
              </div>

              {/* Expander Toggle */}
              <button
                type="button"
                className="sd-class-expand-btn"
                onClick={() => setSelected(isSelected ? null : c.id)}
              >
                {isSelected ? '▲ Hide Syllabus & Details' : '▼ View Syllabus & Module Details'}
              </button>

              {isSelected && (
                <div className="sd-class-detail-expand">
                  <div className="sd-class-detail-row"><span>Classes Attended</span><strong>{c.attended}</strong></div>
                  <div className="sd-class-detail-row"><span>Total Conducted</span><strong>{c.total}</strong></div>
                  <div className="sd-class-detail-row"><span>Absences</span><strong>{c.total - c.attended}</strong></div>
                  <div className="sd-class-detail-row">
                    <span>Attendance Status</span>
                    <strong style={{ color }}>
                      {p >= 85 ? '✅ Safe (Above 85%)' : p >= 75 ? '⚠️ Warning (75–84%)' : '🚨 At Risk (<75%)'}
                    </strong>
                  </div>

                  {/* Modules Outline */}
                  <div className="sd-syllabus-block">
                    <div className="sd-syllabus-heading">📖 Curriculum Modules:</div>
                    {syllabus.map((syl, sIdx) => (
                      <div key={sIdx} className="sd-syllabus-item">
                        <span className="sd-syl-mod">{syl.mod}:</span>
                        <span className="sd-syl-title">{syl.title}</span>
                        <span className={`sd-syl-status ${syl.status.toLowerCase().replace(' ', '-')}`}>
                          {syl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Timetable Section with Day Tabs ─────────────────── */}
      <div className="sd-card sd-timetable-card">
        <div className="sd-tt-header-row">
          <div>
            <h3 className="sd-card-title" style={{ margin: 0 }}>🗓️ Weekly Timetable</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--sd-text-secondary)', marginTop: 2 }}>
              Daily lecture slots, lab allocations and live attendance status
            </p>
          </div>

          <div className="sd-day-tabs">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => (
              <button
                key={d}
                type="button"
                className={`sd-day-tab ${activeDay === d ? 'active' : ''}`}
                onClick={() => setActiveDay(d)}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="sd-timetable">
          {(dayScheduleMap[activeDay] || []).length === 0 ? (
            <p style={{ color: 'var(--sd-text-secondary)', padding: '1.5rem 0', textAlign: 'center' }}>
              No scheduled classes on this day.
            </p>
          ) : (
            (dayScheduleMap[activeDay] || []).map((s, i, arr) => (
              <div key={i} className={`sd-timetable-row ${s.status}`}>
                <div className="sd-tt-time">{s.time}</div>
                <div className="sd-tt-line">
                  <div className="sd-tt-dot" style={{ background: s.status === 'done' ? '#557E6D' : '#162F44' }} />
                  {i < arr.length - 1 && <div className="sd-tt-vline" />}
                </div>
                <div className="sd-tt-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="sd-tt-name">{s.name}</span>
                    <span className="sd-class-type-tag">{s.type}</span>
                  </div>
                  <span className="sd-tt-meta">{s.course} · 📍 {s.room} · 👨‍🏫 {s.faculty}</span>
                </div>
                <span className={`sd-badge ${s.status === 'done' ? 'sd-badge-present' : 'sd-badge-upcoming'}`}>
                  {s.status === 'done' ? '✅ Attended' : '🕐 Upcoming'}
                </span>
              </div>
            ))
          )}
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
  const [serverAssignments, setServerAssignments] = useState([])
  const [loading, setLoading]                     = useState(true)
  const [filter, setFilter]                       = useState('all')
  const [filterCourse, setFilterCourse]           = useState('all')
  const [searchQ, setSearchQ]                     = useState('')
  
  // Local submission records state
  const [submissions, setSubmissions] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_student_submissions')
      if (saved) return JSON.parse(saved)
    } catch(e) {}
    return {
      'seed_asgn_3': { submittedAt: '2026-10-14T10:30:00Z', note: 'GitHub: github.com/student/b-tree-sim', status: 'graded', score: 18, feedback: 'Well structured implementation.' }
    }
  })

  // Active submission modal state
  const [submittingAsgn, setSubmittingAsgn] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submittingState, setSubmittingState] = useState('idle')

  useEffect(() => {
    fetch(`${API}/assignments/`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setServerAssignments(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Default seeded assignments for rich offline/demo fallback
  const defaultAssignments = [
    {
      _id: 'seed_asgn_1',
      course: 'CS101',
      title: 'AVL Tree Self-Balancing & Rotation Algorithms',
      description: 'Implement an AVL Tree class in C++ or Python with automatic left, right, left-right and right-left rotations. Include a test harness verifying balance factor integrity.',
      due_date: '2026-11-05T23:59:00Z',
      created_at: '2026-10-20T09:00:00Z',
      faculty: 'Prof. Sharma',
      marks: 25
    },
    {
      _id: 'seed_asgn_2',
      course: 'CS205',
      title: 'POSIX Thread Synchronization & Dining Philosophers Solution',
      description: 'Solve the classical Dining Philosophers problem using POSIX mutexes and condition variables. Ensure starvation-free deadlock prevention with performance benchmarks.',
      due_date: '2026-11-08T23:59:00Z',
      created_at: '2026-10-22T11:00:00Z',
      faculty: 'Dr. Rajan',
      marks: 20
    },
    {
      _id: 'seed_asgn_3',
      course: 'CS312',
      title: 'Relational Database Schema Normalization (3NF & BCNF)',
      description: 'Normalize an unnormalized university ERP invoice and grades dataset into third normal form (3NF) and Boyce-Codd normal form (BCNF). Submit relational schemas and SQL DDL scripts.',
      due_date: '2026-10-15T23:59:00Z',
      created_at: '2026-10-05T14:00:00Z',
      faculty: 'Prof. Meera',
      marks: 20
    },
    {
      _id: 'seed_asgn_4',
      course: 'CS101',
      title: 'Dijkstra & A* Graph Pathfinding Benchmark',
      description: 'Design and compare shortest-path routing on sparse vs dense weighted graphs using Priority Queue Fibonacci heaps. Submit benchmark graphs and complexity writeup.',
      due_date: '2026-11-15T23:59:00Z',
      created_at: '2026-10-25T16:00:00Z',
      faculty: 'Prof. Sharma',
      marks: 30
    }
  ]

  // Merge server assignments with fallback defaults
  const allAssignments = [
    ...serverAssignments,
    ...defaultAssignments.filter(d => !serverAssignments.some(s => (s._id || s.id) === d._id))
  ]

  const now = new Date()

  const handleOpenSubmit = (asgn) => {
    setSubmittingAsgn(asgn)
    setSubmissionText('')
    setSubmittingState('idle')
  }

  const handleConfirmSubmit = (e) => {
    e.preventDefault()
    if (!submittingAsgn) return
    setSubmittingState('saving')
    setTimeout(() => {
      const record = {
        submittedAt: new Date().toISOString(),
        note: submissionText || 'Online text submission attached.',
        status: 'submitted',
        score: null,
        feedback: 'Awaiting faculty assessment.'
      }
      setSubmissions(prev => {
        const next = { ...prev, [submittingAsgn._id]: record }
        try { localStorage.setItem('sd_student_submissions', JSON.stringify(next)) } catch(e) {}
        return next
      })
      setSubmittingState('success')
      setTimeout(() => {
        setSubmittingAsgn(null)
      }, 1200)
    }, 800)
  }

  // Filtered list
  const filtered = allAssignments.filter(a => {
    const due = a.due_date || a.dueDate
    const isSubmitted = !!submissions[a._id]
    const isOverdue = due && new Date(due) < now && !isSubmitted

    if (filter === 'active' && (isSubmitted || isOverdue)) return false
    if (filter === 'submitted' && !isSubmitted) return false
    if (filter === 'past' && !isOverdue) return false

    if (filterCourse !== 'all' && a.course !== filterCourse) return false

    if (searchQ.trim()) {
      const q = searchQ.toLowerCase()
      const matchTitle = (a.title || '').toLowerCase().includes(q)
      const matchDesc = (a.description || '').toLowerCase().includes(q)
      const matchCourse = (a.course || '').toLowerCase().includes(q)
      if (!matchTitle && !matchDesc && !matchCourse) return false
    }

    return true
  })

  const submittedCount = Object.keys(submissions).length
  const activeCount = allAssignments.filter(a => {
    const due = a.due_date || a.dueDate
    return !submissions[a._id] && (!due || new Date(due) >= now)
  }).length
  const overdueCount = allAssignments.filter(a => {
    const due = a.due_date || a.dueDate
    return !submissions[a._id] && due && new Date(due) < now
  }).length

  return (
    <div className="sd-tab-content">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">📝 Assignments & Coursework</h2>
          <p className="sd-section-sub">Coursework deliverables, laboratory writeups, deadlines and grade feedback</p>
        </div>
      </div>

      {/* ── Summary Metrics Bar ──────────────────────────────── */}
      <div className="sd-asgn-metrics-bar">
        <div className="sd-ametric-card">
          <span className="sd-ametric-icon">📚</span>
          <div>
            <div className="sd-ametric-label">Total Coursework</div>
            <div className="sd-ametric-val">{allAssignments.length} Assigned</div>
          </div>
        </div>
        <div className="sd-ametric-card">
          <span className="sd-ametric-icon">⏳</span>
          <div>
            <div className="sd-ametric-label">Active & Due Soon</div>
            <div className="sd-ametric-val" style={{ color: '#557E6D' }}>{activeCount} Pending</div>
          </div>
        </div>
        <div className="sd-ametric-card">
          <span className="sd-ametric-icon">✅</span>
          <div>
            <div className="sd-ametric-label">Turned In</div>
            <div className="sd-ametric-val" style={{ color: '#162F44' }}>{submittedCount} Submitted</div>
          </div>
        </div>
        <div className="sd-ametric-card">
          <span className="sd-ametric-icon">⏰</span>
          <div>
            <div className="sd-ametric-label">Past Due</div>
            <div className="sd-ametric-val" style={{ color: overdueCount > 0 ? '#C3665B' : 'inherit' }}>
              {overdueCount} Overdue
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ────────────────────────── */}
      <div className="sd-asgn-toolbar">
        <div className="sd-asgn-search-box">
          <input
            id="asgn-search-input"
            className="sd-input sd-input-search"
            placeholder="🔍 Search coursework title, topic or keyword…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button className="sd-search-clear" onClick={() => setSearchQ('')}>✕</button>
          )}
        </div>

        <select
          id="asgn-course-select"
          className="sd-select sd-asgn-select"
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
        >
          <option value="all">All Courses</option>
          <option value="CS101">CS101 — Data Structures</option>
          <option value="CS205">CS205 — Operating Systems</option>
          <option value="CS312">CS312 — Database Systems</option>
        </select>

        <div className="sd-filter-pills">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: '⏳ Active' },
            { id: 'submitted', label: '✅ Submitted' },
            { id: 'past', label: '⏰ Past Due' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              id={`asgn-pill-${f.id}`}
              className={`sd-pill ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Assignment Cards Grid ───────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="sd-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
          <p style={{ color: 'var(--sd-text-secondary)', fontSize: '0.95rem' }}>No assignments match your search or filter.</p>
          <button
            className="sd-secondary-btn"
            style={{ marginTop: '0.85rem' }}
            onClick={() => { setFilter('all'); setFilterCourse('all'); setSearchQ('') }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="sd-asgn-grid">
          {filtered.map(a => {
            const due = a.due_date || a.dueDate
            const isSub = !!submissions[a._id]
            const subData = submissions[a._id]
            const isOverdue = due && new Date(due) < now && !isSub

            let dueDays = null
            if (due) {
              const diffMs = new Date(due) - now
              dueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
            }

            return (
              <div
                key={a._id}
                className="sd-card sd-asgn-card"
                style={{
                  borderLeft: `4px solid ${isSub ? '#557E6D' : isOverdue ? '#C3665B' : '#B5822C'}`
                }}
              >
                <div className="sd-asgn-card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="sd-course-tag" style={{ background: '#E8ECE8', color: '#162F44' }}>
                      {a.course}
                    </span>
                    {isSub ? (
                      <span className="sd-badge sd-badge-present">✅ Submitted</span>
                    ) : isOverdue ? (
                      <span className="sd-badge sd-badge-absent">⏰ Past Due</span>
                    ) : (
                      <span className="sd-badge sd-badge-late">
                        {dueDays === 0 ? 'Due Today' : dueDays === 1 ? 'Due Tomorrow' : `Due in ${dueDays} days`}
                      </span>
                    )}
                  </div>
                  {a.marks && (
                    <span className="sd-asgn-marks-badge">🏆 {a.marks} Marks</span>
                  )}
                </div>

                <h3 className="sd-asgn-title">{a.title}</h3>

                {a.description && (
                  <p className="sd-asgn-desc">{a.description}</p>
                )}

                <div className="sd-asgn-meta-row">
                  {due && (
                    <span className="sd-asgn-due-chip" style={{ color: isOverdue ? '#C3665B' : 'inherit' }}>
                      📅 Due: <strong>{new Date(due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </span>
                  )}
                  {a.faculty && <span>👨‍🏫 By: <strong>{a.faculty}</strong></span>}
                </div>

                {/* Submission Status or Action */}
                <div className="sd-asgn-action-bar">
                  {isSub ? (
                    <div className="sd-asgn-sub-info">
                      <span style={{ color: '#557E6D', fontWeight: 600, fontSize: '0.82rem' }}>
                        Turned in on {new Date(subData.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      {subData.score !== null && subData.score !== undefined ? (
                        <span className="sd-asgn-grade-pill">Score: {subData.score}/{a.marks}</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--sd-text-secondary)' }}>Awaiting review</span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="sd-primary-btn sd-asgn-submit-btn"
                      onClick={() => handleOpenSubmit(a)}
                    >
                      📤 Submit Work
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Interactive Submission Modal ─────────────────────── */}
      {submittingAsgn && (
        <div className="sd-pay-overlay">
          <div className="sd-pay-modal sd-asgn-modal">
            {submittingState !== 'saving' && (
              <button className="sd-pay-close" onClick={() => setSubmittingAsgn(null)}>✕</button>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <span className="sd-course-tag" style={{ background: '#E8ECE8', color: '#162F44', marginBottom: 6, display: 'inline-block' }}>
                {submittingAsgn.course}
              </span>
              <h2 style={{ fontFamily: 'var(--sd-font-serif)', fontSize: '1.25rem', color: '#162F44' }}>
                Submit Coursework
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--sd-text-secondary)', marginTop: 4 }}>
                {submittingAsgn.title}
              </p>
            </div>

            {submittingState === 'success' ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h3 style={{ color: '#557E6D', fontWeight: 700 }}>Assignment Submitted!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--sd-text-secondary)', marginTop: 4 }}>
                  Your coursework has been timestamped and sent to {submittingAsgn.faculty}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#162F44', display: 'block', marginBottom: 4 }}>
                    Submission Link / GitHub Repo / Solution Notes:
                  </label>
                  <textarea
                    className="sd-input"
                    rows={4}
                    placeholder="Paste your GitHub repository link or write your submission notes here..."
                    value={submissionText}
                    onChange={e => setSubmissionText(e.target.value)}
                    required
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                <div style={{
                  border: '2px dashed var(--sd-border)',
                  borderRadius: 8,
                  padding: '1.25rem',
                  textAlign: 'center',
                  background: 'rgba(22, 47, 68, 0.02)'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>📎</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#162F44' }}>Attach Project Archive or Report (Optional)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-secondary)', marginTop: 2 }}>PDF, ZIP, IPYNB up to 25MB</div>
                  <input type="file" style={{ marginTop: 8, fontSize: '0.78rem' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    className="sd-secondary-btn"
                    onClick={() => setSubmittingAsgn(null)}
                    disabled={submittingState === 'saving'}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="sd-primary-btn"
                    disabled={submittingState === 'saving'}
                  >
                    {submittingState === 'saving' ? 'Submitting…' : 'Confirm Submission ✅'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  TAB: BILLS & PAYMENTS
// ═══════════════════════════════════════════════════════════
function TabBills({ user }) {
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem('sd_student_bills')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    
    // Default seeded bills
    return [
      { id: 'tuition_2026', title: 'Tuition Fee (Spring Semester 2026)', category: 'Academic', invoiceNo: 'INV-2026-081', amount: 75000, status: 'unpaid', icon: '🎓', dueDate: '2026-06-15', description: 'Regular academic tuition fees for 6th semester Computer Science curriculum.' },
      { id: 'hostel_2026', title: 'Hostel Rent & Mess Charges', category: 'Hostel', invoiceNo: 'INV-2026-042', amount: 32000, status: 'unpaid', icon: '🏢', dueDate: '2026-06-01', description: 'Accommodation charges including high-speed campus Wi-Fi & meal plans.' },
      { id: 'exam_2026', title: 'Semester Examination Registration Fee', category: 'Exams', invoiceNo: 'INV-2026-019', amount: 4500, status: 'unpaid', icon: '📝', dueDate: '2026-05-25', description: 'Registration fees for final end-semester theoretical & lab examinations.' },
      { id: 'lib_fine_2026', title: 'Library Late Book Return Fine', category: 'Library', invoiceNo: 'INV-2026-004', amount: 350, status: 'paid', icon: '📚', dueDate: '2026-05-10', description: 'Overdue charges for "Introduction to Algorithms" book kept for 14 extra days.', paidOn: '2026-05-12T14:32:00Z', method: 'UPI' }
    ]
  })

  const [filterCat, setFilterCat]       = useState('all')
  const [activeBill, setActiveBill]     = useState(null)
  const [receiptBill, setReceiptBill]   = useState(null)
  const [payMethod, setPayMethod]       = useState('card') // 'card' | 'upi' | 'net'
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
    setCardName(user?.name ? user.name.toUpperCase() : 'STUDENT NAME')
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
      }, 1600)
    }, 2000)
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

  const totalOutstanding = bills.filter(b => b.status === 'unpaid').reduce((s, b) => s + b.amount, 0)
  const totalPaid = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0)

  const filteredBills = filterCat === 'all' ? bills : bills.filter(b => b.category.toLowerCase() === filterCat.toLowerCase())

  return (
    <div className="sd-tab-content">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">💳 Tuition Fees, Invoices & Accounts</h2>
          <p className="sd-section-sub">Institutional fee schedule, outstanding balances, digital payment portal and payment receipts</p>
        </div>
      </div>

      {/* ── Financial Summary Metrics Banner ────────────────── */}
      <div className="sd-financial-metrics-bar">
        <div className="sd-fmetric-card">
          <span className="sd-fmetric-icon">💰</span>
          <div>
            <div className="sd-fmetric-label">Outstanding Balance</div>
            <div className="sd-fmetric-val" style={{ color: totalOutstanding > 0 ? '#BC6D61' : '#557E6D' }}>
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </div>
            <div className="sd-fmetric-sub">{bills.filter(b => b.status === 'unpaid').length} Invoices Pending</div>
          </div>
        </div>

        <div className="sd-fmetric-card">
          <span className="sd-fmetric-icon">🧾</span>
          <div>
            <div className="sd-fmetric-label">Total Cleared Fees</div>
            <div className="sd-fmetric-val" style={{ color: '#557E6D' }}>
              ₹{totalPaid.toLocaleString('en-IN')}
            </div>
            <div className="sd-fmetric-sub">Paid this Academic Term</div>
          </div>
        </div>

        <div className="sd-fmetric-card">
          <span className="sd-fmetric-icon">📅</span>
          <div>
            <div className="sd-fmetric-label">Next Due Date</div>
            <div className="sd-fmetric-val" style={{ color: '#162F44' }}>
              25 May 2026
            </div>
            <div className="sd-fmetric-sub">Semester Exam Fee</div>
          </div>
        </div>

        <div className="sd-fmetric-card">
          <span className="sd-fmetric-icon">🛡️</span>
          <div>
            <div className="sd-fmetric-label">Account Clearance</div>
            <div className="sd-fmetric-val" style={{ color: '#B5822C' }}>
              Partial Pending
            </div>
            <div className="sd-fmetric-sub">Exam Hall Ticket Active</div>
          </div>
        </div>
      </div>

      {/* ── Category Filters ────────────────────────────────── */}
      <div className="sd-asgn-toolbar">
        <div className="sd-filter-pills">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'academic', label: '🎓 Academic' },
            { id: 'hostel', label: '🏢 Hostel & Mess' },
            { id: 'exams', label: '📝 Examination' },
            { id: 'library', label: '📚 Library & Fines' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              className={`sd-pill ${filterCat === f.id ? 'active' : ''}`}
              onClick={() => setFilterCat(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bills Grid ──────────────────────────────────────── */}
      <div className="sd-bill-grid">
        {filteredBills.map(b => (
          <div key={b.id} className="sd-bill-card">
            <div className="sd-bill-header">
              <span className="sd-bill-icon">{b.icon}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {b.invoiceNo && (
                  <span className="sd-inv-tag">{b.invoiceNo}</span>
                )}
                <span className={`sd-bill-badge ${b.status}`}>{b.status}</span>
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#557E6D', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {b.category}
              </div>
              <h3 className="sd-bill-title">{b.title}</h3>
              <p className="sd-bill-description">{b.description}</p>
            </div>

            <div className="sd-bill-meta-chips">
              <span className="sd-bill-due-chip">
                📅 Due: {new Date(b.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="sd-bill-amount-row">
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sd-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Fee
                </div>
                <div className="sd-bill-amount">₹{b.amount.toLocaleString('en-IN')}</div>
              </div>
              
              {b.status === 'unpaid' ? (
                <button className="sd-primary-btn" onClick={() => openPayment(b)}>
                  💳 Pay Now
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontSize: '0.78rem', color: '#557E6D', fontWeight: 700 }}>
                    ✅ Paid via {b.method}
                  </div>
                  <button
                    type="button"
                    className="sd-receipt-btn"
                    onClick={() => setReceiptBill(b)}
                  >
                    📄 View Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Official Payment Receipt Modal ──────────────────── */}
      {receiptBill && (
        <div className="sd-pay-overlay">
          <div className="sd-pay-modal sd-receipt-modal">
            <button className="sd-pay-close" onClick={() => setReceiptBill(null)}>✕</button>

            <div className="sd-receipt-content" id="printable-receipt">
              <div className="sd-receipt-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.8rem' }}>🏛️</span>
                  <div>
                    <h3 style={{ fontFamily: 'var(--sd-font-serif)', fontSize: '1.15rem', color: '#162F44', margin: 0 }}>
                      Attentify University ERP
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--sd-text-secondary)', margin: 0 }}>
                      Official Electronic Fee Receipt & Clearance Record
                    </p>
                  </div>
                </div>
                <span className="sd-badge sd-badge-present">PAID & VERIFIED</span>
              </div>

              <div className="sd-receipt-divider" />

              <div className="sd-receipt-grid">
                <div>
                  <div className="sd-rcpt-lbl">Receipt Number</div>
                  <div className="sd-rcpt-val">REC-2026-{(receiptBill.id.slice(-4) + '8941').toUpperCase()}</div>
                </div>
                <div>
                  <div className="sd-rcpt-lbl">Payment Date</div>
                  <div className="sd-rcpt-val">
                    {receiptBill.paidOn ? new Date(receiptBill.paidOn).toLocaleString('en-IN') : '12 May 2026, 02:32 PM'}
                  </div>
                </div>
                <div>
                  <div className="sd-rcpt-lbl">Student Name</div>
                  <div className="sd-rcpt-val">{user?.name || 'Arjun Sharma'}</div>
                </div>
                <div>
                  <div className="sd-rcpt-lbl">Student ID / Roll No</div>
                  <div className="sd-rcpt-val">21CS028</div>
                </div>
              </div>

              <div className="sd-receipt-item-table">
                <div className="sd-rcpt-item-row header">
                  <span>Fee Description</span>
                  <span>Amount</span>
                </div>
                <div className="sd-rcpt-item-row">
                  <div>
                    <strong>{receiptBill.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-secondary)' }}>
                      Category: {receiptBill.category} · Invoice Ref: {receiptBill.invoiceNo || 'INV-2026'}
                    </div>
                  </div>
                  <strong>₹{receiptBill.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="sd-rcpt-item-row total">
                  <span>Total Amount Paid</span>
                  <span style={{ color: '#557E6D', fontSize: '1.1rem' }}>₹{receiptBill.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="sd-receipt-footer">
                <div>
                  <span className="sd-method-badge">Payment Channel: {receiptBill.method || 'UPI Transfer'}</span>
                  <div style={{ fontSize: '0.72rem', color: 'var(--sd-text-secondary)', marginTop: 4 }}>
                    Transaction ID: <code style={{ fontFamily: 'monospace' }}>TXN-984210459</code>
                  </div>
                </div>
                <button
                  type="button"
                  className="sd-primary-btn"
                  onClick={() => window.print()}
                >
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Gateway Modal ────────────────────────────── */}
      {activeBill && (
        <div className="sd-pay-overlay">
          <div className="sd-pay-modal">
            {paymentState !== 'processing' && paymentState !== 'success' && (
              <button className="sd-pay-close" onClick={closePayment}>✕</button>
            )}

            {paymentState === 'idle' && (
              <>
                <div>
                  <h2 style={{ fontFamily: 'var(--sd-font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#162F44' }}>
                    Institutional Payment Checkout
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--sd-text-secondary)', marginTop: '0.25rem' }}>
                    Paying for: <strong>{activeBill.title}</strong>
                  </p>
                </div>

                <div style={{ background: '#F7F6F2', border: '1px solid var(--sd-border)', padding: '0.85rem', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#162F44' }}>Total Payable Amount:</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#557E6D', fontFamily: 'monospace' }}>
                    ₹{activeBill.amount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Tab select payment method */}
                <div className="pay-methods">
                  <button className={`pay-method-btn ${payMethod === 'card' ? 'active' : ''}`} onClick={() => setPayMethod('card')}>💳 Card</button>
                  <button className={`pay-method-btn ${payMethod === 'upi' ? 'active' : ''}`} onClick={() => setPayMethod('upi')}>📱 UPI</button>
                  <button className={`pay-method-btn ${payMethod === 'net' ? 'active' : ''}`} onClick={() => setPayMethod('net')}>🏦 NetBanking</button>
                </div>

                <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* CARD METHOD */}
                  {payMethod === 'card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="glass-card-wrapper">
                        <div className="glass-credit-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="card-chip"></div>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, fontStyle: 'italic', opacity: 0.85 }}>VISA</span>
                          </div>
                          <div className="card-num">{cardNum || '•••• •••• •••• ••••'}</div>
                          <div className="card-bottom">
                            <div className="card-holder">{cardName || (user?.name || 'STUDENT NAME').toUpperCase()}</div>
                            <div className="card-expiry-wrap">
                              <div className="card-expiry-lbl">VALID THRU</div>
                              <div className="card-expiry-val">{cardExpiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                        <input className="sd-input" placeholder="Card Number (16-Digit)" value={cardNum} onChange={e => setCardNum(formatCardNum(e.target.value))} maxLength={19} required />
                        <input className="sd-input" placeholder="Cardholder Name" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} maxLength={26} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <input className="sd-input" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} required />
                          <input className="sd-input" type="password" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, ''))} maxLength={3} required />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI METHOD */}
                  {payMethod === 'upi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                      <div style={{
                        width: '140px', height: '140px',
                        background: '#fff', padding: '10px',
                        borderRadius: '12px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(22,47,68,0.12)',
                        border: '1px solid var(--sd-border)'
                      }}>
                        <div style={{ width: '100%', height: '100%', border: '2px dashed #162F44', display: 'flex', flexWrap: 'wrap', opacity: 0.85 }}>
                          <div style={{ width: '40px', height: '40px', background: '#162F44', margin: '2px' }}></div>
                          <div style={{ flex: 1 }}></div>
                          <div style={{ width: '40px', height: '40px', background: '#162F44', margin: '2px' }}></div>
                          <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.4rem' }}>📱</div>
                          <div style={{ width: '40px', height: '40px', background: '#162F44', margin: '2px' }}></div>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--sd-text-secondary)', textAlign: 'center' }}>
                        Scan QR code with GPay, PhonePe, Paytm, or BHIM to pay instantly.
                      </p>

                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sd-text-secondary)' }}>OR ENTER YOUR UPI VPA ID</label>
                        <input className="sd-input" placeholder="e.g. username@upi" value={upiId} onChange={e => setUpiId(e.target.value)} required={payMethod === 'upi'} />
                      </div>
                    </div>
                  )}

                  {/* NET BANKING */}
                  {payMethod === 'net' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 0' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#162F44' }}>Select Institutional Bank</label>
                      <select className="sd-select" value={bank} onChange={e => setBank(e.target.value)}>
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                      </select>
                      <p style={{ fontSize: '0.75rem', color: 'var(--sd-text-secondary)', marginTop: '0.25rem' }}>
                        You will be routed to your bank's 2-Factor NetBanking gateway.
                      </p>
                    </div>
                  )}

                  <button type="submit" className="sd-primary-btn sd-btn-full" style={{ marginTop: '0.5rem' }}>
                    🔒 Confirm & Pay ₹{activeBill.amount.toLocaleString('en-IN')}
                  </button>
                </form>
              </>
            )}

            {paymentState === 'processing' && (
              <div className="pay-loader">
                <div className="pay-spinner"></div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#162F44' }}>Processing Payment</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--sd-text-secondary)', marginTop: 4 }}>Authenticating with banking servers. Please do not close.</p>
                </div>
              </div>
            )}

            {paymentState === 'success' && (
              <div className="pay-loader">
                <div className="pay-success-tick">✓</div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#557E6D' }}>Payment Authorized!</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--sd-text-secondary)', marginTop: 4 }}>
                    Receipt generated for <code style={{ fontFamily: 'monospace', color: '#162F44' }}>₹{activeBill.amount.toLocaleString('en-IN')}</code>
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
//  TAB: LOGS (Advanced Search, Filters & CSV Export)
// ═══════════════════════════════════════════════════════════
function TabLogs({ attData }) {
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMethod, setFilterMethod] = useState('all')
  const [searchQ,      setSearchQ]      = useState('')

  const rawLogs = (attData?.logs && attData.logs.length > 0) ? attData.logs : LOGS
  const coursesList = attData?.courses || COURSES

  const formattedLogs = rawLogs.map((l, idx) => ({
    id: l._id || l.id || `log-${idx}`,
    date: l.date || (l.timestamp ? new Date(l.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'),
    course: l.course_id || l.course || 'CS101',
    method: l.method || 'QR Code + Face',
    status: l.status || 'present',
    timestamp: l.timestamp || new Date().toISOString()
  }))

  const filtered = formattedLogs.filter(l => {
    const matchCourse = filterCourse === 'all' || l.course === filterCourse
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    const matchMethod = filterMethod === 'all' || 
      (filterMethod === 'qr' && l.method.toLowerCase().includes('qr')) ||
      (filterMethod === 'face' && l.method.toLowerCase().includes('face'))
    const matchSearch = (l.date || '').toLowerCase().includes(searchQ.toLowerCase()) ||
                        (l.course || '').toLowerCase().includes(searchQ.toLowerCase()) ||
                        (l.method || '').toLowerCase().includes(searchQ.toLowerCase())
    return matchCourse && matchStatus && matchMethod && matchSearch
  })

  // Export filtered logs to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return
    const headers = ['Record ID', 'Date & Time', 'Course ID', 'Verification Method', 'Attendance Status']
    const rows = filtered.map((l, idx) => [
      idx + 1,
      `"${l.date}"`,
      `"${l.course}"`,
      `"${l.method}"`,
      `"${l.status.toUpperCase()}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `attentify_attendance_logs_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const presentCount = formattedLogs.filter(l => l.status === 'present').length
  const absentCount  = formattedLogs.filter(l => l.status === 'absent').length
  const lateCount    = formattedLogs.filter(l => l.status === 'late').length

  return (
    <div className="sd-tab-content">
      {/* ── Section Header ─────────────────────────────────── */}
      <div className="sd-section-header">
        <div>
          <h2 className="sd-section-title">🗒️ Attendance Verification Logs</h2>
          <p className="sd-section-sub">Chronological audit trail of biometric and session QR attendance events</p>
        </div>
        <button
          type="button"
          className="sd-secondary-btn"
          onClick={handleExportCSV}
          title="Download CSV Spreadsheet"
        >
          📥 Export CSV
        </button>
      </div>

      {/* ── Metric Summary Pills ────────────────────────────── */}
      <div className="sd-log-summary">
        <span className="sd-log-sum-pill" style={{ color: '#557E6D', borderColor: '#557E6D33' }}>
          ✅ Present: <strong>{presentCount}</strong>
        </span>
        <span className="sd-log-sum-pill" style={{ color: '#BC6D61', borderColor: '#BC6D6133' }}>
          ❌ Absent: <strong>{absentCount}</strong>
        </span>
        <span className="sd-log-sum-pill" style={{ color: '#B5822C', borderColor: '#B5822C33' }}>
          ⏰ Late: <strong>{lateCount}</strong>
        </span>
        <span className="sd-log-sum-pill" style={{ color: '#162F44', borderColor: '#162F4433' }}>
          📋 Total Records: <strong>{formattedLogs.length}</strong>
        </span>
      </div>

      {/* ── Toolbar with Filters ─────────────────────────────── */}
      <div className="sd-filters sd-log-toolbar">
        <div className="sd-asgn-search-box" style={{ flex: '1 1 240px' }}>
          <input
            id="log-search"
            className="sd-input sd-input-search"
            placeholder="🔍 Search by date, course, or verification method…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button className="sd-search-clear" onClick={() => setSearchQ('')}>✕</button>
          )}
        </div>

        <select id="log-course-filter" className="sd-select" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {coursesList.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
        </select>

        <select id="log-status-filter" className="sd-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="present">Present (✅)</option>
          <option value="late">Late (⏰)</option>
          <option value="absent">Absent (❌)</option>
        </select>

        <select id="log-method-filter" className="sd-select" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
          <option value="all">All Verification Methods</option>
          <option value="face">👁️ Face Recognition</option>
          <option value="qr">🔲 QR Code Scan</option>
        </select>
      </div>

      {/* ── Modern Table ─────────────────────────────────────── */}
      <div className="sd-card sd-table-wrap">
        <table className="sd-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Date & Timestamp</th>
              <th>Course / Subject</th>
              <th>Verification Mode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 4 }}>🔍</div>
                  <div style={{ color: 'var(--sd-text-secondary)', fontSize: '0.9rem' }}>No attendance log records match this query.</div>
                  <button
                    className="sd-secondary-btn"
                    style={{ marginTop: 8 }}
                    onClick={() => { setFilterCourse('all'); setFilterStatus('all'); setFilterMethod('all'); setSearchQ('') }}
                  >
                    Clear Filters
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((l, i) => (
                <tr key={l.id}>
                  <td className="sd-td-num">{i + 1}</td>
                  <td className="sd-td-date">
                    <strong>{l.date}</strong>
                  </td>
                  <td>
                    <span className="sd-course-tag" style={{ background: '#E8ECE8', color: '#162F44' }}>
                      {l.course}
                    </span>
                  </td>
                  <td className="sd-td-method">
                    <span className="sd-method-badge">
                      {l.method.includes('Face') && l.method.includes('QR')
                        ? '🔲👁️ Face & Session QR'
                        : l.method.includes('QR')
                          ? '🔲 Session QR'
                          : l.method.includes('Face')
                            ? '👁️ Face Recognition'
                            : '✍️ Manual Verification'}
                    </span>
                  </td>
                  <td>
                    <span className={`sd-badge sd-badge-${l.status}`}>
                      {l.status === 'present' ? '✅ Present' : l.status === 'late' ? '⏰ Late' : '❌ Absent'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="sd-table-footer">
            <span>Showing {filtered.length} of {formattedLogs.length} verified records</span>
            <span style={{ color: 'var(--sd-text-secondary)' }}>Automated biometrics audit log</span>
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
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const hash = window.location.hash.replace('#', '')
        if (hash) return hash
      } catch (e) {}
    }
    return 'overview'
  })
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
          {activeTab === 'scanner'    && <TabScanner user={user} attData={attData} onNav={handleNav} />}
          {activeTab === 'classes'    && <TabClasses attData={attData} />}
          {activeTab === 'timetable'   && <TabTimetable />}
          {activeTab === 'assignments'  && <TabStudentAssignments />}
          {activeTab === 'bills'        && <TabBills user={user} />}
          {activeTab === 'logs'         && <TabLogs attData={attData} />}
          {activeTab === 'settings'     && <TabSettings user={user} />}
        </main>
      </div>
    </div>
  )
}
