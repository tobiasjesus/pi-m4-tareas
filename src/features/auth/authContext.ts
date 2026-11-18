import { createContext } from 'react'
import type { AuthContextValue } from '../../types/auth'

// El valor real lo provee <AuthProvider>. `null` indica "usado fuera del Provider".
export const AuthContext = createContext<AuthContextValue | null>(null)
