-- Migration: Setup storage bucket for document uploads
-- Description: Creates the documents bucket (policies must be set via Supabase Dashboard)

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Note: Storage policies must be created via the Supabase Dashboard
-- Go to Storage > Policies in your Supabase project dashboard
-- and add the following policies for the 'documents' bucket:
--
-- 1. INSERT policy: "Users can upload own documents"
--    Target roles: authenticated
--    Policy definition: bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 2. SELECT policy: "Users can view own documents"  
--    Target roles: authenticated
--    Policy definition: bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- 3. DELETE policy: "Users can delete own documents"
--    Target roles: authenticated
--    Policy definition: bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text

