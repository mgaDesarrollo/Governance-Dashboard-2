"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircleIcon, 
  CheckCircleIcon, 
  UserIcon,
  ShieldIcon,
  MailIcon
} from "lucide-react"

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  const handleSignIn = () => {
    signIn("discord", { callbackUrl: "/dashboard" })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-200 mb-2">
            Test de Autenticación
          </h1>
          <p className="text-slate-400">
            Página de prueba para diagnosticar problemas de autenticación
          </p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">Estado de la Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status === "loading" ? "bg-yellow-500" : status === "authenticated" ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-slate-300">
                Estado: {status === "loading" ? "Cargando..." : status === "authenticated" ? "Autenticado" : "No autenticado"}
              </span>
            </div>

            {status === "loading" && (
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Verificando estado de autenticación...
                </AlertDescription>
              </Alert>
            )}

            {status === "unauthenticated" && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    No estás autenticado. Haz clic en el botón de abajo para iniciar sesión.
                  </AlertDescription>
                </Alert>
                
                <Button onClick={handleSignIn} className="w-full">
                  Iniciar Sesión con Discord
                </Button>
              </div>
            )}

            {status === "authenticated" && session && (
              <div className="space-y-4">
                <Alert className="border-green-600 bg-green-900/20">
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    ¡Autenticación exitosa!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Usuario</span>
                      </div>
                      <p className="text-slate-200 font-medium">{session.user?.name}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MailIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Email</span>
                      </div>
                      <p className="text-slate-200 font-medium">{session.user?.email}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ShieldIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Rol</span>
                      </div>
                      <p className="text-slate-200 font-medium">{(session.user as any)?.role || "No definido"}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">ID</span>
                      </div>
                      <p className="text-slate-200 font-medium text-sm">{session.user?.id}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleSignOut} variant="outline">
                    Cerrar Sesión
                  </Button>
                  <Button onClick={() => window.location.href = "/dashboard"}>
                    Ir al Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">Información de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">NEXTAUTH_URL:</span>
                <span className="text-slate-200">{process.env.NEXTAUTH_URL || "No configurado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DISCORD_CLIENT_ID:</span>
                <span className="text-slate-200">{process.env.DISCORD_CLIENT_ID ? "Configurado" : "No configurado"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DATABASE_URL:</span>
                <span className="text-slate-200">{process.env.DATABASE_URL ? "Configurado" : "No configurado"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 