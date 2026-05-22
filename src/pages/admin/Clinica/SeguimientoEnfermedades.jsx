import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts'

const SAMPLE_DATA = [
  { fecha: '2026-01', casos: 12 },
  { fecha: '2026-02', casos: 18 },
  { fecha: '2026-03', casos: 9 },
  { fecha: '2026-04', casos: 14 },
  { fecha: '2026-05', casos: 21 },
]

const TOP_ENFERMEDADES = [
  { nombre: 'Gastroenteritis', casos: 48 },
  { nombre: 'Dermatitis', casos: 31 },
  { nombre: 'Otitis', casos: 22 },
]

export default function SeguimientoEnfermedades() {
  const [data] = useState(SAMPLE_DATA)

  const totalCasos = useMemo(() => data.reduce((s, d) => s + d.casos, 0), [data])
  const promedio = useMemo(() => Math.round(totalCasos / data.length), [totalCasos, data.length])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Casos totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCasos}</div>
            <div className="text-sm text-muted-foreground mt-2">Casos registrados en los últimos {data.length} meses</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promedio mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{promedio}</div>
            <div className="text-sm text-muted-foreground mt-2">Casos promedio por mes</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enfermedades principales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TOP_ENFERMEDADES.map(e => (
                <div key={e.nombre} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{e.nombre}</div>
                    <div className="text-sm text-muted-foreground">Casos: {e.casos}</div>
                  </div>
                  <Badge>{e.casos}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia mensual de casos</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="casos" stroke="#8884d8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top enfermedades</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={TOP_ENFERMEDADES} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" />
                <Tooltip />
                <Bar dataKey="casos" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
