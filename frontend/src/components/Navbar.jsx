import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Briefcase, CheckSquare, FolderKanban, Mail, BarChart3,
  Activity, User, LogOut, LogIn, Boxes, Zap, Radio, Sparkles, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ apiStatus, onOpenAuthModal, onOpenInspector, onOpenEventModal, onOpenAIModal, loadedRoutesCount = 1 }) => {
  const { user, isAuthenticated, logout, loginAsGuest, bypassCache, setBypassCache } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <NavLink to="/" className="nav-brand">
          <div className="logo-icon-wrapper">
            <Boxes size={20} color="#ffffff" />
          </div>
          <div className="nav-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1>Brij Patel</h1>
              <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                Full-Stack
              </span>
            </div>
            <div className="nav-subtitle">
              <span className="pulse-dot" />
              <span>CHARUSAT ITUE301 &bull; Practicals 1-13 Capstone</span>
            </div>
          </div>
        </NavLink>

        {/* Route Links (React Router) */}
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <Briefcase size={15} />
            <span>Portfolio</span>
          </NavLink>

          <NavLink
            to="/tasks"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CheckSquare size={15} />
            <span>Tasks</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <FolderKanban size={15} />
            <span>Projects</span>
          </NavLink>

          <NavLink
            to="/performance"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={15} />
            <span>Telemetry</span>
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Mail size={15} />
            <span>Contact</span>
          </NavLink>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          {/* EventEmitter Telemetry Modal Button (Practical 10) */}
          <button
            onClick={onOpenEventModal}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#60a5fa' }}
            title="Practical 10: Event-Driven Subsystem Telemetry"
          >
            <Radio size={13} />
            <span>Events</span>
          </button>

          {/* AI Studio Assistant Modal Button (Practical 13) */}
          <button
            onClick={onOpenAIModal}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.78rem',
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.3)'
            }}
            title="Practical 13: AI Integration & Responsible AI Panel"
          >
            <Sparkles size={13} />
            <span>AI Studio</span>
          </button>

          {/* In-Memory Caching Toggle (Practical 9) */}
          <button
            onClick={() => setBypassCache(!bypassCache)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.78rem',
              color: bypassCache ? '#fbbf24' : '#34d399'
            }}
            title={bypassCache ? "In-Memory Cache is bypassed (?nocache=true)" : "In-Memory Cache is active (TTL: 60s)"}
          >
            <Zap size={13} />
            <span>{bypassCache ? 'Bypass' : 'Cached'}</span>
          </button>

          {/* Chunk Inspector Badge (Practical 8) */}
          <button
            className="chunk-badge-btn"
            onClick={onOpenInspector}
            title="Practical 8: Inspect Dynamic Code-Split Chunks in Real Time"
          >
            <Activity size={13} />
            <span>{loadedRoutesCount}/5 Chunks</span>
          </button>

          {/* Auth State & Instant Guest Demo */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(37, 99, 235, 0.12)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  fontSize: '0.8rem',
                  color: '#93c5fd'
                }}
              >
                <User size={13} />
                <span style={{ fontWeight: 600 }}>{user?.name || 'Developer'}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Sign Out"
                style={{ padding: '0.35rem 0.55rem' }}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={loginAsGuest}
                title="1-Click Instant Guest Access"
                style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
              >
                <Play size={12} fill="#34d399" />
                <span>Demo Mode</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={onOpenAuthModal}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
