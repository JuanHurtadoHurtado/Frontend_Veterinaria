import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CalendarDays, Clock3, Edit2, Plus, Trash2, User2 } from 'lucide-react'
import { loadJSON, saveJSON, pushLog, storageEvents } from '@/lib/storage'

const SERVICIOS = ['Consulta general', 'Vacunación', 'Desparasitación', 'Urgencias', 'Control preventivo']
const ESTADOS = ['Programada', 'Confirmada', 'Atendida', 'Cancelada']

export default function Citas({ sesion }) {
  const isRecepcionista = sesion?.rol === 'recepcionista'
  const isAdministrador = sesion?.rol === 'administrador'
  const [citas, setCitas] = useState(() => loadJSON('citas', []))
  const [mascotasRegistradas, setMascotasRegistradas] = useState(() => loadJSON('mascotas', []))
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [selectedCita, setSelectedCita] = useState(null)
  const [formData, setFormData] = useState({
    cliente: '',
    mascotaId: '',
    mascota: '',
    fecha: '',
    hora: '',
    servicio: 'Consulta general',
    estado: 'Programada',
  })

  useEffect(() => {
    const handleCitasUpdate = (event) => setCitas(event.detail || loadJSON('citas', []))
    storageEvents.addEventListener('citas', handleCitasUpdate)
    return () => storageEvents.removeEventListener('citas', handleCitasUpdate)
  }, [])

  useEffect(() => {
    const handleMascotasUpdate = (event) => setMascotasRegistradas(event.detail || loadJSON('mascotas', []))
    storageEvents.addEventListener('mascotas', handleMascotasUpdate)
    return () => storageEvents.removeEventListener('mascotas', handleMascotasUpdate)
  }, [])

  const syncCitas = (updated) => {
    saveJSON('citas', updated)
    storageEvents.dispatchEvent(new CustomEvent('citas', { detail: updated }))
    setCitas(updated)
  }

  const resetForm = () => {
    setSelectedCita(null)
    setFormData({
      cliente: '',
      mascotaId: '',
      mascota: '',
      fecha: '',
      hora: '',
      servicio: 'Consulta general',
      estado: 'Programada',
    })
  }

  const canCreate = isRecepcionista
  const canEdit = isRecepcionista || isAdministrador

  const handleAddCita = () => {
    if (!canCreate) return
    resetForm()
    setOpenDialog(true)
  }

  const handleEditCita = (cita) => {
    setSelectedCita(cita)
    setFormData({
      cliente: cita.cliente || '',
      mascotaId: cita.mascotaId || '',
      mascota: cita.mascota || '',
      fecha: cita.fecha || '',
      hora: cita.hora || '',
      servicio: cita.servicio || 'Consulta general',
      estado: cita.estado || 'Programada',
    })
    setOpenDialog(true)
  }

  const handleSaveCita = () => {
    if (!formData.cliente || !formData.mascota || !formData.fecha || !formData.hora) {
      window.alert('Completa los campos requeridos de la cita.')
      return
    }

    const usuario = sesion?.email || 'sistema'
    const nuevoRegistro = {
      id: selectedCita?.id || Date.now(),
      ...formData,
    }

    const updated = selectedCita
      ? citas.map((cita) => (cita.id === selectedCita.id ? nuevoRegistro : cita))
      : [nuevoRegistro, ...citas]

    syncCitas(updated)
    pushLog({
      usuario,
      accion: selectedCita ? 'Editó cita' : 'Creó cita',
      detalle: `${formData.cliente} / ${formData.mascota} - ${formData.servicio}`,
    })

    setOpenDialog(false)
    resetForm()
  }

  const handleDeleteCita = () => {
    if (!selectedCita) return
    const updated = citas.filter((cita) => cita.id !== selectedCita.id)
    syncCitas(updated)
    pushLog({
      usuario: sesion?.email || 'sistema',
      accion: 'Eliminó cita',
      detalle: `${selectedCita.cliente} / ${selectedCita.mascota}`,
    })
    setOpenDeleteAlert(false)
    setSelectedCita(null)
  }

  const inputClassName = 'h-11 rounded-xl border-[#0ebccc]/25 bg-white'

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">
              <CalendarDays className="h-3.5 w-3.5" /> Citas
            </div>
            <h1 className="mt-3 text-3xl font-bold text-[#0f2f3a]">Gestión de citas</h1>
            <p className="mt-2 text-sm text-[#0f2f3a]/70">
              Administra reservas, fechas y estados desde un solo panel.
            </p>
          </div>

          {(canCreate || canEdit) ? (
            <>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                {canCreate ? (
                  <DialogTrigger asChild>
                    <Button onClick={handleAddCita} className="h-11 rounded-xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                      <Plus className="mr-2 h-4 w-4" /> Nueva cita
                    </Button>
                  </DialogTrigger>
                ) : null}

                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#0ebccc]/20 bg-white/95 p-6 shadow-[0_30px_90px_rgba(14,188,204,0.16)]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-[#0f2f3a]">{selectedCita ? 'Editar cita' : 'Registrar cita'}</DialogTitle>
                    <DialogDescription className="text-[#0f2f3a]/70">
                      Completa los datos del cliente, mascota y horario.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 pt-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cliente" className="text-sm font-medium text-[#0f2f3a]">Cliente</Label>
                      <Input
                        id="cliente"
                        value={formData.cliente}
                        onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                        placeholder="Nombre del cliente"
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mascota" className="text-sm font-medium text-[#0f2f3a]">Mascota</Label>
                      {mascotasRegistradas.length > 0 ? (
                        <Select
                          value={formData.mascotaId}
                          onValueChange={(value) => {
                            const mascotaSeleccionada = mascotasRegistradas.find((item) => String(item.id) === String(value))
                            setFormData({
                              ...formData,
                              mascotaId: value,
                              mascota: mascotaSeleccionada?.nombreMascota || '',
                              cliente: mascotaSeleccionada?.nombreDueno || formData.cliente,
                            })
                          }}
                        >
                          <SelectTrigger id="mascota" className={inputClassName}>
                            <SelectValue placeholder="Selecciona una mascota" />
                          </SelectTrigger>
                          <SelectContent>
                            {mascotasRegistradas.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.nombreMascota} — {item.nombreDueno}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="mascota"
                          value={formData.mascota}
                          onChange={(e) => setFormData({ ...formData, mascota: e.target.value })}
                          placeholder="Nombre de la mascota"
                          className={inputClassName}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha" className="text-sm font-medium text-[#0f2f3a]">Fecha</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hora" className="text-sm font-medium text-[#0f2f3a]">Hora</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={formData.hora}
                        onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servicio" className="text-sm font-medium text-[#0f2f3a]">Servicio</Label>
                      <Select value={formData.servicio} onValueChange={(value) => setFormData({ ...formData, servicio: value })}>
                        <SelectTrigger id="servicio" className={inputClassName}>
                          <SelectValue placeholder="Selecciona un servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICIOS.map((servicio) => (
                            <SelectItem key={servicio} value={servicio}>
                              {servicio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado" className="text-sm font-medium text-[#0f2f3a]">Estado</Label>
                      <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                        <SelectTrigger id="estado" className={inputClassName}>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button onClick={handleSaveCita} className="w-full sm:w-auto bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                      Guardar cita
                    </Button>
                    <Button variant="outline" onClick={() => setOpenDialog(false)} className="w-full sm:w-auto">
                      Cancelar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {!canCreate ? (
                <div className="rounded-3xl border border-[#f3d8f3]/40 bg-[#fff0fb]/80 p-5 text-sm text-[#0f2f3a]/80 shadow-sm">
                  Sólo el rol recepcionista puede crear nuevas citas; administradores pueden editar y eliminar.
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-3xl border border-[#f3d8f3]/40 bg-[#fff0fb]/80 p-5 text-sm text-[#0f2f3a]/80 shadow-sm">
              Sólo el rol recepcionista puede crear nuevas citas; administradores pueden editar y eliminar.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,188,204,0.12)]">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#eb008f]">Agenda</p>
            <h2 className="mt-3 text-2xl font-semibold text-[#0f2f3a]">Citas programadas</h2>
          </div>
          <div className="text-sm text-[#0f2f3a]/70">Total: {citas.length}</div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Mascota</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Estado</TableHead>
              {canEdit ? <TableHead>Acciones</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {citas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="text-center text-sm text-[#0f2f3a]/70">
                  No hay citas registradas.
                </TableCell>
              </TableRow>
            ) : (
              citas.map((cita) => (
                <TableRow key={cita.id}>
                  <TableCell>{cita.cliente}</TableCell>
                  <TableCell>{cita.mascota}</TableCell>
                  <TableCell>{cita.fecha}</TableCell>
                  <TableCell>{cita.hora}</TableCell>
                  <TableCell>{cita.servicio}</TableCell>
                  <TableCell>{cita.estado}</TableCell>
                  {canEdit ? (
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCita(cita)}
                        className="inline-flex items-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" /> Editar
                      </Button>
                      <AlertDialog open={openDeleteAlert && selectedCita?.id === cita.id} onOpenChange={setOpenDeleteAlert}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCita(cita)
                              setOpenDeleteAlert(true)
                            }}
                            className="inline-flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar cita</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que deseas eliminar la cita de {cita.cliente} para {cita.mascota}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="mt-6 flex justify-end gap-3">
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteCita}>Eliminar</AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
