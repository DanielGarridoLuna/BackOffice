import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Crear la respuesta base
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Crear el cliente de Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Obtener sesión (solo lectura, no escritura)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // Redirecciones
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const redirectUrl = new URL('/admin/sucursales', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}