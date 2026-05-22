export default function Usuario({ sesion }) {
  return (
    <div className="w-full space-y-6">
      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
          Usuario
        </div>
        <h1 className="mt-3 text-3xl font-bold text-[#0f2f3a]">Mi Panel</h1>
        {sesion && (
          <p className="mt-2 text-sm text-[#0f2f3a]/70">
            Logueado como: <strong>{sesion.email}</strong>
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,188,204,0.08)]">
        <p className="text-sm text-[#0f2f3a]/80">Aquí puedes ver tus citas, historial médico y perfil.</p>
      </div>
    </div>
  )
}
