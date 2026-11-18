import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface LocationState {
  from?: { pathname: string }
}

// Login y Registro: si ya hay sesión, no tiene sentido mostrarlos.
// Respeta `state.from` para volver a la ruta protegida que se intentó abrir.
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from?.pathname || '/dashboard'

  if (loading) return <p className="container">Cargando sesión...</p>
  if (user) return <Navigate to={from} replace />
  return <>{children}</>
}
