import React, { useState, useRef, useEffect } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { useAuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import Card from '../../components/Card';

const AdminMessages = () => {
    const { messages, sendMessage, markAsRead, loading } = useMessaging();
    const { user } = useAuthContext();
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedUser]);

    // Group messages by user
    const userConversations = messages.reduce((acc, msg) => {
        // For admin, we care about the other party (not ourselves)
        const otherUserId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
        const otherUserEmail = msg.sender_id === user?.id ? msg.receiver_email : msg.sender_email;

        if (!otherUserId) return acc; // Skip messages without a specific user

        if (!acc[otherUserId]) {
            acc[otherUserId] = {
                userId: otherUserId,
                userEmail: otherUserEmail || 'Unknown User',
                messages: [],
                unreadCount: 0
            };
        }

        acc[otherUserId].messages.push(msg);

        // Count unread messages from this user
        if (!msg.is_read && msg.sender_id === otherUserId) {
            acc[otherUserId].unreadCount++;
        }

        return acc;
    }, {});

    const conversations = Object.values(userConversations).sort((a, b) => {
        const aLatest = a.messages[a.messages.length - 1]?.created_at || '';
        const bLatest = b.messages[b.messages.length - 1]?.created_at || '';
        return new Date(bLatest) - new Date(aLatest);
    });

    const currentConversation = selectedUser ? userConversations[selectedUser] : null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            await sendMessage(newMessage, selectedUser);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUser(userId);
        // Mark all messages from this user as read
        const conversation = userConversations[userId];
        if (conversation) {
            conversation.messages.forEach(m => {
                if (!m.is_read && m.sender_id === userId) {
                    markAsRead(m.id);
                }
            });
        }
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-3xl)', paddingBottom: 'var(--spacing-3xl)' }}>
            <div className="fade-in">
                <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Messages</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--spacing-lg)', minHeight: '600px' }}>
                    {/* User List */}
                    <Card style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: 'var(--spacing-md)',
                            borderBottom: '1px solid var(--surface-glass-border)',
                            background: 'var(--bg-secondary)'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Conversations</h3>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '540px' }}>
                            {loading && conversations.length === 0 ? (
                                <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    Loading...
                                </div>
                            ) : conversations.length === 0 ? (
                                <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                    No messages yet
                                </div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.userId}
                                        onClick={() => handleSelectUser(conv.userId)}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            borderBottom: '1px solid var(--surface-glass-border)',
                                            cursor: 'pointer',
                                            background: selectedUser === conv.userId ? 'var(--surface-glass)' : 'transparent',
                                            transition: 'background var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedUser !== conv.userId) {
                                                e.currentTarget.style.background = 'var(--surface-glass)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedUser !== conv.userId) {
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '0.875rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {conv.userEmail}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-tertiary)',
                                                    marginTop: '4px'
                                                }}>
                                                    {conv.messages.length} messages
                                                </div>
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <span style={{
                                                    background: 'var(--primary-600)',
                                                    color: 'white',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 'bold',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    minWidth: '18px',
                                                    textAlign: 'center'
                                                }}>
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Conversation View */}
                    <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                        {!selectedUser ? (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-tertiary)'
                            }}>
                                Select a conversation to view messages
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    borderBottom: '1px solid var(--surface-glass-border)',
                                    background: 'var(--bg-secondary)'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem' }}>
                                        {currentConversation?.userEmail || 'Unknown User'}
                                    </h3>
                                </div>

                                {/* Messages */}
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: 'var(--spacing-lg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--spacing-md)'
                                }}>
                                    {currentConversation?.messages.map((m) => {
                                        const isMe = m.sender_id === user?.id;
                                        return (
                                            <div
                                                key={m.id}
                                                style={{
                                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                                    maxWidth: '70%',
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
                                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
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
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
