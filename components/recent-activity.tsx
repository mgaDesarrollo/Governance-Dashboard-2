"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FileTextIcon,
  VoteIcon,
  RefreshCwIcon,
  UserPlusIcon,
  ClockIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "proposal_created" | "vote_cast" | "status_changed" | "member_joined"
  title: string
  description: string
  user: {
    name: string
    image?: string
  }
  timestamp: Date
  metadata?: {
    proposalId?: string
    voteType?: string
    oldStatus?: string
    newStatus?: string
  }
}

// Mock data - en producción esto vendría de tu API
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "proposal_created",
    title: "New Proposal: Q1 2024 Budget Allocation",
    description: "Created a new proposal for quarterly budget distribution",
    user: { name: "Alice Johnson", image: "/placeholder.svg?height=32&width=32" },
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    metadata: { proposalId: "prop-123" },
  },
  {
    id: "2",
    type: "vote_cast",
    title: "Voted on Marketing Strategy Proposal",
    description: "Cast a positive vote on the marketing initiative",
    user: { name: "Bob Smith", image: "/placeholder.svg?height=32&width=32" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    metadata: { proposalId: "prop-456", voteType: "POSITIVE" },
  },
  {
    id: "3",
    type: "status_changed",
    title: "Proposal Status Updated",
    description: "Community Outreach proposal moved to approved status",
    user: { name: "Carol Davis", image: "/placeholder.svg?height=32&width=32" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    metadata: { proposalId: "prop-789", oldStatus: "VOTING", newStatus: "APPROVED" },
  },
  {
    id: "4",
    type: "member_joined",
    title: "New Member Joined",
    description: "David Wilson joined as a Core Contributor",
    user: { name: "David Wilson", image: "/placeholder.svg?height=32&width=32" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    id: "5",
    type: "vote_cast",
    title: "Voted on Technical Upgrade Proposal",
    description: "Cast an abstain vote on the infrastructure update",
    user: { name: "Eva Martinez", image: "/placeholder.svg?height=32&width=32" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    metadata: { proposalId: "prop-101", voteType: "ABSTAIN" },
  },
]

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "proposal_created":
      return <FileTextIcon className="h-4 w-4 text-blue-400" />
    case "vote_cast":
      return <VoteIcon className="h-4 w-4 text-green-400" />
    case "status_changed":
      return <RefreshCwIcon className="h-4 w-4 text-orange-400" />
    case "member_joined":
      return <UserPlusIcon className="h-4 w-4 text-purple-400" />
    default:
      return <ClockIcon className="h-4 w-4 text-slate-400" />
  }
}

const getActivityBadge = (item: ActivityItem) => {
  switch (item.type) {
    case "proposal_created":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
          New Proposal
        </Badge>
      )
    case "vote_cast":
      const voteType = item.metadata?.voteType
      if (voteType === "POSITIVE") {
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-300 border-green-500/30">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Positive Vote
          </Badge>
        )
      } else if (voteType === "NEGATIVE") {
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-300 border-red-500/30">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Negative Vote
          </Badge>
        )
      } else {
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
            Abstain
          </Badge>
        )
      }
    case "status_changed":
      return (
        <Badge variant="outline" className="bg-orange-500/10 text-orange-300 border-orange-500/30">
          Status Update
        </Badge>
      )
    case "member_joined":
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
          New Member
        </Badge>
      )
    default:
      return null
  }
}

export function RecentActivity() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </div>
          <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
            Live Feed
          </Badge>
        </div>
        <CardDescription className="text-slate-400">Latest updates from the community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-medium text-slate-100 truncate">{activity.title}</h4>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-2">{activity.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={activity.user.image || "/placeholder.svg"} alt={activity.user.name} />
                    <AvatarFallback className="bg-slate-600 text-slate-300 text-xs">
                      {activity.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-300">{activity.user.name}</span>
                </div>

                {getActivityBadge(activity)}
              </div>
            </div>
          </div>
        ))}

        <div className="text-center pt-2">
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all activity →
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
