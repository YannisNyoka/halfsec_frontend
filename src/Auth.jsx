import React, { useState } from 'react';
import './Auth.css';

export function Signup({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // TODO: Add signup API call
    setError('');
    alert('Signup successful!');
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
        {error && <div className="auth-error">{error}</div>}
        <button className="auth-btn" type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <span className="auth-link" onClick={onSwitch}>Sign In</span></p>
    </div>
  );
}

export function Signin({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Add signin API call
    setError('');
    alert('Signin successful!');
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        {error && <div className="auth-error">{error}</div>}
        <button className="auth-btn" type="submit">Sign In</button>
      </form>
      <p>Don't have an account? <span className="auth-link" onClick={onSwitch}>Sign Up</span></p>
    </div>
  );
}
