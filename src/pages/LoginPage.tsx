import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { useAuth } from '../hooks/useAuth'

interface LocationState {
  from?: { pathname: string }
}

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Si venía de una ruta protegida, volvemos ahí después del login.
  const from = (location.state as LocationState | null)?.from?.pathname || '/dashboard'

  return (
    <main className="container auth-page">
      <h1>Iniciar sesión</h1>
      <AuthForm
        mode="login"
        onSubmit={signIn}
        onGoogle={signInWithGoogle}
        onSuccess={() => navigate(from, { replace: true })}
      />
      <p className="auth-switch">
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </main>
  )
}
