import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showNotification = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newToast = { id, message, type };

        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const showSuccess = useCallback((msg) => showNotification(msg, 'success'), [showNotification]);
    const showError = useCallback((msg) => showNotification(msg, 'error'), [showNotification]);
    const showInfo = useCallback((msg) => showNotification(msg, 'info'), [showNotification]);

    return (
        <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: 'var(--spacing-xl)',
                right: 'var(--spacing-xl)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
