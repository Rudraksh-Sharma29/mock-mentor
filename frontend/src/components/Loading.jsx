import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

const Loading = ({ text = 'Loading...', fullScreen = false }) => {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px 20px',
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '3px solid rgba(139, 92, 246, 0.2)',
          borderTopColor: '#8b5cf6',
          borderRightColor: '#06b6d4',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <Sparkles size={20} color="#38bdf8" />
        </div>
      </div>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '0.95rem',
        fontWeight: 500,
        letterSpacing: '0.3px',
      }}>
        {text}
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
      }}>
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
