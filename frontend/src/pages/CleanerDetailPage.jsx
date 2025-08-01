import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import '../cssFiles/CleanerDetailPage.css';

const CleanerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cleaner, setCleaner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    startTime: '',
    endTime: '',
    note: ''
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Get client info from localStorage
  const clientData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    fetchCleanerDetails();
  }, [id]);

  const fetchCleanerDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/cleaners/${id}`);
      setCleaner(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching cleaner details:', err);
      setError('Failed to load cleaner details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookNow = () => {
    if (!clientData._id) {
      alert('You must be logged in to book a cleaner.');
      navigate('/client/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      // Here you would typically send the booking request to your backend
      // For now, we'll just show a success message
      const bookingPayload = {
        client: clientData._id,
        cleaner: cleaner._id,
        service: bookingData.service,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        note: bookingData.note
      };

      // This would be your booking API call
      // const response = await axios.post('http://localhost:5001/api/reservations', bookingPayload);
      
      alert('Booking request sent successfully! The cleaner will be notified.');
      setShowBookingModal(false);
      setBookingData({
        service: '',
        date: '',
        startTime: '',
        endTime: '',
        note: ''
      });
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const generateTimeOptions = (isStartTime = false) => {
    const times = [];
    
    // If cleaner has strict schedule and a date is selected, filter based on availability
    if (cleaner.scheduleType === 'STRICT' && bookingData.date) {
      const selectedDate = new Date(bookingData.date);
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = cleaner.schedule?.[dayName];
      
      if (daySchedule && daySchedule.available) {
        const startHour = parseInt(daySchedule.startTime.split(':')[0]);
        const startMinute = parseInt(daySchedule.startTime.split(':')[1]);
        const endHour = parseInt(daySchedule.endTime.split(':')[0]);
        const endMinute = parseInt(daySchedule.endTime.split(':')[1]);
        
        for (let hour = startHour; hour <= endHour; hour++) {
          let startMin = (hour === startHour) ? startMinute : 0;
          let endMin = (hour === endHour) ? endMinute : 59;
          
          for (let minute = startMin; minute <= endMin; minute += 30) {
            if (hour === endHour && minute > endMinute) break;
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            times.push(time);
          }
        }
      }
    } else {
      // Default time range for normal schedule or when no date selected
      for (let hour = 6; hour <= 22; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          times.push(time);
        }
      }
    }
    
    return times;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const isDateAvailable = (dateString) => {
    if (!dateString || !cleaner.schedule) return true;
    
    const selectedDate = new Date(dateString);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = cleaner.schedule[dayName];
    
    return daySchedule && daySchedule.available;
  };

  const getAvailableDatesMessage = () => {
    if (!cleaner.schedule) return '';
    
    const availableDays = Object.entries(cleaner.schedule)
      .filter(([_, dayData]) => dayData.available)
      .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1));
    
    if (availableDays.length === 0) return 'No available days';
    if (availableDays.length === 7) return 'Available all week';
    
    return `Available: ${availableDays.join(', ')}`;
  };

  if (loading) {
    return (
      <div className="detail-loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cleaner details...</p>
      </div>
    );
  }

  if (error || !cleaner) {
    return (
      <div className="detail-error-container">
        <h2>Error</h2>
        <p>{error || 'Cleaner not found'}</p>
        <button onClick={() => navigate('/client/dashboard')} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="cleaner-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/client/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Cleaner Profile</h1>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Left Column - Profile Info */}
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-large">
                {cleaner.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="profile-info">
              <h2 className="cleaner-name">{cleaner.name}</h2>
              
              <div className="rating-section">
                <div className="stars-large">
                  {renderStars(cleaner.stars || 0)}
                </div>
                <span className="rating-text">
                  {cleaner.stars ? cleaner.stars.toFixed(1) : '0.0'} out of 5
                </span>
                <span className="reviews-count">
                  ({cleaner.comments ? cleaner.comments.length : 0} reviews)
                </span>
              </div>

              <div className="price-section">
                <span className="price-large">${cleaner.hourlyPrice}</span>
                <span className="price-unit">/hour</span>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <strong>Email:</strong> {cleaner.email}
                </div>
                <div className="contact-item">
                  <strong>Phone:</strong> {cleaner.phoneNumber}
                </div>
                <div className="contact-item">
                  <strong>Age:</strong> {cleaner.age} years old
                </div>
                <div className="contact-item">
                  <strong>Gender:</strong> {cleaner.gender}
                </div>
              </div>

              <button onClick={handleBookNow} className="book-now-btn-large">
                Book This Cleaner
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Services & Details */}
        <div className="details-section">
          {/* Services */}
          <div className="section-card">
            <h3>Services Offered</h3>
            <div className="services-grid">
              {cleaner.service && cleaner.service.map((service, index) => (
                <div key={index} className="service-item">
                  <span className="service-icon">🧹</span>
                  <span className="service-name">{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="section-card">
            <h3>Availability</h3>
            <div className="schedule-info">
              <div className="schedule-type-indicator">
                <span className={`schedule-badge ${cleaner.scheduleType?.toLowerCase() || 'normal'}`}>
                  {cleaner.scheduleType === 'STRICT' ? 'Strict Schedule' : 'Flexible Schedule'}
                </span>
                <p className="schedule-type-desc">
                  {cleaner.scheduleType === 'STRICT' 
                    ? 'Bookings are only available during the specified hours below.'
                    : 'Preferred hours shown below. Other times may be available upon request.'}
                </p>
              </div>
              
              <div className="weekly-schedule">
                <h4>Weekly Schedule</h4>
                <div className="schedule-days">
                  {Object.entries(cleaner.schedule || {}).map(([day, dayData]) => (
                    <div key={day} className={`schedule-day ${dayData.available ? 'available' : 'unavailable'}`}>
                      <span className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <span className="day-hours">
                        {dayData.available 
                          ? `${dayData.startTime} - ${dayData.endTime}`
                          : 'Not Available'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="booking-notes">
                <p><strong>Minimum booking:</strong> 2 hours</p>
                {cleaner.scheduleType === 'NORMAL' && (
                  <small>* Times outside scheduled hours may be available. Please discuss with the cleaner.</small>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="section-card">
            <h3>Customer Reviews</h3>
            <div className="reviews-section">
              {cleaner.comments && cleaner.comments.length > 0 ? (
                cleaner.comments.map((comment, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-avatar">
                        {String.fromCharCode(65 + (index % 26))}
                      </div>
                      <div className="reviewer-info">
                        <span className="reviewer-name">Client {index + 1}</span>
                        <div className="review-stars">
                          {renderStars(Math.floor(Math.random() * 2) + 4)}
                        </div>
                      </div>
                    </div>
                    <p className="review-text">{comment}</p>
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review this cleaner!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book {cleaner.name}</h3>
              <button 
                onClick={() => setShowBookingModal(false)} 
                className="close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-group">
                <label>Service Type</label>
                <select 
                  name="service" 
                  value={bookingData.service} 
                  onChange={handleBookingChange}
                  required
                >
                  <option value="">Select a service</option>
                  {cleaner.service && cleaner.service.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={bookingData.date} 
                  onChange={handleBookingChange}
                  min={getMinDate()}
                  required 
                />
                <div className="date-availability-info">
                  <small className="availability-message">
                    {getAvailableDatesMessage()}
                  </small>
                  {bookingData.date && !isDateAvailable(bookingData.date) && (
                    <small className="date-warning">
                      ⚠️ Selected date is not in the cleaner's regular schedule
                      {cleaner.scheduleType === 'STRICT' && ' and cannot be booked'}
                    </small>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <select 
                    name="startTime" 
                    value={bookingData.startTime} 
                    onChange={handleBookingChange}
                    required
                    disabled={!bookingData.date}
                  >
                    <option value="">Select start time</option>
                    {generateTimeOptions(true).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {!bookingData.date && (
                    <small className="time-helper">Please select a date first</small>
                  )}
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <select 
                    name="endTime" 
                    value={bookingData.endTime} 
                    onChange={handleBookingChange}
                    required
                    disabled={!bookingData.startTime}
                  >
                    <option value="">Select end time</option>
                    {generateTimeOptions(false).filter(time => time > bookingData.startTime).map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {!bookingData.startTime && (
                    <small className="time-helper">Please select start time first</small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea 
                  name="note" 
                  value={bookingData.note} 
                  onChange={handleBookingChange}
                  placeholder="Any special instructions or requirements..."
                  rows="3"
                />
              </div>

              <div className="booking-summary">
                <p><strong>Estimated Cost:</strong></p>
                <p>Service: {bookingData.service || 'Not selected'}</p>
                <p>Duration: {bookingData.startTime && bookingData.endTime ? 
                  `${bookingData.startTime} - ${bookingData.endTime}` : 'Not selected'}</p>
                <p className="total-cost">
                  Total: ${bookingData.startTime && bookingData.endTime ? 
                    (calculateHours(bookingData.startTime, bookingData.endTime) * cleaner.hourlyPrice).toFixed(2) : '0.00'}
                </p>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowBookingModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-booking-btn"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate hours between two times
const calculateHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  if (endTotalMinutes <= startTotalMinutes) return 0;
  
  return (endTotalMinutes - startTotalMinutes) / 60;
};

export default CleanerDetailPage;