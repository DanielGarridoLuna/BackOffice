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
import { supabase } from '@/lib/supabase/client'
import { Sucursal, NuevaSucursal } from '@/types'

interface SucursalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  sucursal?: Sucursal | null
}

export function SucursalDialog({ open, onOpenChange, onSuccess, sucursal }: SucursalDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<NuevaSucursal>({
    nombre: '',
    direccion: '',
  })

  const isEditing = !!sucursal

  useEffect(() => {
    if (open && sucursal) {
      setFormData({
        nombre: sucursal.nombre,
        direccion: sucursal.direccion,
      })
    } else if (!open) {
      setFormData({ nombre: '', direccion: '' })
    }
  }, [open, sucursal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing && sucursal) {
        const { error } = await supabase
          .from('sucursales')
          .update({
            nombre: formData.nombre,
            direccion: formData.direccion,
          })
          .eq('id', sucursal.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('sucursales')
          .insert([{ ...formData, activo: true }])

        if (error) throw error
      }

      onOpenChange(false)
      onSuccess()
    } catch (err) {
      alert(err instanceof Error ? err.message : `Error al ${isEditing ? 'actualizar' : 'crear'} la sucursal`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Sucursal' : 'Crear Nueva Sucursal'}
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
              placeholder="Ej: Pachuca Centro"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              required
              placeholder="Calle Principal #123"
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