import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import { formatDate } from '@/lib/utils';
import type { WeddingEvent, WeddingTask, TaskPriority, TaskStatus } from '@/types';

export const EventsTasksPage: React.FC = () => {
  const { events, tasks, addEvent, updateEvent, deleteEvent, addTask, updateTask, deleteTask } = useWedding();

  const [activeTab, setActiveTab] = useState<'events' | 'tasks'>('events');

  // Event modal state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WeddingTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('To Do');
  const [taskDesc, setTaskDesc] = useState('');

  // Open Event Modal
  const openAddEvent = () => {
    setEditingEvent(null);
    setEventName('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime('18:00');
    setEventVenue('');
    setEventNotes('');
    setEventModalOpen(true);
  };

  const openEditEvent = (evt: WeddingEvent) => {
    setEditingEvent(evt);
    setEventName(evt.name);
    setEventDate(evt.event_date);
    setEventTime(evt.start_time || '');
    setEventVenue(evt.venue || '');
    setEventNotes(evt.notes || '');
    setEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDate) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        name: eventName,
        event_date: eventDate,
        start_time: eventTime || undefined,
        venue: eventVenue || undefined,
        notes: eventNotes || undefined,
      });
    } else {
      addEvent({
        wedding_id: 'wed-001',
        name: eventName,
        event_date: eventDate,
        start_time: eventTime || undefined,
        venue: eventVenue || undefined,
        notes: eventNotes || undefined,
      });
    }
    setEventModalOpen(false);
  };

  // Open Task Modal
  const openAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDueDate('');
    setTaskPriority('Medium');
    setTaskStatus('To Do');
    setTaskDesc('');
    setTaskModalOpen(true);
  };

  const openEditTask = (tsk: WeddingTask) => {
    setEditingTask(tsk);
    setTaskTitle(tsk.title);
    setTaskDueDate(tsk.due_date || '');
    setTaskPriority(tsk.priority);
    setTaskStatus(tsk.status);
    setTaskDesc(tsk.description || '');
    setTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: taskTitle,
        due_date: taskDueDate || undefined,
        priority: taskPriority,
        status: taskStatus,
        description: taskDesc || undefined,
      });
    } else {
      addTask({
        wedding_id: 'wed-001',
        title: taskTitle,
        due_date: taskDueDate || undefined,
        priority: taskPriority,
        status: taskStatus,
        description: taskDesc || undefined,
      });
    }
    setTaskModalOpen(false);
  };

  const toggleTaskCompleted = (tsk: WeddingTask) => {
    updateTask(tsk.id, {
      status: tsk.status === 'Completed' ? 'To Do' : 'Completed',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
            Ceremonies & Planning Tasks
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Organize the chronological wedding itinerary and manage actionable checklists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'events' ? (
            <button
              onClick={openAddEvent}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Ceremony Event</span>
            </button>
          ) : (
            <button
              onClick={openAddTask}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Checklist Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'events'
              ? 'border-rose-800 text-rose-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Wedding Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'tasks'
              ? 'border-rose-800 text-rose-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks & Checklist ({tasks.length})</span>
        </button>
      </div>

      {/* Events View */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-stone-500">
              No events added yet. Click "+ Add Ceremony Event" to add your ceremonies.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-xl border border-stone-200/90 p-5 shadow-xs hover:border-amber-300 transition-all space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="text-center px-3 py-1.5 rounded-lg bg-gradient-to-b from-rose-800 to-rose-950 text-white shadow-xs shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider block">
                          {new Date(evt.event_date).toLocaleString('en-US', { month: 'short' })}
                        </span>
                        <span className="font-serif-royal text-2xl font-bold leading-none block">
                          {new Date(evt.event_date).getDate()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                          Ceremony {idx + 1}
                        </span>
                        <h3 className="font-serif-royal text-lg font-bold text-stone-900 mt-1">
                          {evt.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditEvent(evt)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ceremony "${evt.name}"?`)) deleteEvent(evt.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                    {evt.start_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>Starts at {evt.start_time}</span>
                      </div>
                    )}
                    {evt.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{evt.venue}</span>
                      </div>
                    )}
                  </div>

                  {evt.notes && (
                    <div className="pt-2 border-t border-stone-100 text-xs text-stone-500 italic">
                      "{evt.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks View */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-600">
              <span>Task Checklist ({tasks.filter((t) => t.status === 'Completed').length} of {tasks.length} Completed)</span>
              <span>Priority & Actions</span>
            </div>

            <div className="divide-y divide-stone-100">
              {tasks.map((tsk) => {
                const isDone = tsk.status === 'Completed';
                return (
                  <div
                    key={tsk.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      isDone ? 'bg-stone-50/50' : 'hover:bg-stone-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskCompleted(tsk)}
                        className="mt-0.5 text-stone-400 hover:text-rose-800 transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-stone-400' : 'text-stone-900'
                          }`}
                        >
                          {tsk.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                          {tsk.due_date && <span>Due: {formatDate(tsk.due_date)}</span>}
                          {tsk.description && <span>• {tsk.description}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tsk.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : tsk.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {tsk.priority} Priority
                      </span>

                      <button
                        onClick={() => openEditTask(tsk)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete task "${tsk.title}"?`)) deleteTask(tsk.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-royal text-xl font-bold text-stone-900">
                {editingEvent ? 'Edit Ceremony Event' : 'Add Ceremony Event'}
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Ceremony Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sangeet & Cocktail Night"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. The Grand Ballroom, ITC Maurya"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Notes / Dress Code</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Traditional yellow attire, folk music..."
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-lg shadow-sm"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-royal text-xl font-bold text-stone-900">
                {editingTask ? 'Edit Task' : 'New Checklist Task'}
              </h3>
              <button onClick={() => setTaskModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coordinate vintage car for Baraat entry"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Details (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any vendor contacts or details..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-lg shadow-sm"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
