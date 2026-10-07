import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, LogOut, User, Shield, UploadCloud, PlayCircle, History, Sparkles, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 36px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Logo */}
      <Link to={isAuthenticated ? "/dashboard" : "/"} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        color: 'inherit'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
        }}>
          <Bot size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Mock<span className="text-gradient">Mentor</span>
          </span>
          <span style={{
            display: 'block',
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginTop: '-2px'
          }}>
            Resume-Powered Live AI Interviewer
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              Dashboard
            </Link>
            <Link to="/resume" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <UploadCloud size={15} color="#38bdf8" />
              <span>Upload Resume</span>
            </Link>
            <Link to="/setup" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              Start Interview
            </Link>
            <Link to="/history" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}>
              History
            </Link>

            {isAdmin && (
              <Link to="/admin" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38bdf8',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}>
                <Shield size={14} /> Admin
              </Link>
            )}

            <div style={{
              height: '24px',
              width: '1px',
              background: 'var(--border-color)',
              margin: '0 4px'
            }} />

            {/* User Chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem'
            }}>
              <User size={14} color="#8b5cf6" />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary"
              style={{ padding: '7px 14px', fontSize: '0.85rem' }}
              title="Log Out"
            >
              <LogOut size={15} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}>
              Login
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 18px', textDecoration: 'none' }}>
              Get Started <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
