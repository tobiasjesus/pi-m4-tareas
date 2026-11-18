import type { Priority, Task, TaskFilter, TaskSort } from '../types/task'

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  if (filter === 'pending') return tasks.filter((t) => !t.completed)
  if (filter === 'completed') return tasks.filter((t) => t.completed)
  return tasks
}

// createdAt null = escritura pendiente (recién creada): la tratamos como la más nueva.
function createdMillis(task: Task): number {
  return task.createdAt ? task.createdAt.toMillis() : Number.MAX_SAFE_INTEGER
}

// Devuelve una copia ordenada (no modifica el array original).
export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  const copy = [...tasks]
  switch (sort) {
    case 'priority':
      return copy.sort(
        (a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] || createdMillis(b) - createdMillis(a),
      )
    case 'dueDate':
      // Las tareas sin fecha van al final. 'YYYY-MM-DD' se puede comparar como texto.
      return copy.sort((a, b) => {
        if (a.dueDate === b.dueDate) return createdMillis(b) - createdMillis(a)
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      })
    case 'manual':
      return copy.sort((a, b) => a.order - b.order)
    case 'recent':
    default:
      return copy.sort((a, b) => createdMillis(b) - createdMillis(a))
  }
}

// Fecha local de hoy en formato 'YYYY-MM-DD'.
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isOverdue(task: Task, today: string = todayISO()): boolean {
  return !task.completed && task.dueDate !== null && task.dueDate < today
}

// '2026-11-19' → '19/11/2026'
export function formatDueDate(dueDate: string): string {
  const [y, m, d] = dueDate.split('-')
  return `${d}/${m}/${y}`
}
