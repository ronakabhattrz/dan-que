import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { taxDataService } from '../services/taxDataService';
import Card from '../components/Card';
import Button from '../components/Button';

const TaxHistory = () => {
    const navigate = useNavigate();
    const { profiles, setCurrentProfile } = useProfile();
    const { showError } = useNotifications();

    const [taxInventory, setTaxInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTaxInventory = async () => {
            try {
                setLoading(true);
                const inventory = [];

                for (const profile of profiles) {
                    const years = await taxDataService.getAllTaxYears(profile.id);
                    if (years && years.length > 0) {
                        inventory.push({
                            profile,
                            years: years
                        });
                    }
                }

                setTaxInventory(inventory);
            } catch (error) {
                console.error('Error loading tax inventory:', error);
                showError('Failed to load tax history');
            } finally {
                setLoading(false);
            }
        };

        if (profiles.length > 0) {
            loadTaxInventory();
        } else {
            setLoading(false);
        }
    }, [profiles]);

    const handleViewTaxData = (profile, year) => {
        setCurrentProfile(profile);
        // We navigate to tax-data, and since we just set the currentProfile,
        // it will auto-load that profile. We can't easily pass the year via context
        // but we can pass it via URL or state. Let's use URL search params.
        navigate(`/tax-data?year=${year}`);
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
            <div className="fade-in">
                <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0 }}>Tax Records History</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                            Overview of all submitted tax data across your profiles.
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => navigate('/')}>
                        ← Back to Home
                    </Button>
                </div>

                {loading ? (
                    <Card style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div className="spinner" style={{ margin: '0 auto var(--spacing-md)' }}></div>
                        <p>Loading tax history...</p>
                    </Card>
                ) : taxInventory.length > 0 ? (
                    <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
                        {taxInventory.map(item => (
                            <Card key={item.profile.id} style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{
                                    padding: 'var(--spacing-lg)',
                                    background: 'var(--surface-glass)',
                                    borderBottom: '1px solid var(--surface-glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>
                                            {item.profile.type === 'personal' ? `${item.profile.firstName} ${item.profile.lastName}` : item.profile.businessName}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            color: 'var(--text-tertiary)',
                                            fontWeight: '600',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {item.profile.type} Profile
                                        </span>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        setCurrentProfile(item.profile);
                                        navigate('/tax-data');
                                    }}>
                                        Manage Tax Data
                                    </Button>
                                </div>

                                <div style={{ padding: 'var(--spacing-lg)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
                                        {item.years.map(yearData => (
                                            <div
                                                key={yearData.tax_year}
                                                onClick={() => handleViewTaxData(item.profile, yearData.tax_year)}
                                                style={{
                                                    padding: 'var(--spacing-md)',
                                                    background: 'var(--bg-primary)',
                                                    border: '1px solid var(--surface-glass-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-fast)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 'var(--spacing-xs)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--primary-400)';
                                                    e.currentTarget.style.background = 'var(--surface-glass-hover)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--surface-glass-border)';
                                                    e.currentTarget.style.background = 'var(--bg-primary)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                        {yearData.tax_year}
                                                    </span>
                                                    <span style={{ fontSize: '1rem' }}>📄</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                    Updated: {new Date(yearData.updated_at).toLocaleDateString()}
                                                </div>
                                                <div style={{ marginTop: 'var(--spacing-xs)', color: 'var(--primary-400)', fontSize: '0.875rem', fontWeight: '600' }}>
                                                    View Details →
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📭</div>
                        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>No Tax Records Found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                            You haven't added any tax data for any of your profiles yet.
                        </p>
                        <Button variant="primary" onClick={() => navigate('/tax-data')}>
                            Get Started
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TaxHistory;
