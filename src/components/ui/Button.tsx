import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

// Botón reutilizable. Por defecto type="button" para no enviar formularios sin querer.
export function Button({ variant = 'primary', type = 'button', className = '', ...props }: ButtonProps) {
  return <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...props} />
}
