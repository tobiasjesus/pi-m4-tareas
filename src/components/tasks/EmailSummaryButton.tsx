import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { sendSummaryEmail } from '../../services/email'
import { buildSummary } from '../../utils/buildSummary'
import type { Task } from '../../types/task'

type Status = 'idle' | 'loading' | 'success' | 'error'

const COOLDOWN_SECONDS = 60

interface EmailSummaryButtonProps {
  to: string | null
  tasks: Task[]
}

// Envía por email el resumen de tareas. Muestra loading / éxito / error
// y bloquea reenvíos durante 60 s después de un envío exitoso.
export function EmailSummaryButton({ to, tasks }: EmailSummaryButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleClick() {
    if (!to) return
    setStatus('loading')
    setMessage('')
    try {
      await sendSummaryEmail(to, buildSummary(tasks))
      setStatus('success')
      setMessage(`Resumen enviado a ${to}. Si no lo ves, revisá la carpeta de spam.`)
      setCooldown(COOLDOWN_SECONDS)
    } catch (error: unknown) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar el email.')
    }
  }

  const isLoading = status === 'loading'
  const label = isLoading
    ? 'Enviando…'
    : cooldown > 0
      ? `Reenviar en ${cooldown} s`
      : 'Enviar resumen por email'

  return (
    <div className="email-summary">
      <Button onClick={handleClick} disabled={!to || isLoading || cooldown > 0}>
        {label}
      </Button>
      {message && (
        <p className={status === 'error' ? 'form-error' : 'form-success'} role={status === 'error' ? 'alert' : 'status'}>
          {message}
        </p>
      )}
    </div>
  )
}
