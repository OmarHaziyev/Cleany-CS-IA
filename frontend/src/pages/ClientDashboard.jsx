import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import '../cssFiles/ClientDashboard.css';
import { authUtils } from '../utils/auth.js';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('hire');
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerData, setOfferData] = useState({
    service: '',
    date: '',
    startTime: '',
    endTime: '',
    note: '',
    budget: '',
    deadline: ''
  });
  const [pastJobs, setPastJobs] = useState([]);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [ratingDrafts, setRatingDrafts] = useState({});
  const [filters, setFilters] = useState({
    stars: '',
    price: '',
    age: '',
    gender: '',
    service: ''
  });

  // Get client info from localStorage
  const clientData = JSON.parse(localStorage.getItem('userData') || '{}');
  const clientId = id || clientData._id;

  // Fetch all cleaners on component mount
  useEffect(() => {
    if (activeTab === 'hire') {
      fetchCleaners();
    } else if (activeTab === 'past-jobs') {
      fetchPastJobs();
    } else if (activeTab === 'offer') {
      fetchPendingOffers();
    }
  }, [activeTab]);

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

  const fetchPastJobs = async () => {
    setLoading(true);
    try {
      const headers = authUtils.getAuthHeaders();
      const response = await axios.get(`http://localhost:5001/api/jobs/client/${clientId}/completed`, { headers });
      setPastJobs(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching past jobs:', err);
      setError('Failed to load past jobs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOffers = async () => {
    setLoading(true);
    try {
      const headers = authUtils.getAuthHeaders();
      const response = await axios.get('http://localhost:5001/api/offers/pending', { headers });
      setPendingOffers(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching pending offers:', err);
      setError('Failed to load pending offers. Please try again.');
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

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = authUtils.getAuthHeaders();
      const payload = {
        requestType: 'general',
        service: offerData.service,
        date: offerData.date,
        startTime: offerData.startTime,
        endTime: offerData.endTime,
        note: offerData.note,
        budget: Number(offerData.budget),
        deadline: offerData.deadline
      };
      await axios.post('http://localhost:5001/api/requests', payload, { headers });
      alert('Offer posted! Cleaners can now apply to it.');
      setOfferData({ service: '', date: '', startTime: '', endTime: '', note: '', budget: '', deadline: '' });
      fetchPendingOffers();
    } catch (err) {
      console.error('Error creating offer:', err);
      alert('Failed to create offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setRatingValue = (requestId, field, value) => {
    setRatingDrafts(prev => ({
      ...prev,
      [requestId]: { ...(prev[requestId] || {}), [field]: value }
    }));
  };

  const submitRating = async (requestId) => {
    const draft = ratingDrafts[requestId] || {};
    if (!draft.rating) {
      alert('Please select a rating.');
      return;
    }
    try {
      const headers = authUtils.getAuthHeaders();
      await axios.put(`http://localhost:5001/api/requests/${requestId}/rate`, {
        rating: Number(draft.rating),
        review: draft.review || ''
      }, { headers });
      alert('Thanks for your feedback!');
      fetchPastJobs();
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    navigate('/', { replace: true });
  };

  const handleViewProfile = (cleanerId) => {
    navigate(`/cleaner/${cleanerId}`);
  };

  const handleBookNow = (cleanerId) => {
    navigate(`/cleaner/${cleanerId}`);
  };

  const selectCleanerForOffer = async (requestId, applicationId) => {
    try {
      const headers = authUtils.getAuthHeaders();
      await axios.post(`http://localhost:5001/api/offers/${requestId}/select/${applicationId}`, {}, { headers });
      alert('Cleaner selected successfully! The job has been assigned.');
      fetchPendingOffers();
    } catch (err) {
      console.error('Error selecting cleaner:', err);
      alert('Failed to select cleaner. Please try again.');
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

  return (
    <div className="client-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Client Dashboard</h1>
          <p>Welcome back, {clientData.name || 'Client'}!</p>
        </div>
        <div className="header-right">
          <nav className="dashboard-nav">
            <button className={`nav-btn ${activeTab === 'offer' ? 'active' : ''}`} onClick={() => setActiveTab('offer')}>Offer</button>
            <button className={`nav-btn ${activeTab === 'hire' ? 'active' : ''}`} onClick={() => setActiveTab('hire')}>Hire</button>
            <button className={`nav-btn ${activeTab === 'past-jobs' ? 'active' : ''}`} onClick={() => setActiveTab('past-jobs')}>Past Jobs</button>
            <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
            <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          </nav>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'offer' && (
          <div className="content-area">
            <div className="content-header">
              <h2>Create an Offer</h2>
              <p>Post a job for all cleaners and pick the best acceptor.</p>
            </div>
            <form onSubmit={submitOffer} className="offer-form">
              <div className="form-group">
                <label>Service</label>
                <select name="service" value={offerData.service} onChange={handleOfferChange} required>
                  <option value="">Select a service</option>
                  <option value="house cleaning">House Cleaning</option>
                  <option value="deep cleaning">Deep Cleaning</option>
                  <option value="carpet cleaning">Carpet Cleaning</option>
                  <option value="window cleaning">Window Cleaning</option>
                  <option value="office cleaning">Office Cleaning</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={offerData.date} onChange={handleOfferChange} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={offerData.startTime} onChange={handleOfferChange} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" name="endTime" value={offerData.endTime} onChange={handleOfferChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Budget (USD)</label>
                  <input type="number" name="budget" min="0" step="1" value={offerData.budget} onChange={handleOfferChange} required />
                </div>
                <div className="form-group">
                  <label>Application Deadline</label>
                  <input type="datetime-local" name="deadline" value={offerData.deadline} onChange={handleOfferChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea name="note" rows="3" value={offerData.note} onChange={handleOfferChange} placeholder="Any special instructions..." />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-booking-btn" disabled={loading}>{loading ? 'Posting...' : 'Post Offer'}</button>
              </div>
            </form>

            {/* Pending Offers Section */}
            <div className="pending-offers-section">
              <div className="content-header">
                <h2>Pending Offers</h2>
                <p>Review and select cleaners for your posted offers.</p>
              </div>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading pending offers...</p>
                </div>
              ) : (
                <div className="offers-grid">
                  {pendingOffers.length === 0 ? (
                    <div className="no-results">
                      <h3>No pending offers</h3>
                      <p>Your posted offers will appear here once cleaners apply.</p>
                    </div>
                  ) : (
                    pendingOffers.map(offer => (
                      <div key={offer._id} className="offer-card">
                        <div className="offer-header">
                          <h4>{offer.service}</h4>
                          <div className="offer-meta">
                            <span className="budget-badge">Budget: ${offer.budget}</span>
                            <span className="deadline-badge">
                              Deadline: {new Date(offer.deadline).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="offer-details">
                          <p><strong>Date:</strong> {new Date(offer.date).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {offer.startTime} - {offer.endTime}</p>
                          {offer.note && <p><strong>Notes:</strong> {offer.note}</p>}
                        </div>

                        <div className="applications-section">
                          <h5>Applications ({offer.applications?.length || 0})</h5>
                          {offer.applications && offer.applications.length > 0 ? (
                            <div className="applications-list">
                              {offer.applications.map(application => (
                                <div key={application._id} className="application-card">
                                  <div className="cleaner-info">
                                    <h6>{application.cleaner.name}</h6>
                                    <div className="cleaner-details">
                                      <span className="rating">⭐ {application.cleaner.stars || 0}/5</span>
                                      <span className="price">${application.cleaner.hourlyPrice}/hr</span>
                                      <span className="age">{application.cleaner.age} years</span>
                                    </div>
                                    <div className="services">
                                      {application.cleaner.service?.slice(0, 2).map((service, index) => (
                                        <span key={index} className="service-tag">{service}</span>
                                      ))}
                                    </div>
                                  </div>
                                  <button 
                                    className="select-cleaner-btn"
                                    onClick={() => selectCleanerForOffer(offer._id, application._id)}
                                  >
                                    Select This Cleaner
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-applications">No applications yet. Cleaners will appear here once they apply.</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hire' && (
        <>
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
        </>
        )}

        {activeTab === 'past-jobs' && (
          <div className="content-area">
            <div className="content-header">
              <h2>Past Jobs</h2>
              <p>Rate your completed jobs.</p>
            </div>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading past jobs...</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {pastJobs.length === 0 ? (
                  <div className="no-results">
                    <h3>No completed jobs</h3>
                    <p>Once your jobs are completed, you can rate them here.</p>
                  </div>
                ) : (
                  pastJobs.map(job => (
                    <div key={job._id} className="job-card">
                      <div className="job-header">
                        <h4>{job.cleaner?.name || 'Cleaner'}</h4>
                        {job.rating ? <div className="job-rating">{'⭐'.repeat(job.rating)} ({job.rating}/5)</div> : <span className="status-badge completed">completed</span>}
                      </div>
                      <div className="job-details">
                        <p><strong>Service:</strong> {job.service}</p>
                        <p><strong>Date:</strong> {new Date(job.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {job.startTime} - {job.endTime}</p>
                      </div>
                      {!job.rating && (
                        <div className="rating-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Rating</label>
                              <select value={(ratingDrafts[job._id]?.rating) || ''} onChange={(e) => setRatingValue(job._id, 'rating', e.target.value)}>
                                <option value="">Select</option>
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Good</option>
                                <option value="3">3 - Fair</option>
                                <option value="2">2 - Poor</option>
                                <option value="1">1 - Bad</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Review (optional)</label>
                              <input type="text" placeholder="Your comments" value={(ratingDrafts[job._id]?.review)||''} onChange={(e) => setRatingValue(job._id, 'review', e.target.value)} />
                            </div>
                          </div>
                          <div className="modal-actions">
                            <button className="submit-booking-btn" onClick={() => submitRating(job._id)}>Submit Rating</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="content-area">
            <div className="content-header"><h2>Settings</h2></div>
            <p>Coming soon</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="content-area">
            <div className="content-header"><h2>Profile</h2></div>
            <div className="profile-card">
              <p><strong>Name:</strong> {clientData.name}</p>
              <p><strong>Email:</strong> {clientData.email}</p>
              <p><strong>Phone:</strong> {clientData.phoneNumber}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;