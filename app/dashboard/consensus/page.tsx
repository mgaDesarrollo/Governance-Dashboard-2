"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileTextIcon, 
  UsersIcon, 
  CalendarIcon, 
  BuildingIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon
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
  const { data: session } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchReports()
    }
  }, [session])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/reports?consensusStatus=pending")
      if (!response.ok) {
        throw new Error("Failed to fetch reports")
      }
      const data = await response.json()
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
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>
      case "IN_CONSENSUS":
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Consensus</Badge>
      case "CONSENSED":
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">Consensed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTotalBudget = (budgetItems: any[]) => {
    return budgetItems.reduce((sum, item) => sum + (item.amountUsd || 0), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading consensus reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-purple-400 flex items-center gap-2">
          <FileTextIcon className="w-8 h-8" />
          Consensus System
        </h1>
        <p className="text-slate-400">
          Vote and comment on quarterly reports that require community consensus.
        </p>
      </div>

      {reports.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <FileTextIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Reports Pending Consensus</h3>
            <p className="text-slate-400 mb-4">
              There are currently no quarterly reports that require community consensus.
            </p>
            <Button 
              onClick={() => router.push("/dashboard/quarterly-reports")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              View All Reports
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="bg-slate-800 border-slate-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BuildingIcon className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold text-slate-200">{report.workGroup.name}</span>
                      {getStatusBadge(report.consensusStatus)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{report.year} {report.quarter}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-4 h-4" />
                        <span>{report.participants.length} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileTextIcon className="w-4 h-4" />
                        <span>${getTotalBudget(report.budgetItems).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/dashboard/consensus/${report.id}`)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium text-slate-200 mb-2">Report Summary</h4>
                  <p className="text-slate-400 text-sm line-clamp-2">
                    {report.detail || "No description provided"}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-slate-400">
                    <span>Created by:</span>
                    <span className="text-slate-200">{report.createdBy.name}</span>
                  </div>
                  {report.votingRounds.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>Round:</span>
                      <span className="text-slate-200">{report.votingRounds[0].roundNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 