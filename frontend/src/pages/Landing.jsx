import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  Mic,
  Bot,
  Layers,
  Zap,
  BarChart3,
  CheckCircle2,
  Brain,
  ShieldCheck,
  FileText
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/resume');
    } else {
      navigate('/register');
    }
  };

  const steps = [
    {
      step: '01',
      title: 'Upload Resume',
      desc: 'Upload your PDF or DOCX resume. Gemini Flash extracts your real projects, skills, and technical claims.',
      icon: UploadCloud,
      color: 'purple',
    },
    {
      step: '02',
      title: 'Configure Round',
      desc: 'Select your target interview category (Technical, HR, Project-Based, Internship) and difficulty level.',
      icon: Layers,
      color: 'cyan',
    },
    {
      step: '03',
      title: 'Live AI Interview',
      desc: 'Engage with Mock Mentor in real-time voice and text dialogue with dynamic, adaptive follow-up questioning.',
      icon: Mic,
      color: 'amber',
    },
    {
      step: '04',
      title: 'Gemini Scorecard',
      desc: 'Receive a multi-dimensional performance evaluation with strengths, weaknesses, and personalized practice questions.',
      icon: BarChart3,
      color: 'emerald',
    },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        padding: '80px 24px 60px 24px',
        textAlign: 'center',
        maxWidth: '1050px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Glow Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '30px',
          background: 'rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          marginBottom: '28px',
        }}>
          <Sparkles size={16} color="#c084fc" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c084fc', letterSpacing: '0.5px' }}>
            Powered by Google Gemini Flash & Gemini Live
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          marginBottom: '24px'
        }}>
          Personalized Mock Interviews Grounded In{' '}
          <span className="text-gradient">Your Resume.</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-muted)',
          maxWidth: '760px',
          margin: '0 auto 40px auto',
          lineHeight: 1.6
        }}>
          Mock Mentor analyzes your actual projects, skills, and resume claims to conduct a live, adaptive mock interview that challenges you just like a real tech interviewer.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleStart}
            className="btn-primary"
            style={{ padding: '16px 36px', fontSize: '1.05rem' }}
          >
            <UploadCloud size={20} />
            <span>Upload Resume & Start</span>
            <ArrowRight size={18} />
          </button>

          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: '16px 28px', fontSize: '1rem', textDecoration: 'none' }}
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Architecture Badges */}
        <div style={{
          marginTop: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '20px',
          padding: '10px 24px',
          borderRadius: '14px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" /> Resume Analysis (Gemini Flash)
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" /> Real-Time Live Voice & Text
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" /> Adaptive Follow-Up Questioning
          </span>
        </div>
      </section>

      {/* How it Works 4-Step Grid */}
      <section style={{
        padding: '40px 24px 80px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
            How Mock Mentor Works
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginTop: '8px' }}>
            A continuous, intelligent loop from your resume to post-interview mastery.
          </p>
        </div>

        <div className="grid-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass-card" style={{ padding: '28px', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '20px',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.08)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {s.step}
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <Icon size={24} color="#c084fc" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Landing;
