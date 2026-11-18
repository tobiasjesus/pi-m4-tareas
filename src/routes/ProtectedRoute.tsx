import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Solo deja pasar a usuarios logueados.
// Mientras Firebase confirma la sesión (loading) no redirige: evita el "parpadeo".
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="container">Cargando sesión...</p>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}
