import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { apiRequest } from '../api';
import './Auth.css';

const Login = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiRequest('/login', 'POST', {
        username,
        password
      }, false, true); // false for auth, true for formData

      // Store the token
      localStorage.setItem('access_token', data.access_token);
      
      // Close modal and redirect
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
        <p className="auth-switch">
          Don't have an account?{' '}
          <button 
            className="link-button" 
            onClick={() => {
              onClose();
              // You can add logic here to open signup modal
            }}
          >
            Sign up
          </button>
        </p>
      </div>
    </Modal>
  );
};

export default Login; 