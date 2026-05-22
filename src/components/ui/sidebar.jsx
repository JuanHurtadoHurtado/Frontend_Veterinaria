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
    <aside className="w-72 border-r border-[#0ebccc]/20 bg-gradient-to-b from-white via-[#fcd8fa]/30 to-white p-4 min-h-[calc(100vh-140px)] shadow-[8px_0_30px_rgba(14,188,204,0.08)]">
      <div className="mb-6 rounded-2xl border border-[#0ebccc]/20 bg-white/85 p-4 backdrop-blur">
        <div className="text-xs uppercase tracking-[0.18em] text-[#eb008f]">Conectado como</div>
        <div className="mt-1 font-semibold text-[#0f2f3a]">{sesion.email}</div>
        <div className="text-xs text-[#0f2f3a]/70">{sesion.rol}</div>
      </div>

      <nav className="space-y-2">
        {items.map((it) => (
          <Button
            key={it.to}
            variant="ghost"
            className="w-full justify-start rounded-2xl border border-transparent bg-white/70 text-[#0f2f3a] shadow-sm transition-all hover:border-[#0ebccc]/30 hover:bg-[#fcd8fa] hover:text-[#eb008f]"
            onClick={() => navigate(it.to)}
          >
            {it.label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
