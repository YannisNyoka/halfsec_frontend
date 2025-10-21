import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from './config/api';
import './Auth.css';

function SignupPage() {
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // API call to your backend
      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
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
        // Handle specific error messages
        if (response.status === 409) {
          setError('User already exists. Please try logging in instead.');
        } else {
          setError(data.error || 'Signup failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Signup error:', err);
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
        <h2>Create Your Account</h2>
        <p className="auth-subtitle">Join HalfSec and start your journey</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <input 
              type="text" 
              name="firstName" 
              placeholder="First Name" 
              value={form.firstName} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="lastName" 
              placeholder="Last Name" 
              value={form.lastName} 
              onChange={handleChange} 
              required 
            />
          </div>
          
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
            placeholder="Password (min. 6 characters)" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
          
          <input 
            type="password" 
            name="confirmPassword" 
            placeholder="Confirm Password" 
            value={form.confirmPassword} 
            onChange={handleChange} 
            required 
          />
          
          {error && <div className="auth-error">{error}</div>}
          
          <button 
            className="auth-btn" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? 
          <Link to="/login" className="auth-link"> Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;