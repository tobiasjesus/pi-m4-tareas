import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Task, TaskFormValues } from '../types/task'

const TASKS_COLLECTION = 'tasks'
const tasksRef = collection(db, TASKS_COLLECTION)

// Convierte los valores del formulario al formato guardado en Firestore.
function toTaskFields(values: TaskFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    dueDate: values.dueDate || null,
  }
}

// Suscripción en tiempo real a las tareas del usuario (patrón Observer).
// Devuelve la función para cancelar la suscripción.
export function subscribeToTasks(
  uid: string,
  onData: (tasks: Task[]) => void,
  onError: (error: FirestoreError) => void,
): Unsubscribe {
  const q = query(tasksRef, where('userId', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }))
      onData(tasks)
    },
    onError,
  )
}

export async function addTask(uid: string, values: TaskFormValues): Promise<string> {
  const ref = await addDoc(tasksRef, {
    ...toTaskFields(values),
    completed: false,
    userId: uid,
    createdAt: serverTimestamp(),
    order: Date.now(),
  })
  return ref.id
}

export function updateTask(id: string, values: TaskFormValues): Promise<void> {
  return updateDoc(doc(db, TASKS_COLLECTION, id), toTaskFields(values))
}

export function toggleTask(id: string, completed: boolean): Promise<void> {
  return updateDoc(doc(db, TASKS_COLLECTION, id), { completed })
}

export function deleteTask(id: string): Promise<void> {
  return deleteDoc(doc(db, TASKS_COLLECTION, id))
}

// Guarda el nuevo orden manual en una sola operación atómica.
export function reorderTasks(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db)
  orderedIds.forEach((id, index) => {
    batch.update(doc(db, TASKS_COLLECTION, id), { order: index })
  })
  return batch.commit()
}
