import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ username: '', message: '' });
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchMessages();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/tasks`, newTask);
      setNewTask({ title: '', description: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      await axios.put(`${API_URL}/tasks/${task.id}`, {
        ...task,
        completed: !task.completed
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await axios.delete(`${API_URL}/tasks/${id}`);
        fetchTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.username || !newMessage.message) return;
    try {
      await axios.post(`${API_URL}/messages`, newMessage);
      setNewMessage({ username: '', message: '' });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 React + FastAPI</h1>
        <div className="tabs">
          <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
            📋 Tasks
          </button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
            💬 Guestbook
          </button>
        </div>
      </header>

      <main className="container">
        {activeTab === 'tasks' && (
          <>
            <div className="card">
              <h2>➕ New Task</h2>
              <form onSubmit={createTask}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  rows="3"
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </form>
            </div>

            <div className="tasks-list">
              <h2>📌 Your Tasks ({tasks.length})</h2>
              {tasks.length === 0 ? (
                <div className="empty">No tasks yet. Create one!</div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className={`task ${task.completed ? 'completed' : ''}`}>
                    <div className="task-content" onClick={() => toggleTask(task)}>
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <small>{new Date(task.created_at).toLocaleString()}</small>
                    </div>
                    <button className="delete" onClick={() => deleteTask(task.id)}>🗑️</button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'chat' && (
          <div className="guestbook">
            <div className="card">
              <h2>💬 Leave a message</h2>
              <form onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={newMessage.username}
                  onChange={(e) => setNewMessage({...newMessage, username: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Your message"
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  rows="3"
                  required
                />
                <button type="submit">Send Message</button>
              </form>
            </div>

            <div className="messages">
              <h2>📝 Guestbook entries ({messages.length})</h2>
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="empty">No messages yet. Be the first!</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className="message">
                      <strong>👤 {msg.username}</strong>
                      <p>{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;