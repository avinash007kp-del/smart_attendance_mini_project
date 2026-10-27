import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from '../hooks/useRouter';
import { useAuth } from '../context/AuthContext';
import AttentifyLogo from './AttentifyLogo';
import {
  GridIcon,
  BuildingIcon,
  UsersIcon,
  SettingsIcon,
  LogoutIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
  IdCardIcon,
  BarChartIcon,
  AlertTriangleIcon,
  UserPlusIcon,
  BuildingPlusIcon,
  DownloadIcon,
  BellIcon,
  LockIcon,
  ClipboardListIcon,
  BrandEllipse,
  CameraIcon,
  EditIcon,
  TrashIcon,
  KeyIcon,
  RefreshCwIcon,
  CheckIcon,
  BookOpenIcon,
  UserCheckIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SendIcon,
  FileTextIcon,
  PrinterIcon,
  PlusIcon,
  FilterIcon,
} from './AdminDashboardIcons';
import './AdminDashboardPage.css';

// ─── Data Structures ──────────────────────────────────────────
const DEPARTMENTS = [
  { id: 'CS',   name: 'Computer Science',       hod: 'Dr. Rajan Kumar',   faculty: 12, students: 320, avgAttend: 88, color: '#557E6D' },
  { id: 'EC',   name: 'Electronics & Comm.',     hod: 'Prof. Meera Iyer',  faculty: 10, students: 280, avgAttend: 82, color: '#6B8294' },
  { id: 'ME',   name: 'Mechanical Engineering',  hod: 'Dr. Anand V.',      faculty: 9,  students: 260, avgAttend: 79, color: '#6B8294' },
  { id: 'CV',   name: 'Civil Engineering',       hod: 'Prof. Suresh R.',   faculty: 8,  students: 240, avgAttend: 85, color: '#557E6D' },
  { id: 'BT',   name: 'Biotechnology',           hod: 'Dr. Priya Nair',    faculty: 7,  students: 180, avgAttend: 91, color: '#557E6D' },
  { id: 'MBA',  name: 'Business Administration', hod: 'Prof. Kiran Das',   faculty: 6,  students: 150, avgAttend: 76, color: '#6B8294' },
];

const ACTIVITY_LOG = [
  { time: '2 min ago',  msg: 'Rahul Verma marked present via QR — CS101',        type: 'success' },
  { time: '5 min ago',  msg: 'New QR session started by Prof. Sharma for CS205', type: 'info'    },
  { time: '12 min ago', msg: 'Priya Singh account deactivated by Admin',          type: 'warn'    },
  { time: '28 min ago', msg: 'Weekly attendance report generated (CS dept)',       type: 'neutral' },
  { time: '1 hr ago',   msg: 'New department "Biotechnology" added',              type: 'info'    },
  { time: '3 hrs ago',  msg: 'System backup completed successfully',              type: 'success' },
];

const SYSTEM_HEALTH = [
  { name: 'API Server',          status: 'online'  },
  { name: 'Face Recognition AI', status: 'online'  },
  { name: 'QR Session Engine',   status: 'online'  },
  { name: 'Email Service',        status: 'warning' },
  { name: 'Database',             status: 'online'  },
];

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',             icon: GridIcon     },
  { id: 'departments', label: 'Departments',          icon: BuildingIcon },
  { id: 'faculty',     label: 'Faculty Management',   icon: IdCardIcon   },
  { id: 'timetable',   label: 'Timetable Management', icon: CalendarIcon },
  { id: 'users',       label: 'User Management',      icon: UsersIcon    },
  { id: 'settings',    label: 'Settings',             icon: SettingsIcon },
];

// ═══════════════════════════════════════════════════════════════
//  TAB: OVERVIEW
// ═══════════════════════════════════════════════════════════════
function TabOverview({ user, users, onNav, onQuickAction }) {
  const displayName = user?.name ? user.name.toUpperCase() : 'ARJUN P';

  // Stats calculation matching reference screenshot
  const totalStudents = 1430;
  const totalFaculty = 52;
  const avgAttendance = 84;
  const inactiveUsersCount = 0;

  // Breakdown counts matching reference screenshot
  const adminCount = 1;
  const facultyCount = 2;
  const studentCount = 3;

  return (
    <div className="ad-tab-content">
      {/* 1. Welcome Header */}
      <div className="ad-welcome-header">
        <div>
          <h1 className="ad-welcome-title">Welcome back, {displayName}</h1>
          <p className="ad-welcome-date">Thursday, 15 October 2026</p>
        </div>
        <div className="ad-welcome-actions">
          <div className="ad-ellipse-wrap" aria-hidden="true">
            <BrandEllipse width={50} height={32} />
          </div>
          <button
            type="button"
            className="ad-btn-outline"
            onClick={() => onNav('timetable')}
            title="Manage Weekly Schedule, Slot Allocations & Room Bookings"
          >
            <CalendarIcon size={16} />
            <span>Timetable</span>
          </button>
          <button
            type="button"
            className="ad-btn-outline"
            onClick={() => onNav('faculty')}
            title="Manage Faculty Accounts, Allocations & Security"
          >
            <IdCardIcon size={16} />
            <span>Faculty Hub</span>
          </button>
          <button
            type="button"
            className="ad-btn-outline"
            onClick={() => onNav('users')}
          >
            <UsersIcon size={16} />
            <span>Manage Users</span>
          </button>
          <button
            type="button"
            className="ad-btn-primary"
            onClick={() => onNav('departments')}
          >
            <BuildingIcon size={16} />
            <span>Departments</span>
          </button>
        </div>
      </div>

      {/* 2. Statistics Row (Four Equal Columns with Thin Top/Bottom Borders) */}
      <div className="ad-stats-row">
        {/* Metric 1 — Total Students */}
        <div className="ad-stat-col">
          <div className="ad-stat-header">
            <GraduationCapIcon size={17} />
            <span>Total Students</span>
          </div>
          <div className="ad-stat-value">{totalStudents.toLocaleString()}</div>
          <div className="ad-stat-footer">
            <span className="ad-stat-sub">Across 6 depts</span>
            <span className="ad-stat-trend">+12 this week</span>
          </div>
        </div>

        {/* Metric 2 — Faculty Members (Clickable to Faculty Management) */}
        <div 
          className="ad-stat-col" 
          onClick={() => onNav('faculty')}
          style={{ cursor: 'pointer' }}
          title="Click to view Faculty Management"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNav('faculty'); }}
        >
          <div className="ad-stat-header">
            <IdCardIcon size={17} />
            <span>Faculty Members</span>
          </div>
          <div className="ad-stat-value">{totalFaculty}</div>
          <div className="ad-stat-footer">
            <span className="ad-stat-sub">Active instructors</span>
            <span className="ad-stat-trend" style={{ color: '#557E6D', fontWeight: 600 }}>Manage &rarr;</span>
          </div>
        </div>

        {/* Metric 3 — Average Attendance */}
        <div className="ad-stat-col">
          <div className="ad-stat-header">
            <BarChartIcon size={17} />
            <span>Avg. Attendance</span>
          </div>
          <div className="ad-stat-value">{avgAttendance}%</div>
          <div className="ad-stat-footer">
            <span className="ad-stat-sub">All departments</span>
            <span className="ad-stat-trend">+1.4% vs last week</span>
          </div>
        </div>

        {/* Metric 4 — Inactive Users */}
        <div className="ad-stat-col">
          <div className="ad-stat-header">
            <AlertTriangleIcon size={17} />
            <span>Inactive Users</span>
          </div>
          <div className="ad-stat-value">{inactiveUsersCount}</div>
          <div className="ad-stat-footer">
            <span className="ad-stat-sub">Requires review</span>
            <span></span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid (Two Large Panels) */}
      <div className="ad-main-grid">
        {/* Panel A — Department Attendance */}
        <div className="ad-card">
          <div className="ad-panel-header">
            <h2 className="ad-panel-title">Department Attendance</h2>
            <button
              type="button"
              className="ad-panel-action"
              onClick={() => onNav('departments')}
            >
              View all →
            </button>
          </div>
          <div className="ad-dept-list">
            {DEPARTMENTS.map(d => (
              <div key={d.id} className="ad-dept-row">
                <span className="ad-dept-name" title={d.name}>{d.name}</span>
                <div className="ad-progress-track">
                  <div
                    className={`ad-progress-fill ${d.avgAttend >= 85 ? 'high' : 'normal'}`}
                    style={{ width: `${d.avgAttend}%` }}
                  />
                </div>
                <span className="ad-dept-pct">{d.avgAttend}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel B — System Activity */}
        <div className="ad-card">
          <div className="ad-panel-header">
            <h2 className="ad-panel-title">System Activity</h2>
          </div>
          <div className="ad-activity-list">
            {ACTIVITY_LOG.map((act, idx) => (
              <div key={idx} className="ad-activity-item">
                <span className="ad-activity-time">{act.time}</span>
                <span className={`ad-activity-dot ${act.type}`} />
                <span className="ad-activity-text">{act.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Dashboard Grid (Three Equal Cards) */}
      <div className="ad-bottom-grid">
        {/* Card A — System Health */}
        <div className="ad-card">
          <h3 className="ad-bottom-card-title">System Health</h3>
          <div className="ad-health-list">
            {SYSTEM_HEALTH.map((item, idx) => (
              <div key={idx} className="ad-health-row">
                <div className="ad-health-left">
                  <span className={`ad-health-dot ${item.status}`} />
                  <span>{item.name}</span>
                </div>
                <span className={`ad-health-status ${item.status}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card B — User Breakdown */}
        <div className="ad-card">
          <h3 className="ad-bottom-card-title">User Breakdown</h3>
          <div className="ad-breakdown-list">
            <div className="ad-breakdown-row">
              <div className="ad-breakdown-left">
                <ShieldCheckIcon size={17} color="#20384D" />
                <span>Admin</span>
              </div>
              <span className="ad-breakdown-count">{adminCount}</span>
            </div>
            <div className="ad-breakdown-row">
              <div className="ad-breakdown-left">
                <IdCardIcon size={17} color="#20384D" />
                <span>Faculty</span>
              </div>
              <span className="ad-breakdown-count">{facultyCount}</span>
            </div>
            <div className="ad-breakdown-row">
              <div className="ad-breakdown-left">
                <GraduationCapIcon size={17} color="#20384D" />
                <span>Student</span>
              </div>
              <span className="ad-breakdown-count">{studentCount}</span>
            </div>
          </div>
        </div>

        {/* Card C — Quick Actions */}
        <div className="ad-card">
          <h3 className="ad-bottom-card-title">Quick Actions</h3>
          <div className="ad-qa-grid">
            <button
              type="button"
              className="ad-qa-button"
              onClick={() => onQuickAction('addUser')}
            >
              <UserPlusIcon size={15} />
              <span>Add User</span>
            </button>
            <button
              type="button"
              className="ad-qa-button"
              onClick={() => onQuickAction('addDept')}
            >
              <BuildingPlusIcon size={15} />
              <span>Add Dept</span>
            </button>
            <button
              type="button"
              className="ad-qa-button"
              onClick={() => onQuickAction('exportReport')}
            >
              <DownloadIcon size={15} />
              <span>Export Report</span>
            </button>
            <button
              type="button"
              className="ad-qa-button"
              onClick={() => onQuickAction('broadcastAlert')}
            >
              <BellIcon size={15} />
              <span>Broadcast Alert</span>
            </button>
            <button
              type="button"
              className="ad-qa-button"
              onClick={() => onQuickAction('lockSystem')}
            >
              <LockIcon size={15} />
              <span>Lock System</span>
            </button>
            <button
              type="button"
              className="ad-qa-button"
              onClick={() => onQuickAction('viewLogs')}
            >
              <ClipboardListIcon size={15} />
              <span>View Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: DEPARTMENTS
// ═══════════════════════════════════════════════════════════════
function TabDepartments({ onShowToast }) {
  const [depts, setDepts] = useState(DEPARTMENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ id: '', name: '', hod: '' });

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newDept = {
      id: form.id.trim() || form.name.slice(0, 3).toUpperCase(),
      name: form.name.trim(),
      hod: form.hod.trim() || 'Unassigned',
      faculty: 0,
      students: 0,
      avgAttend: 85,
      color: '#557E6D',
    };
    setDepts([newDept, ...depts]);
    setForm({ id: '', name: '', hod: '' });
    setShowAddModal(false);
    onShowToast(`✅ Department "${newDept.name}" added successfully`);
  };

  return (
    <div className="ad-tab-content">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">Academic Departments</h2>
          <p className="ad-section-sub">Manage departmental hierarchy, HOD assignments, and faculty allocations</p>
        </div>
        <button
          type="button"
          className="ad-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <BuildingPlusIcon size={16} />
          <span>Add Department</span>
        </button>
      </div>

      <div className="ad-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ad-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Department Name</th>
              <th>Head of Department (HOD)</th>
              <th>Faculty</th>
              <th>Students</th>
              <th>Avg. Attendance</th>
            </tr>
          </thead>
          <tbody>
            {depts.map(d => (
              <tr key={d.id}>
                <td><strong>{d.id}</strong></td>
                <td>{d.name}</td>
                <td>{d.hod}</td>
                <td>{d.faculty} instructors</td>
                <td>{d.students}</td>
                <td>
                  <span style={{ fontWeight: 600, color: d.avgAttend >= 85 ? 'var(--ad-success)' : 'var(--ad-navy)' }}>
                    {d.avgAttend}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="ad-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="ad-modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="ad-modal-title">Add Department</h3>
            <p className="ad-modal-desc">Create a new academic unit and assign a department head.</p>
            <form onSubmit={handleAddDept}>
              <div className="ad-form-group">
                <label className="ad-form-label">Department Code</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="e.g. AI"
                  value={form.id}
                  maxLength={5}
                  onChange={e => setForm({ ...form, id: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Department Name</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="e.g. Artificial Intelligence"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Head of Department (HOD)</label>
                <input
                  type="text"
                  className="ad-input"
                  placeholder="e.g. Dr. A. Sharma"
                  value={form.hod}
                  onChange={e => setForm({ ...form, hod: e.target.value })}
                />
              </div>
              <div className="ad-modal-actions">
                <button
                  type="button"
                  className="ad-btn-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ad-btn-primary">
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MODAL: DEDICATED STUDENT FACE REGISTRATION
// ═══════════════════════════════════════════════════════════════
function FaceRegistrationModal({ student, onClose, onSuccess, onShowToast }) {
  const [stream, setStream] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const videoRef = React.useRef(null);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (e) {
      setErrorMsg("Camera access denied or unavailable: " + e.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (!photoPreview) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [photoPreview]);

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        setPhotoBlob(blob);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleUploadFace = async () => {
    if (!photoBlob) {
      setErrorMsg("Please capture a photo first.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const fd = new FormData();
      fd.append('file', photoBlob, 'face.jpg');
      fd.append('student_id', student.email);

      const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/register`, {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Face registration failed");
      }

      onSuccess(`✅ Face profile registered successfully for ${student.name}!`);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    setErrorMsg(null);
  };

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className="ad-modal-title" style={{ margin: 0 }}>Register Face Biometrics</h3>
          <span className="ad-role-pill student" style={{ background: '#E8ECE8', color: '#162F44', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
            Student
          </span>
        </div>
        <p className="ad-modal-desc">
          Enroll reference biometric face profile for <strong>{student.name}</strong> ({student.email}) using live camera capture.
        </p>

        {errorMsg && (
          <div className="ad-error-banner" style={{ marginBottom: '14px' }}>
            <AlertTriangleIcon size={16} color="#C3665B" />
            <span>{errorMsg}</span>
          </div>
        )}

        {photoPreview ? (
          <div className="ad-face-preview-box">
            <div className="ad-face-preview-circle">
              <img src={photoPreview} alt="Captured face" className="ad-face-preview-img" />
            </div>
            <div className="ad-face-preview-info">
              <span className="ad-face-preview-status">✅ Face Frame Ready</span>
              <button
                type="button"
                className="ad-btn-outline"
                onClick={retake}
                disabled={loading}
                style={{ height: '30px', fontSize: '12px' }}
              >
                Retake Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="ad-camera-viewfinder-wrap">
            <div className="ad-camera-preview-circle">
              <video ref={videoRef} autoPlay playsInline muted className="ad-camera-video" />
            </div>
            <div className="ad-camera-controls">
              <button
                type="button"
                className="ad-btn-primary"
                onClick={captureSnapshot}
                style={{ height: '34px', fontSize: '12.5px' }}
              >
                📸 Capture Face Frame
              </button>
            </div>
          </div>
        )}

        <div className="ad-modal-actions">
          <button type="button" className="ad-btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="ad-btn-primary"
            onClick={handleUploadFace}
            disabled={!photoBlob || loading}
          >
            {loading ? 'Analyzing with DeepFace…' : 'Save & Register Face Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  FACULTY MANAGEMENT DATASETS & CATALOG
// ═══════════════════════════════════════════════════════════════
const COURSE_CATALOG = [
  { code: 'CS101',  title: 'Data Structures & Algorithms',       dept: 'CS', type: 'Theory' },
  { code: 'CS101L', title: 'Data Structures Laboratory',         dept: 'CS', type: 'Lab'    },
  { code: 'CS205',  title: 'Operating Systems & Architecture',   dept: 'CS', type: 'Theory' },
  { code: 'CS312',  title: 'Database Management Systems',        dept: 'CS', type: 'Theory' },
  { code: 'CS312L', title: 'DBMS Practical Laboratory',          dept: 'CS', type: 'Lab'    },
  { code: 'CS401',  title: 'Artificial Intelligence & ML',       dept: 'CS', type: 'Theory' },
  { code: 'EC201',  title: 'Digital Signal Processing',          dept: 'EC', type: 'Theory' },
  { code: 'EC201L', title: 'Signals & Hardware Lab',             dept: 'EC', type: 'Lab'    },
  { code: 'ME102',  title: 'Thermodynamics & Fluid Mechanics',   dept: 'ME', type: 'Theory' },
  { code: 'ME102L', title: 'Mechanical Workshop & CAD',          dept: 'ME', type: 'Lab'    },
  { code: 'CV204',  title: 'Structural Analysis & Design',       dept: 'CV', type: 'Theory' },
  { code: 'BT301',  title: 'Molecular Biology & Genetics',       dept: 'BT', type: 'Theory' },
  { code: 'BT301L', title: 'Biotech Microbiology Lab',           dept: 'BT', type: 'Lab'    },
  { code: 'MBA101', title: 'Organizational Behavior & Strategy', dept: 'MBA', type: 'Theory' },
];

const SECTIONS_CATALOG = [
  'Section A',
  'Section B',
  'Section C',
  'Batch A1',
  'Batch A2',
  'Batch B1',
  'Batch B2',
];

const DESIGNATIONS_CATALOG = [
  'Professor & HOD',
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Visiting Faculty',
];

const INITIAL_FACULTY = [
  {
    id: 'FAC001',
    name: 'Dr. Rajan Kumar',
    email: 'rajan.kumar@attentify.ac.in',
    dept: 'CS',
    designation: 'Professor & HOD',
    qualification: 'Ph.D. in AI (IIT Madras)',
    experience: '16 Years',
    phone: '+91 94451 22301',
    status: 'active',
    assignedCourses: ['CS312', 'CS401'],
    assignedLabs: ['CS312L'],
    assignedSections: ['Section A'],
    joinedDate: '15 July 2014',
  },
  {
    id: 'FAC002',
    name: 'Prof. Meera Iyer',
    email: 'meera.iyer@attentify.ac.in',
    dept: 'EC',
    designation: 'Associate Professor',
    qualification: 'M.Tech (IISc Bangalore)',
    experience: '11 Years',
    phone: '+91 98402 33412',
    status: 'active',
    assignedCourses: ['EC201'],
    assignedLabs: ['EC201L'],
    assignedSections: ['Section A', 'Section B'],
    joinedDate: '01 August 2017',
  },
  {
    id: 'FAC003',
    name: 'Avinash K P',
    email: 'avinash@attentify.ac.in',
    dept: 'CS',
    designation: 'Associate Professor',
    qualification: 'Ph.D. (NITK Surathkal)',
    experience: '7 Years',
    phone: '+91 98765 43210',
    status: 'active',
    assignedCourses: ['CS101', 'CS205'],
    assignedLabs: ['CS101L'],
    assignedSections: ['Section A', 'Section B', 'Batch A1'],
    joinedDate: '12 August 2021',
  },
  {
    id: 'FAC004',
    name: 'Dr. Anand V',
    email: 'anand.v@attentify.ac.in',
    dept: 'ME',
    designation: 'Professor & HOD',
    qualification: 'Ph.D. in Robotics (BITS Pilani)',
    experience: '14 Years',
    phone: '+91 97103 44521',
    status: 'active',
    assignedCourses: ['ME102'],
    assignedLabs: ['ME102L'],
    assignedSections: ['Section A'],
    joinedDate: '10 January 2016',
  },
  {
    id: 'FAC005',
    name: 'Prof. Suresh R',
    email: 'suresh.r@attentify.ac.in',
    dept: 'CV',
    designation: 'Assistant Professor',
    qualification: 'M.Tech in Structural Eng (VTU)',
    experience: '5 Years',
    phone: '+91 99801 55632',
    status: 'inactive',
    assignedCourses: ['CV204'],
    assignedLabs: [],
    assignedSections: ['Section B'],
    joinedDate: '22 February 2022',
  },
  {
    id: 'FAC006',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@attentify.ac.in',
    dept: 'BT',
    designation: 'Associate Professor & HOD',
    qualification: 'Ph.D. in Bioinformatics (JNU)',
    experience: '10 Years',
    phone: '+91 98112 66743',
    status: 'active',
    assignedCourses: ['BT301'],
    assignedLabs: ['BT301L'],
    assignedSections: ['Section A'],
    joinedDate: '04 September 2019',
  },
];

// ═══════════════════════════════════════════════════════════════
//  TAB: FACULTY MANAGEMENT
//  - Add or remove faculty accounts
//  - Edit official faculty information
//  - Assign departments, subjects and classes
//  - Activate or deactivate accounts
//  - Reset faculty passwords
// ═══════════════════════════════════════════════════════════════
function TabFacultyManagement({ facultyList, setFacultyList, users, setUsers, onShowToast }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [assigningFaculty, setAssigningFaculty] = useState(null);
  const [resettingFaculty, setResettingFaculty] = useState(null);
  const [removingFaculty, setRemovingFaculty] = useState(null);

  // Filtered List
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(f => {
      const q = search.toLowerCase();
      const matchSearch =
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.assignedCourses.some(c => c.toLowerCase().includes(q));
      const matchDept = deptFilter === 'all' || f.dept === deptFilter;
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [facultyList, search, deptFilter, statusFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = facultyList.length;
    const active = facultyList.filter(f => f.status === 'active').length;
    const inactive = total - active;
    const totalAllocations = facultyList.reduce((acc, f) => acc + f.assignedCourses.length + f.assignedLabs.length, 0);
    const deptsCount = new Set(facultyList.map(f => f.dept)).size;
    return { total, active, inactive, totalAllocations, deptsCount };
  }, [facultyList]);

  // Quick One-Click Toggle Status (Activate / Deactivate)
  const handleToggleStatus = (faculty) => {
    const newStatus = faculty.status === 'active' ? 'inactive' : 'active';
    const updated = facultyList.map(f => f.id === faculty.id ? { ...f, status: newStatus } : f);
    setFacultyList(updated);

    // Sync with users list
    if (setUsers && users) {
      setUsers(users.map(u => u.email === faculty.email ? { ...u, status: newStatus } : u));
    }

    onShowToast(`🔄 Account ${newStatus === 'active' ? 'activated' : 'deactivated'} for ${faculty.name}`);
  };

  // Add Faculty Handler
  const handleAddFaculty = (newFacultyData) => {
    setFacultyList([newFacultyData, ...facultyList]);

    // Also sync to general users table
    if (setUsers && users) {
      const newUserRecord = {
        id: newFacultyData.id,
        name: newFacultyData.name,
        email: newFacultyData.email,
        role: 'teacher',
        dept: newFacultyData.dept,
        status: newFacultyData.status,
      };
      setUsers([newUserRecord, ...users]);
    }

    setShowAddModal(false);
    onShowToast(`✅ Faculty account created successfully for ${newFacultyData.name}`);
  };

  // Edit Faculty Handler
  const handleUpdateFaculty = (updatedData) => {
    setFacultyList(facultyList.map(f => f.id === updatedData.id ? updatedData : f));

    // Sync to users table
    if (setUsers && users) {
      setUsers(users.map(u => (u.id === updatedData.id || u.email === updatedData.email) ? {
        ...u,
        name: updatedData.name,
        email: updatedData.email,
        dept: updatedData.dept,
        status: updatedData.status,
      } : u));
    }

    setEditingFaculty(null);
    onShowToast(`✅ Official information updated for ${updatedData.name}`);
  };

  // Assign Subjects & Classes Handler
  const handleSaveAssignments = (facultyId, { dept, assignedCourses, assignedLabs, assignedSections }) => {
    setFacultyList(facultyList.map(f => {
      if (f.id === facultyId) {
        return {
          ...f,
          dept,
          assignedCourses,
          assignedLabs,
          assignedSections,
        };
      }
      return f;
    }));
    setAssigningFaculty(null);
    onShowToast(`📚 Teaching assignments updated successfully`);
  };

  // Reset Password Handler
  const handleConfirmResetPassword = (facultyId, newPassword, requireNextChange) => {
    const target = facultyList.find(f => f.id === facultyId);
    setResettingFaculty(null);
    onShowToast(`🔑 Password reset for ${target?.name || 'Faculty'}. New temporary password: ${newPassword}`);
  };

  // Remove Faculty Handler
  const handleConfirmRemove = (facultyId) => {
    const target = facultyList.find(f => f.id === facultyId);
    setFacultyList(facultyList.filter(f => f.id !== facultyId));

    // Remove from users list as well
    if (setUsers && users && target) {
      setUsers(users.filter(u => u.email !== target.email && u.id !== target.id));
    }

    setRemovingFaculty(null);
    onShowToast(`🗑️ Faculty account removed for ${target?.name || 'Faculty'}`);
  };

  return (
    <div className="ad-tab-content">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">Faculty Management</h2>
          <p className="ad-section-sub">
            Administer institutional faculty accounts, credentials, subject &amp; class allocations, and security credentials
          </p>
        </div>
        <button
          type="button"
          className="ad-btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlusIcon size={16} />
          <span>Add Faculty Account</span>
        </button>
      </div>

      {/* ── 4 KPI Summary Cards ────────────────────────────────── */}
      <div className="ad-faculty-kpi-strip">
        <div className="ad-fk-card">
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Total Faculty</span>
            <IdCardIcon size={16} color="var(--ad-navy)" />
          </div>
          <div className="ad-fk-val">{stats.total}</div>
          <span className="ad-fk-sub">Academic instructors</span>
        </div>

        <div className="ad-fk-card">
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Active Status</span>
            <CheckIcon size={16} color="var(--ad-success)" />
          </div>
          <div className="ad-fk-val font-bold" style={{ color: 'var(--ad-success)' }}>
            {stats.active} <span style={{ fontSize: '14px', color: 'var(--ad-text-secondary)', fontWeight: 400 }}>/ {stats.total}</span>
          </div>
          <span className="ad-fk-sub">{stats.inactive} Inactive accounts</span>
        </div>

        <div className="ad-fk-card">
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Teaching Allocations</span>
            <BookOpenIcon size={16} color="var(--ad-navy)" />
          </div>
          <div className="ad-fk-val">{stats.totalAllocations}</div>
          <span className="ad-fk-sub">Active course &amp; lab sections</span>
        </div>

        <div className="ad-fk-card">
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Departments</span>
            <BuildingIcon size={16} color="var(--ad-navy)" />
          </div>
          <div className="ad-fk-val">{stats.deptsCount}</div>
          <span className="ad-fk-sub">Academic disciplines</span>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ────────────────────────────── */}
      <div className="ad-faculty-toolbar">
        <div className="ad-search-box-wrap">
          <input
            type="text"
            className="ad-input"
            placeholder="Search faculty by name, employee ID, email, or course…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ad-toolbar-filters">
          <div className="ad-filter-select-wrap">
            <label className="ad-filter-lbl">Department:</label>
            <select
              className="ad-select"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
              ))}
            </select>
          </div>

          <div className="ad-filter-select-wrap">
            <label className="ad-filter-lbl">Status:</label>
            <select
              className="ad-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Faculty Table ──────────────────────────────────────── */}
      <div className="ad-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="ad-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Department &amp; Rank</th>
                <th>Assigned Subjects &amp; Classes</th>
                <th>Contact &amp; Joined</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--ad-text-secondary)' }}>
                    No faculty members found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((f) => {
                  const initials = f.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'FA';
                  const allAllocations = [...f.assignedCourses, ...f.assignedLabs];

                  return (
                    <tr key={f.id}>
                      {/* Column 1: Faculty Member */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="ad-avatar-circle">{initials}</div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--ad-navy)', fontSize: '13.5px' }}>
                              {f.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--ad-text-secondary)' }}>
                              <span className="font-mono" style={{ backgroundColor: '#F0EDE6', padding: '1px 5px', borderRadius: '3px', marginRight: '6px' }}>
                                {f.id}
                              </span>
                              <span>{f.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Department & Designation */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="ad-dept-pill font-mono">{f.dept}</span>
                            <span style={{ fontWeight: 600, color: 'var(--ad-navy)', fontSize: '12.5px' }}>
                              {f.designation}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--ad-text-secondary)' }}>
                            {f.qualification}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Assigned Subjects & Classes */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div className="ad-courses-pills-row">
                            {allAllocations.length === 0 ? (
                              <span style={{ fontSize: '11.5px', color: 'var(--ad-text-secondary)', fontStyle: 'italic' }}>
                                No courses assigned yet
                              </span>
                            ) : (
                              allAllocations.map((code, idx) => {
                                const isLab = code.endsWith('L');
                                return (
                                  <span
                                    key={idx}
                                    className={`ad-course-code-badge ${isLab ? 'lab' : 'theory'}`}
                                    title={isLab ? 'Laboratory Session' : 'Theory Lecture'}
                                  >
                                    {code}
                                  </span>
                                );
                              })
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {f.assignedSections.length > 0 && (
                              <span style={{ fontSize: '11px', color: 'var(--ad-text-secondary)' }}>
                                Sections: {f.assignedSections.join(', ')}
                              </span>
                            )}
                            <button
                              type="button"
                              className="ad-btn-assign-quick"
                              onClick={() => setAssigningFaculty(f)}
                              title="Assign or reassign departments, subjects and classes"
                            >
                              + Assign Classes
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Contact & Joined */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                          <span className="font-mono">{f.phone}</span>
                          <span style={{ color: 'var(--ad-text-secondary)', fontSize: '11px' }}>
                            Joined {f.joinedDate}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Status */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            className={`ad-badge ${f.status === 'active' ? 'active' : 'inactive'}`}
                            onClick={() => handleToggleStatus(f)}
                            style={{ cursor: 'pointer' }}
                            title="Click to toggle status"
                          >
                            {f.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {/* 1. Edit Official Info */}
                          <button
                            type="button"
                            className="ad-action-icon-btn"
                            onClick={() => setEditingFaculty(f)}
                            title="Edit official faculty information"
                            aria-label="Edit faculty"
                          >
                            <EditIcon size={14} color="var(--ad-navy)" />
                          </button>

                          {/* 2. Assign Subjects & Classes */}
                          <button
                            type="button"
                            className="ad-action-icon-btn"
                            onClick={() => setAssigningFaculty(f)}
                            title="Assign departments, subjects and classes"
                            aria-label="Assign classes"
                          >
                            <BookOpenIcon size={14} color="var(--ad-navy)" />
                          </button>

                          {/* 3. Activate / Deactivate Toggle */}
                          <button
                            type="button"
                            className="ad-action-icon-btn"
                            onClick={() => handleToggleStatus(f)}
                            title={f.status === 'active' ? 'Deactivate account' : 'Activate account'}
                            aria-label="Toggle status"
                          >
                            <RefreshCwIcon size={13} color="var(--ad-navy)" />
                          </button>

                          {/* 4. Reset Password */}
                          <button
                            type="button"
                            className="ad-action-icon-btn"
                            onClick={() => setResettingFaculty(f)}
                            title="Reset faculty password"
                            aria-label="Reset password"
                          >
                            <KeyIcon size={14} color="var(--ad-navy)" />
                          </button>

                          {/* 5. Remove Account */}
                          <button
                            type="button"
                            className="ad-action-icon-btn danger"
                            onClick={() => setRemovingFaculty(f)}
                            title="Remove faculty account"
                            aria-label="Remove faculty"
                          >
                            <TrashIcon size={14} color="var(--ad-error)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          MODAL 1: ADD FACULTY ACCOUNT
          ═════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <AddFacultyModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddFaculty}
          existingCount={facultyList.length}
        />
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL 2: EDIT OFFICIAL FACULTY INFORMATION
          ═════════════════════════════════════════════════════════ */}
      {editingFaculty && (
        <EditFacultyModal
          faculty={editingFaculty}
          onClose={() => setEditingFaculty(null)}
          onSave={handleUpdateFaculty}
        />
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL 3: ASSIGN DEPARTMENTS, SUBJECTS & CLASSES
          ═════════════════════════════════════════════════════════ */}
      {assigningFaculty && (
        <AssignFacultyModal
          faculty={assigningFaculty}
          onClose={() => setAssigningFaculty(null)}
          onSave={(data) => handleSaveAssignments(assigningFaculty.id, data)}
        />
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL 4: RESET FACULTY PASSWORD
          ═════════════════════════════════════════════════════════ */}
      {resettingFaculty && (
        <ResetPasswordModal
          faculty={resettingFaculty}
          onClose={() => setResettingFaculty(null)}
          onConfirm={(pwd, reqNext) => handleConfirmResetPassword(resettingFaculty.id, pwd, reqNext)}
        />
      )}

      {/* ═════════════════════════════════════════════════════════
          MODAL 5: REMOVE FACULTY ACCOUNT CONFIRMATION
          ═════════════════════════════════════════════════════════ */}
      {removingFaculty && (
        <RemoveFacultyModal
          faculty={removingFaculty}
          onClose={() => setRemovingFaculty(null)}
          onConfirm={() => handleConfirmRemove(removingFaculty.id)}
        />
      )}
    </div>
  );
}

// ── Add Faculty Modal ──────────────────────────────────────────
function AddFacultyModal({ onClose, onAdd, existingCount }) {
  const [form, setForm] = useState({
    id: `FAC${String(existingCount + 1).padStart(3, '0')}`,
    name: '',
    email: '',
    password: 'Attentify#2026',
    dept: 'CS',
    designation: 'Assistant Professor',
    qualification: 'M.Tech / Ph.D.',
    experience: '3 Years',
    phone: '+91 ',
    status: 'active',
    assignedCourses: ['CS101'],
    assignedLabs: [],
    assignedSections: ['Section A'],
    joinedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
  });

  const toggleCourse = (code, isLab) => {
    if (isLab) {
      setForm(prev => ({
        ...prev,
        assignedLabs: prev.assignedLabs.includes(code)
          ? prev.assignedLabs.filter(c => c !== code)
          : [...prev.assignedLabs, code]
      }));
    } else {
      setForm(prev => ({
        ...prev,
        assignedCourses: prev.assignedCourses.includes(code)
          ? prev.assignedCourses.filter(c => c !== code)
          : [...prev.assignedCourses, code]
      }));
    }
  };

  const toggleSection = (sec) => {
    setForm(prev => ({
      ...prev,
      assignedSections: prev.assignedSections.includes(sec)
        ? prev.assignedSections.filter(s => s !== sec)
        : [...prev.assignedSections, sec]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    onAdd(form);
  };

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <h3 className="ad-modal-title">Add New Faculty Account</h3>
        <p className="ad-modal-desc">
          Register a new instructor, set academic credentials, and assign initial subjects and classes.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Employee / Faculty ID</label>
              <input
                type="text"
                className="ad-input font-mono"
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                required
              />
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Full Legal Name</label>
              <input
                type="text"
                className="ad-input"
                placeholder="Dr. / Prof. Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Official University Email</label>
              <input
                type="email"
                className="ad-input"
                placeholder="name@attentify.ac.in"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Initial Temporary Password</label>
              <input
                type="text"
                className="ad-input font-mono"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Primary Department</label>
              <select
                className="ad-select"
                value={form.dept}
                onChange={e => setForm({ ...form, dept: e.target.value })}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Designation / Rank</label>
              <select
                className="ad-select"
                value={form.designation}
                onChange={e => setForm({ ...form, designation: e.target.value })}
              >
                {DESIGNATIONS_CATALOG.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Highest Qualification</label>
              <input
                type="text"
                className="ad-input"
                placeholder="Ph.D. / M.Tech"
                value={form.qualification}
                onChange={e => setForm({ ...form, qualification: e.target.value })}
              />
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Contact Phone</label>
              <input
                type="text"
                className="ad-input font-mono"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Initial Subject Allocations */}
          <div className="ad-form-group" style={{ marginTop: '6px' }}>
            <label className="ad-form-label">Initial Subject Allocations ({form.dept} Department)</label>
            <div className="ad-assign-checklist-box">
              {COURSE_CATALOG.filter(c => c.dept === form.dept).map(c => {
                const isLab = c.type === 'Lab';
                const isSelected = isLab ? form.assignedLabs.includes(c.code) : form.assignedCourses.includes(c.code);
                return (
                  <label key={c.code} className="ad-assign-check-label">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCourse(c.code, isLab)}
                    />
                    <span className="font-mono ad-check-code">{c.code}</span>
                    <span>{c.title}</span>
                    <span className={`ad-type-badge ${isLab ? 'lab' : 'theory'}`}>{c.type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Initial Class Section Allocations */}
          <div className="ad-form-group">
            <label className="ad-form-label">Assigned Class Sections</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SECTIONS_CATALOG.map(sec => {
                const isChecked = form.assignedSections.includes(sec);
                return (
                  <label key={sec} className={`ad-section-check-pill ${isChecked ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSection(sec)}
                      style={{ display: 'none' }}
                    />
                    <span>{sec}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="ad-modal-actions">
            <button type="button" className="ad-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ad-btn-primary">
              <UserPlusIcon size={15} />
              <span>Create Faculty Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Faculty Modal ─────────────────────────────────────────
function EditFacultyModal({ faculty, onClose, onSave }) {
  const [form, setForm] = useState({ ...faculty });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <h3 className="ad-modal-title">Edit Official Faculty Information</h3>
        <p className="ad-modal-desc">
          Update administrative faculty records, institutional designation, and departmental placement.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Employee ID</label>
              <input
                type="text"
                className="ad-input font-mono"
                value={form.id}
                onChange={e => setForm({ ...form, id: e.target.value })}
                required
              />
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Full Name</label>
              <input
                type="text"
                className="ad-input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Official University Email</label>
              <input
                type="email"
                className="ad-input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Contact Phone</label>
              <input
                type="text"
                className="ad-input font-mono"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Department</label>
              <select
                className="ad-select"
                value={form.dept}
                onChange={e => setForm({ ...form, dept: e.target.value })}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                ))}
              </select>
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Designation</label>
              <select
                className="ad-select"
                value={form.designation}
                onChange={e => setForm({ ...form, designation: e.target.value })}
              >
                {DESIGNATIONS_CATALOG.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Highest Qualification</label>
              <input
                type="text"
                className="ad-input"
                value={form.qualification}
                onChange={e => setForm({ ...form, qualification: e.target.value })}
              />
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Experience</label>
              <input
                type="text"
                className="ad-input"
                value={form.experience}
                onChange={e => setForm({ ...form, experience: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="ad-form-group">
              <label className="ad-form-label">Joining Date</label>
              <input
                type="text"
                className="ad-input"
                value={form.joinedDate}
                onChange={e => setForm({ ...form, joinedDate: e.target.value })}
              />
            </div>

            <div className="ad-form-group">
              <label className="ad-form-label">Account Status</label>
              <select
                className="ad-select"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active (Access Granted)</option>
                <option value="inactive">Inactive (Access Suspended)</option>
              </select>
            </div>
          </div>

          <div className="ad-modal-actions">
            <button type="button" className="ad-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ad-btn-primary">
              <CheckIcon size={15} />
              <span>Save Official Information</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Assign Departments, Subjects & Classes Modal ───────────────
function AssignFacultyModal({ faculty, onClose, onSave }) {
  const [selectedDept, setSelectedDept] = useState(faculty.dept);
  const [assignedCourses, setAssignedCourses] = useState([...faculty.assignedCourses]);
  const [assignedLabs, setAssignedLabs] = useState([...faculty.assignedLabs]);
  const [assignedSections, setAssignedSections] = useState([...faculty.assignedSections]);
  const [filterDept, setFilterDept] = useState(faculty.dept);

  const toggleCourse = (code, isLab) => {
    if (isLab) {
      setAssignedLabs(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
    } else {
      setAssignedCourses(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
    }
  };

  const toggleSection = (sec) => {
    setAssignedSections(prev => prev.includes(sec) ? prev.filter(s => s !== sec) : [...prev, sec]);
  };

  const handleSave = () => {
    onSave({
      dept: selectedDept,
      assignedCourses,
      assignedLabs,
      assignedSections,
    });
  };

  const availableCourses = COURSE_CATALOG.filter(c => filterDept === 'all' || c.dept === filterDept);

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        <h3 className="ad-modal-title">Assign Subjects &amp; Classes</h3>
        <p className="ad-modal-desc">
          Allocate teaching modules, theory courses, laboratory sessions, and class cohorts for <strong>{faculty.name}</strong> ({faculty.id}).
        </p>

        {/* Faculty Summary Header */}
        <div className="ad-assign-faculty-summary">
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ad-text-secondary)', fontWeight: 600 }}>Instructor</span>
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--ad-navy)' }}>{faculty.name}</h4>
          </div>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--ad-text-secondary)', fontWeight: 600 }}>Primary Department</span>
            <select
              className="ad-select"
              style={{ height: '34px', fontSize: '12.5px', marginTop: '2px' }}
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setFilterDept(e.target.value);
              }}
            >
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Course Catalog Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0 8px 0' }}>
          <span className="ad-form-label" style={{ margin: 0 }}>Select Courses &amp; Practical Laboratories:</span>
          <select
            className="ad-select"
            style={{ height: '30px', width: 'auto', fontSize: '11.5px' }}
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            <option value="all">View All Catalogs</option>
            {DEPARTMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.id} Dept Courses</option>
            ))}
          </select>
        </div>

        {/* Courses Checklist */}
        <div className="ad-assign-checklist-box" style={{ maxHeight: '200px' }}>
          {availableCourses.map(c => {
            const isLab = c.type === 'Lab';
            const isSelected = isLab ? assignedLabs.includes(c.code) : assignedCourses.includes(c.code);
            return (
              <label key={c.code} className="ad-assign-check-label">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCourse(c.code, isLab)}
                />
                <span className="font-mono ad-check-code">{c.code}</span>
                <span style={{ flex: 1 }}>{c.title}</span>
                <span className={`ad-type-badge ${isLab ? 'lab' : 'theory'}`}>{c.type}</span>
                <span className="ad-dept-pill font-mono">{c.dept}</span>
              </label>
            );
          })}
        </div>

        {/* Class Sections Checklist */}
        <div style={{ marginTop: '16px' }}>
          <label className="ad-form-label">Assign Class &amp; Lab Sections:</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            {SECTIONS_CATALOG.map(sec => {
              const isChecked = assignedSections.includes(sec);
              return (
                <label key={sec} className={`ad-section-check-pill ${isChecked ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSection(sec)}
                    style={{ display: 'none' }}
                  />
                  <span>{sec}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Allocation Summary Strip */}
        <div className="ad-allocation-summary-strip">
          <span>Allocated: <strong>{assignedCourses.length}</strong> Theory Courses · <strong>{assignedLabs.length}</strong> Labs · <strong>{assignedSections.length}</strong> Sections</span>
        </div>

        <div className="ad-modal-actions">
          <button type="button" className="ad-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ad-btn-primary" onClick={handleSave}>
            <CheckIcon size={15} />
            <span>Confirm Allocations</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ───────────────────────────────────────
function ResetPasswordModal({ faculty, onClose, onConfirm }) {
  const [newPassword, setNewPassword] = useState('Attentify#2026!k9');
  const [showPassword, setShowPassword] = useState(true);
  const [requireNextChange, setRequireNextChange] = useState(true);
  const [sendEmailNotice, setSendEmailNotice] = useState(true);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let res = 'Attentify#';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    onConfirm(newPassword, requireNextChange);
  };

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <h3 className="ad-modal-title">Reset Faculty Password</h3>
        <p className="ad-modal-desc">
          Generate temporary access credentials for <strong>{faculty.name}</strong> ({faculty.email}).
        </p>

        <form onSubmit={handleConfirm}>
          <div className="ad-form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="ad-form-label" style={{ margin: 0 }}>New Temporary Password</label>
              <button
                type="button"
                className="ad-link-btn"
                onClick={generatePassword}
              >
                ⟳ Generate New Random Password
              </button>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="ad-input font-mono"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--ad-text-secondary)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ad-navy)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={requireNextChange}
                onChange={e => setRequireNextChange(e.target.checked)}
              />
              <span>Require faculty to change password upon next login</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--ad-navy)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sendEmailNotice}
                onChange={e => setSendEmailNotice(e.target.checked)}
              />
              <span>Send credentials update notification to {faculty.email}</span>
            </label>
          </div>

          <div className="ad-modal-actions">
            <button type="button" className="ad-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ad-btn-primary">
              <KeyIcon size={15} />
              <span>Confirm Password Reset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Remove Faculty Modal ───────────────────────────────────────
function RemoveFacultyModal({ faculty, onClose, onConfirm }) {
  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="ad-danger-icon-circle">
          <TrashIcon size={24} color="var(--ad-error)" />
        </div>

        <h3 className="ad-modal-title" style={{ color: 'var(--ad-error)', marginTop: '8px' }}>
          Remove Faculty Account?
        </h3>

        <p className="ad-modal-desc">
          Are you sure you want to permanently delete the faculty record for <strong>{faculty.name}</strong> (Employee ID: <code>{faculty.id}</code>)?
        </p>

        <div className="ad-danger-notice-box">
          <p>
            <strong>Warning:</strong> This action will revoke faculty portal login access and unassign {faculty.assignedCourses.length} lecture courses and {faculty.assignedLabs.length} laboratory sessions.
          </p>
        </div>

        <div className="ad-modal-actions" style={{ marginTop: '20px' }}>
          <button type="button" className="ad-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ad-btn-primary"
            style={{ backgroundColor: 'var(--ad-error)' }}
            onClick={onConfirm}
          >
            <TrashIcon size={15} />
            <span>Confirm Removal</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TIMETABLE MANAGEMENT DATASETS & CATALOGS
// ═══════════════════════════════════════════════════════════════
const CLASSROOMS_CATALOG = [
  { id: 'R301', name: 'Room 301', type: 'Lecture Hall', capacity: 70, building: 'Main Academic Block' },
  { id: 'R302', name: 'Room 302', type: 'Lecture Hall', capacity: 70, building: 'Main Academic Block' },
  { id: 'R405', name: 'Room 405', type: 'Smart Classroom', capacity: 60, building: 'Science Annex' },
  { id: 'R406', name: 'Room 406', type: 'Lecture Hall', capacity: 65, building: 'Science Annex' },
  { id: 'L102', name: 'Computing Lab 1', type: 'Lab', capacity: 45, building: 'Turing Wing' },
  { id: 'L204', name: 'Hardware & DSP Lab', type: 'Lab', capacity: 35, building: 'Bose Block' },
  { id: 'L301', name: 'Microbiology Lab', type: 'Lab', capacity: 30, building: 'Bio-Research Center' },
  { id: 'SHA',  name: 'Seminar Hall A', type: 'Auditorium', capacity: 180, building: 'Admin Block' },
];

const TIME_SLOTS_CATALOG = [
  { id: '09:00-10:00', label: '09:00 AM - 10:00 AM', period: 1, type: 'academic' },
  { id: '10:00-11:00', label: '10:00 AM - 11:00 AM', period: 2, type: 'academic' },
  { id: '11:15-12:15', label: '11:15 AM - 12:15 PM', period: 3, type: 'academic' },
  { id: '12:15-13:15', label: '12:15 PM - 01:15 PM', period: 4, type: 'academic' },
  { id: '14:00-15:00', label: '02:00 PM - 03:00 PM', period: 5, type: 'academic' },
  { id: '15:00-16:00', label: '03:00 PM - 04:00 PM', period: 6, type: 'academic' },
  { id: '16:00-17:00', label: '04:00 PM - 05:00 PM', period: 7, type: 'academic' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SEMESTERS_CATALOG = [
  { id: 'Sem 1', name: 'Semester 1 (Year 1)' },
  { id: 'Sem 3', name: 'Semester 3 (Year 2)' },
  { id: 'Sem 5', name: 'Semester 5 (Year 3)' },
  { id: 'Sem 7', name: 'Semester 7 (Year 4)' },
];

const SESSION_TYPES = ['Lecture', 'Tutorial', 'Laboratory', 'Seminar'];

const INITIAL_TIMETABLE = [
  {
    id: 'TT-101',
    dept: 'CS',
    semester: 'Sem 5',
    section: 'Section A',
    courseCode: 'CS312',
    courseTitle: 'Database Management Systems',
    sessionType: 'Lecture',
    facultyId: 'FAC001',
    facultyName: 'Dr. Rajan Kumar',
    day: 'Monday',
    timeSlot: '09:00-10:00',
    roomId: 'R301',
    roomName: 'Room 301',
    status: 'published',
  },
  {
    id: 'TT-102',
    dept: 'CS',
    semester: 'Sem 7',
    section: 'Section A',
    courseCode: 'CS401',
    courseTitle: 'Artificial Intelligence & ML',
    sessionType: 'Lecture',
    facultyId: 'FAC001',
    facultyName: 'Dr. Rajan Kumar',
    day: 'Monday',
    timeSlot: '10:00-11:00',
    roomId: 'R302',
    roomName: 'Room 302',
    status: 'published',
  },
  {
    id: 'TT-103',
    dept: 'CS',
    semester: 'Sem 3',
    section: 'Section A',
    courseCode: 'CS101',
    courseTitle: 'Data Structures & Algorithms',
    sessionType: 'Lecture',
    facultyId: 'FAC003',
    facultyName: 'Avinash K P',
    day: 'Monday',
    timeSlot: '11:15-12:15',
    roomId: 'R301',
    roomName: 'Room 301',
    status: 'published',
  },
  {
    id: 'TT-104',
    dept: 'EC',
    semester: 'Sem 5',
    section: 'Section A',
    courseCode: 'EC201',
    courseTitle: 'Digital Signal Processing',
    sessionType: 'Lecture',
    facultyId: 'FAC002',
    facultyName: 'Prof. Meera Iyer',
    day: 'Tuesday',
    timeSlot: '09:00-10:00',
    roomId: 'R302',
    roomName: 'Room 302',
    status: 'published',
  },
  {
    id: 'TT-105',
    dept: 'CS',
    semester: 'Sem 3',
    section: 'Section A',
    courseCode: 'CS101L',
    courseTitle: 'Data Structures Laboratory',
    sessionType: 'Laboratory',
    facultyId: 'FAC003',
    facultyName: 'Avinash K P',
    day: 'Tuesday',
    timeSlot: '14:00-15:00',
    roomId: 'L102',
    roomName: 'Computing Lab 1',
    status: 'published',
  },
  {
    id: 'TT-106',
    dept: 'CS',
    semester: 'Sem 5',
    section: 'Section B',
    courseCode: 'CS205',
    courseTitle: 'Operating Systems & Architecture',
    sessionType: 'Lecture',
    facultyId: 'FAC001',
    facultyName: 'Dr. Rajan Kumar',
    day: 'Wednesday',
    timeSlot: '09:00-10:00',
    roomId: 'R405',
    roomName: 'Room 405',
    status: 'published',
  },
  {
    id: 'TT-107',
    dept: 'CS',
    semester: 'Sem 5',
    section: 'Section A',
    courseCode: 'CS312',
    courseTitle: 'Database Management Systems',
    sessionType: 'Lecture',
    facultyId: 'FAC001',
    facultyName: 'Dr. Rajan Kumar',
    day: 'Wednesday',
    timeSlot: '10:00-11:00',
    roomId: 'R301',
    roomName: 'Room 301',
    status: 'published',
  },
  {
    id: 'TT-108',
    dept: 'EC',
    semester: 'Sem 5',
    section: 'Section B',
    courseCode: 'EC201',
    courseTitle: 'Digital Signal Processing',
    sessionType: 'Lecture',
    facultyId: 'FAC002',
    facultyName: 'Prof. Meera Iyer',
    day: 'Thursday',
    timeSlot: '11:15-12:15',
    roomId: 'R302',
    roomName: 'Room 302',
    status: 'published',
  },
  {
    id: 'TT-109',
    dept: 'CS',
    semester: 'Sem 5',
    section: 'Section A',
    courseCode: 'CS312L',
    courseTitle: 'DBMS Practical Laboratory',
    sessionType: 'Laboratory',
    facultyId: 'FAC001',
    facultyName: 'Dr. Rajan Kumar',
    day: 'Thursday',
    timeSlot: '14:00-15:00',
    roomId: 'L102',
    roomName: 'Computing Lab 1',
    status: 'published',
  },
  {
    id: 'TT-110',
    dept: 'CS',
    semester: 'Sem 7',
    section: 'Section A',
    courseCode: 'CS401',
    courseTitle: 'Artificial Intelligence & ML',
    sessionType: 'Lecture',
    facultyId: 'FAC001',
    facultyName: 'Dr. Rajan Kumar',
    day: 'Friday',
    timeSlot: '09:00-10:00',
    roomId: 'R301',
    roomName: 'Room 301',
    status: 'published',
  },
  {
    id: 'TT-111',
    dept: 'CS',
    semester: 'Sem 3',
    section: 'Section A',
    courseCode: 'CS101',
    courseTitle: 'Data Structures & Algorithms',
    sessionType: 'Lecture',
    facultyId: 'FAC003',
    facultyName: 'Avinash K P',
    day: 'Friday',
    timeSlot: '10:00-11:00',
    roomId: 'R301',
    roomName: 'Room 301',
    status: 'published',
  },
  {
    id: 'TT-112',
    dept: 'EC',
    semester: 'Sem 5',
    section: 'Section A',
    courseCode: 'EC201L',
    courseTitle: 'Signals & Hardware Lab',
    sessionType: 'Laboratory',
    facultyId: 'FAC002',
    facultyName: 'Prof. Meera Iyer',
    day: 'Friday',
    timeSlot: '14:00-15:00',
    roomId: 'L204',
    roomName: 'Hardware & DSP Lab',
    status: 'published',
  },
];

const INITIAL_CHANGE_REQUESTS = [
  {
    id: 'REQ-101',
    slotId: 'TT-107',
    facultyId: 'FAC001',
    facultyName: 'Dr. Rajan Kumar',
    dept: 'CS',
    subject: 'CS312 - Database Management Systems',
    currentSlot: { day: 'Wednesday', timeSlot: '10:00-11:00', roomId: 'R301', roomName: 'Room 301', section: 'Section A', semester: 'Sem 5' },
    proposedSlot: { day: 'Friday', timeSlot: '14:00-15:00', roomId: 'R302', roomName: 'Room 302', section: 'Section A', semester: 'Sem 5' },
    reason: 'Department Board of Studies review meeting scheduled for Wednesday 10 AM.',
    status: 'pending',
    submittedAt: '26 Oct 2026, 04:15 PM',
    adminRemarks: '',
  },
  {
    id: 'REQ-102',
    slotId: 'TT-105',
    facultyId: 'FAC003',
    facultyName: 'Avinash K P',
    dept: 'CS',
    subject: 'CS101L - Data Structures Laboratory',
    currentSlot: { day: 'Tuesday', timeSlot: '14:00-15:00', roomId: 'L102', roomName: 'Computing Lab 1', section: 'Section A', semester: 'Sem 3' },
    proposedSlot: { day: 'Thursday', timeSlot: '11:15-12:15', roomId: 'L102', roomName: 'Computing Lab 1', section: 'Section A', semester: 'Sem 3' },
    reason: 'Scheduled maintenance of server cluster in Lab 1 during Tuesday afternoon.',
    status: 'pending',
    submittedAt: '27 Oct 2026, 09:30 AM',
    adminRemarks: '',
  },
  {
    id: 'REQ-098',
    slotId: 'TT-104',
    facultyId: 'FAC002',
    facultyName: 'Prof. Meera Iyer',
    dept: 'EC',
    subject: 'EC201 - Digital Signal Processing',
    currentSlot: { day: 'Tuesday', timeSlot: '09:00-10:00', roomId: 'R302', roomName: 'Room 302', section: 'Section A', semester: 'Sem 5' },
    proposedSlot: { day: 'Tuesday', timeSlot: '11:15-12:15', roomId: 'R405', roomName: 'Room 405', section: 'Section A', semester: 'Sem 5' },
    reason: 'Guest lecture arranged on DSP algorithms with industry expert.',
    status: 'approved',
    submittedAt: '24 Oct 2026, 02:20 PM',
    adminRemarks: 'Approved. Classroom 405 confirmed available.',
  },
];

// Conflict Detection Engine
function detectSlotConflicts(candidate, allSlots, ignoreSlotId = null) {
  const conflicts = [];
  if (!candidate.day || !candidate.timeSlot) return conflicts;

  const others = allSlots.filter(s => s.id !== ignoreSlotId);
  for (const s of others) {
    if (s.day === candidate.day && s.timeSlot === candidate.timeSlot) {
      // 1. Faculty conflict
      if (candidate.facultyId && s.facultyId === candidate.facultyId) {
        conflicts.push({
          type: 'faculty',
          title: 'Faculty Double-Booking Conflict',
          severity: 'error',
          message: `${candidate.facultyName || 'Selected Faculty'} is already scheduled for ${s.courseCode} (${s.section}) in ${s.roomName} at this time.`,
          conflictingSlot: s,
        });
      }
      // 2. Room conflict
      if (candidate.roomId && s.roomId === candidate.roomId) {
        conflicts.push({
          type: 'classroom',
          title: 'Classroom Collision Conflict',
          severity: 'error',
          message: `${candidate.roomName || 'Selected Room'} is already booked for ${s.courseCode} (${s.facultyName}, ${s.section}) at this time.`,
          conflictingSlot: s,
        });
      }
      // 3. Section collision
      if (
        candidate.dept &&
        candidate.semester &&
        candidate.section &&
        s.dept === candidate.dept &&
        s.semester === candidate.semester &&
        s.section === candidate.section
      ) {
        conflicts.push({
          type: 'section',
          title: 'Section Schedule Collision',
          severity: 'error',
          message: `${candidate.dept} ${candidate.semester} ${candidate.section} already has a session (${s.courseCode} with ${s.facultyName}) at this time.`,
          conflictingSlot: s,
        });
      }
    }
  }
  return conflicts;
}

function findAllTimetableConflicts(allSlots) {
  const collisions = [];
  for (let i = 0; i < allSlots.length; i++) {
    for (let j = i + 1; j < allSlots.length; j++) {
      const a = allSlots[i];
      const b = allSlots[j];
      if (a.day === b.day && a.timeSlot === b.timeSlot) {
        if (a.facultyId && b.facultyId && a.facultyId === b.facultyId) {
          collisions.push({
            id: `c-fac-${a.id}-${b.id}`,
            type: 'faculty',
            title: 'Faculty Double-Booking',
            day: a.day,
            timeSlot: a.timeSlot,
            slotA: a,
            slotB: b,
            description: `${a.facultyName} is scheduled simultaneously for ${a.courseCode} (${a.roomName}) and ${b.courseCode} (${b.roomName}).`,
          });
        }
        if (a.roomId && b.roomId && a.roomId === b.roomId) {
          collisions.push({
            id: `c-room-${a.id}-${b.id}`,
            type: 'classroom',
            title: 'Classroom Collision',
            day: a.day,
            timeSlot: a.timeSlot,
            slotA: a,
            slotB: b,
            description: `${a.roomName} is booked for two classes at the same time: ${a.courseCode} and ${b.courseCode}.`,
          });
        }
        if (a.dept === b.dept && a.semester === b.semester && a.section === b.section) {
          collisions.push({
            id: `c-sec-${a.id}-${b.id}`,
            type: 'section',
            title: 'Section Schedule Overlap',
            day: a.day,
            timeSlot: a.timeSlot,
            slotA: a,
            slotB: b,
            description: `${a.dept} ${a.semester} ${a.section} has two lectures booked at this time: ${a.courseCode} and ${b.courseCode}.`,
          });
        }
      }
    }
  }
  return collisions;
}

// ═══════════════════════════════════════════════════════════════
//  MODAL: CREATE / EDIT TIMETABLE SLOT
// ═══════════════════════════════════════════════════════════════
function CreateEditSlotModal({
  isOpen,
  onClose,
  onSave,
  editingSlot,
  initialDefaults,
  timetableList,
  facultyList,
}) {
  if (!isOpen) return null;

  const defaultDept = initialDefaults?.dept || editingSlot?.dept || 'CS';
  const defaultCourses = COURSE_CATALOG.filter(c => c.dept === defaultDept);

  const [form, setForm] = useState({
    dept: defaultDept,
    semester: editingSlot?.semester || initialDefaults?.semester || 'Sem 5',
    section: editingSlot?.section || initialDefaults?.section || 'Section A',
    courseCode: editingSlot?.courseCode || defaultCourses[0]?.code || 'CS312',
    sessionType: editingSlot?.sessionType || defaultCourses[0]?.type || 'Lecture',
    facultyId: editingSlot?.facultyId || facultyList.find(f => f.dept === defaultDept)?.id || facultyList[0]?.id || 'FAC001',
    day: editingSlot?.day || initialDefaults?.day || 'Monday',
    timeSlot: editingSlot?.timeSlot || initialDefaults?.timeSlot || '09:00-10:00',
    roomId: editingSlot?.roomId || 'R301',
  });

  const [overrideWarning, setOverrideWarning] = useState(false);

  // Auto-update courses when department changes
  const handleDeptChange = (dept) => {
    const deptCourses = COURSE_CATALOG.filter(c => c.dept === dept);
    const deptFaculty = facultyList.filter(f => f.dept === dept);
    setForm(prev => ({
      ...prev,
      dept,
      courseCode: deptCourses[0]?.code || '',
      sessionType: deptCourses[0]?.type || 'Lecture',
      facultyId: deptFaculty[0]?.id || facultyList[0]?.id || '',
    }));
  };

  const handleCourseChange = (code) => {
    const course = COURSE_CATALOG.find(c => c.code === code);
    setForm(prev => ({
      ...prev,
      courseCode: code,
      sessionType: course?.type === 'Lab' ? 'Laboratory' : 'Lecture',
    }));
  };

  // Live conflict evaluation
  const activeConflicts = useMemo(() => {
    const facultyObj = facultyList.find(f => f.id === form.facultyId);
    const roomObj = CLASSROOMS_CATALOG.find(r => r.id === form.roomId);
    const courseObj = COURSE_CATALOG.find(c => c.code === form.courseCode);

    const candidate = {
      ...form,
      facultyName: facultyObj?.name || 'Selected Faculty',
      roomName: roomObj?.name || 'Selected Room',
      courseTitle: courseObj?.title || form.courseCode,
    };
    return detectSlotConflicts(candidate, timetableList, editingSlot?.id);
  }, [form, timetableList, editingSlot, facultyList]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeConflicts.length > 0 && !overrideWarning) {
      alert('Please review and resolve the scheduling conflicts or check the override authorization box before saving.');
      return;
    }

    const facultyObj = facultyList.find(f => f.id === form.facultyId);
    const roomObj = CLASSROOMS_CATALOG.find(r => r.id === form.roomId);
    const courseObj = COURSE_CATALOG.find(c => c.code === form.courseCode);

    onSave({
      ...form,
      facultyName: facultyObj?.name || 'Instructor',
      roomName: roomObj?.name || form.roomId,
      courseTitle: courseObj?.title || form.courseCode,
      status: 'published',
    });
  };

  const selectedRoom = CLASSROOMS_CATALOG.find(r => r.id === form.roomId);

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card ad-modal-large" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className="ad-modal-title">
            {editingSlot ? 'Edit Timetable Session' : 'Schedule Timetable Session'}
          </h3>
          <span className="ad-type-badge theory" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
            {editingSlot ? editingSlot.id : 'New Slot'}
          </span>
        </div>
        <p className="ad-modal-desc">
          Assign subject, instructor, semester, section, classroom, and weekly time slot with real-time conflict checking.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Live Conflict Banner */}
          {activeConflicts.length > 0 && (
            <div className="ad-conflict-alert-box">
              <div className="ad-conflict-alert-header">
                <AlertTriangleIcon size={16} color="#B5822C" />
                <span>Scheduling Conflict Warning ({activeConflicts.length})</span>
              </div>
              <div className="ad-conflict-alert-list">
                {activeConflicts.map((c, idx) => (
                  <div key={idx} className="ad-conflict-item">
                    <strong>{c.title}:</strong> {c.message}
                  </div>
                ))}
              </div>
              <label className="ad-override-check-label">
                <input
                  type="checkbox"
                  checked={overrideWarning}
                  onChange={e => setOverrideWarning(e.target.checked)}
                />
                <span>Acknowledge scheduling warning and proceed (e.g. combined elective/joint seminar)</span>
              </label>
            </div>
          )}

          <div className="ad-form-grid-2">
            {/* Department */}
            <div className="ad-form-group">
              <label className="ad-form-label">Department</label>
              <select
                className="ad-select"
                value={form.dept}
                onChange={e => handleDeptChange(e.target.value)}
                required
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>{d.id} — {d.name}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div className="ad-form-group">
              <label className="ad-form-label">Semester</label>
              <select
                className="ad-select"
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                required
              >
                {SEMESTERS_CATALOG.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ad-form-grid-2">
            {/* Class & Section */}
            <div className="ad-form-group">
              <label className="ad-form-label">Class Section / Batch</label>
              <select
                className="ad-select"
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                required
              >
                {SECTIONS_CATALOG.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Session Type */}
            <div className="ad-form-group">
              <label className="ad-form-label">Session Format</label>
              <select
                className="ad-select"
                value={form.sessionType}
                onChange={e => setForm(f => ({ ...f, sessionType: e.target.value }))}
                required
              >
                {SESSION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject / Course */}
          <div className="ad-form-group">
            <label className="ad-form-label">Course / Subject</label>
            <select
              className="ad-select"
              value={form.courseCode}
              onChange={e => handleCourseChange(e.target.value)}
              required
            >
              {COURSE_CATALOG.filter(c => c.dept === form.dept).map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.title} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Instructor */}
          <div className="ad-form-group">
            <label className="ad-form-label">Faculty Instructor</label>
            <select
              className="ad-select"
              value={form.facultyId}
              onChange={e => setForm(f => ({ ...f, facultyId: e.target.value }))}
              required
            >
              {facultyList.map(fac => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.dept} · {fac.designation})
                </option>
              ))}
            </select>
          </div>

          <div className="ad-form-grid-2">
            {/* Day of Week */}
            <div className="ad-form-group">
              <label className="ad-form-label">Day of Week</label>
              <select
                className="ad-select"
                value={form.day}
                onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                required
              >
                {DAYS_OF_WEEK.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div className="ad-form-group">
              <label className="ad-form-label">Time Slot</label>
              <select
                className="ad-select"
                value={form.timeSlot}
                onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}
                required
              >
                {TIME_SLOTS_CATALOG.map(t => (
                  <option key={t.id} value={t.id}>{t.label} (Period {t.period})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Classroom / Laboratory */}
          <div className="ad-form-group">
            <label className="ad-form-label">
              Classroom / Laboratory Location
              {selectedRoom && (
                <span style={{ fontWeight: 400, color: 'var(--ad-text-secondary)', marginLeft: '8px' }}>
                  ({selectedRoom.capacity} seats · {selectedRoom.building})
                </span>
              )}
            </label>
            <select
              className="ad-select"
              value={form.roomId}
              onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
              required
            >
              {CLASSROOMS_CATALOG.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.type} ({r.capacity} seats, {r.building})
                </option>
              ))}
            </select>
          </div>

          <div className="ad-modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="ad-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="ad-btn-primary"
              disabled={activeConflicts.length > 0 && !overrideWarning}
            >
              <CheckIcon size={16} />
              <span>{editingSlot ? 'Update Session' : 'Save Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MODAL: PUBLISH / UPDATE TIMETABLE
// ═══════════════════════════════════════════════════════════════
function PublishTimetableModal({
  isOpen,
  onClose,
  onPublish,
  timetableList,
  publishedInfo,
  facultyList,
}) {
  if (!isOpen) return null;

  const [version, setVersion] = useState('v2.5 (Revised Fall 2026)');
  const [effectiveDate, setEffectiveDate] = useState('2026-11-02');
  const [notifyFaculty, setNotifyFaculty] = useState(true);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [syncDisplays, setSyncDisplays] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onPublish({ version, effectiveDate, notifyFaculty, notifyStudents, syncDisplays });
  };

  const uniqueRooms = new Set(timetableList.map(s => s.roomId)).size;
  const uniqueFaculty = new Set(timetableList.map(s => s.facultyId)).size;

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" onClick={e => e.stopPropagation()}>
        <h3 className="ad-modal-title">Publish Timetable Schedule</h3>
        <p className="ad-modal-desc">
          Publishing makes the weekly schedule active for faculty mark-attendance portals, student scanners, and digital displays.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="ad-assign-faculty-summary">
            <div className="ad-avatar-circle" style={{ backgroundColor: 'var(--ad-navy)' }}>
              <CalendarIcon size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ad-navy)' }}>
                Term Scope: {timetableList.length} Scheduled Sessions
              </div>
              <div style={{ fontSize: '12px', color: 'var(--ad-text-secondary)', marginTop: '2px' }}>
                {uniqueFaculty} Instructors Allocated · {uniqueRooms} Academic Rooms Utilized
              </div>
            </div>
          </div>

          <div className="ad-form-group">
            <label className="ad-form-label">Timetable Release Version</label>
            <input
              type="text"
              className="ad-input"
              value={version}
              onChange={e => setVersion(e.target.value)}
              required
            />
          </div>

          <div className="ad-form-group">
            <label className="ad-form-label">Effective From Date</label>
            <input
              type="date"
              className="ad-input"
              value={effectiveDate}
              onChange={e => setEffectiveDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <label className="ad-assign-check-label">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={notifyFaculty}
                  onChange={e => setNotifyFaculty(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: 'var(--ad-text-primary)' }}>
                  Send push notification & calendar sync to all assigned faculty ({uniqueFaculty})
                </span>
              </div>
            </label>

            <label className="ad-assign-check-label">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={e => setNotifyStudents(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: 'var(--ad-text-primary)' }}>
                  Broadcast timetable schedule updates to all enrolled student dashboards
                </span>
              </div>
            </label>

            <label className="ad-assign-check-label">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={syncDisplays}
                  onChange={e => setSyncDisplays(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: 'var(--ad-text-primary)' }}>
                  Synchronize physical classroom digital display signage boards
                </span>
              </div>
            </label>
          </div>

          <div className="ad-modal-actions" style={{ marginTop: '24px' }}>
            <button type="button" className="ad-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ad-btn-primary">
              <SendIcon size={15} />
              <span>Publish Schedule Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MODAL: REVIEW / HANDLE TIMETABLE CHANGE REQUEST
// ═══════════════════════════════════════════════════════════════
function ReviewChangeRequestModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  timetableList,
}) {
  if (!isOpen || !request) return null;

  const [remarks, setRemarks] = useState('');
  const [rejectMode, setRejectMode] = useState(false);

  // Proposed slot conflict pre-check
  const proposedConflicts = useMemo(() => {
    const candidate = {
      day: request.proposedSlot.day,
      timeSlot: request.proposedSlot.timeSlot,
      facultyId: request.facultyId,
      facultyName: request.facultyName,
      roomId: request.proposedSlot.roomId,
      roomName: request.proposedSlot.roomName,
      dept: request.dept,
      semester: request.proposedSlot.semester,
      section: request.proposedSlot.section,
    };
    return detectSlotConflicts(candidate, timetableList, request.slotId);
  }, [request, timetableList]);

  const hasConflicts = proposedConflicts.length > 0;

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card ad-modal-large" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 className="ad-modal-title">Review Timetable Change Request</h3>
          <span className={`ad-status-pill ${request.status}`}>
            <span className="ad-status-dot" />
            <span>{request.status.toUpperCase()}</span>
          </span>
        </div>
        <p className="ad-modal-desc">
          Request ID: <code>#{request.id}</code> · Submitted on {request.submittedAt}
        </p>

        {/* Faculty summary */}
        <div className="ad-assign-faculty-summary">
          <div className="ad-avatar-circle" style={{ backgroundColor: 'var(--ad-navy)' }}>
            {request.facultyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ad-navy)' }}>
              {request.facultyName} ({request.dept} Department)
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--ad-text-primary)', marginTop: '2px' }}>
              Subject: <strong>{request.subject}</strong>
            </div>
          </div>
        </div>

        {/* Current vs Proposed Grid */}
        <div className="ad-slot-compare-grid">
          <div className="ad-compare-card current">
            <span className="ad-compare-badge current">Current Slot</span>
            <div className="ad-compare-day">{request.currentSlot.day}</div>
            <div className="ad-compare-time">{request.currentSlot.timeSlot}</div>
            <div className="ad-compare-meta">
              <span>{request.currentSlot.roomName}</span> · <span>{request.currentSlot.semester} {request.currentSlot.section}</span>
            </div>
          </div>

          <div className="ad-compare-arrow">&rarr;</div>

          <div className="ad-compare-card proposed">
            <span className="ad-compare-badge proposed">Requested Slot</span>
            <div className="ad-compare-day">{request.proposedSlot.day}</div>
            <div className="ad-compare-time">{request.proposedSlot.timeSlot}</div>
            <div className="ad-compare-meta">
              <span>{request.proposedSlot.roomName}</span> · <span>{request.proposedSlot.semester} {request.proposedSlot.section}</span>
            </div>
          </div>
        </div>

        {/* Reason Box */}
        <div className="ad-request-reason-box">
          <span className="ad-reason-lbl">Reason Provided by Instructor:</span>
          <p className="ad-reason-text">"{request.reason}"</p>
        </div>

        {/* Conflict Pre-Check Banner */}
        {hasConflicts ? (
          <div className="ad-conflict-alert-box" style={{ marginTop: '16px' }}>
            <div className="ad-conflict-alert-header">
              <AlertTriangleIcon size={16} color="#B5822C" />
              <span>Scheduling Collision for Requested Slot:</span>
            </div>
            <div className="ad-conflict-alert-list">
              {proposedConflicts.map((c, idx) => (
                <div key={idx} className="ad-conflict-item">
                  <strong>{c.title}:</strong> {c.message}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="ad-conflict-clean-box" style={{ marginTop: '16px' }}>
            <CheckCircleIcon size={16} color="#2D634C" />
            <span>Feasibility Verified: Proposed room and instructor are free at that time (0 collisions).</span>
          </div>
        )}

        {/* Rejection Remarks Form */}
        {rejectMode && (
          <div className="ad-form-group" style={{ marginTop: '16px' }}>
            <label className="ad-form-label">Administrative Remarks / Reason for Rejection</label>
            <textarea
              className="ad-textarea"
              rows={3}
              placeholder="e.g. Requested classroom is reserved for university examination duty; please propose another slot."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              required
            />
          </div>
        )}

        <div className="ad-modal-actions" style={{ marginTop: '24px' }}>
          <button type="button" className="ad-btn-outline" onClick={onClose}>
            Close
          </button>

          {request.status === 'pending' && !rejectMode && (
            <>
              <button
                type="button"
                className="ad-btn-outline"
                style={{ color: '#C3665B', borderColor: 'rgba(195,102,91,0.4)' }}
                onClick={() => setRejectMode(true)}
              >
                <XCircleIcon size={16} />
                <span>Reject...</span>
              </button>
              <button
                type="button"
                className="ad-btn-primary"
                onClick={() => onApprove(request)}
              >
                <CheckCircleIcon size={16} />
                <span>Approve & Update Timetable</span>
              </button>
            </>
          )}

          {request.status === 'pending' && rejectMode && (
            <button
              type="button"
              className="ad-btn-danger"
              onClick={() => onReject(request, remarks)}
            >
              <XCircleIcon size={16} />
              <span>Confirm Rejection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MODAL: DELETE TIMETABLE SLOT CONFIRMATION
// ═══════════════════════════════════════════════════════════════
function DeleteSlotModal({ isOpen, onClose, slot, onConfirm }) {
  if (!isOpen || !slot) return null;

  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <div className="ad-modal-card" onClick={e => e.stopPropagation()}>
        <h3 className="ad-modal-title">Remove Scheduled Session?</h3>
        <p className="ad-modal-desc">
          Are you sure you want to remove <strong>{slot.courseCode} ({slot.courseTitle})</strong> on <strong>{slot.day} {slot.timeSlot}</strong> from <strong>{slot.roomName}</strong>?
        </p>

        <div className="ad-danger-notice-box">
          <p>
            <strong>Warning:</strong> This session will be removed from the active timetable and unlinked from {slot.facultyName}'s schedule.
          </p>
        </div>

        <div className="ad-modal-actions" style={{ marginTop: '20px' }}>
          <button type="button" className="ad-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ad-btn-danger"
            onClick={() => onConfirm(slot)}
          >
            <TrashIcon size={15} />
            <span>Confirm Deletion</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN TAB: TIMETABLE MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function TabTimetableManagement({
  timetableList,
  setTimetableList,
  changeRequests,
  setChangeRequests,
  timetablePublishedInfo,
  setTimetablePublishedInfo,
  facultyList,
  onShowToast,
}) {
  const [activeSubTab, setActiveSubTab] = useState('matrix'); // 'matrix', 'directory', 'conflicts', 'requests'

  // Filters
  const [filterDept, setFilterDept] = useState('all');
  const [filterSem, setFilterSem] = useState('all');
  const [filterSec, setFilterSec] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [matrixViewBy, setMatrixViewBy] = useState('class'); // 'class', 'faculty', 'room'
  const [requestFilter, setRequestFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  // Modals
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [initialSlotDefaults, setInitialSlotDefaults] = useState(null);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [reviewRequestModal, setReviewRequestModal] = useState(null);

  // Conflicts calculation across all slots
  const allConflicts = useMemo(() => {
    return findAllTimetableConflicts(timetableList);
  }, [timetableList]);

  // Pending change requests count
  const pendingRequestsCount = useMemo(() => {
    return changeRequests.filter(r => r.status === 'pending').length;
  }, [changeRequests]);

  // Filtered slots
  const filteredSlots = useMemo(() => {
    return timetableList.filter(slot => {
      if (filterDept !== 'all' && slot.dept !== filterDept) return false;
      if (filterSem !== 'all' && slot.semester !== filterSem) return false;
      if (filterSec !== 'all' && slot.section !== filterSec) return false;
      if (filterFaculty !== 'all' && slot.facultyId !== filterFaculty) return false;
      if (filterRoom !== 'all' && slot.roomId !== filterRoom) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          slot.courseCode.toLowerCase().includes(q) ||
          slot.courseTitle.toLowerCase().includes(q) ||
          slot.facultyName.toLowerCase().includes(q) ||
          slot.roomName.toLowerCase().includes(q) ||
          slot.section.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [timetableList, filterDept, filterSem, filterSec, filterFaculty, filterRoom, searchQuery]);

  // Unique metrics for KPI Strip
  const totalSlotsCount = timetableList.length;
  const uniqueFacultyCount = useMemo(() => new Set(timetableList.map(s => s.facultyId).filter(Boolean)).size, [timetableList]);
  const uniqueRoomsCount = useMemo(() => new Set(timetableList.map(s => s.roomId).filter(Boolean)).size, [timetableList]);

  // Handlers for Add / Edit / Delete
  const handleOpenAddSlot = (defaults = null) => {
    setEditingSlot(null);
    setInitialSlotDefaults(defaults);
    setSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot) => {
    setEditingSlot(slot);
    setInitialSlotDefaults(null);
    setSlotModalOpen(true);
  };

  const handleSaveSlot = (slotData) => {
    if (editingSlot) {
      setTimetableList(prev => prev.map(s => s.id === editingSlot.id ? { ...slotData, id: s.id } : s));
      onShowToast(`✓ Timetable session ${slotData.courseCode} updated.`);
    } else {
      const newId = `TT-${String(Date.now()).slice(-4)}`;
      setTimetableList(prev => [...prev, { ...slotData, id: newId }]);
      onShowToast(`✓ New session ${slotData.courseCode} scheduled.`);
    }
    setSlotModalOpen(false);
  };

  const handleDeleteSlot = (slot) => {
    setTimetableList(prev => prev.filter(s => s.id !== slot.id));
    setDeleteConfirmSlot(null);
    onShowToast(`🗑 Timetable slot ${slot.courseCode} removed.`);
  };

  // Change request approve/reject
  const handleApproveRequest = (request) => {
    const candidate = {
      day: request.proposedSlot.day,
      timeSlot: request.proposedSlot.timeSlot,
      facultyId: request.facultyId,
      facultyName: request.facultyName,
      roomId: request.proposedSlot.roomId,
      roomName: request.proposedSlot.roomName,
      dept: request.dept,
      semester: request.proposedSlot.semester,
      section: request.proposedSlot.section,
    };
    const conflicts = detectSlotConflicts(candidate, timetableList, request.slotId);
    if (conflicts.length > 0) {
      if (!window.confirm(`⚠️ Scheduling Conflict Warning:\n${conflicts[0].message}\n\nDo you want to proceed and approve anyway?`)) {
        return;
      }
    }

    setTimetableList(prev => prev.map(slot => {
      if (slot.id === request.slotId) {
        return {
          ...slot,
          day: request.proposedSlot.day,
          timeSlot: request.proposedSlot.timeSlot,
          roomId: request.proposedSlot.roomId,
          roomName: request.proposedSlot.roomName,
        };
      }
      return slot;
    }));

    setChangeRequests(prev => prev.map(r => r.id === request.id ? {
      ...r,
      status: 'approved',
      adminRemarks: 'Approved by Administrator. Timetable automatically synced.',
    } : r));

    setReviewRequestModal(null);
    onShowToast(`✓ Change Request #${request.id} approved! Timetable updated.`);
  };

  const handleRejectRequest = (request, remarks) => {
    setChangeRequests(prev => prev.map(r => r.id === request.id ? {
      ...r,
      status: 'rejected',
      adminRemarks: remarks || 'Declined by Administrator.',
    } : r));
    setReviewRequestModal(null);
    onShowToast(`✕ Change Request #${request.id} rejected.`);
  };

  // Publish timetable
  const handlePublishTimetable = ({ version, effectiveDate }) => {
    setTimetableList(prev => prev.map(s => ({ ...s, status: 'published' })));
    setTimetablePublishedInfo({
      version,
      effectiveDate,
      publishedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      isDraft: false,
    });
    setPublishModalOpen(false);
    onShowToast(`🚀 Timetable ${version} published! Notifications broadcasted.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Slot ID', 'Day', 'Time Slot', 'Department', 'Semester', 'Section', 'Course Code', 'Course Title', 'Type', 'Faculty ID', 'Faculty Name', 'Classroom', 'Status'];
    const rows = filteredSlots.map(s => [
      s.id,
      s.day,
      s.timeSlot,
      s.dept,
      s.semester,
      s.section,
      s.courseCode,
      `"${s.courseTitle}"`,
      s.sessionType,
      s.facultyId,
      `"${s.facultyName}"`,
      `"${s.roomName}"`,
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attentify_timetable_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('📥 Timetable exported as CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Check if a specific slot ID has a collision in allConflicts
  const slotHasConflict = (slotId) => {
    return allConflicts.some(c => c.slotA.id === slotId || c.slotB.id === slotId);
  };

  return (
    <div className="ad-tab-content">
      {/* ── Page Header & Quick Actions ── */}
      <div className="ad-welcome-header">
        <div>
          <h1 className="ad-welcome-title">Timetable Management</h1>
          <p className="ad-welcome-date">
            Academic Schedule & Scheduling Engine · Active Release: <strong>{timetablePublishedInfo.version}</strong>
          </p>
        </div>
        <div className="ad-welcome-actions">
          <button
            type="button"
            className="ad-btn-outline"
            onClick={handleExportCSV}
            title="Download Timetable CSV"
          >
            <DownloadIcon size={16} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="ad-btn-outline"
            onClick={handlePrint}
            title="Print printable timetable grid"
          >
            <PrinterIcon size={16} />
            <span>Print</span>
          </button>
          <button
            type="button"
            className="ad-btn-outline"
            onClick={() => setPublishModalOpen(true)}
            title="Publish or update timetable to faculty and students"
          >
            <SendIcon size={16} />
            <span>Publish Schedule</span>
          </button>
          <button
            type="button"
            className="ad-btn-primary"
            onClick={() => handleOpenAddSlot()}
            title="Add a new class or lab slot"
          >
            <PlusIcon size={16} />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metric Strip ── */}
      <div className="ad-faculty-kpi-strip">
        <div className="ad-fk-card">
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Scheduled Sessions</span>
            <CalendarIcon size={17} color="#162F44" />
          </div>
          <div className="ad-fk-val">{totalSlotsCount}</div>
          <div className="ad-fk-sub">Across 6 academic depts</div>
        </div>

        <div className="ad-fk-card">
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Instructors Assigned</span>
            <UsersIcon size={17} color="#557E6D" />
          </div>
          <div className="ad-fk-val">{uniqueFacultyCount}</div>
          <div className="ad-fk-sub">Active faculty members</div>
        </div>

        <div className="ad-fk-card">
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Rooms & Labs Allocated</span>
            <BuildingIcon size={17} color="#6B8294" />
          </div>
          <div className="ad-fk-val">{uniqueRoomsCount}</div>
          <div className="ad-fk-sub">Across campus blocks</div>
        </div>

        <div
          className="ad-fk-card"
          onClick={() => setActiveSubTab(allConflicts.length > 0 ? 'conflicts' : 'requests')}
          style={{ cursor: 'pointer' }}
          title={allConflicts.length > 0 ? "Click to view scheduling conflicts" : "Click to view change requests"}
        >
          <div className="ad-fk-top">
            <span className="ad-fk-lbl">Conflicts & Requests</span>
            {allConflicts.length > 0 ? (
              <AlertTriangleIcon size={17} color="#C3665B" />
            ) : (
              <CheckCircleIcon size={17} color="#557E6D" />
            )}
          </div>
          <div className="ad-fk-val" style={{ color: allConflicts.length > 0 ? '#C3665B' : 'inherit' }}>
            {allConflicts.length > 0 ? `${allConflicts.length} Conflict` : `${pendingRequestsCount} Pending`}
          </div>
          <div className="ad-fk-sub" style={{ color: allConflicts.length > 0 ? '#C3665B' : '#557E6D', fontWeight: 600 }}>
            {allConflicts.length > 0 ? 'Requires Resolution →' : 'Zero Collisions · All Clear'}
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Bar ── */}
      <div className="ad-timetable-subnav">
        <button
          type="button"
          className={`ad-tt-subnav-btn ${activeSubTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('matrix')}
        >
          <CalendarIcon size={16} />
          <span>Weekly Timetable Matrix</span>
        </button>

        <button
          type="button"
          className={`ad-tt-subnav-btn ${activeSubTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('directory')}
        >
          <ClipboardListIcon size={16} />
          <span>Session Directory</span>
        </button>

        <button
          type="button"
          className={`ad-tt-subnav-btn ${activeSubTab === 'conflicts' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('conflicts')}
        >
          <AlertTriangleIcon size={16} />
          <span>Conflict Inspector</span>
          {allConflicts.length > 0 && (
            <span className="ad-tt-badge-count danger">{allConflicts.length}</span>
          )}
        </button>

        <button
          type="button"
          className={`ad-tt-subnav-btn ${activeSubTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('requests')}
        >
          <FileTextIcon size={16} />
          <span>Change Requests</span>
          {pendingRequestsCount > 0 && (
            <span className="ad-tt-badge-count">{pendingRequestsCount}</span>
          )}
        </button>
      </div>

      {/* ── Filters Toolbar ── */}
      <div className="ad-faculty-toolbar">
        <div className="ad-search-box-wrap">
          <span className="ad-search-icon-abs">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#758087" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="ad-search-input"
            placeholder="Search by course, faculty, room or section..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="ad-search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="ad-toolbar-filters">
          {/* Department */}
          <div className="ad-filter-select-wrap">
            <span className="ad-filter-lbl">Dept:</span>
            <select
              className="ad-filter-select"
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
            >
              <option value="all">All Depts</option>
              {DEPARTMENTS.map(d => (
                <option key={d.id} value={d.id}>{d.id}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="ad-filter-select-wrap">
            <span className="ad-filter-lbl">Sem:</span>
            <select
              className="ad-filter-select"
              value={filterSem}
              onChange={e => setFilterSem(e.target.value)}
            >
              <option value="all">All Semesters</option>
              {SEMESTERS_CATALOG.map(s => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>

          {/* Section */}
          <div className="ad-filter-select-wrap">
            <span className="ad-filter-lbl">Section:</span>
            <select
              className="ad-filter-select"
              value={filterSec}
              onChange={e => setFilterSec(e.target.value)}
            >
              <option value="all">All Sections</option>
              {SECTIONS_CATALOG.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Matrix view selector */}
          {activeSubTab === 'matrix' && (
            <div className="ad-filter-select-wrap">
              <span className="ad-filter-lbl">View By:</span>
              <select
                className="ad-filter-select"
                value={matrixViewBy}
                onChange={e => setMatrixViewBy(e.target.value)}
              >
                <option value="class">Class & Section</option>
                <option value="faculty">Faculty Instructor</option>
                <option value="room">Classroom & Lab</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-Tab 1: Weekly Timetable Matrix ── */}
      {activeSubTab === 'matrix' && (
        <div className="ad-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 className="ad-panel-title">Weekly Schedule Matrix</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--ad-text-secondary)', marginTop: '2px' }}>
                Click any slot to edit session details, or click on an empty cell (+) to schedule a class at that time.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="ad-course-code-badge theory">Theory Lecture</span>
              <span className="ad-course-code-badge lab">Practical Lab</span>
              {allConflicts.length > 0 && (
                <span className="ad-course-code-badge" style={{ backgroundColor: '#F8EEEB', color: '#C3665B', border: '1px solid rgba(195,102,91,0.3)' }}>
                  ⚠️ Conflict Alert
                </span>
              )}
            </div>
          </div>

          <div className="ad-timetable-grid-wrap">
            <table className="ad-timetable-matrix-table">
              <thead>
                <tr>
                  <th className="ad-tt-col-day">Day / Time</th>
                  <th>09:00 - 10:00<div className="ad-tt-period-lbl">Period 1</div></th>
                  <th>10:00 - 11:00<div className="ad-tt-period-lbl">Period 2</div></th>
                  <th className="ad-tt-break-col">11:00 - 11:15<div className="ad-tt-period-lbl">Tea Break</div></th>
                  <th>11:15 - 12:15<div className="ad-tt-period-lbl">Period 3</div></th>
                  <th>12:15 - 01:15<div className="ad-tt-period-lbl">Period 4</div></th>
                  <th className="ad-tt-break-col">01:15 - 02:00<div className="ad-tt-period-lbl">Lunch Break</div></th>
                  <th>02:00 - 03:00<div className="ad-tt-period-lbl">Period 5</div></th>
                  <th>03:00 - 04:00<div className="ad-tt-period-lbl">Period 6</div></th>
                  <th>04:00 - 05:00<div className="ad-tt-period-lbl">Period 7</div></th>
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map(day => (
                  <tr key={day}>
                    <td className="ad-tt-day-cell">
                      <div className="ad-tt-day-name">{day}</div>
                      <div className="ad-tt-day-sub">
                        {filteredSlots.filter(s => s.day === day).length} Classes
                      </div>
                    </td>

                    {/* Period 1 */}
                    <SlotCell
                      day={day}
                      timeSlot="09:00-10:00"
                      slots={filteredSlots}
                      hasConflict={slotHasConflict}
                      onEdit={handleOpenEditSlot}
                      onDelete={setDeleteConfirmSlot}
                      onAdd={handleOpenAddSlot}
                    />

                    {/* Period 2 */}
                    <SlotCell
                      day={day}
                      timeSlot="10:00-11:00"
                      slots={filteredSlots}
                      hasConflict={slotHasConflict}
                      onEdit={handleOpenEditSlot}
                      onDelete={setDeleteConfirmSlot}
                      onAdd={handleOpenAddSlot}
                    />

                    {/* Tea Break Pillar */}
                    <td className="ad-tt-break-cell" title="Tea & Refreshment Break">
                      <div className="ad-tt-break-text">☕ BREAK</div>
                    </td>

                    {/* Period 3 */}
                    <SlotCell
                      day={day}
                      timeSlot="11:15-12:15"
                      slots={filteredSlots}
                      hasConflict={slotHasConflict}
                      onEdit={handleOpenEditSlot}
                      onDelete={setDeleteConfirmSlot}
                      onAdd={handleOpenAddSlot}
                    />

                    {/* Period 4 */}
                    <SlotCell
                      day={day}
                      timeSlot="12:15-13:15"
                      slots={filteredSlots}
                      hasConflict={slotHasConflict}
                      onEdit={handleOpenEditSlot}
                      onDelete={setDeleteConfirmSlot}
                      onAdd={handleOpenAddSlot}
                    />

                    {/* Lunch Break Pillar */}
                    <td className="ad-tt-break-cell" title="Lunch Break">
                      <div className="ad-tt-break-text">🍱 LUNCH</div>
                    </td>

                    {/* Period 5 */}
                    <SlotCell
                      day={day}
                      timeSlot="14:00-15:00"
                      slots={filteredSlots}
                      hasConflict={slotHasConflict}
                      onEdit={handleOpenEditSlot}
                      onDelete={setDeleteConfirmSlot}
                      onAdd={handleOpenAddSlot}
                    />

                    {/* Period 6 */}
                    <SlotCell
                      day={day}
                      timeSlot="15:00-16:00"
                      slots={filteredSlots}
                      hasConflict={slotHasConflict}
                      onEdit={handleOpenEditSlot}
                      onDelete={setDeleteConfirmSlot}
                      onAdd={handleOpenAddSlot}
                    />

                    {/* Period 7 */}
                    <SlotCell
                      day={day}
                      timeSlot="16:00-17:00"
                      slots={filteredSlots}
                      hasConflict={slotHasConflict}
                      onEdit={handleOpenEditSlot}
                      onDelete={setDeleteConfirmSlot}
                      onAdd={handleOpenAddSlot}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Sub-Tab 2: Session Directory (Table View) ── */}
      {activeSubTab === 'directory' && (
        <div className="ad-card" style={{ padding: '0' }}>
          <div style={{ padding: '18px 24px 14px 24px', borderBottom: '1px solid var(--ad-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="ad-panel-title">All Timetable Sessions ({filteredSlots.length})</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--ad-text-secondary)', marginTop: '2px' }}>
                Complete registry of lectures and laboratories scheduled across departments and rooms.
              </p>
            </div>
            <button
              type="button"
              className="ad-btn-outline"
              onClick={handleExportCSV}
            >
              <DownloadIcon size={15} />
              <span>Download CSV</span>
            </button>
          </div>

          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Day & Time</th>
                  <th>Course / Subject</th>
                  <th>Class / Section</th>
                  <th>Faculty Instructor</th>
                  <th>Room / Lab</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="ad-table-empty-wrap">
                      <p style={{ color: 'var(--ad-text-secondary)', fontSize: '13.5px' }}>
                        No timetable slots match the current filter criteria.
                      </p>
                      <button
                        type="button"
                        className="ad-link-btn"
                        style={{ marginTop: '8px' }}
                        onClick={() => {
                          setFilterDept('all');
                          setFilterSem('all');
                          setFilterSec('all');
                          setSearchQuery('');
                        }}
                      >
                        Reset all filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredSlots.map(slot => {
                    const hasConflict = slotHasConflict(slot.id);
                    return (
                      <tr key={slot.id} style={hasConflict ? { backgroundColor: 'rgba(195,102,91,0.04)' } : undefined}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--ad-navy)', fontSize: '13.5px' }}>
                            {slot.day}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--ad-text-secondary)' }}>
                            {slot.timeSlot}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className={`ad-course-code-badge ${slot.sessionType === 'Laboratory' ? 'lab' : 'theory'}`}>
                              {slot.courseCode}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ad-navy)' }}>
                              {slot.courseTitle}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="ad-dept-pill" style={{ marginRight: '6px' }}>{slot.dept}</span>
                          <span style={{ fontSize: '12.5px', color: 'var(--ad-text-primary)' }}>
                            {slot.semester} · {slot.section}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="ad-avatar-circle" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                              {slot.facultyName.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ad-text-primary)' }}>
                              {slot.facultyName}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ad-navy)' }}>
                            {slot.roomName}
                          </span>
                        </td>

                        <td>
                          <span className={`ad-type-badge ${slot.sessionType === 'Laboratory' ? 'lab' : 'theory'}`}>
                            {slot.sessionType}
                          </span>
                        </td>

                        <td>
                          {hasConflict ? (
                            <span className="ad-status-pill inactive" title="Conflict detected with another session">
                              <span className="ad-status-dot" />
                              <span>Conflict</span>
                            </span>
                          ) : (
                            <span className="ad-status-pill active">
                              <span className="ad-status-dot" />
                              <span>Published</span>
                            </span>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div className="ad-action-btns-row" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="ad-action-icon-btn"
                              title="Edit slot details"
                              onClick={() => handleOpenEditSlot(slot)}
                            >
                              <EditIcon size={14} />
                            </button>
                            <button
                              type="button"
                              className="ad-action-icon-btn danger"
                              title="Delete this slot"
                              onClick={() => setDeleteConfirmSlot(slot)}
                            >
                              <TrashIcon size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Sub-Tab 3: Conflict Inspector ── */}
      {activeSubTab === 'conflicts' && (
        <div className="ad-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 className="ad-panel-title">Scheduling Conflict Inspector</h2>
              <p style={{ fontSize: '13px', color: 'var(--ad-text-secondary)', marginTop: '2px' }}>
                Automated multi-constraint conflict detector scanning faculty double-bookings, classroom overlaps, and section collisions.
              </p>
            </div>
            <button
              type="button"
              className="ad-btn-primary"
              onClick={() => handleOpenAddSlot()}
            >
              <PlusIcon size={15} />
              <span>Schedule New Slot</span>
            </button>
          </div>

          {allConflicts.length === 0 ? (
            <div className="ad-conflict-all-clear-box">
              <div className="ad-clear-icon-circle">
                <CheckCircleIcon size={32} color="#2D634C" />
              </div>
              <h3 style={{ fontFamily: 'var(--ad-font-serif)', fontSize: '20px', color: 'var(--ad-navy)', marginBottom: '6px' }}>
                All Clear: Zero Scheduling Collisions Detected
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--ad-text-secondary)', maxWidth: '520px', lineHeight: 1.5 }}>
                Every faculty instructor is scheduled for at most one class per time slot, and all classrooms have clean non-overlapping bookings across all {totalSlotsCount} sessions.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="ad-conflict-summary-banner">
                <AlertTriangleIcon size={20} color="#C3665B" />
                <div>
                  <strong>{allConflicts.length} Conflict(s) Require Resolution</strong>
                  <p style={{ fontSize: '12.5px', color: '#8F382E', margin: '2px 0 0 0' }}>
                    Double bookings may prevent faculty from starting attendance sessions or cause student room assignment confusion.
                  </p>
                </div>
              </div>

              {allConflicts.map((c, index) => (
                <div key={c.id || index} className="ad-conflict-card-row">
                  <div className="ad-conflict-card-left">
                    <span className="ad-conflict-type-pill">{c.title}</span>
                    <div className="ad-conflict-time-badge">
                      <ClockIcon size={14} />
                      <span>{c.day} · {c.timeSlot}</span>
                    </div>
                    <p className="ad-conflict-desc-text">{c.description}</p>
                  </div>

                  <div className="ad-conflict-slots-pair">
                    <div className="ad-conflict-slot-subcard">
                      <div className="ad-css-code">{c.slotA.courseCode} ({c.slotA.dept})</div>
                      <div className="ad-css-teacher">{c.slotA.facultyName}</div>
                      <div className="ad-css-meta">{c.slotA.roomName} · {c.slotA.section}</div>
                      <button
                        type="button"
                        className="ad-btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11.5px', marginTop: '6px' }}
                        onClick={() => handleOpenEditSlot(c.slotA)}
                      >
                        Reschedule Slot A
                      </button>
                    </div>

                    <div style={{ color: 'var(--ad-text-secondary)', fontWeight: 700, fontSize: '13px' }}>VS</div>

                    <div className="ad-conflict-slot-subcard">
                      <div className="ad-css-code">{c.slotB.courseCode} ({c.slotB.dept})</div>
                      <div className="ad-css-teacher">{c.slotB.facultyName}</div>
                      <div className="ad-css-meta">{c.slotB.roomName} · {c.slotB.section}</div>
                      <button
                        type="button"
                        className="ad-btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11.5px', marginTop: '6px' }}
                        onClick={() => handleOpenEditSlot(c.slotB)}
                      >
                        Reschedule Slot B
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Sub-Tab 4: Change Requests Queue ── */}
      {activeSubTab === 'requests' && (
        <div className="ad-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="ad-panel-title">Faculty Timetable Change Requests</h2>
              <p style={{ fontSize: '13px', color: 'var(--ad-text-secondary)', marginTop: '2px' }}>
                Review and approve faculty reschedule and classroom swap proposals with one-click schedule updates.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['all', 'pending', 'approved', 'rejected'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`ad-section-check-pill ${requestFilter === st ? 'active' : ''}`}
                  onClick={() => setRequestFilter(st)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {st === 'pending' ? `Pending (${pendingRequestsCount})` : st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {changeRequests
              .filter(r => requestFilter === 'all' || r.status === requestFilter)
              .map(request => (
                <div key={request.id} className="ad-request-card">
                  <div className="ad-request-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="ad-avatar-circle" style={{ backgroundColor: 'var(--ad-navy)' }}>
                        {request.facultyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--ad-navy)' }}>
                          {request.facultyName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ad-text-secondary)' }}>
                          {request.dept} Department · Request ID: <code>#{request.id}</code> · Submitted {request.submittedAt}
                        </div>
                      </div>
                    </div>

                    <span className={`ad-status-pill ${request.status}`}>
                      <span className="ad-status-dot" />
                      <span>{request.status.toUpperCase()}</span>
                    </span>
                  </div>

                  <div className="ad-slot-compare-grid" style={{ margin: '14px 0' }}>
                    <div className="ad-compare-card current">
                      <span className="ad-compare-badge current">Current Slot</span>
                      <div className="ad-compare-day">{request.currentSlot.day}</div>
                      <div className="ad-compare-time">{request.currentSlot.timeSlot}</div>
                      <div className="ad-compare-meta">{request.currentSlot.roomName} · {request.subject}</div>
                    </div>

                    <div className="ad-compare-arrow">&rarr;</div>

                    <div className="ad-compare-card proposed">
                      <span className="ad-compare-badge proposed">Requested Slot</span>
                      <div className="ad-compare-day">{request.proposedSlot.day}</div>
                      <div className="ad-compare-time">{request.proposedSlot.timeSlot}</div>
                      <div className="ad-compare-meta">{request.proposedSlot.roomName} · {request.subject}</div>
                    </div>
                  </div>

                  <div className="ad-request-reason-box">
                    <span className="ad-reason-lbl">Instructor's Reason:</span>
                    <p className="ad-reason-text">"{request.reason}"</p>
                  </div>

                  {request.adminRemarks && (
                    <div style={{ marginTop: '8px', fontSize: '12.5px', color: 'var(--ad-text-secondary)', fontStyle: 'italic' }}>
                      Admin Remarks: "{request.adminRemarks}"
                    </div>
                  )}

                  <div className="ad-request-card-footer">
                    <button
                      type="button"
                      className="ad-btn-outline"
                      onClick={() => setReviewRequestModal(request)}
                    >
                      <FileTextIcon size={14} />
                      <span>{request.status === 'pending' ? 'Review & Decide...' : 'View Details'}</span>
                    </button>

                    {request.status === 'pending' && (
                      <button
                        type="button"
                        className="ad-btn-primary"
                        onClick={() => handleApproveRequest(request)}
                      >
                        <CheckCircleIcon size={14} />
                        <span>Quick Approve</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <CreateEditSlotModal
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        onSave={handleSaveSlot}
        editingSlot={editingSlot}
        initialDefaults={initialSlotDefaults}
        timetableList={timetableList}
        facultyList={facultyList}
      />

      <PublishTimetableModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handlePublishTimetable}
        timetableList={timetableList}
        publishedInfo={timetablePublishedInfo}
        facultyList={facultyList}
      />

      <ReviewChangeRequestModal
        isOpen={!!reviewRequestModal}
        onClose={() => setReviewRequestModal(null)}
        request={reviewRequestModal}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
        timetableList={timetableList}
      />

      <DeleteSlotModal
        isOpen={!!deleteConfirmSlot}
        onClose={() => setDeleteConfirmSlot(null)}
        slot={deleteConfirmSlot}
        onConfirm={handleDeleteSlot}
      />
    </div>
  );
}

// Helper cell component for the weekly timetable matrix
function SlotCell({ day, timeSlot, slots, hasConflict, onEdit, onDelete, onAdd }) {
  const matching = slots.filter(s => s.day === day && s.timeSlot === timeSlot);

  if (matching.length === 0) {
    return (
      <td
        className="ad-tt-empty-cell"
        onClick={() => onAdd({ day, timeSlot })}
        title={`Click to schedule class on ${day} at ${timeSlot}`}
      >
        <span className="ad-tt-cell-add-icon">+</span>
      </td>
    );
  }

  return (
    <td className="ad-tt-active-cell">
      <div className="ad-tt-cards-stack">
        {matching.map(slot => {
          const isConflicted = hasConflict(slot.id);
          return (
            <div
              key={slot.id}
              className={`ad-tt-session-card ${slot.sessionType === 'Laboratory' ? 'lab' : 'theory'} ${isConflicted ? 'conflicted' : ''}`}
            >
              <div className="ad-tt-sc-top">
                <span className="ad-tt-sc-code">{slot.courseCode}</span>
                <span className="ad-tt-sc-room">{slot.roomName}</span>
              </div>

              <div className="ad-tt-sc-title" title={slot.courseTitle}>
                {slot.courseTitle}
              </div>

              <div className="ad-tt-sc-bottom">
                <span className="ad-tt-sc-teacher">{slot.facultyName.split(' ')[0]} {slot.facultyName.split(' ')[1] || ''}</span>
                <span className="ad-tt-sc-sec">{slot.semester.replace('Semester ', 'S')} · {slot.section.replace('Section ', '')}</span>
              </div>

              {isConflicted && (
                <div className="ad-tt-sc-alert" title="Scheduling Conflict Detected!">
                  ⚠️ Conflict
                </div>
              )}

              {/* Hover quick action overlay */}
              <div className="ad-tt-sc-actions">
                <button
                  type="button"
                  className="ad-tt-sc-action-btn"
                  title="Edit session"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(slot);
                  }}
                >
                  <EditIcon size={12} />
                </button>
                <button
                  type="button"
                  className="ad-tt-sc-action-btn danger"
                  title="Remove session"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(slot);
                  }}
                >
                  <TrashIcon size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </td>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function TabUsers({ users, setUsers, onShowToast }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingFaceUser, setEditingFaceUser] = useState(null);
  const { register } = useAuth();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    dept: 'CS',
  });

  // State for face registration inside AddUserModal
  const [faceBlob, setFaceBlob] = useState(null);
  const [facePreview, setFacePreview] = useState(null);
  const [modalCameraActive, setModalCameraActive] = useState(false);
  const [modalStream, setModalStream] = useState(null);
  const modalVideoRef = React.useRef(null);

  const startModalCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      setModalStream(s);
      setModalCameraActive(true);
      if (modalVideoRef.current) {
        modalVideoRef.current.srcObject = s;
      }
    } catch (e) {
      onShowToast("❌ Camera error: " + e.message);
    }
  };

  const stopModalCamera = () => {
    if (modalStream) {
      modalStream.getTracks().forEach(t => t.stop());
      setModalStream(null);
    }
    setModalCameraActive(false);
  };

  useEffect(() => {
    if (modalVideoRef.current && modalStream) {
      modalVideoRef.current.srcObject = modalStream;
    }
  }, [modalStream, modalCameraActive]);

  useEffect(() => {
    return () => {
      if (modalStream) {
        modalStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [modalStream]);

  const captureModalSnapshot = () => {
    if (!modalVideoRef.current) return;
    const v = modalVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        setFaceBlob(blob);
        setFacePreview(URL.createObjectURL(blob));
        stopModalCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const clearModalFacePhoto = () => {
    setFaceBlob(null);
    setFacePreview(null);
    stopModalCamera();
  };

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch =
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchDept = deptFilter === 'all' || u.dept === deptFilter;
      return matchSearch && matchRole && matchDept;
    });
  }, [users, search, roleFilter, deptFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.password.length < 6) {
      onShowToast('❌ Password must be at least 6 characters');
      return;
    }
    try {
      await register(newUser.email, newUser.password, newUser.role, newUser.name, newUser.dept);
      const created = {
        ...newUser,
        id: `U${String(users.length + 1).padStart(3, '0')}`,
        status: 'active',
      };
      setUsers([created, ...users]);

      // If student and face photo was provided, register face in MongoDB
      if (newUser.role === 'student' && faceBlob) {
        try {
          const fd = new FormData();
          fd.append('file', faceBlob, 'face.jpg');
          fd.append('student_id', newUser.email);
          const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/attendance/face/register`, {
            method: 'POST',
            body: fd
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || "Failed to register face");
          onShowToast(`✅ Student "${newUser.name}" and Face Profile registered successfully!`);
        } catch (faceErr) {
          onShowToast(`⚠️ Student created, but Face Registration failed: ${faceErr.message}`);
        }
      } else {
        onShowToast(`✅ User "${newUser.name}" registered successfully`);
      }

      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'student', dept: 'CS' });
      clearModalFacePhoto();
    } catch (err) {
      onShowToast(`❌ Registration error: ${err.message}`);
    }
  };

  const handleToggleStatus = (id) => {
    setUsers(users.map(u => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)));
    onShowToast('Status updated');
  };

  return (
    <div className="ad-tab-content">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">User Management</h2>
          <p className="ad-section-sub">Manage system accounts, administrator privileges, and student registrations</p>
        </div>
        <button
          type="button"
          className="ad-btn-primary"
          onClick={() => {
            clearModalFacePhoto();
            setShowAddUserModal(true);
          }}
        >
          <UserPlusIcon size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="ad-input"
          style={{ maxWidth: '320px' }}
          placeholder="Search by name, email, or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="ad-select"
          style={{ maxWidth: '160px' }}
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Faculty</option>
          <option value="student">Student</option>
        </select>
        <select
          className="ad-select"
          style={{ maxWidth: '160px' }}
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="all">All Depts</option>
          {DEPARTMENTS.map(d => (
            <option key={d.id} value={d.id}>{d.id}</option>
          ))}
        </select>
      </div>

      <div className="ad-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ad-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Dept</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--ad-text-secondary)' }}>
                  No users found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id || u.email}>
                  <td><strong>{u.id}</strong></td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role === 'teacher' ? 'Faculty' : u.role}</td>
                  <td>{u.dept || '—'}</td>
                  <td>
                    <span className={`ad-badge ${u.status === 'inactive' ? 'inactive' : 'active'}`}>
                      {u.status === 'inactive' ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                      {u.role === 'student' && (
                        <button
                          type="button"
                          className="ad-btn-face"
                          onClick={() => setEditingFaceUser(u)}
                          title="Register or update biometric face profile"
                        >
                          <CameraIcon size={13} />
                          <span>Face ID</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="ad-btn-outline"
                        style={{ height: '30px', padding: '0 10px', fontSize: '11.5px', display: 'inline-flex' }}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === 'inactive' ? 'Activate' : 'Deactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="ad-modal-backdrop" onClick={() => { stopModalCamera(); setShowAddUserModal(false); }}>
          <div className="ad-modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="ad-modal-title">Create User Account</h3>
            <p className="ad-modal-desc">Register a new student, faculty member, or system administrator.</p>
            <form onSubmit={handleCreateUser}>
              <div className="ad-form-group">
                <label className="ad-form-label">Full Name</label>
                <input
                  type="text"
                  className="ad-input"
                  required
                  placeholder="e.g. Arjun Patel"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Email Address</label>
                <input
                  type="email"
                  className="ad-input"
                  required
                  placeholder="name@attentify.ac.in"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Role</label>
                <select
                  className="ad-select"
                  value={newUser.role}
                  onChange={e => {
                    const r = e.target.value;
                    setNewUser({ ...newUser, role: r });
                    if (r !== 'student') clearModalFacePhoto();
                  }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Faculty Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Department</label>
                <select
                  className="ad-select"
                  value={newUser.dept}
                  onChange={e => setNewUser({ ...newUser, dept: e.target.value })}
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                  ))}
                </select>
              </div>
              <div className="ad-form-group">
                <label className="ad-form-label">Password</label>
                <input
                  type="password"
                  className="ad-input"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>

              {/* Biometric Face Registration Section when role is Student */}
              {newUser.role === 'student' && (
                <div className="ad-face-enroll-box">
                  <div className="ad-face-enroll-header">
                    <div className="ad-face-enroll-title">
                      <CameraIcon size={15} color="#162F44" />
                      <span>Biometric Face Registration</span>
                    </div>
                    <span className="ad-face-badge">For Attendance</span>
                  </div>
                  <p className="ad-face-enroll-desc">
                    Capture a live frontal face photo using the camera for biometric AI verification. You can also register or update this anytime later from the table.
                  </p>

                  {facePreview ? (
                    <div className="ad-face-preview-box">
                      <div className="ad-face-preview-circle">
                        <img src={facePreview} alt="Face preview" className="ad-face-preview-img" />
                      </div>
                      <div className="ad-face-preview-info">
                        <span className="ad-face-preview-status">✅ Face Photo Selected</span>
                        <button
                          type="button"
                          className="ad-btn-outline"
                          style={{ height: '30px', fontSize: '12px' }}
                          onClick={clearModalFacePhoto}
                        >
                          Remove / Retake
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {modalCameraActive ? (
                        <div className="ad-camera-viewfinder-wrap">
                          <div className="ad-camera-preview-circle">
                            <video ref={modalVideoRef} autoPlay playsInline muted className="ad-camera-video" />
                          </div>
                          <div className="ad-camera-controls">
                            <button
                              type="button"
                              className="ad-btn-primary"
                              style={{ height: '32px', fontSize: '12px' }}
                              onClick={captureModalSnapshot}
                            >
                              📸 Snap Photo
                            </button>
                            <button
                              type="button"
                              className="ad-btn-outline"
                              style={{ height: '32px', fontSize: '12px' }}
                              onClick={stopModalCamera}
                            >
                              Cancel Camera
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="ad-btn-outline"
                          onClick={startModalCamera}
                          style={{ width: '100%', height: '36px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <CameraIcon size={15} />
                          <span>Take Webcam Photo</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="ad-modal-actions">
                <button
                  type="button"
                  className="ad-btn-outline"
                  onClick={() => { stopModalCamera(); setShowAddUserModal(false); }}
                >
                  Cancel
                </button>
                <button type="submit" className="ad-btn-primary">
                  Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Face Registration Modal for any Student */}
      {editingFaceUser && (
        <FaceRegistrationModal
          student={editingFaceUser}
          onClose={() => setEditingFaceUser(null)}
          onSuccess={(msg) => {
            setEditingFaceUser(null);
            onShowToast(msg);
          }}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: SETTINGS
// ═══════════════════════════════════════════════════════════════
function TabSettings({ onShowToast }) {
  const [minAttendance, setMinAttendance] = useState('75');
  const [qrDuration, setQrDuration] = useState('15');
  const [livenessStrictness, setLivenessStrictness] = useState('standard');

  const handleSave = (e) => {
    e.preventDefault();
    onShowToast('✅ Settings updated successfully');
  };

  return (
    <div className="ad-tab-content">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">System Settings</h2>
          <p className="ad-section-sub">Configure institution-wide attendance rules and security parameters</p>
        </div>
      </div>

      <div className="ad-card" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSave}>
          <div className="ad-form-group">
            <label className="ad-form-label">Minimum Attendance Threshold (%)</label>
            <input
              type="number"
              className="ad-input"
              value={minAttendance}
              onChange={e => setMinAttendance(e.target.value)}
              min="50"
              max="95"
            />
          </div>

          <div className="ad-form-group">
            <label className="ad-form-label">QR Code Dynamic Rotation (seconds)</label>
            <input
              type="number"
              className="ad-input"
              value={qrDuration}
              onChange={e => setQrDuration(e.target.value)}
              min="5"
              max="60"
            />
          </div>

          <div className="ad-form-group">
            <label className="ad-form-label">Face Verification Liveness Strictness</label>
            <select
              className="ad-select"
              value={livenessStrictness}
              onChange={e => setLivenessStrictness(e.target.value)}
            >
              <option value="relaxed">Relaxed (Single Blink Detection)</option>
              <option value="standard">Standard (Blink + Smile Challenge)</option>
              <option value="strict">Strict (Blink + Head Turn + Smile Challenge)</option>
            </select>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="ad-btn-primary">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN ADMIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('attentify_admin_sidebar_collapsed') === 'true';
      } catch (e) {}
    }
    return false;
  });

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      setSidebarOpen(o => !o);
    } else {
      setSidebarCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('attentify_admin_sidebar_collapsed', String(next));
        } catch (e) {}
        return next;
      });
    }
  };

  const [users, setUsers] = useState([
    { id: 'ADM001', name: 'Arjun Patel',    email: 'arjun.admin@attentify.ac.in',  role: 'admin',   dept: 'CS', status: 'active' },
    { id: 'FAC001', name: 'Dr. Rajan Kumar', email: 'rajan.kumar@attentify.ac.in',  role: 'teacher', dept: 'CS', status: 'active' },
    { id: 'FAC002', name: 'Prof. Meera Iyer', email: 'meera.iyer@attentify.ac.in',  role: 'teacher', dept: 'EC', status: 'active' },
    { id: 'STU001', name: 'Rahul Verma',    email: 'rahul.v@attentify.ac.in',     role: 'student', dept: 'CS', status: 'active' },
    { id: 'STU002', name: 'Priya Singh',    email: 'priya.s@attentify.ac.in',     role: 'student', dept: 'CS', status: 'inactive' },
    { id: 'STU003', name: 'Ananya Roy',     email: 'ananya.r@attentify.ac.in',    role: 'student', dept: 'BT', status: 'active' },
  ]);

  const [facultyList, setFacultyList] = useState(INITIAL_FACULTY);
  const [timetableList, setTimetableList] = useState(INITIAL_TIMETABLE);
  const [changeRequests, setChangeRequests] = useState(INITIAL_CHANGE_REQUESTS);
  const [timetablePublishedInfo, setTimetablePublishedInfo] = useState({
    version: 'v2.4 (Published)',
    effectiveDate: '2026-11-01',
    publishedAt: '24 Oct 2026, 11:00 AM',
    isDraft: false,
  });

  const [toastMessage, setToastMessage] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'broadcast', 'lock', 'logs', 'addDept', 'addUser'

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8000'}/auth/users`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((u, i) => ({
              ...u,
              id: u._id ? u._id.slice(-6).toUpperCase() : `U${String(i + 1).padStart(3, '0')}`,
              status: u.status || 'active',
              dept: u.dept || 'CS',
            }));
            setUsers(mapped);
          }
        }
      } catch (err) {
        console.warn("Using sample mock users (backend not reached):", err);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Quick Action handler
  const handleQuickAction = (action) => {
    if (action === 'addUser') {
      setActiveTab('users');
    } else if (action === 'addDept') {
      setActiveTab('departments');
    } else if (action === 'exportReport') {
      // Trigger CSV download
      const rows = [
        ['Department', 'Attendance %', 'Faculty', 'Students'],
        ...DEPARTMENTS.map(d => [d.name, `${d.avgAttend}%`, d.faculty, d.students]),
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'attentify_attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 Report exported: attentify_attendance_report.csv');
    } else if (action === 'broadcastAlert') {
      setActiveModal('broadcast');
    } else if (action === 'lockSystem') {
      setActiveModal('lock');
    } else if (action === 'viewLogs') {
      setActiveModal('logs');
    }
  };

  const currentTabLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Overview';
  const userInitials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AP';
  const userName = user?.name ? user.name.toUpperCase() : 'ARJUN P';

  return (
    <div className="ad-root">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="ad-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Left Sidebar (232px) ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div className="ad-sidebar-brand">
          <AttentifyLogo size={26} color="#162F44" />
          <span className="ad-sidebar-name">ATTENTIFY</span>
        </div>

        {/* Navigation Items */}
        <nav className="ad-sidebar-nav" aria-label="Main Navigation">
          {NAV_ITEMS.map(item => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`nav-${item.id}`}
                className={`ad-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="ad-nav-icon">
                  <IconComponent size={18} color={isActive ? '#162F44' : '#758087'} />
                </span>
                <span className="ad-nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="ad-sidebar-footer">
          <span className="ad-sidebar-tagline">ATTENDANCE, SIMPLIFIED.</span>
          <hr className="ad-sidebar-divider" />
          <div className="ad-user-chip">
            <div className="ad-user-avatar" aria-hidden="true">
              {userInitials}
            </div>
            <div className="ad-user-info">
              <span className="ad-user-name" title={userName}>{userName}</span>
              <span className="ad-user-role">Admin</span>
            </div>
            <button
              type="button"
              id="logout-btn"
              className="ad-logout-btn"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogoutIcon size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Dashboard Region ── */}
      <div className="ad-main-wrap">
        {/* Horizontal Top Navigation Bar (77px) */}
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button
              type="button"
              className={`ad-hamburger ${sidebarCollapsed ? 'sidebar-hidden' : ''}`}
              onClick={handleToggleSidebar}
              aria-label="Toggle navigation"
              title={sidebarCollapsed ? "Show Navigation Menu" : "Hide Navigation Menu"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20384D" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="ad-topbar-title">{currentTabLabel}</span>
          </div>

          <div className="ad-topbar-right">
            <span className="ad-topbar-date">Thu, 15 Oct</span>
            <span className="ad-role-badge">
              <ShieldCheckIcon size={15} color="#20384D" />
              <span>Admin</span>
            </span>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="ad-content">
          {activeTab === 'overview' && (
            <TabOverview
              user={user}
              users={users}
              onNav={setActiveTab}
              onQuickAction={handleQuickAction}
            />
          )}

          {activeTab === 'departments' && (
            <TabDepartments onShowToast={showToast} />
          )}

          {activeTab === 'faculty' && (
            <TabFacultyManagement
              facultyList={facultyList}
              setFacultyList={setFacultyList}
              users={users}
              setUsers={setUsers}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'timetable' && (
            <TabTimetableManagement
              timetableList={timetableList}
              setTimetableList={setTimetableList}
              changeRequests={changeRequests}
              setChangeRequests={setChangeRequests}
              timetablePublishedInfo={timetablePublishedInfo}
              setTimetablePublishedInfo={setTimetablePublishedInfo}
              facultyList={facultyList}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'users' && (
            <TabUsers
              users={users}
              setUsers={setUsers}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <TabSettings onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="ad-toast" role="alert">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Broadcast Alert */}
      {activeModal === 'broadcast' && (
        <div className="ad-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="ad-modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="ad-modal-title">Broadcast Alert</h3>
            <p className="ad-modal-desc">Send an immediate high-priority announcement to all faculty and student dashboards.</p>
            <div className="ad-form-group">
              <label className="ad-form-label">Alert Message</label>
              <textarea
                className="ad-textarea"
                placeholder="e.g. Server maintenance scheduled today at 11:00 PM."
                defaultValue="System maintenance update: Face recognition engine updated to v2.4."
              />
            </div>
            <div className="ad-modal-actions">
              <button
                type="button"
                className="ad-btn-outline"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ad-btn-primary"
                onClick={() => {
                  setActiveModal(null);
                  showToast('📢 Announcement broadcasted to all users');
                }}
              >
                Send Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Lock System */}
      {activeModal === 'lock' && (
        <div className="ad-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="ad-modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="ad-modal-title">Lock Administrator Console</h3>
            <p className="ad-modal-desc">
              Locking the session will require entering your administrator credentials to resume.
            </p>
            <div className="ad-modal-actions">
              <button
                type="button"
                className="ad-btn-outline"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ad-btn-primary"
                style={{ backgroundColor: '#b91c1c', borderColor: '#b91c1c' }}
                onClick={() => {
                  setActiveModal(null);
                  handleLogout();
                }}
              >
                Lock Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View Logs */}
      {activeModal === 'logs' && (
        <div className="ad-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="ad-modal-card" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <h3 className="ad-modal-title">System Audit Logs</h3>
            <p className="ad-modal-desc">Recent verified operational events and security checkpoints.</p>
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
              {ACTIVITY_LOG.map((item, idx) => (
                <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid var(--ad-border)', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--ad-text-secondary)', marginRight: '12px', fontSize: '11px' }}>{item.time}</span>
                  <span style={{ color: 'var(--ad-text-primary)' }}>{item.msg}</span>
                </div>
              ))}
            </div>
            <div className="ad-modal-actions">
              <button
                type="button"
                className="ad-btn-outline"
                onClick={() => setActiveModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
