import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router';
import '../cssFiles/LoginPage.css';

const LoginPageCleaner = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/cleaners/login', {
        username: formData.username,
        password: formData.password
      });

      // Store the token and user data
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userType', 'cleaner');
      localStorage.setItem('userData', JSON.stringify(response.data.cleaner));

      // Show success message
      alert('Login successful!');

      // Redirect to cleaner dashboard with id
      navigate(`/cleaner/dashboard/${response.data.cleaner._id}`);

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 400) {
        setError('Invalid username or password');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Cleaner Login</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter your username"
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter your password"
          />

          <div className="forgot-password">
            <a href="/forgot-password">Forgot your password?</a>
          </div>

          {error && (
            <div className="error-message" style={{
              color: '#d32f2f',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'center',
              padding: '8px',
              backgroundColor: '#ffebee',
              border: '1px solid #f8bbd9',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '14px',
          color: '#666'
        }}>
          Don't have an account? 
          <a 
            href="/cleaner/signup" 
            style={{
              color: '#0077cc',
              textDecoration: 'none',
              marginLeft: '5px'
            }}
          >
            Sign up here
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPageCleaner;