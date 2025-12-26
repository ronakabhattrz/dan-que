import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import HomePage from './pages/HomePage';
import ProfileTypeSelection from './pages/ProfileTypeSelection';
import GeneralInfoCollection from './pages/GeneralInfoCollection';
import VerifyProfile from './pages/VerifyProfile';
import UploadDocuments from './pages/UploadDocuments';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfileDetails from './pages/admin/AdminProfileDetails';
import './index.css';

function App() {
  return (
    <ProfileProvider>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/profile-type" element={<ProfileTypeSelection />} />
          <Route path="/general-info" element={<GeneralInfoCollection />} />
          <Route path="/verify-profile" element={<VerifyProfile />} />
          <Route path="/upload-documents" element={<UploadDocuments />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profile/:profileId" element={<AdminProfileDetails />} />
        </Routes>
      </Router>
    </ProfileProvider>
  );
}

export default App;
