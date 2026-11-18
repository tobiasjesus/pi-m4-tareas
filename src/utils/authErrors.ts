import { FirebaseError } from 'firebase/app'

// Traduce códigos internos de Firebase a mensajes claros para el usuario.
// Credenciales inválidas y contraseña incorrecta comparten mensaje
// para no revelar si un email está registrado.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con este correo.',
  'auth/email-already-in-use': 'Ese email ya está registrado.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Probá más tarde.',
  'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.',
  'auth/network-request-failed': 'Error de conexión. Revisá tu internet.',
}

const DEFAULT_MESSAGE = 'Error de autenticación. Intentá nuevamente.'

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_MESSAGE
  }
  return DEFAULT_MESSAGE
}
