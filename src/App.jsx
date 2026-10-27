import React, { useState, useEffect, useRef } from 'react';
import {
  Pin,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  Circle,
  ArrowRight
} from 'lucide-react';
import './App.css';

const DEFAULT_NOTES = [
  {
    id: 'default-1',
    text: 'Hover over the screen edge to expand this widget',
    completed: false,
    priority: 'low',
    createdAt: 'Just now'
  },
  {
    id: 'default-2',
    text: 'Click 📌 to lock the panel open while taking notes',
    completed: false,
    priority: 'medium',
    createdAt: 'Just now'
  },
  {
    id: 'default-3',
    text: 'Switch dock edges anytime using Left, Top, or Right buttons',
    completed: true,
    priority: 'high',
    createdAt: 'Just now'
  }
];

export default function App() {
  // Persistence states
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('edge_notes_data');
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  const [dock, setDock] = useState(() => {
    return localStorage.getItem('edge_notes_dock') || 'right';
  });

  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem('edge_notes_pinned') === 'true';
  });

  // UI / Interaction states
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('medium'); // 'low' | 'medium' | 'high'
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  const collapseTimeoutRef = useRef(null);

  // Sync dock position with Electron main process on mount & changes
  useEffect(() => {
    if (window.electronAPI?.setDock) {
      window.electronAPI.setDock(dock);
    }
    localStorage.setItem('edge_notes_dock', dock);
  }, [dock]);

  // Sync pinned state with localStorage
  useEffect(() => {
    localStorage.setItem('edge_notes_pinned', String(isPinned));
  }, [isPinned]);

  // Sync notes with localStorage
  useEffect(() => {
    localStorage.setItem('edge_notes_data', JSON.stringify(notes));
  }, [notes]);

  // Handle initial expand state if pinned
  useEffect(() => {
    if (isPinned) {
      setIsCollapsed(false);
      window.electronAPI?.setExpand(true);
    }
  }, []);

  // Hover to expand
  const handleMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }

    if (isCollapsed) {
      setIsCollapsed(false);
      window.electronAPI?.setExpand(true);
    }
  };

  // Mouse leave to collapse
  const handleMouseLeave = () => {
    // Prevent collapse if manually pinned, input is focused, or editing
    if (isPinned || isInputFocused || editingId !== null) {
      return;
    }

    collapseTimeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
      window.electronAPI?.setExpand(false);
    }, 280);
  };

  // Switch dock position
  const handleDockChange = (newDock) => {
    setDock(newDock);
  };

  // Toggle Pin
  const togglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    if (!nextPinned && !isInputFocused && editingId === null) {
      // If unpinning and cursor leaves, it can collapse
    }
  };

  // Close Application
  const handleClose = () => {
    if (window.electronAPI?.closeApp) {
      window.electronAPI.closeApp();
    }
  };

  // CRUD: Add Note
  const handleAddNote = (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const newNote = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setNotes([newNote, ...notes]);
    setInputText('');
  };

  // CRUD: Toggle Complete
  const toggleComplete = (id) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n)));
  };

  // CRUD: Start Edit
  const startEditing = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  // CRUD: Save Edit
  const saveEdit = (id) => {
    const text = editText.trim();
    if (text) {
      setNotes(notes.map((n) => (n.id === id ? { ...n, text } : n)));
    }
    setEditingId(null);
    setEditText('');
  };

  // CRUD: Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // CRUD: Delete Note
  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  // Clear all completed notes
  const clearCompleted = () => {
    setNotes(notes.filter((n) => !n.completed));
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (filter === 'active') return !n.completed;
    if (filter === 'completed') return n.completed;
    return true;
  });

  const activeCount = notes.filter((n) => !n.completed).length;
  const completedCount = notes.filter((n) => n.completed).length;

  return (
    <div
      className="widget-root"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 8px Collapsed Trigger Strip */}
      {isCollapsed ? (
        <div
          className={`trigger-strip dock-${dock}`}
          title="Hover to expand Edge Notes"
        />
      ) : (
        /* Full Expanded Panel */
        <div className={`widget-panel dock-${dock}`}>
          {/* Header */}
          <div className="widget-header">
            <div className="header-left">
              <div className="app-badge">
                <Sparkles size={14} />
              </div>
              <span className="app-title">Edge Notes</span>
            </div>

            <div className="header-controls">
              {/* Dock Position Selector */}
              <div className="dock-selector">
                <button
                  type="button"
                  className={`dock-btn ${dock === 'left' ? 'active' : ''}`}
                  onClick={() => handleDockChange('left')}
                  title="Dock to Left Edge"
                >
                  L
                </button>
                <button
                  type="button"
                  className={`dock-btn ${dock === 'top' ? 'active' : ''}`}
                  onClick={() => handleDockChange('top')}
                  title="Dock to Top Edge"
                >
                  T
                </button>
                <button
                  type="button"
                  className={`dock-btn ${dock === 'right' ? 'active' : ''}`}
                  onClick={() => handleDockChange('right')}
                  title="Dock to Right Edge"
                >
                  R
                </button>
              </div>

              {/* Pin Toggle */}
              <button
                type="button"
                className={`icon-action-btn ${isPinned ? 'pinned' : ''}`}
                onClick={togglePin}
                title={isPinned ? 'Pinned (Always Expanded)' : 'Auto-Hides on Mouse Leave (Click to Pin)'}
              >
                <Pin size={13} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                className="icon-action-btn close-btn"
                onClick={handleClose}
                title="Exit Edge Notes"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filter & Counter Tabs */}
          <div className="filter-tabs">
            <div className="tabs-group">
              <button
                type="button"
                className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({notes.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Done ({completedCount})
              </button>
            </div>

            {completedCount > 0 && (
              <button
                type="button"
                className="clear-btn"
                onClick={clearCompleted}
                title="Clear all completed tasks"
              >
                Clear Done
              </button>
            )}
          </div>

          {/* Note Input Area */}
          <form className="note-input-container" onSubmit={handleAddNote}>
            <div className="input-row">
              <input
                type="text"
                className="note-input"
                placeholder="Add a quick note or task... (Enter to save)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              <button
                type="submit"
                className="add-btn"
                disabled={!inputText.trim()}
                title="Add Note"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="input-options-row">
              <div className="priority-tags">
                <button
                  type="button"
                  className={`priority-btn low ${priority === 'low' ? 'active' : ''}`}
                  onClick={() => setPriority('low')}
                >
                  Low
                </button>
                <button
                  type="button"
                  className={`priority-btn medium ${priority === 'medium' ? 'active' : ''}`}
                  onClick={() => setPriority('medium')}
                >
                  Med
                </button>
                <button
                  type="button"
                  className={`priority-btn high ${priority === 'high' ? 'active' : ''}`}
                  onClick={() => setPriority('high')}
                >
                  High
                </button>
              </div>

              <span className="pin-hint">
                {isPinned ? '📌 Locked Open' : 'Hover-Expand Enabled'}
              </span>
            </div>
          </form>

          {/* Notes List */}
          <div className="notes-container">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <ClipboardList size={32} className="empty-icon" />
                <span className="empty-title">
                  {filter === 'completed' ? 'No completed tasks yet' : 'No notes found'}
                </span>
                <span className="empty-sub">
                  Type above to jot down quick notes, reminders, or to-dos.
                </span>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`note-item ${note.completed ? 'completed' : ''}`}
                >
                  <div className="note-main-row">
                    {/* Checkbox */}
                    <div
                      className={`checkbox-container ${note.completed ? 'checked' : ''}`}
                      onClick={() => toggleComplete(note.id)}
                      title={note.completed ? 'Mark as incomplete' : 'Mark as done'}
                    >
                      {note.completed && <Check size={12} strokeWidth={3} />}
                    </div>

                    {/* Note Content / Inline Edit */}
                    <div className="note-content-col">
                      {editingId === note.id ? (
                        <input
                          type="text"
                          className="inline-edit-input"
                          value={editText}
                          autoFocus
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(note.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onBlur={() => saveEdit(note.id)}
                        />
                      ) : (
                        <span
                          className="note-text"
                          onDoubleClick={() => startEditing(note)}
                          title="Double-click to edit"
                        >
                          {note.text}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Note Meta & Actions */}
                  <div className="note-footer">
                    <div className="note-meta">
                      <span className={`priority-dot ${note.priority || 'medium'}`} />
                      <span className="note-time">{note.createdAt || 'Recent'}</span>
                    </div>

                    <div className="note-actions">
                      {editingId === note.id ? (
                        <>
                          <button
                            type="button"
                            className="note-action-btn save-edit"
                            onClick={() => saveEdit(note.id)}
                            title="Save changes"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            className="note-action-btn"
                            onClick={cancelEdit}
                            title="Cancel edit"
                          >
                            <RotateCcw size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="note-action-btn"
                            onClick={() => startEditing(note)}
                            title="Edit note"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            className="note-action-btn delete"
                            onClick={() => deleteNote(note.id)}
                            title="Delete note"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="widget-footer">
            <span className="footer-hint">
              {activeCount} active {activeCount === 1 ? 'task' : 'tasks'}
            </span>
            <div className="pin-status-indicator">
              <span className={`status-dot ${isPinned ? 'pinned' : ''}`} />
              <span>{isPinned ? 'Pinned' : 'Auto-Hide'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
