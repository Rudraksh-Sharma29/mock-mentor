import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  StopCircle,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Zap,
  ArrowRight,
  ShieldAlert,
  Bot
} from 'lucide-react';

const Interview = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // WebSocket state
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentTopic, setCurrentTopic] = useState('Introduction');
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [mentorThinking, setMentorThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState('');

  // Input and Audio state
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioVoiceEnabled, setAudioVoiceEnabled] = useState(true);
  const [isMentorSpeaking, setIsMentorSpeaking] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll transcript
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, mentorThinking]);

  // Elapsed interview timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. Fetch Initial Interview Info
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const res = await interviewAPI.getInterviewById(id);
        setInterview(res.data);
        setTotalQuestions(res.data.total_questions || 5);
        if (res.data.completed) {
          navigate(`/interview/${id}/results`, { replace: true });
          return;
        }
      } catch (err) {
        setError(err.message || 'Failed to load interview session.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, navigate]);

  // 2. Speech Synthesis (Mentor Voice)
  const speakText = (text) => {
    if (!audioVoiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Try to select an English voice
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Samantha')));
      if (engVoice) {
        utterance.voice = engVoice;
      }

      utterance.onstart = () => setIsMentorSpeaking(true);
      utterance.onend = () => setIsMentorSpeaking(false);
      utterance.onerror = () => setIsMentorSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      setIsMentorSpeaking(false);
    }
  };

  // 3. Speech Recognition (Candidate Voice Input)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputText((prev) => (event.results[0].isFinal ? prev + ' ' + currentTranscript : currentTranscript));
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please type your responses in the text box.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // 4. WebSocket Connection
  useEffect(() => {
    if (!token || !id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // In dev with Vite proxy, or direct backend connection
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/interview/${id}?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      setError('');
    };

    ws.onmessage = (event) => {
      try {
        const data = jsonParseSafe(event.data);
        if (!data) return;

        if (data.type === 'history') {
          setMessages(data.messages || []);
        } else if (data.type === 'mentor_thinking') {
          setMentorThinking(true);
          setThinkingStatus(data.status || 'Analyzing your response...');
        } else if (data.type === 'mentor_message') {
          setMentorThinking(false);
          setMessages((prev) => [
            ...prev,
            {
              speaker: 'mentor',
              message: data.message,
              topic: data.topic,
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ]);

          if (data.question_number) {
            setCurrentQuestionNumber(data.question_number);
          }
          if (data.total_questions) {
            setTotalQuestions(data.total_questions);
          }
          if (data.topic) {
            setCurrentTopic(data.topic);
          }
          setIsFollowUp(data.is_follow_up || false);

          // Trigger voice readout
          speakText(data.message);
        } else if (data.type === 'interview_completed') {
          setMentorThinking(false);
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          navigate(`/interview/${id}/results`);
        } else if (data.type === 'error') {
          setError(data.message);
          setMentorThinking(false);
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error('WebSocket encountered an error:', err);
      setError('Connection to AI Mentor lost. Please refresh or check the server.');
    };

    setSocket(ws);

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      ws.close();
    };
  }, [id, token]);

  const jsonParseSafe = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  // Send candidate response
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !socket || !connected) return;

    const messageText = inputText.trim();
    setInputText('');

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // Add candidate message to local transcript
    setMessages((prev) => [
      ...prev,
      {
        speaker: 'candidate',
        message: messageText,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Send to WebSocket
    socket.send(
      JSON.stringify({
        type: 'candidate_message',
        message: messageText,
      })
    );
  };

  const handleEndInterview = () => {
    if (window.confirm('Are you sure you want to end the interview and generate your performance scorecard?')) {
      if (socket && connected) {
        socket.send(JSON.stringify({ type: 'end_interview' }));
      } else {
        // Fallback HTTP call
        interviewAPI.completeInterview(id).then(() => {
          navigate(`/interview/${id}/results`);
        });
      }
    }
  };

  if (loading) {
    return <Loading text="Connecting to Live AI Mentor..." fullScreen />;
  }

  const progressPercent = Math.min(100, (currentQuestionNumber / totalQuestions) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 24px',
      maxWidth: '1300px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid var(--border-color)',
        marginBottom: '20px',
        backdropFilter: 'blur(12px)',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Session Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                Mock Mentor Live
              </span>
              <span className="badge badge-purple">{interview?.interview_type}</span>
              <span className="badge badge-amber">{interview?.difficulty}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Target Role: <strong style={{ color: 'var(--text-main)' }}>{interview?.job_role}</strong> • Duration: {formatTime(timerSeconds)}
            </div>
          </div>
        </div>

        {/* Progress & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc' }}>
              QUESTION {currentQuestionNumber} OF {totalQuestions}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Topic: {currentTopic}
            </div>
          </div>

          <button
            onClick={() => setAudioVoiceEnabled(!audioVoiceEnabled)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: audioVoiceEnabled ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: audioVoiceEnabled ? '1px solid #06b6d4' : '1px solid var(--border-color)',
              color: audioVoiceEnabled ? '#38bdf8' : 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
            title={audioVoiceEnabled ? "AI Voice Output ON" : "AI Voice Output MUTED"}
          >
            {audioVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Voice {audioVoiceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleEndInterview}
            className="btn-secondary"
            style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fb7185', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <StopCircle size={16} />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        height: '4px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '2px',
        marginBottom: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
          transition: 'width 0.4s ease'
        }} />
      </div>

      {/* Main Interview Arena Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '24px',
        flex: 1,
        minHeight: 0
      }}>
        {/* Left Column: AI Mentor Avatar & Live Visualizer */}
        <div className="glass-card" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              AI Interviewer State
            </div>

            {/* Glowing Avatar Ring */}
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              margin: '0 auto 20px auto',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(15, 23, 42, 0.9) 70%)',
              border: isMentorSpeaking
                ? '3px solid #06b6d4'
                : mentorThinking
                ? '3px solid #f59e0b'
                : '2px solid rgba(139, 92, 246, 0.4)',
              boxShadow: isMentorSpeaking
                ? '0 0 35px rgba(6, 182, 212, 0.5)'
                : mentorThinking
                ? '0 0 30px rgba(245, 158, 11, 0.4)'
                : '0 0 20px rgba(139, 92, 246, 0.2)',
              transition: 'all 0.3s ease'
            }}>
              <Bot size={54} color={isMentorSpeaking ? '#38bdf8' : mentorThinking ? '#fbbf24' : '#c084fc'} />

              {/* Animated Waveform rings if speaking */}
              {isMentorSpeaking && (
                <div style={{
                  position: 'absolute',
                  inset: '-10px',
                  borderRadius: '50%',
                  border: '2px solid rgba(6, 182, 212, 0.3)',
                  animation: 'pulse 1.5s infinite'
                }} />
              )}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Mock Mentor
            </h3>
            <p style={{ fontSize: '0.8rem', color: isMentorSpeaking ? '#38bdf8' : mentorThinking ? '#fbbf24' : 'var(--text-dim)', marginTop: '4px', fontWeight: 600 }}>
              {isMentorSpeaking ? '🔊 Speaking...' : mentorThinking ? '🧠 Analyzing Answer...' : '👂 Listening to candidate'}
            </p>
          </div>

          {/* Context Badge / Adaptive notice */}
          <div style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-color)',
            textAlign: 'left',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontWeight: 700, marginBottom: '6px' }}>
              <Zap size={14} /> Adaptive Focus
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {isFollowUp ? (
                <span style={{ color: '#fbbf24' }}>⚡ Follow-up question exploring your specific technical claim.</span>
              ) : (
                <span>Questions are dynamically grounded in your uploaded resume projects.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Conversation Transcript & Input Box */}
        <div className="glass-card" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
          minHeight: '520px',
        }}>
          {/* Transcript Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {messages.map((msg, index) => {
              const isMentor = msg.speaker === 'mentor';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMentor ? 'flex-start' : 'flex-end',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px',
                    fontSize: '0.75rem',
                    color: isMentor ? '#c084fc' : '#38bdf8',
                    fontWeight: 700
                  }}>
                    {isMentor ? <Bot size={14} /> : null}
                    <span>{isMentor ? 'Mock Mentor' : 'You (Candidate)'}</span>
                    {msg.topic && isMentor && (
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {msg.topic}
                      </span>
                    )}
                  </div>

                  <div style={{
                    maxWidth: '82%',
                    padding: '14px 18px',
                    borderRadius: isMentor ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    background: isMentor
                      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)',
                    border: isMentor ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.5)',
                    color: '#f8fafc',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}>
                    {msg.message}
                  </div>
                </div>
              );
            })}

            {/* Mentor Thinking / Reasoning Bubble */}
            {mentorThinking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)', width: 'fit-content' }}>
                <Sparkles size={16} color="#fbbf24" className="animate-spin" />
                <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>
                  {thinkingStatus || 'Mock Mentor is analyzing your answer...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Candidate Input Bar */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={toggleRecording}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: isRecording ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isRecording ? '2px solid #fb7185' : '1px solid var(--border-color)',
                color: isRecording ? '#fb7185' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
              title={isRecording ? "Stop Recording Voice" : "Speak Response with Microphone"}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <input
              type="text"
              className="form-input"
              placeholder={isRecording ? "Listening to your voice... (Speak now)" : "Type your technical response or use the microphone..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ flex: 1, padding: '14px 18px', fontSize: '0.95rem' }}
              disabled={mentorThinking}
            />

            <button
              type="submit"
              className="btn-primary"
              style={{ height: '48px', padding: '0 20px', flexShrink: 0 }}
              disabled={!inputText.trim() || mentorThinking}
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Interview;
