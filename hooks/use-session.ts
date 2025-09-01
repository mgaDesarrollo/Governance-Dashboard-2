"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase-config"

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

  // Función para actualizar la sesión manualmente
  const refreshSession = async () => {
    try {
      console.log("Refreshing session...")
      
      // Actualizar la sesión de NextAuth
      await update()
      
      // Recargar la página para aplicar los cambios
      router.refresh()
    } catch (error) {
      console.error("Error refreshing session:", error)
    }
  }

  // Función para verificar permisos de administrador (solo cuando se solicite)
  const checkAdminPermissions = async () => {
    try {
      const response = await fetch("/api/auth/check-permissions", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        return userData
      }
    } catch (error) {
      console.error("Error checking permissions:", error)
    }
    return null
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user as User)
      setLoading(false)
    } else if (status === "unauthenticated") {
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  useEffect(() => {
    const syncSupabase = async () => {
      if (status === "authenticated" && session?.accessToken) {
        // Autenticar en Supabase con el token de Discord
        await supabaseClient.auth.signInWithIdToken({
          provider: "discord",
          token: session.accessToken,
        });
      }
    };
    syncSupabase();
  }, [status, session?.accessToken]);

  return {
    user,
    loading,
    refreshSession,
    checkAdminPermissions,
    signOut: () => signOut({ callbackUrl: "/" })
  }
}