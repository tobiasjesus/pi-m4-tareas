import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function handleLogout() {
    setError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setError('No se pudo cerrar sesión. Intentá nuevamente.')
    }
  }

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        <span className="app-title">Gestor de Tareas</span>
        {user && (
          <div className="app-header-user">
            <span className="user-email">{user.email}</span>
            <Button variant="secondary" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        )}
      </div>
      {error && (
        <p className="form-error container" role="alert">
          {error}
        </p>
      )}
    </header>
  )
}
