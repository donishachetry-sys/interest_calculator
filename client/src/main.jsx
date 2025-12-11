import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import PersonProfile from './components/PersonProfile.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import './index.css';


const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};


const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {}
        <Route path="/" element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        } />
        
        <Route path="/person/:name" element={
          <ProtectedRoute>
            <PersonProfile />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);