import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('profiles');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentProfile, setCurrentProfile] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('profiles', JSON.stringify(profiles));
  }, [profiles]);

  const createProfile = (type) => {
    const newProfile = {
      id: Date.now().toString(),
      type, // 'personal' or 'business'
      status: 'draft', // draft, pending, verified, rejected
      createdAt: new Date().toISOString(),
      generalInfo: {},
      documents: [],
      verified: false,
      progress: 0
    };
    setCurrentProfile(newProfile);
    setCurrentStep(0);
    return newProfile;
  };

  const updateProfileInfo = (info) => {
    setCurrentProfile(prev => ({
      ...prev,
      generalInfo: { ...prev.generalInfo, ...info }
    }));
  };

  const addDocument = (document) => {
    setCurrentProfile(prev => ({
      ...prev,
      documents: [...prev.documents, document]
    }));
  };

  const removeDocument = (documentId) => {
    setCurrentProfile(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));
  };

  const saveProfile = () => {
    if (currentProfile) {
      const updatedProfile = {
        ...currentProfile,
        status: currentProfile.verified ? 'pending' : 'draft',
        updatedAt: new Date().toISOString()
      };

      setProfiles(prev => {
        const existing = prev.find(p => p.id === updatedProfile.id);
        if (existing) {
          return prev.map(p => p.id === updatedProfile.id ? updatedProfile : p);
        }
        return [...prev, updatedProfile];
      });

      return updatedProfile;
    }
  };

  const deleteProfile = (profileId) => {
    setProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  const updateProfileStatus = (profileId, status) => {
    setProfiles(prev =>
      prev.map(p => p.id === profileId ? { ...p, status, updatedAt: new Date().toISOString() } : p)
    );
  };

  const getProfileById = (profileId) => {
    return profiles.find(p => p.id === profileId);
  };

  const value = {
    profiles,
    currentProfile,
    currentStep,
    setCurrentStep,
    createProfile,
    updateProfileInfo,
    addDocument,
    removeDocument,
    saveProfile,
    deleteProfile,
    updateProfileStatus,
    getProfileById,
    setCurrentProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
