'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { Empleado, NuevoEmpleado, Sucursal } from '@/types'

interface EmpleadoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    empleado?: Empleado | null
}

export function EmpleadoDialog({ open, onOpenChange, onSuccess, empleado }: EmpleadoDialogProps) {
    const [loading, setLoading] = useState(false)
    const [sucursales, setSucursales] = useState<Sucursal[]>([])
    const [formData, setFormData] = useState<Partial<NuevoEmpleado>>({
        email: '',
        password: '',
        nombre: '',
        telefono: '',
        direccion: '',
        sucursal_id: 'ninguna',
    })

    const isEditing = !!empleado

    // Cargar sucursales para el select
    useEffect(() => {
        const fetchSucursales = async () => {
            const { data } = await supabase
                .from('sucursales')
                .select('id, nombre')
                .eq('activo', true)
                .order('nombre')
            if (data) setSucursales(data as Sucursal[])
        }
        fetchSucursales()
    }, [])

    useEffect(() => {
        if (open && empleado) {
            setFormData({
                email: empleado.email,
                password: '',
                nombre: empleado.nombre,
                telefono: empleado.telefono || '',
                direccion: empleado.direccion || '',
                sucursal_id: empleado.sucursal_id || 'ninguna',
            })
        } else if (!open) {
            setFormData({
                email: '',
                password: '',
                nombre: '',
                telefono: '',
                direccion: '',
                sucursal_id: 'ninguna',
            })
        }
    }, [open, empleado])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isEditing && empleado) {
                const updateData: Partial<Omit<Empleado, 'id' | 'created_at'>> = {
                    email: formData.email,
                    nombre: formData.nombre,
                    telefono: formData.telefono || '',
                    direccion: formData.direccion || '',
                    sucursal_id: formData.sucursal_id === 'ninguna' ? null : formData.sucursal_id,
                }

                if (formData.password && formData.password.trim() !== '') {
                    updateData.password = formData.password
                }

                const { error } = await supabase
                    .from('empleados')
                    .update(updateData)
                    .eq('id', empleado.id)

                if (error) throw error
            } else {
                if (!formData.password) {
                    alert('La contraseña es obligatoria')
                    return
                }

                const { data, error } = await supabase
                    .from('empleados')
                    .insert([{
                        email: formData.email,
                        password: formData.password,
                        nombre: formData.nombre,
                        telefono: formData.telefono || '',
                        direccion: formData.direccion || '',
                        sucursal_id: formData.sucursal_id === 'ninguna' ? null : formData.sucursal_id,
                        activo: true,
                    }])
                    .select()

                console.log('Data:', data)
                console.log('Error:', error)

                if (error) throw error
            }

            onOpenChange(false)
            onSuccess()
        } catch (err) {
            alert(err instanceof Error ? err.message : `Error al ${isEditing ? 'actualizar' : 'crear'} el empleado`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Empleado' : 'Crear Nuevo Empleado'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre completo *</Label>
                        <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="juan@paleteria.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Contraseña {isEditing && '(dejar en blanco para no cambiar)'} *
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!isEditing}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                            id="telefono"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            placeholder="Ej: 7711234567"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                            id="direccion"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            placeholder="Calle Principal #123"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sucursal">Sucursal</Label>
                        <Select
                            value={formData.sucursal_id || 'ninguna'}
                            onValueChange={(value) => setFormData({ ...formData, sucursal_id: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ninguna">Sin sucursal asignada</SelectItem>
                                {sucursales.map((suc) => (
                                    <SelectItem key={suc.id} value={suc.id}>
                                        {suc.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}