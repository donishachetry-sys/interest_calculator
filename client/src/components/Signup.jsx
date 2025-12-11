import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ 
    username: '', 
    fullName: '', 
    email: '', 
    password: '' 
   
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("✅ Account Created! Please Login.");
        navigate('/login');
      } else {
        alert("❌ Error: " + data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("❌ Network Error. Please try again.");
      setIsLoading(false);
    }
  };

  
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90vh',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '2.5rem',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      width: '100%',
      maxWidth: '450px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '0.9rem',
      color: '#6b7280',
    },
    formGroup: {
      marginBottom: '1.2rem',
    },
    label: {
      display: 'block',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.4rem',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: '0.95rem',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb', 
      color: '#1f2937',
      outline: 'none',
      transition: 'all 0.2s',
    },
    eyeButton: {
      position: 'absolute',
      right: '12px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      width: '100%',
      padding: '0.85rem',
      marginTop: '1.5rem',
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
      textAlign: 'center',
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
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Join the Platform</h2>
          <p style={styles.subtitle}>Start managing your finances today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          
          {}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              placeholder="Ex: Monica Bhalla" 
              onChange={handleChange} 
              required 
              style={styles.input}
              onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.backgroundColor = '#f9fafb'; e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          {}
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              name="username" 
              placeholder="Unique ID" 
              onChange={handleChange} 
              required 
              style={styles.input}
              onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.backgroundColor = '#f9fafb'; e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          {}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="name@example.com" 
              onChange={handleChange} 
              required 
              style={styles.input}
              onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.target.style.backgroundColor = '#f9fafb'; e.target.style.borderColor = '#e5e7eb'; }}
            />
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
                onFocus={(e) => { e.target.style.backgroundColor = '#fff'; e.target.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.target.style.backgroundColor = '#f9fafb'; e.target.style.borderColor = '#e5e7eb'; }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;