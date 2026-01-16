import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useAuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import '../index.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { profiles, getProfileCounts, canCreateProfile } = useProfile();
    const { user, signOut } = useAuthContext();
    const { personalCount, businessCount } = getProfileCounts();

    const canCreateAny = canCreateProfile('personal') || canCreateProfile('business');

    const handleNewProfile = () => {
        if (!canCreateAny) {
            alert('You have reached the maximum number of profiles (1 personal + 1 business). Please delete an existing profile to create a new one.');
            return;
        }
        navigate('/profile-type');
    };

    const handleProfileClick = (profileId) => {
        navigate(`/profile/${profileId}`);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
            <div className="fade-in">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    <div>
                        <h1 className="text-center mb-sm">Profile Management</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                            Welcome back, {user?.email}!
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

                <Card className="mb-xl">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)' }}>
                        You have these Profiles
                    </h2>

                    {profiles.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            color: 'var(--text-secondary)'
                        }}>
                            <p style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-lg)' }}>
                                No profiles yet. Create your first profile to get started.
                            </p>
                        </div>
                    ) : (
                        <div className="mb-lg" style={{
                            maxHeight: '300px',
                            overflowY: 'auto',
                            padding: 'var(--spacing-sm)'
                        }}>
                            {profiles.map((profile, index) => (
                                <div
                                    key={profile.id}
                                    onClick={() => handleProfileClick(profile.id)}
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        marginBottom: 'var(--spacing-sm)',
                                        background: 'var(--surface-glass)',
                                        border: '1px solid var(--surface-glass-border)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--surface-glass-hover)';
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--surface-glass)';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <div>
                                        <div style={{
                                            color: 'var(--text-primary)',
                                            fontWeight: '600',
                                            marginBottom: 'var(--spacing-xs)'
                                        }}>
                                            {index + 1}. {profile.name || profile.businessName || 'Unnamed Profile'}
                                            <span style={{
                                                color: 'var(--text-tertiary)',
                                                fontWeight: '400',
                                                marginLeft: 'var(--spacing-sm)'
                                            }}>
                                                ({profile.type === 'personal' ? 'Personal' : 'Business'})
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            Created: {new Date(profile.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={`badge badge-${profile.status === 'verified' ? 'success' :
                                        profile.status === 'pending' ? 'warning' :
                                            profile.status === 'rejected' ? 'error' : 'secondary'
                                        }`}>
                                        {profile.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Profile Count Status */}
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--surface-glass-border)',
                        marginTop: 'var(--spacing-md)'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Profile Status:</strong> {personalCount}/1 Personal, {businessCount}/1 Business
                        </p>
                    </div>
                </Card>

                <div className="grid grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <Card hover={false} style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📊</div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0' }}>Recordkeeping</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0' }}>
                            Coming Soon
                        </p>
                    </Card>

                    <Card hover={false} style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>💰</div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0' }}>Taxes</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0' }}>
                            Coming Soon
                        </p>
                    </Card>

                    <Card hover={false} style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📁</div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0' }}>Historic Files</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0' }}>
                            Coming Soon
                        </p>
                    </Card>

                    <Card
                        style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-lg)',
                            cursor: canCreateAny ? 'pointer' : 'not-allowed',
                            background: canCreateAny ? 'var(--primary-600)' : 'var(--gray-400)',
                            border: 'none',
                            opacity: canCreateAny ? 1 : 0.6
                        }}
                        onClick={handleNewProfile}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>➕</div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0', color: 'white' }}>New Profile</h3>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0' }}>
                            {canCreateAny ? 'Create New' : 'Limit Reached'}
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
