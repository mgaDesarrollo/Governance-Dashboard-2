"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { formatDistanceToNow, isPast } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EditProposalDialog } from "@/components/edit-proposal-dialog"
import ProposalTimeline from "@/components/proposal-timeline"
import ConsensusTracking from "@/components/consensus-tracking"
import {
  ArrowLeftIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HandIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  SendIcon,
  MessageSquareIcon,
  CheckIcon,
  TimerIcon,
  EditIcon,
} from "lucide-react"
import type { Proposal, ProposalStatusType, VoteTypeEnum } from "@/lib/types"

// Función simple para convertir URLs en enlaces
function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline break-all"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const { id: proposalId } = params
  const router = useRouter()
  const { data: session, status } = useSession()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [workGroups, setWorkGroups] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  const fetchProposal = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/proposals/${proposalId}`)

      if (!response.ok) {
        if (response.status === 404) {
          router.replace("/dashboard/proposals")
          return
        }
        throw new Error("Failed to fetch proposal")
      }

      const data = await response.json()
      setProposal(data)
    } catch (error) {
      console.error("Error fetching proposal:", error)
      setError("Failed to load proposal details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/")
      return
    }

    fetchProposal()
  }, [status, router, proposalId])

  useEffect(() => {
    // Obtener nombres de workgroups asociados
    if (proposal?.workGroupIds && proposal.workGroupIds.length > 0) {
      fetch('/api/workgroups')
        .then(res => res.ok ? res.json() : [])
        .then(data => setWorkGroups(data))
        .catch(() => setWorkGroups([]));
    }
  }, [proposal?.workGroupIds]);

  // Guardar loading y ausencia de proposal antes del render principal
  if (isLoading) {
    return <div className="p-4 text-center text-white">Loading proposal...</div>
  }
  if (!proposal) {
    return <div className="p-4 text-center text-red-400">Proposal not found.</div>
  }
  // Cálculo de totales y porcentajes para presupuesto
  const totalBudget = proposal.budgetItems?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  const adminBudget = proposal.budgetItems?.filter((item: any) => item.type === 'Admin')
    .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;
  const operativeBudget = proposal.budgetItems?.filter((item: any) => item.type === 'Operative')
    .reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0;

  const handleVote = async (voteType: VoteTypeEnum) => {
    if (!proposal || isSubmittingVote) return

    try {
      setIsSubmittingVote(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit vote")
      }

      const data = await response.json()
      setProposal((prev) => {
        if (!prev) return null
        return {
          ...prev,
          positiveVotes: data.proposal.positiveVotes,
          negativeVotes: data.proposal.negativeVotes,
          abstainVotes: data.proposal.abstainVotes,
          userVote: data.userVote,
        }
      })
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your vote")
    } finally {
      setIsSubmittingVote(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!proposal || !comment.trim() || isSubmittingComment) return

    try {
      setIsSubmittingComment(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit comment")
      }

      const newComment = await response.json()
      setProposal((prev) => {
        if (!prev) return null
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])],
          userHasCommented: true,
        }
      })
      setComment("")
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your comment")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleSubmitReply = async (commentId: string) => {
    if (!proposal || !replyContent.trim() || isSubmittingReply) return

    try {
      setIsSubmittingReply(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: replyContent,
          parentId: commentId 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit reply")
      }

      const newReply = await response.json()
      setProposal((prev) => {
        if (!prev) return null
        return {
          ...prev,
          comments: prev.comments?.map(comment => 
            comment.id === commentId 
              ? { ...comment, replies: [...(comment.replies || []), newReply] }
              : comment
          ) || []
        }
      })
      setReplyContent("")
      setReplyingTo(null)
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your reply")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleUpdateStatus = async (newStatus: ProposalStatusType) => {
    if (!proposal || isSubmittingStatus) return

    try {
      setIsSubmittingStatus(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update proposal status")
      }

      const updatedProposal = await response.json()
      setProposal((prev) => {
        if (!prev) return null
        return {
          ...prev,
          status: updatedProposal.status,
        }
      })
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the proposal status")
    } finally {
      setIsSubmittingStatus(false)
    }
  }

  const handleEditSuccess = (updatedProposal: Proposal) => {
    // Merge updated fields into existing proposal to preserve relations like author
    setProposal((prev) => prev ? { ...prev, ...updatedProposal } : updatedProposal)
    setIsEditDialogOpen(false)
  }

  const getStatusBadge = (status: ProposalStatusType) => {
    switch (status) {
      case "IN_REVIEW":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            In Review
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Rejected
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge variant="outline" className="bg-slate-500/10 text-slate-400 border-slate-500/20">
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  const getStatusIcon = (status: ProposalStatusType) => {
    switch (status) {
      case "IN_REVIEW":
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      case "APPROVED":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case "EXPIRED":
        return <TimerIcon className="h-4 w-4 text-slate-400" />
      default:
        return <ClockIcon className="h-4 w-4 text-slate-400" />
    }
  }

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  const isAuthor = proposal?.author?.id === session?.user?.id
  const isExpired = proposal ? isPast(new Date(proposal.expiresAt)) : false
  const canVote = proposal?.status === "IN_REVIEW" && !isExpired
  const canEdit = isAuthor && proposal?.status === "IN_REVIEW" && !isExpired

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/proposals")}
          className="mb-6 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Proposals
        </Button>

        <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
          <AlertCircleIcon className="h-5 w-5 text-red-400" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Proposal not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-50 p-4 sm:p-6 lg:p-8 xl:p-12">
      <div className="max-w-7xl mx-auto">

        {/* Main Content Grid Responsivo */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            {/* Basic Information */}
            <Card className="bg-transparent border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg lg:text-xl text-white">Basic Information</CardTitle>
                  {canEdit && (
                    <Button
                      onClick={() => setIsEditDialogOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      <EditIcon className="mr-2 h-4 w-4" />
                      Edit Proposal
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Title</label>
                    <p className="text-slate-200 text-sm lg:text-base break-words">{proposal.title}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Author</label>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                        {proposal.author.image ? (
                          <img
                            src={proposal.author.image}
                            alt={proposal.author.name}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <UserIcon className="h-3 w-3 text-slate-400" />
                        )}
                      </div>
                      <span className="text-slate-200 text-sm lg:text-base truncate">{proposal.author.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Created</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Updated</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {formatDistanceToNow(new Date(proposal.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Expired</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {formatDistanceToNow(new Date(proposal.expiresAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Type</label>
                    <p className="text-slate-200 text-sm lg:text-base">
                      {proposal.proposalType === 'COMMUNITY_PROPOSAL' ? 'Community Proposal' : 'Quarterly Report & Proposal'}
                    </p>
                  </div>
                  {proposal.proposalType === 'QUARTERLY_REPORT' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-400">Quarter</label>
                      <p className="text-slate-200 text-sm lg:text-base">
                        {proposal.quarter}
                      </p>
                    </div>
                  )}
                </div>
                {/* Relevant Links in Basic Information */}
                {proposal.links && proposal.links.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-400">Relevant Links</label>
                    <ul className="list-disc pl-5">
                      {proposal.links.map((link: string, idx: number) => (
                        <li key={idx}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline break-all"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description (HTML enriquecido) */}
            <Card className="bg-transparent border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <div className="text-slate-200 text-sm lg:text-base leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: proposal.description || "" }} />
                </div>
              </CardContent>
            </Card>

            {/* Attachment */}
            {proposal.attachment && (
              <Card className="bg-transparent border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Attachment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => proposal.attachment && window.open(proposal.attachment, '_blank')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download Attachment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget Items */}
            {proposal.budgetItems && Array.isArray(proposal.budgetItems) && proposal.budgetItems.length > 0 && (
              <Card className="bg-transparent border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Budget Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {proposal.budgetItems.map((item: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-600">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 font-medium text-sm lg:text-base truncate">
                            {item.description || `Item ${index + 1}`}
                          </p>
                          {item.type && (
                            <p className="text-slate-400 text-xs lg:text-sm">{item.type}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          {item.type && (
                            <span className="text-slate-400 text-xs lg:text-sm">
                              {item.type}
                            </span>
                          )}
                          <span className="text-green-400 font-semibold text-sm lg:text-base">
                            ${item.total || item.amount || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-600">
                      <span className="text-slate-300 font-semibold text-sm lg:text-base">Total Budget:</span>
                      <span className="text-green-400 font-bold text-lg">
                        ${totalBudget.toFixed(2)}
                      </span>
                    </div>
                    {/* Percent breakdown for Admin and Operative */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-300 text-sm">
                        Admin: {totalBudget > 0 ? ((adminBudget / totalBudget) * 100).toFixed(1) : '0'}%
                      </span>
                      <span className="text-slate-300 text-sm">
                        Operative: {totalBudget > 0 ? ((operativeBudget / totalBudget) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Associated WorkGroups (mostrar nombre) */}
            {proposal.workGroupIds && proposal.workGroupIds.length > 0 && (
              <Card className="bg-transparent border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Associated WorkGroups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {proposal.workGroupIds.map((workGroupId: string) => {
                      const wg = workGroups.find(wg => wg.id === workGroupId);
                      return (
                        <Badge key={workGroupId} variant="outline" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                          {wg ? wg.name : workGroupId}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachment */}
            {proposal.attachment && (
              <Card className="bg-transparent border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Attachment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-600">
                    <div className="text-4xl">
                      {proposal.attachment.includes('.pdf') ? '📄' :
                       proposal.attachment.includes('.doc') || proposal.attachment.includes('.docx') ? '📝' :
                       proposal.attachment.includes('.xls') || proposal.attachment.includes('.xlsx') ? '📊' :
                       proposal.attachment.includes('.ppt') || proposal.attachment.includes('.pptx') ? '📋' :
                       proposal.attachment.includes('.zip') || proposal.attachment.includes('.rar') ? '📦' :
                       '📎'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 font-medium text-sm lg:text-base truncate">
                        {proposal.attachment.split('/').pop() || 'Attachment'}
                      </p>
                      <p className="text-slate-400 text-xs lg:text-sm">
                        {proposal.attachment.includes('.pdf') ? 'Documento PDF' :
                         proposal.attachment.includes('.doc') || proposal.attachment.includes('.docx') ? 'Documento Word' :
                         proposal.attachment.includes('.xls') || proposal.attachment.includes('.xlsx') ? 'Hoja de cálculo Excel' :
                         proposal.attachment.includes('.ppt') || proposal.attachment.includes('.pptx') ? 'Presentación PowerPoint' :
                         proposal.attachment.includes('.zip') || proposal.attachment.includes('.rar') ? 'Archivo comprimido' :
                         'Archivo adjunto'}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        try {
                          if (proposal.attachment) {
                            const link = document.createElement('a');
                            link.href = proposal.attachment;
                            link.download = proposal.attachment.split('/').pop() || 'attachment';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        } catch (error) {
                          console.error('Error downloading file:', error);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm px-3 py-2"
                    >
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card className="bg-transparent border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white flex items-center gap-2">
                  <MessageSquareIcon className="h-5 w-5" />
                  Comments & Discussion
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!proposal.userHasCommented && proposal.status !== "EXPIRED" && (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add your comment or feedback..."
                      className="min-h-[100px] bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500 mb-2"
                      disabled={isSubmittingComment}
                    />
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={!comment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <SendIcon className="mr-2 h-4 w-4" />
                          Submit Comment
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {proposal.comments && proposal.comments.length > 0 ? (
                  <div className="space-y-4">
                    {proposal.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center">
                            {comment.user.image ? (
                              <img
                                src={comment.user.image || "/placeholder.svg"}
                                alt={comment.user.name}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <UserIcon className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-200">{comment.user.name}</p>
                            <p className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-slate-400 hover:text-slate-200 hover:bg-slate-600/50"
                          >
                            <MessageSquareIcon className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                        <div className="text-slate-300 whitespace-pre-line mb-3">{renderTextWithLinks(comment.content)}</div>
                        
                        {/* Formulario de respuesta */}
                        {replyingTo === comment.id && (
                          <div className="ml-8 border-l-2 border-slate-600 pl-4 mt-3">
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitReply(comment.id); }}>
                              <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                className="min-h-[80px] bg-slate-800 border-slate-600 text-slate-50 focus:border-purple-500 mb-2"
                                disabled={isSubmittingReply}
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="submit"
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                  disabled={!replyContent.trim() || isSubmittingReply}
                                >
                                  {isSubmittingReply ? (
                                    <>
                                      <div className="animate-spin mr-2 h-3 w-3 border-2 border-t-transparent border-white rounded-full"></div>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <SendIcon className="mr-2 h-3 w-3" />
                                      Send Reply
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setReplyingTo(null)
                                    setReplyContent("")
                                  }}
                                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </div>
                        )}
                        
                        {/* Mostrar respuestas existentes */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-8 border-l-2 border-slate-600 pl-4 mt-3 space-y-3">
                            {comment.replies.map((reply: any) => (
                              <div key={reply.id} className="bg-slate-800/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-600 flex items-center justify-center">
                                    {reply.user.image ? (
                                      <img
                                        src={reply.user.image || "/placeholder.svg"}
                                        alt={reply.user.name}
                                        className="h-6 w-6 rounded-full"
                                      />
                                    ) : (
                                      <UserIcon className="h-3 w-3 text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-200 text-sm">{reply.user.name}</p>
                                    <p className="text-xs text-slate-400">
                                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-slate-300 text-sm whitespace-pre-line">{renderTextWithLinks(reply.content)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquareIcon className="mx-auto h-12 w-12 text-slate-500 mb-2" />
                    <p className="text-slate-400">No comments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-4 lg:space-y-6">
            {/* Timeline de la Propuesta */}
            <Card className="bg-transparent border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white">Proposal Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ProposalTimeline
                  createdAt={proposal.createdAt}
                  expiresAt={proposal.expiresAt}
                  status={proposal.status}
                  updatedAt={proposal.updatedAt}
                  consensusDate={proposal.consensusDate}
                />
              </CardContent>
            </Card>

            {/* Consensus Tracking */}
            <Card className="bg-transparent border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white">Consensus</CardTitle>
              </CardHeader>
              <CardContent>
                <ConsensusTracking
                  proposal={proposal}
                  onVote={handleVote}
                  onComment={async (content: string) => {
                    // TODO: Implementar comentarios generales
                    console.log('General comment:', content)
                  }}
                  onReply={async (content: string, commentId: string) => {
                    // TODO: Implementar respuesta a comentarios
                    console.log('Reply to comment:', commentId, content)
                  }}
                  isSubmittingVote={isSubmittingVote}
                  isSubmittingComment={isSubmittingComment}
                  canVote={canVote}
                />
              </CardContent>
            </Card>

            {/* Status Management - Solo para Admins */}
            {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
              <Card className="bg-transparent border-slate-700">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Status Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleUpdateStatus("APPROVED")}
                      disabled={isSubmittingStatus || proposal.status === "APPROVED"}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-xs lg:text-sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus("REJECTED")}
                      disabled={isSubmittingStatus || proposal.status === "REJECTED"}
                      variant="destructive"
                      className="text-xs lg:text-sm"
                    >
                      Reject
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleUpdateStatus("IN_REVIEW")}
                    disabled={isSubmittingStatus || proposal.status === "IN_REVIEW"}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs lg:text-sm"
                  >
                    Mark for Review
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-transparent border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-800/30 rounded-lg border border-green-600">
                    <div className="text-2xl font-bold text-green-400">{proposal.positiveVotes}</div>
                    <div className="text-xs text-slate-400">Positive</div>
                  </div>
                  <div className="p-3 bg-red-800/30 rounded-lg border border-red-600">
                    <div className="text-2xl font-bold text-red-400">{proposal.negativeVotes}</div>
                    <div className="text-xs text-slate-400">Negative</div>
                  </div>
                  <div className="p-3 bg-yellow-800/30 rounded-lg border border-yellow-600">
                    <div className="text-2xl font-bold text-yellow-400">{proposal.abstainVotes}</div>
                    <div className="text-xs text-slate-400">Abstain</div>
                  </div>
                  <div className="p-3 bg-blue-800/30 rounded-lg border border-blue-600">
                    <div className="text-2xl font-bold text-blue-400">{proposal._count?.comments || 0}</div>
                    <div className="text-xs text-slate-400">Comments</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Relevant Links */}
            {proposal.links && proposal.links.length > 0 && (
              <Card className="bg-transparent border-slate-700 mt-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg lg:text-xl text-white">Relevant Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {proposal.links.map((link: string, idx: number) => (
                      <li key={idx}>
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline break-all">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6">
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Edit Dialog */}
        <EditProposalDialog
          proposal={proposal}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  )
}
