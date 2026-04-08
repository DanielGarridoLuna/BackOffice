import { Suspense } from 'react'
import { ProductosTable } from '@/components/productos-table'

export default function ProductosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos</h1>
      </div>
      <Suspense fallback={<div>Cargando productos...</div>}>
        <ProductosTable />
      </Suspense>
    </div>
  )
}