import { useState, type ChangeEvent, type FormEvent } from 'react'
import { FormField } from '../ui/FormField'
import { Button } from '../ui/Button'
import { hasErrors } from '../../utils/forms'
import { DESCRIPTION_MAX, validateTodo } from '../../utils/validateTodo'
import { PRIORITY_LABELS } from '../../utils/taskList'
import type { Priority, TaskFormErrors, TaskFormValues } from '../../types/task'

const EMPTY_TASK: TaskFormValues = { title: '', description: '', priority: 'medium', dueDate: '' }

interface TodoFormProps {
  initialValues?: TaskFormValues
  submitLabel?: string
  onSubmit: (values: TaskFormValues) => Promise<unknown>
  onCancel?: () => void
}

// Formulario para crear y editar tareas. Valida antes de enviar.
export function TodoForm({ initialValues = EMPTY_TASK, submitLabel = 'Agregar tarea', onSubmit, onCancel }: TodoFormProps) {
  const [values, setValues] = useState<TaskFormValues>(initialValues)
  const [errors, setErrors] = useState<TaskFormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = Boolean(onCancel)
  const idPrefix = isEdit ? 'edit' : 'new'

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateTodo(values)
    setErrors(validationErrors)
    if (hasErrors(validationErrors)) return

    setSubmitError('')
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      // Solo se limpia si salió bien (en edición el padre cierra el formulario).
      if (!isEdit) setValues(EMPTY_TASK)
    } catch {
      setSubmitError('No se pudo guardar la tarea. Intentá nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const descriptionErrorId = `${idPrefix}-description-error`

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate aria-label={isEdit ? 'Editar tarea' : 'Nueva tarea'}>
      <FormField
        id={`${idPrefix}-title`}
        name="title"
        label="Título"
        value={values.title}
        onChange={handleChange}
        error={errors.title}
      />

      <div className="form-field">
        <label htmlFor={`${idPrefix}-description`}>Descripción</label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={2}
          value={values.description}
          onChange={handleChange}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? descriptionErrorId : undefined}
        />
        <span className="char-count">
          {values.description.trim().length}/{DESCRIPTION_MAX}
        </span>
        {errors.description && (
          <p id={descriptionErrorId} className="field-error" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor={`${idPrefix}-priority`}>Prioridad</label>
          <select id={`${idPrefix}-priority`} name="priority" value={values.priority} onChange={handleChange}>
            {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <FormField
          id={`${idPrefix}-dueDate`}
          name="dueDate"
          type="date"
          label="Vence (opcional)"
          value={values.dueDate}
          onChange={handleChange}
          error={errors.dueDate}
        />
      </div>

      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
