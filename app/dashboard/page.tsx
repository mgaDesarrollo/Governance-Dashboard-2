"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import {
  FileTextIcon,
  BellIcon,
  BarChart3Icon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [appUser, setAppUser] = useState({
    name: "User",
    email: "user@example.com",
    image: "",
    role: "COMMUNITY_MEMBER" as UserRole,
    status: "AVAILABLE" as UserAvailabilityStatus,
  })

  useEffect(() => {
    if (session?.user) {
      setAppUser({
        name: session.user.name || "User",
        email: session.user.email || "user@example.com",
        image: session.user.image || "",
        role: "COMMUNITY_MEMBER" as UserRole,
        status: "AVAILABLE" as UserAvailabilityStatus,
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
    <div className="space-y-6 max-w-none">
      {/* Welcome Card */}
      {/* Welcome Card - Compact and Modern */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Welcome Section */}
        <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800/60 border border-purple-500/50 relative overflow-hidden">
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
            <Card className="bg-gradient-to-br from-black/50 to-black/30 border-gray-600/50 h-full">
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
  <div className="bg-gray-800 border border-blue-500/50 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-pink-500/10 opacity-20"></div>
        <div className="relative">
          <DashboardMetrics />
        </div>
      </div>

      {/* Quick Actions and Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda - Quick Actions */}
        <div className="bg-black rounded-lg overflow-hidden border border-amber-600/40">
          <div className="p-4 border-b border-amber-600/30 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
              <p className="text-sm text-slate-400">Accesos rápidos a tareas frecuentes</p>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Active Proposals */}
            <div
              onClick={() => router.push("/dashboard/proposals")}
              className="bg-blue-500 rounded-lg overflow-hidden cursor-pointer border border-blue-700/40 hover:shadow-lg hover:shadow-blue-500/20 transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <FileTextIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Active Proposals</h4>
                  </div>
                  <p className="text-sm text-black/80">Browse ongoing proposals</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Quarterly Reports */}
            <div
              onClick={() => router.push("/dashboard/proposals")}
              className="bg-indigo-500 rounded-lg overflow-hidden cursor-pointer border border-indigo-700/40 hover:shadow-lg hover:shadow-indigo-500/20 transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <FileTextIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Quarterly Reports</h4>
                  </div>
                  <p className="text-sm text-black/80">Review quarterly report proposals</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div
              onClick={() => router.push("/dashboard/notifications")}
              className="bg-yellow-500 rounded-lg overflow-hidden cursor-pointer border border-yellow-700/40 hover:shadow-lg hover:shadow-yellow-500/20 transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <BellIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Notifications</h4>
                  </div>
                  <p className="text-sm text-black/80">Latest updates and alerts</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div
              onClick={() => router.push("/dashboard/analytics")}
              className="bg-sky-500 rounded-lg overflow-hidden cursor-pointer border border-sky-700/40 hover:shadow-lg hover:shadow-sky-500/20 transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <BarChart3Icon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Analytics</h4>
                  </div>
                  <p className="text-sm text-black/80">Governance analytics dashboard</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Update your profile */}
            <div
              onClick={() => router.push("/dashboard/profile/edit")}
              className="bg-green-500 rounded-lg overflow-hidden cursor-pointer border border-green-700/40 hover:shadow-lg hover:shadow-green-500/20 transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <UserIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Update your profile</h4>
                  </div>
                  <p className="text-sm text-black/80">Edit your profile information</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* Consent Process Result */}
            <div
              onClick={() => router.push("/dashboard/consensus")}
              className="bg-purple-500 rounded-lg overflow-hidden cursor-pointer border border-purple-700/40 hover:shadow-lg hover:shadow-purple-500/20 transition"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="p-2 bg-white rounded-md">
                  <CheckCircleIcon className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 p-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-black">Consent Process Result</h4>
                  </div>
                  <p className="text-sm text-black/80">View consensus process results</p>
                </div>
              </div>
              <div className="bg-black/30 p-2">
                <div className="flex items-center gap-1 text-xs text-white">
                  <span>Go to</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Columna Derecha - Reorganizada */}
        <div className="space-y-6">
          {/* 1. Quick Start */}
          <div className="bg-gray-900 border-2 border-cyan-600 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-cyan-600/5 to-blue-500/10 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2 text-cyan-400" />
                Quick Start
              </h3>
              <p className="text-gray-400 text-sm">Acceso rápido a las funciones principales del dashboard</p>
              {/* Aquí puedes agregar contenido específico de Quick Start */}
            </div>
          </div>
          
          {/* 2. Consensus Tracking */}
          <div className="bg-gray-900 border-2 border-amber-600 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-orange-500/10 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 mr-2">
                  <path d="M12 2v4"></path>
                  <path d="M12 18v4"></path>
                  <path d="m4.93 4.93 2.83 2.83"></path>
                  <path d="m16.24 16.24 2.83 2.83"></path>
                  <path d="M2 12h4"></path>
                  <path d="M18 12h4"></path>
                  <path d="m4.93 19.07 2.83-2.83"></path>
                  <path d="m16.24 7.76 2.83-2.83"></path>
                </svg>
                Consensus Tracking
              </h3>
              <p className="text-gray-400 text-sm">Seguimiento del consenso en las propuestas activas</p>
              {/* Aquí puedes agregar el componente ConsensusTracking */}
            </div>
          </div>
          
          {/* 3. Timeline */}
          <div className="bg-gray-900 border-2 border-indigo-600 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-indigo-600/5 to-violet-500/10 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 mr-2">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"></path>
                  <path d="M12 7v5l3 3"></path>
                </svg>
                Timeline
              </h3>
              <p className="text-gray-400 text-sm">Línea de tiempo de las propuestas y eventos</p>
              {/* Aquí puedes agregar el componente ProposalTimeline */}
            </div>
          </div>
          
          {/* 4. Status Management */}
          <div className="bg-gray-900 border-2 border-rose-600 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-rose-600/5 to-pink-500/10 opacity-20"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400 mr-2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                Status Management
              </h3>
              <p className="text-gray-400 text-sm">Gestión del estado de las propuestas y usuarios</p>
              {/* Aquí puedes agregar contenido de Status Management */}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-red-500/10 opacity-20"></div>
        <div className="relative">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400 mr-2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
              <line x1="16" x2="16" y1="2" y2="6"></line>
              <line x1="8" x2="8" y1="2" y2="6"></line>
              <line x1="3" x2="21" y1="10" y2="10"></line>
            </svg>
            Calendar
          </h3>
          <DashboardCalendar />
        </div>
      </div>
    </div>
  )
}
    