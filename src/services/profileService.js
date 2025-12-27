import { supabase } from '../lib/supabase'

export const profileService = {
    // Create a new profile
    async createProfile(userId, type) {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                user_id: userId,
                type,
                status: 'draft',
                progress: 0
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Get profile by ID
    async getProfileById(profileId) {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
        *,
        documents (*)
      `)
            .eq('id', profileId)
            .single()

        if (error) throw error
        return data
    },

    // Get all profiles for a user
    async getUserProfiles(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
        *,
        documents (*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Update profile
    async updateProfile(profileId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', profileId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Delete profile
    async deleteProfile(profileId) {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profileId)

        if (error) throw error
    },

    // Get all pending profiles (admin)
    async getPendingProfiles() {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
        *,
        documents (*),
        user_roles!profiles_user_id_fkey (*)
      `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    // Approve profile (admin)
    async approveProfile(profileId, adminId, notes = '') {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                status: 'verified',
                verified: true,
                verified_at: new Date().toISOString(),
                verified_by: adminId
            })
            .eq('id', profileId)
            .select()
            .single()

        if (error) throw error

        // Log admin action
        await supabase.from('admin_actions').insert({
            admin_id: adminId,
            profile_id: profileId,
            action: 'approved',
            notes
        })

        return data
    },

    // Reject profile (admin)
    async rejectProfile(profileId, adminId, notes = '') {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                status: 'rejected',
                verified: false
            })
            .eq('id', profileId)
            .select()
            .single()

        if (error) throw error

        // Log admin action
        await supabase.from('admin_actions').insert({
            admin_id: adminId,
            profile_id: profileId,
            action: 'rejected',
            notes
        })

        return data
    }
}
