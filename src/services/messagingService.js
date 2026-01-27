import { supabase } from '../lib/supabase'

export const messagingService = {
    // Send a message
    async sendMessage(senderId, content, senderEmail, receiverId = null, receiverEmail = null, profileId = null) {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: senderId,
                sender_email: senderEmail,
                receiver_id: receiverId,
                receiver_email: receiverEmail,
                content,
                profile_id: profileId,
                is_read: false
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Get messages for the current user
    async getMyMessages(userId, isAdmin = false) {
        let query = supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })

        if (isAdmin) {
            // Admins see all messages sent to them (receiver_id is null or their id) 
            // OR messages they sent
            query = query.or(`receiver_id.is.null,receiver_id.eq.${userId},sender_id.eq.${userId}`)
        } else {
            // Regular users see messages they sent or received
            query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        }

        const { data, error } = await query

        if (error) throw error
        return data
    },

    // Mark message as read
    async markAsRead(messageId) {
        const { data, error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Subscribe to new messages
    subscribeToMessages(callback) {
        return supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                callback(payload.new)
            })
            .subscribe()
    }
}
