import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Administrador({ sesion }) {
  const navigate = useNavigate()

  return (
    <div className="page card space-y-6">
      <div>
        <h1>Panel de Administrador</h1>
        {sesion && (
          <p className="text-sm text-muted-foreground mt-2">
            Logueado como: <strong>{sesion.email}</strong>
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">👥 Gestión de personal y accesos</h2>
          <p className="mt-2 text-sm text-muted-foreground">Usuarios, roles y registro de actividades.</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Gestión de usuarios</li>
            <li>• Control de acceso</li>
            <li>• Registro de actividades</li>
          </ul>
        </article>
        <article className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">🏥 Gestión clínica y documental</h2>
          <p className="mt-2 text-sm text-muted-foreground">Información médica y documentación clínica.</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Organización de documentos</li>
            <li>• Seguimiento de enfermedades</li>
          </ul>
        </article>
        <article className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">📊 Reportes, estadística y finanzas</h2>
          <p className="mt-2 text-sm text-muted-foreground">Datos numéricos, facturación y análisis.</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Reportes de gestión</li>
            <li>• Estadísticas</li>
            <li>• Gestión de pagos</li>
            <li>• Facturación</li>
          </ul>
        </article>
        <article className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">⚙️ Operaciones y coordinación</h2>
          <p className="mt-2 text-sm text-muted-foreground">Gestión veterinaria y logística del centro.</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Gestión de veterinarios</li>
            <li>• Sincronización de agenda</li>
            <li>• Gestión de tareas</li>
          </ul>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Button onClick={() => navigate('/administrador/personal')} className="w-full">
          Ir a Personal y accesos
        </Button>
        <Button onClick={() => navigate('/administrador/clinica')} className="w-full">
          Ir a Clínica y documentos
        </Button>
        <Button onClick={() => navigate('/administrador/reportes')} className="w-full">
          Ir a Reportes y finanzas
        </Button>
        <Button onClick={() => navigate('/administrador/operaciones')} className="w-full">
          Ir a Operaciones
        </Button>
      </div>
    </div>
  )
}
