// El frontend solo habla con nuestra Function (/api/send-email), nunca con AWS.

interface SendEmailResponse {
  ok: boolean
  messageId?: string
  error?: string
  message?: string
}

export async function sendSummaryEmail(to: string, summary: string): Promise<string> {
  let response: Response
  try {
    response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, summary }),
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisá tu conexión.')
  }

  let data: SendEmailResponse | null = null
  try {
    data = (await response.json()) as SendEmailResponse
  } catch {
    // La respuesta no era JSON (por ejemplo, la Function no está disponible).
  }

  if (!response.ok || !data?.ok) {
    throw new Error(data?.message || `Error del servidor (${response.status}).`)
  }
  return data.messageId ?? ''
}
