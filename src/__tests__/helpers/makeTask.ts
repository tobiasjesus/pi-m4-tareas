import type { Timestamp } from 'firebase/firestore'
import type { Task } from '../../types/task'

// Simula un Timestamp de Firestore: solo usamos toMillis().
export function fakeTimestamp(millis: number): Timestamp {
  return { toMillis: () => millis } as unknown as Timestamp
}

// Crea una tarea de prueba con valores por defecto sobreescribibles.
export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Tarea de prueba',
    description: '',
    completed: false,
    userId: 'user-1',
    createdAt: fakeTimestamp(1000),
    priority: 'medium',
    dueDate: null,
    order: 0,
    ...overrides,
  }
}
