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
        <NavLink to="/" className="nav-brand" title="TaskFlow Pro & Developer Portfolio">
          <div className="logo-icon-wrapper">
            <Boxes size={20} color="#ffffff" />
          </div>
          <div className="nav-title-group">
            <div className="brand-title-row">
              <span className="brand-title">TaskFlow <span style={{ color: '#38bdf8' }}>Pro</span></span>
              <span className="brand-badge">P1–P13</span>
            </div>
            <div className="nav-subtitle">
              <span className="pulse-dot" />
              <span>Brij Patel &bull; CHARUSAT</span>
            </div>
          </div>
        </NavLink>

        {/* Route Links (Pill Navigation - Practical 2 & Practical 10 Aesthetic) */}
        <nav className="nav-links" aria-label="Main navigation">
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

        {/* Action Controls & Diagnostic Utilities */}
        <div className="nav-actions">
          {/* AI Studio Assistant Modal Button (Practical 13) */}
          <button
            onClick={onOpenAIModal}
            className="nav-action-pill nav-action-ai"
            title="Practical 13: AI Integration & Responsible AI Panel"
          >
            <Sparkles size={14} />
            <span>AI Studio</span>
          </button>

          {/* EventEmitter Telemetry Modal Button (Practical 10) */}
          <button
            onClick={onOpenEventModal}
            className="nav-action-pill nav-action-events"
            title="Practical 10: Event-Driven Subsystem Telemetry"
          >
            <Radio size={13} />
            <span>Events</span>
          </button>

          {/* In-Memory Caching Toggle (Practical 9) */}
          <button
            onClick={() => setBypassCache(!bypassCache)}
            className={`nav-action-pill nav-action-cache ${bypassCache ? 'bypassed' : ''}`}
            title={bypassCache ? "In-Memory Cache is bypassed (?nocache=true)" : "In-Memory Cache is active (TTL: 60s)"}
          >
            <Zap size={13} />
            <span>{bypassCache ? 'Bypassed' : 'Cached'}</span>
          </button>

          {/* Chunk Inspector Badge (Practical 8) */}
          <button
            className="nav-action-pill nav-action-chunks"
            onClick={onOpenInspector}
            title="Practical 8: Inspect Dynamic Code-Split Chunks in Real Time"
          >
            <Activity size={13} />
            <span>{loadedRoutesCount}/5 Chunks</span>
          </button>

          {/* Auth State & Instant Guest Demo */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="nav-user-pill">
                <User size={13} />
                <span>{user?.name || 'Developer'}</span>
              </div>
              <button
                className="nav-btn-logout"
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                className="nav-action-pill nav-action-demo"
                onClick={loginAsGuest}
                title="1-Click Instant Guest Access"
              >
                <Play size={12} fill="#34d399" />
                <span>Demo</span>
              </button>
              <button
                className="nav-btn-signin"
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
