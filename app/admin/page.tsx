// app/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    redirect('/admin/sucursales')
  } else {
    redirect('/login')
  }
}