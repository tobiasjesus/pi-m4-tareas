import type { TaskFilter, TaskSort } from '../../types/task'

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Completadas' },
]

const SORTS: { value: TaskSort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'priority', label: 'Prioridad' },
  { value: 'dueDate', label: 'Vencimiento' },
]

interface TaskToolbarProps {
  filter: TaskFilter
  sort: TaskSort
  counts: Record<TaskFilter, number>
  onFilterChange: (filter: TaskFilter) => void
  onSortChange: (sort: TaskSort) => void
}

// Filtros (todas / pendientes / completadas) y criterio de orden.
export function TaskToolbar({ filter, sort, counts, onFilterChange, onSortChange }: TaskToolbarProps) {
  return (
    <div className="task-toolbar">
      <div className="filter-group" role="group" aria-label="Filtrar tareas">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-btn${filter === f.value ? ' active' : ''}`}
            aria-pressed={filter === f.value}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label} ({counts[f.value]})
          </button>
        ))}
      </div>

      <div className="sort-group">
        <label htmlFor="sort">Ordenar por</label>
        <select id="sort" value={sort} onChange={(e) => onSortChange(e.target.value as TaskSort)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
