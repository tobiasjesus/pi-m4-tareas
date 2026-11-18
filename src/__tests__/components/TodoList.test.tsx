import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoList } from '../../components/tasks/TodoList'
import { makeTask } from '../helpers/makeTask'

function renderList(props: Partial<Parameters<typeof TodoList>[0]> = {}) {
  const actions = {
    onToggle: vi.fn().mockResolvedValue(undefined),
    onUpdate: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  }
  render(<TodoList tasks={[]} loading={false} error="" {...actions} {...props} />)
  return actions
}

describe('<TodoList />', () => {
  it('muestra el estado de carga', () => {
    renderList({ loading: true })
    expect(screen.getByText('Cargando tareas...')).toBeInTheDocument()
  })

  it('muestra el mensaje de lista vacía', () => {
    renderList({ emptyMessage: 'No hay tareas todavía.' })
    expect(screen.getByText('No hay tareas todavía.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('muestra el error de carga', () => {
    renderList({ error: 'No se pudieron obtener las tareas.' })
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron obtener las tareas.')
  })

  it('renderiza las tareas con su prioridad', () => {
    renderList({
      tasks: [makeTask({ id: '1', title: 'Comprar mate', priority: 'high' }), makeTask({ id: '2', title: 'Estudiar' })],
    })
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Comprar mate')).toBeInTheDocument()
    expect(screen.getByText('Prioridad Alta')).toBeInTheDocument()
  })

  it('al tildar una tarea llama a onToggle con esa tarea', async () => {
    const task = makeTask({ id: '1', title: 'Comprar mate' })
    const { onToggle } = renderList({ tasks: [task] })

    await userEvent.click(screen.getByRole('checkbox', { name: 'Comprar mate' }))

    expect(onToggle).toHaveBeenCalledWith(task)
  })

  it('al editar muestra el formulario con los datos y guarda los cambios', async () => {
    const task = makeTask({ id: '1', title: 'Comprar mate' })
    const { onUpdate } = renderList({ tasks: [task] })

    await userEvent.click(screen.getByRole('button', { name: /editar/i }))
    const title = screen.getByLabelText(/título/i)
    expect(title).toHaveValue('Comprar mate')

    await userEvent.clear(title)
    await userEvent.type(title, 'Comprar mate y azúcar')
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(onUpdate).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Comprar mate y azúcar' }))
  })

  it('muestra un error si falla eliminar', async () => {
    const { onDelete } = renderList({ tasks: [makeTask({ id: '1' })] })
    onDelete.mockRejectedValueOnce(new Error('permission-denied'))

    await userEvent.click(screen.getByRole('button', { name: /eliminar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar la tarea.')
  })
})
