import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import '../../index.css';

const AdminProfileDetails = () => {
    const { profileId } = useParams();
    const navigate = useNavigate();
    const { getProfileById, updateProfileStatus } = useProfile();

    const profile = getProfileById(profileId);

    if (!profile) {
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-3xl)' }}>
                <Card>
                    <h2>Profile not found</h2>
                    <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
                </Card>
            </div>
        );
    }

    const handleStatusChange = (newStatus) => {
        updateProfileStatus(profileId, newStatus);
        navigate('/admin');
    };

    return (
        <div className="container container-sm" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)'
        }}>
            <div className="fade-in">
                <div className="flex justify-between items-center mb-xl">
                    <h1>Profile Details</h1>
                    <Button variant="secondary" onClick={() => navigate('/admin')}>
                        ← Back to Dashboard
                    </Button>
                </div>

                {/* Profile Status */}
                <Card className="mb-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>
                                {profile.generalInfo.name || profile.generalInfo.businessName || 'Unnamed Profile'}
                            </h2>
                            <div style={{ color: 'var(--text-secondary)' }}>
                                ID: {profile.id} • Type: {profile.type === 'personal' ? 'Personal' : 'Business'}
                            </div>
                        </div>
                        <span className={`badge badge-${profile.status === 'verified' ? 'success' :
                                profile.status === 'pending' ? 'warning' :
                                    profile.status === 'rejected' ? 'error' : 'secondary'
                            }`} style={{ fontSize: '1rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                            {profile.status}
                        </span>
                    </div>
                </Card>

                {/* General Information */}
                <Card className="mb-lg">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                        General Information
                    </h3>
                    <div style={{
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        border: '1px solid var(--surface-glass-border)'
                    }}>
                        {Object.entries(profile.generalInfo).map(([key, value]) => (
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
                </Card>

                {/* Documents */}
                <Card className="mb-lg">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                        Uploaded Documents
                    </h3>
                    {profile.documents && profile.documents.length > 0 ? (
                        <div style={{
                            background: 'var(--surface-glass)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-lg)',
                            border: '1px solid var(--surface-glass-border)'
                        }}>
                            {profile.documents.map((doc) => (
                                <div key={doc.id} style={{
                                    marginBottom: 'var(--spacing-md)',
                                    paddingBottom: 'var(--spacing-md)',
                                    borderBottom: '1px solid var(--surface-glass-border)'
                                }}>
                                    <div style={{
                                        color: 'var(--text-primary)',
                                        fontWeight: '600',
                                        marginBottom: 'var(--spacing-xs)'
                                    }}>
                                        {doc.type}
                                    </div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        {doc.files.length} file(s) • Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                                    </div>
                                    <div style={{ marginTop: 'var(--spacing-sm)' }}>
                                        {doc.files.map((file, idx) => (
                                            <div key={idx} style={{
                                                fontSize: '0.875rem',
                                                color: 'var(--text-tertiary)',
                                                marginLeft: 'var(--spacing-md)'
                                            }}>
                                                • {file.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--spacing-xl)',
                            color: 'var(--text-secondary)'
                        }}>
                            No documents uploaded yet
                        </div>
                    )}
                </Card>

                {/* Metadata */}
                <Card className="mb-xl">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                        Metadata
                    </h3>
                    <div style={{
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        border: '1px solid var(--surface-glass-border)',
                        fontSize: '0.875rem'
                    }}>
                        <div className="flex justify-between mb-sm">
                            <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                            <span style={{ color: 'var(--text-primary)' }}>
                                {new Date(profile.createdAt).toLocaleString()}
                            </span>
                        </div>
                        {profile.updatedAt && (
                            <div className="flex justify-between mb-sm">
                                <span style={{ color: 'var(--text-secondary)' }}>Last Updated:</span>
                                <span style={{ color: 'var(--text-primary)' }}>
                                    {new Date(profile.updatedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-secondary)' }}>Verified:</span>
                            <span style={{ color: 'var(--text-primary)' }}>
                                {profile.verified ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <Card>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                        Admin Actions
                    </h3>
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <Button
                            variant="success"
                            onClick={() => handleStatusChange('verified')}
                            disabled={profile.status === 'verified'}
                        >
                            ✓ Approve Profile
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleStatusChange('rejected')}
                            disabled={profile.status === 'rejected'}
                        >
                            ✗ Reject Profile
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleStatusChange('pending')}
                            disabled={profile.status === 'pending'}
                        >
                            ⟳ Mark as Pending
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => handleStatusChange('draft')}
                            disabled={profile.status === 'draft'}
                        >
                            📝 Mark as Draft
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminProfileDetails;
