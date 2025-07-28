"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  FileTextIcon, 
  UsersIcon, 
  CalendarIcon, 
  BuildingIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  VoteIcon,
  DollarSignIcon,
  UserIcon,
  TrendingUpIcon,
  TargetIcon
} from "lucide-react"

interface Report {
  id: string
  workGroup: {
    id: string
    name: string
  }
  year: number
  quarter: string
  detail: string
  consensusStatus: "PENDING" | "IN_CONSENSUS" | "CONSENSED"
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  participants: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
  budgetItems: Array<{
    id: string
    name: string
    description: string
    amountUsd: number
  }>
  votingRounds: Array<{
    id: string
    roundNumber: number
    status: string
  }>
}

export default function ConsensusPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Esperar a que la sesión se cargue completamente
    if (status === "loading") {
      return
    }
    
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
      return
    }
    
    if (status === "authenticated" && session) {
      fetchReports()
    }
  }, [session, status, router])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching consensus reports...")
      const response = await fetch("/api/reports?consensusStatus=pending")
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Reports fetched:", data)
      setReports(data)
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError("Error loading reports")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-yellow-900/20 text-yellow-400 border-yellow-800">Pendiente</Badge>
      case "IN_CONSENSUS":
        return <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">En Consenso</Badge>
      case "CONSENSED":
        return <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">Consensuado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTotalBudget = (budgetItems: any[]) => {
    return budgetItems.reduce((sum, item) => sum + (item.amountUsd || 0), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Verificando autenticación...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <VoteIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-200">
                Sistema de Consenso
              </h1>
              <p className="text-slate-400">
                Vota y comenta en reportes trimestrales que requieren consenso comunitario
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileTextIcon className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-400">Total Reportes</p>
                    <p className="text-2xl font-bold text-slate-200">{reports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TargetIcon className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-slate-400">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {reports.filter(r => r.consensusStatus === "PENDING").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUpIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-slate-400">En Consenso</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {reports.filter(r => r.consensusStatus === "IN_CONSENSUS").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-400">Consensuados</p>
                    <p className="text-2xl font-bold text-green-400">
                      {reports.filter(r => r.consensusStatus === "CONSENSED").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="border-slate-700" />

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileTextIcon className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">
                No Hay Reportes Pendientes de Consenso
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Actualmente no hay reportes trimestrales que requieran consenso comunitario.
              </p>
              <Button 
                onClick={() => router.push("/dashboard/quarterly-reports")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Ver Todos los Reportes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">
                Reportes Pendientes de Consenso
              </h2>
              <Badge variant="outline" className="text-slate-400">
                {reports.length} reporte{reports.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="bg-slate-800 border-slate-700 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                              <BuildingIcon className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-200 text-lg">
                                {report.workGroup.name}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {report.year} Q{report.quarter}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(report.consensusStatus)}
                            <Button
                              onClick={() => router.push(`/dashboard/consensus/${report.id}`)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center space-x-2">
                            <UsersIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Participantes</p>
                              <p className="text-sm font-medium text-slate-200">{report.participants.length}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <DollarSignIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Presupuesto</p>
                              <p className="text-sm font-medium text-slate-200">
                                ${getTotalBudget(report.budgetItems).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <UserIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Creado por</p>
                              <p className="text-sm font-medium text-slate-200">{report.createdBy.name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-xs text-slate-500">Fecha</p>
                              <p className="text-sm font-medium text-slate-200">
                                {formatDate(report.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Separator className="border-slate-700 mb-4" />
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-slate-200 mb-2">Resumen del Reporte</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {report.detail || "No se proporcionó descripción"}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          {report.votingRounds.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <VoteIcon className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-400">Ronda:</span>
                              <span className="text-slate-200 font-medium">{report.votingRounds[0].roundNumber}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Estado:</span>
                          {getStatusBadge(report.consensusStatus)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 