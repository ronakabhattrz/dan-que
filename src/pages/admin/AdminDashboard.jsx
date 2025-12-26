import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import '../../index.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { profiles, updateProfileStatus } = useProfile();
    const [filter, setFilter] = useState('all');

    const filteredProfiles = filter === 'all'
        ? profiles
        : profiles.filter(p => p.status === filter);

    const stats = {
        total: profiles.length,
        pending: profiles.filter(p => p.status === 'pending').length,
        verified: profiles.filter(p => p.status === 'verified').length,
        rejected: profiles.filter(p => p.status === 'rejected').length,
        draft: profiles.filter(p => p.status === 'draft').length
    };

    const handleViewProfile = (profileId) => {
        navigate(`/admin/profile/${profileId}`);
    };

    const handleQuickAction = (profileId, action) => {
        updateProfileStatus(profileId, action);
    };

    return (
        <div className="container" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)'
        }}>
            <div className="fade-in">
                <div className="flex justify-between items-center mb-xl">
                    <h1>Admin Dashboard</h1>
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        ← Back to Home
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-4 mb-xl">
                    <Card hover={false} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-400)' }}>
                            {stats.total}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Total Profiles</div>
                    </Card>
                    <Card hover={false} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--warning)' }}>
                            {stats.pending}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Pending Review</div>
                    </Card>
                    <Card hover={false} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--success)' }}>
                            {stats.verified}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Verified</div>
                    </Card>
                    <Card hover={false} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--error)' }}>
                            {stats.rejected}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Rejected</div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-lg">
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <Button
                            variant={filter === 'all' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('all')}
                        >
                            All ({stats.total})
                        </Button>
                        <Button
                            variant={filter === 'pending' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('pending')}
                        >
                            Pending ({stats.pending})
                        </Button>
                        <Button
                            variant={filter === 'verified' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('verified')}
                        >
                            Verified ({stats.verified})
                        </Button>
                        <Button
                            variant={filter === 'rejected' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('rejected')}
                        >
                            Rejected ({stats.rejected})
                        </Button>
                        <Button
                            variant={filter === 'draft' ? 'primary' : 'secondary'}
                            onClick={() => setFilter('draft')}
                        >
                            Draft ({stats.draft})
                        </Button>
                    </div>
                </Card>

                {/* Profiles Table */}
                <Card>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)' }}>
                        Profiles {filter !== 'all' && `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                    </h2>

                    {filteredProfiles.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            color: 'var(--text-secondary)'
                        }}>
                            No profiles found
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '0.875rem'
                            }}>
                                <thead>
                                    <tr style={{
                                        borderBottom: '2px solid var(--surface-glass-border)',
                                        textAlign: 'left'
                                    }}>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>ID</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Name</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Type</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Status</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Created</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Documents</th>
                                        <th style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProfiles.map((profile) => (
                                        <tr
                                            key={profile.id}
                                            style={{
                                                borderBottom: '1px solid var(--surface-glass-border)',
                                                transition: 'background var(--transition-fast)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-tertiary)' }}>
                                                {profile.id.slice(-6)}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-primary)', fontWeight: '600' }}>
                                                {profile.generalInfo.name || profile.generalInfo.businessName || 'Unnamed'}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                {profile.type === 'personal' ? '👤 Personal' : '🏢 Business'}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <span className={`badge badge-${profile.status === 'verified' ? 'success' :
                                                        profile.status === 'pending' ? 'warning' :
                                                            profile.status === 'rejected' ? 'error' : 'secondary'
                                                    }`}>
                                                    {profile.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                {new Date(profile.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                                {profile.documents?.length || 0} files
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <div className="flex gap-sm">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleViewProfile(profile.id)}
                                                    >
                                                        View
                                                    </Button>
                                                    {profile.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleQuickAction(profile.id, 'verified')}
                                                            >
                                                                ✓
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleQuickAction(profile.id, 'rejected')}
                                                            >
                                                                ✗
                                                            </Button>
                                                        </>
                                                    )}
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
