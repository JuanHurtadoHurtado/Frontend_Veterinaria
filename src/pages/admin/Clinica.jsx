import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function Clinica() {
  const navigate = useNavigate()

  return (
    <div className="page card space-y-6">
      <div>
        <h1>Gestión clínica y documental</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Organiza la información médica y los documentos clave del centro.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">Organización de documentos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Clasifica expedientes clínicos, formularios e informes médicos.
          </p>
        </div>
        <div className="rounded-xl border p-4 bg-background shadow-sm">
          <h2 className="text-lg font-semibold">Seguimiento de enfermedades</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Controla diagnósticos, tratamientos y evolución de casos clínicos.
          </p>
        </div>
      </div>

      <Button onClick={() => navigate('/administrador')} className="w-full md:w-auto">
        Volver al panel administrativo
      </Button>
    </div>
  )
}
