import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoForm } from '../../components/tasks/TodoForm'

describe('<TodoForm />', () => {
  it('muestra un error y no envía si el título está vacío', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(screen.getByText('El título es obligatorio.')).toBeInTheDocument()
    expect(screen.getByLabelText(/título/i)).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía los datos cargados y limpia el formulario si salió bien', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Comprar mate')
    await userEvent.type(screen.getByLabelText(/descripción/i), 'Yerba')
    await userEvent.selectOptions(screen.getByLabelText(/prioridad/i), 'high')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Comprar mate',
      description: 'Yerba',
      priority: 'high',
      dueDate: '',
    })
    expect(screen.getByLabelText(/título/i)).toHaveValue('')
  })

  it('muestra "Guardando…" y deshabilita el botón mientras se guarda', async () => {
    // Promesa que nunca resuelve: el formulario queda en estado de envío.
    const onSubmit = vi.fn(() => new Promise<void>(() => {}))
    render(<TodoForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Comprar mate')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled()
  })

  it('muestra un error si falla el guardado y conserva lo escrito', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('network'))
    render(<TodoForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/título/i), 'Comprar mate')
    await userEvent.click(screen.getByRole('button', { name: /agregar tarea/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar la tarea')
    expect(screen.getByLabelText(/título/i)).toHaveValue('Comprar mate')
  })
})
