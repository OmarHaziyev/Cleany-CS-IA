import React, { useState } from 'react';
import '../cssFiles/CleanerSignup.css';
import axios from "axios"

const CleanerSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    service: [],
    age: '',
    gender: '',
    hourlyPrice: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updatedServices = checked
        ? [...prev.service, value]
        : prev.service.filter((s) => s !== value);
      return { ...prev, service: updatedServices };
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (Number(formData.hourlyPrice) <= 5) {
    alert("Hourly price must be greater than $5.");
    return;
  }

  try {
    const response = await axios.post('http://localhost:5001/api/cleaners', formData);
    alert("Cleaner created successfully!");
    console.log(response.data);
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Signup failed.");
  }
};

  return (
    <div className="signup-container">
      <h2>Cleaner Signup</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="tel" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />

        <label><strong>Select Services</strong></label>
        <div className="checkbox-group">
          <label><input type="checkbox" value="house cleaning" onChange={handleCheckboxChange} /> House Cleaning</label>
          <label><input type="checkbox" value="deep cleaning" onChange={handleCheckboxChange} /> Deep Cleaning</label>
          <label><input type="checkbox" value="carpet cleaning" onChange={handleCheckboxChange} /> Carpet Cleaning</label>
          <label><input type="checkbox" value="window cleaning" onChange={handleCheckboxChange} /> Window Cleaning</label>
        </div>

        <input type="number" name="hourlyPrice" placeholder="Price per hour ($)" onChange={handleChange} required />

        <input type="number" name="age" placeholder="Age" onChange={handleChange} required />
        <select name="gender" onChange={handleChange} required>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <div className="placeholder-box">
          <p><strong>Profile Picture</strong></p>
          <p className="placeholder-text">[ Placeholder for profile picture upload ]</p>
        </div>

        <div className="placeholder-box">
          <p><strong>Schedule Selector</strong></p>
          <p className="placeholder-text">[ Placeholder for day/hour-based GUI ]</p>
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default CleanerSignup;
