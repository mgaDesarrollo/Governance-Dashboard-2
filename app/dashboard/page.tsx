"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  UserCogIcon,
  AlertTriangleIcon,
  FileTextIcon,
  TimerIcon,
  SettingsIcon,
  ActivityIcon,
  UsersIcon,
  HomeIcon,
  BarChart3Icon,
  BellIcon,
  HelpCircleIcon,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { UserRole, UserAvailabilityStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecentActivity } from "@/components/recent-activity"
import { QuickActions } from "@/components/quick-actions"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import { DashboardCharts } from "@/components/dashboard-charts"

// Definir los elementos del menú con permisos
const getMenuItems = (userRole: UserRole) => {
  const baseItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HomeIcon,
      description: "Overview and main dashboard",
    },
    {
      title: "Proposals",
      url: "/dashboard/proposals",
      icon: FileTextIcon,
      description: "View and vote on community proposals",
    },
    {
      title: "Collaborators",
      url: "/dashboard/collaborators",
      icon: UsersIcon,
      description: "Browse profiles of community members",
    },
    {
      title: "WorkGroups & Guilds",
      url: "/dashboard/workgroups",
      icon: ActivityIcon,
      description: "Control panel for workgroups and guilds",
    },
    {
      title: "Quarterly Reports",
      url: "/dashboard/quarterly-reports",
      icon: BarChart3Icon,
      description: "Quarterly reports and budgets",
    },
    {
      title: "Consensus",
      url: "/dashboard/consensus",
      icon: FileTextIcon,
      description: "Vote and comment on quarterly reports",
    },
  ]

  const adminItems = [
    {
      title: "Check Expired Proposals",
      url: "/dashboard/admin/check-expired-proposals",
      icon: TimerIcon,
      description: "Update status of expired proposals",
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3Icon,
      description: "View detailed analytics and reports",
    },
    {
      title: "User Management",
      url: "/dashboard/user-management",
      icon: UserCogIcon,
      description: "Manage user accounts and permissions",
    },
  ]

  const supportItems = [
    {
      title: "Help",
      url: "/dashboard/help",
      icon: HelpCircleIcon,
      description: "Get help and documentation",
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: UserCogIcon,
      description: "Edit your profile and settings",
    },
  ]

  // Filtrar elementos según el rol del usuario
  const mainItems = baseItems
  const settingsItems = userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? adminItems : []
  const supportItemsFiltered = supportItems

  return {
    main: mainItems,
    settings: settingsItems,
    support: supportItemsFiltered,
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPath, setCurrentPath] = useState("")

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/api/auth/signin")
    return null
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <Alert variant="destructive" className="max-w-md bg-red-900/30 border-red-700 text-red-300">
          <AlertTriangleIcon className="h-5 w-5 text-red-400" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            There was an error during the login process. Please try signing out and signing back in. (Error:{" "}
            {(session as any).error})
          </AlertDescription>
        </Alert>
        <Button onClick={() => signOut({ callbackUrl: "/" })} className="mt-4">
          Sign Out
        </Button>
      </div>
    )
  }

  const appUser = session.user
  const userRole = appUser.role as UserRole
  const userStatus = appUser.status as UserAvailabilityStatus | undefined
  const menuItems = getMenuItems(userRole)

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
    <SidebarProvider>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar className="border-gray-700">
          <SidebarHeader className="border-b border-gray-700">
            <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-700/50">
              <LayoutDashboardIcon className="h-8 w-8 text-purple-400" />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white tracking-wide">Governance</h1>
                <p className="text-xs text-gray-400 font-medium">Dashboard</p>
              </div>
            </div>

            {/* User information with profile image */}
            <div className="flex items-center gap-3 p-3 text-sm bg-gray-900/50 rounded-lg mx-2">
              <Avatar className="h-8 w-8 border-2 border-purple-500/30">
                <AvatarImage src={appUser.image || undefined} alt={appUser.name || "User"} />
                <AvatarFallback className="bg-purple-600/20 text-purple-300 text-xs font-semibold">
                  {appUser.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-white truncate text-sm">{appUser.name || "User"}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 border-purple-500/50 bg-purple-600/20 text-purple-300 capitalize"
                  >
                    {userRole?.replace("_", " ") || "N/A"}
                  </Badge>
                  {userStatus && (
                    <Badge variant="outline" className={`text-xs px-1 py-0 capitalize ${statusInfo.className}`}>
                      {statusInfo.text}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.main.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item.url}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300 data-[active=true]:border-purple-500/50"
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.settings.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item.url}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.support.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item.url}
                        className="text-gray-300 hover:text-white hover:bg-gray-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-700">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full justify-start"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 px-4 bg-gray-900/50 backdrop-blur-md">
            <SidebarTrigger className="text-gray-400 hover:text-white" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-600" />

            {/* Logo centrado */}
            <div className="flex-1 flex justify-center">
              <Image
                src="/logo.png"
                alt="SingularityNET Logo"
                width={120}
                height={40}
                className="object-contain"
                style={{ height: "auto" }}
                priority
              />
            </div>

            <div className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-purple-400" />
              <h1 className="text-lg font-bold tracking-wide">Dashboard</h1>
            </div>
          </header>

          <main className="min-h-screen bg-black text-white p-6 space-y-8">
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
                          <SettingsIcon className="h-5 w-5 text-orange-300" />
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
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
    