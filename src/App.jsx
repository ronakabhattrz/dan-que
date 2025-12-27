import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileTypeSelection from './pages/ProfileTypeSelection';
import GeneralInfoCollection from './pages/GeneralInfoCollection';
import VerifyProfile from './pages/VerifyProfile';
import UploadDocuments from './pages/UploadDocuments';
import ProfileDetails from './pages/ProfileDetails';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfileDetails from './pages/admin/AdminProfileDetails';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected User Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/profile-type" element={
              <ProtectedRoute>
                <ProfileTypeSelection />
              </ProtectedRoute>
            } />
            <Route path="/general-info" element={
              <ProtectedRoute>
                <GeneralInfoCollection />
              </ProtectedRoute>
            } />
            <Route path="/verify-profile" element={
              <ProtectedRoute>
                <VerifyProfile />
              </ProtectedRoute>
            } />
            <Route path="/upload-documents" element={
              <ProtectedRoute>
                <UploadDocuments />
              </ProtectedRoute>
            } />
            <Route path="/profile/:profileId" element={
              <ProtectedRoute>
                <ProfileDetails />
              </ProtectedRoute>
            } />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/profile/:profileId" element={
              <ProtectedRoute adminOnly={true}>
                <AdminProfileDetails />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;

