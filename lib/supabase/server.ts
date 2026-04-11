import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No hacer NADA - las cookies no se modifican desde Server Components
          // Las modificaciones de cookies solo deben ocurrir en:
          // - middleware.ts
          // - Server Actions
          // - Route Handlers
          return
        },
      },
    }
  )
}