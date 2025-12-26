import React from 'react';
import '../index.css';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    error,
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
                </label>
            )}
            <input
                type={type}
                className="form-input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                {...props}
            />
            {error && (
                <p style={{
                    color: 'var(--error)',
                    fontSize: '0.875rem',
                    marginTop: 'var(--spacing-xs)'
                }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
