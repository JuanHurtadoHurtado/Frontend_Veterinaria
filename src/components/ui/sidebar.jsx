import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Sidebar({ sesion }) {
  const navigate = useNavigate()
  if (!sesion) return null

  const sectionsByRole = {
    administrador: [
      { label: 'Usuarios', to: '/administrador/personal/usuarios' },
      { label: 'Control de acceso', to: '/administrador/personal/permisos' },
      { label: 'Registro de actividades', to: '/administrador/personal/logs' },
      { label: 'Documentos', to: '/administrador/clinica/documentos' },
      { label: 'Seguimiento clínico', to: '/administrador/clinica/seguimiento' },
    ],
    veterinario: [
      { label: 'Atención clínica', to: '/veterinario/atencion' },
      { label: 'Gestión documental', to: '/veterinario/documental' },
      { label: 'Agenda', to: '/veterinario/agenda' },
      { label: 'Comunicación', to: '/veterinario/comunicacion' },
    ],
    recepcionista: [
      { label: 'Registrar usuario', to: '/recepcionista/registrar' },
      { label: 'Facturación', to: '/recepcionista/facturacion' },
    ],
    usuario: [
      { label: 'Mi perfil', to: '/usuario' },
    ],
  }

  const items = sectionsByRole[sesion.rol] || []

  return (
    <aside className="w-64 border-r bg-surface p-4 min-h-[calc(100vh-140px)]">
      <div className="mb-6">
        <div className="text-sm text-muted-foreground">Conectado como</div>
        <div className="font-medium">{sesion.email}</div>
        <div className="text-xs text-muted-foreground">{sesion.rol}</div>
      </div>

      <nav className="space-y-2">
        {items.map((it) => (
          <Button
            key={it.to}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate(it.to)}
          >
            {it.label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
