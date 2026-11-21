import { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      status: 'Pending',
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const updateStatus = (id, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.title);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, title: editText.trim() } : task
      )
    );
    setEditingId(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === 'All' || task.status === filterStatus;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-center">Task Manager</h1>

        {/* Task Progress Monitor */}
        <p className="text-center text-sm text-slate-400 mb-6">
          Total: <span className="text-white font-semibold">{tasks.length}</span>{' '}
          | Completed:{' '}
          <span className="text-emerald-400 font-semibold">{completedCount}</span>{' '}
          | Remaining:{' '}
          <span className="text-amber-400 font-semibold">
            {tasks.length - completedCount}
          </span>
        </p>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded font-semibold"
          >
            Add
          </button>
        </form>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 mb-3 rounded bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:border-blue-500"
        />

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Filtered Task List */}
        {tasks.length === 0 ? (
          <p className="text-center text-slate-400">No tasks yet. Add one above!</p>
        ) : filteredTasks.length === 0 ? (
          <p className="text-center text-slate-400">No matching tasks found.</p>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800 p-4 rounded border border-slate-700"
              >
                {editingId === task.id ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p
                      className={`font-medium break-words ${
                        task.status === 'Completed'
                          ? 'line-through text-slate-400'
                          : ''
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="bg-slate-700 text-sm p-2 rounded border border-slate-600 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </button>

                      <button
                        onClick={() => startEdit(task)}
                        className="bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded text-sm font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}