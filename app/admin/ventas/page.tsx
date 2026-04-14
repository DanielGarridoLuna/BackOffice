import { Suspense } from 'react'
import { VentasTable } from '@/components/ventas-table'

export default function VentasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ventas</h1>
      </div>
      <Suspense fallback={<div>Cargando ventas...</div>}>
        <VentasTable />
      </Suspense>
    </div>
  )
}