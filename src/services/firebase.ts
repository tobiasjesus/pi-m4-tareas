// Única inicialización de Firebase en toda la app.
// El resto del código importa `auth` y `db` desde acá.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

// Authentication: registro, login, sesión.
export const auth = getAuth(app)

// Cloud Firestore: base de datos de tareas.
export const db = getFirestore(app)
