// true si el objeto de errores tiene al menos un campo con error.
export function hasErrors(errors: object): boolean {
  return Object.keys(errors).length > 0
}
