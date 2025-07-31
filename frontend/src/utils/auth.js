// Frontend utility functions for authentication

export const authUtils = {
  // Store token and user data
  login: (token, userData, userType) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userType', userType);
  },

  // Remove token and user data
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Get user data
  getUser: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Get user type
  getUserType: () => {
    return localStorage.getItem('userType');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Check if user is a cleaner
  isCleaner: () => {
    return localStorage.getItem('userType') === 'cleaner';
  },

  // Check if user is a client
  isClient: () => {
    return localStorage.getItem('userType') === 'client';
  },

  // Get authorization headers for API calls
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }
};

export default authUtils;