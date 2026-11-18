// Vercel Function (BFF): React → /api/send-email → AWS SES.
// Las credenciales de AWS viven solo acá (process.env), nunca en el frontend.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const SUMMARY_MAX_LENGTH = 10000

interface EmailPayload {
  to: string
  summary: string
}

type ValidationResult = { ok: true; data: EmailPayload } | { ok: false; message: string }

// Valida el body antes de llamar a SES (función pura, testeable).
export function validateEmailPayload(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: "Missing 'to' or 'summary'" }
  }
  const { to, summary } = body as Record<string, unknown>

  if (typeof to !== 'string' || typeof summary !== 'string' || !to.trim() || !summary.trim()) {
    return { ok: false, message: "Missing 'to' or 'summary'" }
  }
  if (!EMAIL_REGEX.test(to.trim())) {
    return { ok: false, message: "Invalid 'to' email address" }
  }
  if (summary.length > SUMMARY_MAX_LENGTH) {
    return { ok: false, message: `'summary' exceeds ${SUMMARY_MAX_LENGTH} characters` }
  }
  return { ok: true, data: { to: to.trim(), summary } }
}

// Escapa caracteres especiales para insertar texto del usuario en HTML de forma segura.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtml(summary: string): string {
  return `<div style="font-family:Arial,sans-serif;color:#1f2328">
  <h2 style="color:#2f6feb">Tu resumen de tareas</h2>
  <pre style="font-family:inherit;white-space:pre-wrap;font-size:14px">${escapeHtml(summary)}</pre>
</div>`
}

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'MethodNotAllowed', message: 'Use POST' })
  }

  const validation = validateEmailPayload(req.body)
  if (!validation.ok) {
    return res.status(400).json({ ok: false, error: 'BadRequest', message: validation.message })
  }

  // El remitente lo define el servidor, nunca el cliente.
  const from = process.env.SES_FROM_EMAIL
  if (!from || !process.env.AWS_REGION) {
    return res.status(500).json({ ok: false, error: 'ServerMisconfigured', message: 'Email service is not configured' })
  }

  const { to, summary } = validation.data

  try {
    const result = await ses.send(
      new SendEmailCommand({
        Source: from,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: 'Tu resumen de TODOs', Charset: 'UTF-8' },
          Body: {
            Text: { Data: summary, Charset: 'UTF-8' },
            Html: { Data: buildHtml(summary), Charset: 'UTF-8' },
          },
        },
      }),
    )
    return res.status(200).json({ ok: true, messageId: result.MessageId })
  } catch (err: unknown) {
    // Nunca loguear secretos: solo nombre y mensaje del error.
    console.error('SES send error:', err instanceof Error ? `${err.name}: ${err.message}` : err)
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.name : 'UnknownError',
      message: err instanceof Error ? err.message : 'Failed to send email',
    })
  }
}
