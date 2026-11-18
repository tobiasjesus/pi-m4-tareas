import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailSummaryButton } from '../../components/tasks/EmailSummaryButton'
import { sendSummaryEmail } from '../../services/email'
import { makeTask } from '../helpers/makeTask'

// Mock del servicio: los tests nunca llaman a la Function real.
vi.mock('../../services/email', () => ({ sendSummaryEmail: vi.fn() }))
const mockedSend = vi.mocked(sendSummaryEmail)

describe('<EmailSummaryButton />', () => {
  beforeEach(() => {
    mockedSend.mockReset()
  })

  it('envía el resumen al email del usuario y muestra éxito + cooldown', async () => {
    mockedSend.mockResolvedValue('msg-123')
    render(<EmailSummaryButton to="tobi@test.com" tasks={[makeTask({ title: 'Comprar mate' })]} />)

    await userEvent.click(screen.getByRole('button', { name: /enviar resumen/i }))

    expect(mockedSend).toHaveBeenCalledWith('tobi@test.com', expect.stringContaining('Comprar mate'))
    expect(await screen.findByRole('status')).toHaveTextContent('Resumen enviado a tobi@test.com')
    expect(screen.getByRole('button', { name: /reenviar en 60 s/i })).toBeDisabled()
  })

  it('muestra "Enviando…" y deshabilita el botón mientras espera', async () => {
    mockedSend.mockReturnValue(new Promise<string>(() => {}))
    render(<EmailSummaryButton to="tobi@test.com" tasks={[]} />)

    await userEvent.click(screen.getByRole('button', { name: /enviar resumen/i }))

    expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled()
  })

  it('muestra el mensaje de error que devuelve el servidor', async () => {
    mockedSend.mockRejectedValue(new Error('Email address is not verified.'))
    render(<EmailSummaryButton to="tobi@test.com" tasks={[]} />)

    await userEvent.click(screen.getByRole('button', { name: /enviar resumen/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email address is not verified.')
    // Tras un error se puede reintentar (sin cooldown).
    expect(screen.getByRole('button', { name: /enviar resumen/i })).toBeEnabled()
  })

  it('queda deshabilitado si el usuario no tiene email', () => {
    render(<EmailSummaryButton to={null} tasks={[]} />)
    expect(screen.getByRole('button', { name: /enviar resumen/i })).toBeDisabled()
  })
})
