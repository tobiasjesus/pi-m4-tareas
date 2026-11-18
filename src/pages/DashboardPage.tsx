import { useMemo, useState } from 'react'
import { Header } from '../components/layout/Header'
import { TodoForm } from '../components/tasks/TodoForm'
import { TodoList } from '../components/tasks/TodoList'
import { TaskToolbar } from '../components/tasks/TaskToolbar'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { addTask, deleteTask, toggleTask, updateTask } from '../services/taskService'
import { filterTasks, sortTasks } from '../utils/taskList'
import type { Task, TaskFilter, TaskFormValues, TaskSort } from '../types/task'

const EMPTY_MESSAGES: Record<TaskFilter, string> = {
  all: 'No hay tareas todavía. ¡Creá la primera!',
  pending: 'No tenés tareas pendientes.',
  completed: 'Todavía no completaste ninguna tarea.',
}

export function DashboardPage() {
  const { user } = useAuth()
  const uid = user?.uid
  const { tasks, loading, error } = useTasks(uid)
  const [filter, setFilter] = useState<TaskFilter>('all')
  const [sort, setSort] = useState<TaskSort>('recent')

  const counts = useMemo<Record<TaskFilter, number>>(
    () => ({
      all: tasks.length,
      pending: filterTasks(tasks, 'pending').length,
      completed: filterTasks(tasks, 'completed').length,
    }),
    [tasks],
  )

  const visibleTasks = useMemo(() => sortTasks(filterTasks(tasks, filter), sort), [tasks, filter, sort])

  // No hace falta actualizar estado local: onSnapshot refleja cada cambio solo.
  async function handleCreate(values: TaskFormValues) {
    if (!uid) return
    await addTask(uid, values)
  }

  const handleUpdate = (id: string, values: TaskFormValues) => updateTask(id, values)
  const handleToggle = (task: Task) => toggleTask(task.id, !task.completed)
  async function handleDelete(task: Task) {
    if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      await deleteTask(task.id)
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <h1>Mis tareas</h1>

        <section className="card" aria-labelledby="new-task-title">
          <h2 id="new-task-title">Nueva tarea</h2>
          <TodoForm onSubmit={handleCreate} />
        </section>

        <section aria-labelledby="list-title">
          <h2 id="list-title">Listado</h2>
          <TaskToolbar
            filter={filter}
            sort={sort}
            counts={counts}
            onFilterChange={setFilter}
            onSortChange={setSort}
          />
          <TodoList
            tasks={visibleTasks}
            loading={loading}
            error={error}
            emptyMessage={EMPTY_MESSAGES[filter]}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </>
  )
}
