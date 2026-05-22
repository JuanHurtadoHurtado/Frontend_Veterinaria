import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { loadJSON, setPermisos } from '@/lib/storage'

const PERMISOS_POR_ROL = {
  administrador: [
    { id: 'user_management', nombre: 'Gestión de Usuarios', descripcion: 'Crear, editar, eliminar usuarios' },
    { id: 'role_management', nombre: 'Gestión de Roles', descripcion: 'Modificar roles y permisos' },
    { id: 'view_reports', nombre: 'Ver Reportes', descripcion: 'Acceso a todos los reportes' },
    { id: 'financial_management', nombre: 'Gestión Financiera', descripcion: 'Facturación y pagos' },
    { id: 'vet_management', nombre: 'Gestión de Veterinarios', descripcion: 'Administrar veterinarios' },
    { id: 'document_management', nombre: 'Gestión Documental', descripcion: 'Organizar documentos clínicos' },
    { id: 'system_logs', nombre: 'Ver Logs', descripcion: 'Acceso a registro de actividades' },
  ],
  veterinario: [
    { id: 'view_patients', nombre: 'Ver Pacientes', descripcion: 'Listar y ver detalles de mascotas' },
    { id: 'clinical_records', nombre: 'Registros Clínicos', descripcion: 'Crear y editar historiales' },
    { id: 'schedule', nombre: 'Agenda', descripcion: 'Ver y gestionar citas' },
    { id: 'view_reports', nombre: 'Ver Reportes', descripcion: 'Ver reportes de pacientes' },
  ],
  recepcionista: [
    { id: 'view_patients', nombre: 'Ver Pacientes', descripcion: 'Listar y ver detalles de mascotas' },
    { id: 'schedule', nombre: 'Agenda', descripcion: 'Agendar citas' },
    { id: 'contact_management', nombre: 'Gestión de Contactos', descripcion: 'Actualizar datos de propietarios' },
  ],
}

export default function ControlAcceso() {
  const [rolSeleccionado, setRolSeleccionado] = useState('administrador')
  const [permisos, setPermisosLocal] = useState(() => {
    const stored = loadJSON('permisos', {})
    if (stored && stored['administrador']) return stored['administrador']
    return PERMISOS_POR_ROL.administrador.reduce((acc, p) => { acc[p.id] = true; return acc }, {})
  })

  useEffect(() => {
    // ensure storage has entry for current role on mount
    const all = loadJSON('permisos', {})
    if (!all[rolSeleccionado]) {
      all[rolSeleccionado] = permisos
      setPermisos(all)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePermiso = (permisoId) => {
    const updated = { ...permisos, [permisoId]: !permisos[permisoId] }
    setPermisosLocal(updated)
    const all = loadJSON('permisos', {})
    all[rolSeleccionado] = updated
    setPermisos(all)
  }

  const handleRolChange = (nuevoRol) => {
    setRolSeleccionado(nuevoRol)
    const stored = loadJSON('permisos', {})
    if (stored && stored[nuevoRol]) {
      setPermisosLocal(stored[nuevoRol])
      return
    }
    const permisosDelRol = PERMISOS_POR_ROL[nuevoRol]
    const inicial = permisosDelRol.reduce((acc, p) => { acc[p.id] = true; return acc }, {})
    setPermisosLocal(inicial)
    const all = loadJSON('permisos', {})
    all[nuevoRol] = inicial
    setPermisos(all)
  }

  const permisosActuales = PERMISOS_POR_ROL[rolSeleccionado] || []
  const permisosOtorgados = Object.entries(permisos).filter(([_, value]) => value).length

  const getRolColor = (rol) => {
    const colors = {
      administrador: 'bg-red-100 text-red-800',
      veterinario: 'bg-blue-100 text-blue-800',
      recepcionista: 'bg-green-100 text-green-800',
    }
    return colors[rol] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="rol-select" className="text-base mb-2 block">Seleccionar Rol</Label>
          <Select value={rolSeleccionado} onValueChange={handleRolChange}>
            <SelectTrigger id="rol-select" className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(PERMISOS_POR_ROL).map(rol => (
                <SelectItem key={rol} value={rol}>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getRolColor(rol)}`}>
                    {rol.charAt(0).toUpperCase() + rol.slice(1)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-2">Permisos Otorgados</p>
          <Badge className="text-lg px-3 py-1">
            {permisosOtorgados}/{permisosActuales.length}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3">
        {permisosActuales.map(permiso => (
          <Card key={permiso.id} className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Switch
                      id={permiso.id}
                      checked={permisos[permiso.id] || false}
                      onCheckedChange={() => handlePermiso(permiso.id)}
                    />
                    <div>
                      <Label htmlFor={permiso.id} className="text-base font-semibold cursor-pointer">
                        {permiso.nombre}
                      </Label>
                      <p className="text-sm text-muted-foreground">{permiso.descripcion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Nota:</strong> Los permisos se guardan en localStorage y se aplican al rol seleccionado.
        </p>
      </div>
    </div>
  )
}
