import React, { useState, useEffect } from 'react';
import TaskStats from '../components/TaskStats';
import TaskFilters from '../components/TaskFilters';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskEditModal from '../components/TaskEditModal';
import TaskDeleteConfirmModal from '../components/TaskDeleteConfirmModal';
import CacheMetricsCard from '../components/CacheMetricsCard';
import CacheBenchmarkModal from '../components/CacheBenchmarkModal';
import ExplainQueryModal from '../components/ExplainQueryModal';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, ShieldAlert, Sparkles, RefreshCw, Layers, Zap, Play } from 'lucide-react';

const HomePage = ({ addToast, onOpenAuthModal }) => {
  const { isAuthenticated, authFetch, loginAsGuest } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    completed: '',
    sortBy: 'createdAt'
  });

  // Modal states
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  const fetchTasks = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.completed !== '') queryParams.append('completed', filters.completed);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

      const res = await authFetch(`/api/tasks?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setTasks(data.data || []);
        if (data.stats) setStats(data.stats);

        // Feedback on cache status
        if (res.eventData) {
          if (res.eventData.cacheHeader === 'HIT') {
            addToast(`⚡ Cache HIT: ${data.count} tasks retrieved from node-cache in ${res.eventData.duration}ms`, 'success');
          } else if (res.eventData.cacheHeader === 'MISS') {
            addToast(`🍃 Cache MISS: MongoDB queried in ${res.eventData.duration}ms and saved to cache`, 'info');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      const res = await authFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task created & cache invalidated on server!', 'success');
        fetchTasks();
      } else {
        addToast(data.error || 'Failed to create task', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (taskId, nextCompletedState) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: nextCompletedState } : t))
      );

      const res = await authFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: nextCompletedState })
      });
      const data = await res.json();

      if (data.success) {
        addToast(
          nextCompletedState ? 'Task completed (Cache invalidated)' : 'Task marked pending (Cache invalidated)',
          'info'
        );
        fetchTasks();
      }
    } catch (err) {
      fetchTasks(); // Revert on error
      addToast(err.message, 'error');
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const res = await authFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task updated & cache invalidated!', 'success');
        fetchTasks();
      } else {
        addToast(data.error || 'Update failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await authFetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task deleted & cache invalidated!', 'info');
        setDeletingTask(null);
        fetchTasks();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSeedTasks = async () => {
    try {
      const res = await authFetch('/api/tasks/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast(`Seeded ${data.count} starter tasks. Cache refreshed!`, 'success');
        fetchTasks();
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      {/* Page Hero Header */}
      <section className="page-hero">
        <div className="hero-text">
          <h2>Task Dashboard & Optimization Lab</h2>
          <p>
            Combined Performance Hub: Client route lazy loading (<code>page-home.js</code>) + Server-side In-Memory Caching (<code>node-cache</code>) with automatic write invalidation.
          </p>
        </div>
        <div className="hero-badges">
          <span className="badge badge-indigo">
            <Layers size={13} />
            Route: / (Home Chunk)
          </span>
          <span className="badge badge-emerald">
            <Zap size={13} />
            node-cache (TTL: 60s)
          </span>
        </div>
      </section>

      {!isAuthenticated ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '640px', margin: '2rem auto' }}>
          <ShieldAlert size={48} color="#60a5fa" style={{ marginBottom: '1rem', opacity: 0.9 }} />
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            TaskFlow Pro &bull; Production Workspace
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
            To view, create, edit, and delete tasks with real-time in-memory caching and AI description generation, launch with 1-click Demo Mode or sign in with your credentials.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={loginAsGuest}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              <Play size={15} fill="#ffffff" />
              <span>1-Click Live Demo Mode</span>
            </button>
            <button className="btn btn-secondary" onClick={onOpenAuthModal}>
              Sign In / Register
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Server-Side Cache Telemetry HUD */}
          <CacheMetricsCard
            onSeedTasks={handleSeedTasks}
            onOpenBenchmark={() => setIsBenchmarkOpen(true)}
            onOpenExplain={() => setIsExplainOpen(true)}
            addToast={addToast}
          />

          <TaskStats stats={stats} />
          <TaskForm onAddTask={handleAddTask} isSubmitting={isSubmitting} />
          <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={setEditingTask}
            onDeleteRequest={setDeletingTask}
            onSeed={handleSeedTasks}
          />
        </>
      )}

      {/* Edit Modal */}
      <TaskEditModal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        onUpdateTask={handleUpdateTask}
      />

      {/* Delete Modal */}
      <TaskDeleteConfirmModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        task={deletingTask}
        onConfirmDelete={handleDeleteTask}
      />

      {/* Cache Benchmark Modal */}
      <CacheBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* Query Explain Modal */}
      <ExplainQueryModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
      />
    </div>
  );
};

export default HomePage;
