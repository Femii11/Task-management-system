import { useState, useEffect } from 'react';

export default function App() {
  // AUTHENTICATION
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('tm_currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // TASK MANAGER
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');


  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // AUTH HANDLER
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const email = authEmail.trim().toLowerCase();
    const password = authPassword.trim();

    if (!email || !password || (isRegisterMode && !authName.trim())) {
      setAuthError('Please fill in all fields.');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('tm_users') || '[]');

    if (isRegisterMode) {
      const userExists = existingUsers.some((u) => u.email === email);
      if (userExists) {
        setAuthError('An account with this email already exists. Please log in.');
        return;
      }
      const newUser = { name: authName.trim(), email, password };
      localStorage.setItem('tm_users', JSON.stringify([...existingUsers, newUser]));
      localStorage.setItem('tm_currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
    } else {
      const matchedUser = existingUsers.find(
        (u) => u.email === email && u.password === password
      );
      if (!matchedUser) {
        setAuthError('Invalid email or password. Create an account if you are new.');
        return;
      }
      localStorage.setItem('tm_currentUser', JSON.stringify(matchedUser));
      setCurrentUser(matchedUser);
    }

    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleLogout = () => {
    localStorage.removeItem('tm_currentUser');
    setCurrentUser(null);
  };

  //TASK CRUD HANDLER
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || '',
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
    setExpiresAt('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const updateStatus = (id, newStatus) => {
    // Cancel active edit if task moves out of Pending (In Progress or Completed)
    if (newStatus !== 'Pending' && editingId === id) {
      setEditingId(null);
    }
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const startEdit = (task) => {
    // Only Pending tasks can be edited
    if (task.status !== 'Pending') return;
    setEditingId(task.id);
    setEditText(task.title);
    setEditDescription(task.description || '');
    setEditExpiresAt(task.expiresAt || '');
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              title: editText.trim(),
              description: editDescription.trim(),
              expiresAt: editExpiresAt,
            }
          : task
      )
    );
    setEditingId(null);
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'No expiry';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if an uncompleted task has passed its expiration time
  const isTaskExpired = (task) => {
    if (!task.expiresAt || task.status === 'Completed') return false;
    return new Date(task.expiresAt) < new Date();
  };

  // Distinct text styling for each status
  const getTaskTextStyle = (status) => {
    if (status === 'Completed') return 'line-through text-slate-400';
    if (status === 'In Progress') return 'italic font-semibold text-blue-600';
    return 'font-medium text-slate-800';
  };

  const getDescriptionTextStyle = (status) => {
    if (status === 'Completed') return 'line-through text-slate-300';
    if (status === 'In Progress') return 'italic text-blue-500/80';
    return 'text-slate-500';
  };

 
  const getStatusBadgeStyle = (status) => {
    if (status === 'Completed')
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status === 'In Progress')
      return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  //LOGIN / SIGN UP PAGE
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Task Manager</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isRegisterMode
                ? 'Create an account to manage your tasks'
                : 'Sign in to access your task dashboard'}
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              {isRegisterMode ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError('');
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              {isRegisterMode ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // DERIVED FILTER & COUNTS
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === 'All' || task.status === filterStatus;
    const query = search.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  // MAIN DASHBOARD PAGE
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Task Manager</h1>
            <p className="text-xs text-slate-500">Welcome, {currentUser.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
          >
            Log Out
          </button>
        </div>
      </header>
<main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Add New Task Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <form onSubmit={handleAddTask} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a new task..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Expiration Time
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  + New Task
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Task Description
              </label>
              <textarea
                rows="2"
                placeholder="Write a brief description of what this task involves..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
          </form>
        </div>

        {/* Task Records Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header: Title + Subtitle + Search */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Task records</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {filteredTasks.length} of {tasks.length} tasks • {completedCount}{' '}
                completed
              </p>
            </div>

            <input
              type="text"
              placeholder="Search title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Filter Tabs */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap gap-2">
            {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Responsive Table */}
          {tasks.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              No task records yet. Add your first task above!
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">
              No matching tasks found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">#</th>
                    <th className="py-3.5 px-4">Task & Description</th>
                    <th className="py-3.5 px-4">Added At</th>
                    <th className="py-3.5 px-4">Expires At</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Update Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTasks.map((task, index) => {
                    const canEdit = task.status === 'Pending';
                    const expired = isTaskExpired(task);

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/80 transition align-top"
                      >
                        <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-medium">
                          {index + 1}
                        </td>

                        <td className="py-3.5 px-4 min-w-[220px] max-w-xs">
                          {editingId === task.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded border border-blue-500 text-sm text-slate-800 focus:outline-none"
                              />
                              <textarea
                                rows="2"
                                placeholder="Task description..."
                                value={editDescription}
                                onChange={(e) =>
                                  setEditDescription(e.target.value)
                                }
                                className="w-full px-2.5 py-1.5 rounded border border-blue-500 text-xs text-slate-700 focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className={getTaskTextStyle(task.status)}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p
                                  className={`text-xs mt-1 leading-relaxed ${getDescriptionTextStyle(
                                    task.status
                                  )}`}
                                >
                                  {task.description}
                                </p>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                          {formatDateTime(task.createdAt || task.id)}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          {editingId === task.id ? (
                            <input
                              type="datetime-local"
                              value={editExpiresAt}
                              onChange={(e) => setEditExpiresAt(e.target.value)}
                              className="px-2 py-1 rounded border border-blue-500 text-xs text-slate-800 focus:outline-none"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={
                                  expired
                                    ? 'text-red-600 font-semibold'
                                    : 'text-slate-600'
                                }
                              >
                                {formatDateTime(task.expiresAt)}
                              </span>
                              {expired && (
                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                                  Expired
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateStatus(task.id, e.target.value)
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-600"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                          {editingId === task.id ? (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => saveEdit(task.id)}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => startEdit(task)}
                                disabled={!canEdit}
                                title={
                                  !canEdit
                                    ? 'Only Pending tasks can be edited'
                                    : 'Edit task'
                                }
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                                  !canEdit
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="px-2.5 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-semibold transition"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}