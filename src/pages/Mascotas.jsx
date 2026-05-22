import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Plus, Edit2, Trash2, PawPrint } from 'lucide-react'
import { loadJSON, pushLog, setMascotas, storageEvents } from '@/lib/storage'

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Reptil', 'Otro']
const DOCUMENTOS = ['DNI', 'CE']

function getInitials(nombre) {
  return `${nombre || ''}`
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'M'
}

function getEstadoMascota(estado) {
  const normalized = String(estado || 'activo').toLowerCase()

  if (normalized === 'activo') {
    return 'bg-emerald-100 text-emerald-700'
  }

  return 'bg-rose-100 text-rose-700'
}

export default function Mascotas({ sesion }) {
  const [mascotas, setMascotasState] = useState(() => loadJSON('mascotas', []))
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [selectedMascota, setSelectedMascota] = useState(null)
  const [formData, setFormData] = useState({
    nombreMascota: '',
    especie: 'Perro',
    nombreDueno: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    direccion: '',
  })

  useEffect(() => {
    const syncMascotas = (event) => setMascotasState(event.detail || loadJSON('mascotas', []))
    storageEvents.addEventListener('mascotas', syncMascotas)
    return () => storageEvents.removeEventListener('mascotas', syncMascotas)
  }, [])

  const resetForm = () => {
    setSelectedMascota(null)
    setFormData({
      nombreMascota: '',
      especie: 'Perro',
      nombreDueno: '',
      tipoDocumento: 'DNI',
      numeroDocumento: '',
      direccion: '',
      estado: 'activo',
    })
  }

  const handleAddMascota = () => {
    resetForm()
    setOpenDialog(true)
  }

  const handleEditMascota = (mascota) => {
    setSelectedMascota(mascota)
    setFormData({
      nombreMascota: mascota.nombreMascota || '',
      especie: mascota.especie || 'Perro',
      nombreDueno: mascota.nombreDueno || '',
      tipoDocumento: mascota.tipoDocumento || 'DNI',
      numeroDocumento: mascota.numeroDocumento || '',
      direccion: mascota.direccion || '',
      estado: mascota.estado || 'activo',
    })
    setOpenDialog(true)
  }

  const handleViewMascota = (mascota) => {
    setSelectedMascota(mascota)
    setOpenDetailDialog(true)
  }

  const handleSaveMascota = () => {
    if (!formData.nombreMascota || !formData.especie || !formData.nombreDueno || !formData.tipoDocumento || !formData.numeroDocumento || !formData.direccion) {
      window.alert('Completa todos los campos de la mascota.')
      return
    }

    const numero = String(formData.numeroDocumento || '')
    if (formData.tipoDocumento === 'DNI' && numero.length !== 8) {
      window.alert('El DNI debe tener 8 dígitos.')
      return
    }
    if (formData.tipoDocumento === 'CE' && numero.length !== 9) {
      window.alert('El CE debe tener 9 dígitos.')
      return
    }

    if (selectedMascota) {
      const updated = mascotas.map((mascota) =>
        mascota.id === selectedMascota.id ? { ...mascota, ...formData } : mascota,
      )
      setMascotasState(updated)
      setMascotas(updated)
      pushLog({
        usuario: sesion?.email || 'sistema',
        accion: 'Editó mascota',
        detalle: `Actualizó a ${formData.nombreMascota} de ${formData.nombreDueno}`,
      })
    } else {
      const nuevo = {
        id: Date.now(),
        ...formData,
      }
      const updated = [...mascotas, nuevo]
      setMascotasState(updated)
      setMascotas(updated)
      pushLog({
        usuario: sesion?.email || 'sistema',
        accion: 'Creó mascota',
        detalle: `Registró a ${formData.nombreMascota} de ${formData.nombreDueno}`,
      })
    }

    setOpenDialog(false)
    resetForm()
  }

  const handleDeleteMascota = () => {
    if (!selectedMascota) return

    const updated = mascotas.filter((mascota) => mascota.id !== selectedMascota.id)
    setMascotasState(updated)
    setMascotas(updated)
    pushLog({
      usuario: sesion?.email || 'sistema',
      accion: 'Eliminó mascota',
      detalle: `Eliminó a ${selectedMascota.nombreMascota}`,
    })
    setOpenDeleteAlert(false)
    setSelectedMascota(null)
  }

  const handleToggleEstado = (mascota) => {
    const nuevoEstado = (mascota.estado || 'activo') === 'activo' ? 'inactivo' : 'activo'
    const updated = mascotas.map((item) => (item.id === mascota.id ? { ...item, estado: nuevoEstado } : item))

    setMascotasState(updated)
    setMascotas(updated)
    pushLog({
      usuario: sesion?.email || 'sistema',
      accion: 'Cambió estado mascota',
      detalle: `${mascota.nombreMascota} pasó a ${nuevoEstado}`,
    })
  }

  const DetailBlock = ({ title, value }) => (
    <div className="rounded-2xl border border-[#0ebccc]/15 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#eb008f]">{title}</div>
      <div className="mt-1 text-sm font-medium text-[#0f2f3a]">{value || '-'}</div>
    </div>
  )

  const inputClassName = 'h-11 rounded-xl border-[#0ebccc]/25 bg-white'

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
              <PawPrint className="h-3.5 w-3.5" /> Mascotas
            </div>
            <h1 className="mt-3 text-3xl font-bold text-[#0f2f3a]">Registro de mascotas</h1>
          </div>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleAddMascota} className="h-11 rounded-xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                <Plus className="mr-2 h-4 w-4" /> Nueva mascota
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#0ebccc]/20 bg-white/95 p-6 shadow-[0_30px_90px_rgba(14,188,204,0.16)]">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#0f2f3a]">{selectedMascota ? 'Editar' : 'Registrar'} mascota</DialogTitle>
                <DialogDescription className="text-[#0f2f3a]/70">
                  Completa la información de la mascota y su dueño.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 pt-2">
                <section className="rounded-3xl border border-[#0ebccc]/20 bg-[#fefefe] p-4 shadow-sm">
                  <div className="mb-4 inline-flex items-center rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
                    Mascota
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nombreMascota" className="text-sm font-medium text-[#0f2f3a]">Nombre de la mascota</Label>
                      <Input
                        id="nombreMascota"
                        value={formData.nombreMascota}
                        onChange={(e) => setFormData({ ...formData, nombreMascota: e.target.value })}
                        placeholder="Luna"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="especie" className="text-sm font-medium text-[#0f2f3a]">Especie de la mascota</Label>
                      <Select value={formData.especie} onValueChange={(value) => setFormData({ ...formData, especie: value })}>
                        <SelectTrigger id="especie" className="border-[#0ebccc]/25 bg-white text-left">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESPECIES.map((especie) => (
                            <SelectItem key={especie} value={especie}>{especie}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="direccion" className="text-sm font-medium text-[#0f2f3a]">Dirección</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        placeholder="Av. Los Álamos 123"
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-[#0ebccc]/20 bg-[#fefefe] p-4 shadow-sm">
                  <div className="mb-4 inline-flex items-center rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
                    Dueño
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nombreDueno" className="text-sm font-medium text-[#0f2f3a]">Nombre del dueño</Label>
                      <Input
                        id="nombreDueno"
                        value={formData.nombreDueno}
                        onChange={(e) => setFormData({ ...formData, nombreDueno: e.target.value })}
                        placeholder="Ana Pérez"
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipoDocumento" className="text-sm font-medium text-[#0f2f3a]">Tipo de documento</Label>
                      <Select value={formData.tipoDocumento} onValueChange={(value) => setFormData({ ...formData, tipoDocumento: value })}>
                        <SelectTrigger id="tipoDocumento" className="border-[#0ebccc]/25 bg-white text-left">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENTOS.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="numeroDocumento" className="text-sm font-medium text-[#0f2f3a]">Número de documento</Label>
                      <Input
                        id="numeroDocumento"
                        value={formData.numeroDocumento}
                        onChange={(e) => {
                          const digitsOnly = formData.tipoDocumento === 'Pasaporte'
                          const normalized = digitsOnly ? e.target.value.replace(/[^0-9A-Za-z]/g, '') : e.target.value.replace(/\D/g, '')
                          const maxLength = formData.tipoDocumento === 'DNI' ? 8 : formData.tipoDocumento === 'CE' ? 9 : 12
                          setFormData({ ...formData, numeroDocumento: normalized.slice(0, maxLength) })
                        }}
                        maxLength={formData.tipoDocumento === 'DNI' ? 8 : formData.tipoDocumento === 'CE' ? 9 : 12}
                        placeholder={formData.tipoDocumento === 'DNI' ? '8 dígitos' : formData.tipoDocumento === 'CE' ? '9 dígitos' : 'Hasta 12 caracteres'}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-2">
                  <Button onClick={handleSaveMascota} className="h-11 w-full rounded-xl bg-[#eb008f] text-white hover:bg-[#c9007a]">
                    {selectedMascota ? 'Actualizar' : 'Registrar'} mascota
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-4 shadow-[0_24px_80px_rgba(14,188,204,0.08)]">
        <div className="overflow-hidden rounded-2xl border border-[#0ebccc]/15">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#fefefe]">
                <TableHead className="w-24">Avatar</TableHead>
                <TableHead>Nombre de la mascota</TableHead>
                <TableHead>Dueño</TableHead>
                <TableHead>Especie</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mascotas.length > 0 ? (
                mascotas.map((mascota) => (
                  <TableRow key={mascota.id}>
                    <TableCell>
                      <Avatar className="h-11 w-11 border border-[#0ebccc]/20">
                        <AvatarFallback className="bg-gradient-to-br from-[#0ebccc] to-[#eb008f] text-sm font-semibold text-white">
                          {getInitials(mascota.nombreMascota)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-[#0f2f3a]">{mascota.nombreMascota}</TableCell>
                    <TableCell className="text-[#0f2f3a]/80">{mascota.nombreDueno}</TableCell>
                    <TableCell className="text-[#0f2f3a]/80">{mascota.especie}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getEstadoMascota(mascota.estado)}`}>
                        {mascota.estado || 'activo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewMascota(mascota)} className="gap-2">
                            <PawPrint size={14} /> Ver más
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditMascota(mascota)} className="gap-2">
                            <Edit2 size={14} /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleEstado(mascota)} className="gap-2">
                            <PawPrint size={14} /> {mascota.estado === 'activo' ? 'Marcar inactivo' : 'Marcar activo'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMascota(mascota)
                              setOpenDeleteAlert(true)
                            }}
                            className="gap-2 text-red-600"
                          >
                            <Trash2 size={14} /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-sm text-[#0f2f3a]/70">
                    No hay mascotas registradas todavía. Usa el botón Nueva mascota para crear la primera.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#0ebccc]/20 bg-white/95 p-6 shadow-[0_30px_90px_rgba(14,188,204,0.16)]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#0f2f3a]">Detalle de mascota</DialogTitle>
            <DialogDescription className="text-[#0f2f3a]/70">
              Revisa toda la información registrada para esta mascota.
            </DialogDescription>
          </DialogHeader>

          {selectedMascota && (
            <div className="grid gap-4 pt-2 md:grid-cols-2">
              <DetailBlock title="Nombre de la mascota" value={selectedMascota.nombreMascota} />
              <DetailBlock title="Especie" value={selectedMascota.especie} />
              <DetailBlock title="Estado" value={(selectedMascota.estado || 'activo').toUpperCase()} />
              <DetailBlock title="Nombre del dueño" value={selectedMascota.nombreDueno} />
              <DetailBlock title="Tipo de documento" value={selectedMascota.tipoDocumento} />
              <DetailBlock title="Número de documento" value={selectedMascota.numeroDocumento} />
              <div className="rounded-2xl border border-[#0ebccc]/15 bg-white p-4 md:col-span-2 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#eb008f]">Dirección</div>
                <div className="mt-1 text-sm font-medium text-[#0f2f3a]">{selectedMascota.direccion || '-'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteAlert} onOpenChange={setOpenDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a <strong>{selectedMascota?.nombreMascota || ''}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMascota} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
