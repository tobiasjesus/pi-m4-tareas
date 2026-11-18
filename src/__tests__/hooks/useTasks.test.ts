import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { FirestoreError } from 'firebase/firestore'
import { useTasks } from '../../hooks/useTasks'
import { subscribeToTasks } from '../../services/taskService'
import type { Task } from '../../types/task'
import { makeTask } from '../helpers/makeTask'

// Mock del servicio de Firestore: los tests no tocan Firebase real.
vi.mock('../../services/taskService', () => ({ subscribeToTasks: vi.fn() }))
const mockedSubscribe = vi.mocked(subscribeToTasks)

let emitData: (tasks: Task[]) => void
let emitError: (error: FirestoreError) => void
const unsubscribe = vi.fn()

describe('useTasks', () => {
  beforeEach(() => {
    unsubscribe.mockReset()
    mockedSubscribe.mockReset()
    mockedSubscribe.mockImplementation((_uid, onData, onError) => {
      emitData = onData
      emitError = onError
      return unsubscribe
    })
  })

  it('arranca en loading y recibe las tareas en tiempo real', () => {
    const { result } = renderHook(() => useTasks('user-1'))
    expect(result.current.loading).toBe(true)
    expect(mockedSubscribe).toHaveBeenCalledWith('user-1', expect.any(Function), expect.any(Function))

    act(() => emitData([makeTask({ title: 'Comprar mate' })]))

    expect(result.current.loading).toBe(false)
    expect(result.current.tasks.map((t) => t.title)).toEqual(['Comprar mate'])
  })

  it('traduce el error permission-denied', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useTasks('user-1'))

    act(() => emitError({ code: 'permission-denied' } as FirestoreError))

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('No tenés permiso para ver estas tareas.')
  })

  it('cancela la suscripción al desmontar (evita memory leaks)', () => {
    const { unmount } = renderHook(() => useTasks('user-1'))
    unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('no se suscribe si no hay usuario', () => {
    renderHook(() => useTasks(undefined))
    expect(mockedSubscribe).not.toHaveBeenCalled()
  })
})
