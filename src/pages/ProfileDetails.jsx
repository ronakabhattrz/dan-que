import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { validateField } from '../utils/validators';
import { profileService } from '../services/profileService';
import { documentService } from '../services/documentService';
import FileUpload from '../components/FileUpload';
import '../index.css';

const ProfileDetails = () => {
    const { profileId } = useParams();
    const navigate = useNavigate();
    const { updateProfileInfo, deleteProfile, loadUserProfiles } = useProfile();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [pendingUploads, setPendingUploads] = useState([]);
    const [docsToRemove, setDocsToRemove] = useState([]);
    const [tempDocs, setTempDocs] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await profileService.getProfileById(profileId);
                // Map business_name to businessName
                const mappedProfile = {
                    ...data,
                    businessName: data.businessName || data.business_name
                };
                setProfile(mappedProfile);

                // Initialize form data
                const initialData = {
                    name: mappedProfile.name || '',
                    businessName: mappedProfile.businessName || '',
                    address: mappedProfile.address || '',
                    phone: mappedProfile.phone || '',
                    email: mappedProfile.email || '',
                    ein: mappedProfile.ein || ''
                };
                setFormData(initialData);
            } catch (error) {
                console.error('Error fetching profile:', error);
                alert('Failed to load profile details.');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (profileId) {
            fetchProfile();
        }
    }, [profileId, navigate]);

    useEffect(() => {
        if (profile && profile.documents) {
            setTempDocs(profile.documents);
        }
    }, [profile]);

    const handleFileUpload = (files) => {
        const newFiles = Array.from(files);
        setPendingUploads(prev => [...prev, ...newFiles]);

        // Add to tempDocs for immediate UI feedback
        const tempUrls = newFiles.map(file => ({
            id: `temp-${Date.now()}-${file.name}`,
            name: file.name,
            isNew: true,
            file: file,
            created_at: new Date().toISOString()
        }));
        setTempDocs(prev => [...prev, ...tempUrls]);
    };

    const handleRemoveDocument = (docId) => {
        const docToRemove = tempDocs.find(d => d.id === docId);
        if (docToRemove.isNew) {
            setPendingUploads(prev => prev.filter(f => f !== docToRemove.file));
        } else {
            setDocsToRemove(prev => [...prev, docId]);
        }
        setTempDocs(prev => prev.filter(d => d.id !== docId));
    };

    const handleInputChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleBlur = (id) => {
        const value = formData[id];
        const validation = validateField(id, value, profile?.type);

        if (!validation.isValid) {
            setErrors(prev => ({ ...prev, [id]: validation.error }));
        } else {
            setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleSave = async () => {
        // Validate all fields
        const newErrors = {};
        const fieldsToValidate = profile.type === 'personal'
            ? ['name', 'address', 'phone', 'email']
            : ['businessName', 'address', 'phone', 'email', 'ein'];

        let hasErrors = false;
        fieldsToValidate.forEach(field => {
            const validation = validateField(field, formData[field], profile.type);
            if (!validation.isValid) {
                newErrors[field] = validation.error;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setErrors(newErrors);
            return;
        }

        try {
            setSaving(true);
            const dataToUpdate = { ...formData };
            // Map businessName back to business_name for database
            if (dataToUpdate.businessName) {
                dataToUpdate.business_name = dataToUpdate.businessName;
                delete dataToUpdate.businessName; // Should be dataToUpdate
            }

            await profileService.updateProfile(profileId, dataToUpdate);

            // 1. Delete removed documents
            for (const docId of docsToRemove) {
                await documentService.deleteDocument(docId);
            }

            // 2. Upload new documents
            for (const file of pendingUploads) {
                await documentService.uploadDocument(profileId, file);
            }

            const updatedData = await profileService.getProfileById(profileId);
            const updatedProfile = {
                ...updatedData,
                businessName: updatedData.businessName || updatedData.business_name
            };
            setProfile(updatedProfile);
            setIsEditing(false);
            setPendingUploads([]);
            setDocsToRemove([]);
            await loadUserProfiles(); // Refresh horizontal list on home
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
            try {
                await deleteProfile(profileId);
                navigate('/');
            } catch (error) {
                console.error('Error deleting profile:', error);
                alert('Failed to delete profile.');
            }
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="spinner"></div>
                <p>Loading profile details...</p>
            </div>
        );
    }

    if (!profile) return null;

    const renderField = (label, id, value, type = 'text') => {
        if (isEditing) {
            return (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <Input
                        label={label}
                        type={type}
                        value={formData[id] || ''}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                        onBlur={() => handleBlur(id)}
                        error={errors[id]}
                    />
                </div>
            );
        }

        return (
            <div style={{
                marginBottom: 'var(--spacing-md)',
                paddingBottom: 'var(--spacing-sm)',
                borderBottom: '1px solid var(--surface-glass-border)'
            }}>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{value || '—'}</div>
            </div>
        );
    };

    return (
        <div className="container container-sm" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
            <div className="fade-in">
                <div className="flex justify-between items-center mb-xl">
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        ← Back to Home
                    </Button>
                    <div className="flex gap-sm">
                        {!isEditing ? (
                            <>
                                <Button variant="primary" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                                <Button variant="outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleDelete}>
                                    Delete
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <Card className="mb-xl">
                    <div className="flex justify-between items-center mb-lg">
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0' }}>
                            {profile.name || profile.businessName || 'Profile Details'}
                        </h1>
                        <div className="flex gap-sm">
                            <span className="badge badge-secondary">
                                {profile.type === 'personal' ? '👤 Personal' : '🏢 Business'}
                            </span>
                            <span className={`badge badge-${profile.status === 'verified' ? 'success' :
                                profile.status === 'pending' ? 'warning' :
                                    profile.status === 'rejected' ? 'error' : 'secondary'
                                }`}>
                                Status: {profile.status}
                            </span>
                        </div>
                    </div>

                    <div style={{
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-xl)',
                        border: '1px solid var(--surface-glass-border)'
                    }}>
                        {profile.type === 'personal' ? (
                            <>
                                {renderField('Full Name', 'name', profile.name)}
                                {renderField('Address', 'address', profile.address)}
                                {renderField('Phone Number', 'phone', profile.phone, 'tel')}
                                {renderField('Email Address', 'email', profile.email, 'email')}
                            </>
                        ) : (
                            <>
                                {renderField('Business Name', 'businessName', profile.businessName)}
                                {renderField('EIN', 'ein', profile.ein)}
                                {renderField('Business Address', 'address', profile.address)}
                                {renderField('Phone Number', 'phone', profile.phone, 'tel')}
                                {renderField('Email Address', 'email', profile.email, 'email')}
                            </>
                        )}
                    </div>
                </Card>

                <Card>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>Documents</h2>
                    {tempDocs && tempDocs.length > 0 ? (
                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            {tempDocs.map((doc) => (
                                <div key={doc.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--surface-glass)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--surface-glass-border)'
                                }}>
                                    <div className="flex items-center gap-sm">
                                        <span style={{ fontSize: '1.5rem' }}>📄</span>
                                        <div>
                                            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                                {doc.name} {doc.isNew && <span style={{ fontSize: '0.75rem', color: 'var(--primary-400)' }}>(Pending)</span>}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-md items-center">
                                        {!doc.isNew && (
                                            <a
                                                href={doc.url || doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: 'var(--primary-400)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                View File
                                            </a>
                                        )}
                                        {isEditing && (
                                            <button
                                                onClick={() => handleRemoveDocument(doc.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--error)',
                                                    cursor: 'pointer',
                                                    fontSize: '1.25rem',
                                                    padding: '4px'
                                                }}
                                                title="Remove Document"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-xl)',
                            color: 'var(--text-tertiary)',
                            background: 'var(--surface-glass)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed var(--surface-glass-border)'
                        }}>
                            No documents uploaded yet.
                        </div>
                    )}

                    {isEditing && (
                        <div style={{ marginTop: 'var(--spacing-lg)' }}>
                            <FileUpload
                                label="Add Document"
                                multiple={true}
                                onFileSelect={handleFileUpload}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ProfileDetails;
