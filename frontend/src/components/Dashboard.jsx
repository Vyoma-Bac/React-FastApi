import React, { useState, useEffect } from 'react';
import { apiRequest, fetchTodoStats } from '../api';
import TodoList from './TodoList';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ completed: 0, pending: 0, total: 0 });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiRequest('/users/me');
        setUser(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const statsData = await fetchTodoStats();
        setStats(statsData);
      } catch (err) {
        // Optionally handle stats error
      }
    };

    fetchUserData();
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  };

  return (
      <>
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-left">
            <i className="fas fa-tasks"></i>
            <h1>TaskMaster</h1>
          </div>
          <div className="nav-right">
            {loading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <div className="user-info">
                  <i className="fas fa-user-circle"></i>
                  <span>Welcome, {user?.username}</span>
                </div>
                <button onClick={handleLogout} className="logout-button">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-content">
            <h2>Your Tasks</h2>
            <p>Manage and organize your tasks efficiently</p>
          </div>
          <div className="stats-container">
            <div className="stat-card completed">
              <div className="accent-bar"></div>
              <i className="fas fa-check-circle"></i>
              <div className="stat-info">
                <h3>Completed</h3>
                <p>{stats.completed} Tasks</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="accent-bar"></div>
              <i className="fas fa-clock"></i>
              <div className="stat-info">
                <h3>Pending</h3>
                <p>{stats.pending} Tasks</p>
              </div>
            </div>
            <div className="stat-card total">
              <div className="accent-bar"></div>
              <i className="fas fa-calendar-alt"></i>
              <div className="stat-info">
                <h3>Total</h3>
                <p>{stats.total} Tasks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="todo-container">
          <TodoList />
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
