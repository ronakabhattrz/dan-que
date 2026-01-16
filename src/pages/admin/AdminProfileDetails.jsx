import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { profileService } from '../../services/profileService';
import Card from '../../components/Card';
import Button from '../../components/Button';
import '../../index.css';

const AdminProfileDetails = () => {
    const { profileId } = useParams();
    const navigate = useNavigate();
    const { updateProfileStatus } = useProfile();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await profileService.getProfileById(profileId);
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
                alert('Failed to load profile details.');
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };

        if (profileId) {
            fetchProfile();
        }
    }, [profileId, navigate]);

    const handleStatusChange = async (newStatus) => {
        try {
            setSaving(true);
            await updateProfileStatus(profileId, newStatus);
            // Refresh local state
            const updatedProfile = await profileService.getProfileById(profileId);
            setProfile(updatedProfile);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update profile status.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto var(--spacing-md)' }}></div>
                <p>Loading profile details...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-3xl)' }}>
                <Card>
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Profile not found</h2>
                        <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const renderDataSection = (title, data) => {
        if (!data || Object.keys(data).length === 0) return null;

        const filteredData = Object.entries(data).filter(([_, value]) => value !== null && value !== '' && value !== undefined);
        if (filteredData.length === 0) return null;

        return (
            <Card className="mb-lg">
                <h3 style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: 'var(--spacing-lg)',
                    paddingLeft: 'var(--spacing-xs)',
                    borderLeft: '3px solid var(--text-primary)'
                }}>
                    {title}
                </h3>
                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {filteredData.map(([key, value]) => (
                        <div key={key} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            paddingBottom: 'var(--spacing-sm)',
                            borderBottom: '1px solid var(--surface-glass-border)'
                        }}>
                            <span style={{
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                marginBottom: '2px'
                            }}>
                                {key.replace(/_/g, ' ')}
                            </span>
                            <span style={{
                                fontSize: '1rem',
                                color: 'var(--text-primary)',
                                fontWeight: '500'
                            }}>
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString()}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

    return (
        <div className="container container-sm" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)'
        }}>
            <div className="fade-in">
                <div className="flex justify-between items-center mb-xl">
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Review Profile</h1>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                            {profile.type === 'personal' ? '👤 Personal Profile' : '🏢 Business Profile'} • {profile.id}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                        ← Back
                    </Button>
                </div>

                {/* Status Banner */}
                <Card className="mb-lg" style={{
                    background: profile.status === 'verified' ? 'var(--success-glass)' :
                        profile.status === 'rejected' ? 'var(--error-glass)' :
                            profile.status === 'pending' ? 'var(--warning-glass)' : 'var(--surface-glass)',
                    borderColor: 'transparent'
                }}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-md">
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: profile.status === 'verified' ? 'var(--success)' :
                                    profile.status === 'rejected' ? 'var(--error)' :
                                        profile.status === 'pending' ? 'var(--warning)' : 'var(--text-tertiary)'
                            }}></div>
                            <span style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Status: {profile.status}
                            </span>
                        </div>
                        <div className="flex gap-sm">
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleStatusChange('verified')}
                                disabled={saving || profile.status === 'verified'}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleStatusChange('rejected')}
                                disabled={saving || profile.status === 'rejected'}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Core Info */}
                {renderDataSection('Personal Information', {
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    preferred_name: profile.preferred_name,
                    email: profile.email,
                    phone: profile.phone,
                    ssn: profile.ssn ? '***-**-' + profile.ssn.slice(-4) : null,
                    date_of_birth: profile.dob,
                    mailing_address: profile.mailing_address,
                    residency_state: profile.residency_state
                })}

                {profile.type === 'business' && renderDataSection('Business Information', {
                    business_name: profile.business_name,
                    ein: profile.ein,
                    has_business: profile.has_business ? 'Yes' : 'No'
                })}

                {renderDataSection('Identification Details', profile.dl_details)}

                {renderDataSection('Household & Tax', {
                    marital_status: profile.marital_status,
                    spouse_info: profile.spouse_info,
                    dependents: profile.dependents,
                    tax_responses: profile.tax_responses,
                    tax_financials: profile.tax_financials
                })}

                {/* Documents */}
                <Card className="mb-lg">
                    <h3 style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: 'var(--spacing-lg)',
                        paddingLeft: 'var(--spacing-xs)',
                        borderLeft: '3px solid var(--text-primary)'
                    }}>
                        Uploaded Documents
                    </h3>
                    {profile.documents && profile.documents.length > 0 ? (
                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            {profile.documents.map((doc) => (
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
                                                    return <img src={doc.file_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                                }
                                                return <span style={{ fontSize: '1.5rem' }}>📄</span>;
                                            })()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                                {doc.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                {doc.type} • {(doc.file_size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                                            border: '1px solid var(--text-primary)',
                                            borderRadius: 'var(--radius-sm)'
                                        }}
                                    >
                                        View Full
                                    </a>
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
                            No documents uploaded.
                        </div>
                    )}
                </Card>

                {/* Metadata */}
                <div style={{
                    padding: 'var(--spacing-lg)',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.75rem'
                }}>
                    Created on {new Date(profile.created_at).toLocaleString()}
                    {profile.updated_at && ` • Last updated ${new Date(profile.updated_at).toLocaleString()}`}
                </div>
            </div>
        </div>
    );
};

export default AdminProfileDetails;
