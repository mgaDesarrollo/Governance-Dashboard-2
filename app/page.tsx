"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation" // Import useSearchParams
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // For displaying errors
import { BotIcon, LogInIcon, AlertTriangleIcon } from "lucide-react"
import Image from "next/image" // ¡Importa el componente Image de Next.js!


export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <p className="text-white text-xl">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700 text-slate-50">
        <CardHeader className="text-center">
        <Image
            src="/logo.png" // Ruta relativa a la carpeta `public`
            alt="SingularityNET Logo"
            width={200} // El ancho de tu imagen es 640, probemos con 200px
            height={40} // El alto de tu imagen es 128, manteniendo la proporción (200 / (640/128) = 40)
            className="mx-auto mb-4 object-contain" // Centra la imagen y añade margen inferior
          />
          <div className="mx-auto bg-slate-700 p-3 rounded-full w-fit mb-4">
            <BotIcon className="h-12 w-12 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Governance</CardTitle>
          <CardDescription className="text-slate-400">Ambassador Program Governance Dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
              <AlertTriangleIcon className="h-5 w-5 text-red-400" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>
                {error === "OAuthCallback" &&
                  "There was an issue with the Discord login. Please try again. Check server logs for details."}
                {error === "Configuration" &&
                  "There's a configuration problem with the authentication setup. Admin has been notified."}
                {/* Add more specific error messages based on common NextAuth error codes */}
                {!["OAuthCallback", "Configuration"].includes(error) &&
                  `An unexpected error occurred: ${error}. Please try again.`}
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-slate-300 text-center">Please log in with your Discord account to continue.</p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            // Redirect to /dashboard after successful sign in
            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
          >
            <LogInIcon className="mr-2 h-5 w-5" />
            Login with Discord
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
