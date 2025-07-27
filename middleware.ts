import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    console.log("[Middleware] Checking auth for:", req.nextUrl.pathname)
    console.log("[Middleware] Has token:", !!req.nextauth.token)
    console.log("[Middleware] User:", req.nextauth.token?.name)
    
    // Verificar si el usuario está autenticado
    if (!req.nextauth.token) {
      console.log("[Middleware] No token, redirecting to signin")
      return NextResponse.redirect(new URL("/api/auth/signin", req.url))
    }
    
    console.log("[Middleware] User authenticated, proceeding")
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("[Middleware] Authorized check:", { 
          hasToken: !!token, 
          path: req.nextUrl.pathname 
        })
        return !!token
      }
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