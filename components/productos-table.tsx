'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Archive, RotateCw } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Producto } from '@/types'
import { ProductoDialog } from './producto-dialog'

type CategoriaProducto = 'agua' | 'leche' | 'especial' | 'agua_fresca'

export function ProductosTable() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null)
  const [mostrarArchivados, setMostrarArchivados] = useState(false)

  const fetchProductos = async () => {
    try {
      setLoading(true)
      let query = supabase.from('productos').select('*')
      
      if (!mostrarArchivados) {
        query = query.eq('activo', true)
      }
      
      const { data, error: supabaseError } = await query.order('nombre')

      if (supabaseError) throw supabaseError
      setProductos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const archivarProducto = async (id: string) => {
    if (!confirm('¿Archivar este producto? Dejará de mostrarse en la lista')) return
    
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error
      fetchProductos()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al archivar producto')
    }
  }

  const restaurarProducto = async (id: string) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ activo: true })
        .eq('id', id)

      if (error) throw error
      fetchProductos()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al restaurar producto')
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [mostrarArchivados])

  useEffect(() => {
    if (categoriaFiltro === 'todos') {
      setFilteredProductos(productos)
    } else {
      setFilteredProductos(productos.filter(p => p.categoria === categoriaFiltro as CategoriaProducto))
    }
  }, [categoriaFiltro, productos])

  if (loading) return <div>Cargando productos...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  const categorias = [
    { value: 'todos', label: 'Todos' },
    { value: 'agua', label: 'Agua' },
    { value: 'leche', label: 'Leche' },
    { value: 'especial', label: 'Especial' },
    { value: 'agua_fresca', label: 'Agua Fresca' },
  ] as const

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="w-64">
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={mostrarArchivados}
              onChange={(e) => setMostrarArchivados(e.target.checked)}
              className="rounded border-gray-300"
            />
            Mostrar archivados
          </label>
        </div>
        <Button onClick={() => {
          setEditingProducto(null)
          setDialogOpen(true)
        }}>
          Nuevo Producto
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProductos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No hay productos registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredProductos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell className="capitalize">{producto.categoria.replace('_', ' ')}</TableCell>
                  <TableCell>${producto.precio.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={producto.activo ? 'default' : 'secondary'}>
                      {producto.activo ? 'Activo' : 'Archivado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {producto.activo ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingProducto(producto)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archivarProducto(producto.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => restaurarProducto(producto.id)}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        producto={editingProducto}
        onSuccess={() => {
          setDialogOpen(false)
          setEditingProducto(null)
          fetchProductos()
        }}
      />
    </div>
  )
}