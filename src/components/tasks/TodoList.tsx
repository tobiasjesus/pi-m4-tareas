import { TodoItem, type TodoItemActions } from './TodoItem'
import type { Task } from '../../types/task'

interface TodoListProps extends TodoItemActions {
  tasks: Task[]
  loading: boolean
  error: string
  emptyMessage?: string
}

export function TodoList({ tasks, loading, error, emptyMessage = 'No hay tareas todavía.', ...actions }: TodoListProps) {
  if (loading) return <p className="status">Cargando tareas...</p>
  if (error)
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    )
  if (tasks.length === 0) return <p className="status">{emptyMessage}</p>

  return (
    <ul className="todo-list" aria-label="Lista de tareas">
      {tasks.map((task) => (
        <TodoItem key={task.id} task={task} {...actions} />
      ))}
    </ul>
  )
}
