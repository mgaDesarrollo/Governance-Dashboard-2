"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function TestPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading session...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">No Autenticado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">No tienes una sesión activa.</p>
            <Button asChild>
              <a href="/api/auth/signin">Iniciar Sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200">Test de Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-slate-200 font-medium mb-2">Información de Sesión:</h3>
              <pre className="text-sm text-slate-300 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-slate-200 font-medium mb-2">Estado de Autenticación:</h3>
              <p className="text-slate-300">Status: {status}</p>
              <p className="text-slate-300">Usuario: {session?.user?.name}</p>
              <p className="text-slate-300">Email: {session?.user?.email}</p>
              <p className="text-slate-300">Rol: {session?.user?.role}</p>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => signOut()}>
                Cerrar Sesión
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Ir al Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 