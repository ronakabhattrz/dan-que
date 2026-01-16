import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading, isAdmin } = useAuthContext();
    console.log('[DEBUG] ProtectedRoute render:', { loading, hasUser: !!user, isAdmin, adminOnly });

    // REMOVED blocking loading state to prevent hanging the whole app
    /*
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                color: 'var(--text-primary)'
            }}>
                <div style={{
                    padding: 'var(--spacing-xl)',
                    background: 'var(--surface-glass)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--surface-glass-border)'
                }}>
                    Loading (Auth Status)...
                </div>
            </div>
        )
    }
    */

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
