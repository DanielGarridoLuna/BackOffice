'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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

interface ProductoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  producto?: Producto | null
}

type CategoriaProducto = 'agua' | 'leche' | 'especial' | 'agua_fresca'

export function ProductoDialog({ open, onOpenChange, onSuccess, producto }: ProductoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<NuevoProducto>({
    nombre: '',
    categoria: 'agua',
    precio: 0,
  })

  const isEditing = !!producto

  useEffect(() => {
    if (open && producto) {
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
      })
    } else if (!open) {
      setFormData({ nombre: '', categoria: 'agua', precio: 0 })
    }
  }, [open, producto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing && producto) {
        const { error } = await supabase
          .from('productos')
          .update({
            nombre: formData.nombre,
            categoria: formData.categoria,
            precio: formData.precio,
          })
          .eq('id', producto.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([{ ...formData, activo: true }])

        if (error) throw error
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : `Error al ${isEditing ? 'actualizar' : 'crear'} el producto`)
    } finally {
      setLoading(false)
    }
  }

  const categorias = [
    { value: 'agua', label: 'Agua' },
    { value: 'leche', label: 'Leche' },
    { value: 'especial', label: 'Especial' },
    { value: 'agua_fresca', label: 'Agua Fresca' },
  ] as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}
          </DialogTitle>
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
                {categorias.map((cat) => (
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}