import { supabase } from '../lib/supabase'

export const documentService = {
    // Upload document
    async uploadDocument(profileId, file) {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated');

        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${profileId}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, file)

        if (uploadError) {
            console.error('Supabase storage upload error:', uploadError);
            throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName)

        // Create document record
        const { data, error } = await supabase
            .from('documents')
            .insert({
                profile_id: profileId,
                name: file.name,
                type: file.type,
                file_url: publicUrl,
                file_size: file.size
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Delete document
    async deleteDocument(documentId) {
        // Get document info
        const { data: doc } = await supabase
            .from('documents')
            .select('file_url')
            .eq('id', documentId)
            .single()

        if (doc) {
            // Extract file path from URL
            // The URL looks like .../storage/v1/object/public/documents/USER_ID/PROFILE_ID/FILENAME
            const urlParts = doc.file_url.split('/documents/')
            if (urlParts.length > 1) {
                const filePath = urlParts[1]

                // Delete from storage
                await supabase.storage
                    .from('documents')
                    .remove([filePath])
            }
        }

        // Delete document record
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId)

        if (error) throw error
    },

    // Get documents for profile
    async getProfileDocuments(profileId) {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('profile_id', profileId)
            .order('uploaded_at', { ascending: false })

        if (error) throw error
        return data
    }
}
