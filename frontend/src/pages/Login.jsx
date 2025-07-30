// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login request to the backend
      const response = await axios.post('http://localhost:5001/api/cleaners/login', {
        username,
        password,
      });

      // If login is successful, store the token in localStorage
      localStorage.setItem('authToken', response.data.token);

      // Redirect to dashboard or protected page
      window.location.href = '/dashboard'; // Change to the route you want to redirect to

    } catch (err) {
      console.error('Login error', err);
      setError('Invalid credentials or server error');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
