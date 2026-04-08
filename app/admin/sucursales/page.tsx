import { Suspense } from 'react'
import { SucursalesTable } from '@/components/sucursales-table'

export default function SucursalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sucursales</h1>
      </div>
      <Suspense fallback={<div>Cargando sucursales...</div>}>
        <SucursalesTable />
      </Suspense>
    </div>
  )
}