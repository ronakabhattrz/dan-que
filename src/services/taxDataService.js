import { supabase } from '../lib/supabase';

export const taxDataService = {
    // Get tax data for a specific year
    async getTaxDataByYear(profileId, year) {
        const { data, error } = await supabase
            .from('tax_data')
            .select('*')
            .eq('profile_id', profileId)
            .eq('tax_year', year)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    // Get all tax years for a profile
    async getAllTaxYears(profileId) {
        const { data, error } = await supabase
            .from('tax_data')
            .select('tax_year, updated_at')
            .eq('profile_id', profileId)
            .order('tax_year', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Save or update tax data for a year (upsert)
    async saveTaxData(profileId, year, taxData) {
        const { data, error } = await supabase
            .from('tax_data')
            .upsert({
                profile_id: profileId,
                tax_year: year,
                ...taxData
            }, {
                onConflict: 'profile_id,tax_year'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete tax data for a specific year
    async deleteTaxYear(profileId, year) {
        const { error } = await supabase
            .from('tax_data')
            .delete()
            .eq('profile_id', profileId)
            .eq('tax_year', year);

        if (error) throw error;
    },

    // Get all tax data for a profile (all years)
    async getAllTaxData(profileId) {
        const { data, error } = await supabase
            .from('tax_data')
            .select('*')
            .eq('profile_id', profileId)
            .order('tax_year', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
