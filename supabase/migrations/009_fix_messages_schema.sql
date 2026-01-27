-- Add denormalized email fields to messages table to avoid cross-schema join issues
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS sender_email TEXT,
ADD COLUMN IF NOT EXISTS receiver_email TEXT;

-- Update RLS to ensure these can be updated/inserted
-- (Existing policies already allow inserting any column with WITH CHECK(auth.uid() = sender_id))
