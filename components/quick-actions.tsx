"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  PlusIcon, 
  FileTextIcon, 
  BellIcon, 
  UserIcon, 
  BarChart3Icon, 
  ZapIcon, 
  ArrowRightIcon,
  VoteIcon,
  ClockIcon,
  SettingsIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/lib/types"

interface QuickActionsProps {
  userRole: UserRole
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)
  const [votingCount, setVotingCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch pending proposals count
        const proposalsRes = await fetch("/api/proposals?status=pending")
        const proposals = await proposalsRes.json()
        setPendingCount(proposals.length || 0)

        // Fetch quarterly reports in voting
        const reportsRes = await fetch("/api/reports?consensusStatus=IN_CONSENSUS")
        const reports = await reportsRes.json()
        setVotingCount(reports.length || 0)

        // Mock notification count
        setNotificationCount(Math.floor(Math.random() * 10) + 3)
      } catch (error) {
        console.error("Error fetching counts:", error)
        // Fallback to mock counts
        setPendingCount(3)
        setVotingCount(2)
        setNotificationCount(5)
      }
    }

    fetchCounts()
  }, [])

  const actions = [
    {
      id: "notifications",
      title: "Review Notifications",
      description: "Check your latest updates and alerts",
      icon: <BellIcon className="h-5 w-5" />,
      href: "/dashboard/notifications",
      color: "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30 text-yellow-300",
      iconColor: "text-yellow-400",
      adminOnly: false,
      badge: notificationCount > 0 ? `${notificationCount} New` : undefined,
    },
    {
      id: "pending-proposals",
      title: "View Pending Proposals",
      description: "Review proposals awaiting your vote",
      icon: <FileTextIcon className="h-5 w-5" />,
      href: "/dashboard/proposals?filter=pending",
      color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300",
      iconColor: "text-blue-400",
      adminOnly: false,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined,
    },
    {
      id: "voting-reports",
      title: "Quarterly Reports in Voting",
      description: "View reports currently being voted on",
      icon: <VoteIcon className="h-5 w-5" />,
      href: "/dashboard/consensus",
      color: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300",
      iconColor: "text-purple-400",
      adminOnly: false,
      badge: votingCount > 0 ? `${votingCount} Active` : undefined,
    },
    {
      id: "update-profile",
      title: "Update Profile",
      description: "Edit your profile information and preferences",
      icon: <UserIcon className="h-5 w-5" />,
      href: "/dashboard/profile",
      color: "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-300",
      iconColor: "text-green-400",
      adminOnly: false,
    },
    {
      id: "create-proposal",
      title: "Create New Proposal",
      description: "Start a new governance proposal",
      icon: <PlusIcon className="h-5 w-5" />,
      href: "/dashboard/proposals/create",
      color: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30 text-orange-300",
      iconColor: "text-orange-400",
      adminOnly: true,
      badge: "Admin",
    },
    {
      id: "analytics",
      title: "View Analytics",
      description: "Complete governance analytics and insights",
      icon: <BarChart3Icon className="h-5 w-5" />,
      href: "/dashboard/analytics",
      color: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
      iconColor: "text-indigo-400",
      adminOnly: false,
    },
  ]

  const filteredActions = actions.filter(
    (action) => !action.adminOnly || userRole === "ADMIN" || userRole === "SUPER_ADMIN",
  )

  const handleActionClick = (href: string) => {
    router.push(href)
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ZapIcon className="h-5 w-5 text-yellow-400" />
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </div>
        <CardDescription className="text-slate-400">Fast access to common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-4 justify-start border ${action.color} hover:scale-[1.02] transition-all duration-200 overflow-hidden`}
              onClick={() => handleActionClick(action.href)}
            >
              <div className="flex items-start gap-3 w-full min-w-0">
                <div className={`flex-shrink-0 ${action.iconColor} mt-0.5`}>{action.icon}</div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <h4 className="font-medium text-sm truncate flex-1">{action.title}</h4>
                    {action.badge && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5 bg-slate-700/50 border-slate-600 flex-shrink-0"
                      >
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-80 mb-2 line-clamp-2">{action.description}</p>
                  <div className="flex items-center gap-1 text-xs opacity-60">
                    <span>Go to</span>
                    <ArrowRightIcon className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && (
          <div className="mt-4 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <SettingsIcon className="h-4 w-4" />
              <span>Some actions require admin privileges</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
