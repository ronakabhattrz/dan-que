import React, { useState } from 'react';
import '../index.css';

const FormCard = ({
    question,
    value,
    onChange,
    onDismiss,
    isDismissed = false,
    error
}) => {
    const [isFocused, setIsFocused] = useState(false);

    if (isDismissed) return null;

    const isFilled = value !== null && value !== undefined && value !== '';

    const handleDismiss = () => {
        if (isFilled && onDismiss) {
            onDismiss();
        }
    };

    const renderInput = () => {
        switch (question.type) {
            case 'textarea':
                return (
                    <textarea
                        className="form-input"
                        rows="4"
                        value={value || ''}
                        onChange={(e) => onChange(question.id, e.target.value)}
                        placeholder={question.placeholder || ''}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{
                            fontSize: '1rem',
                            minHeight: '100px',
                            resize: 'vertical'
                        }}
                    />
                );

            case 'select':
                return (
                    <select
                        className="form-input"
                        value={value || question.options?.[0] || ''}
                        onChange={(e) => onChange(question.id, e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{ fontSize: '1rem' }}
                    >
                        {question.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        className="form-input"
                        value={value ?? ''}
                        onChange={(e) => onChange(question.id, e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder={question.placeholder || '0'}
                        min={question.min}
                        max={question.max}
                        step={question.step || '1'}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{ fontSize: '1rem' }}
                    />
                );

            default:
                return (
                    <input
                        type={question.type || 'text'}
                        className="form-input"
                        value={value || ''}
                        onChange={(e) => onChange(question.id, e.target.value)}
                        placeholder={question.placeholder || ''}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        style={{ fontSize: '1rem' }}
                    />
                );
        }
    };

    return (
        <div
            style={{
                minWidth: '320px',
                maxWidth: '320px',
                height: 'fit-content',
                background: isFocused
                    ? 'linear-gradient(135deg, var(--surface-glass) 0%, var(--surface-glass-hover) 100%)'
                    : 'var(--surface-glass)',
                border: isFocused
                    ? '2px solid var(--primary-400)'
                    : isFilled
                        ? '2px solid var(--success-500)'
                        : '1px solid var(--surface-glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                position: 'relative',
                transition: 'all var(--transition-normal)',
                boxShadow: isFocused
                    ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                transform: isFocused ? 'translateY(-4px)' : 'translateY(0)',
                scrollSnapAlign: 'start'
            }}
        >
            {/* Close Button - Only visible when filled */}
            {isFilled && (
                <button
                    onClick={handleDismiss}
                    style={{
                        position: 'absolute',
                        top: 'var(--spacing-sm)',
                        right: 'var(--spacing-sm)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'var(--success-500)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        transition: 'all var(--transition-fast)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                        e.currentTarget.style.background = 'var(--success-600)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                        e.currentTarget.style.background = 'var(--success-500)';
                    }}
                    title="Dismiss this card"
                >
                    ✓
                </button>
            )}

            {/* Status Indicator */}
            <div style={{
                position: 'absolute',
                top: 'var(--spacing-sm)',
                left: 'var(--spacing-sm)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isFilled ? 'var(--success-500)' : 'var(--warning-500)',
                boxShadow: isFilled
                    ? '0 0 8px var(--success-500)'
                    : '0 0 8px var(--warning-500)',
                transition: 'all var(--transition-normal)'
            }} />

            {/* Question Label */}
            <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-xs)',
                paddingRight: isFilled ? 'var(--spacing-xl)' : '0',
                lineHeight: '1.4'
            }}>
                {question.label}
            </h3>

            {/* Helper Text */}
            {question.helper && (
                <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--spacing-md)',
                    fontStyle: 'italic'
                }}>
                    {question.helper}
                </p>
            )}

            {/* Input Field */}
            <div style={{ marginTop: 'var(--spacing-md)' }}>
                {renderInput()}
            </div>

            {/* Error Message */}
            {error && (
                <p style={{
                    fontSize: '0.8125rem',
                    color: 'var(--error)',
                    marginTop: 'var(--spacing-xs)',
                    fontWeight: '500'
                }}>
                    {error}
                </p>
            )}

            {/* Card Footer - Shows completion status */}
            <div style={{
                marginTop: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-sm)',
                borderTop: '1px solid var(--surface-glass-border)',
                fontSize: '0.75rem',
                color: isFilled ? 'var(--success-600)' : 'var(--text-tertiary)',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)'
            }}>
                {isFilled ? (
                    <>
                        <span>✓</span>
                        <span>Completed - Click ✓ to dismiss</span>
                    </>
                ) : (
                    <>
                        <span>○</span>
                        <span>Fill to complete</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default FormCard;
