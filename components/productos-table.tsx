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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Producto, NuevoProducto } from '@/types'

type CategoriaProducto = 'agua' | 'leche' | 'especial' | 'agua_fresca'

export function ProductosTable() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState<NuevoProducto>({
    nombre: '',
    categoria: 'agua',
    precio: 0,
  })

  const fetchProductos = async () => {
    try {
      setLoading(true)
      const { data, error: supabaseError } = await supabase
        .from('productos')
        .select('*')
        .order('nombre')

      if (supabaseError) throw supabaseError
      setProductos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const { error: supabaseError } = await supabase
        .from('productos')
        .insert([{ ...formData, activo: true }])

      if (supabaseError) throw supabaseError

      setFormData({ nombre: '', categoria: 'agua', precio: 0 })
      setDialogOpen(false)
      fetchProductos()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear el producto')
    } finally {
      setFormLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

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

  const categoriasProducto = categorias.filter(c => c.value !== 'todos')

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nuevo Producto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Producto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Paleta de Piñón"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: string) => setFormData({ ...formData, categoria: value as CategoriaProducto })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasProducto.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (MXN)</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProductos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
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
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}