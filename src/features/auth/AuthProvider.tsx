import { useEffect, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth } from '../../services/firebase'
import { AuthContext } from './authContext'
import type { AuthContextValue } from '../../types/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Empieza en true: hasta que Firebase responda, no sabemos si hay sesión.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Patrón Observer: Firebase avisa cada vez que cambia la sesión
    // (login, logout o sesión restaurada al recargar).
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    // Limpieza al desmontar: cancelamos la suscripción.
    return () => unsubscribe()
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
    signInWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
    logout: () => signOut(auth),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
