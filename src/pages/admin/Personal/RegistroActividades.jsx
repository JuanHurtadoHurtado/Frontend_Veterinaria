import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, parseISO, isWithinInterval } from 'date-fns'
import { loadJSON, saveJSON, storageEvents } from '@/lib/storage'
import { Search, Trash2, Calendar as CalendarIcon, Plus, Edit2, Trash, RefreshCw } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const LOGS_INICIALES = [
  { id: 1, usuario: 'admin@vet.com', accion: 'Creó usuario', detalle: 'Usuario petcare', fecha: '2026-05-18T10:23:00Z' },
  { id: 2, usuario: 'vet1@vet.com', accion: 'Editó expediente', detalle: 'Mascota Fido', fecha: '2026-05-19T14:10:00Z' },
  { id: 3, usuario: 'recep@vet.com', accion: 'Agendó cita', detalle: 'Cita 2026-05-20', fecha: '2026-05-20T09:05:00Z' },
]

function getActionType(accion) {
  const lower = accion.toLowerCase()
  if (lower.includes('creó') || lower.includes('registr')) return 'create'
  if (lower.includes('eliminó') || lower.includes('delet')) return 'delete'
  if (lower.includes('editó') || lower.includes('actualizó') || lower.includes('cambió')) return 'update'
  return 'other'
}

function getActionIcon(type) {
  switch (type) {
    case 'create':
      return <Plus className="h-3.5 w-3.5" />
    case 'delete':
      return <Trash className="h-3.5 w-3.5" />
    case 'update':
      return <RefreshCw className="h-3.5 w-3.5" />
    default:
      return <Edit2 className="h-3.5 w-3.5" />
  }
}

function getActionColor(type) {
  switch (type) {
    case 'create':
      return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
    case 'delete':
      return 'bg-rose-100 text-rose-700 hover:bg-rose-100'
    case 'update':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-100'
    default:
      return 'bg-amber-100 text-amber-700 hover:bg-amber-100'
  }
}

export default function RegistroActividades() {
  const [logs, setLogs] = useState(() => loadJSON('logs', LOGS_INICIALES))
  const [usuarios, setUsuarios] = useState(() => loadJSON('usuarios', []))
  const [q, setQ] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const logsHandler = (e) => {
      if (e && e.detail) setLogs(e.detail)
    }
    const usuariosHandler = (e) => {
      if (e && e.detail) setUsuarios(e.detail)
    }

    storageEvents.addEventListener('logs', logsHandler)
    storageEvents.addEventListener('usuarios', usuariosHandler)
    return () => {
      storageEvents.removeEventListener('logs', logsHandler)
      storageEvents.removeEventListener('usuarios', usuariosHandler)
    }
  }, [])

  const usuariosUnicos = useMemo(() => {
    return Array.from(
      new Map(
        logs.map(l => {
          const usuarioData = usuarios.find((u) => u.email === l.usuario)
          const nombre = usuarioData ? `${usuarioData.nombres || ''} ${usuarioData.apellidos || ''}`.trim() : l.usuario
          return [l.usuario, nombre]
        })
      ).entries()
    ).map(([email, nombre]) => ({ email, nombre }))
  }, [logs, usuarios])

  const tiposUnicos = useMemo(() => {
    const types = new Set(logs.map(l => getActionType(l.accion)))
    return Array.from(types)
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const usuarioData = usuarios.find((u) => u.email === l.usuario)
      const usuarioTexto = usuarioData
        ? `${usuarioData.nombres || ''} ${usuarioData.apellidos || ''} ${usuarioData.rol || ''}`.trim()
        : l.usuario
      const textMatch = [usuarioTexto, l.accion, l.detalle].join(' ').toLowerCase().includes(q.toLowerCase())
      if (!textMatch) return false
      
      if (userFilter !== 'all' && l.usuario !== userFilter) return false
      if (typeFilter !== 'all' && getActionType(l.accion) !== typeFilter) return false
      
      if (start && end) {
        try {
          const dt = parseISO(l.fecha)
          const s = parseISO(start)
          const e = parseISO(end)
          if (!isWithinInterval(dt, { start: s, end: e })) return false
        } catch (err) {
          return false
        }
      }
      return true
    })
  }, [logs, q, start, end, userFilter, typeFilter, usuarios])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-[#0ebccc]/20 bg-white/95 p-6 shadow-[0_24px_80px_rgba(14,188,204,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fcd8fa] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#eb008f]">Registro de actividades</div>
            <h1 className="mt-3 text-3xl font-bold text-[#0f2f3a]">Historial de acciones</h1>
          </div>
          <div className="inline-flex items-center rounded-full bg-[#f7f7fb] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#0f2f3a]/70">
            Total
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#0ebccc] px-2 py-0.5 text-xs font-medium text-white">{filtered.length}</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-sm mb-1">Buscar</label>
              <div className="flex items-center rounded-xl border border-[#0ebccc]/25 bg-white px-3">
                <Search className="h-4 w-4 text-[#0ebccc]" />
                <Input placeholder="Buscar por usuario o acción" value={q} onChange={(e) => setQ(e.target.value)} className="h-11 border-0 bg-transparent px-2" />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Usuario</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-left">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {usuariosUnicos.map((user) => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm mb-1">Tipo de acción</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-11 rounded-xl border-[#0ebccc]/25 bg-white text-left">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="create">Creado</SelectItem>
                  <SelectItem value="update">Actualizado</SelectItem>
                  <SelectItem value="delete">Eliminado</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm mb-1">Rango de fechas</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 w-full justify-start rounded-xl border-[#0ebccc]/25 bg-white text-left font-normal text-[#0f2f3a]">
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#0ebccc]" />
                    {start && end ? `${format(parseISO(start), 'dd/MM/yyyy')} - ${format(parseISO(end), 'dd/MM/yyyy')}` : 'Selecciona rango'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[22rem] rounded-2xl border border-[#0ebccc]/20 bg-white p-2 shadow-[0_20px_60px_rgba(14,188,204,0.14)]" align="start">
                  <Calendar
                    mode="range"
                    selected={start || end ? { from: start ? new Date(start) : undefined, to: end ? new Date(end) : undefined } : undefined}
                    onSelect={(range) => {
                      if (!range) {
                        setStart('')
                        setEnd('')
                        return
                      }
                      const from = range.from ? range.from.toISOString().slice(0, 10) + 'T00:00:00Z' : ''
                      const to = range.to ? range.to.toISOString().slice(0, 10) + 'T23:59:59Z' : ''
                      setStart(from)
                      setEnd(to)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#0ebccc]/15 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#f8fafb] to-[#fcfcfe] hover:bg-gradient-to-r hover:from-[#f8fafb] hover:to-[#fcfcfe]">
              <TableHead className="w-40 font-semibold text-[#0f2f3a]">Fecha</TableHead>
              <TableHead className="font-semibold text-[#0f2f3a]">Usuario</TableHead>
              <TableHead className="font-semibold text-[#0f2f3a]">Acción</TableHead>
              <TableHead className="font-semibold text-[#0f2f3a]">Detalle</TableHead>
              <TableHead className="w-28 font-semibold text-[#0f2f3a]">Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(log => {
              const usuarioData = usuarios.find((u) => u.email === log.usuario)
              const nombre = usuarioData ? `${usuarioData.nombres || ''} ${usuarioData.apellidos || ''}`.trim() : log.usuario
              const rol = usuarioData ? usuarioData.rol : ''
              const actionType = getActionType(log.accion)
              const actionColor = getActionColor(actionType)
              const actionIcon = getActionIcon(actionType)

              return (
                <TableRow key={log.id} className="hover:bg-[#fbfbfd] border-b border-[#0ebccc]/10">
                  <TableCell className="font-mono text-sm text-[#0f2f3a]/70" title={log.fecha}>{format(parseISO(log.fecha), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell className="space-y-1">
                    <div className="text-sm font-semibold text-[#0f2f3a]">{nombre}</div>
                    {rol && (
                      <div className="text-xs uppercase tracking-[0.12em] font-medium text-[#0ebccc]">{rol}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-[#0f2f3a]">{log.accion}</TableCell>
                  <TableCell className="text-sm text-[#0f2f3a]/70">{log.detalle}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs ${actionColor}`}>
                      {actionIcon}
                      <span className="capitalize">{actionType === 'create' ? 'Creado' : actionType === 'delete' ? 'Eliminado' : actionType === 'update' ? 'Actualizado' : 'Otro'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-[#0ebccc]/15 bg-white p-8 text-center">
          <p className="text-sm text-[#0f2f3a]/70">No se encontraron registros para los filtros seleccionados.</p>
        </div>
      )}

      <div className="pt-4 flex gap-2">
        <Button
          variant="outline"
          className="h-11 rounded-xl border-[#0ebccc]/25 hover:bg-rose-50"
          onClick={() => {
            setLogs([])
            saveJSON('logs', [])
          }}
        >
          Limpiar historial
        </Button>
      </div>
    </div>
  )
}
