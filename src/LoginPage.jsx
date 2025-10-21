import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import './Auth.css';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // API call to your backend
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user token and data
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Check if user is admin and redirect accordingly
        if (data.user.isAdmin) {
          navigate('/admin'); // Redirect to admin dashboard for admin users
        } else {
          navigate('/dashboard'); // Redirect to regular dashboard for normal users
        }
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link to="/" className="logo-link">
          <div className="logo">HalfSec</div>
        </Link>
      </div>
      
      <div className="auth-container">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your HalfSec account</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
          
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
          
          {error && <div className="auth-error">{error}</div>}
          
          <button 
            className="auth-btn" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? 
          <Link to="/signup" className="auth-link"> Create Account</Link>
        </p>
        
        <p className="auth-footer">
          <Link to="/forgot-password" className="auth-link">Forgot your password?</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;