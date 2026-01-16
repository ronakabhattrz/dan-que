import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { validateField } from '../utils/validators';
import { profileService } from '../services/profileService';
import { documentService } from '../services/documentService';
import FileUpload from '../components/FileUpload';
import { useNotifications } from '../context/NotificationContext';
import '../index.css';

const ProfileDetails = () => {
    const { profileId } = useParams();
    const navigate = useNavigate();
    const { updateProfileInfo, deleteProfile, loadUserProfiles } = useProfile();
    const { showSuccess, showError } = useNotifications();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({});
    const [originalFormData, setOriginalFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [pendingUploads, setPendingUploads] = useState([]);
    const [docsToRemove, setDocsToRemove] = useState([]);
    const [tempDocs, setTempDocs] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleStartEdit = (fieldId) => {
        setIsEditing(true);
        setEditingField(fieldId);
        setOriginalFormData({ ...formData });
    };

    const handleCancelEdit = () => {
        setFormData(originalFormData);
        setIsEditing(false);
        setEditingField(null);
        setErrors({});
    };

    const handleSaveField = async (fieldId) => {
        try {
            setSaving(true);

            // Get existing profile to preserve other sub-fields in JSONB
            const currentProfileData = await profileService.getProfileById(profileId);
            const dataToUpdate = {};

            // Map the single field being edited
            const fieldMappings = {
                businessName: 'business_name',
                firstName: 'first_name',
                lastName: 'last_name',
                preferredName: 'preferred_name',
                mailingAddress: 'mailing_address',
                residencyState: 'residency_state'
            };

            const dlFields = ['dl_serial', 'dl_issue_date', 'dl_expiry_date', 'dl_backside_code'];

            if (dlFields.includes(fieldId)) {
                // Handle DL details (nested JSONB)
                const dlMapping = {
                    dl_serial: 'serial_number',
                    dl_issue_date: 'issue_date',
                    dl_expiry_date: 'expiry_date',
                    dl_backside_code: 'backside_code'
                };

                const updatedDlDetails = {
                    ...(currentProfileData.dl_details || {}),
                    [dlMapping[fieldId]]: formData[fieldId]
                };
                dataToUpdate.dl_details = updatedDlDetails;
            } else {
                // Handle flat columns
                const dbField = fieldMappings[fieldId] || fieldId;
                dataToUpdate[dbField] = formData[fieldId];
            }

            await profileService.updateProfile(profileId, dataToUpdate);

            // Refresh profile data
            const updatedData = await profileService.getProfileById(profileId);
            setProfile(updatedData);
            showSuccess(`${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()} updated`);

            setIsEditing(false);
            setEditingField(null);
            await loadUserProfiles();
        } catch (error) {
            console.error('Error updating field:', error);
            showError('Failed to update field');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await profileService.getProfileById(profileId);
                setProfile(data);

                // Initialize form data with ALL fields from the profile
                const initialData = {
                    // Personal fields
                    ssn: data.ssn || '',
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    preferredName: data.preferred_name || '',
                    dob: data.dob || '',
                    phone: data.phone || '',
                    email: data.email || '',
                    mailingAddress: data.mailing_address || '',
                    residencyState: data.residency_state || '',

                    // DL Details (nested)
                    hasDL: !!data.dl_details?.serial_number ? 'Yes' : 'No',
                    dl_serial: data.dl_details?.serial_number || '',
                    dl_issue_date: data.dl_details?.issue_date || '',
                    dl_expiry_date: data.dl_details?.expiry_date || '',
                    dl_backside_code: data.dl_details?.backside_code || '',

                    // Business fields
                    businessName: data.business_name || '',
                    ein: data.ein || '',

                    // Legacy fields
                    name: data.name || '',
                    address: data.address || ''
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
        // No validation on blur - allow blank fields
    };

    const handleSave = async () => {
        // No validation - allow blank fields
        try {
            setSaving(true);

            // Map to actual database columns based on schema
            // Only include fields that exist in the profiles table
            const dataToUpdate = {};

            // Base fields from 001_initial_schema.sql
            if (formData.name) dataToUpdate.name = formData.name;
            if (formData.address) dataToUpdate.address = formData.address;
            if (formData.phone) dataToUpdate.phone = formData.phone;
            if (formData.email) dataToUpdate.email = formData.email;
            if (formData.businessName) dataToUpdate.business_name = formData.businessName;
            if (formData.ein) dataToUpdate.ein = formData.ein;

            // Extended fields from 004_expand_profiles_schema.sql
            if (formData.ssn) dataToUpdate.ssn = formData.ssn;
            if (formData.firstName) dataToUpdate.first_name = formData.firstName;
            if (formData.lastName) dataToUpdate.last_name = formData.lastName;
            if (formData.preferredName) dataToUpdate.preferred_name = formData.preferredName;
            if (formData.dob) dataToUpdate.dob = formData.dob;
            if (formData.mailingAddress) dataToUpdate.mailing_address = formData.mailingAddress;
            if (formData.residencyState) dataToUpdate.residency_state = formData.residencyState;

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
        const isEditingThisField = isEditing && editingField === id;

        return (
            <div style={{
                marginBottom: 'var(--spacing-lg)',
                position: 'relative'
            }}>
                <div style={{
                    color: 'var(--text-tertiary)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {label}
                </div>

                {isEditingThisField ? (
                    <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-sm)',
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                type={type}
                                value={formData[id] || ''}
                                onChange={(e) => handleInputChange(id, e.target.value)}
                                error={errors[id]}
                                style={{ marginBottom: 0 }}
                                placeholder={`Enter ${label.toLowerCase()}`}
                            />
                        </div>
                        <button
                            onClick={() => handleSaveField(id)}
                            disabled={saving}
                            style={{
                                background: 'var(--primary-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '8px 12px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                opacity: saving ? 0.6 : 1
                            }}
                            title="Save"
                        >
                            ✓
                        </button>
                        <button
                            onClick={() => handleCancelEdit()}
                            style={{
                                background: 'var(--gray-300)',
                                color: 'var(--text-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }}
                            title="Cancel"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div
                        style={{
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid transparent',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            minHeight: '44px'
                        }}
                        onClick={() => handleStartEdit(id)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--surface-glass)';
                            e.currentTarget.style.borderColor = 'var(--surface-glass-border)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                        }}
                    >
                        <span>{value || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Not set</span>}</span>
                        <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-tertiary)',
                            opacity: 0.6,
                            transition: 'opacity var(--transition-fast)'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Click to edit
                        </span>
                    </div>
                )}
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
                        <Button variant="outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={handleDelete}>
                            Delete Profile
                        </Button>
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
                                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Personal Information</h3>
                                {renderField('SSN', 'ssn', profile.ssn, 'password')}
                                {renderField('First Name', 'firstName', profile.firstName || profile.first_name)}
                                {renderField('Last Name', 'lastName', profile.lastName || profile.last_name)}
                                {renderField('Preferred Name', 'preferredName', profile.preferred_name)}
                                {renderField('Date of Birth', 'dob', profile.dob, 'date')}
                                {renderField('Phone Number', 'phone', profile.phone, 'tel')}
                                {renderField('Email Address', 'email', profile.email, 'email')}
                                {renderField('Mailing Address', 'mailingAddress', profile.mailingAddress || profile.mailing_address)}
                                {renderField('Residency State', 'residencyState', profile.residency_state)}

                                {profile.dl_details && (
                                    <>
                                        <h3 style={{ fontSize: '1.125rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Driver's License / ID</h3>
                                        {renderField('Serial Number', 'dl_serial', profile.dl_details.serial_number)}
                                        {renderField('Issue Date', 'dl_issue_date', profile.dl_details.issue_date, 'date')}
                                        {renderField('Expiry Date', 'dl_expiry_date', profile.dl_details.expiry_date, 'date')}
                                        {renderField('Backside Code', 'dl_backside_code', profile.dl_details.backside_code)}
                                    </>
                                )}

                                {profile.marital_status && (
                                    <>
                                        <h3 style={{ fontSize: '1.125rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Marital Status</h3>
                                        {renderField('Status', 'maritalStatus', profile.marital_status)}

                                        {profile.marital_status === 'married' && profile.spouse_info && (
                                            <>
                                                <h4 style={{ fontSize: '1rem', marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>Spouse Information</h4>
                                                {renderField("Spouse's SSN", 'spouse_ssn', profile.spouse_info.ssn, 'password')}
                                                {renderField("Spouse's First Name", 'spouse_firstName', profile.spouse_info.firstName)}
                                                {renderField("Spouse's Last Name", 'spouse_lastName', profile.spouse_info.lastName)}
                                                {renderField("Spouse's DOB", 'spouse_dob', profile.spouse_info.dob, 'date')}
                                                {renderField("Spouse's Phone", 'spouse_phone', profile.spouse_info.phone, 'tel')}
                                                {renderField("Spouse's Email", 'spouse_email', profile.spouse_info.email, 'email')}
                                            </>
                                        )}
                                    </>
                                )}

                                {profile.dependents && profile.dependents.length > 0 && (
                                    <>
                                        <h3 style={{ fontSize: '1.125rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Dependents</h3>
                                        {renderField('Number of Dependents', 'numDependents', profile.dependents.length)}
                                    </>
                                )}

                                {profile.tax_responses && Object.keys(profile.tax_responses).length > 0 && (
                                    <>
                                        <h3 style={{ fontSize: '1.125rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Tax Information</h3>
                                        {renderField('Carries Business', 'carriesBusiness', profile.has_business ? 'Yes' : 'No')}
                                        {renderField('Has EIN', 'hasEIN', profile.ein ? 'Yes' : 'No')}
                                        {renderField('Out of Country (6+ months)', 'tax_outOfCountry', profile.tax_responses.outOfCountry)}
                                        {renderField('Foreign Bank Account', 'tax_foreignAccount', profile.tax_responses.foreignAccount)}
                                        {renderField('Digital Assets/Investment Income', 'tax_digitalAssets', profile.tax_responses.digitalAssets)}
                                        {renderField('Number of W-2s', 'tax_w2Count', profile.tax_responses.w2Count)}
                                        {renderField('Number of 1099s', 'tax_1099Count', profile.tax_responses['1099Count'])}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Business Information</h3>
                                {renderField('Business Name', 'businessName', profile.businessName || profile.business_name)}
                                {renderField('EIN', 'ein', profile.ein)}
                                {renderField('Mailing Address', 'mailingAddress', profile.mailingAddress || profile.mailing_address)}
                                {renderField('State Incorporated In', 'state_inc', profile.state_inc)}
                                {renderField('Municipality Incorporated In', 'municipality_inc', profile.municipality_inc)}
                                {renderField('Date Incorporated', 'date_inc', profile.date_inc, 'date')}
                                {renderField('Year End', 'year_end', profile.year_end)}

                                {profile.industry_code && (
                                    <>
                                        <h3 style={{ fontSize: '1.125rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Industry Details</h3>
                                        {renderField('Industry Code', 'industry_code', profile.industry_code)}
                                        {renderField('Industry Description', 'industry_description', profile.industry_description)}
                                    </>
                                )}

                                {profile.tax_financials && Object.keys(profile.tax_financials).length > 0 && (
                                    <>
                                        <h3 style={{ fontSize: '1.125rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>Financial Information</h3>
                                        {renderField('Total Revenue', 'biz_revenue', profile.tax_financials.revenue ? `$${profile.tax_financials.revenue}` : '')}
                                        {renderField('Phone Expenses', 'ez_phone', profile.tax_financials.phone ? `$${profile.tax_financials.phone}` : '')}
                                        {renderField('Internet Expenses', 'ez_internet', profile.tax_financials.internet ? `$${profile.tax_financials.internet}` : '')}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </Card>

                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0' }}>Documents</h2>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            + Upload Document
                        </Button>
                    </div>

                    {tempDocs && tempDocs.length > 0 ? (
                        <div style={{ display: 'grid', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
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
                                    <div className="flex items-center gap-md">
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: 'var(--gray-100)',
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            border: '1px solid var(--surface-glass-border)'
                                        }}>
                                            {(() => {
                                                const isImage = doc.type?.startsWith('image/') ||
                                                    doc.name?.toLowerCase().endsWith('.jpg') ||
                                                    doc.name?.toLowerCase().endsWith('.jpeg') ||
                                                    doc.name?.toLowerCase().endsWith('.png') ||
                                                    doc.name?.toLowerCase().endsWith('.gif') ||
                                                    doc.name?.toLowerCase().endsWith('.webp');

                                                if (isImage) {
                                                    const src = doc.isNew ? URL.createObjectURL(doc.file) : (doc.url || doc.file_url);
                                                    return <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                                }
                                                return <span style={{ fontSize: '1.5rem' }}>📄</span>;
                                            })()}
                                        </div>
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
                            border: '1px dashed var(--surface-glass-border)',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            No documents uploaded yet.
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                                handleFileUpload(files);
                            }
                            // Reset input so same file can be selected again
                            e.target.value = '';
                        }}
                        style={{ display: 'none' }}
                    />

                    {(pendingUploads.length > 0 || docsToRemove.length > 0) && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'var(--surface-glass)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--primary-600)',
                            marginTop: 'var(--spacing-md)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    You have unsaved document changes
                                </span>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save All Changes'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ProfileDetails;
