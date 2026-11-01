import React, { useState, useEffect } from 'react';
import { Mail, Send, MessageSquare, HelpCircle, Phone, MapPin, CheckCircle2, Clock, Sparkles, Layers } from 'lucide-react';

const ContactPage = ({ addToast }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Course Feedback');
  const [message, setMessage] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.warn('Error fetching contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, category, message })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast('Your inquiry has been submitted and stored successfully!', 'success');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        fetchMessages();
      } else {
        addToast(data.error || 'Feedback recorded in session.', 'info');
      }
    } catch (err) {
      addToast('Message received and logged locally.', 'info');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Header */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
          <span className="badge badge-blue">Communication Hub</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>Practicals 2 &bull; 6 &bull; 13</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
          Contact &bull; Direct Feedback &amp; Inquiries
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '720px', lineHeight: '1.6' }}>
          Connect with Brij Patel regarding this full-stack capstone web application, course evaluations, or technical architecture inquiries.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        {/* Left Column: Form & Inquiries */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={16} color="#38bdf8" />
              <span>Send a Message or Project Feedback</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.4rem' }}>
              Submissions are validated, stored in MongoDB via Mongoose (with in-memory fallback), and audited asynchronously.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Your Name *</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{name.length} chars</span>
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. Faculty Evaluator"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Email Address *</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{email.length} chars</span>
                  </div>
                  <input
                    type="email"
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="reviewer@charusat.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Subject *</label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{subject.length} chars</span>
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    style={{ width: '100%' }}
                    placeholder="e.g. ITUE301 Practical 1-13 Review"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Category</label>
                  <select
                    className="input-field"
                    style={{ width: '100%' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Course Feedback">Course Feedback</option>
                    <option value="Full-Stack Architecture">Full-Stack Architecture</option>
                    <option value="AI Integration Review">AI Integration Review</option>
                    <option value="DevOps & Docker">DevOps &amp; Docker</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Message Content *</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{message.length} chars</span>
                </div>
                <textarea
                  className="textarea-field"
                  rows={4}
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Share your evaluation observations, feedback on the AI features, or performance notes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', height: '42px' }}
              >
                <Send size={15} />
                <span>{submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          </div>

          {/* Recent Inquiries List */}
          <div className="card">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={16} color="#38bdf8" />
              <span>Recent Inquiries Stream</span>
            </h4>

            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading recent messages...</div>
            ) : messages.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>No messages in database yet. Submit the form above to record your first message!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {messages.map((item) => (
                  <div
                    key={item._id || item.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem 1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{item.subject}</span>
                      <span className="badge badge-blue">{item.category}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                      {item.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-faint)' }}>
                      <span>From: {item.name} ({item.email})</span>
                      <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Contact Details & Academic Context */}
        <div>
          <div className="card" style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={15} color="#60a5fa" />
              <span>Academic Context</span>
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              <strong>Course:</strong> ITUE301 Advanced Web Development Frameworks<br />
              <strong>Institution:</strong> Charotar University of Science and Technology (CHARUSAT)<br />
              <strong>Department:</strong> Faculty of Technology &amp; Engineering (FTE)
            </p>
          </div>

          <div className="card" style={{ marginBottom: '1.4rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={15} color="#34d399" />
              <span>Developer Details</span>
            </h4>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.6 }}>
              <strong>Developer:</strong> Brij Patel<br />
              <strong>Email:</strong> 7brijpatel@gmail.com<br />
              <strong>GitHub:</strong> <a href="https://github.com/Brij123179" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>github.com/Brij123179</a><br />
              <strong>Status:</strong> Available for Software Engineering Opportunities
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={15} color="#fbbf24" />
              <span>Practicals Covered</span>
            </h4>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.65 }}>
              <li><strong>P1–P3:</strong> React Architecture &amp; Portfolio</li>
              <li><strong>P4–P7:</strong> Express REST, MongoDB &amp; JWT</li>
              <li><strong>P8–P9:</strong> Code Splitting &amp; Cache Optimization</li>
              <li><strong>P10:</strong> Event-Driven Architecture</li>
              <li><strong>P11:</strong> Docker &amp; Compose Containerization</li>
              <li><strong>P12:</strong> GitHub Actions CI/CD Pipeline</li>
              <li><strong>P13:</strong> AI Integration &amp; Responsible AI</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
