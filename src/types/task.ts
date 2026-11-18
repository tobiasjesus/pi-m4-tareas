import type { Timestamp } from 'firebase/firestore'

export type Priority = 'low' | 'medium' | 'high'

// Espeja exactamente el documento de la colección `tasks` en Firestore.
// `id` no se guarda como campo: se toma de doc.id.
export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  userId: string
  // null por un instante mientras serverTimestamp() está pendiente (escritura local).
  createdAt: Timestamp | null
  priority: Priority
  // Fecha de vencimiento en formato 'YYYY-MM-DD' o null si no tiene.
  dueDate: string | null
  // Posición para el orden manual (drag & drop).
  order: number
}

// Datos que el usuario carga en el formulario.
export interface TaskFormValues {
  title: string
  description: string
  priority: Priority
  dueDate: string // '' = sin fecha
}

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>

export type TaskFilter = 'all' | 'pending' | 'completed'

export type TaskSort = 'recent' | 'priority' | 'dueDate' | 'manual'
