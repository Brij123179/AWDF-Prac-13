import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteLoadingFallback from './components/RouteLoadingFallback';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
import BundleInspectorModal from './components/BundleInspectorModal';
import EventArchitectureModal from './components/EventArchitectureModal';
import AIAssistantModal from './components/AIAssistantModal';
import NotificationToast from './components/NotificationToast';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { lazyWithMinDelay } from './utils/lazyWithMinDelay';

// Dynamic code-split route components (Practical 8)
const PortfolioPage = lazyWithMinDelay(() => import('./pages/PortfolioPage'), 200);
const HomePage = lazyWithMinDelay(() => import('./pages/HomePage'), 200);
const ProjectsPage = lazyWithMinDelay(() => import('./pages/ProjectsPage'), 200);
const PerformancePage = lazyWithMinDelay(() => import('./pages/PerformancePage'), 200);
const ContactPage = lazyWithMinDelay(() => import('./pages/ContactPage'), 200);

function AppRoutes({ addToast, onOpenAuthModal, onOpenAIModal, trackChunkLoaded }) {
  const location = useLocation();

  const getRouteLabel = (path) => {
    switch (path) {
      case '/tasks': return 'Tasks Workspace';
      case '/projects': return 'Projects';
      case '/performance': return 'Performance & Cache';
      case '/contact': return 'Contact';
      default: return 'Portfolio';
    }
  };

  useEffect(() => {
    trackChunkLoaded(location.pathname);
  }, [location.pathname]);

  return (
    <Suspense fallback={<RouteLoadingFallback routeName={getRouteLabel(location.pathname)} />}>
      <Routes>
        {/* Route 1: Combined Developer Portfolio (Practicals 1-13 Overview) */}
        <Route
          path="/"
          element={
            <PortfolioPage
              addToast={addToast}
              onOpenAuthModal={onOpenAuthModal}
              onOpenAIModal={onOpenAIModal}
            />
          }
        />

        {/* Route 2: Full-Stack TaskFlow Pro Workspace */}
        <Route
          path="/tasks"
          element={
            <HomePage
              addToast={addToast}
              onOpenAuthModal={onOpenAuthModal}
            />
          }
        />

        {/* Route 3: Projects Catalogue Deep Dive */}
        <Route
          path="/projects"
          element={
            <ProjectsPage
              addToast={addToast}
            />
          }
        />

        {/* Route 4: Performance, In-Memory Caching & Query Telemetry HUD */}
        <Route
          path="/performance"
          element={
            <PerformancePage
              addToast={addToast}
            />
          }
        />

        {/* Route 5: Interactive Contact Hub (Practical 2 & 6) */}
        <Route
          path="/contact"
          element={
            <ContactPage
              addToast={addToast}
            />
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <PortfolioPage
              addToast={addToast}
              onOpenAuthModal={onOpenAuthModal}
              onOpenAIModal={onOpenAIModal}
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

function MainApp() {
  const [toasts, setToasts] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [loadedChunks, setLoadedChunks] = useState(['/']);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const trackChunkLoaded = (path) => {
    setLoadedChunks((prev) => {
      if (!prev.includes(path)) {
        return [...prev, path];
      }
      return prev;
    });
  };

  return (
    <div className="app-container">
      <Navbar
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenEventModal={() => setIsEventModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        loadedRoutesCount={loadedChunks.length}
      />

      <main className="main-content">
        <ChunkErrorBoundary>
          <AppRoutes
            addToast={addToast}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenAIModal={() => setIsAIModalOpen(true)}
            trackChunkLoaded={trackChunkLoaded}
          />
        </ChunkErrorBoundary>
      </main>

      <EventArchitectureModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        addToast={addToast}
      />

      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      <BundleInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        loadedChunks={loadedChunks}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        addToast={addToast}
      />

      <NotificationToast toasts={toasts} onDismiss={removeToast} />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
