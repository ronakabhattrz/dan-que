-- Create messages table for internal communication
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_email TEXT, -- Denormalized for easy display
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means send to all admins
    receiver_email TEXT, -- Denormalized for easy display
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Optional context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Policies

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR
        (
            receiver_id IS NULL AND 
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Users can insert messages (as sender)
CREATE POLICY "Users can insert own messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read if they are the receiver (or admin if no receiver)
CREATE POLICY "Users can update own received messages"
    ON messages FOR UPDATE
    USING (
        auth.uid() = receiver_id OR
        (
            receiver_id IS NULL AND 
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    )
    WITH CHECK (
        auth.uid() = receiver_id OR
        (
            receiver_id IS NULL AND 
            EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );
