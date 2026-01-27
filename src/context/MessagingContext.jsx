import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { messagingService } from '../services/messagingService';
import { useAuthContext } from './AuthContext';
import { useNotifications } from './NotificationContext';

const MessagingContext = createContext();

export const useMessaging = () => {
    const context = useContext(MessagingContext);
    if (!context) {
        throw new Error('useMessaging must be used within a MessagingProvider');
    }
    return context;
};

export const MessagingProvider = ({ children }) => {
    const { user, isAdmin } = useAuthContext();
    const { showInfo } = useNotifications();
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadMessages = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await messagingService.getMyMessages(user.id, isAdmin);
            setMessages(data);

            // Calculate unread count (messages where receiver is me and is_read is false)
            const unread = data.filter(m =>
                (m.receiver_id === user.id || (isAdmin && !m.receiver_id && m.sender_id !== user.id)) &&
                !m.is_read
            ).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    }, [user, isAdmin]);

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    useEffect(() => {
        if (!user) return;

        console.log('[DEBUG] Setting up message subscription');
        const subscription = messagingService.subscribeToMessages((newMessage) => {
            console.log('[DEBUG] Received message via subscription:', newMessage);

            // Only care about messages relevant to me
            const isRelevant =
                newMessage.sender_id === user.id ||
                newMessage.receiver_id === user.id ||
                (isAdmin && !newMessage.receiver_id);

            if (isRelevant) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === newMessage.id)) {
                        console.log('[DEBUG] Duplicate message, skipping');
                        return prev;
                    }
                    console.log('[DEBUG] Adding new message to state');
                    return [...prev, newMessage];
                });

                // If it's a message for me, show notification and increment unread
                if (newMessage.sender_id !== user.id) {
                    setUnreadCount(prev => prev + 1);
                    showInfo('New message received');
                }
            }
        });

        return () => {
            console.log('[DEBUG] Unsubscribing from messages');
            subscription.unsubscribe();
        };
    }, [user?.id, isAdmin, showInfo]);

    const sendMessage = async (content, receiverId = null, profileId = null) => {
        if (!user) return;
        try {
            console.log('[DEBUG] Sending message:', content);
            const newMessage = await messagingService.sendMessage(
                user.id,
                content,
                user.email,
                receiverId,
                null, // receiverEmail could be looked up if needed, but for user-to-admin it's fine
                profileId
            );

            console.log('[DEBUG] Message sent successfully:', newMessage);

            // Immediately add to local state for instant feedback
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === newMessage.id)) {
                    return prev;
                }
                return [...prev, newMessage];
            });

            return newMessage;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await messagingService.markAsRead(messageId);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    return (
        <MessagingContext.Provider value={{
            messages,
            unreadCount,
            loading,
            sendMessage,
            markAsRead,
            refreshMessages: loadMessages
        }}>
            {children}
        </MessagingContext.Provider>
    );
};
