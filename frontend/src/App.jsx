import React from 'react'
import LandingPage from './pages/LandingPage.jsx';
import { Route, Routes } from "react-router";
import LoginPageCleaner from './pages/LoginPageCleaner.jsx';
import LoginPageClient from './pages/LoginPageClient.jsx';
import CleanerSignup from './pages/CleanerSignup.jsx';
import ClientSignup from './pages/ClientSignup.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import CleanerDetailPage from './pages/CleanerDetailPage.jsx';
import CleanerDashboard from './pages/CleanerDashboard.jsx';

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Cleaner Routes */}
        <Route path="/cleaner/login" element={<LoginPageCleaner />} />
        <Route path="/cleaner/signup" element={<CleanerSignup />} />
        <Route path="/cleaner/dashboard" element={<CleanerDashboard />} />
        
        {/* Client Routes */}
        <Route path="/client/login" element={<LoginPageClient />} />
        <Route path="/client/signup" element={<ClientSignup />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        
        {/* Cleaner Detail Page */}
        <Route path="/cleaner/:id" element={<CleanerDetailPage />} />
        
        {/* Legacy route for backwards compatibility */}
        <Route path="/dashboard" element={<ClientDashboard />} />
      </Routes>
    </div>
  )
}

export default App