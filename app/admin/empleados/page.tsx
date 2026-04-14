import { Suspense } from 'react'
import { EmpleadosTable } from '@/components/empleados-table'

export default function EmpleadosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Empleados</h1>
      </div>
      <Suspense fallback={<div>Cargando empleados...</div>}>
        <EmpleadosTable />
      </Suspense>
    </div>
  )
}