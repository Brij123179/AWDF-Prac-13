import React, { useState } from 'react';
import { PlusCircle, Loader2, Sparkles, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TaskForm = ({ onAddTask, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiDisclaimer, setAiDisclaimer] = useState('');
  const [aiError, setAiError] = useState('');
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  const handleGenerateAI = async () => {
    if (!title.trim()) {
      setAiError('Please enter a task title first so AI has context to generate a description.');
      return;
    }

    setIsGeneratingAI(true);
    setAiError('');
    setAiDisclaimer('');

    try {
      const response = await fetch(`${API_BASE_URL}/ai/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() })
      });

      const result = await response.json();

      if (response.status === 429) {
        setAiError(result.message || 'Rate limit reached: Maximum 1 AI request per minute.');
        return;
      }

      if (result.success && result.data) {
        setDescription(result.data.description);
        if (result.data.suggestedPriority) {
          setPriority(result.data.suggestedPriority);
        }
        setAiDisclaimer(result.data.disclaimer || '⚠️ AI-generated suggestion: Please review before saving.');
        setIsFallbackMode(Boolean(result.data.fallback));
      } else {
        setAiError(result.message || 'Failed to generate AI description.');
      }
    } catch (err) {
      console.warn('AI Generation network error:', err);
      setAiError('Unable to connect to backend AI service. Manual entry active.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setAiDisclaimer('');
    setAiError('');
    setIsFallbackMode(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-card)',
        padding: '1.4rem',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--glass-border)',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} color="var(--accent-indigo)" />
          Create New Task
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Powered by Secure Backend AI Orchestration
        </span>
      </div>

      <div className="task-form-controls">
        <input
          type="text"
          className="input-field"
          placeholder="Task title (e.g. Implement Docker healthcheck)..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (aiError) setAiError('');
          }}
          required
        />

        <select
          className="input-field"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ height: '42px' }}
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? (
            <Loader2 size={16} className="spinner-pulse" />
          ) : (
            <>
              <PlusCircle size={16} />
              Add Task
            </>
          )}
        </button>
      </div>

      {/* AI Generate Button & Description Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Task Description / Acceptance Criteria (Editable Suggestion):
        </label>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isGeneratingAI || !title.trim()}
          style={{
            background: isGeneratingAI ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(59,130,246,0.25))',
            border: '1px solid rgba(139,92,246,0.5)',
            color: '#c4b5fd',
            borderRadius: '6px',
            padding: '4px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: isGeneratingAI || !title.trim() ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          title="Click to generate detailed structured task breakdown and priority using server-side AI"
        >
          {isGeneratingAI ? (
            <>
              <RefreshCw size={13} className="spinner-pulse" />
              <span>🧠 Generating with AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>✨ Generate with AI</span>
            </>
          )}
        </button>
      </div>

      {/* AI Loading State Banner (Supplementary Problem 1) */}
      {isGeneratingAI && (
        <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', padding: '0.6rem 0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#c4b5fd', fontSize: '0.82rem' }}>
          <Loader2 size={15} className="spinner-pulse" />
          <span>Analyzing task context and generating technical breakdown...</span>
        </div>
      )}

      {/* Rate Limit / Error Banner (Supplementary Problem 2) */}
      {aiError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '0.6rem 0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontSize: '0.82rem' }}>
          <AlertCircle size={15} />
          <span>{aiError}</span>
        </div>
      )}

      {/* Description Textarea (Editable by user - never locked) */}
      <textarea
        rows={4}
        className="input-field"
        style={{
          width: '100%',
          fontFamily: description ? 'ui-monospace, monospace' : 'inherit',
          fontSize: '0.84rem',
          lineHeight: '1.45',
          resize: 'vertical'
        }}
        placeholder="Enter description manually, or type a title above and click '✨ Generate with AI'..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Visible AI Disclaimer Banner (Supplementary Problem 3 & Core Requirement) */}
      {aiDisclaimer && (
        <div style={{ marginTop: '0.5rem', background: isFallbackMode ? 'rgba(245,158,11,0.1)' : 'rgba(139,92,246,0.1)', border: `1px solid ${isFallbackMode ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.3)'}`, borderRadius: '6px', padding: '0.5rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: isFallbackMode ? '#fbbf24' : '#c4b5fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={14} />
            <span>{aiDisclaimer}</span>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
            {isFallbackMode ? '🛡️ Graceful Fallback' : '✨ Model Output'}
          </span>
        </div>
      )}
    </form>
  );
};

export default TaskForm;
