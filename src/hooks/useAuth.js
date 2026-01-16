import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            console.log('[DEBUG] initializeAuth: Starting quick fetch...');
            try {
                // Initial session fetch - should be fast
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session) {
                    setUser(session.user);

                    // Background role check - DON'T AWAIT it here to avoid hanging the UI
                    supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', session.user.id)
                        .maybeSingle()
                        .then(({ data }) => {
                            if (mounted) {
                                console.log('[DEBUG] Background role fetch result:', data?.role);
                                setIsAdmin(data?.role === 'admin');
                            }
                        })
                        .catch(err => console.error('[DEBUG] Background role error:', err));
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('[DEBUG] initializeAuth fail:', error);
            } finally {
                // ALWAYS finish loading quickly
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for all auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[DEBUG] onAuthStateChange:', event);
            if (!mounted) return;

            if (session) {
                setUser(session.user);
                // Background role fetch for events
                supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id)
                    .maybeSingle()
                    .then(({ data }) => {
                        if (mounted) setIsAdmin(data?.role === 'admin');
                    });
            } else {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        // Fail-safe to ensure loader always disappears within 2 seconds
        const failSafe = setTimeout(() => {
            if (mounted && loading) setLoading(false);
        }, 2000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(failSafe);
        };
    }, []);

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (!error && data.user) {
            await supabase.from('user_roles').insert({
                user_id: data.user.id,
                role: 'user'
            });
        }
        return { data, error };
    }

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    const signOut = async () => {
        console.log('[DEBUG] Sign out initiated');
        try {
            await supabase.auth.signOut();
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            // Force reload to clear all context states
            window.location.href = '/login';
        } catch (error) {
            console.error('[DEBUG] Sign out error:', error);
            // Fallback
            setUser(null);
            setIsAdmin(false);
            window.location.href = '/login';
        }
    }

    return {
        user,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
    }
}
