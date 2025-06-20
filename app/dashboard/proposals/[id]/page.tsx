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
} from "lucide-react"
import type { Proposal, ProposalStatusType, VoteTypeEnum } from "@/lib/types"

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false)

  const fetchProposal = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/proposals/${params.id}`)

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
  }, [status, router, params.id])

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

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
  const isExpired = proposal ? isPast(new Date(proposal.expiresAt)) : false
  const canVote = proposal?.status === "IN_REVIEW" && !isExpired

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
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard/proposals")}
        className="mb-6 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Proposals
      </Button>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-900/30 border-red-700 text-red-300">
          <AlertCircleIcon className="h-5 w-5 text-red-400" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl text-slate-100">{proposal.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-slate-400 mt-2">
                    <UserIcon className="h-4 w-4" />
                    {proposal.author.name}
                  </CardDescription>
                </div>
                {getStatusBadge(proposal.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>Created {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    {isExpired
                      ? `Expired ${formatDistanceToNow(new Date(proposal.expiresAt), { addSuffix: true })}`
                      : `Expires ${formatDistanceToNow(new Date(proposal.expiresAt), { addSuffix: true })}`}
                  </span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-line">{proposal.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquareIcon className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!proposal.userHasCommented && proposal.status !== "EXPIRED" && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your comment..."
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
                        <div>
                          <p className="font-medium text-slate-200">{comment.user.name}</p>
                          <p className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-300">{comment.content}</p>
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

        <div>
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Voting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{proposal.positiveVotes}</div>
                  <div className="text-xs text-slate-400">For</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{proposal.negativeVotes}</div>
                  <div className="text-xs text-slate-400">Against</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-400">{proposal.abstainVotes}</div>
                  <div className="text-xs text-slate-400">Abstain</div>
                </div>
              </div>

              {canVote ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400 mb-2">Cast your vote:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={proposal.userVote === "POSITIVE" ? "default" : "outline"}
                      className={`${
                        proposal.userVote === "POSITIVE"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                      }`}
                      onClick={() => handleVote("POSITIVE")}
                      disabled={isSubmittingVote}
                    >
                      {proposal.userVote === "POSITIVE" && <CheckIcon className="mr-1 h-4 w-4" />}
                      <ThumbsUpIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={proposal.userVote === "NEGATIVE" ? "default" : "outline"}
                      className={`${
                        proposal.userVote === "NEGATIVE"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                      }`}
                      onClick={() => handleVote("NEGATIVE")}
                      disabled={isSubmittingVote}
                    >
                      {proposal.userVote === "NEGATIVE" && <CheckIcon className="mr-1 h-4 w-4" />}
                      <ThumbsDownIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={proposal.userVote === "ABSTAIN" ? "default" : "outline"}
                      className={`${
                        proposal.userVote === "ABSTAIN"
                          ? "bg-slate-600 hover:bg-slate-700 text-white"
                          : "bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
                      }`}
                      onClick={() => handleVote("ABSTAIN")}
                      disabled={isSubmittingVote}
                    >
                      {proposal.userVote === "ABSTAIN" && <CheckIcon className="mr-1 h-4 w-4" />}
                      <HandIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert className="bg-slate-700/50 border-slate-600 text-slate-300">
                  {proposal.status === "EXPIRED" ? (
                    <>
                      <TimerIcon className="h-4 w-4 text-slate-400" />
                      <AlertDescription>
                        This proposal has expired without a decision. Voting is no longer available.
                      </AlertDescription>
                    </>
                  ) : proposal.status !== "IN_REVIEW" ? (
                    <>
                      <AlertCircleIcon className="h-4 w-4 text-slate-400" />
                      <AlertDescription>Voting is closed as this proposal has been finalized.</AlertDescription>
                    </>
                  ) : (
                    <>
                      <AlertCircleIcon className="h-4 w-4 text-slate-400" />
                      <AlertDescription>Voting is closed as this proposal has expired.</AlertDescription>
                    </>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>

          {isAdmin && (proposal.status === "IN_REVIEW" || proposal.status === "EXPIRED") && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">
                  {proposal.status === "EXPIRED"
                    ? "This proposal has expired. As an administrator, you can still approve or reject it."
                    : "As an administrator, you can approve or reject this proposal."}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/30"
                    onClick={() => handleUpdateStatus("APPROVED")}
                    disabled={isSubmittingStatus}
                  >
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30"
                    onClick={() => handleUpdateStatus("REJECTED")}
                    disabled={isSubmittingStatus}
                  >
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
