import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import '../index.css';

const GeneralInfoCollection = () => {
    const navigate = useNavigate();
    const { currentProfile, updateProfileInfo } = useProfile();
    const scrollContainerRef = useRef(null);

    const questions = currentProfile?.type === 'personal'
        ? [
            { id: 'name', label: 'Your Name', type: 'text', placeholder: 'John Smith' },
            { id: 'address', label: 'Your Address', type: 'text', placeholder: '123 Main St, City, State ZIP' },
            { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567' },
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' }
        ]
        : [
            { id: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Smith Corp' },
            { id: 'address', label: 'Business Address', type: 'text', placeholder: '456 Business Blvd, City, State ZIP' },
            { id: 'phone', label: 'Business Phone', type: 'tel', placeholder: '(555) 987-6543' },
            { id: 'email', label: 'Business Email', type: 'email', placeholder: 'contact@smithcorp.com' },
            { id: 'ein', label: 'EIN', type: 'text', placeholder: '12-3456789' }
        ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [formData, setFormData] = useState(currentProfile?.generalInfo || {});
    const [editMode, setEditMode] = useState({});

    const currentQuestion = questions[currentQuestionIndex];

    // Calculate progress based on filled fields
    const filledFieldsCount = Object.values(formData).filter(val => val && val.trim() !== '').length;
    const progress = (filledFieldsCount / questions.length) * 100;

    // Auto-scroll to current card
    useEffect(() => {
        if (scrollContainerRef.current) {
            const cardWidth = scrollContainerRef.current.scrollWidth / questions.length;
            scrollContainerRef.current.scrollTo({
                left: cardWidth * currentQuestionIndex,
                behavior: 'smooth'
            });
        }
    }, [currentQuestionIndex, questions.length]);

    const handleInputChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = (questionId) => {
        updateProfileInfo({ [questionId]: formData[questionId] });
        setEditMode(prev => ({ ...prev, [questionId]: false }));
    };

    const handleEdit = (questionId) => {
        setEditMode(prev => ({ ...prev, [questionId]: true }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            // Save current field if it has data
            if (formData[currentQuestion.id]) {
                handleSave(currentQuestion.id);
            }
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Save all data and move to verification
            updateProfileInfo(formData);
            navigate('/verify-profile');
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (!currentProfile) {
        navigate('/profile-type');
        return null;
    }

    return (
        <div className="container container-sm" style={{
            paddingTop: 'var(--spacing-3xl)',
            paddingBottom: 'var(--spacing-3xl)'
        }}>
            <div className="fade-in">
                <h1 className="text-center mb-lg">General Info Collection</h1>

                <Card className="mb-xl">
                    {/* Progress Info Display */}
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'var(--surface-glass)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        border: '1px solid var(--surface-glass-border)'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            This is a progress bar that dynamically shows the info entered below.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                            {Object.entries(formData).filter(([_, value]) => value && value.trim() !== '').map(([key, value]) => (
                                <span key={key} style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-primary)',
                                    background: 'var(--primary-500)',
                                    padding: '4px 12px',
                                    borderRadius: 'var(--radius-sm)'
                                }}>
                                    {key}: {value}
                                </span>
                            ))}
                        </div>
                    </div>

                    <ProgressBar progress={progress} />

                    {/* Horizontal scrolling card view with snap scrolling */}
                    <div
                        ref={scrollContainerRef}
                        style={{
                            display: 'flex',
                            gap: 'var(--spacing-lg)',
                            overflowX: 'auto',
                            scrollSnapType: 'x mandatory',
                            padding: 'var(--spacing-lg) var(--spacing-xs)',
                            marginBottom: 'var(--spacing-lg)',
                            scrollbarWidth: 'thin',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {questions.map((question, index) => (
                            <div
                                key={question.id}
                                style={{
                                    minWidth: 'calc(100% - 2px)',
                                    maxWidth: 'calc(100% - 2px)',
                                    padding: 'var(--spacing-xl)',
                                    background: index === currentQuestionIndex
                                        ? 'var(--surface-glass-hover)'
                                        : 'var(--surface-glass)',
                                    border: `2px solid ${index === currentQuestionIndex
                                        ? 'var(--primary-500)'
                                        : 'var(--surface-glass-border)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    transition: 'all var(--transition-base)',
                                    scrollSnapAlign: 'start',
                                    boxShadow: index === currentQuestionIndex
                                        ? '0 8px 32px rgba(139, 92, 246, 0.2)'
                                        : 'none'
                                }}
                            >
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--text-tertiary)',
                                    marginBottom: 'var(--spacing-sm)',
                                    fontWeight: '500'
                                }}>
                                    Question {index + 1} of {questions.length}
                                </div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: 'var(--spacing-lg)',
                                    color: 'var(--text-primary)',
                                    fontWeight: '600'
                                }}>
                                    {question.label}
                                </h3>

                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <Input
                                        type={question.type}
                                        value={formData[question.id] || ''}
                                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                                        placeholder={question.placeholder}
                                        disabled={editMode[question.id] === false && formData[question.id]}
                                    />
                                </div>

                                <div className="flex gap-sm">
                                    {(!formData[question.id] || editMode[question.id]) ? (
                                        <Button
                                            variant="primary"
                                            size="md"
                                            onClick={() => handleSave(question.id)}
                                            disabled={!formData[question.id]}
                                        >
                                            Save
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="md"
                                            onClick={() => handleEdit(question.id)}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Scroll Indicators */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 'var(--spacing-xs)',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                style={{
                                    width: index === currentQuestionIndex ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: index === currentQuestionIndex
                                        ? 'var(--primary-500)'
                                        : 'var(--surface-glass-border)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-base)',
                                    padding: 0
                                }}
                                aria-label={`Go to question ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <Button
                            variant="secondary"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                        >
                            ← Previous
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                        >
                            {currentQuestionIndex === questions.length - 1 ? 'Verify Profile →' : 'Next →'}
                        </Button>
                    </div>
                </Card>

                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'var(--surface-glass)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--surface-glass-border)'
                }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Instructions:</strong>
                    </p>
                    <ol style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginLeft: 'var(--spacing-lg)',
                        marginTop: 'var(--spacing-sm)'
                    }}>
                        <li>View to show the entered info. Progress bar indication.</li>
                        <li>Horizontal scrolling CardView to show Question List and collect answers.</li>
                        <li>Next Button takes to the next batch of Question List or to verification screen before creating a profile.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default GeneralInfoCollection;
