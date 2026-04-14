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
import { Pencil, Archive, RotateCw, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Empleado, Sucursal } from '@/types'
import { EmpleadoDialog } from './empleado-dialog'

export function EmpleadosTable() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [sucursales, setSucursales] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null)
  const [mostrarArchivados, setMostrarArchivados] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState<Record<string, boolean>>({})

  const fetchEmpleados = async () => {
    try {
      setLoading(true)
      let query = supabase.from('empleados').select('*')
      
      if (!mostrarArchivados) {
        query = query.eq('activo', true)
      }
      
      const { data, error: supabaseError } = await query.order('nombre')

      if (supabaseError) throw supabaseError
      setEmpleados(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados')
    } finally {
      setLoading(false)
    }
  }

  const fetchSucursales = async () => {
    const { data } = await supabase
      .from('sucursales')
      .select('id, nombre')
      .eq('activo', true)
    
    if (data) {
      const map = new Map<string, string>()
      data.forEach(s => map.set(s.id, s.nombre))
      setSucursales(map)
    }
  }

  const archivarEmpleado = async (id: string) => {
    if (!confirm('¿Archivar este empleado? Dejará de mostrarse en la lista')) return
    
    try {
      const { error } = await supabase
        .from('empleados')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw error
      fetchEmpleados()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al archivar empleado')
    }
  }

  const restaurarEmpleado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('empleados')
        .update({ activo: true })
        .eq('id', id)

      if (error) throw error
      fetchEmpleados()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al restaurar empleado')
    }
  }

  const toggleMostrarPassword = (id: string) => {
    setMostrarPassword(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    fetchEmpleados()
    fetchSucursales()
  }, [mostrarArchivados])

  if (loading) return <div>Cargando empleados...</div>
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
          setEditingEmpleado(null)
          setDialogOpen(true)
        }}>
          Nuevo Empleado
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contraseña</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No hay empleados registrados
                </TableCell>
              </TableRow>
            ) : (
              empleados.map((empleado) => (
                <TableRow key={empleado.id}>
                  <TableCell className="font-medium">{empleado.nombre}</TableCell>
                  <TableCell>{empleado.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {mostrarPassword[empleado.id] ? empleado.password : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMostrarPassword(empleado.id)}
                      >
                        {mostrarPassword[empleado.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{empleado.telefono || '-'}</TableCell>
                  <TableCell>
                    {empleado.sucursal_id ? sucursales.get(empleado.sucursal_id) || '-' : 'Sin asignar'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={empleado.activo ? 'default' : 'secondary'}>
                      {empleado.activo ? 'Activo' : 'Archivado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {empleado.activo ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingEmpleado(empleado)
                              setDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archivarEmpleado(empleado.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => restaurarEmpleado(empleado.id)}
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

      <EmpleadoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        empleado={editingEmpleado}
        onSuccess={() => {
          setDialogOpen(false)
          setEditingEmpleado(null)
          fetchEmpleados()
        }}
      />
    </div>
  )
}