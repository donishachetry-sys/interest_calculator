import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
       
        setTimeout(() => {
             navigate('/'); 
             window.location.reload(); 
        }, 500);
      } else {
        alert("❌ Error: " + data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Network Error. Please try again.");
      setIsLoading(false);
    }
  };

 
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '20px',
      fontFamily: "'Poppins', sans-serif"
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '2.5rem',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.2rem',
      textAlign: 'left',
    },
    label: {
      display: 'block',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#4b5563',
      marginBottom: '0.5rem',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb', 
      color: '#1f2937',
      outline: 'none',
      transition: 'all 0.2s ease-in-out',
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      width: '100%',
      padding: '0.85rem',
      marginTop: '1rem',
      backgroundColor: '#6366f1',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      opacity: isLoading ? 0.7 : 1,
      transition: 'background-color 0.2s',
    },
    footerText: {
      marginTop: '1.5rem',
      color: '#6b7280',
      fontSize: '0.9rem',
    },
    link: {
      color: '#6366f1',
      fontWeight: '600',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.container}>
      {}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');`}
      </style>

      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        
        <form onSubmit={handleSubmit}>
          {}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <input 
                type="email" 
                name="email" 
                onChange={handleChange} 
                required 
                placeholder="name@example.com"
                style={styles.input}
              />
            </div>
          </div>

          {}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                onChange={handleChange} 
                required 
                placeholder="••••••••"
                style={{...styles.input, paddingRight: '40px'}} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {}
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <p style={styles.footerText}>
          New here? <Link to="/signup" style={styles.link}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;