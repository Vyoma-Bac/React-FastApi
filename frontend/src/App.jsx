import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/homepage';
import Dashboard from './components/Dashboard';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/" />;
};

function App() {
    return (
    <Router>
      <>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/dashboard" element={<Dashboard />} />

        </Routes>
      </>
    </Router>
  );

}

export default App;
