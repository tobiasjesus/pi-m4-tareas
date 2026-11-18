import { useEffect, useState } from 'react'
import { subscribeToTasks } from '../services/taskService'
import type { Task } from '../types/task'

interface UseTasksResult {
  tasks: Task[]
  loading: boolean
  error: string
}

// Mantiene sincronizadas las tareas del usuario con Firestore en tiempo real.
export function useTasks(uid: string | undefined): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(Boolean(uid))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!uid) return

    const unsubscribe = subscribeToTasks(
      uid,
      (data) => {
        setTasks(data)
        setError('')
        setLoading(false)
      },
      (err) => {
        // Solo en desarrollo: muestra el detalle técnico (p. ej. el link para crear el índice).
        if (import.meta.env.DEV) console.error(err)
        setError(
          err.code === 'permission-denied'
            ? 'No tenés permiso para ver estas tareas.'
            : 'No se pudieron obtener las tareas.',
        )
        setLoading(false)
      },
    )

    // Cancelar la suscripción al desmontar o si cambia el usuario (evita memory leaks).
    return unsubscribe
  }, [uid])

  return { tasks, loading, error }
}
