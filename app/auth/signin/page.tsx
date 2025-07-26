"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeftIcon, DiscordIcon, AlertCircleIcon, RefreshCwIcon } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const testAuthConfig = async () => {
    try {
      const response = await fetch("/api/auth/test")
      const data = await response.json()
      setDebugInfo(data)
      console.log("Auth test result:", data)
    } catch (err) {
      console.error("Auth test failed:", err)
      setDebugInfo({ error: "Failed to test auth configuration" })
    }
  }

  const handleDiscordSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("Starting Discord sign in...")
      
      const result = await signIn("discord", {
        callbackUrl: "/dashboard",
        redirect: false,
      })

      console.log("Sign in result:", result)

      if (result?.error) {
        setError(result.error)
        console.error("Sign in error:", result.error)
      } else if (result?.ok) {
        console.log("Sign in successful, redirecting...")
        router.push("/dashboard")
      } else {
        console.log("Sign in result:", result)
      }
    } catch (err) {
      const errorMsg = "Error al iniciar sesión. Intenta nuevamente."
      setError(errorMsg)
      console.error("Sign in error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <DiscordIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-slate-200">Iniciar Sesión</CardTitle>
          <p className="text-slate-400 text-sm">
            Accede a tu cuenta usando Discord
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleDiscordSignIn}
            disabled={isLoading}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
          >
            <DiscordIcon className="w-5 h-5 mr-2" />
            {isLoading ? "Conectando..." : "Continuar con Discord"}
          </Button>

          <Button
            onClick={testAuthConfig}
            variant="outline"
            className="w-full"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Probar Configuración
          </Button>

          {debugInfo && (
            <div className="bg-slate-700 p-3 rounded-lg">
              <p className="text-sm text-slate-300 mb-2">Debug Info:</p>
              <pre className="text-xs text-slate-400 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-500">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-xs text-slate-500 text-center">
            <p>¿Problemas para iniciar sesión?</p>
            <p className="mt-1">Contacta al administrador del sistema.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 