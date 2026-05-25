import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { storageEvents, loadJSON, saveJSON, pushLog } from '@/lib/storage'
import { Filter, MoreHorizontal, Plus, Search, Stethoscope, UserCircle2, MapPin, ShieldCheck } from 'lucide-react'

const GROUPED_SPECIALTIES = {
  'Medicina clínica': [
    'Medicina general',
    'Dermatología',
    'Cardiología',
    'Neurología',
    'Nutrición',
    'Etología',
  ],
  'Cirugía': [
    'Cirugía básica',
    'Esterilizaciones',
    'Traumatología',
    'Ortopedia',
    'Neurocirugía',
  ],
  'Diagnóstico': [
    'Laboratorio clínico',
    'Radiografías',
    'Ecografías',
    'Patología',
    'Análisis de sangre',
  ],
  'Emergencias y cuidados intensivos': [
    'Primeros auxilios',
    'Trauma',
    'Shock',
    'Hospitalización',
    'UCI veterinaria',
  ],
}

const BRANCHES = ['Sucursal norte', 'Sucursal sur']
const STATUS_OPTIONS = ['activo', 'inactivo']

function getDisplayName(user) {
  return `${user?.nombres || ''} ${user?.apellidos || ''}`.trim()
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export default function Veterinarios({ sesion }) {
  const [usuarios, setUsuarios] = useState(() => loadJSON('usuarios', []))
  const [veterinarios, setVeterinarios] = useState(() => loadJSON('veterinarios', []))
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedVet, setSelectedVet] = useState(null)
  const [selectedVetId, setSelectedVetId] = useState(null)
  const [formData, setFormData] = useState({
    usuarioId: '',
    especialidades: [],
    sucursal: 'Sucursal norte',
    fotoUrl: '',
  })

  useEffect(() => {
    const syncUsers = (event) => setUsuarios(event.detail || loadJSON('usuarios', []))
    const syncVets = (event) => setVeterinarios(event.detail || loadJSON('veterinarios', []))

    storageEvents.addEventListener('usuarios', syncUsers)
    storageEvents.addEventListener('veterinarios', syncVets)

    return () => {
      storageEvents.removeEventListener('usuarios', syncUsers)
      storageEvents.removeEventListener('veterinarios', syncVets)
    }
  }, [])

  // Migrate older single-string "especialidad" -> array "especialidades"
  useEffect(() => {
    const raw = loadJSON('veterinarios', [])
    let migrated = false
    const normalized = raw.map((vet) => {
      if (vet.especialidades) return vet
      migrated = migrated || Boolean(vet.especialidad)
      return { ...vet, especialidades: vet.especialidad ? [vet.especialidad] : [] }
    })
    if (migrated) {
      setVeterinarios(normalized)
      saveJSON('veterinarios', normalized)
    }
  }, [])

  const veterinarianUsers = useMemo(
    () => usuarios.filter((user) => String(user.rol || '').toLowerCase() === 'veterinario'),
    [usuarios],
  )

  const assignedVeterinarianIds = useMemo(
    () => new Set(veterinarios.map((vet) => String(vet.usuarioId))),
    [veterinarios],
  )

  const availableVeterinarianUsers = useMemo(() => {
    return veterinarianUsers.filter((user) => {
      const userId = String(user.id)
      return !assignedVeterinarianIds.has(userId) || userId === String(formData.usuarioId)
    })
  }, [assignedVeterinarianIds, formData.usuarioId, veterinarianUsers])

  const vetUsersMap = useMemo(() => {
    return veterinarianUsers.reduce((acc, user) => {
      acc[user.id] = user
      return acc
    }, {})
  }, [veterinarianUsers])

  const flatSpecialties = useMemo(() => Object.values(GROUPED_SPECIALTIES).flat(), [])

  const specialtiesAvailable = useMemo(() => {
    const created = veterinarios.flatMap((vet) => vet.especialidades || [])
    return Array.from(new Set([...flatSpecialties, ...created]))
  }, [veterinarios, flatSpecialties])

  const vetCards = useMemo(() => {
    const query = search.trim().toLowerCase()

    return veterinarios
      .map((vet) => {
        const user = vetUsersMap[vet.usuarioId] || null
        const nombreCompleto = vet.nombreCompleto || getDisplayName(user)
        return {
          ...vet,
          user,
          nombreCompleto,
        }
      })
      .filter((vet) => {
        const matchesSearch =
          !query ||
          [vet.nombreCompleto, (vet.especialidades || []).join(' '), vet.sucursal, vet.estado]
            .join(' ')
            .toLowerCase()
            .includes(query)

        const matchesSpecialty =
          specialtyFilter === 'all' || (vet.especialidades || []).includes(specialtyFilter)
        const matchesStatus = statusFilter === 'all' || vet.estado === statusFilter
        const matchesBranch = branchFilter === 'all' || vet.sucursal === branchFilter

        return matchesSearch && matchesSpecialty && matchesStatus && matchesBranch
      })
  }, [branchFilter, search, specialtyFilter, statusFilter, veterinarios, vetUsersMap])

  const resetForm = () => {
    setSelectedVetId(null)
    setFormData({
      usuarioId: '',
      especialidades: [],
      sucursal: 'Sucursal norte',
      fotoUrl: '',
    })
  }

  const openCreateForm = () => {
    resetForm()
    setFormOpen(true)
  }

  const openEditForm = (vet) => {
    setSelectedVetId(vet.id)
    setFormData({
      usuarioId: vet.usuarioId ? String(vet.usuarioId) : '',
      especialidades: vet.especialidades || [],
      sucursal: vet.sucursal || 'Sucursal norte',
      fotoUrl: vet.fotoUrl || '',
    })
    setFormOpen(true)
  }

  const handleSaveVet = () => {
    const selectedUser = veterinarianUsers.find((user) => String(user.id) === String(formData.usuarioId))
    if (!selectedUser || !(formData.especialidades && formData.especialidades.length) || !formData.sucursal) return

    const baseRecord = {
      usuarioId: selectedUser.id,
      nombreCompleto: getDisplayName(selectedUser),
      documentoTipo: selectedUser.documentoTipo || '',
      documentoNumero: selectedUser.documentoNumero || '',
      fechaNacimiento: selectedUser.fechaNacimiento || '',
      telefono: selectedUser.telefono || '',
      email: selectedUser.email || '',
      rol: selectedUser.rol || 'veterinario',
      especialidades: formData.especialidades,
      sucursal: formData.sucursal,
      estado: selectedVetId ? veterinarios.find((vet) => vet.id === selectedVetId)?.estado || 'activo' : 'activo',
      fotoUrl: formData.fotoUrl || '',
    }

    let updated = []
    if (selectedVetId) {
      updated = veterinarios.map((vet) => (vet.id === selectedVetId ? { ...vet, ...baseRecord } : vet))
      pushLog({
        usuario: sesion?.email || 'sistema',
        accion: 'Editó veterinario',
        detalle: `Actualizó a ${baseRecord.nombreCompleto}`,
      })
    } else {
      const nuevo = {
        id: Date.now(),
        ...baseRecord,
      }
      updated = [...veterinarios, nuevo]
      pushLog({
        usuario: sesion?.email || 'sistema',
        accion: 'Creó veterinario',
        detalle: `Registró a ${baseRecord.nombreCompleto}`,
      })
    }

    setVeterinarios(updated)
    saveJSON('veterinarios', updated)
    setFormOpen(false)
    resetForm()
  }

  const handleToggleStatus = (vet) => {
    const updated = veterinarios.map((item) =>
      item.id === vet.id ? { ...item, estado: item.estado === 'activo' ? 'inactivo' : 'activo' } : item,
    )
    setVeterinarios(updated)
    saveJSON('veterinarios', updated)
    pushLog({
      usuario: sesion?.email || 'sistema',
      accion: 'Cambió estado veterinario',
      detalle: `${vet.nombreCompleto} pasó a ${vet.estado === 'activo' ? 'inactivo' : 'activo'}`,
    })
  }

  const handleViewDetail = (vet) => {
    setSelectedVet(vet)
    setDetailOpen(true)
  }

  const handleDeleteVet = (vet) => {
    const updated = veterinarios.filter((item) => item.id !== vet.id)
    setVeterinarios(updated)
    saveJSON('veterinarios', updated)
    pushLog({
      usuario: sesion?.email || 'sistema',
      accion: 'Eliminó veterinario',
      detalle: `Eliminó a ${vet.nombreCompleto}`,
    })
  }

  const DetailBlock = ({ title, value }) => (
    <div className="rounded-2xl border border-[#0ebccc]/20 bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-[#eb008f]">{title}</div>
      <div className="mt-1 text-sm font-medium text-[#0f2f3a]">{value || '-'}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
              Veterinarios
            </div>
            <h1 className="mt-3 text-3xl font-bold text-[#0f2f3a]">Gestión de veterinarios</h1>
          </div>
          <Button onClick={openCreateForm} className="h-11 rounded-xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
            <Plus className="mr-2 h-4 w-4" /> Crear veterinario
          </Button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Buscar</Label>
            <div className="flex items-center rounded-xl border border-[#0ebccc]/25 bg-white px-3 shadow-sm">
              <Search className="h-4 w-4 text-[#0ebccc]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, especialidad o sucursal"
                className="h-11 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Especialidad</Label>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-left">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {specialtiesAvailable.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-left">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Sucursal</Label>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-left">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {formOpen && (
        <Card className="rounded-3xl border border-[#0ebccc]/20 bg-white/95 shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
          <CardHeader>
            <CardTitle className="text-[#0f2f3a]">{selectedVetId ? 'Editar veterinario' : 'Crear nuevo veterinario'}</CardTitle>
            <CardDescription className="text-[#0f2f3a]/70">
              Selecciona el usuario veterinario y completa la especialidad y sucursal.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Nombre completo</Label>
              <Select value={formData.usuarioId} onValueChange={(value) => setFormData({ ...formData, usuarioId: value })}>
                <SelectTrigger className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-left">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {availableVeterinarianUsers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {getDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Especialidad</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="h-11 w-full rounded-xl border border-[#0ebccc]/25 bg-white text-left px-3 flex items-center text-sm">
                    {formData.especialidades && formData.especialidades.length > 0
                      ? (formData.especialidades || []).join(', ')
                      : 'Selecciona especialidades'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-h-72 overflow-auto">
                  {Object.entries(GROUPED_SPECIALTIES).map(([group, items]) => (
                    <div key={group} className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-[#0ebccc]">{group}</div>
                      <div className="flex flex-col gap-1 px-2">
                        {items.map((s) => (
                          <label key={s} className="inline-flex items-center gap-2">
                            <Checkbox
                              checked={(formData.especialidades || []).includes(s)}
                              onCheckedChange={(checked) => {
                                const curr = Array.isArray(formData.especialidades) ? formData.especialidades.slice() : []
                                if (checked) {
                                  if (!curr.includes(s)) curr.push(s)
                                } else {
                                  const idx = curr.indexOf(s)
                                  if (idx > -1) curr.splice(idx, 1)
                                }
                                setFormData({ ...formData, especialidades: curr })
                              }}
                            />
                            <span className="text-sm">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {/* dinámicas */}
                  {specialtiesAvailable
                    .filter((s) => !flatSpecialties.includes(s))
                    .map((s) => (
                      <label key={s} className="inline-flex items-center gap-2 px-2 py-1">
                        <Checkbox
                          checked={(formData.especialidades || []).includes(s)}
                          onCheckedChange={(checked) => {
                            const curr = Array.isArray(formData.especialidades) ? formData.especialidades.slice() : []
                            if (checked) {
                              if (!curr.includes(s)) curr.push(s)
                            } else {
                              const idx = curr.indexOf(s)
                              if (idx > -1) curr.splice(idx, 1)
                            }
                            setFormData({ ...formData, especialidades: curr })
                          }}
                        />
                        <span className="text-sm">{s}</span>
                      </label>
                    ))}
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Sucursal</Label>
              <Select value={formData.sucursal} onValueChange={(value) => setFormData({ ...formData, sucursal: value })}>
                <SelectTrigger className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-left">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Foto</Label>
              <Input
                value={formData.fotoUrl}
                onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                placeholder="URL opcional de foto"
                className="h-11 rounded-xl border-[#0ebccc]/25 bg-white"
              />
            </div>
            <div className="flex items-end gap-3 md:col-span-2 xl:col-span-3">
              <Button onClick={handleSaveVet} className="h-11 rounded-xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                Guardar veterinario
              </Button>
              <Button variant="outline" onClick={() => { setFormOpen(false); resetForm() }} className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-[#0f2f3a] hover:bg-[#fcd8fa]">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vetCards.map((vet) => {
          const initials = getInitials(vet.nombreCompleto)
          return (
            <Card key={vet.id} className="overflow-hidden rounded-3xl border border-[#0ebccc]/20 bg-white/95 shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
              <CardHeader className="flex flex-row items-center gap-4 border-b border-[#0ebccc]/10 bg-[#fefefe]">
                <Avatar className="h-16 w-16 border-2 border-[#0ebccc]/20 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-[#0ebccc] to-[#eb008f] text-base font-semibold text-white">
                    {initials || 'VT'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg text-[#0f2f3a]">{vet.nombreCompleto}</CardTitle>
                  <CardDescription className="mt-1 text-[#0f2f3a]/70">
                    {(vet.especialidades || []).join(', ')}
                  </CardDescription>
                </div>
                <Badge className={vet.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-100 text-rose-700 hover:bg-rose-100'}>
                  {vet.estado}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="grid gap-3 text-sm text-[#0f2f3a]">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-[#0ebccc]" />
                    <span className="font-medium">Especialidad:</span> <span className="text-[#0f2f3a]/75">{(vet.especialidades || []).join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#eb008f]" />
                    <span className="font-medium">Sucursal:</span> <span className="text-[#0f2f3a]/75">{vet.sucursal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#0ebccc]" />
                    <span className="font-medium">Estado:</span> <span className="text-[#0f2f3a]/75 capitalize">{vet.estado}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full border border-[#0ebccc]/15">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetail(vet)}>Ver más info</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditForm(vet)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(vet)}>
                        {vet.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {vetCards.length === 0 && (
        <Card className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
          <CardTitle className="text-[#0f2f3a]">No hay veterinarios registrados</CardTitle>
          <CardDescription className="mt-2 text-[#0f2f3a]/70">
            Usa el botón de crear veterinario para registrar el primero.
          </CardDescription>
        </Card>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="w-[400px] h-[802.7px] overflow-y-auto rounded-3xl border border-[#0ebccc]/20 bg-white/95 p-6 shadow-[0_30px_90px_rgba(14,188,204,0.16)]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#0f2f3a]">Detalle del veterinario</DialogTitle>
            <DialogDescription className="text-[#0f2f3a]/70">Información completa del usuario y del veterinario.</DialogDescription>
          </DialogHeader>
          {selectedVet && (
            <div className="grid gap-4 pt-2 grid-cols-1">
              <DetailBlock title="Nombre completo" value={selectedVet.nombreCompleto} />
              <DetailBlock title="Documento" value={`${selectedVet.documentoTipo || '-'} ${selectedVet.documentoNumero || ''}`.trim()} />
              <DetailBlock title="Fecha de nacimiento" value={selectedVet.fechaNacimiento} />
              <DetailBlock title="Teléfono" value={selectedVet.telefono} />
              <DetailBlock title="Correo" value={selectedVet.email} />
              <DetailBlock title="Rol" value={selectedVet.rol} />
              <DetailBlock title="Especialidad" value={(selectedVet.especialidades || []).join(', ')} />
              <DetailBlock title="Sucursal" value={selectedVet.sucursal} />
              <DetailBlock title="Estado" value={selectedVet.estado} />
              <div className="rounded-2xl border border-[#0ebccc]/20 bg-white p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-[#eb008f]">Foto</div>
                <div className="mt-3 flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-[#0ebccc]/20">
                    <AvatarFallback className="bg-gradient-to-br from-[#0ebccc] to-[#eb008f] text-lg font-semibold text-white">
                      {getInitials(selectedVet.nombreCompleto)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm text-[#0f2f3a]/70">
                    La foto se representa con un avatar mientras no exista una imagen cargada.
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
