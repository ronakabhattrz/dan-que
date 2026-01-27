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
      // Map fields for frontend consistency
      const mappedData = data.map(p => ({
        ...p,
        businessName: p.business_name || p.businessName,
        firstName: p.first_name || p.firstName,
        lastName: p.last_name || p.lastName,
        mailingAddress: p.mailing_address || p.mailingAddress,
        residencyState: p.residency_state || p.residencyState,
        hasDL: !!p.dl_details?.serial_number ? 'Yes' : 'No',
        dl_serial: p.dl_details?.serial_number || '',
        dl_issue_date: p.dl_details?.issue_date || '',
        dl_expiry_date: p.dl_details?.expiry_date || '',
        dl_backside_code: p.dl_details?.backside_code || ''
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

    // Check profile limits
    const personalCount = profiles.filter(p => p.type === 'personal').length;
    const businessCount = profiles.filter(p => p.type === 'business').length;

    if (type === 'personal' && personalCount >= 1) {
      throw new Error('You can only create 1 personal profile. Please delete your existing personal profile to create a new one.');
    }

    if (type === 'business' && businessCount >= 1) {
      throw new Error('You can only create 1 business profile. Please delete your existing business profile to create a new one.');
    }

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
      // Clean data before sending to Supabase - convert camelCase to snake_case
      const cleanInfo = { ...info };

      // Map and remove camelCase fields
      if (cleanInfo.businessName) {
        cleanInfo.business_name = cleanInfo.businessName;
        delete cleanInfo.businessName;
      }
      if (cleanInfo.firstName) {
        cleanInfo.first_name = cleanInfo.firstName;
        delete cleanInfo.firstName;
      }
      if (cleanInfo.lastName) {
        cleanInfo.last_name = cleanInfo.lastName;
        delete cleanInfo.lastName;
      }
      if (cleanInfo.preferredName) {
        cleanInfo.preferred_name = cleanInfo.preferredName;
        delete cleanInfo.preferredName;
      }
      if (cleanInfo.mailingAddress) {
        cleanInfo.mailing_address = cleanInfo.mailingAddress;
        delete cleanInfo.mailingAddress;
      }
      if (cleanInfo.residencyState) {
        cleanInfo.residency_state = cleanInfo.residencyState;
        delete cleanInfo.residencyState;
      }
      if (cleanInfo.maritalStatus) {
        cleanInfo.marital_status = cleanInfo.maritalStatus;
        delete cleanInfo.maritalStatus;
      }
      if (cleanInfo.spouseInfo) {
        cleanInfo.spouse_info = cleanInfo.spouseInfo;
        delete cleanInfo.spouseInfo;
      }
      if (cleanInfo.carriesBusiness !== undefined) {
        cleanInfo.has_business = cleanInfo.carriesBusiness === 'Yes';
        delete cleanInfo.carriesBusiness;
      }

      // Cleanup derived/UI-only fields
      delete cleanInfo.numDependents;
      delete cleanInfo.hasDL;
      delete cleanInfo.hasEIN;

      // Remove tax-related fields (these belong in tax_data table now)
      delete cleanInfo.tax_responses;
      delete cleanInfo.tax_financials;
      delete cleanInfo.tax_outOfCountry;
      delete cleanInfo.tax_monthsOut;
      delete cleanInfo.tax_foreignAccount;
      delete cleanInfo.tax_digitalAssets;
      delete cleanInfo.tax_w2Count;
      delete cleanInfo.tax_1099Count;
      delete cleanInfo.tax_spouseW2Count;
      delete cleanInfo.tax_spouse1099Count;
      delete cleanInfo.dependent_student;
      delete cleanInfo.dependent_months_us;
      delete cleanInfo.dependent_lived_with;
      delete cleanInfo.dependent_worked;
      delete cleanInfo.dependent_income_docs;
      delete cleanInfo.dependent_residency_proof;

      // Remove business tax fields (these belong in tax_data table now)
      delete cleanInfo.biz_revenue;
      delete cleanInfo.ez_phone;
      delete cleanInfo.ez_internet;
      delete cleanInfo.taxi_car_rent;
      delete cleanInfo.taxi_fuel;
      delete cleanInfo.taxi_uber_fees;
      delete cleanInfo.truck_pmt;
      delete cleanInfo.truck_trailer;
      delete cleanInfo.truck_dispatch;
      delete cleanInfo.other_expenses;

      // Remove any remaining camelCase fields that might slip through
      delete cleanInfo.businessName;  // Already converted above, but double-check
      delete cleanInfo.firstName;
      delete cleanInfo.lastName;
      delete cleanInfo.preferredName;
      delete cleanInfo.mailingAddress;
      delete cleanInfo.residencyState;
      delete cleanInfo.maritalStatus;
      delete cleanInfo.spouseInfo;
      delete cleanInfo.carriesBusiness;

      // Convert empty date strings to null (PostgreSQL doesn't accept empty strings for dates)
      const dateFields = ['dob', 'date_inc', 'spouse_dob'];
      dateFields.forEach(field => {
        if (cleanInfo[field] === '') {
          cleanInfo[field] = null;
        }
      });

      // Wrap DL details
      if (cleanInfo.dl_serial || cleanInfo.dl_issue_date || cleanInfo.dl_expiry_date || cleanInfo.dl_backside_code) {
        cleanInfo.dl_details = {
          ...(currentProfile.dl_details || {}),
          serial_number: cleanInfo.dl_serial || currentProfile.dl_details?.serial_number,
          issue_date: cleanInfo.dl_issue_date || currentProfile.dl_details?.issue_date,
          expiry_date: cleanInfo.dl_expiry_date || currentProfile.dl_details?.expiry_date,
          backside_code: cleanInfo.dl_backside_code || currentProfile.dl_details?.backside_code
        };
      }

      // Remove DL individual fields after wrapping
      delete cleanInfo.dl_serial;
      delete cleanInfo.dl_issue_date;
      delete cleanInfo.dl_expiry_date;
      delete cleanInfo.dl_backside_code;

      const updated = await profileService.updateProfile(currentProfile.id, cleanInfo);

      // Refresh list to stay in sync
      await loadUserProfiles();

      // Update current profile with re-mapped data
      const data = await profileService.getProfileById(currentProfile.id);
      const mappedUpdated = {
        ...data,
        businessName: data.business_name || data.businessName,
        firstName: data.first_name || data.firstName,
        lastName: data.last_name || data.lastName,
        mailingAddress: data.mailing_address || data.mailingAddress,
        residencyState: data.residency_state || data.residencyState,
        hasDL: !!data.dl_details?.serial_number ? 'Yes' : 'No',
        dl_serial: data.dl_details?.serial_number || '',
        dl_issue_date: data.dl_details?.issue_date || '',
        dl_expiry_date: data.dl_details?.expiry_date || '',
        dl_backside_code: data.dl_details?.backside_code || ''
      };

      setCurrentProfile(mappedUpdated);
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

  const getProfileCounts = () => {
    const personalCount = profiles.filter(p => p.type === 'personal').length;
    const businessCount = profiles.filter(p => p.type === 'business').length;
    return { personalCount, businessCount };
  };

  const canCreateProfile = (type) => {
    const { personalCount, businessCount } = getProfileCounts();
    if (type === 'personal') return personalCount < 1;
    if (type === 'business') return businessCount < 1;
    return false;
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
    loadUserProfiles,
    getProfileCounts,
    canCreateProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
