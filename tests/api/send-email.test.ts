// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VercelRequest, VercelResponse } from '@vercel/node'

// Mock de AWS SES: el test nunca envía emails reales.
const sendMock = vi.hoisted(() => vi.fn())
vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: class {
    send = sendMock
  },
  SendEmailCommand: class {
    input: unknown
    constructor(input: unknown) {
      this.input = input
    }
  },
}))

const { default: handler, validateEmailPayload } = await import('../../api/send-email.ts')

interface FakeResponse {
  statusCode: number
  body: unknown
}

function call(method: string, body?: unknown): Promise<FakeResponse> {
  const result: FakeResponse = { statusCode: 200, body: null }
  const res = {
    setHeader: () => res,
    status(code: number) {
      result.statusCode = code
      return res
    },
    json(payload: unknown) {
      result.body = payload
      return res
    },
  }
  return handler({ method, body } as VercelRequest, res as unknown as VercelResponse).then(() => result)
}

describe('validateEmailPayload', () => {
  it('acepta un payload válido', () => {
    expect(validateEmailPayload({ to: 'a@b.com', summary: 'Hola' })).toEqual({
      ok: true,
      data: { to: 'a@b.com', summary: 'Hola' },
    })
  })

  it('rechaza body vacío, campos faltantes, tipos incorrectos o email inválido', () => {
    expect(validateEmailPayload(undefined).ok).toBe(false)
    expect(validateEmailPayload({ to: 'a@b.com' }).ok).toBe(false)
    expect(validateEmailPayload({ to: 123, summary: 'x' }).ok).toBe(false)
    expect(validateEmailPayload({ to: 'a@b.com', summary: '   ' }).ok).toBe(false)
    expect(validateEmailPayload({ to: 'no-es-email', summary: 'x' })).toEqual({
      ok: false,
      message: "Invalid 'to' email address",
    })
  })
})

describe('POST /api/send-email', () => {
  beforeEach(() => {
    sendMock.mockReset()
    process.env.AWS_REGION = 'us-east-2'
    process.env.SES_FROM_EMAIL = 'from@test.com'
  })

  it('responde 405 si no es POST', async () => {
    const res = await call('GET')
    expect(res.statusCode).toBe(405)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('responde 400 y no llama a SES si el payload es inválido', async () => {
    const res = await call('POST', { to: 'a@b.com' })
    expect(res.statusCode).toBe(400)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('responde 500 si falta SES_FROM_EMAIL', async () => {
    delete process.env.SES_FROM_EMAIL
    const res = await call('POST', { to: 'a@b.com', summary: 'Hola' })
    expect(res.statusCode).toBe(500)
    expect(res.body).toMatchObject({ error: 'ServerMisconfigured' })
  })

  it('envía el email con el remitente del servidor y devuelve el messageId', async () => {
    sendMock.mockResolvedValue({ MessageId: 'abc-123' })
    const res = await call('POST', { to: 'a@b.com', summary: 'Hola' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true, messageId: 'abc-123' })
    const command = sendMock.mock.calls[0][0] as { input: { Source: string; Destination: { ToAddresses: string[] } } }
    expect(command.input.Source).toBe('from@test.com')
    expect(command.input.Destination.ToAddresses).toEqual(['a@b.com'])
  })

  it('responde 500 con el error de SES si el envío falla', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const sesError = Object.assign(new Error('Email address is not verified.'), { name: 'MessageRejected' })
    sendMock.mockRejectedValue(sesError)

    const res = await call('POST', { to: 'a@b.com', summary: 'Hola' })

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ ok: false, error: 'MessageRejected', message: 'Email address is not verified.' })
  })
})
