import React from 'react';

const ScoreCard = ({ title, score, max = 100, icon: Icon, color = 'purple', subtitle }) => {
  const numScore = typeof score === 'number' ? score : 0;
  const percentage = Math.min(100, Math.max(0, (numScore / max) * 100));

  const getColorConfig = () => {
    switch (color) {
      case 'cyan':
        return {
          text: '#38bdf8',
          border: 'rgba(6, 182, 212, 0.3)',
          gradient: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
          badge: 'badge-cyan',
        };
      case 'emerald':
        return {
          text: '#34d399',
          border: 'rgba(16, 185, 129, 0.3)',
          gradient: 'linear-gradient(90deg, #10b981, #34d399)',
          badge: 'badge-emerald',
        };
      case 'amber':
        return {
          text: '#fbbf24',
          border: 'rgba(245, 158, 11, 0.3)',
          gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          badge: 'badge-amber',
        };
      case 'rose':
        return {
          text: '#fb7185',
          border: 'rgba(244, 63, 94, 0.3)',
          gradient: 'linear-gradient(90deg, #f43f5e, #fb7185)',
          badge: 'badge-rose',
        };
      case 'purple':
      default:
        return {
          text: '#c084fc',
          border: 'rgba(139, 92, 246, 0.3)',
          gradient: 'linear-gradient(90deg, #8b5cf6, #c084fc)',
          badge: 'badge-purple',
        };
    }
  };

  const theme = getColorConfig();

  return (
    <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, lineHeight: 1 }}>
              {numScore}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              /{max}
            </span>
          </div>
        </div>
        {Icon && (
          <div style={{
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${theme.border}`
          }}>
            <Icon size={20} color={theme.text} />
          </div>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
          {subtitle}
        </div>
      )}

      {/* Progress Track */}
      <div style={{
        height: '6px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: theme.gradient,
          borderRadius: '3px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
};

export default ScoreCard;
