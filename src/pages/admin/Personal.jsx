import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Personal() {
  const navigate = useNavigate()

  return (
    <div className="page card space-y-6">
      <div>
        <h1>Gestión de personal y accesos</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Configura usuarios, roles y controla la actividad dentro del sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">Gestión de usuarios</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea, edita y administra cuentas de usuario para el equipo de veterinaria.
          </p>
        </div>
        <div className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">Control de acceso</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Define roles y permisos para limitar accesos según funciones.
          </p>
        </div>
        <div className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">Registro de actividades</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisa el historial de acciones importantes realizadas por el personal.
          </p>
        </div>
      </div>

      <Button onClick={() => navigate('/administrador')} className="w-full md:w-auto">
        Volver al panel administrativo
      </Button>
    </div>
  )
}
