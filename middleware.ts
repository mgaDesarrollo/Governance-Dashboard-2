import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Verificar si el usuario está autenticado
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/votes/:path*",
    "/api/comments/:path*",
    "/api/reports/:path*",
    "/api/quarterly-reports/:path*"
  ]
} 