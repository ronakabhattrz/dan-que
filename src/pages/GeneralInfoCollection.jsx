import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import { validateField } from '../utils/validators';
import '../index.css';

const BLOCKS = {
    PERSONAL_P1: 'PERSONAL_P1',
    PERSONAL_P2: 'PERSONAL_P2',
    PERSONAL_P3: 'PERSONAL_P3',
    PERSONAL_TAX_T1: 'PERSONAL_TAX_T1',
    PERSONAL_TAX_T2: 'PERSONAL_TAX_T2',
    SUMMARY: 'SUMMARY',
    BUSINESS_B1: 'BUSINESS_B1',
    BUSINESS_B2: 'BUSINESS_B2'
};

const GeneralInfoCollection = () => {
    const navigate = useNavigate();
    const { currentProfile, updateProfileInfo } = useProfile();
    const { showInfo, showSuccess } = useNotifications();
    const scrollContainerRef = useRef(null);

    const [currentBlock, setCurrentBlock] = useState(() => {
        if (currentProfile?.type === 'business') return BLOCKS.BUSINESS_B1;
        return BLOCKS.PERSONAL_P1;
    });

    const [formData, setFormData] = useState(() => {
        return {
            ssn: currentProfile?.ssn || '',
            firstName: currentProfile?.firstName || '',
            lastName: currentProfile?.lastName || '',
            preferredName: currentProfile?.preferred_name || '',
            dob: currentProfile?.dob || '',
            phone: currentProfile?.phone || '',
            email: currentProfile?.email || '',
            mailingAddress: currentProfile?.mailingAddress || '',
            residencyState: currentProfile?.residency_state || '',
            hasDL: !!currentProfile?.dl_details?.serial_number,
            dl_serial: currentProfile?.dl_details?.serial_number || '',
            dl_issue_date: currentProfile?.dl_details?.issue_date || '',
            dl_expiry_date: currentProfile?.dl_details?.expiry_date || '',
            dl_backside_code: currentProfile?.dl_details?.backside_code || '',
            maritalStatus: currentProfile?.marital_status || 'single',
            spouseInfo: currentProfile?.spouse_info || {},
            dependents: currentProfile?.dependents || [],
            numDependents: currentProfile?.dependents?.length || 0,
            carriesBusiness: currentProfile?.has_business || false,
            hasEIN: !!currentProfile?.ein,
            businessName: currentProfile?.business_name || '',
            ein: currentProfile?.ein || '',
            municipality_inc: currentProfile?.municipality_inc || '',
            year_end: currentProfile?.year_end || '',
            industry_code: currentProfile?.industry_code || '',
            industry_description: currentProfile?.industry_description || '',
            tax_responses: currentProfile?.tax_responses || {},
            tax_financials: currentProfile?.tax_financials || {},
        };
    });

    const [errors, setErrors] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const getQuestionsForBlock = (block) => {
        switch (block) {
            case BLOCKS.PERSONAL_P1:
                return [
                    { id: 'ssn', label: 'SSN', type: 'password', placeholder: 'XXX-XX-XXXX', helper: '(SSN card, manual)' },
                    { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'John', helper: '(SSN card, manual)' },
                    { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Smith', helper: '(SSN card, manual)' },
                    { id: 'preferredName', label: 'Preferred Name', type: 'text', placeholder: 'Johnny', helper: '(manually)' },
                    { id: 'dob', label: 'Date of Birth', type: 'date', helper: '(DL, id card, green card, passport, manual)' },
                    { id: 'phone', label: 'Phone', type: 'tel', placeholder: '(555) 123-4567', helper: '(manually)' },
                    { id: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com', helper: '(manually)' },
                    { id: 'mailingAddress', label: 'Mailing Address', type: 'text', placeholder: '123 Main St, City, ST 12345', helper: '(DL, manual)' },
                    { id: 'residencyState', label: 'Residency State', type: 'text', placeholder: 'New York', helper: '(DL, manual)' },
                    { id: 'hasDL', label: 'Do you have a DL or state ID card?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'dl_serial', label: 'Doc Serial Number', type: 'text', condition: (d) => d.hasDL === 'Yes' },
                    { id: 'dl_issue_date', label: 'Issue Date', type: 'date', condition: (d) => d.hasDL === 'Yes' },
                    { id: 'dl_expiry_date', label: 'Expiry Date', type: 'date', condition: (d) => d.hasDL === 'Yes' },
                    { id: 'dl_backside_code', label: 'Backside Code', type: 'text', condition: (d) => d.hasDL === 'Yes' },
                ];
            case BLOCKS.PERSONAL_P2:
                return [
                    { id: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['single', 'married', 'divorced'], helper: '(manually)' },
                    { id: 'spouse_ssn', label: "Spouse's SSN", type: 'password', condition: (d) => d.maritalStatus === 'married' },
                    { id: 'spouse_firstName', label: "Spouse's First Name", type: 'text', condition: (d) => d.maritalStatus === 'married' },
                    { id: 'spouse_lastName', label: "Spouse's Last Name", type: 'text', condition: (d) => d.maritalStatus === 'married' },
                    { id: 'spouse_dob', label: "Spouse's DOB", type: 'date', condition: (d) => d.maritalStatus === 'married' },
                    { id: 'spouse_phone', label: "Spouse's Phone (optional)", type: 'tel', condition: (d) => d.maritalStatus === 'married' },
                    { id: 'spouse_email', label: "Spouse's Email (optional)", type: 'email', condition: (d) => d.maritalStatus === 'married' },
                    { id: 'spouse_hasDL', label: "Does spouse have DL/ID card?", type: 'select', options: ['No', 'Yes'], condition: (d) => d.maritalStatus === 'married' },
                    { id: 'spouse_dl_serial', label: "Spouse's serial #", type: 'text', condition: (d) => d.maritalStatus === 'married' && d.spouse_hasDL === 'Yes' },
                ];
            case BLOCKS.PERSONAL_P3:
                return [
                    { id: 'numDependents', label: 'Number of dependents', type: 'number', placeholder: '0', helper: '(children, parents, etc. - those who rely on your support)' },
                ];
            case BLOCKS.PERSONAL_TAX_T1:
                return [
                    { id: 'carriesBusiness', label: 'Do you carry any business?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'hasEIN', label: 'If yes, do you have an EIN?', type: 'select', options: ['No', 'Yes'], condition: (d) => d.carriesBusiness === 'Yes' },
                    { id: 'tax_outOfCountry', label: 'Were you out of the country over 6 months?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'tax_monthsOut', label: 'How many months (1-12)?', type: 'number', condition: (d) => d.tax_outOfCountry === 'Yes', min: 1, max: 12 },
                    { id: 'tax_foreignAccount', label: 'Foreign bank account?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'tax_digitalAssets', label: 'Did you sell any digital asset or investment income?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'tax_w2Count', label: 'How many W-2s did YOU have last tax year?', type: 'number', placeholder: '0' },
                    { id: 'tax_1099Count', label: 'How many 1099s did YOU have last tax year?', type: 'number', placeholder: '0' },
                    { id: 'tax_spouseW2Count', label: "How many W-2s did your SPOUSE have?", type: 'number', placeholder: '0', condition: (d) => d.maritalStatus === 'married' },
                    { id: 'tax_spouse1099Count', label: "How many 1099s did your SPOUSE have?", type: 'number', placeholder: '0', condition: (d) => d.maritalStatus === 'married' },
                ];
            case BLOCKS.PERSONAL_TAX_T2:
                const hasAdultStudentAge = true; // Placeholder for logic checking if any dependent is 19-24
                const hasWorkingAge = true; // Placeholder for logic checking if any dependent is >16

                return [
                    { id: 'dependent_student', label: 'Was any dependent (19-24) a student last year?', type: 'select', options: ['No', 'Yes'], helper: '(Yes/No boolean response)' },
                    { id: 'dependent_months_us', label: 'How many months was the dependent located in the US?', type: 'select', options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
                    { id: 'dependent_lived_with', label: 'Did the dependent live with you last tax year?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'dependent_worked', label: 'Did any dependent over age 16 work?', type: 'select', options: ['No', 'Yes'] },
                    { id: 'dependent_income_docs', label: 'If yes, provide income docs like W-2', type: 'info', condition: (d) => d.dependent_worked === 'Yes' },
                    { id: 'dependent_residency_proof', label: 'Residency proof (e.g., insurance card, school/daycare letter)', type: 'info', helper: '(Age-based rules apply)' },
                ];
            case BLOCKS.BUSINESS_B1:
                return [
                    { id: 'ein', label: 'EIN', type: 'text', placeholder: 'XX-XXXXXXX', helper: '(EIN letter, manual)' },
                    { id: 'businessName', label: 'Business Name', type: 'text' },
                    { id: 'mailingAddress', label: 'Mailing Address', type: 'text' },
                    { id: 'state_inc', label: 'State inc’d in', type: 'text' },
                    { id: 'municipality_inc', label: 'Municipality inc’d in (if applicable)', type: 'text' },
                    { id: 'date_inc', label: 'Date Incorporated', type: 'date' },
                    { id: 'year_end', label: 'Year end (MM/DD)', type: 'text', placeholder: '12/31' },
                ];
            case BLOCKS.BUSINESS_B2:
                const isTaxi = formData.industry_description?.toLowerCase().includes('taxi') || formData.industry_code === '485310';
                const isTrucker = formData.industry_description?.toLowerCase().includes('truck') || formData.industry_code?.startsWith('484');

                const baseExpenses = [
                    { id: 'industry_code', label: 'Industry Code', type: 'text', placeholder: 'e.g. 485310' },
                    { id: 'industry_description', label: 'Industry Description', type: 'textarea' },
                    { id: 'biz_revenue', label: 'Total Revenue (all forms of 1099, cash, deposits)', type: 'number', placeholder: '0.00' },
                    { id: 'ez_phone', label: 'Phone', type: 'number', placeholder: '0.00' },
                    { id: 'ez_internet', label: 'Internet', type: 'number', placeholder: '0.00' },
                ];

                if (isTaxi) {
                    return [
                        ...baseExpenses,
                        { id: 'taxi_car_rent', label: 'Car payment / rent', type: 'number', placeholder: '0.00' },
                        { id: 'taxi_fuel', label: 'Fuel', type: 'number', placeholder: '0.00' },
                        { id: 'taxi_uber_fees', label: 'Taxi/Uber fees', type: 'number', placeholder: '0.00' },
                    ];
                } else if (isTrucker) {
                    return [
                        ...baseExpenses,
                        { id: 'truck_pmt', label: 'Truck payment / rent', type: 'number', placeholder: '0.00' },
                        { id: 'truck_trailer', label: 'Trailer pmt / rent', type: 'number', placeholder: '0.00' },
                        { id: 'truck_dispatch', label: 'Dispatch fees', type: 'number', placeholder: '0.00' },
                    ];
                }

                return [
                    ...baseExpenses,
                    { id: 'other_expenses', label: 'Other professional expenses', type: 'number', placeholder: '0.00' },
                ];
            case BLOCKS.SUMMARY:
                return [];
            default:
                return [];
        }
    };

    const getSummaryData = () => {
        const docs = [];
        if (formData.ssn) docs.push('Personal SSN Card');
        if (formData.hasDL === 'Yes') docs.push('Drivers License / State ID');
        if (formData.maritalStatus === 'married') {
            docs.push('Marriage Certificate');
            if (formData.spouse_ssn) docs.push('Spouse SSN Card');
            if (formData.spouse_hasDL === 'Yes') docs.push('Spouse Drivers License / State ID');
        }
        if (parseInt(formData.numDependents) > 0) docs.push('Birth Certificate(s) for dependents');
        if (parseInt(formData.tax_w2Count) > 0) docs.push(`${formData.tax_w2Count}x W-2 Forms`);
        if (parseInt(formData.tax_1099Count) > 0) docs.push(`${formData.tax_1099Count}x 1099 Forms`);
        if (formData.carriesBusiness === 'Yes' && formData.hasEIN === 'Yes') docs.push('EIN Letter');

        const explanations = [];
        if (parseInt(formData.numDependents) > 0) explanations.push('Since you added a new dependent/child, upload birth certificate.');
        if (parseInt(formData.tax_w2Count) > 0) explanations.push(`Since you mentioned you were employed at ${formData.tax_w2Count} different places, submit your W-2 forms.`);
        if (parseInt(formData.tax_spouseW2Count) > 0) explanations.push(`Since your spouse was employed at ${formData.tax_spouseW2Count} place(s), submit your spouse's W-2.`);
        if (formData.dependent_student === 'Yes') explanations.push('Since your child is a student, submit their 1098-T issued by their college.');

        return { docs, explanations };
    };

    const questions = getQuestionsForBlock(currentBlock);
    const filteredQuestions = questions.filter(q => !q.condition || q.condition(formData));
    const currentQuestion = filteredQuestions[currentQuestionIndex];

    const handleInputChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
    };

    const handleNext = async () => {
        // No validation - allow blank fields
        // Save data before moving to next question (non-blocking)
        try {
            if (currentBlock !== BLOCKS.SUMMARY) {
                // Save in background, don't wait
                updateProfileInfo(formData).catch(err => console.error('Save error:', err));
            }
        } catch (error) {
            console.error('Error in handleNext:', error);
        }

        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Block finished, handle transition
            try {
                await updateProfileInfo(formData);
            } catch (error) {
                console.error('Error saving profile:', error);
            }

            if (currentBlock === BLOCKS.PERSONAL_P1) {
                setCurrentBlock(BLOCKS.PERSONAL_P2);
                setCurrentQuestionIndex(0);
                showInfo('Moving to Marital Status');
            } else if (currentBlock === BLOCKS.PERSONAL_P2) {
                setCurrentBlock(BLOCKS.PERSONAL_P3);
                setCurrentQuestionIndex(0);
                showInfo('Moving to Dependents');
            } else if (currentBlock === BLOCKS.PERSONAL_P3) {
                setCurrentBlock(BLOCKS.PERSONAL_TAX_T1);
                setCurrentQuestionIndex(0);
                showInfo('Starting Tax Intake');
            } else if (currentBlock === BLOCKS.PERSONAL_TAX_T1) {
                if (formData.carriesBusiness === 'Yes') {
                    if (formData.hasEIN === 'Yes') {
                        setCurrentBlock(BLOCKS.BUSINESS_B1);
                        showInfo('Moving to Business Details');
                    } else {
                        setCurrentBlock(BLOCKS.BUSINESS_B2);
                        showInfo('Moving to Business Tax Details');
                    }
                } else if (parseInt(formData.numDependents) > 0) {
                    setCurrentBlock(BLOCKS.PERSONAL_TAX_T2);
                    showInfo('Moving to Dependent Tax Details');
                } else {
                    setCurrentBlock(BLOCKS.SUMMARY);
                    showSuccess('Intake complete! Reviewing summary');
                }
                setCurrentQuestionIndex(0);
            } else if (currentBlock === BLOCKS.PERSONAL_TAX_T2) {
                setCurrentBlock(BLOCKS.SUMMARY);
                setCurrentQuestionIndex(0);
                showSuccess('Intake complete! Reviewing summary');
            } else if (currentBlock === BLOCKS.BUSINESS_B1) {
                setCurrentBlock(BLOCKS.BUSINESS_B2);
                setCurrentQuestionIndex(0);
                showInfo('Moving to Business Tax Details');
            } else if (currentBlock === BLOCKS.BUSINESS_B2) {
                setCurrentBlock(BLOCKS.SUMMARY);
                setCurrentQuestionIndex(0);
                showSuccess('Intake complete! Reviewing summary');
            } else {
                navigate('/verify-profile');
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            // Go back to previous block logic
            if (currentBlock === BLOCKS.PERSONAL_P2) {
                setCurrentBlock(BLOCKS.PERSONAL_P1);
                setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.PERSONAL_P1).filter(q => !q.condition || q.condition(formData)).length - 1);
            } else if (currentBlock === BLOCKS.PERSONAL_P3) {
                setCurrentBlock(BLOCKS.PERSONAL_P2);
                setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.PERSONAL_P2).filter(q => !q.condition || q.condition(formData)).length - 1);
            } else if (currentBlock === BLOCKS.PERSONAL_TAX_T1) {
                setCurrentBlock(BLOCKS.PERSONAL_P3);
                setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.PERSONAL_P3).filter(q => !q.condition || q.condition(formData)).length - 1);
            } else if (currentBlock === BLOCKS.PERSONAL_TAX_T2) {
                setCurrentBlock(BLOCKS.PERSONAL_TAX_T1);
                setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.PERSONAL_TAX_T1).filter(q => !q.condition || q.condition(formData)).length - 1);
            } else if (currentBlock === BLOCKS.BUSINESS_B1) {
                setCurrentBlock(BLOCKS.PERSONAL_TAX_T1); // If business, previous is PERSONAL_TAX_T1
                setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.PERSONAL_TAX_T1).filter(q => !q.condition || q.condition(formData)).length - 1);
            } else if (currentBlock === BLOCKS.BUSINESS_B2) {
                setCurrentBlock(BLOCKS.BUSINESS_B1);
                setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.BUSINESS_B1).filter(q => !q.condition || q.condition(formData)).length - 1);
            } else if (currentBlock === BLOCKS.SUMMARY) {
                if (formData.carriesBusiness === 'Yes') {
                    setCurrentBlock(BLOCKS.BUSINESS_B2);
                    setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.BUSINESS_B2).filter(q => !q.condition || q.condition(formData)).length - 1);
                } else if (parseInt(formData.numDependents) > 0) {
                    setCurrentBlock(BLOCKS.PERSONAL_TAX_T2);
                    setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.PERSONAL_TAX_T2).filter(q => !q.condition || q.condition(formData)).length - 1);
                } else {
                    setCurrentBlock(BLOCKS.PERSONAL_TAX_T1);
                    setCurrentQuestionIndex(getQuestionsForBlock(BLOCKS.PERSONAL_TAX_T1).filter(q => !q.condition || q.condition(formData)).length - 1);
                }
            }
        }
    };

    if (!currentProfile) {
        navigate('/profile-type');
        return null;
    }

    // Calculate total progress across all blocks
    const getAllQuestions = () => {
        const allBlocks = currentProfile?.type === 'business'
            ? [BLOCKS.BUSINESS_B1, BLOCKS.BUSINESS_B2]
            : [BLOCKS.PERSONAL_P1, BLOCKS.PERSONAL_P2, BLOCKS.PERSONAL_P3, BLOCKS.PERSONAL_TAX_T1];

        // Add conditional blocks
        if (currentProfile?.type === 'personal') {
            if (formData.carriesBusiness === 'Yes') {
                if (formData.hasEIN === 'Yes') {
                    allBlocks.push(BLOCKS.BUSINESS_B1);
                }
                allBlocks.push(BLOCKS.BUSINESS_B2);
            }
            if (parseInt(formData.numDependents) > 0) {
                allBlocks.push(BLOCKS.PERSONAL_TAX_T2);
            }
        }
        allBlocks.push(BLOCKS.SUMMARY);

        let totalQuestions = 0;
        let completedQuestions = 0;

        allBlocks.forEach((block, blockIndex) => {
            const blockQuestions = getQuestionsForBlock(block).filter(q => !q.condition || q.condition(formData));
            totalQuestions += blockQuestions.length || 1; // Summary counts as 1

            // Count completed questions in previous blocks
            const currentBlockIndex = allBlocks.indexOf(currentBlock);
            if (blockIndex < currentBlockIndex) {
                completedQuestions += blockQuestions.length || 1;
            } else if (blockIndex === currentBlockIndex) {
                completedQuestions += currentQuestionIndex;
            }
        });

        return { totalQuestions, completedQuestions };
    };

    const { totalQuestions, completedQuestions } = getAllQuestions();
    const overallProgress = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

    const summaryData = currentBlock === BLOCKS.SUMMARY ? getSummaryData() : null;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-primary)'
        }}>
            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-xl)'
            }}>
                <div className="container container-sm">
                    <div className="fade-in">
                        {/* Progress Bar */}
                        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                            <ProgressBar progress={overallProgress} />
                            <div style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-tertiary)',
                                marginTop: 'var(--spacing-sm)',
                                textAlign: 'center'
                            }}>
                                Question {completedQuestions + 1} of {totalQuestions}
                            </div>
                        </div>

                        {/* Question Card */}
                        <Card style={{
                            padding: 'var(--spacing-2xl)',
                            minHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            {currentBlock === BLOCKS.SUMMARY ? (
                                <div>
                                    <h2 style={{
                                        fontSize: '2rem',
                                        marginBottom: 'var(--spacing-xl)',
                                        textAlign: 'center',
                                        color: 'var(--text-primary)'
                                    }}>
                                        Final Summary & Doc Checklist
                                    </h2>

                                    <div className="space-y-md">
                                        <div className="mb-lg">
                                            <h4 className="text-primary mb-sm" style={{ fontSize: '1.25rem' }}>Tasks & Explanations</h4>
                                            <ul className="text-secondary" style={{ paddingLeft: 'var(--spacing-lg)' }}>
                                                {summaryData.explanations.map((exp, i) => <li key={i} style={{ marginBottom: 'var(--spacing-sm)' }}>{exp}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-primary mb-sm" style={{ fontSize: '1.25rem' }}>Required Document List</h4>
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {summaryData.docs.map((doc, i) => (
                                                    <li key={i} style={{
                                                        padding: 'var(--spacing-sm)',
                                                        background: 'var(--surface-glass)',
                                                        borderRadius: 'var(--radius-sm)',
                                                        marginBottom: 'var(--spacing-xs)',
                                                        borderLeft: '4px solid var(--primary-600)'
                                                    }}>
                                                        {doc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{
                                        fontSize: '1.75rem',
                                        marginBottom: 'var(--spacing-md)',
                                        color: 'var(--text-primary)',
                                        textAlign: 'center'
                                    }}>
                                        {currentQuestion?.label}
                                    </h3>

                                    {currentQuestion?.helper && (
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: 'var(--spacing-xl)',
                                            textAlign: 'center'
                                        }}>
                                            Source: {currentQuestion.helper}
                                        </p>
                                    )}

                                    <div style={{ marginTop: 'var(--spacing-xl)' }}>
                                        {currentQuestion?.type === 'textarea' ? (
                                            <textarea
                                                className="form-input"
                                                rows="4"
                                                value={formData[currentQuestion.id] || ''}
                                                onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                                                placeholder={currentQuestion.placeholder}
                                                style={{ fontSize: '1.125rem' }}
                                            />
                                        ) : currentQuestion?.type === 'select' ? (
                                            <select
                                                className="form-input"
                                                value={formData[currentQuestion.id]}
                                                onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                                                style={{ fontSize: '1.125rem' }}
                                            >
                                                {currentQuestion.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : currentQuestion?.type === 'info' ? (
                                            <div style={{
                                                padding: 'var(--spacing-lg)',
                                                background: 'var(--surface-glass)',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--surface-glass-border)',
                                                textAlign: 'center',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                <p>{currentQuestion.label}</p>
                                                {currentQuestion.helper && <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>{currentQuestion.helper}</p>}
                                            </div>
                                        ) : (
                                            <Input
                                                type={currentQuestion?.type}
                                                value={formData[currentQuestion?.id] || ''}
                                                onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                                                placeholder={currentQuestion?.placeholder}
                                                error={errors[currentQuestion?.id]}
                                                style={{ fontSize: '1.125rem' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Fixed Footer Navigation */}
            <div style={{
                borderTop: '1px solid var(--surface-glass-border)',
                background: 'var(--bg-secondary)',
                padding: 'var(--spacing-lg)',
                position: 'sticky',
                bottom: 0,
                zIndex: 10
            }}>
                <div className="container container-sm">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)'
                    }}>
                        <Button
                            variant="secondary"
                            onClick={handlePrevious}
                            disabled={currentBlock === BLOCKS.PERSONAL_P1 && currentQuestionIndex === 0}
                            style={{ minWidth: '120px' }}
                        >
                            ← Previous
                        </Button>

                        {currentBlock === BLOCKS.SUMMARY ? (
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <Button variant="outline" onClick={() => navigate('/upload-documents')}>
                                    Upload Docs
                                </Button>
                                <Button variant="primary" onClick={() => navigate('/verify-profile')}>
                                    Continue →
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                style={{ minWidth: '120px' }}
                            >
                                Next →
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralInfoCollection;
