import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import { History as HistoryIcon, Calendar, ArrowRight, PlayCircle, Trophy } from 'lucide-react';

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await interviewAPI.getUserInterviews();
        setInterviews(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load interview history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return <span className="badge badge-emerald">Easy</span>;
      case 'hard':
        return <span className="badge badge-rose">Hard</span>;
      case 'medium':
      default:
        return <span className="badge badge-amber">Medium</span>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Interview <span className="text-gradient">History</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Review past mock interview sessions, questions, scores, and feedback logs.
            </p>
          </div>

          <Link to="/setup" className="btn-primary" style={{ padding: '10px 20px', textDecoration: 'none' }}>
            <PlayCircle size={16} />
            <span>New Session</span>
          </Link>
        </div>

        {loading ? (
          <Loading text="Loading your past interviews..." />
        ) : error ? (
          <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#fb7185' }}>
            {error}
          </div>
        ) : interviews.length === 0 ? (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <HistoryIcon size={48} color="#8b5cf6" style={{ margin: '0 auto 16px auto', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              No interview history found
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
              You have not conducted any mock interviews yet. Start your first session to track performance.
            </p>
            <Link to="/setup" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              Configure First Interview
            </Link>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}>
                <thead>
                  <tr style={{
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-dim)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    <th style={{ padding: '14px 16px' }}>Date</th>
                    <th style={{ padding: '14px 16px' }}>Job Role</th>
                    <th style={{ padding: '14px 16px' }}>Type</th>
                    <th style={{ padding: '14px 16px' }}>Difficulty</th>
                    <th style={{ padding: '14px 16px' }}>Questions</th>
                    <th style={{ padding: '14px 16px' }}>Score</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--text-dim)" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600, color: '#ffffff' }}>
                        {item.job_role}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className="badge badge-purple">{item.interview_type}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {getDifficultyBadge(item.difficulty)}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                        {item.total_questions} Questions
                      </td>
                      <td style={{ padding: '16px' }}>
                        {item.completed && typeof item.overall_score === 'number' ? (
                          <span style={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: item.overall_score >= 75 ? '#34d399' : item.overall_score >= 50 ? '#fbbf24' : '#fb7185'
                          }}>
                            {item.overall_score} / 100
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {item.completed ? (
                          <span className="badge badge-emerald">Completed</span>
                        ) : (
                          <span className="badge badge-amber">Incomplete</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <Link
                            to={`/history/${item.id}`}
                            style={{
                              color: '#c084fc',
                              textDecoration: 'none',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            Details <ArrowRight size={14} />
                          </Link>
                          {item.completed && (
                            <Link
                              to={`/interview/${item.id}/results`}
                              style={{
                                color: '#38bdf8',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              Scorecard <ArrowRight size={14} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
