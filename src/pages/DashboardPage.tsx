import { Header } from '../components/layout/Header'

// Página principal de tareas (el CRUD se agrega en el Hito 6).
export function DashboardPage() {
  return (
    <>
      <Header />
      <main className="container">
        <h1>Mis tareas</h1>
        <p>Próximamente: listado de tareas.</p>
      </main>
    </>
  )
}
