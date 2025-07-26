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
  XIcon
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
  const resolvedParams = React.use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [votes, setVotes] = useState<Vote[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [voteStats, setVoteStats] = useState<VoteStats>({ aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voteType, setVoteType] = useState<"A_FAVOR" | "EN_CONTRA" | "OBJETAR" | "ABSTENERSE" | null>(null)
  const [voteComment, setVoteComment] = useState("")
  const [showVoteDialog, setShowVoteDialog] = useState(false)
  const [submittingVote, setSubmittingVote] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchReportData()
    }
  }, [session, resolvedParams.reportId])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch report details
      const reportResponse = await fetch(`/api/quarterly-reports/${resolvedParams.reportId}`)
      
      if (!reportResponse.ok) {
        const errorText = await reportResponse.text()
        throw new Error(`Failed to fetch report: ${reportResponse.status} ${errorText}`)
      }
      
      const reportData = await reportResponse.json()
      setReport(reportData)

      // Fetch votes
      const votesResponse = await fetch(`/api/reports/${resolvedParams.reportId}/votes`)
      
      if (!votesResponse.ok) {
        const errorText = await votesResponse.text()
        throw new Error(`Failed to fetch votes: ${votesResponse.status} ${errorText}`)
      }
      
      const votesData = await votesResponse.json()
      setVotes(votesData.votes || [])
      setVoteStats(votesData.stats || { aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 })

      // Fetch comments
      const commentsResponse = await fetch(`/api/reports/${resolvedParams.reportId}/comments`)
      
      if (!commentsResponse.ok) {
        const errorText = await commentsResponse.text()
        throw new Error(`Failed to fetch comments: ${commentsResponse.status} ${errorText}`)
      }
      
      const commentsData = await commentsResponse.json()
      console.log("Frontend: Comments data received:", commentsData)
      console.log("Frontend: Comments count:", commentsData.length)
      setComments(commentsData)

    } catch (err) {
      console.error("Error fetching report data:", err)
      setError(err instanceof Error ? err.message : "Error loading report data")
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!voteType || voteComment.trim().length < 10) return

    try {
      setSubmittingVote(true)
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: resolvedParams.reportId,
          voteType,
          comment: voteComment.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit vote")
      }

      // Refresh data
      await fetchReportData()
      setShowVoteDialog(false)
      setVoteType(null)
      setVoteComment("")
    } catch (err) {
      console.error("Error submitting vote:", err)
      setError(err instanceof Error ? err.message : "Error submitting vote")
    } finally {
      setSubmittingVote(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    try {
      setSubmittingComment(true)
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: resolvedParams.reportId,
          content: newComment.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit comment")
      }

      // Refresh data
      await fetchReportData()
      setNewComment("")
    } catch (err) {
      console.error("Error submitting comment:", err)
      setError(err instanceof Error ? err.message : "Error submitting comment")
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
          reportId: resolvedParams.reportId,
          content,
          parentCommentId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit reply")
      }

      // Refresh comments
      await fetchReportData()
    } catch (err) {
      console.error("Error submitting reply:", err)
      setError(err instanceof Error ? err.message : "Error submitting reply")
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to like comment")
      }

      // Refresh comments
      await fetchReportData()
    } catch (err) {
      console.error("Error liking comment:", err)
      setError(err instanceof Error ? err.message : "Error liking comment")
    }
  }

  const handleDislikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/dislike`, {
        method: "POST"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to dislike comment")
      }

      // Refresh comments
      await fetchReportData()
    } catch (err) {
      console.error("Error disliking comment:", err)
      setError(err instanceof Error ? err.message : "Error disliking comment")
    }
  }

  const getVoteTypeIcon = (type: string) => {
    switch (type) {
      case "A_FAVOR":
        return <ThumbsUpIcon className="w-4 h-4 text-green-400" />
      case "EN_CONTRA":
        return <ThumbsDownIcon className="w-4 h-4 text-red-400" />
      case "OBJETAR":
        return <AlertTriangleIcon className="w-4 h-4 text-yellow-400" />
      case "ABSTENERSE":
        return <MinusIcon className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const getVoteTypeLabel = (type: string) => {
    switch (type) {
      case "A_FAVOR":
        return "A Favor"
      case "EN_CONTRA":
        return "En Contra"
      case "OBJETAR":
        return "Objetar"
      case "ABSTENERSE":
        return "Abstenerse"
      default:
        return type
    }
  }

  const getObjectionStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
      case "VALIDA":
        return <Badge variant="secondary" className="bg-red-500/20 text-red-400">Valid</Badge>
      case "INVALIDA":
        return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">Invalid</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
          <p className="text-slate-400">Loading report details...</p>
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

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>Report not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/consensus")}
          className="mb-4 text-slate-400 hover:text-slate-200"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Consensus
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-purple-400 flex items-center gap-2">
              <FileTextIcon className="w-8 h-8" />
              {report.workGroup.name} - {report.year} {report.quarter}
            </h1>
            <p className="text-slate-400">
              Quarterly Report Consensus
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {report.consensusStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Details */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-200 mb-2">Detail</h4>
                <p className="text-slate-300">{report.detail}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-200 mb-2">Theory of Change</h4>
                <p className="text-slate-300">{report.theoryOfChange}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-200 mb-2">Plans for Next Quarter</h4>
                <p className="text-slate-300">{report.plans}</p>
              </div>
              <div>
                <h4 className="font-medium text-slate-200 mb-2">Challenges & Learnings</h4>
                <div className="space-y-2">
                  {Array.isArray(report.challenges) ? (
                    report.challenges.map((challenge, index) => (
                      <div key={index} className="text-slate-300">
                        {typeof challenge === 'string' ? (
                          <p>• {challenge}</p>
                        ) : typeof challenge === 'object' && challenge !== null && 'text' in challenge ? (
                          <p>• {challenge.text}</p>
                        ) : (
                          <p>• {String(challenge)}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-300">No challenges recorded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voting Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <ThumbsUpIcon className="w-5 h-5" />
                Cast Your Vote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { type: "A_FAVOR", label: "A Favor", color: "bg-green-600 hover:bg-green-700" },
                  { type: "EN_CONTRA", label: "En Contra", color: "bg-red-600 hover:bg-red-700" },
                  { type: "OBJETAR", label: "Objetar", color: "bg-yellow-600 hover:bg-yellow-700" },
                  { type: "ABSTENERSE", label: "Abstenerse", color: "bg-gray-600 hover:bg-gray-700" }
                ].map((option) => (
                  <Button
                    key={option.type}
                    onClick={() => {
                      setVoteType(option.type as any)
                      setShowVoteDialog(true)
                    }}
                    className={option.color}
                    disabled={report.consensusStatus === "CONSENSED"}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {report.consensusStatus === "CONSENSED" && (
                <Alert>
                  <CheckCircleIcon className="h-4 w-4" />
                  <AlertDescription>This report has been consensed. Voting is closed.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Votes List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Votes & Justifications</CardTitle>
            </CardHeader>
            <CardContent>
              {votes.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No votes yet</p>
              ) : (
                <div className="space-y-4">
                  {votes.map((vote) => (
                    <div key={vote.id} className="border border-slate-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={vote.user.image || undefined} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {vote.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-200">{vote.user.name}</span>
                              <Badge variant="outline">{getVoteTypeLabel(vote.voteType)}</Badge>
                              {vote.objection && getObjectionStatusBadge(vote.objection.status)}
                            </div>
                            <span className="text-sm text-slate-400">{formatDate(vote.createdAt)}</span>
                          </div>
                          <p className="text-slate-300">{vote.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <MessageSquareIcon className="w-5 h-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="mt-2 bg-purple-600 hover:bg-purple-700"
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
              
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={session?.user?.id}
                      onReply={handleReply}
                      onLike={handleLikeComment}
                      onDislike={handleDislikeComment}
                      isAdmin={session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vote Statistics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Vote Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">A Favor:</span>
                  <span className="text-green-400 font-semibold">{voteStats.aFavor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">En Contra:</span>
                  <span className="text-red-400 font-semibold">{voteStats.enContra}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Objeciones:</span>
                  <span className="text-yellow-400 font-semibold">{voteStats.objetar}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Abstenciones:</span>
                  <span className="text-gray-400 font-semibold">{voteStats.abstenerse}</span>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">Total:</span>
                    <span className="text-purple-400">{voteStats.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200">Report Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <BuildingIcon className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">{report.workGroup.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">{report.year} {report.quarter}</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">{report.participants.length} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">{formatDate(report.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">Created by {report.createdBy.name}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vote Dialog */}
      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200">
              Cast Your Vote - {voteType && getVoteTypeLabel(voteType)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Justification (required - minimum 10 characters)
              </label>
              <Textarea
                placeholder="Please explain your vote in detail (minimum 10 characters)..."
                value={voteComment}
                onChange={(e) => setVoteComment(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-200"
                rows={4}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-400">
                  {voteComment.length}/10 characters minimum
                </span>
                {voteComment.length < 10 && voteComment.length > 0 && (
                  <span className="text-xs text-red-400">
                    Need {10 - voteComment.length} more characters
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowVoteDialog(false)}
                disabled={submittingVote}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVote}
                disabled={voteComment.trim().length < 10 || submittingVote}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submittingVote ? "Submitting..." : "Submit Vote"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 