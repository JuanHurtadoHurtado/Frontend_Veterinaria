export default function Veterinario({ sesion }) {
  return (
    <div className="page card">
      <h1>Zona del Veterinario</h1>
      {sesion && <p className="text-sm text-muted-foreground mb-4">Logueado como: <strong>{sesion.email}</strong></p>}
      <p>Agendas, pacientes y notas clínicas de tus consultas.</p>
    </div>
  )
}
