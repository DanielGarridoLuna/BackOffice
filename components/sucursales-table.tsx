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
import { supabase } from '@/lib/supabase/client'
import { Sucursal } from '@/types'
import { SucursalDialog } from './sucursal-dialog'

export function SucursalesTable() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null)
  const [mostrarArchivados, setMostrarArchivados] = useState(false)

  const fetchSucursales = async () => {
    try {
      setLoading(true)
      let query = supabase.from('sucursales').select('*')
      
      if (!mostrarArchivados) {
        query = query.eq('activo', true)
      }
      
      const { data, error: supabaseError } = await query.order('nombre')

      if (supabaseError) throw supabaseError
      setSucursales(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sucursales')
    } finally {
      setLoading(false)
    }
  }

  const archivarSucursal = async (id: string) => {
    if (!confirm('¿Archivar esta sucursal? Dejará de mostrarse en la lista')) return
    
    try {
      const { error } = await supabase
        .from('sucursales')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error
      fetchSucursales()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al archivar sucursal')
    }
  }

  const restaurarSucursal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sucursales')
        .update({ activo: true })
        .eq('id', id)

      if (error) throw error
      fetchSucursales()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al restaurar sucursal')
    }
  }

  useEffect(() => {
    fetchSucursales()
  }, [mostrarArchivados])

  if (loading) return <div>Cargando sucursales...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={mostrarArchivados}
            onChange={(e) => setMostrarArchivados(e.target.checked)}
            className="rounded border-gray-300"
          />
          Mostrar archivados
        </label>
        <Button onClick={() => {
          setEditingSucursal(null)
          setDialogOpen(true)
        }}>
          Nueva Sucursal
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sucursales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
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
                      {sucursal.activo ? 'Activo' : 'Archivado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {sucursal.activo ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSucursal(sucursal)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archivarSucursal(sucursal.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => restaurarSucursal(sucursal.id)}
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

      <SucursalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        sucursal={editingSucursal}
        onSuccess={() => {
          setDialogOpen(false)
          setEditingSucursal(null)
          fetchSucursales()
        }}
      />
    </div>
  )
}