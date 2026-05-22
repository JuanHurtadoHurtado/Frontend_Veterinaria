import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Administrador({ sesion }) {
  const navigate = useNavigate()

  return (
    <div className="page card space-y-6 admin-surface">
      <div>
        <div className="inline-flex items-center rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#eb008f]">
          Panel de Administrador
        </div>
        <h1 className="mt-4">Gestión central de la clínica</h1>
        {sesion && (
          <p className="text-sm mt-2">
            Logueado como: <strong>{sesion.email}</strong>
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="admin-card rounded-xl border p-4">
          <h2 className="text-lg font-semibold text-[#0f2f3a]">👥 Gestión de personal y accesos</h2>
          <p className="mt-2 text-sm">Usuarios, roles y registro de actividades.</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Gestión de usuarios</li>
            <li>• Control de acceso</li>
            <li>• Registro de actividades</li>
          </ul>
        </article>
        <article className="admin-card rounded-xl border p-4">
          <h2 className="text-lg font-semibold text-[#0f2f3a]">🏥 Gestión clínica y documental</h2>
          <p className="mt-2 text-sm">Información médica y documentación clínica.</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Organización de documentos</li>
            <li>• Seguimiento de enfermedades</li>
          </ul>
        </article>
        <article className="admin-card rounded-xl border p-4 md:col-span-2 xl:col-span-2">
          <h2 className="text-lg font-semibold text-[#0f2f3a]">Estado general</h2>
          <p className="mt-2 text-sm">Accede a las secciones del administrador desde la barra lateral para gestionar usuarios, permisos, documentos y seguimiento clínico.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-3 border border-[#0ebccc]/20">
              <div className="text-sm font-semibold text-[#eb008f]">Acceso rápido</div>
              <div className="text-sm mt-1">Usuarios, permisos y registros.</div>
            </div>
            <div className="rounded-2xl bg-white/80 p-3 border border-[#0ebccc]/20">
              <div className="text-sm font-semibold text-[#eb008f]">Clínica</div>
              <div className="text-sm mt-1">Documentos y seguimiento de enfermedades.</div>
            </div>
          </div>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Button onClick={() => navigate('/administrador/personal/usuarios')} className="w-full bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
          Usuarios
        </Button>
        <Button onClick={() => navigate('/administrador/personal/permisos')} className="w-full bg-[#eb008f] text-white hover:bg-[#c9007a]">
          Permisos
        </Button>
        <Button onClick={() => navigate('/administrador/personal/logs')} className="w-full bg-[#fcd8fa] text-[#eb008f] hover:bg-[#f6bff0]">
          Actividades
        </Button>
        <Button onClick={() => navigate('/administrador/clinica/documentos')} className="w-full border border-[#0ebccc] bg-white text-[#0f2f3a] hover:bg-[#fcd8fa]">
          Documentos
        </Button>
      </div>
    </div>
  )
}
