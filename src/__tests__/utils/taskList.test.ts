import { describe, expect, it } from 'vitest'
import { filterTasks, formatDueDate, isOverdue, sortTasks } from '../../utils/taskList'
import { fakeTimestamp, makeTask } from '../helpers/makeTask'

const pending = makeTask({ id: 'p', completed: false })
const done = makeTask({ id: 'd', completed: true })

describe('filterTasks', () => {
  it('filtra pendientes, completadas y todas', () => {
    expect(filterTasks([pending, done], 'pending').map((t) => t.id)).toEqual(['p'])
    expect(filterTasks([pending, done], 'completed').map((t) => t.id)).toEqual(['d'])
    expect(filterTasks([pending, done], 'all')).toHaveLength(2)
  })
})

describe('sortTasks', () => {
  it('ordena por prioridad: alta, media, baja', () => {
    const tasks = [
      makeTask({ id: 'low', priority: 'low' }),
      makeTask({ id: 'high', priority: 'high' }),
      makeTask({ id: 'medium', priority: 'medium' }),
    ]
    expect(sortTasks(tasks, 'priority').map((t) => t.id)).toEqual(['high', 'medium', 'low'])
  })

  it('ordena por vencimiento y deja al final las tareas sin fecha', () => {
    const tasks = [
      makeTask({ id: 'none', dueDate: null }),
      makeTask({ id: 'later', dueDate: '2026-12-01' }),
      makeTask({ id: 'soon', dueDate: '2026-11-19' }),
    ]
    expect(sortTasks(tasks, 'dueDate').map((t) => t.id)).toEqual(['soon', 'later', 'none'])
  })

  it('pone primero la más reciente y trata createdAt null (escritura pendiente) como la más nueva', () => {
    const tasks = [
      makeTask({ id: 'old', createdAt: fakeTimestamp(1) }),
      makeTask({ id: 'pendingWrite', createdAt: null }),
      makeTask({ id: 'new', createdAt: fakeTimestamp(5) }),
    ]
    expect(sortTasks(tasks, 'recent').map((t) => t.id)).toEqual(['pendingWrite', 'new', 'old'])
  })

  it('no modifica el array original', () => {
    const tasks = [makeTask({ id: 'a', priority: 'low' }), makeTask({ id: 'b', priority: 'high' })]
    sortTasks(tasks, 'priority')
    expect(tasks.map((t) => t.id)).toEqual(['a', 'b'])
  })
})

describe('isOverdue', () => {
  const today = '2026-11-18'

  it('marca vencida una tarea pendiente con fecha pasada', () => {
    expect(isOverdue(makeTask({ dueDate: '2026-11-17' }), today)).toBe(true)
  })

  it('no marca vencida si vence hoy, si no tiene fecha o si está completada', () => {
    expect(isOverdue(makeTask({ dueDate: today }), today)).toBe(false)
    expect(isOverdue(makeTask({ dueDate: null }), today)).toBe(false)
    expect(isOverdue(makeTask({ dueDate: '2026-11-17', completed: true }), today)).toBe(false)
  })
})

describe('formatDueDate', () => {
  it('convierte YYYY-MM-DD a DD/MM/YYYY', () => {
    expect(formatDueDate('2026-11-19')).toBe('19/11/2026')
  })
})
