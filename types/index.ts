export type Sucursal = {
  id: string
  nombre: string
  direccion: string
  activo: boolean
}

export type Producto = {
  id: string
  nombre: string
  categoria: 'agua' | 'leche' | 'especial' | 'agua_fresca'
  precio: number
  activo: boolean
}

export type Empleado = {
  id: string
  email: string
  password: string
  nombre: string
  telefono: string
  direccion: string
  sucursal_id: string | null
  activo: boolean
  created_at: string
}


export type Venta = {
  id: string
  folio: string
  sucursal_id: string
  empleado_id: string
  fecha: string
  total: number
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia'
  activo: boolean
  created_at: string
}

export type VentaDetalle = {
  id: string
  venta_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export type VentaConRelaciones = Venta & {
  sucursal?: Sucursal
  empleado?: Empleado
  detalles?: (VentaDetalle & { producto?: Producto })[]
}

export type NuevaSucursal = Omit<Sucursal, 'id' | 'activo'>
export type NuevoProducto = Omit<Producto, 'id' | 'activo'>
export type NuevoEmpleado = Omit<Empleado, 'id' | 'created_at' | 'activo'>
export type EmpleadoEditar = Partial<Omit<Empleado, 'id' | 'created_at'>>

export type NuevaVenta = Omit<Venta, 'id' | 'created_at' | 'activo' | 'fecha'>
export type NuevoVentaDetalle = Omit<VentaDetalle, 'id'>