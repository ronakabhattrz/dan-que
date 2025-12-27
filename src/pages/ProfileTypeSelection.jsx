import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import '../index.css';

const ProfileTypeSelection = () => {
    const navigate = useNavigate();
    const { createProfile } = useProfile();

    const handleSelectType = async (type) => {
        try {
            await createProfile(type);
            navigate('/general-info');
        } catch (error) {
            console.error('Error creating profile:', error);
            alert('Failed to create profile. Please try again.');
        }
    };

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
                        onClick={() => handleSelectType('personal')}
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            transition: 'all var(--transition-base)'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>👤</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Personal / SSN</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
                            For individual profiles using Social Security Number
                        </p>
                    </Card>

                    <Card
                        onClick={() => handleSelectType('business')}
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            transition: 'all var(--transition-base)'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>🏢</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Business / EIN</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>
                            For business profiles using Employer Identification Number
                        </p>
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
                        <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> Depending on what button clicked, a specific question list will be populated in the next page.
                    </p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
                        Come to this page any time a new profile needs to be created.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfileTypeSelection;
