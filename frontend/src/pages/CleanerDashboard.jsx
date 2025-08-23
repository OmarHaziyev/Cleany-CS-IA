import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import '../cssFiles/CleanerDashboard.css';

const CleanerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [cleanerData, setCleanerData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [generalRequests, setGeneralRequests] = useState([]);
  const [pastJobs, setPastJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get cleaner info from localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    if (!userData._id) {
      navigate('/cleaner/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch cleaner's current data
      const cleanerResponse = await axios.get(`http://localhost:5001/api/cleaners/${userData._id}`);
      setCleanerData(cleanerResponse.data);

      // Fetch specific requests for this cleaner
      // TODO: Implement these endpoints in backend
      // const requestsResponse = await axios.get(`http://localhost:5001/api/requests/cleaner/${userData._id}`);
      // setRequests(requestsResponse.data);

      // Fetch general requests for all cleaners
      // const generalRequestsResponse = await axios.get(`http://localhost:5001/api/requests/general`);
      // setGeneralRequests(generalRequestsResponse.data);

      // Fetch past jobs
      // const pastJobsResponse = await axios.get(`http://localhost:5001/api/jobs/cleaner/${userData._id}/completed`);
      // setPastJobs(pastJobsResponse.data);

      // Mock data for now
      setRequests([
        {
          _id: '1',
          client: { name: 'John Doe', email: 'john@email.com' },
          service: 'house cleaning',
          date: '2025-08-25',
          startTime: '09:00',
          endTime: '12:00',
          status: 'pending',
          note: 'Need deep cleaning for kitchen and bathrooms'
        },
        {
          _id: '2',
          client: { name: 'Sarah Smith', email: 'sarah@email.com' },
          service: 'carpet cleaning',
          date: '2025-08-26',
          startTime: '14:00',
          endTime: '16:00',
          status: 'pending',
          note: 'Pet stains on living room carpet'
        }
      ]);

      setGeneralRequests([
        {
          _id: '3',
          client: { name: 'Mike Johnson', email: 'mike@email.com' },
          service: 'office cleaning',
          date: '2025-08-27',
          startTime: '18:00',
          endTime: '20:00',
          status: 'open',
          note: 'Weekly office cleaning needed',
          budget: 50
        }
      ]);

      setPastJobs([
        {
          _id: '4',
          client: { name: 'Lisa Brown', email: 'lisa@email.com' },
          service: 'deep cleaning',
          date: '2025-08-20',
          startTime: '10:00',
          endTime: '15:00',
          status: 'completed',
          rating: 5,
          review: 'Excellent work! Very thorough cleaning.'
        }
      ]);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      // TODO: Implement backend endpoint
      // await axios.put(`http://localhost:5001/api/requests/${requestId}`, { status: action });
      
      // Update local state for now
      if (action === 'accepted' || action === 'declined') {
        setRequests(prev => prev.map(req => 
          req._id === requestId ? { ...req, status: action } : req
        ));
        alert(`Request ${action} successfully!`);
      }
    } catch (err) {
      console.error('Error updating request:', err);
      alert('Failed to update request. Please try again.');
    }
  };

  const handleAcceptGeneralRequest = async (requestId) => {
    try {
      // TODO: Implement backend endpoint
      // await axios.post(`http://localhost:5001/api/requests/general/${requestId}/accept`, {
      //   cleanerId: userData._id
      // });

      // Update local state for now
      setGeneralRequests(prev => prev.filter(req => req._id !== requestId));
      alert('General request accepted! Client will be notified.');
    } catch (err) {
      console.error('Error accepting general request:', err);
      alert('Failed to accept request. Please try again.');
    }
  };

  const renderHeader = () => (
    <div className="dashboard-header">
      <div className="header-left">
        <div className="logo-placeholder">
          [LOGO]
        </div>
      </div>
      
      <div className="header-right">
        <nav className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button 
            className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </button>
          <button 
            className={`nav-btn ${activeTab === 'general-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('general-requests')}
          >
            Offers
          </button>
          <button 
            className={`nav-btn ${activeTab === 'past-jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('past-jobs')}
          >
            Past Jobs
          </button>
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="tab-content">
      <h2>My Profile</h2>
      {cleanerData && (
        <div className="profile-info">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-large">
                {cleanerData.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-details">
              <h3>{cleanerData.name}</h3>
              <p><strong>Username:</strong> {cleanerData.username}</p>
              <p><strong>Email:</strong> {cleanerData.email}</p>
              <p><strong>Phone:</strong> {cleanerData.phoneNumber}</p>
              <p><strong>Age:</strong> {cleanerData.age}</p>
              <p><strong>Hourly Rate:</strong> ${cleanerData.hourlyPrice}</p>
              <p><strong>Rating:</strong> {cleanerData.stars ? cleanerData.stars.toFixed(1) : '0.0'} ⭐</p>
              <div className="services-list">
                <strong>Services:</strong>
                {cleanerData.service?.map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="tab-content">
      <h2>Settings</h2>
      <div className="settings-section">
        <div className="setting-item">
          <h4>Account Settings</h4>
          <button className="btn-secondary">Edit Profile</button>
          <button className="btn-secondary">Change Password</button>
        </div>
        <div className="setting-item">
          <h4>Schedule Settings</h4>
          <button className="btn-secondary">Update Availability</button>
          <button className="btn-secondary">Set Vacation Mode</button>
        </div>
        <div className="setting-item">
          <h4>Pricing Settings</h4>
          <button className="btn-secondary">Update Hourly Rate</button>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="tab-content">
      <h2>Current Requests</h2>
      <p>Bookings from clients waiting for your response</p>
      
      {requests.length === 0 ? (
        <div className="no-data">
          <p>No pending requests at the moment.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h4>{request.client.name}</h4>
                <span className={`status-badge ${request.status}`}>
                  {request.status}
                </span>
              </div>
              
              <div className="request-details">
                <p><strong>Service:</strong> {request.service}</p>
                <p><strong>Date:</strong> {request.date}</p>
                <p><strong>Time:</strong> {request.startTime} - {request.endTime}</p>
                <p><strong>Client Email:</strong> {request.client.email}</p>
                {request.note && (
                  <p><strong>Note:</strong> {request.note}</p>
                )}
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    className="btn-accept"
                    onClick={() => handleRequestAction(request._id, 'accepted')}
                  >
                    Accept
                  </button>
                  <button 
                    className="btn-decline"
                    onClick={() => handleRequestAction(request._id, 'declined')}
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGeneralRequests = () => (
    <div className="tab-content">
      <h2>Offers</h2>
      <p>Open requests from clients looking for any available cleaner</p>
      
      {generalRequests.length === 0 ? (
        <div className="no-data">
          <p>No general requests available at the moment.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {generalRequests.map((request) => (
            <div key={request._id} className="request-card general">
              <div className="request-header">
                <h4>{request.client.name}</h4>
                <span className="budget-badge">
                  Budget: ${request.budget}
                </span>
              </div>
              
              <div className="request-details">
                <p><strong>Service:</strong> {request.service}</p>
                <p><strong>Date:</strong> {request.date}</p>
                <p><strong>Time:</strong> {request.startTime} - {request.endTime}</p>
                <p><strong>Client Email:</strong> {request.client.email}</p>
                {request.note && (
                  <p><strong>Note:</strong> {request.note}</p>
                )}
              </div>

              <div className="request-actions">
                <button 
                  className="btn-accept"
                  onClick={() => handleAcceptGeneralRequest(request._id)}
                >
                  Accept This Job
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPastJobs = () => (
    <div className="tab-content">
      <h2>Past Jobs</h2>
      <p>Your completed cleaning jobs and client reviews</p>
      
      {pastJobs.length === 0 ? (
        <div className="no-data">
          <p>No completed jobs yet. Start accepting requests to build your history!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {pastJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <h4>{job.client.name}</h4>
                <div className="job-rating">
                  {'⭐'.repeat(job.rating)} ({job.rating}/5)
                </div>
              </div>
              
              <div className="job-details">
                <p><strong>Service:</strong> {job.service}</p>
                <p><strong>Date:</strong> {job.date}</p>
                <p><strong>Time:</strong> {job.startTime} - {job.endTime}</p>
                <p><strong>Client Email:</strong> {job.client.email}</p>
                {job.review && (
                  <div className="client-review">
                    <strong>Client Review:</strong>
                    <p className="review-text">"{job.review}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      case 'requests':
        return renderRequests();
      case 'general-requests':
        return renderGeneralRequests();
      case 'past-jobs':
        return renderPastJobs();
      default:
        return renderRequests();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="cleaner-dashboard">
      {renderHeader()}
      <div className="dashboard-body">
        <div className="welcome-section">
          <h1>Welcome back, {userData.name || 'Cleaner'}! 👋</h1>
          <p>Manage your cleaning business from your dashboard</p>
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CleanerDashboard;