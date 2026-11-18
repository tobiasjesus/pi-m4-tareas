import { useState } from 'react'
import { Button } from '../ui/Button'
import { TodoForm } from './TodoForm'
import { formatDueDate, isOverdue, PRIORITY_LABELS } from '../../utils/taskList'
import type { Task, TaskFormValues } from '../../types/task'

export interface TodoItemActions {
  onToggle: (task: Task) => Promise<void>
  onUpdate: (id: string, values: TaskFormValues) => Promise<void>
  onDelete: (task: Task) => Promise<void>
}

interface TodoItemProps extends TodoItemActions {
  task: Task
}

export function TodoItem({ task, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')
  const overdue = isOverdue(task)

  async function run(action: () => Promise<void>, errorMessage: string) {
    setError('')
    setIsBusy(true)
    try {
      await action()
    } catch {
      setError(errorMessage)
    } finally {
      setIsBusy(false)
    }
  }

  if (isEditing) {
    return (
      <li className="todo-item editing">
        <TodoForm
          initialValues={{
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate ?? '',
          }}
          submitLabel="Guardar cambios"
          onSubmit={async (values) => {
            await onUpdate(task.id, values)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className={`todo-item${task.completed ? ' completed' : ''}${overdue ? ' overdue' : ''}`}>
      <div className="todo-main">
        <input
          type="checkbox"
          id={`toggle-${task.id}`}
          checked={task.completed}
          disabled={isBusy}
          onChange={() => run(() => onToggle(task), 'No se pudo actualizar la tarea.')}
        />
        <div className="todo-content">
          <label htmlFor={`toggle-${task.id}`} className="todo-title">
            {task.title}
          </label>
          {task.description && <p className="todo-description">{task.description}</p>}
          <div className="todo-meta">
            <span className={`badge priority-${task.priority}`}>Prioridad {PRIORITY_LABELS[task.priority]}</span>
            {task.dueDate && (
              <span className={`badge${overdue ? ' badge-overdue' : ''}`}>
                {overdue ? 'Venció' : 'Vence'} {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="todo-actions">
        <Button variant="secondary" disabled={isBusy} onClick={() => setIsEditing(true)}>
          Editar
        </Button>
        <Button
          variant="danger"
          disabled={isBusy}
          onClick={() => run(() => onDelete(task), 'No se pudo eliminar la tarea.')}
        >
          Eliminar
        </Button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </li>
  )
}
