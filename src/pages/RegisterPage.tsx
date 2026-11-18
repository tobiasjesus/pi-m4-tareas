import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  return (
    <main className="container auth-page">
      <h1>Crear cuenta</h1>
      <AuthForm
        mode="register"
        onSubmit={signUp}
        onGoogle={signInWithGoogle}
        onSuccess={() => navigate('/dashboard', { replace: true })}
      />
      <p className="auth-switch">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </main>
  )
}
