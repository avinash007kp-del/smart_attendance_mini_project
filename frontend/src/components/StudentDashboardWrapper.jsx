import React from 'react';
import ProviderWrapper from './ProviderWrapper';
import ProtectedRoute from './ProtectedRoute';
import StudentDashboardPage from './StudentDashboardPage';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Student Dashboard Error Caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#F7F6F2',
          fontFamily: "'Inter', sans-serif",
          color: '#162F44',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            background: '#FFFFFF',
            padding: '2.5rem 2rem',
            borderRadius: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            border: '1px solid rgba(22, 47, 68, 0.08)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#162F44' }}>
              Student Dashboard Notice
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#707C85', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              The student dashboard encountered a minor rendering issue and was safely prevented from crashing.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: '#162F44',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  try { localStorage.removeItem('sa_user'); } catch (e) {}
                  window.location.href = '/login';
                }}
                style={{
                  background: 'transparent',
                  color: '#162F44',
                  border: '1px solid rgba(22, 47, 68, 0.2)',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Sign In Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function StudentDashboardWrapper() {
  return (
    <DashboardErrorBoundary>
      <ProviderWrapper>
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboardPage />
        </ProtectedRoute>
      </ProviderWrapper>
    </DashboardErrorBoundary>
  );
}

