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
import { RichTextDisplay } from "@/components/rich-text-display"
import CommentsSection from "@/components/comments-section"
import CommentVoteButtons from "@/components/comment-vote-buttons"

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
  const [workGroups, setWorkGroups] = useState<Array<{id: string, name: string}>>([])

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
      
      // Si hay workgroups, obtener sus nombres
      if (data.workGroupIds && data.workGroupIds.length > 0) {
        fetchWorkGroups(data.workGroupIds)
      }
    } catch (error) {
      console.error("Error fetching proposal:", error)
      setError("Failed to load proposal details")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWorkGroups = async (workGroupIds: string[]) => {
    try {
      const response = await fetch('/api/workgroups')
      if (response.ok) {
        const allWorkGroups = await response.json()
        const filteredWorkGroups = allWorkGroups.filter((wg: any) => 
          workGroupIds.indexOf(wg.id) !== -1
        )
        setWorkGroups(filteredWorkGroups)
      }
    } catch (error) {
      console.error("Error fetching workgroups:", error)
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
    setProposal(updatedProposal)
    setIsEditDialogOpen(false)
  }

  const getStatusBadge = (status: ProposalStatusType) => {
    switch (status) {
      case "IN_REVIEW":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 font-medium">
            In Review
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/40 font-medium">
            Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/40 font-medium">
            Rejected
          </Badge>
        )
      case "EXPIRED":
        return (
          <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/40 font-medium">
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
        return <ClockIcon className="h-5 w-5 text-yellow-400" />
      case "APPROVED":
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />
      case "REJECTED":
        return <XCircleIcon className="h-5 w-5 text-red-400" />
      case "EXPIRED":
        return <TimerIcon className="h-5 w-5 text-orange-400" />
      default:
        return <ClockIcon className="h-5 w-5 text-blue-400" />
    }
  }

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  const isAuthor = proposal?.author?.id === session?.user?.id
  const isExpired = proposal ? isPast(new Date(proposal.expiresAt)) : false
  const canVote = proposal?.status === "IN_REVIEW" && !isExpired
  const canEdit = isAuthor && proposal?.status === "IN_REVIEW" && !isExpired

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-black text-slate-50 p-4 sm:p-6 lg:p-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/proposals")}
          className="mb-6 bg-black border-slate-700 hover:bg-black text-slate-300 hover:text-slate-100"
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
    <div className="min-h-screen bg-transparent text-slate-50 p-4 sm:p-6 lg:p-8 xl:p-12 font-mac">
      <div className="max-w-7xl mx-auto">
        {/* Header Responsivo */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/proposals")}
              className="p-2 text-slate-400 hover:text-white hover:bg-black/50 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide truncate">
                {proposal.title}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-400 font-medium">
                Proposal Details
              </p>
            </div>
          </div>

          {/* Status Badge y Botones */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {getStatusBadge(proposal.status)}
            {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Edit Proposal
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid Responsivo */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            {/* Basic Information */}
            <div className="border-l-4 border-cyan-600 rounded-sm overflow-hidden shadow-lg mb-6">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-400">Title</label>
                    <p className="text-white text-sm lg:text-base break-words font-medium">{proposal.title}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-purple-400">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proposal.status)}
                      {getStatusBadge(proposal.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-green-400">Author</label>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        {proposal.author.image ? (
                          <img
                            src={proposal.author.image}
                            alt={proposal.author.name}
                            className="h-6 w-6 rounded-full"
                          />
                        ) : (
                          <UserIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-white text-sm lg:text-base truncate font-medium">{proposal.author.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-orange-400">Created</label>
                    <p className="text-white text-sm lg:text-base">
                      {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-l-4 border-indigo-600 rounded-sm overflow-hidden shadow-lg mb-6">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Description</h3>
                </div>
                
                <RichTextDisplay 
                  content={proposal.description || ''} 
                  className="text-white text-sm lg:text-base leading-relaxed"
                />
              </div>
            </div>

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
                      onClick={() => {
                        if (proposal.attachment && typeof proposal.attachment === 'string') {
                          window.open(proposal.attachment, '_blank')
                        }
                      }}
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
              <div className="border-l-4 border-green-600 rounded-sm overflow-hidden shadow-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-600 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                        <path d="M16 16l-4-2-4 2"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Budget Items</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {proposal.budgetItems.map((item: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-l-4 border-green-500 rounded-md">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm lg:text-base truncate">
                            {item.description || `Item ${index + 1}`}
                          </p>
                          {item.category && (
                            <p className="text-green-400 text-xs lg:text-sm font-medium">{item.category}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                          {item.quantity && (
                            <span className="text-blue-300 text-xs lg:text-sm font-medium border border-blue-500 px-2 py-1 rounded-full">
                              Qty: {item.quantity}
                            </span>
                          )}
                          <span className="text-green-300 font-bold text-sm lg:text-base border border-green-500 px-3 py-1 rounded-md">
                            ${item.total || item.amount || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t border-green-500/30">
                      <span className="text-green-400 font-bold text-sm lg:text-base">Total Budget:</span>
                      <span className="text-white font-bold text-xl border-2 border-green-500 px-4 py-2 rounded-md">
                        ${proposal.budgetItems.reduce((sum: number, item: any) => sum + (item.total || item.amount || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Associated WorkGroups */}
            {proposal.workGroupIds && proposal.workGroupIds.length > 0 && (
              <div className="border-l-4 border-purple-600 rounded-sm overflow-hidden shadow-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-600 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Associated WorkGroups</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {workGroups.length > 0 ? (
                      workGroups.map((wg) => (
                        <Badge key={wg.id} variant="outline" className="border-2 border-purple-500 text-white font-medium px-4 py-2 transition-all duration-200">
                          {wg.name}
                        </Badge>
                      ))
                    ) : (
                      proposal.workGroupIds.map((workGroupId: string, index: number) => (
                        <Badge key={workGroupId} variant="outline" className="border-2 border-purple-500 text-white font-medium px-4 py-2 transition-all duration-200">
                          {workGroupId}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attachment */}
            {proposal.attachment && (
              <div className="border-l-4 border-blue-600 rounded-sm overflow-hidden shadow-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Attachment</h3>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border border-slate-600 rounded-md">
                    <div className="text-4xl">
                      {proposal.attachment.includes('.pdf') ? '📄' :
                       proposal.attachment.includes('.doc') || proposal.attachment.includes('.docx') ? '📝' :
                       proposal.attachment.includes('.xls') || proposal.attachment.includes('.xlsx') ? '📊' :
                       proposal.attachment.includes('.ppt') || proposal.attachment.includes('.pptx') ? '📋' :
                       proposal.attachment.includes('.zip') || proposal.attachment.includes('.rar') ? '📦' :
                       '📎'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm lg:text-base truncate">
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
                          if (proposal.attachment && typeof proposal.attachment === 'string') {
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
                </div>
              </div>
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
                      className="min-h-[100px] bg-black border-slate-600 text-slate-50 focus:border-purple-500 mb-2"
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
                      <div key={comment.id} className="bg-black/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-black flex items-center justify-center">
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
                            className="text-slate-400 hover:text-slate-200 hover:bg-black/50"
                          >
                            <MessageSquareIcon className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                        <div className="text-slate-300 whitespace-pre-line mb-3">{renderTextWithLinks(comment.content)}</div>
                        <div className="flex justify-between items-center">
                          <CommentVoteButtons 
                            commentId={comment.id}
                            initialLikes={comment.likes || []}
                            initialDislikes={comment.dislikes || []}
                          />
                        </div>
                        
                        {/* Formulario de respuesta */}
                        {replyingTo === comment.id && (
                          <div className="ml-8 border-l-2 border-slate-600 pl-4 mt-3">
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmitReply(comment.id); }}>
                              <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write your reply..."
                                className="min-h-[80px] bg-black border-slate-600 text-slate-50 focus:border-purple-500 mb-2"
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
                                  className="border-slate-600 text-slate-300 hover:bg-black"
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
                              <div key={reply.id} className="bg-black/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-black flex items-center justify-center">
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
            <ProposalTimeline
              createdAt={proposal.createdAt}
              expiresAt={proposal.expiresAt}
              status={proposal.status}
              updatedAt={proposal.updatedAt}
              consensusDate={proposal.consensusDate}
            />

            {/* Consensus Tracking */}
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

            {/* Status Management - Solo para Admins */}
            {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
              <div className="border-l-4 border-purple-600 rounded-sm overflow-hidden shadow-lg mb-6">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-600 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <path d="m9 12 2 2 4-4"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Status Management</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleUpdateStatus("APPROVED")}
                        disabled={isSubmittingStatus || proposal.status === "APPROVED"}
                        className={`
                          ${proposal.status === "APPROVED" 
                            ? "bg-green-600 ring-2 ring-green-500" 
                            : "bg-green-600 hover:bg-green-500"}
                          text-white font-medium rounded-md p-4 flex items-center justify-center gap-3 transition-all duration-300 shadow-md
                        `}
                      >
                        <div className="bg-green-700 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        </div>
                        <span className="text-lg">Approve</span>
                      </button>
                      
                      <button 
                        onClick={() => handleUpdateStatus("REJECTED")}
                        disabled={isSubmittingStatus || proposal.status === "REJECTED"}
                        className={`
                          ${proposal.status === "REJECTED" 
                            ? "bg-red-600 ring-2 ring-red-500" 
                            : "bg-red-600 hover:bg-red-500"}
                          text-white font-medium rounded-md p-4 flex items-center justify-center gap-3 transition-all duration-300 shadow-md
                        `}
                      >
                        <div className="bg-red-700 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                        </div>
                        <span className="text-lg">Reject</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleUpdateStatus("IN_REVIEW")}
                      disabled={isSubmittingStatus || proposal.status === "IN_REVIEW"}
                      className={`
                        w-full ${proposal.status === "IN_REVIEW" 
                          ? "bg-amber-600 ring-2 ring-amber-500" 
                          : "bg-amber-600 hover:bg-amber-500"}
                        text-white font-medium rounded-md p-3 flex items-center justify-center gap-3 transition-all duration-300 shadow-md
                      `}
                    >
                      <div className="bg-amber-700 p-1.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </div>
                      <span className="text-base">Mark for Review</span>
                    </button>
                    
                    {isSubmittingStatus && (
                      <div className="flex justify-center py-2">
                        <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="border-l-4 border-blue-600 rounded-sm overflow-hidden shadow-lg mb-6">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M3 3v18h18"/>
                      <path d="M18 17V9"/>
                      <path d="M13 17V5"/>
                      <path d="M8 17v-3"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Quick Stats</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Positive Votes */}
                  <div className="border-l-4 border-green-500 rounded-md p-4 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-600 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-4xl font-bold text-white tracking-tight">{proposal.positiveVotes}</div>
                        <div className="text-sm text-green-400 font-medium uppercase tracking-wider">Positive Votes</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Negative Votes */}
                  <div className="border-l-4 border-red-500 rounded-md p-4 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-600 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="m6 15 6-6 6 6"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-4xl font-bold text-white tracking-tight">{proposal.negativeVotes}</div>
                        <div className="text-sm text-red-400 font-medium uppercase tracking-wider">Negative Votes</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Abstain Votes */}
                  <div className="border-l-4 border-amber-500 rounded-md p-4 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-600 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-4xl font-bold text-white tracking-tight">{proposal.abstainVotes}</div>
                        <div className="text-sm text-amber-400 font-medium uppercase tracking-wider">Abstain</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comments Count */}
                  <div className="border-l-4 border-blue-500 rounded-md p-4 shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 p-3 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-4xl font-bold text-white tracking-tight">{proposal._count?.comments || 0}</div>
                        <div className="text-sm text-blue-400 font-medium uppercase tracking-wider">Comments</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Espacio adicional para separación visual */}
            <div className="h-4"></div>
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
