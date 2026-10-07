import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import { ArrowLeft, BookOpen, CheckCircle, HelpCircle, Calendar, Layers, ShieldCheck, Award } from 'lucide-react';

const InterviewDetails = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await interviewAPI.getInterviewById(id);
        setInterview(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load interview details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return <Loading text="Loading interview session transcript..." fullScreen />;
  }

  if (error || !interview) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
            <h2 style={{ color: '#fb7185', marginBottom: '8px' }}>Error Loading Details</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{error || 'Interview not found.'}</p>
            <Link to="/history" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Back to History
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/history" style={{
            color: '#38bdf8',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            <ArrowLeft size={16} /> Back to History
          </Link>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
                {interview.job_role} <span className="text-gradient">Transcript</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Conducted on {new Date(interview.created_at).toLocaleDateString()} • {interview.interview_type} • {interview.difficulty}
              </p>
            </div>

            {interview.completed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                padding: '10px 20px',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Final Score:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>
                  {interview.overall_score} / 100
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question & Answer Detailed Transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {interview.questions?.map((q, index) => {
            const answer = interview.answers?.find((a) => a.question_id === q.id);

            return (
              <div key={q.id} className="glass-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6' }}>
                        QUESTION {index + 1}
                      </span>
                      <span className="badge badge-purple">{q.category}</span>
                      <span className="badge badge-amber">{q.difficulty}</span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                      {q.question_text}
                    </h3>
                  </div>

                  {answer && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'right'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>SCORE</div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: answer.overall_score >= 75 ? '#34d399' : answer.overall_score >= 50 ? '#fbbf24' : '#fb7185'
                      }}>
                        {answer.overall_score} / 100
                      </div>
                    </div>
                  )}
                </div>

                {answer ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Candidate Answer Box */}
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Candidate Answer
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                        {answer.answer_text}
                      </p>
                    </div>

                    {/* Subscore Pills */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                    }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Tech: </span>
                        <strong style={{ color: '#38bdf8' }}>{answer.technical_score}%</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Rel: </span>
                        <strong style={{ color: '#c084fc' }}>{answer.relevance_score}%</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Clar: </span>
                        <strong style={{ color: '#fbbf24' }}>{answer.clarity_score}%</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Comp: </span>
                        <strong style={{ color: '#34d399' }}>{answer.completeness_score}%</strong>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.06)',
                      borderLeft: '3px solid #8b5cf6',
                      fontSize: '0.9rem',
                      color: 'var(--text-main)'
                    }}>
                      <strong style={{ color: '#c084fc' }}>Evaluation Feedback: </strong>
                      {answer.feedback}
                    </div>

                    {/* Keywords & Model Answer */}
                    {q.expected_keywords && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                        <strong>Expected Concept Keywords: </strong>
                        <span style={{ color: '#38bdf8' }}>{q.expected_keywords}</span>
                      </div>
                    )}

                    {q.model_answer && (
                      <div style={{
                        padding: '14px 18px',
                        borderRadius: '8px',
                        background: 'rgba(6, 182, 212, 0.06)',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '4px' }}>
                          <BookOpen size={16} /> Reference Model Answer:
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {q.model_answer}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    color: '#fbbf24',
                    fontSize: '0.875rem'
                  }}>
                    This question was not answered during the session.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default InterviewDetails;
