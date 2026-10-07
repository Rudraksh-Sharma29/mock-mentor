import React, { useState } from 'react';
import { Send, CheckCircle2, Award, BookOpen, AlertCircle, ArrowRight, Check } from 'lucide-react';
import Loading from './Loading';

const QuestionCard = ({
  question,
  currentIndex,
  totalQuestions,
  onSubmitAnswer,
  onNextQuestion,
  isSubmitting,
  evaluationResult,
  isLastQuestion,
}) => {
  const [answerText, setAnswerText] = useState('');

  const words = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const chars = answerText.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim() || isSubmitting) return;
    onSubmitAnswer(answerText.trim());
  };

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
    <div className="glass-card" style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Header Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#8b5cf6',
            letterSpacing: '0.5px',
          }}>
            QUESTION {currentIndex + 1} OF {totalQuestions}
          </span>
          <span className="badge badge-purple">{question.category || 'Technical'}</span>
          {getDifficultyBadge(question.difficulty)}
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 500 }}>
          {question.job_role}
        </div>
      </div>

      {/* Question Prompt */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.45,
        }}>
          {question.question_text}
        </h2>
      </div>

      {/* Answer Form if not evaluated yet */}
      {!evaluationResult ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Your Response</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {words} words • {chars} characters
              </span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Provide a detailed, technical explanation covering relevant keywords, architectural trade-offs, and examples..."
              rows={8}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isSubmitting}
              style={{
                fontSize: '1rem',
                minHeight: '180px',
                borderColor: words > 10 ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <AlertCircle size={14} />
              <span>Automated Rule-Based Evaluation is executed upon submission.</span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={!answerText.trim() || isSubmitting}
              style={{ minWidth: '160px' }}
            >
              {isSubmitting ? (
                <span>Evaluating...</span>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Evaluation Result Display */
        <div style={{
          marginTop: '10px',
          padding: '24px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={22} color="#10b981" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                Automated Evaluation Result
              </h3>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
              background: 'rgba(139, 92, 246, 0.15)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(139, 92, 246, 0.4)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc' }}>
                {evaluationResult.overall_score}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/100</span>
            </div>
          </div>

          {/* Sub-scores breakdown */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>TECHNICAL (40%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                {evaluationResult.technical_score}%
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>RELEVANCE (25%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c084fc' }}>
                {evaluationResult.relevance_score}%
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>COMPLETENESS (20%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                {evaluationResult.completeness_score}%
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>CLARITY (15%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>
                {evaluationResult.clarity_score}%
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Automated Feedback:
            </div>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              lineHeight: 1.5,
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '12px 16px',
              borderRadius: '8px',
              borderLeft: '3px solid #8b5cf6'
            }}>
              {evaluationResult.feedback}
            </p>
          </div>

          {/* Matched & Missing Keywords */}
          {evaluationResult.matched_keywords && evaluationResult.matched_keywords.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                Matched Concepts:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {evaluationResult.matched_keywords.map((kw, i) => (
                  <span key={i} className="badge badge-emerald" style={{ textTransform: 'none' }}>
                    <Check size={12} /> {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Model Answer Preview */}
          {evaluationResult.model_answer && (
            <div style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.06)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', marginBottom: '4px' }}>
                <BookOpen size={16} /> Reference Model Answer:
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {evaluationResult.model_answer}
              </p>
            </div>
          )}

          {/* Next Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              onClick={onNextQuestion}
              className="btn-primary"
              style={{ minWidth: '180px' }}
            >
              <span>{isLastQuestion ? 'Complete & View Results' : 'Next Question'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
