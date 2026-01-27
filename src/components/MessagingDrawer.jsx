import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '../context/MessagingContext';
import { useAuthContext } from '../context/AuthContext';
import Button from './Button';
import Input from './Input';
import Card from './Card';

const MessagingDrawer = ({ isOpen, onClose }) => {
    const { messages, sendMessage, markAsRead, loading } = useMessaging();
    const { user, isAdmin } = useAuthContext();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            // Mark all received messages as read when drawer is opened
            messages.forEach(m => {
                if (!m.is_read && (m.receiver_id === user?.id || (isAdmin && !m.receiver_id && m.sender_id !== user?.id))) {
                    markAsRead(m.id);
                }
            });
        }
    }, [isOpen, messages, user?.id, isAdmin, markAsRead]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendMessage(newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            maxWidth: '100%',
            height: '100vh',
            background: 'var(--bg-primary)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--surface-glass-border)',
            animation: 'slideInRight var(--transition-base) ease-out'
        }}>
            {/* Header */}
            <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: '1px solid var(--surface-glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-secondary)'
            }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Messages</h3>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                    }}
                >
                    &times;
                </button>
            </div>

            {/* Message List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--spacing-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)'
            }}>
                {loading && messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
                ) : messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--text-tertiary)',
                        padding: 'var(--spacing-xl)'
                    }}>
                        No messages yet. {isAdmin ? 'Waiting for users to reach out.' : 'Send a message to Support.'}
                    </div>
                ) : (
                    messages.map((m) => {
                        const isMe = m.sender_id === user?.id;
                        return (
                            <div
                                key={m.id}
                                style={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    borderRadius: 'var(--radius-lg)',
                                    background: isMe ? 'var(--primary-600)' : 'var(--bg-tertiary)',
                                    color: isMe ? 'white' : 'var(--text-primary)',
                                    fontSize: '0.925rem',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    {m.content}
                                </div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-tertiary)',
                                    marginTop: '4px'
                                }}>
                                    {isMe ? 'You' : (m.sender_email || 'System')} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                style={{
                    padding: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--surface-glass-border)',
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    background: 'var(--bg-secondary)'
                }}
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--surface-glass-border)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
                <Button type="submit" size="sm">Send</Button>
            </form>
        </div>
    );
};

export default MessagingDrawer;
