export default function Usuario({ sesion }) {
  return (
    <div className="page card">
      <h1>Mi Panel</h1>
      {sesion && <p className="text-sm text-muted-foreground mb-4">Logueado como: <strong>{sesion.email}</strong></p>}
      <p>Aquí puedes ver tus citas, historial médico y perfil.</p>
    </div>
  )
}
