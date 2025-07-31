"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon,
  FileTextIcon,
  PlusIcon,
  MessageSquareIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  HandIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  TimerIcon,
} from "lucide-react"
import type { Proposal, ProposalStatusType } from "@/lib/types"

export default function ProposalsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")

  const fetchProposals = async (status?: ProposalStatusType) => {
    try {
      setIsLoading(true)
      const queryParams = status ? `?status=${status}` : ""
      const response = await fetch(`/api/proposals${queryParams}`)

      if (!response.ok) {
        throw new Error("Failed to fetch proposals")
      }

      const data = await response.json()
      setProposals(data.proposals)
    } catch (error) {
      console.error("Error fetching proposals:", error)
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

    // Fetch proposals based on active tab
    if (activeTab === "all") {
      fetchProposals()
    } else {
      fetchProposals(activeTab as ProposalStatusType)
    }
  }, [status, router, activeTab])

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
        return <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
      case "APPROVED":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case "REJECTED":
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case "EXPIRED":
        return <TimerIcon className="h-5 w-5 text-slate-400" />
      default:
        return null
    }
  }

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white tracking-wide">Proposals</h1>
        </div>

        {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
          <Button
            onClick={() => router.push("/dashboard/proposals/create")}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Proposal
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6 bg-slate-800">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="IN_REVIEW">In Review</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {proposals.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center">
                <FileTextIcon className="mx-auto h-12 w-12 text-slate-500 mb-4" />
                <p className="text-slate-400">No proposals found</p>
                {(session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") && (
                  <Button
                    onClick={() => router.push("/dashboard/proposals/create")}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Your First Proposal
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((proposal) => (
                <Card
                  key={proposal.id}
                  className="bg-slate-800 border-slate-700 hover:border-purple-600/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/proposals/${proposal.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-slate-200 line-clamp-2">{proposal.title}</CardTitle>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1 text-slate-400">
                      <UserIcon className="h-3 w-3" />
                      {proposal.author.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-300 line-clamp-3 mb-4">{proposal.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>Expires: {format(new Date(proposal.expiresAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t border-slate-700 flex justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-green-400">
                        <ThumbsUpIcon className="h-4 w-4" />
                        <span>{proposal.positiveVotes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <ThumbsDownIcon className="h-4 w-4" />
                        <span>{proposal.negativeVotes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <HandIcon className="h-4 w-4" />
                        <span>{proposal.abstainVotes}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MessageSquareIcon className="h-4 w-4" />
                      <span>{proposal._count?.comments || 0}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
