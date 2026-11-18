import { describe, expect, it } from 'vitest'
import { FirebaseError } from 'firebase/app'
import { getAuthErrorMessage } from '../../utils/authErrors'
import { validateAuthForm } from '../../utils/validateAuth'

describe('getAuthErrorMessage', () => {
  it('usa el mismo mensaje para credenciales inválidas y contraseña incorrecta', () => {
    const invalid = getAuthErrorMessage(new FirebaseError('auth/invalid-credential', 'x'))
    const wrong = getAuthErrorMessage(new FirebaseError('auth/wrong-password', 'x'))
    expect(invalid).toBe('Email o contraseña incorrectos.')
    expect(wrong).toBe(invalid)
  })

  it('traduce email ya registrado', () => {
    expect(getAuthErrorMessage(new FirebaseError('auth/email-already-in-use', 'x'))).toBe(
      'Ese email ya está registrado.',
    )
  })

  it('devuelve un mensaje genérico para códigos desconocidos o errores que no son de Firebase', () => {
    const generic = 'Error de autenticación. Intentá nuevamente.'
    expect(getAuthErrorMessage(new FirebaseError('auth/otro-codigo', 'x'))).toBe(generic)
    expect(getAuthErrorMessage(new Error('boom'))).toBe(generic)
    expect(getAuthErrorMessage('texto')).toBe(generic)
  })
})

describe('validateAuthForm', () => {
  it('exige email y contraseña', () => {
    const errors = validateAuthForm({ email: '', password: '' })
    expect(errors.email).toBe('El email es obligatorio.')
    expect(errors.password).toBe('La contraseña es obligatoria.')
  })

  it('rechaza un email con formato inválido', () => {
    expect(validateAuthForm({ email: 'tobi@', password: '123456' }).email).toBe('El email no es válido.')
  })

  it('en registro exige 6 caracteres y que las contraseñas coincidan', () => {
    const errors = validateAuthForm({ email: 'a@b.com', password: '12345', confirmPassword: '54321' }, true)
    expect(errors.password).toMatch(/al menos 6/)
    expect(errors.confirmPassword).toBe('Las contraseñas no coinciden.')
  })

  it('acepta datos de registro válidos', () => {
    expect(validateAuthForm({ email: 'a@b.com', password: '123456', confirmPassword: '123456' }, true)).toEqual({})
  })
})
