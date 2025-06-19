import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import './TodoList.css';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const fetchTodos = async () => {
    try {
      const data = await apiRequest('/todos/');
      setTodos(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchTodos();
      return;
    }
    try {
      const data = await apiRequest(`/todos/search/?query=${searchQuery}`);
      setTodos(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/todos/', 'POST', newTodo);
      setTodos([...todos, data]);
      setNewTodo({ title: '', description: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleComplete = async (todoId) => {
    try {
      const data = await apiRequest(`/todos/${todoId}/complete`, 'PATCH');
      setTodos(todos.map(todo => todo.id === todoId ? data : todo));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const data = await apiRequest(`/todos/${todoId}`, 'DELETE');
      setSuccess(data.message);
      setTodos(todos.filter(todo => todo.id !== todoId));

    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className="todo-list">
      <div className="todo-actions">
        <form onSubmit={handleCreateTodo} className="todo-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="todo-input"
              required
            />
            <textarea
              placeholder="Add a description (optional)"
              value={newTodo.description}
              onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              className="todo-textarea"
            />
            <button type="submit" className="add-button">
              <i className="fas fa-plus"></i>
              Add Task
            </button>
          </div>
        </form>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-group">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
       {success && (
        <div className="success-message">
          <i className="fas fa-exclamation-circle"></i>
          {success}
        </div>
      )}


      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading tasks...</span>
        </div>
      ) : (
        <div className="todos-container">
          {todos.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-clipboard-list"></i>
              <p>No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''}`}
              >
                <div className="todo-content">
                  <div className="todo-header">
                    <h3>{todo.title}</h3>
                  </div>
                  {todo.description && (
                    <p className="todo-description">{todo.description}</p>
                  )}
                </div>
                <div className="todo-actions-stack">
                  <div className="todo-date">
                    <i className="far fa-calendar"></i>
                    {new Date(todo.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleToggleComplete(todo.id)}
                    className={`toggle-button ${todo.completed ? 'completed' : ''}`}
                  >
                    <i className={`fas ${todo.completed ? 'fa-undo' : 'fa-check'}`}></i>
                    {todo.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="delete-button"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TodoList;