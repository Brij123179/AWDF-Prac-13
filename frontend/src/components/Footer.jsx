import React from 'react';
import { Terminal, GitBranch, Cpu, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(8, 11, 18, 0.95)',
      padding: '2rem 1.8rem',
      marginTop: 'auto',
      fontSize: '0.82rem',
      color: 'var(--text-muted)'
    }}>
      <div style={{ maxWidth: '1260px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.2rem' }}>
            <Terminal size={15} color="#38bdf8" />
            <span>Brij Patel &bull; TaskFlow Pro Capstone Platform</span>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-faint)' }}>
            Charotar University of Science and Technology (CHARUSAT) &bull; ITUE301: Advanced Web Development Frameworks
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Cpu size={14} color="#34d399" />
            <span>Practicals 1–13 Unified</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#38bdf8" />
            <span>Server-Side Isolated AI</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <GitBranch size={14} color="#fbbf24" />
            <span>CI/CD Automated Testing</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
