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
import { supabase } from '@/lib/supabase/client'
import { Sucursal, NuevaSucursal } from '@/types'

export function SucursalesTable() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState<NuevaSucursal>({
    nombre: '',
    direccion: '',
  })

  const fetchSucursales = async () => {
    try {
      setLoading(true)
      const { data, error: supabaseError } = await supabase
        .from('sucursales')
        .select('*')
        .order('nombre')

      if (supabaseError) throw supabaseError
      setSucursales(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sucursales')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const { error: supabaseError } = await supabase
        .from('sucursales')
        .insert([{ ...formData, activo: true }])

      if (supabaseError) throw supabaseError

      setFormData({ nombre: '', direccion: '' })
      setDialogOpen(false)
      fetchSucursales()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear la sucursal')
    } finally {
      setFormLoading(false)
    }
  }

  useEffect(() => {
    fetchSucursales()
  }, [])

  if (loading) return <div>Cargando sucursales...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nueva Sucursal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Sucursal</DialogTitle>
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
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sucursales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No hay sucursales registradas
                </TableCell>
              </TableRow>
            ) : (
              sucursales.map((sucursal) => (
                <TableRow key={sucursal.id}>
                  <TableCell className="font-medium">{sucursal.nombre}</TableCell>
                  <TableCell>{sucursal.direccion}</TableCell>
                  <TableCell>
                    <Badge variant={sucursal.activo ? 'default' : 'secondary'}>
                      {sucursal.activo ? 'Activo' : 'Inactivo'}
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