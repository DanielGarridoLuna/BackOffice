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

export type NuevaSucursal = Omit<Sucursal, 'id' | 'activo'>
export type NuevoProducto = Omit<Producto, 'id' | 'activo'>