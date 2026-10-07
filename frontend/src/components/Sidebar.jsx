import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, UploadCloud, PlayCircle, History, Shield, LogOut, Bot } from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resume', label: 'Upload Resume', icon: UploadCloud },
    { to: '/setup', label: 'Start Interview', icon: PlayCircle },
    { to: '/history', label: 'History & Reports', icon: History },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Dashboard', icon: Shield, admin: true });
  }

  return (
    <aside style={{
      width: '240px',
      background: 'rgba(15, 23, 42, 0.65)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 16px',
      backdropFilter: 'blur(10px)',
    }}>
      <div>
        <div style={{ padding: '0 12px 16px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Candidate Profile
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '4px' }}>
            {user?.name || 'Candidate'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </div>
          {isAdmin && (
            <span className="badge badge-cyan" style={{ marginTop: '8px' }}>
              Administrator
            </span>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive
                    ? item.admin
                      ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(56, 189, 248, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)'
                    : 'transparent',
                  border: isActive
                    ? item.admin
                      ? '1px solid rgba(6, 182, 212, 0.4)'
                      : '1px solid rgba(139, 92, 246, 0.4)'
                    : '1px solid transparent',
                  transition: 'all 0.2s ease',
                })}
              >
                <Icon size={18} color={item.admin ? '#38bdf8' : '#a855f7'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fb7185';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
