import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    // Use localStorage to persist admin status across refreshes to prevent flickering/redirection
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('danque_is_admin') === 'true')

    useEffect(() => {
        let mounted = true;

        const checkRole = async (userId) => {
            try {
                console.log('[DEBUG] checkRole: Querying database...');
                // Race the role check against a 2s timeout (increased for reliability on refresh)
                const { data, error } = await Promise.race([
                    supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
                ]);

                if (error) throw error;
                const adminStatus = data?.role === 'admin';
                console.log('[DEBUG] checkRole: Result:', adminStatus);
                return adminStatus;
            } catch (e) {
                console.warn('[DEBUG] checkRole: Failed or timed out. Falling back to current stated role.');
                return localStorage.getItem('danque_is_admin') === 'true';
            }
        };

        const initializeAuth = async () => {
            console.log('[DEBUG] initializeAuth: Starting...');
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session) {
                    console.log('[DEBUG] initializeAuth: Session found, verifying role...');
                    setUser(session.user);
                    const isUserAdmin = await checkRole(session.user.id);
                    if (mounted) {
                        setIsAdmin(isUserAdmin);
                        localStorage.setItem('danque_is_admin', isUserAdmin);
                    }
                } else {
                    console.log('[DEBUG] initializeAuth: No session');
                    setUser(null);
                    setIsAdmin(false);
                    localStorage.removeItem('danque_is_admin');
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
                // On sign in, we MUST confirm admin status
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                    setLoading(true);
                    const isUserAdmin = await checkRole(session.user.id);
                    if (mounted) {
                        setIsAdmin(isUserAdmin);
                        localStorage.setItem('danque_is_admin', isUserAdmin);
                        setLoading(false);
                    }
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                localStorage.removeItem('danque_is_admin');
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
        setLoading(true);
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    }

    const signOut = async () => {
        console.log('[DEBUG] Sign out initiated');
        try {
            localStorage.removeItem('danque_is_admin');
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
