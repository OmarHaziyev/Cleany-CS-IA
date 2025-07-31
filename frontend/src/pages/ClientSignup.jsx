import React, { useState } from 'react';
import '../cssFiles/ClientSignup.css';
import axios from "axios"

const ClientSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    age: '',
    gender: '',
    address: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/clients', formData);
      alert("Client account created successfully!");
      console.log(response.data);
      
      // Redirect to login page
      window.location.href = '/client/login';
    } catch (err) {
      console.error("Error submitting form:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="client-signup-container">
      <h2>Client Signup</h2>
      <form onSubmit={handleSubmit} className="client-signup-form">
        <input 
          type="text" 
          name="name" 
          placeholder="Full Name" 
          value={formData.name}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="text" 
          name="username" 
          placeholder="Username" 
          value={formData.username}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          value={formData.password}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          value={formData.email}
          onChange={handleChange} 
          required 
        />
        
        <input 
          type="tel" 
          name="phoneNumber" 
          placeholder="Phone Number" 
          value={formData.phoneNumber}
          onChange={handleChange} 
          required 
        />

        <input 
          type="number" 
          name="age" 
          placeholder="Age" 
          value={formData.age}
          onChange={handleChange} 
          required 
        />
        
        <select 
          name="gender" 
          value={formData.gender}
          onChange={handleChange} 
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <textarea 
          name="address" 
          placeholder="Full Address" 
          value={formData.address}
          onChange={handleChange} 
          required
          rows="3"
        />

        <button type="submit">Sign Up</button>
      </form>

      <div className="login-link">
        Already have an account? 
        <a href="/client/login">Login here</a>
      </div>
    </div>
  );
};

export default ClientSignup;