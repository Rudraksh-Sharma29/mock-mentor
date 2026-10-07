import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@example.com');
    setPassword('AdminPassword123!');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div className="glass-card glass-card-glow" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px 32px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to continue your interview preparation
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
                required
              />
              <Mail size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
                required
              />
              <Lock size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick fill admin demo button */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={fillAdmin}
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Auto-fill Admin Demo Credentials
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#c084fc', textDecoration: 'none', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
