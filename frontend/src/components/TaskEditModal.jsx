import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Sparkles, RefreshCw, AlertTriangle, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TaskEditModal = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [completed, setCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiDisclaimer, setAiDisclaimer] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setCompleted(!!task.completed);
      setAiDisclaimer('');
      setAiError('');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleGenerateAI = async () => {
    if (!title.trim()) return;
    setIsGeneratingAI(true);
    setAiError('');

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
        if (result.data.suggestedPriority) setPriority(result.data.suggestedPriority);
        setAiDisclaimer(result.data.disclaimer);
      } else {
        setAiError(result.message || 'AI generation failed');
      }
    } catch (err) {
      setAiError('Failed to communicate with AI service');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    await onUpdateTask(task._id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} color="var(--accent-indigo)" />
            <h3>Edit Task Details</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Title</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ margin: 0 }}>Description / Acceptance Criteria</label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI || !title.trim()}
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  color: '#c4b5fd',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: isGeneratingAI ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {isGeneratingAI ? <RefreshCw size={12} className="spinner-pulse" /> : <Sparkles size={12} />}
                <span>{isGeneratingAI ? 'Generating...' : '✨ Re-generate with AI'}</span>
              </button>
            </div>

            {aiError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={14} />
                <span>{aiError}</span>
              </div>
            )}

            <textarea
              rows={5}
              className="textarea-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.84rem' }}
            />

            {aiDisclaimer && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.76rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={13} />
                <span>{aiDisclaimer}</span>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                className="input-field"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="input-field"
                value={completed ? 'true' : 'false'}
                onChange={(e) => setCompleted(e.target.value === 'true')}
              >
                <option value="false">Pending</option>
                <option value="true">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} />
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
