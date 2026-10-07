import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import ScoreCard from '../components/ScoreCard';
import Loading from '../components/Loading';
import {
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  FileText,
  TrendingUp,
  Cpu,
  Target,
  Sparkles,
  MessageSquare,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Brain,
  MessageCircle,
  Lightbulb,
  Layers
} from 'lucide-react';

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'transcript' | 'study'

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await interviewAPI.getInterviewResults(id);
        setResults(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load interview results scorecard.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) {
    return <Loading text="Gemini Flash is analyzing your interview transcript and generating scorecard..." fullScreen />;
  }

  if (error || !results) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '32px', textAlign: 'center' }} className="glass-card">
        <AlertTriangle size={48} color="#fb7185" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          Unable to Load Results
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {error || 'Make sure the interview session has conversation messages recorded.'}
        </p>
        <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 65) return 'cyan';
    if (score >= 50) return 'amber';
    return 'rose';
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', padding: '40px 20px', maxWidth: '1150px', margin: '0 auto' }}>
      {/* Top Completion Banner */}
      <div className="glass-card glass-card-glow" style={{
        padding: '40px',
        textAlign: 'center',
        marginBottom: '32px',
        background: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.18) 0%, rgba(15, 23, 42, 0.95) 85%)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '16px',
        }}>
          <CheckCircle2 size={16} /> MOCK MENTOR PERFORMANCE REPORT
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '6px' }}>
          {results.job_role} Interview Report
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '28px' }}>
          {results.interview_type} • {results.difficulty} Difficulty • Evaluated by Gemini Flash
        </p>

        {/* Primary Score Ring */}
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '170px',
          height: '170px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '3px solid rgba(139, 92, 246, 0.5)',
          boxShadow: '0 0 35px rgba(139, 92, 246, 0.35)',
          margin: '0 auto 20px auto',
        }}>
          <span style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
            {results.overall_score}
          </span>
          <span style={{ fontSize: '0.9rem', color: '#c084fc', fontWeight: 600 }}>
            Overall Score
          </span>
        </div>
      </div>

      {/* 5-Dimensional Metrics Grid */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '32px' }}>
        <ScoreCard
          title="Technical Depth"
          score={results.technical_score ?? results.overall_score ?? 0}
          max={100}
          icon={Cpu}
          color={getScoreColor(results.technical_score ?? results.overall_score ?? 0)}
          subtitle="Concepts & accuracy"
        />
        <ScoreCard
          title="Project Knowledge"
          score={results.project_knowledge_score ?? results.overall_score ?? 0}
          max={100}
          icon={Layers}
          color={getScoreColor(results.project_knowledge_score ?? results.overall_score ?? 0)}
          subtitle="Resume claims & trade-offs"
        />
        <ScoreCard
          title="Communication"
          score={results.communication_score ?? results.overall_score ?? 0}
          max={100}
          icon={MessageCircle}
          color={getScoreColor(results.communication_score ?? results.overall_score ?? 0)}
          subtitle="Clarity & articulation"
        />
        <ScoreCard
          title="Problem Solving"
          score={results.problem_solving_score ?? results.overall_score ?? 0}
          max={100}
          icon={Brain}
          color={getScoreColor(results.problem_solving_score ?? results.overall_score ?? 0)}
          subtitle="Structured reasoning"
        />
        <ScoreCard
          title="Confidence"
          score={results.confidence_score ?? results.overall_score ?? 0}
          max={100}
          icon={Award}
          color={getScoreColor(results.confidence_score ?? results.overall_score ?? 0)}
          subtitle="Delivery & decisiveness"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'summary' ? '2px solid #8b5cf6' : '2px solid transparent',
            color: activeTab === 'summary' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'summary' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Award size={16} /> Evaluation Summary
        </button>

        <button
          onClick={() => setActiveTab('study')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'study' ? '2px solid #06b6d4' : '2px solid transparent',
            color: activeTab === 'study' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'study' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={16} /> Practice & Study Guide ({results.practice_questions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'transcript' ? '2px solid #10b981' : '2px solid transparent',
            color: activeTab === 'transcript' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: activeTab === 'transcript' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={16} /> Full Dialogue Transcript ({results.transcript?.length || 0})
        </button>
      </div>

      {/* TAB 1: SUMMARY */}
      {activeTab === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
          {/* Strengths & Weaknesses 2-column */}
          <div className="grid-2">
            {/* Strengths */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={20} color="#34d399" /> Demonstrated Strengths
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.strengths?.map((s, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    <CheckCircle2 size={16} color="#34d399" style={{ marginTop: '3px', flexShrink: 0 }} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertTriangle size={20} color="#fbbf24" /> Areas to Improve
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {results.weaknesses?.map((w, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <AlertTriangle size={16} color="#fbbf24" style={{ marginTop: '3px', flexShrink: 0 }} />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Incorrect Answers & Missed Opportunities */}
          {(results.incorrect_answers?.length > 0 || results.missed_opportunities?.length > 0) && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={20} color="#38bdf8" /> Specific Answers & Missed Opportunities Analysis
              </h3>

              <div className="grid-2">
                {results.incorrect_answers?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#fb7185', fontWeight: 700, marginBottom: '10px' }}>
                      Conceptual Gaps Identified:
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {results.incorrect_answers.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(244, 63, 94, 0.06)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #f43f5e' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.missed_opportunities?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700, marginBottom: '10px' }}>
                      Opportunities to Expand:
                    </h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {results.missed_opportunities.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(6, 182, 212, 0.06)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #06b6d4' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STUDY GUIDE & PRACTICE QUESTIONS */}
      {activeTab === 'study' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '36px' }}>
          {/* Topics to Study */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="#06b6d4" /> Priority Topics to Study Before Next Interview
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {results.topics_to_study?.map((topic, i) => (
                <span key={i} className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '8px 14px', textTransform: 'none' }}>
                  📚 {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Practice Questions Generated by Gemini */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} color="#8b5cf6" /> Personalized AI Practice Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {results.practice_questions?.map((item, idx) => (
                <div key={idx} style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-purple">{item.topic || 'Technical Topic'}</span>
                    <span className="badge badge-amber">{item.difficulty || 'Medium'}</span>
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '6px' }}>
                    {item.question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSCRIPT */}
      {activeTab === 'transcript' && (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '36px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="#8b5cf6" /> Live Interview Dialogue Transcript
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {results.transcript?.map((m, idx) => {
              const isMentor = m.speaker === 'mentor';
              return (
                <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: isMentor ? 'rgba(139, 92, 246, 0.06)' : 'rgba(255, 255, 255, 0.02)', border: isMentor ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: isMentor ? '#c084fc' : '#38bdf8', fontSize: '0.85rem' }}>
                      {isMentor ? 'Mock Mentor' : 'Candidate'}
                    </strong>
                    {m.topic && isMentor && (
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{m.topic}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {m.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link to="/setup" className="btn-primary" style={{ padding: '14px 28px', textDecoration: 'none' }}>
          <RotateCcw size={18} />
          <span>Practice Another Mock Round</span>
        </Link>
        <Link to="/history" className="btn-secondary" style={{ padding: '14px 24px', textDecoration: 'none' }}>
          <span>View Past History</span>
        </Link>
        <Link to="/dashboard" className="btn-secondary" style={{ padding: '14px 24px', textDecoration: 'none' }}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default Results;
