import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { profileService } from '../services/profileService';
import { documentService } from '../services/documentService';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load user profiles when user changes
  useEffect(() => {
    if (user) {
      loadUserProfiles();
    } else {
      setProfiles([]);
      setCurrentProfile(null);
    }
  }, [user]);

  const loadUserProfiles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await profileService.getUserProfiles(user.id);
      // Map business_name to businessName for frontend consistency
      const mappedData = data.map(p => ({
        ...p,
        businessName: p.businessName || p.business_name
      }));
      setProfiles(mappedData);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (type) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const newProfile = await profileService.createProfile(user.id, type);
      setCurrentProfile(newProfile);
      setCurrentStep(0);
      await loadUserProfiles(); // Refresh profiles list
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const updateProfileInfo = async (info) => {
    if (!currentProfile) return;

    try {
      const updated = await profileService.updateProfile(currentProfile.id, info);
      setCurrentProfile(updated);
      await loadUserProfiles(); // Refresh profiles list
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const addDocument = async (file) => {
    if (!currentProfile) throw new Error('No current profile');

    try {
      const document = await documentService.uploadDocument(currentProfile.id, file);
      setCurrentProfile(prev => ({
        ...prev,
        documents: [...(prev.documents || []), document]
      }));
      await loadUserProfiles(); // Refresh profiles list
      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const removeDocument = async (documentId) => {
    if (!currentProfile) return;

    try {
      await documentService.deleteDocument(documentId);
      setCurrentProfile(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId)
      }));
      await loadUserProfiles(); // Refresh profiles list
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  const saveProfile = async () => {
    if (!currentProfile) return;

    try {
      const updatedProfile = await profileService.updateProfile(currentProfile.id, {
        status: currentProfile.verified ? 'pending' : 'draft',
      });
      await loadUserProfiles(); // Refresh profiles list
      return updatedProfile;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      await profileService.deleteProfile(profileId);
      await loadUserProfiles(); // Refresh profiles list
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };

  const updateProfileStatus = async (profileId, status) => {
    try {
      await profileService.updateProfile(profileId, { status });
      await loadUserProfiles(); // Refresh profiles list
    } catch (error) {
      console.error('Error updating profile status:', error);
      throw error;
    }
  };

  const getProfileById = (profileId) => {
    return profiles.find(p => p.id === profileId);
  };

  const value = {
    profiles,
    currentProfile,
    currentStep,
    loading,
    setCurrentStep,
    createProfile,
    updateProfileInfo,
    addDocument,
    removeDocument,
    saveProfile,
    deleteProfile,
    updateProfileStatus,
    getProfileById,
    setCurrentProfile,
    loadUserProfiles
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
