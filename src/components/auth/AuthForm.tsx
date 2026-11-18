import { useState, type ChangeEvent, type FormEvent } from 'react'
import { FormField } from '../ui/FormField'
import { Button } from '../ui/Button'
import { hasErrors, validateAuthForm } from '../../utils/validateAuth'
import { getAuthErrorMessage } from '../../utils/authErrors'
import type { AuthFormErrors, AuthFormValues } from '../../types/auth'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (email: string, password: string) => Promise<unknown>
  onGoogle: () => Promise<unknown>
  onSuccess: () => void
}

const INITIAL_VALUES: AuthFormValues = { email: '', password: '', confirmPassword: '' }

// Formulario compartido por Login y Registro.
// Valida antes de enviar y traduce los errores de Firebase.
export function AuthForm({ mode, onSubmit, onGoogle, onSuccess }: AuthFormProps) {
  const isRegister = mode === 'register'
  const [values, setValues] = useState<AuthFormValues>(INITIAL_VALUES)
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function runAuth(action: () => Promise<unknown>) {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      await action()
      onSuccess()
    } catch (error: unknown) {
      setSubmitError(getAuthErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateAuthForm(values, isRegister)
    setErrors(validationErrors)
    if (hasErrors(validationErrors)) return
    await runAuth(() => onSubmit(values.email.trim(), values.password))
  }

  return (
    <div className="auth-card">
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        {isRegister && (
          <FormField
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Repetir contraseña"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        )}

        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="btn-block">
          {isSubmitting ? 'Procesando…' : isRegister ? 'Crear cuenta' : 'Ingresar'}
        </Button>
      </form>

      <div className="divider">o</div>

      <Button
        variant="secondary"
        className="btn-block"
        disabled={isSubmitting}
        onClick={() => runAuth(onGoogle)}
      >
        Continuar con Google
      </Button>
    </div>
  )
}
