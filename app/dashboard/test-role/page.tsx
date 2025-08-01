"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestRolePage() {
  const { data: session, status, update } = useSession()
  const [fixResult, setFixResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fixUserRole = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/fix-user-role", {
        method: "POST"
      })
      const data = await response.json()
      setFixResult(data)
      
      // Actualizar la sesión después de corregir el rol
      await update()
    } catch (error) {
      console.error("Error fixing user role:", error)
      setFixResult({ error: "Failed to fix user role" })
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/refresh-token", {
        method: "POST"
      })
      const data = await response.json()
      setFixResult(data)
      
      // Forzar actualización de la sesión
      await update()
    } catch (error) {
      console.error("Error refreshing token:", error)
      setFixResult({ error: "Failed to refresh token" })
    } finally {
      setLoading(false)
    }
  }

  const debugUser = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/debug-user")
      const data = await response.json()
      setFixResult(data)
    } catch (error) {
      console.error("Error debugging user:", error)
      setFixResult({ error: "Failed to debug user" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test User Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-bold">Session Status:</h3>
                <p className="text-gray-400">{status}</p>
              </div>
              
              <div>
                <h3 className="text-white font-bold">Current Session Data:</h3>
                <pre className="text-gray-400 text-sm bg-gray-800 p-4 rounded overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="text-white font-bold">User Role:</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-white">
                    {(session?.user as any)?.role || 'No role'}
                  </Badge>
                  <span className="text-gray-400">
                    (ID: {(session?.user as any)?.id || 'No ID'})
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={fixUserRole}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Fixing..." : "Fix User Role"}
                </Button>
                <Button 
                  onClick={refreshToken}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Refreshing..." : "Refresh Token"}
                </Button>
                <Button 
                  onClick={debugUser}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Debugging..." : "Debug User"}
                </Button>
              </div>
              
              {fixResult && (
                <div>
                  <h3 className="text-white font-bold">Fix Result:</h3>
                  <pre className="text-gray-400 text-sm bg-gray-800 p-4 rounded overflow-auto">
                    {JSON.stringify(fixResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 