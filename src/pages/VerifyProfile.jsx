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

    const requiredDocs = currentProfile.type === 'personal'
        ? ['SSN / EIN', "Driver's License", 'Marriage cert.']
        : ['SSN / EIN', "Driver's License", 'Business License'];

    const handleVerify = () => {
        setIsVerified(!isVerified);
    };

    const handleNext = () => {
        if (isVerified) {
            updateProfileInfo({ verified: true });
            navigate('/upload-documents');
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
                        {Object.entries(currentProfile.generalInfo).map(([key, value]) => (
                            <div key={key} className="flex justify-between" style={{
                                marginBottom: 'var(--spacing-sm)',
                                paddingBottom: 'var(--spacing-sm)',
                                borderBottom: '1px solid var(--surface-glass-border)'
                            }}>
                                <span style={{
                                    color: 'var(--text-secondary)',
                                    textTransform: 'capitalize'
                                }}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                </span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="checkbox-wrapper"
                        onClick={handleVerify}
                        style={{ marginTop: 'var(--spacing-lg)' }}
                    >
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={isVerified}
                            onChange={handleVerify}
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
