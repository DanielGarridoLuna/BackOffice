// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()

  // Esta operación SÍ está permitida porque estamos en una Server Action
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error al cerrar sesión:', error.message)
    // Podrías lanzar un error para manejarlo en el cliente si lo deseas
    throw new Error('No se pudo cerrar la sesión')
  }

  // Redirige al usuario a la página de login
  redirect('/login')
}