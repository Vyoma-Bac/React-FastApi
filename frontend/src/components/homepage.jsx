import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Login from './Login';
import Signup from './Signup';
import './homepage.css';

const Homepage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <div className="homepage-container">
      <div className="hero-section">
        <h1>Welcome to TaskMaster</h1>
        <p className="subtitle">Organize your tasks, boost your productivity</p>
        
        <div className="cta-buttons">
          <button
            onClick={() => {
              setIsLoginOpen(true);
              setIsSignupOpen(false);
            }}
            className="btn btn-primary"
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignupOpen(true);
              setIsLoginOpen(false);
            }}
            className="btn btn-secondary"
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <i className="fas fa-tasks"></i>
          <h3>Task Management</h3>
          <p>Create, organize, and track your tasks efficiently</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-bell"></i>
          <h3>Reminders</h3>
          <p>Never miss important deadlines with smart reminders</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-chart-line"></i>
          <h3>Progress Tracking</h3>
          <p>Monitor your productivity and achieve your goals</p>
        </div>
      </div>

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Signup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
    </div>
  );
};

export default Homepage;
