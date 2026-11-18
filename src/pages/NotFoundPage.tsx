import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="container">
      <h1>Página no encontrada</h1>
      <p>
        <Link to="/dashboard">Volver a mis tareas</Link>
      </p>
    </main>
  )
}
