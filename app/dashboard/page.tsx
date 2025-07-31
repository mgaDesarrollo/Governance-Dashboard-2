"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import {
  UserCogIcon,
  ActivityIcon,
  UsersIcon,
  HomeIcon,
} from "lucide-react"
import type { UserRole, UserAvailabilityStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import { DashboardCharts } from "@/components/dashboard-charts"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [appUser, setAppUser] = useState({
    name: "",
    email: "",
    image: "",
    role: "CORE_CONTRIBUTOR" as UserRole,
    status: "AVAILABLE" as UserAvailabilityStatus,
  })

  useEffect(() => {
    if (session?.user) {
      setAppUser({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || "CORE_CONTRIBUTOR",
        status: session.user.status || "AVAILABLE",
      })
    }
  }, [session])

  const userRole = appUser.role
  const userStatus = appUser.status

  const getStatusBadgeInfo = (status?: UserAvailabilityStatus) => {
    switch (status) {
      case "AVAILABLE":
        return {
          text: "Available",
          className: "bg-green-500/20 text-green-300 border-green-500/30",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-green-400" />,
        }
      case "BUSY":
        return {
          text: "Busy",
          className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-yellow-400" />,
        }
      case "VERY_BUSY":
        return {
          text: "Very Busy",
          className: "bg-red-500/20 text-red-300 border-red-500/30",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-red-400" />,
        }
      default:
        return {
          text: "Unknown",
          className: "bg-gray-500/20 text-gray-300 border-gray-500/30",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-gray-400" />,
        }
    }
  }

  const statusInfo = getStatusBadgeInfo(userStatus)

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* Welcome Card */}
      {/* Welcome Card - Compact and Modern */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Welcome Section */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-900/80 border-gray-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                  <AvatarImage src={appUser.image || undefined} alt={appUser.name || "User"} />
                  <AvatarFallback className="bg-purple-600/20 text-purple-300 text-lg font-bold">
                    {appUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide mb-2">
                    Welcome back, {appUser.name || "User"}!
                  </h1>
                  <p className="text-gray-400 text-sm font-medium">Ready to participate in governance decisions</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className="px-3 py-1 border-purple-500/50 bg-purple-600/20 text-purple-300 capitalize font-bold"
                >
                  <UserCogIcon className="w-3 h-3 mr-1" />
                  {userRole?.replace("_", " ") || "N/A"}
                </Badge>
                {userStatus && (
                  <Badge variant="outline" className={`px-3 py-1 capitalize font-bold ${statusInfo.className}`}>
                    {statusInfo.icon}
                    {statusInfo.text}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific Info Card */}
        <div className="lg:col-span-1">
          {userRole === "ADMIN" && (
            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 h-full">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <UserCogIcon className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-bold text-purple-300 tracking-wide">Admin Access</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Create and manage proposals with full administrative privileges.
                </p>
              </CardContent>
            </Card>
          )}

          {userRole === "CORE_CONTRIBUTOR" && (
            <Card className="bg-gradient-to-br from-sky-900/30 to-sky-800/20 border-sky-500/30 h-full">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-sky-600/20 rounded-lg">
                    <UsersIcon className="h-5 w-5 text-sky-300" />
                  </div>
                  <h3 className="text-lg font-bold text-sky-300 tracking-wide">Core Contributor</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Vote on proposals and contribute to governance decisions.
                </p>
              </CardContent>
            </Card>
          )}

          {userRole === "SUPER_ADMIN" && (
            <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30 h-full">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <UserCogIcon className="h-5 w-5 text-orange-300" />
                  </div>
                  <h3 className="text-lg font-bold text-orange-300 tracking-wide">Super Admin</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Full system access with user management capabilities.
                </p>
              </CardContent>
            </Card>
          )}

          {userRole !== "ADMIN" && userRole !== "CORE_CONTRIBUTOR" && userRole !== "SUPER_ADMIN" && (
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-600/50 h-full">
              <CardContent className="p-6 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gray-600/20 rounded-lg">
                    <ActivityIcon className="h-5 w-5 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-300 tracking-wide">Community Member</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  Participate in community discussions and stay informed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <DashboardMetrics />
      </div>

      {/* Quick Actions and Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <QuickActions userRole={userRole} />
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <RecentActivity />
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <DashboardCalendar />
      </div>

      {/* Charts and Analytics */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <DashboardCharts />
      </div>
    </div>
  )
}
    