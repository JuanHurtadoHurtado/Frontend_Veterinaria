import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Folder, FileText, ChevronDown, ChevronRight, Download } from 'lucide-react'

const TREE = [
  {
    id: 'root',
    name: 'Documentos clínicos',
    children: [
      {
        id: 'expedientes',
        name: 'Expedientes',
        children: [
          { id: 'exp1', name: 'Fido_2025.pdf', type: 'pdf' },
          { id: 'exp2', name: 'Mittens_2024.pdf', type: 'pdf' },
        ]
      },
      {
        id: 'imagenes',
        name: 'Imágenes',
        children: [
          { id: 'img1', name: 'radiografia_fido.jpg', type: 'img' },
        ]
      },
      {
        id: 'informes',
        name: 'Informes',
        children: [
          { id: 'inf1', name: 'informe_anual_2025.docx', type: 'doc' },
        ]
      }
    ]
  }
]

function TreeNode({ node, onOpenFile }) {
  const [open, setOpen] = useState(false)
  const isFolder = Array.isArray(node.children)

  return (
    <div className="pl-2">
      <div className="flex items-center gap-2 py-1">
        {isFolder ? (
          <button className="p-1 rounded hover:bg-muted" onClick={() => setOpen(!open)}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-6" />
        )}

        <div className="flex items-center gap-2 flex-1">
          {isFolder ? <Folder size={18} className="text-amber-500" /> : <FileText size={16} className="text-slate-600" />}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-sm">{node.name}</div>
              {!isFolder && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{node.type}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => onOpenFile(node)}>
                    <Download size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isFolder && open && (
        <div className="pl-4">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} onOpenFile={onOpenFile} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Documentos() {
  const [selected, setSelected] = useState(null)

  const handleOpenFile = (file) => {
    setSelected(file)
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="col-span-1 md:col-span-1">
        <CardHeader>
          <CardTitle>Organización de documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TREE.map(node => (
              <div key={node.id}>
                <TreeNode node={node} onOpenFile={handleOpenFile} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-2 grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Vista previa / Detalle</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText />
                    <div>
                      <div className="font-semibold">{selected.name}</div>
                      <div className="text-sm text-muted-foreground">Tipo: {selected.type}</div>
                    </div>
                  </div>
                  <div>
                    <Button variant="outline">Descargar</Button>
                  </div>
                </div>

                <div className="border rounded p-4 text-sm text-muted-foreground">
                  Vista previa no disponible en este prototipo. Integra `react-pdf` o una vista de imágenes para previsualizar archivos.
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Selecciona un archivo para ver detalles.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button>Subir documento</Button>
              <Button variant="ghost">Crear carpeta</Button>
              <Button variant="ghost">Sincronizar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
