import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { interviewAPI, resumeAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import {
  PlayCircle,
  Briefcase,
  Award,
  Layers,
  Gauge,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(
    location.state?.resumeId || null
  );
  const [selectedResumeData, setSelectedResumeData] = useState(
    location.state?.parsedResume || null
  );

  const [jobRole, setJobRole] = useState('Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [interviewType, setInterviewType] = useState('Technical + Project-Based');
  const [difficulty, setDifficulty] = useState('Medium');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const interviewTypes = [
    { title: 'Technical + Project-Based', desc: 'Deep dive into resume projects & technical architecture' },
    { title: 'Pure Technical', desc: 'Core programming, CS fundamentals & problem solving' },
    { title: 'HR & Behavioral', desc: 'Situation handling, teamwork, leadership & STAR method' },
    { title: 'Internship Mock', desc: 'Targeted for students & recent graduates' },
    { title: 'Senior Placement', desc: 'High-level system design & trade-off analysis' },
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const experienceLevels = ['Beginner / Student', 'Intermediate', 'Experienced'];

  useEffect(() => {
    const loadResumes = async () => {
      try {
        setLoading(true);
        const res = await resumeAPI.getResumes();
        const list = res.data || [];
        setResumes(list);

        if (!selectedResumeId && list.length > 0) {
          setSelectedResumeId(list[0].id);
          // fetch full resume
          const full = await resumeAPI.getResumeById(list[0].id);
          setSelectedResumeData(full.data.parsed_data);
          if (full.data.parsed_data?.suggested_roles?.length > 0) {
            setJobRole(full.data.parsed_data.suggested_roles[0]);
          }
        } else if (selectedResumeId && !selectedResumeData) {
          const full = await resumeAPI.getResumeById(selectedResumeId);
          setSelectedResumeData(full.data.parsed_data);
          if (full.data.parsed_data?.suggested_roles?.length > 0) {
            setJobRole(full.data.parsed_data.suggested_roles[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load resumes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, [selectedResumeId]);

  const handleResumeSelect = async (id) => {
    setSelectedResumeId(id);
    try {
      const full = await resumeAPI.getResumeById(id);
      setSelectedResumeData(full.data.parsed_data);
      if (full.data.parsed_data?.suggested_roles?.length > 0) {
        setJobRole(full.data.parsed_data.suggested_roles[0]);
      }
    } catch (err) {
      console.error('Failed to fetch full resume:', err);
    }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedResumeId) {
      setError('Please upload or select a resume to conduct the personalized interview.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await interviewAPI.createInterview({
        resume_id: parseInt(selectedResumeId, 10),
        job_role: jobRole,
        experience_level: experienceLevel,
        interview_type: interviewType,
        difficulty: difficulty,
        total_questions: parseInt(totalQuestions, 10),
      });

      const interview = res.data;
      navigate(`/interview/${interview.id}`);
    } catch (err) {
      setError(err.message || 'Failed to initialize interview session.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading text="Loading your interview workspace..." fullScreen />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-purple">
                <Sparkles size={12} /> Step 2 of 3: Session Strategy
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
              Configure <span className="text-gradient">Live AI Interview</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
              Set your target round strategy. Mock Mentor will use Gemini 3.8 Live & Flash for dynamic questioning.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              fontSize: '0.9rem',
              marginBottom: '24px',
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* If no resume uploaded yet */}
          {resumes.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
              <FileText size={48} color="#8b5cf6" style={{ margin: '0 auto 16px auto', opacity: 0.6 }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
                Resume Context Required
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
                In Mock Mentor, interviews are deeply personalized using your resume. Please upload your resume first so the AI can prepare relevant questions.
              </p>
              <Link to="/resume" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                <UploadCloud size={18} />
                <span>Upload Resume (PDF / DOCX)</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleStart}>
              {/* 1. Resume Selection */}
              <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
                    <FileText size={18} color="#38bdf8" /> 1. Selected Resume Profile
                  </label>
                  <Link to="/resume" style={{ color: '#c084fc', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                    + Upload New Resume
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  {resumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleResumeSelect(r.id)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        background: selectedResumeId === r.id ? 'rgba(139, 92, 246, 0.18)' : 'var(--bg-input)',
                        border: selectedResumeId === r.id ? '1.5px solid #8b5cf6' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedResumeId === r.id ? (
                          <CheckCircle2 size={16} color="#8b5cf6" />
                        ) : (
                          <FileText size={16} color="var(--text-dim)" />
                        )}
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: selectedResumeId === r.id ? '#ffffff' : 'var(--text-muted)' }}>
                          {r.filename}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', paddingLeft: '24px' }}>
                        {r.candidate_name ? `${r.candidate_name} • ` : ''}{r.skills_count} skills
                      </div>
                    </div>
                  ))}
                </div>

                {selectedResumeData && (
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'rgba(6, 182, 212, 0.06)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)'
                  }}>
                    <strong style={{ color: '#38bdf8' }}>AI Extracted Focus: </strong>
                    {selectedResumeData.skills?.slice(0, 6).join(', ')} • {selectedResumeData.projects?.length || 0} Projects • {selectedResumeData.resume_claims?.length || 0} Challenge Claims
                  </div>
                )}
              </div>

              {/* 2. Target Job Role & Experience */}
              <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} color="#8b5cf6" /> 2. Target Position & Experience
                </h3>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g. Full Stack Developer, Backend Engineer"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Experience Bracket</label>
                    <select
                      className="form-select"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                    >
                      {experienceLevels.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Interview Round Strategy */}
              <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#06b6d4" /> 3. Interview Category & Strategy
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  {interviewTypes.map((t) => (
                    <div
                      key={t.title}
                      onClick={() => setInterviewType(t.title)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: interviewType === t.title ? 'rgba(6, 182, 212, 0.18)' : 'var(--bg-input)',
                        border: interviewType === t.title ? '1.5px solid #06b6d4' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: interviewType === t.title ? '#ffffff' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                        {t.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid-2">
                  {/* Difficulty */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Difficulty Level</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {difficulties.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            background: difficulty === d ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-input)',
                            border: difficulty === d ? '1.5px solid #f59e0b' : '1px solid var(--border-color)',
                            color: difficulty === d ? '#ffffff' : 'var(--text-muted)',
                            fontWeight: difficulty === d ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Target Round Length</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '42px' }}>
                      <input
                        type="range"
                        min="3"
                        max="10"
                        step="1"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(e.target.value)}
                        style={{ flex: 1, accentColor: '#8b5cf6' }}
                      />
                      <span style={{ fontWeight: 700, color: '#c084fc', background: 'rgba(139, 92, 246, 0.15)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {totalQuestions} Questions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Start CTA */}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                disabled={submitting}
              >
                {submitting ? (
                  <span>Initializing AI Live Mentor Session...</span>
                ) : (
                  <>
                    <PlayCircle size={20} />
                    <span>Launch Live AI Mock Interview</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewSetup;
