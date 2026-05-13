import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Update Supabase Session
  const response = await updateSession(request)

  // 2. Protect Admin Routes (Basic Auth Check)
  // Precise role-based checks are handled in app/admin/layout.tsx for performance
  if (pathname.startsWith('/admin')) {
    // Skip protection for the login page itself to avoid infinite loops
    if (pathname === '/admin/login') {
      return response
    }

    /*
    // Check for Supabase Session
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    */

  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this matcher to fit your needs.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
