import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { useAuthContext } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import '../../index.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { profiles, loadUserProfiles } = useProfile();
    const { user, signOut } = useAuthContext();
    const [filter, setFilter] = useState('all');
    const [allProfiles, setAllProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load all profiles for admin view
    useEffect(() => {
        loadAllProfiles();
    }, []);

    const loadAllProfiles = async () => {
        try {
            setLoading(true);
            const profiles = await profileService.getAllProfiles();
            setAllProfiles(profiles);
        } catch (error) {
            console.error('Error loading profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProfiles = filter === 'all'
        ? allProfiles
        : allProfiles.filter(p => p.status === filter);

    const stats = {
        total: allProfiles.length,
        pending: allProfiles.filter(p => p.status === 'pending').length,
        verified: allProfiles.filter(p => p.status === 'verified').length,
        rejected: allProfiles.filter(p => p.status === 'rejected').length,
        draft: allProfiles.filter(p => p.status === 'draft').length
    };

    const handleViewProfile = (profileId) => {
        navigate(`/admin/profile/${profileId}`);
    };

    const handleQuickAction = async (profileId, action) => {
        try {
            if (action === 'verified') {
                await profileService.approveProfile(profileId, user.id);
            } else if (action === 'rejected') {
                await profileService.rejectProfile(profileId, user.id);
            }
            await loadAllProfiles(); // Refresh list
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login');
    };

    return (
        <div className="container" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)'
        }}>
            <div className="fade-in">
                <div className="mb-xl text-center">
                    <h1>Admin Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 'var(--spacing-sm)' }}>
                        Welcome, {user?.email}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-4 gap-lg mb-xl">
                    <Card hover={false} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
                            {stats.total}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Total Profiles
                        </div>
                    </Card>
                    <Card hover={false} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--warning)', marginBottom: 'var(--spacing-xs)' }}>
                            {stats.pending}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Pending Review
                        </div>
                    </Card>
                    <Card hover={false} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)', marginBottom: 'var(--spacing-xs)' }}>
                            {stats.verified}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Verified
                        </div>
                    </Card>
                    <Card hover={false} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--error)', marginBottom: 'var(--spacing-xs)' }}>
                            {stats.rejected}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Rejected
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="mb-lg flex gap-sm" style={{ flexWrap: 'wrap' }}>
                    <Button
                        variant={filter === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </Button>
                    <Button
                        variant={filter === 'verified' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('verified')}
                    >
                        Verified ({stats.verified})
                    </Button>
                    <Button
                        variant={filter === 'rejected' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected ({stats.rejected})
                    </Button>
                </div>

                {/* Profiles Table */}
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0' }}>
                            Profiles {filter !== 'all' && `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                        </h2>
                        <Button variant="outline" size="sm" onClick={loadAllProfiles} disabled={loading}>
                            {loading ? 'Refreshing...' : '↻ Refresh'}
                        </Button>
                    </div>

                    {loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-3xl)',
                            color: 'var(--text-secondary)'
                        }}>
                            <div className="spinner" style={{ margin: '0 auto var(--spacing-md)' }}></div>
                            Loading profiles...
                        </div>
                    ) : filteredProfiles.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-3xl)',
                            color: 'var(--text-tertiary)',
                            background: 'var(--surface-glass)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed var(--surface-glass-border)'
                        }}>
                            No profiles found
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse'
                            }}>
                                <thead>
                                    <tr style={{
                                        borderBottom: '2px solid var(--surface-glass-border)',
                                        textAlign: 'left'
                                    }}>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>ID</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Name</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Type</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Created</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Docs</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProfiles.map((profile) => (
                                        <tr
                                            key={profile.id}
                                            style={{
                                                borderBottom: '1px solid var(--surface-glass-border)',
                                                transition: 'background var(--transition-fast)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleViewProfile(profile.id)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                                {profile.id.slice(0, 8)}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-primary)', fontWeight: '600' }}>
                                                {profile.name || profile.business_name || 'Unnamed'}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                {profile.type === 'personal' ? '👤 Personal' : '🏢 Business'}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    background: profile.status === 'verified' ? 'rgba(16, 185, 129, 0.1)' :
                                                        profile.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' :
                                                            profile.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                                    color: profile.status === 'verified' ? '#10b981' :
                                                        profile.status === 'pending' ? '#f59e0b' :
                                                            profile.status === 'rejected' ? '#ef4444' : '#6b7280',
                                                    border: `1px solid ${profile.status === 'verified' ? 'rgba(16, 185, 129, 0.2)' :
                                                        profile.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' :
                                                            profile.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(107, 114, 128, 0.2)'}`
                                                }}>
                                                    {profile.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                {new Date(profile.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                {profile.documents?.length || 0}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                                                <div className="flex gap-sm justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewProfile(profile.id);
                                                        }}
                                                    >
                                                        Review
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
