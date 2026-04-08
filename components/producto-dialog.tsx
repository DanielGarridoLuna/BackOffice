'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { NuevoProducto } from '@/types'

interface ProductoDialogProps {
  onSuccess: () => void
}

type CategoriaProducto = 'agua' | 'leche' | 'especial' | 'agua_fresca'

export function ProductoDialog({ onSuccess }: ProductoDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<NuevoProducto>({
    nombre: '',
    categoria: 'agua',
    precio: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('productos')
        .insert([{ ...formData, activo: true }])

      if (error) throw error

      setFormData({ nombre: '', categoria: 'agua', precio: 0 })
      setOpen(false)
      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear el producto')
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
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}