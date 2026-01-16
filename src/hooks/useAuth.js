import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        let mounted = true;

        const checkRole = async (userId) => {
            try {
                // Return a promise that races the DB query against a 1.2s timeout
                const { data } = await Promise.race([
                    supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
                    new Promise(resolve => setTimeout(() => resolve({ data: null }), 1200))
                ]);
                return data?.role === 'admin';
            } catch (e) {
                console.error('[DEBUG] Role check failed:', e);
                return false;
            }
        };

        const initializeAuth = async () => {
            console.log('[DEBUG] initializeAuth: Starting...');
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session) {
                    setUser(session.user);
                    const isUserAdmin = await checkRole(session.user.id);
                    if (mounted) setIsAdmin(isUserAdmin);
                } else {
                    setUser(null);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('[DEBUG] initializeAuth error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[DEBUG] onAuthStateChange event:', event);
            if (!mounted) return;

            if (session) {
                setUser(session.user);
                // On sign in, we MUST confirm admin status before finishing loading
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    setLoading(true);
                    const isUserAdmin = await checkRole(session.user.id);
                    if (mounted) {
                        setIsAdmin(isUserAdmin);
                        setLoading(false);
                    }
                } else {
                    // Just update the role in background for other events
                    checkRole(session.user.id).then(res => {
                        if (mounted) setIsAdmin(res);
                    });
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        // Global fail-safe
        const failSafe = setTimeout(() => {
            if (mounted && loading) setLoading(false);
        }, 3000);

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
        setLoading(true); // Start loading immediately on sign-in
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    const signOut = async () => {
        console.log('[DEBUG] Sign out initiated');
        try {
            await supabase.auth.signOut();
            // Force reload to clear all context states
            window.location.href = '/login';
        } catch (error) {
            console.error('[DEBUG] Sign out error:', error);
            // Fallback
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
