import type { User, UserCredential } from 'firebase/auth'

// Contrato del contexto de autenticación: única fuente de verdad de la sesión.
export interface AuthContextValue {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<UserCredential>
  signIn: (email: string, password: string) => Promise<UserCredential>
  signInWithGoogle: () => Promise<UserCredential>
  logout: () => Promise<void>
}

// Valores de los formularios de login y registro.
export interface AuthFormValues {
  email: string
  password: string
  confirmPassword?: string
}

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>
