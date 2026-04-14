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
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Venta, Sucursal, Empleado, VentaDetalle, Producto } from '@/types'

type VentaWithRelations = {
  id: string
  folio: string
  sucursal_id: string
  empleado_id: string
  fecha: string
  total: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia'
  activo: boolean
  created_at: string
  sucursal: { id: string; nombre: string } | null
  empleado: { id: string; nombre: string } | null
}

type VentaDetalleWithProduct = {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto: { id: string; nombre: string } | null
}

type VentaConDetalles = VentaWithRelations & {
  sucursal_nombre: string
  empleado_nombre: string
  detalles: {
    id: string
    cantidad: number
    precio_unitario: number
    subtotal: number
    producto_nombre: string
  }[]
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
        .select(`
          *,
          sucursal:sucursales(id, nombre),
          empleado:empleados(id, nombre)
        `)
        .eq('activo', true)
        .order('fecha', { ascending: false })

      if (ventasError) throw ventasError

      const formattedVentas: VentaConDetalles[] = []
      
      for (const v of (ventasData || [])) {
        const venta = v as VentaWithRelations
        
        const { data: detallesData } = await supabase
          .from('ventas_detalle')
          .select(`
            *,
            producto:productos(id, nombre)
          `)
          .eq('venta_id', venta.id)

        const detalles = (detallesData || []).map((d: VentaDetalleWithProduct) => ({
          id: d.id,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal,
          producto_nombre: d.producto?.nombre || 'Producto eliminado'
        }))

        formattedVentas.push({
          ...venta,
          sucursal_nombre: venta.sucursal?.nombre || 'N/A',
          empleado_nombre: venta.empleado?.nombre || 'N/A',
          detalles
        })
      }

      setVentas(formattedVentas)
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
                <>
                  <TableRow key={venta.id} className="cursor-pointer hover:bg-muted/50">
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
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}