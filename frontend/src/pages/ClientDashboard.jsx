import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import '../cssFiles/ClientDashboard.css';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    stars: '',
    price: '',
    age: '',
    gender: '',
    service: ''
  });

  // Get client info from localStorage
  const clientData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Fetch all cleaners on component mount
  useEffect(() => {
    fetchCleaners();
  }, []);

  const fetchCleaners = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/cleaners');
      setCleaners(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching cleaners:', err);
      setError('Failed to load cleaners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      // Remove empty filters
      const activeFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          activeFilters[key] = filters[key];
        }
      });

      let response;
      if (Object.keys(activeFilters).length > 0) {
        response = await axios.post('http://localhost:5001/api/cleaners/filter', activeFilters);
      } else {
        response = await axios.get('http://localhost:5001/api/cleaners');
      }
      
      setCleaners(response.data);
      setError('');
    } catch (err) {
      console.error('Error applying filters:', err);
      if (err.response?.status === 404) {
        setCleaners([]);
        setError('No cleaners found matching your filters.');
      } else {
        setError('Failed to apply filters. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      stars: '',
      price: '',
      age: '',
      gender: '',
      service: ''
    });
    fetchCleaners();
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    window.location.href = '/';
  };

  const handleViewProfile = (cleanerId) => {
    navigate(`/cleaner/${cleanerId}`);
  };

  const handleBookNow = (cleanerId) => {
    navigate(`/cleaner/${cleanerId}`);
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

  return (
    <div className="client-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Find Your Perfect Cleaner</h1>
          <p>Welcome back, {clientData.name || 'Client'}!</p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Sidebar - Filters */}
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All
            </button>
          </div>

          <div className="filter-group">
            <label>Star Rating</label>
            <select name="stars" value={filters.stars} onChange={handleFilterChange}>
              <option value="">Any Rating</option>
              <option value="4-5">4+ Stars</option>
              <option value="3-5">3+ Stars</option>
              <option value="2-5">2+ Stars</option>
              <option value="1-5">1+ Stars</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Hourly Price ($)</label>
            <select name="price" value={filters.price} onChange={handleFilterChange}>
              <option value="">Any Price</option>
              <option value="5-15">$5 - $15</option>
              <option value="15-25">$15 - $25</option>
              <option value="25-35">$25 - $35</option>
              <option value="35-50">$35 - $50</option>
              <option value="50-100">$50+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Age Range</label>
            <select name="age" value={filters.age} onChange={handleFilterChange}>
              <option value="">Any Age</option>
              <option value="18-25">18 - 25</option>
              <option value="26-35">26 - 35</option>
              <option value="36-45">36 - 45</option>
              <option value="46-60">46 - 60</option>
              <option value="60-100">60+</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Gender</label>
            <select name="gender" value={filters.gender} onChange={handleFilterChange}>
              <option value="">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Service Type</label>
            <select name="service" value={filters.service} onChange={handleFilterChange}>
              <option value="">Any Service</option>
              <option value="house cleaning">House Cleaning</option>
              <option value="deep cleaning">Deep Cleaning</option>
              <option value="carpet cleaning">Carpet Cleaning</option>
              <option value="window cleaning">Window Cleaning</option>
            </select>
          </div>

          <button onClick={applyFilters} className="apply-filters-btn" disabled={loading}>
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>

        {/* Right Content - Cleaner Cards */}
        <div className="content-area">
          <div className="content-header">
            <h2>Available Cleaners</h2>
            <p className="results-count">
              {cleaners.length} cleaner{cleaners.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading cleaners...</p>
            </div>
          ) : (
            <div className="cleaners-grid">
              {cleaners.length > 0 ? (
                cleaners.map((cleaner) => (
                  <div key={cleaner._id} className="cleaner-card">
                    <div className="cleaner-avatar">
                      <div className="avatar-placeholder">
                        {cleaner.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="cleaner-info">
                      <h4 className="cleaner-name">{cleaner.name}</h4>
                      
                      <div className="cleaner-rating">
                        <div className="stars">
                          {renderStars(cleaner.stars || 0)}
                        </div>
                        <span className="rating-text">
                          {cleaner.stars ? cleaner.stars.toFixed(1) : '0.0'}
                        </span>
                      </div>

                      <div className="cleaner-price">
                        <span className="price-amount">${cleaner.hourlyPrice}</span>
                        <span className="price-unit">/hour</span>
                      </div>

                      <div className="cleaner-comments">
                        <span className="comments-count">
                          {cleaner.comments ? cleaner.comments.length : 0} comment{cleaner.comments?.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="cleaner-services">
                        {cleaner.service && cleaner.service.slice(0, 2).map((service, index) => (
                          <span key={index} className="service-tag">
                            {service}
                          </span>
                        ))}
                        {cleaner.service && cleaner.service.length > 2 && (
                          <span className="service-tag more">
                            +{cleaner.service.length - 2} more
                          </span>
                        )}
                      </div>

                      <div className="cleaner-actions">
                        <button 
                          onClick={() => handleViewProfile(cleaner._id)}
                          className="view-profile-btn"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => handleBookNow(cleaner._id)}
                          className="book-now-btn"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                !loading && (
                  <div className="no-results">
                    <h3>No cleaners found</h3>
                    <p>Try adjusting your filters or check back later.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;