"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  image?: string
}

export function useSessionWithRefresh() {
  const { data: session, status, update } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Función para actualizar la sesión
  const refreshSession = async () => {
    try {
      await update()
      // Recargar la página para aplicar los cambios
      router.refresh()
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }

  // Función para verificar permisos de administrador
  const checkAdminPermissions = async () => {
    try {
      const response = await fetch("/api/auth/check-permissions")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        
        // Si el rol cambió, actualizar la sesión
        if (session?.user?.role !== userData.role) {
          await refreshSession()
        }
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user as User)
      setLoading(false)
      
      // Verificar permisos cada 30 segundos
      const interval = setInterval(checkAdminPermissions, 30000)
      return () => clearInterval(interval)
    } else if (status === "unauthenticated") {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  return {
    user,
    loading,
    refreshSession,
    checkAdminPermissions,
    signOut: () => signOut({ callbackUrl: "/" })
  }
} 