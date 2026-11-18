import type { AuthFormErrors, AuthFormValues } from '../types/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 6

// Función pura: recibe los valores y devuelve los errores (vacío = válido).
// `isRegister` agrega la validación de confirmación de contraseña.
export function validateAuthForm(values: AuthFormValues, isRegister = false): AuthFormErrors {
  const errors: AuthFormErrors = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'El email es obligatorio.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'El email no es válido.'
  }

  if (!values.password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (isRegister && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }

  if (isRegister && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}
