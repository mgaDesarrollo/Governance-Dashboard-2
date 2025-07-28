"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  UsersIcon, 
  CalendarIcon, 
  DollarSignIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  MinusIcon,
  MessageSquareIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  ClockIcon,
  UserIcon,
  BuildingIcon,
  TargetIcon,
  LightbulbIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckIcon,
  XIcon,
  ShieldIcon,
  VoteIcon,
  SettingsIcon,
  RefreshCwIcon,
  AwardIcon
} from "lucide-react"
import React from "react"
import { CommentItem } from "@/components/comment-item"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Report {
  id: string
  workGroup: {
    id: string
    name: string
  }
  year: number
  quarter: string
  detail: string
  theoryOfChange: string
  challenges: any[]
  plans: string
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
}

interface Vote {
  id: string
  voteType: "A_FAVOR" | "EN_CONTRA" | "OBJETAR" | "ABSTENERSE"
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  objection?: {
    id: string
    status: "PENDIENTE" | "VALIDA" | "INVALIDA"
    resolvedBy?: {
      id: string
      name: string
      image?: string | null
    }
  }
}

interface VoteStats {
  aFavor: number
  enContra: number
  objetar: number
  abstenerse: number
  total: number
}

interface Comment {
  id: string
  content: string
  createdAt: string
  likes: string[]
  dislikes: string[]
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  replies?: Comment[]
}

export default function ConsensusReportDetailPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [voteStats, setVoteStats] = useState<VoteStats>({ aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Voting state
  const [selectedVoteType, setSelectedVoteType] = useState<string>("")
  const [voteComment, setVoteComment] = useState("")
  const [showVoteDialog, setShowVoteDialog] = useState(false)
  const [submittingVote, setSubmittingVote] = useState(false)
  
  // Comment state
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const resolvedParams = React.use(params)
  const reportId = resolvedParams.reportId

  useEffect(() => {
    if (!session) {
      router.push("/api/auth/signin")
      return
    }
    
    // Check if user is admin
    const checkAdminStatus = () => {
      const userRole = session?.user?.role
      // For now, we'll check if user is SUPER_ADMIN or if they have admin role
      // The workGroups property might not be available in the session
      setIsAdmin(userRole === "SUPER_ADMIN" || userRole === "ADMIN")
    }
    
    checkAdminStatus()
    fetchReportData()
  }, [session, reportId])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch report details
      const reportResponse = await fetch(`/api/quarterly-reports/${reportId}`)
      if (!reportResponse.ok) {
        throw new Error("Error fetching report")
      }
      const reportData = await reportResponse.json()
      setReport(reportData)

      // Fetch votes
      const votesResponse = await fetch(`/api/reports/${reportId}/votes`)
      if (votesResponse.ok) {
        const votesData = await votesResponse.json()
        setVotes(votesData.votes || [])
        setVoteStats(votesData.stats || { aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 })
      }

      // Fetch comments
      const commentsResponse = await fetch(`/api/reports/${reportId}/comments`)
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }
    } catch (err) {
      console.error("Error fetching report data:", err)
      setError("Error loading report data")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedVoteType || voteComment.length < 10) {
      return
    }

    try {
      setSubmittingVote(true)
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          voteType: selectedVoteType,
          comment: voteComment
        })
      })

      if (response.ok) {
        setShowVoteDialog(false)
        setSelectedVoteType("")
        setVoteComment("")
        await fetchReportData() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error submitting vote")
      }
    } catch (err) {
      setError("Error submitting vote")
    } finally {
      setSubmittingVote(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || newComment.length < 5) return

    try {
      setSubmittingComment(true)
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          content: newComment
        })
      })

      if (response.ok) {
        setNewComment("")
        await fetchReportData() // Refresh comments
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error submitting comment")
      }
    } catch (err) {
      setError("Error submitting comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReply = async (parentCommentId: string, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          content,
          parentCommentId
        })
      })

      if (response.ok) {
        await fetchReportData() // Refresh comments
      }
    } catch (err) {
      setError("Error submitting reply")
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST"
      })

      if (response.ok) {
        await fetchReportData() // Refresh comments
      }
    } catch (err) {
      setError("Error liking comment")
    }
  }

  const handleDislikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/dislike`, {
        method: "POST"
      })

      if (response.ok) {
        await fetchReportData() // Refresh comments
      }
    } catch (err) {
      setError("Error disliking comment")
    }
  }

  // Admin functions
  const handleResolveObjection = async (objectionId: string, status: "VALIDA" | "INVALIDA") => {
    try {
      setAdminLoading(true)
      const response = await fetch(`/api/objections/${objectionId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchReportData() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error resolving objection")
      }
    } catch (err) {
      setError("Error resolving objection")
    } finally {
      setAdminLoading(false)
    }
  }

  const handleNewVotingRound = async () => {
    try {
      setAdminLoading(true)
      const response = await fetch(`/api/reports/${reportId}/rounds`, {
        method: "POST"
      })

      if (response.ok) {
        await fetchReportData() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error starting new round")
      }
    } catch (err) {
      setError("Error starting new round")
    } finally {
      setAdminLoading(false)
    }
  }

  const handleMarkConsensus = async (status: "CONSENSED" | "REJECTED") => {
    try {
      setAdminLoading(true)
      const response = await fetch(`/api/reports/${reportId}/consensus-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consensusStatus: status })
      })

      if (response.ok) {
        await fetchReportData() // Refresh data
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Error updating consensus status")
      }
    } catch (err) {
      setError("Error updating consensus status")
    } finally {
      setAdminLoading(false)
    }
  }

  const getVoteTypeIcon = (type: string) => {
    switch (type) {
      case "A_FAVOR": return <CheckCircleIcon className="w-4 h-4 text-green-500" />
      case "EN_CONTRA": return <XCircleIcon className="w-4 h-4 text-red-500" />
      case "OBJETAR": return <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
      case "ABSTENERSE": return <MinusIcon className="w-4 h-4 text-gray-500" />
      default: return <VoteIcon className="w-4 h-4" />
    }
  }

  const getVoteTypeLabel = (type: string) => {
    switch (type) {
      case "A_FAVOR": return "A Favor"
      case "EN_CONTRA": return "En Contra"
      case "OBJETAR": return "Objetar"
      case "ABSTENERSE": return "Abstenerse"
      default: return type
    }
  }

  const getObjectionStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE": return <Badge variant="secondary">Pendiente</Badge>
      case "VALIDA": return <Badge variant="destructive">Válida</Badge>
      case "INVALIDA": return <Badge variant="outline">Inválida</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-200 rounded"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-slate-200 rounded"></div>
                <div className="h-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>{error || "Report not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const pendingObjections = votes.filter(vote => 
    vote.voteType === "OBJETAR" && vote.objection?.status === "PENDIENTE"
  )

  const validObjections = votes.filter(vote => 
    vote.voteType === "OBJETAR" && vote.objection?.status === "VALIDA"
  )

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Consenso del Reporte
              </h1>
              <p className="text-slate-600">
                {report.workGroup.name} - {report.year} Q{report.quarter}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={report.consensusStatus === "CONSENSED" ? "default" : "secondary"}>
              {report.consensusStatus === "CONSENSED" ? "Consensuado" : "Pendiente"}
            </Badge>
            {isAdmin && (
              <Badge variant="outline" className="flex items-center">
                <ShieldIcon className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="voting">Votación</TabsTrigger>
            <TabsTrigger value="comments">Comentarios</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Administración</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileTextIcon className="w-5 h-5 mr-2" />
                      Detalles del Reporte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <BuildingIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Workgroup:</span>
                        <span className="text-sm">{report.workGroup.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Período:</span>
                        <span className="text-sm">{report.year} Q{report.quarter}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Creado por:</span>
                        <span className="text-sm">{report.createdBy.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UsersIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">Participantes:</span>
                        <span className="text-sm">{report.participants.length}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Detalle</h4>
                      <p className="text-sm text-slate-600">{report.detail}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Teoría del Cambio</h4>
                      <p className="text-sm text-slate-600">{report.theoryOfChange}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Planes Futuros</h4>
                      <p className="text-sm text-slate-600">{report.plans}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Items */}
                {report.budgetItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSignIcon className="w-5 h-5 mr-2" />
                        Presupuesto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {report.budgetItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-slate-600">{item.description}</p>
                            </div>
                            <span className="font-medium text-green-600">
                              ${item.amountUsd.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="font-medium">Total</span>
                          <span className="font-bold text-green-600">
                            ${report.budgetItems.reduce((sum, item) => sum + item.amountUsd, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {/* Vote Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <VoteIcon className="w-5 h-5 mr-2" />
                      Estadísticas de Votación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{voteStats.aFavor}</div>
                        <div className="text-sm text-green-600">A Favor</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{voteStats.enContra}</div>
                        <div className="text-sm text-red-600">En Contra</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{voteStats.objetar}</div>
                        <div className="text-sm text-yellow-600">Objetar</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{voteStats.abstenerse}</div>
                        <div className="text-sm text-gray-600">Abstenerse</div>
                      </div>
                    </div>
                    <div className="text-center pt-3 border-t">
                      <div className="text-lg font-bold">{voteStats.total}</div>
                      <div className="text-sm text-slate-600">Total de Votos</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Objections Summary */}
                {pendingObjections.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-yellow-600">
                        <AlertTriangleIcon className="w-5 h-5 mr-2" />
                        Objeciones Pendientes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{pendingObjections.length}</div>
                          <div className="text-sm text-yellow-600">Requieren Revisión</div>
                        </div>
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setActiveTab("admin")}
                          >
                            <SettingsIcon className="w-4 h-4 mr-2" />
                            Gestionar Objeciones
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TargetIcon className="w-5 h-5 mr-2" />
                      Acciones Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <VoteIcon className="w-4 h-4 mr-2" />
                          Votar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Votar en el Consenso</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            {["A_FAVOR", "EN_CONTRA", "OBJETAR", "ABSTENERSE"].map((type) => (
                              <Button
                                key={type}
                                variant={selectedVoteType === type ? "default" : "outline"}
                                onClick={() => setSelectedVoteType(type)}
                                className="flex items-center"
                              >
                                {getVoteTypeIcon(type)}
                                <span className="ml-2">{getVoteTypeLabel(type)}</span>
                              </Button>
                            ))}
                          </div>
                          <Textarea
                            placeholder="Justificación (mínimo 10 caracteres)..."
                            value={voteComment}
                            onChange={(e) => setVoteComment(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="text-xs text-slate-500">
                            {voteComment.length}/1000 caracteres
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowVoteDialog(false)}>
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleVote}
                              disabled={!selectedVoteType || voteComment.length < 10 || submittingVote}
                            >
                              {submittingVote ? "Enviando..." : "Enviar Voto"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <VoteIcon className="w-5 h-5 mr-2" />
                  Votos del Consenso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {votes.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <VoteIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No hay votos registrados aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {votes.map((vote) => (
                      <div key={vote.id} className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={vote.user.image || undefined} />
                          <AvatarFallback>{vote.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{vote.user.name}</span>
                            {getVoteTypeIcon(vote.voteType)}
                            <Badge variant="outline">{getVoteTypeLabel(vote.voteType)}</Badge>
                            {vote.objection && getObjectionStatusBadge(vote.objection.status)}
                            <span className="text-xs text-slate-500">
                              {formatDate(vote.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{vote.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquareIcon className="w-5 h-5 mr-2" />
                  Comentarios del Consenso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New Comment */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Escribe un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">
                      {newComment.length}/1000 caracteres
                    </span>
                    <Button 
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || newComment.length < 5 || submittingComment}
                    >
                      {submittingComment ? "Enviando..." : "Enviar Comentario"}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No hay comentarios aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onReply={handleReply}
                        onLike={handleLikeComment}
                        onDislike={handleDislikeComment}
                        currentUserId={session?.user?.id}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          {isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Objection Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangleIcon className="w-5 h-5 mr-2" />
                      Gestión de Objeciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingObjections.length === 0 ? (
                      <div className="text-center py-4 text-slate-500">
                        <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p>No hay objeciones pendientes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingObjections.map((vote) => (
                          <div key={vote.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{vote.user.name}</span>
                              <span className="text-xs text-slate-500">
                                {formatDate(vote.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{vote.comment}</p>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResolveObjection(vote.objection!.id, "INVALIDA")}
                                disabled={adminLoading}
                              >
                                <XIcon className="w-3 h-3 mr-1" />
                                Marcar Inválida
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleResolveObjection(vote.objection!.id, "VALIDA")}
                                disabled={adminLoading}
                              >
                                <CheckIcon className="w-3 h-3 mr-1" />
                                Marcar Válida
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Admin Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Acciones de Administración
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleNewVotingRound}
                        disabled={adminLoading || validObjections.length === 0}
                      >
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        Iniciar Nueva Ronda
                      </Button>
                      
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleMarkConsensus("CONSENSED")}
                        disabled={adminLoading || validObjections.length > 0}
                      >
                        <AwardIcon className="w-4 h-4 mr-2" />
                        Marcar como Consensuado
                      </Button>
                      
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleMarkConsensus("REJECTED")}
                        disabled={adminLoading}
                      >
                        <XCircleIcon className="w-4 h-4 mr-2" />
                        Rechazar Reporte
                      </Button>
                    </div>

                    <Separator />

                    <div className="text-sm text-slate-600 space-y-2">
                      <p><strong>Notas:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Solo se puede marcar como "Consensuado" si no hay objeciones válidas</li>
                        <li>Las objeciones válidas requieren una nueva ronda de votación</li>
                        <li>Los administradores pueden resolver objeciones pendientes</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
} 