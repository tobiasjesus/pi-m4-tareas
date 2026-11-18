import type { Task } from '../types/task'
import { formatDueDate, isOverdue, PRIORITY_LABELS, todayISO } from './taskList'

function formatDate(date: Date): string {
  const [y, m, d] = todayISO(date).split('-')
  return `${d}/${m}/${y}`
}

function describeTask(task: Task, today: string): string {
  const details = [`prioridad ${PRIORITY_LABELS[task.priority].toLowerCase()}`]
  if (task.dueDate) details.push(`vence ${formatDueDate(task.dueDate)}`)
  const overdue = isOverdue(task, today) ? ' [VENCIDA]' : ''
  return `- ${task.title} (${details.join(', ')})${overdue}`
}

// Arma el resumen en texto plano que se envía por email (función pura).
export function buildSummary(tasks: Task[], now: Date = new Date()): string {
  const today = todayISO(now)
  const pending = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  const lines = [`Resumen de tareas - ${formatDate(now)}`, '', `Pendientes: ${pending.length}`]
  if (pending.length === 0) lines.push('- (ninguna)')
  else pending.forEach((t) => lines.push(describeTask(t, today)))

  lines.push('', `Completadas: ${completed.length}`)
  if (completed.length === 0) lines.push('- (ninguna)')
  else completed.forEach((t) => lines.push(`- ${t.title}`))

  return lines.join('\n')
}
