import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { MoreHorizontal, Trash2, Edit2, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { loadJSON, setUsuarios, pushLog } from '@/lib/storage'
import { format } from 'date-fns'

const ROLES = ['Administrador', 'Veterinario', 'Recepcionista', 'Usuario']

export default function GestionUsuarios() {
  const initialUsuarios = [
    { id: 1, nombres: 'Admin', apellidos: 'Usuario', documentoTipo: 'DNI', documentoNumero: '00000000', fechaNacimiento: '1980-01-01', telefono: '', correo: 'admin@vet.com', rol: 'administrador', estado: 'activo' },
    { id: 2, nombres: 'Dr. García', apellidos: '', documentoTipo: 'DNI', documentoNumero: '00000001', fechaNacimiento: '1985-05-12', telefono: '', correo: 'vet1@vet.com', rol: 'veterinario', estado: 'activo' },
    { id: 3, nombres: 'María', apellidos: '', documentoTipo: 'DNI', documentoNumero: '00000002', fechaNacimiento: '1990-03-03', telefono: '', correo: 'recep@vet.com', rol: 'recepcionista', estado: 'activo' },
  ]

  const [usuarios, setUsuariosState] = useState(() => loadJSON('usuarios', initialUsuarios))
  
  const [openDialog, setOpenDialog] = useState(false)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    documentoTipo: 'DNI',
    documentoNumero: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    rol: 'usuario',
  })

  const handleAddUsuario = () => {
    setSelectedUsuario(null)
    setFormData({
      nombres: '',
      apellidos: '',
      documentoTipo: 'DNI',
      documentoNumero: '',
      fechaNacimiento: '',
      telefono: '',
      correo: '',
      rol: 'usuario',
    })
    setOpenDialog(true)
  }

  const handleEditUsuario = (usuario) => {
    setSelectedUsuario(usuario)
    setFormData({
      nombres: usuario.nombres || usuario.nombre || '',
      apellidos: usuario.apellidos || '',
      documentoTipo: usuario.documentoTipo || 'DNI',
      documentoNumero: usuario.documentoNumero || '',
      fechaNacimiento: usuario.fechaNacimiento || '',
      telefono: usuario.telefono || '',
      correo: usuario.correo || usuario.email || '',
      rol: usuario.rol,
    })
    setOpenDialog(true)
  }

  const handleSaveUsuario = () => {
    // Validaciones básicas
    if (!formData.nombres || !formData.apellidos || !formData.correo) {
      window.alert('Por favor complete nombres, apellidos y correo.')
      return
    }

    const tipo = formData.documentoTipo
    const num = String(formData.documentoNumero || '')
    if (tipo === 'DNI' && num.length !== 8) {
      window.alert('El número de documento para DNI debe tener 8 caracteres.')
      return
    }
    if (tipo === 'CE' && num.length !== 9) {
      window.alert('El número de documento para CE debe tener 9 caracteres.')
      return
    }

    if (selectedUsuario) {
      const updated = usuarios.map(u => u.id === selectedUsuario.id ? { ...u, ...formData } : u)
      setUsuariosState(updated)
      setUsuarios(updated)
      pushLog({ usuario: formData.correo, accion: 'Editó usuario', detalle: `Actualizó a ${formData.correo}` })
    } else {
      const nuevo = { id: Math.max(...usuarios.map(u => u.id), 0) + 1, ...formData, estado: 'activo' }
      const updated = [...usuarios, nuevo]
      setUsuariosState(updated)
      setUsuarios(updated)
      pushLog({ usuario: formData.correo, accion: 'Creó usuario', detalle: `Creó a ${formData.correo}` })
    }
    setOpenDialog(false)
  }

  const handleDeleteUsuario = () => {
    const updated = usuarios.filter(u => u.id !== selectedUsuario.id)
    setUsuariosState(updated)
    setUsuarios(updated)
    pushLog({ usuario: selectedUsuario?.correo || selectedUsuario?.email, accion: 'Eliminó usuario', detalle: `Eliminó a ${selectedUsuario?.correo || selectedUsuario?.email}` })
    setOpenDeleteAlert(false)
  }

  const getRolColor = (rol) => {
    const colors = {
      administrador: 'bg-red-100 text-red-800',
      veterinario: 'bg-blue-100 text-blue-800',
      recepcionista: 'bg-green-100 text-green-800',
      usuario: 'bg-gray-100 text-gray-800'
    }
    return colors[rol] || 'bg-gray-100 text-gray-800'
  }

  const getDisplayName = (usuario) => `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim()

  const handleToggleEstado = (usuario) => {
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo'
    const updated = usuarios.map((u) => (u.id === usuario.id ? { ...u, estado: nuevoEstado } : u))
    setUsuariosState(updated)
    setUsuarios(updated)
    pushLog({
      usuario: usuario.correo,
      accion: 'Cambió estado',
      detalle: `${getDisplayName(usuario)} pasó a ${nuevoEstado}`,
    })
  }

  const handleVerDetalle = (usuario) => {
    setSelectedUsuario(usuario)
    setOpenDetailDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleAddUsuario} className="gap-2">
              <Plus size={16} /> Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#0ebccc]/20 bg-white/95 p-6 shadow-[0_30px_90px_rgba(14,188,204,0.16)]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#0f2f3a]">{selectedUsuario ? 'Editar' : 'Nuevo'} Usuario</DialogTitle>
              <DialogDescription className="text-[#0f2f3a]/70">
                {selectedUsuario ? 'Actualiza los datos del usuario' : 'Crea un nuevo usuario en el sistema'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres" className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">
                    Nombres
                  </Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    placeholder="Juan"
                    className="h-11 rounded-xl border-[#0ebccc]/25 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos" className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">
                    Apellidos
                  </Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    placeholder="Pérez"
                    className="h-11 rounded-xl border-[#0ebccc]/25 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[160px_minmax(0,1fr)] gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentoTipo" className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">
                    Tipo de documento
                  </Label>
                  <Select value={formData.documentoTipo} onValueChange={(value) => setFormData({ ...formData, documentoTipo: value })}>
                    <SelectTrigger id="documentoTipo" className="border-[#0ebccc]/25 bg-white text-left">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentoNumero" className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">
                    Número de documento
                  </Label>
                  <Input
                    id="documentoNumero"
                    value={formData.documentoNumero}
                    onChange={(e) => setFormData({ ...formData, documentoNumero: e.target.value.replace(/[^0-9]/g, '').slice(0, formData.documentoTipo === 'DNI' ? 8 : 9) })}
                    maxLength={formData.documentoTipo === 'DNI' ? 8 : 9}
                    placeholder={formData.documentoTipo === 'DNI' ? '8 dígitos' : '9 dígitos'}
                    className="h-11 rounded-xl border-[#0ebccc]/25 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">Fecha de nacimiento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 w-full justify-start rounded-xl border-[#0ebccc]/25 bg-white text-left font-normal text-[#0f2f3a]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#0ebccc]" />
                      {formData.fechaNacimiento ? format(new Date(`${formData.fechaNacimiento}T00:00:00`), 'dd/MM/yyyy') : 'Selecciona una fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[19rem] rounded-2xl border border-[#0ebccc]/20 bg-white p-2 shadow-[0_20px_60px_rgba(14,188,204,0.14)]"
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    avoidCollisions={false}
                  >
                    <Calendar
                      mode="single"
                      className="p-0"
                      selected={formData.fechaNacimiento ? new Date(`${formData.fechaNacimiento}T00:00:00`) : undefined}
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          fechaNacimiento: date ? format(date, 'yyyy-MM-dd') : '',
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                    placeholder="9XXXXXXXX"
                    maxLength={9}
                    className="h-11 rounded-xl border-[#0ebccc]/25 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo" className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">
                    Correo personal
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="h-11 rounded-xl border-[#0ebccc]/25 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rol" className="whitespace-nowrap text-sm font-medium text-[#0f2f3a]">
                  Rol
                </Label>
                <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                  <SelectTrigger id="rol" className="border-[#0ebccc]/25 bg-white text-left">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(rol => (
                      <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveUsuario} className="w-full h-11 rounded-xl bg-[#0ebccc] text-white hover:bg-[#0aa7b6]">
                {selectedUsuario ? 'Actualizar' : 'Crear'} Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombres completos</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map(usuario => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium text-sm">{getDisplayName(usuario)}</TableCell>
                <TableCell className="font-mono text-sm">{usuario.correo}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRolColor(usuario.rol)}`}>
                    {usuario.rol}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    className={`h-8 rounded-full px-3 text-xs font-semibold capitalize ${usuario.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
                    onClick={() => handleToggleEstado(usuario)}
                  >
                    {usuario.estado}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleVerDetalle(usuario)} className="gap-2">
                        <Plus size={14} /> Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUsuario(usuario)} className="gap-2">
                        <Edit2 size={14} /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setSelectedUsuario(usuario)
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
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDetailDialog} onOpenChange={setOpenDetailDialog}>
        <DialogContent className="sm:max-w-2xl rounded-3xl border border-[#0ebccc]/20 bg-white/95 p-6 shadow-[0_30px_90px_rgba(14,188,204,0.16)]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#0f2f3a]">Detalle del usuario</DialogTitle>
            <DialogDescription className="text-[#0f2f3a]/70">
              Información completa del registro seleccionado.
            </DialogDescription>
          </DialogHeader>

          {selectedUsuario && (
            <div className="grid gap-3 pt-2 text-sm text-[#0f2f3a] md:grid-cols-2">
              <div className="rounded-2xl border border-[#0ebccc]/20 bg-[#fefefe] p-4">
                <div className="text-xs uppercase tracking-wide text-[#eb008f]">Nombres completos</div>
                <div className="mt-1 font-medium">{getDisplayName(selectedUsuario)}</div>
              </div>
              <div className="rounded-2xl border border-[#0ebccc]/20 bg-[#fefefe] p-4">
                <div className="text-xs uppercase tracking-wide text-[#eb008f]">Documento</div>
                <div className="mt-1 font-medium">{selectedUsuario.documentoTipo} - {selectedUsuario.documentoNumero}</div>
              </div>
              <div className="rounded-2xl border border-[#0ebccc]/20 bg-[#fefefe] p-4">
                <div className="text-xs uppercase tracking-wide text-[#eb008f]">Fecha de nacimiento</div>
                <div className="mt-1 font-medium">{selectedUsuario.fechaNacimiento || '-'}</div>
              </div>
              <div className="rounded-2xl border border-[#0ebccc]/20 bg-[#fefefe] p-4">
                <div className="text-xs uppercase tracking-wide text-[#eb008f]">Teléfono</div>
                <div className="mt-1 font-medium">{selectedUsuario.telefono || '-'}</div>
              </div>
              <div className="rounded-2xl border border-[#0ebccc]/20 bg-[#fefefe] p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-[#eb008f]">Correo</div>
                <div className="mt-1 font-medium">{selectedUsuario.correo}</div>
              </div>
              <div className="rounded-2xl border border-[#0ebccc]/20 bg-[#fefefe] p-4 md:col-span-2">
                <div className="text-xs uppercase tracking-wide text-[#eb008f]">Rol</div>
                <div className="mt-1 font-medium capitalize">{selectedUsuario.rol}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteAlert} onOpenChange={setOpenDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a <strong>{selectedUsuario ? `${selectedUsuario.nombres} ${selectedUsuario.apellidos}` : ''}</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUsuario} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
