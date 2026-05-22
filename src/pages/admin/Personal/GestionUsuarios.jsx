import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Trash2, Edit2, Plus } from 'lucide-react'
import { loadJSON, setUsuarios, pushLog } from '@/lib/storage'

const ROLES = ['administrador', 'veterinario', 'recepcionista', 'usuario']

export default function GestionUsuarios() {
  const initialUsuarios = [
    { id: 1, email: 'admin@vet.com', nombre: 'Admin', rol: 'administrador', estado: 'activo' },
    { id: 2, email: 'vet1@vet.com', nombre: 'Dr. García', rol: 'veterinario', estado: 'activo' },
    { id: 3, email: 'recep@vet.com', nombre: 'María', rol: 'recepcionista', estado: 'activo' },
  ]

  const [usuarios, setUsuariosState] = useState(() => loadJSON('usuarios', initialUsuarios))
  
  const [openDialog, setOpenDialog] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [formData, setFormData] = useState({ email: '', nombre: '', rol: 'usuario' })

  const handleAddUsuario = () => {
    setSelectedUsuario(null)
    setFormData({ email: '', nombre: '', rol: 'usuario' })
    setOpenDialog(true)
  }

  const handleEditUsuario = (usuario) => {
    setSelectedUsuario(usuario)
    setFormData({ email: usuario.email, nombre: usuario.nombre, rol: usuario.rol })
    setOpenDialog(true)
  }

  const handleSaveUsuario = () => {
    if (!formData.email || !formData.nombre) return

    if (selectedUsuario) {
      const updated = usuarios.map(u => u.id === selectedUsuario.id ? { ...u, ...formData } : u)
      setUsuariosState(updated)
      setUsuarios(updated)
      pushLog({ usuario: formData.email, accion: 'Editó usuario', detalle: `Actualizó a ${formData.email}` })
    } else {
      const nuevo = { id: Math.max(...usuarios.map(u => u.id), 0) + 1, ...formData, estado: 'activo' }
      const updated = [...usuarios, nuevo]
      setUsuariosState(updated)
      setUsuarios(updated)
      pushLog({ usuario: formData.email, accion: 'Creó usuario', detalle: `Creó a ${formData.email}` })
    }
    setOpenDialog(false)
  }

  const handleDeleteUsuario = () => {
    const updated = usuarios.filter(u => u.id !== selectedUsuario.id)
    setUsuariosState(updated)
    setUsuarios(updated)
    pushLog({ usuario: selectedUsuario?.email, accion: 'Eliminó usuario', detalle: `Eliminó a ${selectedUsuario?.email}` })
    setOpenDeleteAlert(false)
  }

  const getBadgeVariant = (estado) => {
    return estado === 'activo' ? 'default' : 'destructive'
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedUsuario ? 'Editar' : 'Nuevo'} Usuario</DialogTitle>
              <DialogDescription>
                {selectedUsuario ? 'Actualiza los datos del usuario' : 'Crea un nuevo usuario en el sistema'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Juan García"
                />
              </div>
              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                  <SelectTrigger id="rol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(rol => (
                      <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveUsuario} className="w-full">
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
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map(usuario => (
              <TableRow key={usuario.id}>
                <TableCell className="font-mono text-sm">{usuario.email}</TableCell>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRolColor(usuario.rol)}`}>
                    {usuario.rol}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(usuario.estado)}>
                    {usuario.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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

      <AlertDialog open={openDeleteAlert} onOpenChange={setOpenDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a <strong>{selectedUsuario?.nombre}</strong>? Esta acción no se puede deshacer.
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
