import { useState } from 'react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Task Manager</h1>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
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

        {/* Task List */}
        {tasks.length === 0 ? (
          <p className="text-center text-slate-400">No tasks yet. Add one above!</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
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
                      </select>

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
