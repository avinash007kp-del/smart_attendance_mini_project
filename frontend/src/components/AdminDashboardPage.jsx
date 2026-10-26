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
  { id: 'overview',    label: 'Overview',           icon: GridIcon     },
  { id: 'departments', label: 'Departments',        icon: BuildingIcon },
  { id: 'faculty',     label: 'Faculty Management', icon: IdCardIcon   },
  { id: 'users',       label: 'User Management',    icon: UsersIcon    },
  { id: 'settings',    label: 'Settings',           icon: SettingsIcon },
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
  const [users, setUsers] = useState([
    { id: 'ADM001', name: 'Arjun Patel',    email: 'arjun.admin@attentify.ac.in',  role: 'admin',   dept: 'CS', status: 'active' },
    { id: 'FAC001', name: 'Dr. Rajan Kumar', email: 'rajan.kumar@attentify.ac.in',  role: 'teacher', dept: 'CS', status: 'active' },
    { id: 'FAC002', name: 'Prof. Meera Iyer', email: 'meera.iyer@attentify.ac.in',  role: 'teacher', dept: 'EC', status: 'active' },
    { id: 'STU001', name: 'Rahul Verma',    email: 'rahul.v@attentify.ac.in',     role: 'student', dept: 'CS', status: 'active' },
    { id: 'STU002', name: 'Priya Singh',    email: 'priya.s@attentify.ac.in',     role: 'student', dept: 'CS', status: 'inactive' },
    { id: 'STU003', name: 'Ananya Roy',     email: 'ananya.r@attentify.ac.in',    role: 'student', dept: 'BT', status: 'active' },
  ]);

  const [facultyList, setFacultyList] = useState(INITIAL_FACULTY);

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
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
              className="ad-hamburger"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle navigation"
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
