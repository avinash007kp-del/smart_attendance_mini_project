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
  CameraIcon
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
  { id: 'overview',    label: 'Overview',        icon: GridIcon     },
  { id: 'departments', label: 'Departments',     icon: BuildingIcon },
  { id: 'users',       label: 'User Management', icon: UsersIcon    },
  { id: 'settings',    label: 'Settings',        icon: SettingsIcon },
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

        {/* Metric 2 — Faculty Members */}
        <div className="ad-stat-col">
          <div className="ad-stat-header">
            <IdCardIcon size={17} />
            <span>Faculty Members</span>
          </div>
          <div className="ad-stat-value">{totalFaculty}</div>
          <div className="ad-stat-footer">
            <span className="ad-stat-sub">Active instructors</span>
            <span className="ad-stat-trend">+2 this month</span>
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
