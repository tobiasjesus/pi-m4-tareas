import { describe, expect, it } from 'vitest'
import { validateTodo } from '../../utils/validateTodo'
import type { TaskFormValues } from '../../types/task'

const valid: TaskFormValues = { title: 'Comprar mate', description: '', priority: 'medium', dueDate: '' }

describe('validateTodo', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(validateTodo(valid)).toEqual({})
  })

  it('exige el título (vacío o solo espacios)', () => {
    expect(validateTodo({ ...valid, title: '' }).title).toBe('El título es obligatorio.')
    expect(validateTodo({ ...valid, title: '   ' }).title).toBe('El título es obligatorio.')
  })

  it('exige al menos 3 caracteres en el título', () => {
    expect(validateTodo({ ...valid, title: 'ab' }).title).toMatch(/al menos 3/)
  })

  it('rechaza títulos de más de 100 caracteres', () => {
    expect(validateTodo({ ...valid, title: 'a'.repeat(101) }).title).toMatch(/100/)
  })

  it('acepta una descripción de exactamente 200 caracteres y rechaza 201', () => {
    expect(validateTodo({ ...valid, description: 'a'.repeat(200) }).description).toBeUndefined()
    expect(validateTodo({ ...valid, description: 'a'.repeat(201) }).description).toMatch(/200/)
  })

  it('rechaza una fecha con formato inválido y acepta la vacía', () => {
    expect(validateTodo({ ...valid, dueDate: '19/11/2026' }).dueDate).toBeDefined()
    expect(validateTodo({ ...valid, dueDate: '2026-11-19' }).dueDate).toBeUndefined()
  })
})
