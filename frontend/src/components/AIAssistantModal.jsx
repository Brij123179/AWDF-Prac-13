import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, RefreshCw, X, Bot, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AIAssistantModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [promptTitle, setPromptTitle] = useState('Implement OAuth 2.0 with Google and GitHub');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/status`);
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.warn('Failed to load AI status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (simulateFail = false) => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSimulationActive(simulateFail);
    const endpoint = simulateFail ? `${API_BASE_URL}/ai/simulate-failure` : `${API_BASE_URL}/ai/generate-description`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: promptTitle })
      });

      const data = await res.json();

      if (res.status === 429) {
        setErrorMsg(`⏱️ ${data.message}`);
        setGeneratedResult(null);
      } else if (data.success) {
        setGeneratedResult(data.data);
      } else {
        setErrorMsg(data.message || 'Generation failed');
      }
    } catch (err) {
      setErrorMsg(`Network error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '780px', width: '92%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', padding: '6px', borderRadius: '8px', color: '#fff' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Practical 13: AI Integration & Responsible AI Panel</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Secure Server-Side AI API Orchestration &amp; Graceful Degradation</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Status Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active AI Engine</span>
            <span style={{ fontSize: '0.78rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.3)' }}>
              {status?.activeProvider || 'Local Contextual Fallback Engine'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', fontSize: '0.82rem', marginTop: '0.6rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Rate Limit Policy:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1 req / 60 seconds</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>API Key Security:</span>
              <div style={{ fontWeight: 600, color: '#34d399' }}>Backend .env Only</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>PII Protection:</span>
              <div style={{ fontWeight: 600, color: '#818cf8' }}>Zero User Data Sent</div>
            </div>
          </div>
        </div>

        {/* Interactive Generation Sandbox */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            Test Task Title for AI Generation:
          </label>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              className="input-field"
              style={{ flex: 1 }}
              value={promptTitle}
              onChange={(e) => setPromptTitle(e.target.value)}
              placeholder="e.g. Optimize MongoDB aggregate queries with compound indexes"
            />
            <button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating || !promptTitle.trim()}
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              {isGenerating && !simulationActive ? (
                <>
                  <RefreshCw size={16} className="spinner-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate AI Suggestion
                </>
              )}
            </button>
            <button
              onClick={() => handleGenerate(true)}
              disabled={isGenerating}
              className="btn btn-secondary"
              style={{ whiteSpace: 'nowrap', border: '1px solid rgba(248,81,73,0.4)', color: '#f85149' }}
              title="Demonstrates Step 6: Graceful degradation upon simulated API failure"
            >
              <AlertTriangle size={15} />
              Simulate Failure (Step 6)
            </button>
          </div>
        </div>

        {/* Error / Rate Limit Banner */}
        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '0.8rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Generated Result Preview */}
        {generatedResult && (
          <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#a78bfa' }}>
                <Bot size={16} />
                <span>Generated Output ({generatedResult.provider})</span>
              </div>
              <span style={{ fontSize: '0.74rem', background: generatedResult.fallback ? 'rgba(245,158,11,0.15)' : 'rgba(52,211,153,0.15)', color: generatedResult.fallback ? '#fbbf24' : '#34d399', padding: '2px 8px', borderRadius: '10px' }}>
                {generatedResult.fallback ? '🛡️ Graceful Degradation Active' : '✨ Live Model Generation'}
              </span>
            </div>

            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '4px', lineHeight: 1.5 }}>
              {generatedResult.description}
            </pre>

            <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={14} />
              <span>{generatedResult.disclaimer}</span>
            </div>
          </div>
        )}

        {/* Responsible AI Guidelines Note */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
            🛡️ Responsible AI &amp; Privacy Policy (CO6 / PO12):
          </strong>
          API keys are quarantined strictly within backend environment files. No passwords, session tokens, or Personally Identifiable Information (PII) are ever submitted to the external AI model. All suggestions remain editable draft proposals under complete user control.
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;
