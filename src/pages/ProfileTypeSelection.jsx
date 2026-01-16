import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import '../index.css';

const ProfileTypeSelection = () => {
    const navigate = useNavigate();
    const { createProfile, canCreateProfile, getProfileCounts, profiles } = useProfile();
    const { personalCount, businessCount } = getProfileCounts();

    const handleSelectType = async (type) => {
        if (!canCreateProfile(type)) {
            alert(`You already have a ${type} profile. You can only create 1 ${type} profile. Please delete your existing one to create a new one.`);
            return;
        }

        try {
            await createProfile(type);
            navigate('/general-info');
        } catch (error) {
            console.error('Error creating profile:', error);
            alert(error.message || 'Failed to create profile. Please try again.');
        }
    };

    const handleEditProfile = (type) => {
        // Find the existing profile of this type
        const existingProfile = profiles.find(p => p.type === type);
        if (existingProfile) {
            navigate(`/profile/${existingProfile.id}`);
        }
    };

    const canCreatePersonal = canCreateProfile('personal');
    const canCreateBusiness = canCreateProfile('business');

    const existingPersonalProfile = profiles.find(p => p.type === 'personal');
    const existingBusinessProfile = profiles.find(p => p.type === 'business');

    return (
        <div className="container container-sm" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <div className="fade-in">
                <h1 className="text-center mb-xl">I want to create a new</h1>

                <div className="grid grid-2 gap-lg mb-xl">
                    <Card
                        onClick={() => canCreatePersonal && handleSelectType('personal')}
                        style={{
                            cursor: canCreatePersonal ? 'pointer' : 'default',
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            transition: 'all var(--transition-base)',
                            position: 'relative'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>👤</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Personal / SSN</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
                            For individual profiles using Social Security Number
                        </p>
                        {!canCreatePersonal && existingPersonalProfile && (
                            <div style={{
                                marginTop: 'var(--spacing-md)',
                                padding: 'var(--spacing-sm)',
                                background: 'var(--surface-glass)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.875rem',
                                color: 'var(--text-tertiary)'
                            }}>
                                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                    Limit reached ({personalCount}/1)
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProfile('personal');
                                    }}
                                    style={{ marginTop: 'var(--spacing-xs)' }}
                                >
                                    Edit Existing Profile
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card
                        onClick={() => canCreateBusiness && handleSelectType('business')}
                        style={{
                            cursor: canCreateBusiness ? 'pointer' : 'default',
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            transition: 'all var(--transition-base)',
                            position: 'relative'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🏢</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Business / EIN</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
                            For business profiles using Employer Identification Number
                        </p>
                        {!canCreateBusiness && existingBusinessProfile && (
                            <div style={{
                                marginTop: 'var(--spacing-md)',
                                padding: 'var(--spacing-sm)',
                                background: 'var(--surface-glass)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.875rem',
                                color: 'var(--text-tertiary)'
                            }}>
                                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                    Limit reached ({businessCount}/1)
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditProfile('business');
                                    }}
                                    style={{ marginTop: 'var(--spacing-xs)' }}
                                >
                                    Edit Existing Profile
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="text-center">
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        ← Back to Home
                    </Button>
                </div>

                <div style={{
                    marginTop: 'var(--spacing-2xl)',
                    padding: 'var(--spacing-lg)',
                    background: 'var(--surface-glass)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--surface-glass-border)'
                }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Profile Limits:</strong> You can create 1 personal profile and 1 business profile.
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
                        Current: {personalCount}/1 Personal, {businessCount}/1 Business
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileTypeSelection;
