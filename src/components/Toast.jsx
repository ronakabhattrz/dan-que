import React, { useEffect, useState } from 'react';
import '../index.css';

const Toast = ({ message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 3700); // Start exit animation just before removal

        return () => clearTimeout(timer);
    }, []);

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'info': return 'ℹ';
            default: return '•';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'success': return { bg: 'var(--success)', text: 'white' };
            case 'error': return { bg: 'var(--error)', text: 'white' };
            default: return { bg: 'var(--text-primary)', text: 'var(--bg-primary)' };
        }
    };

    const colors = getColors();

    return (
        <div
            className={`toast toast-${type} ${isExiting ? 'exit' : 'enter'}`}
            style={{
                pointerEvents: 'auto',
                background: colors.bg,
                color: colors.text,
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                fontWeight: '600',
                fontSize: '0.875rem',
                minWidth: '200px',
                maxWidth: '400px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onClick={onClose}
        >
            <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem'
            }}>
                {getIcon()}
            </span>
            <span style={{ flex: 1 }}>{message}</span>
        </div>
    );
};

export default Toast;
