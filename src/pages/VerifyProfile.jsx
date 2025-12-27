import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import '../index.css';

const VerifyProfile = () => {
    const navigate = useNavigate();
    const { currentProfile, updateProfileInfo } = useProfile();
    const [isVerified, setIsVerified] = useState(false);

    if (!currentProfile) {
        navigate('/profile-type');
        return null;
    }

    // Check if all required fields are filled
    const requiredFields = currentProfile.type === 'personal'
        ? ['name', 'address', 'phone', 'email']
        : ['businessName', 'address', 'phone', 'email', 'ein'];

    const missingFields = requiredFields.filter(field => !currentProfile[field]);
    const hasAllRequiredFields = missingFields.length === 0;

    const requiredDocs = currentProfile.type === 'personal'
        ? ['SSN / EIN', "Driver's License", 'Marriage cert.']
        : ['SSN / EIN', "Driver's License", 'Business License'];

    const handleVerify = () => {
        if (!hasAllRequiredFields) {
            return; // Don't allow verification if required fields are missing
        }
        setIsVerified(!isVerified);
    };

    const handleNext = async () => {
        if (isVerified) {
            try {
                await updateProfileInfo({ verified: true });
                navigate('/upload-documents');
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
            }
        }
    };

    return (
        <div className="container container-sm" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)'
        }}>
            <div className="fade-in">
                <h1 className="text-center mb-xl">Verify the new Profile</h1>

                <Card className="mb-lg">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                        {currentProfile.type === 'personal' ? 'SSN (or EIN)' : 'EIN'}
                    </h2>

                    <div style={{
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        marginBottom: 'var(--spacing-md)',
                        border: '1px solid var(--surface-glass-border)'
                    }}>
                        {currentProfile.type === 'personal' ? (
                            <>
                                {currentProfile.name && (
                                    <div className="flex justify-between" style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        paddingBottom: 'var(--spacing-sm)',
                                        borderBottom: '1px solid var(--surface-glass-border)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.name}</span>
                                    </div>
                                )}
                                {currentProfile.address && (
                                    <div className="flex justify-between" style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        paddingBottom: 'var(--spacing-sm)',
                                        borderBottom: '1px solid var(--surface-glass-border)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.address}</span>
                                    </div>
                                )}
                                {currentProfile.phone && (
                                    <div className="flex justify-between" style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        paddingBottom: 'var(--spacing-sm)',
                                        borderBottom: '1px solid var(--surface-glass-border)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.phone}</span>
                                    </div>
                                )}
                                {currentProfile.email && (
                                    <div className="flex justify-between" style={{ marginBottom: '0' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.email}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {currentProfile.businessName && (
                                    <div className="flex justify-between" style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        paddingBottom: 'var(--spacing-sm)',
                                        borderBottom: '1px solid var(--surface-glass-border)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Business Name:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.businessName}</span>
                                    </div>
                                )}
                                {currentProfile.address && (
                                    <div className="flex justify-between" style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        paddingBottom: 'var(--spacing-sm)',
                                        borderBottom: '1px solid var(--surface-glass-border)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.address}</span>
                                    </div>
                                )}
                                {currentProfile.phone && (
                                    <div className="flex justify-between" style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        paddingBottom: 'var(--spacing-sm)',
                                        borderBottom: '1px solid var(--surface-glass-border)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.phone}</span>
                                    </div>
                                )}
                                {currentProfile.email && (
                                    <div className="flex justify-between" style={{
                                        marginBottom: 'var(--spacing-sm)',
                                        paddingBottom: 'var(--spacing-sm)',
                                        borderBottom: '1px solid var(--surface-glass-border)'
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.email}</span>
                                    </div>
                                )}
                                {currentProfile.ein && (
                                    <div className="flex justify-between" style={{ marginBottom: '0' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>EIN:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{currentProfile.ein}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!hasAllRequiredFields && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(251, 191, 36, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--warning)',
                            marginTop: 'var(--spacing-lg)',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--warning)', marginBottom: 'var(--spacing-xs)', fontWeight: '600' }}>
                                ⚠️ Missing Required Fields
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
                                Please go back and complete: {missingFields.map(f => {
                                    const labels = {
                                        name: 'Name',
                                        businessName: 'Business Name',
                                        address: 'Address',
                                        phone: 'Phone',
                                        email: 'Email',
                                        ein: 'EIN'
                                    };
                                    return labels[f] || f;
                                }).join(', ')}
                            </p>
                        </div>
                    )}

                    <div
                        className="checkbox-wrapper"
                        onClick={handleVerify}
                        style={{
                            marginTop: 'var(--spacing-lg)',
                            opacity: hasAllRequiredFields ? 1 : 0.5,
                            cursor: hasAllRequiredFields ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={isVerified}
                            onChange={handleVerify}
                            disabled={!hasAllRequiredFields}
                        />
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                            Verify
                        </span>
                    </div>
                </Card>

                <Card className="mb-xl">
                    <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-md)' }}>
                        To finalize this profile, we need the photo of the following docs:
                    </h3>

                    <div style={{
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        border: '1px solid var(--surface-glass-border)'
                    }}>
                        {requiredDocs.map((doc, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                marginBottom: index < requiredDocs.length - 1 ? 'var(--spacing-sm)' : '0',
                                color: 'var(--text-primary)'
                            }}>
                                <span style={{ color: 'var(--primary-400)' }}>•</span>
                                {doc}
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-xl">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleNext}
                            disabled={!isVerified}
                        >
                            DONE
                        </Button>
                    </div>
                </Card>

                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--surface-glass)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--surface-glass-border)'
                }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> Please verify all information is correct before proceeding to document upload.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyProfile;
