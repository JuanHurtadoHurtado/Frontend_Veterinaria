import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AUTH_SERVICE } from '@/services/auth'
import {
  Activity,
  CalendarDays,
  FileText,
  FolderKanban,
  HeartPulse,
  LogOut,
  MessageCircleMore,
  PawPrint,
  ReceiptText,
  ShieldCheck,
  Stethoscope,
  UserCircle2,
  UserPlus,
  Users,
} from 'lucide-react'

export default function Sidebar({ sesion }) {
  const navigate = useNavigate()
  const location = useLocation()
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
      { label: 'Usuarios', to: '/administrador/personal/usuarios', icon: Users },
      { label: 'Veterinarios', to: '/administrador/veterinarios', icon: Stethoscope },
      { label: 'Mascotas', to: '/administrador/mascotas', icon: PawPrint },
      { label: 'Registro de actividades', to: '/administrador/personal/logs', icon: Activity },
      { label: 'Documentos', to: '/administrador/clinica/documentos', icon: FileText },
      { label: 'Seguimiento clínico', to: '/administrador/clinica/seguimiento', icon: HeartPulse },
    ],
    veterinario: [
      { label: 'Atención clínica', to: '/veterinario/atencion', icon: Stethoscope },
      { label: 'Gestión documental', to: '/veterinario/documental', icon: FolderKanban },
      { label: 'Agenda', to: '/veterinario/agenda', icon: CalendarDays },
      { label: 'Comunicación', to: '/veterinario/comunicacion', icon: MessageCircleMore },
    ],
    recepcionista: [
      { label: 'Mascotas', to: '/recepcionista/mascotas', icon: PawPrint },
      { label: 'Registrar usuario', to: '/recepcionista/registrar', icon: UserPlus },
      { label: 'Facturación', to: '/recepcionista/facturacion', icon: ReceiptText },
    ],
    usuario: [
      { label: 'Mi perfil', to: '/usuario', icon: UserCircle2 },
    ],
  }

  const items = sectionsByRole[sesion.rol] || []

  return (
    <aside className="flex h-screen w-72 flex-col overflow-y-auto border-r border-[#0ebccc]/20 bg-gradient-to-b from-white via-[#fcd8fa]/30 to-white p-4 shadow-[8px_0_30px_rgba(14,188,204,0.08)]">
      

      <nav className="space-y-2">
        {items.map((it) => {
          const Icon = it.icon
          const isActive = location.pathname === it.to || location.pathname.startsWith(`${it.to}/`)

          return (
            <Button
              key={it.to}
              variant="ghost"
              className={`group w-full justify-start gap-3 rounded-2xl border px-3 py-2.5 text-[#0f2f3a] transition-all ${
                isActive
                  ? 'border-[#0ebccc]/45 bg-gradient-to-r from-[#0ebccc]/15 to-[#eb008f]/15 shadow-[0_10px_24px_rgba(14,188,204,0.16)]'
                  : 'border-transparent bg-transparent hover:-translate-y-0.5 hover:border-[#0ebccc]/35 hover:bg-gradient-to-r hover:from-[#0ebccc]/8 hover:to-[#eb008f]/10 hover:shadow-[0_8px_20px_rgba(14,188,204,0.10)]'
              }`}
              onClick={() => navigate(it.to)}
            >
              {Icon && <Icon className={`h-4 w-4 ${isActive ? 'text-[#eb008f]' : 'text-[#0ebccc] group-hover:text-[#eb008f]'}`} />}
              {it.label}
            </Button>
          )
        })}
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
