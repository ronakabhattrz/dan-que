import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useMessaging } from '../context/MessagingContext';
import Button from './Button';
import MessagingDrawer from './MessagingDrawer';

const Header = () => {
    const navigate = useNavigate();
    const { user, signOut, isAdmin } = useAuthContext();
    const { unreadCount } = useMessaging();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <>
            <header style={{
                height: '70px',
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--surface-glass-border)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 'var(--z-sticky)',
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(10px)'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Logo/Branding */}
                    <Link to={isAdmin ? '/admin' : '/'} style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        letterSpacing: '-1px'
                    }}>
                        DAN-QUE
                        {isAdmin && <span style={{
                            fontSize: '0.75rem',
                            background: 'var(--primary-600)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '8px',
                            verticalAlign: 'middle'
                        }}>ADMIN</span>}
                    </Link>

                    {/* Navigation Links */}
                    {isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginLeft: 'var(--spacing-xl)' }}>
                            <Link
                                to="/admin"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.925rem',
                                    fontWeight: '500',
                                    transition: 'color var(--transition-fast)',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    borderRadius: 'var(--radius-sm)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                🏠 Home
                            </Link>
                            <Link
                                to="/admin/messages"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.925rem',
                                    fontWeight: '500',
                                    transition: 'color var(--transition-fast)',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    borderRadius: 'var(--radius-sm)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                💬 Messages
                            </Link>
                        </div>
                    )}

                    {!isAdmin && user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginLeft: 'var(--spacing-xl)' }}>
                            <Link
                                to="/"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.925rem',
                                    fontWeight: '500',
                                    transition: 'color var(--transition-fast)',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    borderRadius: 'var(--radius-sm)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                🏠 Home
                            </Link>
                            <Link
                                to="/tax-history"
                                style={{
                                    color: 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.925rem',
                                    fontWeight: '500',
                                    transition: 'color var(--transition-fast)',
                                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                                    borderRadius: 'var(--radius-sm)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                📋 Taxes
                            </Link>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                        {user && (
                            <>
                                {/* Messaging Icon */}
                                <div
                                    onClick={() => isAdmin ? navigate('/admin/messages') : setIsDrawerOpen(true)}
                                    style={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        fontSize: '1.25rem',
                                        padding: '8px',
                                        borderRadius: '50%',
                                        transition: 'background var(--transition-fast)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-glass)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    💬
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            background: 'var(--primary-600)',
                                            color: 'white',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold',
                                            padding: '2px 5px',
                                            borderRadius: '10px',
                                            minWidth: '18px',
                                            textAlign: 'center',
                                            border: '2px solid var(--bg-primary)'
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>

                                <div style={{
                                    textAlign: 'right',
                                    display: 'none', // Hide on mobile or small screens 
                                    // if we want to be more responsive, but for now fixed
                                }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.email}</div>
                                </div>

                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {!isAdmin && (
                <MessagingDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                />
            )}
        </>
    );
};

export default Header;
