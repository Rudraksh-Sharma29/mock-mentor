import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewAPI, resumeAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import ScoreCard from '../components/ScoreCard';
import Loading from '../components/Loading';
import {
  PlayCircle,
  Trophy,
  BarChart2,
  CheckCircle,
  Layers,
  ArrowRight,
  Calendar,
  ChevronRight,
  UploadCloud,
  FileText,
  Sparkles,
  Bot
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [intRes, resRes] = await Promise.all([
          interviewAPI.getUserInterviews(),
          resumeAPI.getResumes(),
        ]);
        setInterviews(intRes.data || []);
        setResumes(resRes.data || []);
      } catch (err) {
        setError('Failed to fetch your dashboard records.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter((i) => i.completed);
  const completedCount = completedInterviews.length;

  const scores = completedInterviews
    .map((i) => i.overall_score)
    .filter((s) => typeof s === 'number');

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

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
        {/* Welcome Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Welcome back, <span className="text-gradient">{user?.name}</span>!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Your Mock Mentor dashboard. Track real-time AI interview scores and resume intelligence.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/resume" className="btn-secondary" style={{ padding: '12px 20px', textDecoration: 'none' }}>
              <UploadCloud size={18} color="#38bdf8" />
              <span>Upload Resume</span>
            </Link>
            <Link to="/setup" className="btn-primary" style={{ padding: '12px 22px', textDecoration: 'none' }}>
              <PlayCircle size={18} />
              <span>Start Interview</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <Loading text="Loading dashboard metrics..." />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid-4" style={{ marginBottom: '32px' }}>
              <ScoreCard
                title="Mock Sessions"
                score={totalInterviews}
                max={Math.max(10, totalInterviews)}
                icon={Layers}
                color="cyan"
                subtitle="All generated rounds"
              />
              <ScoreCard
                title="Average Score"
                score={avgScore}
                max={100}
                icon={BarChart2}
                color="purple"
                subtitle="Across completed rounds"
              />
              <ScoreCard
                title="Best Score"
                score={bestScore}
                max={100}
                icon={Trophy}
                color="emerald"
                subtitle="Your personal record"
              />
              <ScoreCard
                title="Resumes Analyzed"
                score={resumes.length}
                max={Math.max(5, resumes.length)}
                icon={FileText}
                color="amber"
                subtitle="Active candidate profiles"
              />
            </div>

            {/* If no resume yet, display banner prompt */}
            {resumes.length === 0 && (
              <div className="glass-card glass-card-glow" style={{
                padding: '24px 28px',
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <UploadCloud size={24} color="#c084fc" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                      Get Started by Uploading Your Resume
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Mock Mentor requires your resume context to formulate live, adaptive challenge questions.
                    </p>
                  </div>
                </div>

                <Link to="/resume" className="btn-primary" style={{ textDecoration: 'none' }}>
                  <span>Upload Resume (PDF/DOCX)</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* Recent Interviews Table */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Mock Interviews</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    Your live AI rounds and evaluation reports
                  </p>
                </div>
                {interviews.length > 0 && (
                  <Link to="/history" style={{
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    View Full History <ChevronRight size={16} />
                  </Link>
                )}
              </div>

              {interviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-dim)' }}>
                  <Bot size={44} color="#8b5cf6" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                    No interview rounds taken yet
                  </h3>
                  <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                    Upload your resume to launch your first real-time AI mock interview with Mock Mentor.
                  </p>
                  <Link to="/resume" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                    Start With Resume Upload
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{
                        borderBottom: '1px solid var(--border-color)',
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        <th style={{ padding: '12px 16px' }}>Date</th>
                        <th style={{ padding: '12px 16px' }}>Role</th>
                        <th style={{ padding: '12px 16px' }}>Round Type</th>
                        <th style={{ padding: '12px 16px' }}>Difficulty</th>
                        <th style={{ padding: '12px 16px' }}>Score</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.slice(0, 5).map((item) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={14} color="var(--text-dim)" />
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#ffffff' }}>
                            {item.job_role}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="badge badge-purple">{item.interview_type}</span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {getDifficultyBadge(item.difficulty)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {item.completed && typeof item.overall_score === 'number' ? (
                              <span style={{
                                fontWeight: 800,
                                color: item.overall_score >= 75 ? '#34d399' : item.overall_score >= 50 ? '#fbbf24' : '#fb7185'
                              }}>
                                {item.overall_score} / 100
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-dim)' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {item.completed ? (
                              <span className="badge badge-emerald">Completed</span>
                            ) : (
                              <span className="badge badge-amber">In-Progress</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {item.completed ? (
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
                                View Report <ArrowRight size={14} />
                              </Link>
                            ) : (
                              <Link
                                to={`/interview/${item.id}`}
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
                                Resume Live <ArrowRight size={14} />
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
