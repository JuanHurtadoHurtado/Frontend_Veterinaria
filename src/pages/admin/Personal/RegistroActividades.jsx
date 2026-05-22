import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format, parseISO, isWithinInterval } from 'date-fns'
import { loadJSON, saveJSON, storageEvents } from '@/lib/storage'

const LOGS_INICIALES = [
  { id: 1, usuario: 'admin@vet.com', accion: 'Creó usuario', detalle: 'Usuario petcare', fecha: '2026-05-18T10:23:00Z' },
  { id: 2, usuario: 'vet1@vet.com', accion: 'Editó expediente', detalle: 'Mascota Fido', fecha: '2026-05-19T14:10:00Z' },
  { id: 3, usuario: 'recep@vet.com', accion: 'Agendó cita', detalle: 'Cita 2026-05-20', fecha: '2026-05-20T09:05:00Z' },
]

export default function RegistroActividades() {
  const [logs, setLogs] = useState(() => loadJSON('logs', LOGS_INICIALES))
  const [q, setQ] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')

  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail) setLogs(e.detail)
    }
    storageEvents.addEventListener('logs', handler)
    return () => storageEvents.removeEventListener('logs', handler)
  }, [])

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const textMatch = [l.usuario, l.accion, l.detalle].join(' ').toLowerCase().includes(q.toLowerCase())
      if (!textMatch) return false
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
  }, [logs, q, start, end])

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end md:gap-3">
        <div className="flex-1">
          <label className="block text-sm mb-1">Buscar</label>
          <Input placeholder="usuario, acción o detalle" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Desde</label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value ? e.target.value + 'T00:00:00Z' : '')} />
        </div>
        <div>
          <label className="block text-sm mb-1">Hasta</label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value ? e.target.value + 'T23:59:59Z' : '')} />
        </div>
        <div className="pt-6">
            <Button onClick={() => { setQ(''); setStart(''); setEnd('') }}>Limpiar</Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Detalle</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(log => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">{format(parseISO(log.fecha), "yyyy-MM-dd HH:mm")}</TableCell>
                <TableCell>{log.usuario}</TableCell>
                <TableCell>{log.accion}</TableCell>
                <TableCell>{log.detalle}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Registro</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <div className="text-sm text-muted-foreground">No se encontraron registros para los filtros seleccionados.</div>
      )}

      <div className="pt-4 flex gap-2">
        <Button
          variant="ghost"
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
