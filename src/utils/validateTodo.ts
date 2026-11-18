import type { Priority, TaskFormErrors, TaskFormValues } from '../types/task'

export const TITLE_MIN = 3
export const TITLE_MAX = 100
export const DESCRIPTION_MAX = 200
const PRIORITIES: Priority[] = ['low', 'medium', 'high']
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Función pura: devuelve los errores del formulario de tareas (vacío = válido).
export function validateTodo(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {}
  const title = values.title.trim()

  if (!title) {
    errors.title = 'El título es obligatorio.'
  } else if (title.length < TITLE_MIN) {
    errors.title = `El título debe tener al menos ${TITLE_MIN} caracteres.`
  } else if (title.length > TITLE_MAX) {
    errors.title = `El título no puede superar los ${TITLE_MAX} caracteres.`
  }

  if (values.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `La descripción no puede superar los ${DESCRIPTION_MAX} caracteres.`
  }

  if (!PRIORITIES.includes(values.priority)) {
    errors.priority = 'Elegí una prioridad válida.'
  }

  if (values.dueDate && !DATE_REGEX.test(values.dueDate)) {
    errors.dueDate = 'La fecha no es válida.'
  }

  return errors
}
