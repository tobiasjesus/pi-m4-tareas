import { describe, expect, it } from 'vitest'
import { buildSummary } from '../../utils/buildSummary'
import { makeTask } from '../helpers/makeTask'

const now = new Date(2026, 10, 18) // 18/11/2026 (los meses empiezan en 0)

describe('buildSummary', () => {
  it('lista pendientes y completadas con sus cantidades', () => {
    const summary = buildSummary(
      [
        makeTask({ title: 'Comprar mate', priority: 'high' }),
        makeTask({ title: 'Pagar factura', priority: 'medium', dueDate: '2026-11-17' }),
        makeTask({ title: 'Estudiar React', completed: true }),
      ],
      now,
    )

    expect(summary).toContain('Resumen de tareas - 18/11/2026')
    expect(summary).toContain('Pendientes: 2')
    expect(summary).toContain('- Comprar mate (prioridad alta)')
    expect(summary).toContain('- Pagar factura (prioridad media, vence 17/11/2026) [VENCIDA]')
    expect(summary).toContain('Completadas: 1')
    expect(summary).toContain('- Estudiar React')
  })

  it('indica "(ninguna)" cuando no hay tareas', () => {
    const summary = buildSummary([], now)
    expect(summary).toContain('Pendientes: 0')
    expect(summary).toContain('Completadas: 0')
    expect(summary.match(/\(ninguna\)/g)).toHaveLength(2)
  })
})
