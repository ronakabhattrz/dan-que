import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                checkAdminRole(session.user.id)
            }
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                checkAdminRole(session.user.id)
            } else {
                setIsAdmin(false)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const checkAdminRole = async (userId) => {
        const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single()

        setIsAdmin(data?.role === 'admin')
    }

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (!error && data.user) {
            // Create user role entry
            await supabase.from('user_roles').insert({
                user_id: data.user.id,
                role: 'user'
            })
        }

        return { data, error }
    }

    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        })
    }

    const signOut = async () => {
        return await supabase.auth.signOut()
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
