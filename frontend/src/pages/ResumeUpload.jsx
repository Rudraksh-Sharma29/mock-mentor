import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loading from '../components/Loading';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Code2,
  Briefcase,
  GraduationCap,
  HelpCircle,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const ResumeUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [error, setError] = useState('');
  const [parsedResume, setParsedResume] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  // Existing resumes
  const [existingResumes, setExistingResumes] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await resumeAPI.getResumes();
        setExistingResumes(res.data || []);
      } catch (err) {
        console.error('Failed to load past resumes:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchResumes();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    setError('');
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setError('Please upload a valid PDF or DOCX resume document.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setUploadStep(1);

    const stepTimer = setInterval(() => {
      setUploadStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await resumeAPI.uploadResume(formData);
      clearInterval(stepTimer);
      setParsedResume(res.data.parsed_data);
      setResumeId(res.data.id);
    } catch (err) {
      clearInterval(stepTimer);
      setError(err.message || 'Resume parsing failed. Please check the document format.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectExisting = async (id) => {
    try {
      setUploading(true);
      setError('');
      const res = await resumeAPI.getResumeById(id);
      setParsedResume(res.data.parsed_data);
      setResumeId(res.data.id);
    } catch (err) {
      setError('Failed to load selected resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleProceed = () => {
    if (resumeId) {
      navigate('/setup', { state: { resumeId, parsedResume } });
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-content">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-purple">
              <Sparkles size={12} /> Step 1 of 3: Resume Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Upload & Analyze <span className="text-gradient">Your Resume</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Mock Mentor extracts your skills, projects, and key technical claims to generate a tailored live interview.
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

        {!parsedResume ? (
          <div style={{ display: 'grid', gridTemplateColumns: existingResumes.length > 0 ? '1.4fr 1fr' : '1fr', gap: '28px' }}>
            {/* Upload Box */}
            <div className="glass-card" style={{ padding: '36px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                Upload New Resume
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
                Supported file formats: <strong>PDF</strong>, <strong>DOCX</strong> (Max 10 MB)
              </p>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? '2px dashed #8b5cf6' : '2px dashed var(--border-color)',
                  borderRadius: '16px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  background: dragActive ? 'rgba(139, 92, 246, 0.08)' : 'rgba(15, 23, 42, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '24px',
                }}
                onClick={() => document.getElementById('resume-file-input').click()}
              >
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <UploadCloud size={32} color="#c084fc" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                  {file ? file.name : 'Drag & drop your resume file here'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change file` : 'or click to browse from your computer'}
                </p>
              </div>

              {uploading ? (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <Loading
                    text={
                      uploadStep === 1
                        ? 'Extracting raw text from document...'
                        : uploadStep === 2
                        ? 'Gemini Flash analyzing technical profile & claims...'
                        : 'Generating challenge topics for live round...'
                    }
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUploadAndAnalyze}
                  disabled={!file || uploading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                >
                  <Sparkles size={18} />
                  <span>Analyze Resume with Gemini Flash</span>
                </button>
              )}
            </div>

            {/* Previously Analyzed Resumes */}
            {existingResumes.length > 0 && (
              <div className="glass-card" style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
                  Previously Uploaded
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '18px' }}>
                  Quickly reuse an existing analyzed profile
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {existingResumes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleSelectExisting(r.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={20} color="#38bdf8" />
                          <div>
                            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.9rem' }}>
                              {r.filename}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                              {r.candidate_name ? `${r.candidate_name} • ` : ''}
                              {r.skills_count} skills • {r.projects_count} projects
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-dim)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Visual Breakdown of Extracted Resume */
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Resume Analyzed Successfully</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    Review your extracted profile before proceeding to interview configuration.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => { setParsedResume(null); setFile(null); }}
                  className="btn-secondary"
                  style={{ padding: '10px 18px' }}
                >
                  Upload Different File
                </button>
                <button
                  onClick={handleProceed}
                  className="btn-primary"
                  style={{ padding: '10px 24px' }}
                >
                  <span>Configure Interview</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                    {parsedResume.candidate_name || 'Candidate'}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px', flexWrap: 'wrap' }}>
                    {parsedResume.email && <span>📧 {parsedResume.email}</span>}
                    {parsedResume.phone && <span>📞 {parsedResume.phone}</span>}
                    {parsedResume.location && <span>📍 {parsedResume.location}</span>}
                  </div>
                </div>
                {parsedResume.suggested_roles?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {parsedResume.suggested_roles.map((role, idx) => (
                      <span key={idx} className="badge badge-cyan">{role}</span>
                    ))}
                  </div>
                )}
              </div>

              {parsedResume.summary && (
                <p style={{
                  marginTop: '16px',
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  borderLeft: '3px solid #8b5cf6',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.6
                }}>
                  {parsedResume.summary}
                </p>
              )}
            </div>

            {/* 2-Column Details: Skills & Claims */}
            <div className="grid-2" style={{ marginBottom: '24px' }}>
              {/* Technical Skills */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Code2 size={18} color="#06b6d4" /> Technical Skills Extracted ({parsedResume.skills?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {parsedResume.skills?.map((skill, i) => (
                    <span key={i} className="badge badge-purple" style={{ textTransform: 'none', fontSize: '0.85rem', padding: '6px 12px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Claims & Challenge Topics */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <ShieldCheck size={18} color="#f59e0b" /> Resume Claims & Challenge Focus
                </h3>
                {parsedResume.resume_claims?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {parsedResume.resume_claims.map((claimItem, i) => (
                      <div key={i} style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.06)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.85rem' }}>
                          "{claimItem.claim}"
                        </div>
                        {claimItem.challenge_questions?.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            <strong>Potential Challenge:</strong> {claimItem.challenge_questions[0]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    Extracted general project experience as primary questioning focus.
                  </p>
                )}
              </div>
            </div>

            {/* Projects Breakdown */}
            {parsedResume.projects?.length > 0 && (
              <div className="glass-card" style={{ padding: '28px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Layers size={20} color="#8b5cf6" /> Projects & Expected Technical Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {parsedResume.projects.map((proj, i) => (
                    <div key={i} style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{proj.name}</h4>
                        {proj.candidate_role && <span className="badge badge-cyan">{proj.candidate_role}</span>}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        {proj.description || proj.key_contribution}
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {proj.technologies?.map((t, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 8px', borderRadius: '4px', color: '#c084fc' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      {proj.possible_questions?.length > 0 && (
                        <div style={{ padding: '10px 14px', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '8px', borderLeft: '3px solid #06b6d4', fontSize: '0.8rem', color: '#94a3b8' }}>
                          <strong style={{ color: '#38bdf8' }}>Mock Mentor Sample Question: </strong>
                          {proj.possible_questions[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Proceed Action */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleProceed}
                className="btn-primary"
                style={{ padding: '14px 36px', fontSize: '1.1rem' }}
              >
                <span>Proceed to Configure Live Interview</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResumeUpload;
