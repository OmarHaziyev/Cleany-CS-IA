import React from 'react'
import { Route, Routes } from "react-router";
import LandingPage from './pages/LandingPage.jsx';
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
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Cleaner Routes */}
        <Route path="/cleaner/login" element={<LoginPageCleaner />} />
        <Route path="/cleaner/signup" element={<CleanerSignup />} />
        <Route path="/cleaner/dashboard/:id" element={<CleanerDashboard />} />

        {/* Client Routes */}
        <Route path="/client/login" element={<LoginPageClient />} />
        <Route path="/client/signup" element={<ClientSignup />} />
        <Route path="/client/dashboard/:id" element={<ClientDashboard />} />

        {/* Cleaner Detail Page (for clients) */}
        <Route path="/cleaner/detailpage/:id" element={<CleanerDetailPage />} />

        {/* Legacy routes for backwards compatibility */}
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/cleaner/dashboard" element={<CleanerDashboard />} />
        <Route path="/cleaner/:id" element={<CleanerDetailPage />} />
      </Routes>
    </div>
  )
}

export default App