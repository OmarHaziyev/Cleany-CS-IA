import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import '../cssFiles/CleanerSignup.css';

const CleanerSignup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    age: '',
    gender: '',
    hourlyPrice: '',
    service: [],
    schedule: {
      monday: { available: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
      thursday: { available: false, startTime: '09:00', endTime: '17:00' },
      friday: { available: false, startTime: '09:00', endTime: '17:00' },
      saturday: { available: false, startTime: '09:00', endTime: '17:00' },
      sunday: { available: false, startTime: '09:00', endTime: '17:00' }
    },
    scheduleType: 'NORMAL', // STRICT or NORMAL
    comments: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const serviceOptions = [
    'house cleaning',
    'deep cleaning', 
    'carpet cleaning',
    'window cleaning',
    'office cleaning',
    'move-in/move-out cleaning',
    'post-construction cleaning',
    'upholstery cleaning'
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(time);
      }
    }
    return times;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      service: prev.service.includes(service)
        ? prev.service.filter(s => s !== service)
        : [...prev.service, service]
    }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const handleScheduleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      scheduleType: type
    }));
  };

  const setAllDaysSchedule = (startTime, endTime) => {
    const newSchedule = { ...formData.schedule };
    Object.keys(newSchedule).forEach(day => {
      if (newSchedule[day].available) {
        newSchedule[day].startTime = startTime;
        newSchedule[day].endTime = endTime;
      }
    });
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const toggleAllDays = (available) => {
    const newSchedule = { ...formData.schedule };
    Object.keys(newSchedule).forEach(day => {
      newSchedule[day].available = available;
    });
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const validateStep = (step) => {
  switch (step) {
    case 1:
      return formData.name && formData.username && formData.email && formData.password && formData.phoneNumber;
    case 2:
      // Age validation - FIXED: Check age first and return false with specific error
      const age = parseInt(formData.age);
      if (!formData.age || age < 18 || age > 80) {
        setError('Age must be between 18 and 80 years old.');
        return false;
      }
      
      // Price validation
      const hasValidPrice = parseFloat(formData.hourlyPrice) >= 5;
      if (!formData.hourlyPrice || !hasValidPrice) {
        setError('Hourly price must be at least $5.');
        return false;
      }
      
      // Check other required fields
      if (!formData.gender || !formData.service.length) {
        setError('Please fill in all required fields.');
        return false;
      }
      
      return true;
    case 3:
      const hasAvailableDay = Object.values(formData.schedule).some(day => day.available);
      if (!hasAvailableDay) {
        setError('Please set your availability for at least one day.');
        return false;
      }
      return true;
    default:
      return true;
  }
};

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please fill in all required fields before continuing.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    const age = parseInt(formData.age);
    const price = parseFloat(formData.hourlyPrice);
    
    if (age < 18 || age > 80) {
      setError('Age must be between 18 and 80 years old.');
      return;
    }
    
    if (price < 5) {
      setError('Hourly price must be at least $5.');
      return;
    }
    
    if (!validateStep(3)) {
      setError('Please set your availability for at least one day.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert service names to lowercase to match backend enum
      const submissionData = {
        ...formData,
        service: formData.service.map(s => s.toLowerCase()),
        age: parseInt(formData.age),
        hourlyPrice: parseFloat(formData.hourlyPrice)
      };
      
      const response = await axios.post('http://localhost:5001/api/cleaners', submissionData);
      console.log('Signup successful:', response.data);
      alert('Account created successfully! Please login to continue.');
      navigate('/cleaner/login');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h2>Personal Information</h2>
      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="form-group">
        <label>Username *</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Choose a username"
          required
        />
      </div>

      <div className="form-group">
        <label>Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label>Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Create a strong password"
          required
        />
      </div>

      <div className="form-group">
        <label>Phone Number *</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          required
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h2>Professional Details</h2>
      <div className="form-row">
        <div className="form-group">
          <label>Age *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Your age"
            min="18"
            max="80"
            required
          />
        </div>

        <div className="form-group">
          <label>Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Hourly Price ($) *</label>
        <input
          type="number"
          name="hourlyPrice"
          value={formData.hourlyPrice}
          onChange={handleInputChange}
          placeholder="Your hourly rate"
          min="5"
          max="100"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label>Services Offered * (Select at least one)</label>
        <div className="services-grid">
          {serviceOptions.map((service) => (
            <div key={service} className="service-checkbox">
              <input
                type="checkbox"
                id={service}
                checked={formData.service.includes(service)}
                onChange={() => handleServiceChange(service)}
              />
              <label htmlFor={service}>{service}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h2>Set Your Schedule</h2>
      
      {/* Schedule Type Selection */}
      <div className="schedule-type-section">
        <h3>Schedule Flexibility</h3>
        <div className="schedule-type-options">
          <div 
            className={`schedule-type-card ${formData.scheduleType === 'NORMAL' ? 'selected' : ''}`}
            onClick={() => handleScheduleTypeChange('NORMAL')}
          >
            <div className="schedule-type-header">
              <input
                type="radio"
                name="scheduleType"
                value="NORMAL"
                checked={formData.scheduleType === 'NORMAL'}
                onChange={() => handleScheduleTypeChange('NORMAL')}
              />
              <h4>Normal Schedule</h4>
            </div>
            <p>Clients can request times outside your set hours. You can discuss and confirm with them.</p>
            <div className="schedule-type-badge normal">Flexible</div>
          </div>

          <div 
            className={`schedule-type-card ${formData.scheduleType === 'STRICT' ? 'selected' : ''}`}
            onClick={() => handleScheduleTypeChange('STRICT')}
          >
            <div className="schedule-type-header">
              <input
                type="radio"
                name="scheduleType"
                value="STRICT"
                checked={formData.scheduleType === 'STRICT'}
                onChange={() => handleScheduleTypeChange('STRICT')}
              />
              <h4>Strict Schedule</h4>
            </div>
            <p>Clients can only book within your set hours. No exceptions or negotiations.</p>
            <div className="schedule-type-badge strict">Fixed</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="schedule-quick-actions">
        <h3>Quick Setup</h3>
        <div className="quick-action-buttons">
          <button 
            type="button" 
            onClick={() => toggleAllDays(true)}
            className="quick-action-btn"
          >
            Select All Days
          </button>
          <button 
            type="button" 
            onClick={() => toggleAllDays(false)}
            className="quick-action-btn"
          >
            Deselect All Days
          </button>
          <button 
            type="button" 
            onClick={() => setAllDaysSchedule('09:00', '17:00')}
            className="quick-action-btn"
          >
            Set All to 9 AM - 5 PM
          </button>
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="schedule-section">
        <h3>Weekly Schedule *</h3>
        <p className="schedule-note">
          {formData.scheduleType === 'STRICT' 
            ? 'Clients can only book within these hours.' 
            : 'These are your preferred hours. Clients can request other times for discussion.'}
        </p>

        <div className="schedule-grid">
          {daysOfWeek.map(({ key, label }) => (
            <div key={key} className="day-schedule-card">
              <div className="day-header">
                <div className="day-checkbox">
                  <input
                    type="checkbox"
                    id={`${key}-available`}
                    checked={formData.schedule[key].available}
                    onChange={(e) => handleScheduleChange(key, 'available', e.target.checked)}
                  />
                  <label htmlFor={`${key}-available`} className="day-label">
                    {label}
                  </label>
                </div>
              </div>

              {formData.schedule[key].available && (
                <div className="time-inputs">
                  <div className="time-input-group">
                    <label>Start Time</label>
                    <select
                      value={formData.schedule[key].startTime}
                      onChange={(e) => handleScheduleChange(key, 'startTime', e.target.value)}
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div className="time-input-group">
                    <label>End Time</label>
                    <select
                      value={formData.schedule[key].endTime}
                      onChange={(e) => handleScheduleChange(key, 'endTime', e.target.value)}
                    >
                      {generateTimeOptions().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {!formData.schedule[key].available && (
                <div className="unavailable-day">
                  <span>Not Available</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="schedule-summary">
        <h4>Schedule Summary</h4>
        <div className="summary-content">
          <p><strong>Type:</strong> {formData.scheduleType === 'STRICT' ? 'Strict Schedule' : 'Normal Schedule'}</p>
          <div className="available-days">
            <strong>Available Days:</strong>
            {Object.entries(formData.schedule)
              .filter(([_, dayData]) => dayData.available)
              .map(([day, dayData]) => (
                <div key={day} className="summary-day">
                  <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                  <span className="day-time">{dayData.startTime} - {dayData.endTime}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cleaner-signup-container">
      <div className="signup-header">
        <h1>Join as a Professional Cleaner</h1>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>
      </div>

      <div className="signup-form-container">
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" onClick={prevStep} className="prev-btn">
                Previous
              </button>
            )}

            {currentStep < 3 ? (
              <button type="button" onClick={nextStep} className="next-btn">
                Next
              </button>
            ) : (
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <div className="form-footer">
          <p>Already have an account? <a href="/cleaner/login">Login here</a></p>
        </div>
      </div>
    </div>
  );
};

export default CleanerSignup;