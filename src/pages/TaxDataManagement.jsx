import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { taxDataService } from '../services/taxDataService';
import { documentService } from '../services/documentService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const TaxDataManagement = () => {
    const navigate = useNavigate();
    const { profiles, currentProfile, setCurrentProfile } = useProfile();
    const { showSuccess, showError, showInfo } = useNotifications();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const yearParam = params.get('year');
        if (yearParam) {
            setSelectedYear(parseInt(yearParam));
        }
    }, [location.search]);

    const [selectedYear, setSelectedYear] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const yearParam = params.get('year');
        return yearParam ? parseInt(yearParam) : new Date().getFullYear();
    });
    const [availableYears, setAvailableYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    const [taxData, setTaxData] = useState({
        // Personal Tax Questions
        out_of_country: false,
        months_out_of_country: null,
        foreign_account: false,
        digital_assets: false,
        w2_count: 0,
        form_1099_count: 0,
        spouse_w2_count: 0,
        spouse_1099_count: 0,

        // Dependent Questions
        dependent_student: false,
        dependent_months_us: null,
        dependent_lived_with: false,
        dependent_worked: false,

        // Business Income toggle for personal profiles
        has_business_income: false,

        // Business Tax Data
        total_revenue: null,
        phone_expense: null,
        internet_expense: null,

        // Industry-specific expenses
        industry_expenses: {}
    });

    useEffect(() => {
        if (currentProfile) {
            loadAvailableYears();
            loadTaxDataForYear(selectedYear);
            loadDocuments(selectedYear);
        }
    }, [currentProfile, selectedYear]);

    const loadAvailableYears = async () => {
        try {
            const years = await taxDataService.getAllTaxYears(currentProfile.id);
            setAvailableYears(years.map(y => y.tax_year));
        } catch (error) {
            console.error('Error loading years:', error);
        }
    };

    const loadDocuments = async (year) => {
        try {
            const docs = await documentService.getDocumentsByTaxYear(currentProfile.id, year);
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        }
    };

    const loadTaxDataForYear = async (year) => {
        setLoading(true);
        try {
            const data = await taxDataService.getTaxDataByYear(currentProfile.id, year);
            if (data) {
                setTaxData({
                    out_of_country: data.out_of_country || false,
                    months_out_of_country: data.months_out_of_country,
                    foreign_account: data.foreign_account || false,
                    digital_assets: data.digital_assets || false,
                    w2_count: data.w2_count || 0,
                    form_1099_count: data.form_1099_count || 0,
                    spouse_w2_count: data.spouse_w2_count || 0,
                    spouse_1099_count: data.spouse_1099_count || 0,
                    dependent_student: data.dependent_student || false,
                    dependent_months_us: data.dependent_months_us,
                    dependent_lived_with: data.dependent_lived_with || false,
                    dependent_worked: data.dependent_worked || false,
                    has_business_income: data.has_business_income || false,
                    total_revenue: data.total_revenue,
                    phone_expense: data.phone_expense,
                    internet_expense: data.internet_expense,
                    industry_expenses: data.industry_expenses || {}
                });
            } else {
                // Reset to defaults for new year
                setTaxData({
                    out_of_country: false,
                    months_out_of_country: null,
                    foreign_account: false,
                    digital_assets: false,
                    w2_count: 0,
                    form_1099_count: 0,
                    spouse_w2_count: 0,
                    spouse_1099_count: 0,
                    dependent_student: false,
                    dependent_months_us: null,
                    dependent_lived_with: false,
                    dependent_worked: false,
                    has_business_income: false,
                    total_revenue: null,
                    phone_expense: null,
                    internet_expense: null,
                    industry_expenses: {}
                });
            }
        } catch (error) {
            console.error('Error loading tax data:', error);
            showError('Failed to load tax data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await taxDataService.saveTaxData(currentProfile.id, selectedYear, taxData);
            showSuccess(`Tax data for ${selectedYear} saved successfully`);
            loadAvailableYears(); // Refresh the list
        } catch (error) {
            console.error('Error saving tax data:', error);
            showError('Failed to save tax data');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteYear = async (year) => {
        if (!confirm(`Are you sure you want to delete tax data for ${year}?`)) return;

        try {
            await taxDataService.deleteTaxYear(currentProfile.id, year);
            showSuccess(`Tax data for ${year} deleted`);
            loadAvailableYears();
            if (year === selectedYear) {
                setSelectedYear(new Date().getFullYear());
            }
        } catch (error) {
            console.error('Error deleting tax data:', error);
            showError('Failed to delete tax data');
        }
    };

    const handleInputChange = (field, value) => {
        setTaxData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            for (const file of files) {
                await documentService.uploadDocument(currentProfile.id, file, selectedYear);
            }
            showSuccess(`${files.length} document(s) uploaded for ${selectedYear}`);
            loadDocuments(selectedYear);
        } catch (error) {
            console.error('Error uploading documents:', error);
            showError('Failed to upload documents');
        } finally {
            setUploading(false);
            event.target.value = ''; // Reset file input
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await documentService.deleteDocument(documentId);
            showSuccess('Document deleted');
            loadDocuments(selectedYear);
        } catch (error) {
            console.error('Error deleting document:', error);
            showError('Failed to delete document');
        }
    };

    if (!currentProfile) {
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
                <Card style={{ padding: 'var(--spacing-2xl)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📊</div>
                        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Select a Profile</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Choose the profile you want to manage tax data for.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gap: 'var(--spacing-md)', maxWidth: '600px', margin: '0 auto' }}>
                        {profiles.length > 0 ? (
                            profiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => setCurrentProfile(profile)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-lg)',
                                        background: 'var(--surface-glass)',
                                        border: '1px solid var(--surface-glass-border)',
                                        borderRadius: 'var(--radius-lg)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                        width: '100%'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--surface-glass-hover)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--surface-glass)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.125rem' }}>
                                            {profile.type === 'personal' ? `${profile.firstName} ${profile.lastName}` : profile.businessName}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                            {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)} Profile
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--primary-400)', fontWeight: '600' }}>
                                        Select →
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-lg)' }}>
                                    No profiles found. You need to create a profile first.
                                </p>
                                <Button onClick={() => navigate('/create-profile')} variant="primary">
                                    Create Profile
                                </Button>
                            </div>
                        )}

                        <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center', display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                            <Button onClick={() => navigate('/tax-history')} variant="secondary">
                                📋 View Tax History
                            </Button>
                            <Button onClick={() => navigate('/')} variant="outline">
                                Back to Homepage
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const isPersonal = currentProfile.type === 'personal';
    const isBusiness = currentProfile.type === 'business';
    const isMarried = currentProfile.marital_status === 'married';
    const hasDependents = currentProfile.dependents?.length > 0;

    // Generate year options (last 5 years + next year)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
            <div className="fade-in">
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 'var(--spacing-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <h1 style={{ margin: 0 }}>Tax Data Management</h1>
                            <span style={{
                                background: currentProfile.type === 'personal' ? 'var(--primary-600)' : 'var(--success-600)',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                {currentProfile.type === 'personal' ? '👤 Personal' : '🏢 Business'}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentProfile(null)}
                            style={{ fontSize: '0.875rem' }}
                        >
                            🔄 Switch Profile
                        </Button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                        Managing tax data for {currentProfile.type === 'personal' ? currentProfile.firstName + ' ' + currentProfile.lastName : currentProfile.business_name}
                    </p>
                </div>

                {/* Year Selector */}
                <Card style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Tax Year</label>
                            <select
                                className="form-input"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            >
                                {yearOptions.map(year => (
                                    <option key={year} value={year}>
                                        {year} {availableYears.includes(year) ? '✓' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {availableYears.includes(selectedYear) && (
                            <Button
                                variant="outline"
                                onClick={() => handleDeleteYear(selectedYear)}
                                style={{ marginTop: 'var(--spacing-lg)' }}
                            >
                                Delete {selectedYear}
                            </Button>
                        )}
                    </div>
                </Card>

                {loading ? (
                    <Card>
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-tertiary)' }}>
                            Loading...
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Personal Tax Questions */}
                        {isPersonal && (
                            <Card style={{ marginBottom: 'var(--spacing-lg)', borderLeft: '4px solid var(--primary-500)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Personal Tax Information</h3>

                                <div className="form-group">
                                    <label className="form-label">Were you out of the country over 6 months?</label>
                                    <select
                                        className="form-input"
                                        value={taxData.out_of_country ? 'Yes' : 'No'}
                                        onChange={(e) => handleInputChange('out_of_country', e.target.value === 'Yes')}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                {taxData.out_of_country && (
                                    <div className="form-group">
                                        <label className="form-label">How many months? (1-12)</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={taxData.months_out_of_country ?? ''}
                                            onChange={(e) => handleInputChange('months_out_of_country', e.target.value === '' ? null : parseInt(e.target.value))}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Foreign bank account?</label>
                                    <select
                                        className="form-input"
                                        value={taxData.foreign_account ? 'Yes' : 'No'}
                                        onChange={(e) => handleInputChange('foreign_account', e.target.value === 'Yes')}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Did you sell any digital asset or investment income?</label>
                                    <select
                                        className="form-input"
                                        value={taxData.digital_assets ? 'Yes' : 'No'}
                                        onChange={(e) => handleInputChange('digital_assets', e.target.value === 'Yes')}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">How many W-2s did YOU have?</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={taxData.w2_count ?? 0}
                                        onChange={(e) => handleInputChange('w2_count', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">How many 1099s did YOU have?</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={taxData.form_1099_count ?? 0}
                                        onChange={(e) => handleInputChange('form_1099_count', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                    />
                                </div>

                                {isMarried && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">How many W-2s did your SPOUSE have?</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={taxData.spouse_w2_count ?? 0}
                                                onChange={(e) => handleInputChange('spouse_w2_count', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">How many 1099s did your SPOUSE have?</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={taxData.spouse_1099_count ?? 0}
                                                onChange={(e) => handleInputChange('spouse_1099_count', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-group border-top" style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)' }}>
                                    <label className="form-label" style={{ fontWeight: '600' }}>Did you have any Business/Self-Employment income for this year?</label>
                                    <select
                                        className="form-input"
                                        value={taxData.has_business_income ? 'Yes' : 'No'}
                                        onChange={(e) => handleInputChange('has_business_income', e.target.value === 'Yes')}
                                        style={{ border: '2px solid var(--primary-400)' }}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                        (e.g. 1099-NEC, 1099-K, Cash, Uber, DoorDash, Freelancing)
                                    </p>
                                </div>
                            </Card>
                        )}

                        {/* Dependent Questions */}
                        {isPersonal && hasDependents && (
                            <Card style={{ marginBottom: 'var(--spacing-lg)', borderLeft: '4px solid var(--warning-500)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Dependent Information</h3>

                                <div className="form-group">
                                    <label className="form-label">Was any dependent (19-24) a student last year?</label>
                                    <select
                                        className="form-input"
                                        value={taxData.dependent_student ? 'Yes' : 'No'}
                                        onChange={(e) => handleInputChange('dependent_student', e.target.value === 'Yes')}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">How many months was the dependent located in the US?</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="12"
                                        value={taxData.dependent_months_us || ''}
                                        onChange={(e) => handleInputChange('dependent_months_us', parseInt(e.target.value) || null)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Did the dependent live with you last tax year?</label>
                                    <select
                                        className="form-input"
                                        value={taxData.dependent_lived_with ? 'Yes' : 'No'}
                                        onChange={(e) => handleInputChange('dependent_lived_with', e.target.value === 'Yes')}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Did any dependent over age 16 work?</label>
                                    <select
                                        className="form-input"
                                        value={taxData.dependent_worked ? 'Yes' : 'No'}
                                        onChange={(e) => handleInputChange('dependent_worked', e.target.value === 'Yes')}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </div>
                            </Card>
                        )}

                        {/* Business Tax Questions */}
                        {(isBusiness || (isPersonal && taxData.has_business_income)) && (
                            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Business Tax Information</h3>

                                <div className="form-group">
                                    <label className="form-label">Total Revenue (all forms of 1099, cash, deposits)</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={taxData.total_revenue ?? ''}
                                        onChange={(e) => handleInputChange('total_revenue', e.target.value === '' ? null : parseFloat(e.target.value))}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Phone Expense</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={taxData.phone_expense ?? ''}
                                            onChange={(e) => handleInputChange('phone_expense', e.target.value === '' ? null : parseFloat(e.target.value))}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Internet Expense</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={taxData.internet_expense ?? ''}
                                            onChange={(e) => handleInputChange('internet_expense', e.target.value === '' ? null : parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <h4 style={{ fontSize: '1rem', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)', borderTop: '1px solid var(--surface-glass-border)', paddingTop: 'var(--spacing-md)' }}>Industry-Specific Expenses</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Car/Truck Payment or Rent</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={taxData.industry_expenses?.car_rent || ''}
                                            onChange={(e) => handleInputChange('industry_expenses', { ...taxData.industry_expenses, car_rent: parseFloat(e.target.value) || null })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Fuel</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={taxData.industry_expenses?.fuel || ''}
                                            onChange={(e) => handleInputChange('industry_expenses', { ...taxData.industry_expenses, fuel: parseFloat(e.target.value) || null })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Dispatch/Platform Fees (Uber, etc.)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={taxData.industry_expenses?.fees || ''}
                                            onChange={(e) => handleInputChange('industry_expenses', { ...taxData.industry_expenses, fees: parseFloat(e.target.value) || null })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Other Professional Expenses</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={taxData.industry_expenses?.other || ''}
                                            onChange={(e) => handleInputChange('industry_expenses', { ...taxData.industry_expenses, other: parseFloat(e.target.value) || null })}
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Document Upload Section */}
                        <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Tax Documents for {selectedYear}</h3>

                            <div className="form-group">
                                <label className="form-label">Upload Documents (W-2s, 1099s, etc.)</label>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    style={{
                                        padding: 'var(--spacing-sm)',
                                        border: '1px solid var(--surface-glass-border)',
                                        borderRadius: 'var(--radius-md)',
                                        width: '100%',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                {uploading && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>
                                        Uploading...
                                    </p>
                                )}
                            </div>

                            {documents.length > 0 && (
                                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Uploaded Documents</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                        {documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: 'var(--spacing-sm)',
                                                    background: 'var(--surface-glass)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: '1px solid var(--surface-glass-border)'
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        📄 {doc.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(doc.file_url, '_blank')}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Save Button */}
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => navigate('/')}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : `Save ${selectedYear} Tax Data`}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TaxDataManagement;
