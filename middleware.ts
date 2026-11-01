import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const userRole = (req.auth as any)?.user?.role
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isOnUpload = req.nextUrl.pathname.startsWith('/upload')
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
  const isOnAuth = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth')

  // Allow API auth routes
  if (isApiAuth) return NextResponse.next()

  // Redirect authenticated users away from auth pages
  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Protect dashboard and upload routes
  if ((isOnDashboard || isOnUpload) && !isLoggedIn) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.nextUrl))
  }

  // Protect admin routes
  if (isOnAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(req.nextUrl.pathname)}`, req.nextUrl))
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/api/auth/:path*',
  ],
}