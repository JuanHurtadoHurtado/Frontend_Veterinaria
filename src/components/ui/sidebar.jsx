import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AUTH_SERVICE } from '@/services/auth'
import { LogOut } from 'lucide-react'

export default function Sidebar({ sesion }) {
  const navigate = useNavigate()
  if (!sesion) return null

  const handleLogout = () => {
    AUTH_SERVICE.cerrarSesion()
    navigate('/login')
  }

  const usuarioLogueado = AUTH_SERVICE.obtenerUsuarios().find((user) => user.email === sesion.email)
  const nombreCompleto = `${usuarioLogueado?.nombres || ''} ${usuarioLogueado?.apellidos || ''}`.trim() || sesion.email

  const initials = `${usuarioLogueado?.nombres || sesion?.email || ''}`
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

  const sectionsByRole = {
    administrador: [
      { label: 'Usuarios', to: '/administrador/personal/usuarios' },
      { label: 'Veterinarios', to: '/administrador/veterinarios' },
      { label: 'Mascotas', to: '/administrador/mascotas' },
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
      { label: 'Mascotas', to: '/recepcionista/mascotas' },
      { label: 'Registrar usuario', to: '/recepcionista/registrar' },
      { label: 'Facturación', to: '/recepcionista/facturacion' },
    ],
    usuario: [
      { label: 'Mi perfil', to: '/usuario' },
    ],
  }

  const items = sectionsByRole[sesion.rol] || []

  return (
    <aside className="flex h-screen w-72 flex-col overflow-y-auto border-r border-[#0ebccc]/20 bg-gradient-to-b from-white via-[#fcd8fa]/30 to-white p-4 shadow-[8px_0_30px_rgba(14,188,204,0.08)]">
      

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

      <div className="mt-auto pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-2xl border border-[#0ebccc]/20 bg-white/90 p-3 text-left shadow-sm transition hover:bg-[#fcd8fa]">
              <Avatar className="h-11 w-11 border border-[#0ebccc]/20">
                <AvatarFallback className="bg-gradient-to-br from-[#0ebccc] to-[#eb008f] text-sm font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-[#0f2f3a]">{nombreCompleto}</div>
                <div className="truncate text-xs text-[#0f2f3a]/70 capitalize">{sesion.rol}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
