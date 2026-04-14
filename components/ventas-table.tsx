'use client'
import React from 'react'
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
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Venta, Sucursal, VentaDetalle } from '@/types'

type VentaDetalleConProducto = VentaDetalle & {
  producto_nombre: string
}

type VentaConDetalles = {
  id: string
  folio: string
  sucursal_id: string
  empleado_id: string
  fecha: string
  total: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia'
  activo: boolean
  created_at: string
  sucursal_nombre: string
  empleado_nombre: string
  detalles: VentaDetalleConProducto[]
}

export function VentasTable() {
  const [ventas, setVentas] = useState<VentaConDetalles[]>([])
  const [filteredVentas, setFilteredVentas] = useState<VentaConDetalles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sucursalFiltro, setSucursalFiltro] = useState<string>('todas')
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [expandida, setExpandida] = useState<string | null>(null)

  const fetchVentas = async () => {
    try {
      setLoading(true)

      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .eq('activo', true)
        .order('fecha', { ascending: false })

      if (ventasError) throw ventasError

      if (!ventasData) {
        setVentas([])
        return
      }

      const sucursalesIds = [...new Set(ventasData.map((v: Venta) => v.sucursal_id))]
      const empleadosIds = [...new Set(ventasData.map((v: Venta) => v.empleado_id))]

      const { data: sucursalesData } = await supabase
        .from('sucursales')
        .select('id, nombre')
        .in('id', sucursalesIds)

      const { data: empleadosData } = await supabase
        .from('empleados')
        .select('id, nombre')
        .in('id', empleadosIds)

      const sucursalesMap = new Map<string, string>()
      sucursalesData?.forEach((s: { id: string; nombre: string }) => {
        sucursalesMap.set(s.id, s.nombre)
      })

      const empleadosMap = new Map<string, string>()
      empleadosData?.forEach((e: { id: string; nombre: string }) => {
        empleadosMap.set(e.id, e.nombre)
      })

      const ventasConDetalles: VentaConDetalles[] = []

      for (const venta of ventasData) {
        const { data: detallesData } = await supabase
          .from('ventas_detalle')
          .select('*, producto:productos(id, nombre)')
          .eq('venta_id', venta.id)

        const detalles: VentaDetalleConProducto[] = (detallesData || []).map((d) => {
          let productoNombre = 'Producto eliminado'
          if (d.producto && typeof d.producto === 'object' && 'nombre' in d.producto) {
            productoNombre = (d.producto as { nombre: string }).nombre
          }
          return {
            id: d.id,
            venta_id: d.venta_id,
            producto_id: d.producto_id,
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            subtotal: d.subtotal,
            producto_nombre: productoNombre
          }
        })

        ventasConDetalles.push({
          id: venta.id,
          folio: venta.folio,
          sucursal_id: venta.sucursal_id,
          empleado_id: venta.empleado_id,
          fecha: venta.fecha,
          total: venta.total,
          metodo_pago: venta.metodo_pago as 'efectivo' | 'tarjeta' | 'transferencia',
          activo: venta.activo,
          created_at: venta.created_at,
          sucursal_nombre: sucursalesMap.get(venta.sucursal_id) || 'N/A',
          empleado_nombre: empleadosMap.get(venta.empleado_id) || 'N/A',
          detalles: detalles
        })
      }

      setVentas(ventasConDetalles)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ventas')
    } finally {
      setLoading(false)
    }
  }

  const fetchSucursales = async () => {
    const { data } = await supabase
      .from('sucursales')
      .select('id, nombre')
      .eq('activo', true)
      .order('nombre')
    if (data) setSucursales(data as Sucursal[])
  }

  useEffect(() => {
    fetchVentas()
    fetchSucursales()
  }, [])

  useEffect(() => {
    if (sucursalFiltro === 'todas') {
      setFilteredVentas(ventas)
    } else {
      setFilteredVentas(ventas.filter(v => v.sucursal_id === sucursalFiltro))
    }
  }, [sucursalFiltro, ventas])

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-MX', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio)
  }

  if (loading) return <div>Cargando ventas...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-64">
          <Select value={sucursalFiltro} onValueChange={setSucursalFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por sucursal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las sucursales</SelectItem>
              {sucursales.map((suc) => (
                <SelectItem key={suc.id} value={suc.id}>
                  {suc.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {filteredVentas.length} ventas
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Folio</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Método de pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVentas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            ) : (
              filteredVentas.map((venta) => (
                <React.Fragment key={venta.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandida(expandida === venta.id ? null : venta.id)}
                      >
                        {expandida === venta.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{venta.folio}</TableCell>
                    <TableCell>{venta.sucursal_nombre}</TableCell>
                    <TableCell>{venta.empleado_nombre}</TableCell>
                    <TableCell>{formatFecha(venta.fecha)}</TableCell>
                    <TableCell className="font-bold">{formatPrecio(venta.total)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {venta.metodo_pago}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {expandida === venta.id && venta.detalles.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">Detalle de la venta</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Precio unitario</TableHead>
                                <TableHead>Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {venta.detalles.map((detalle) => (
                                <TableRow key={detalle.id}>
                                  <TableCell>{detalle.producto_nombre}</TableCell>
                                  <TableCell>{detalle.cantidad}</TableCell>
                                  <TableCell>{formatPrecio(detalle.precio_unitario)}</TableCell>
                                  <TableCell>{formatPrecio(detalle.subtotal)}</TableCell>
                                </TableRow>
                              ))}
                              <TableRow className="font-bold">
                                <TableCell colSpan={3} className="text-right">
                                  Total:
                                </TableCell>
                                <TableCell>{formatPrecio(venta.total)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}