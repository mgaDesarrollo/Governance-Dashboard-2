"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
      description: "View governance statistics",
    },
  ]

  const superAdminItems = [
    {
      title: "Manage Users",
      url: "/dashboard/user-management",
      icon: UserCogIcon,
      description: "Add, remove, or change user roles",
    },
  ]

  const settingsItems = [
    {
      title: "Edit Profile",
      url: "/dashboard/profile/edit",
      icon: SettingsIcon,
      description: "Update your profile information",
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellIcon,
      description: "Manage your notifications",
    },
  ]

  const supportItems = [
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: HelpCircleIcon,
      description: "Get help and documentation",
    },
  ]

  // Construir el menú basado en permisos
  let menuItems = [...baseItems]

  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
    menuItems = [...menuItems, ...adminItems]
  }

  if (userRole === "SUPER_ADMIN") {
    menuItems = [...menuItems, ...superAdminItems]
  }

  return {
    main: menuItems,
    settings: settingsItems,
    support: supportItems,
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoadingPage, setIsLoadingPage] = useState(true)
  const [currentPath, setCurrentPath] = useState("/dashboard")

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  useEffect(() => {
    if (status === "loading") {
      setIsLoadingPage(true)
      return
    }
    if (status === "unauthenticated") {
      router.replace("/")
      return
    }
    if (status === "authenticated") {
      setIsLoadingPage(false)
    }
  }, [session, status, router])

  if (isLoadingPage || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-white">Redirecting...</p>
      </div>
    )
  }

  if ((session as any)?.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
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
          className: "bg-slate-500/20 text-slate-300 border-slate-500/30",
          icon: <ActivityIcon className="mr-1 h-3 w-3 text-slate-400" />,
        }
    }
  }

  const statusInfo = getStatusBadgeInfo(userStatus)

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-900 text-slate-50 flex">
        <Sidebar className="border-slate-700">
          <SidebarHeader className="border-b border-slate-700">
            <div className="flex items-center gap-2 px-2 py-3 border-b border-slate-700/50">
              <LayoutDashboardIcon className="h-8 w-8 text-purple-400" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-slate-100">Governance</h1>
                <p className="text-xs text-slate-400">Dashboard</p>
              </div>
            </div>

            {/* User information with profile image */}
            <div className="flex items-center gap-3 p-3 text-sm bg-slate-800/50 rounded-lg mx-2">
              <Avatar className="h-8 w-8 border-2 border-purple-500/30">
                <AvatarImage src={appUser.image || undefined} alt={appUser.name || "User"} />
                <AvatarFallback className="bg-purple-600/20 text-purple-300 text-xs font-semibold">
                  {appUser.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-slate-100 truncate text-sm">{appUser.name || "User"}</span>
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
              <SidebarGroupLabel className="text-slate-400 font-medium">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.main.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item.url}
                        className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300 data-[active=true]:border-purple-500/50"
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400 font-medium">Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.settings.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item.url}
                        className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400 font-medium">Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.support.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentPath === item.url}
                        className="text-slate-300 hover:text-slate-100 hover:bg-slate-800 data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-700">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full justify-start"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-700 px-4 bg-slate-800/50 backdrop-blur-md">
            <SidebarTrigger className="text-slate-400 hover:text-slate-100" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-slate-600" />

            {/* Logo centrado */}
            <div className="flex-1 flex justify-center">
              <Image
                src="/logo.png"
                alt="SingularityNET Logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            <div className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5 text-purple-400" />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-8">
            {/* Welcome Card */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome, {appUser.name || "User"}!</CardTitle>
                <CardDescription className="text-slate-400">
                  You are logged in as a{" "}
                  <span className="font-semibold text-purple-400 capitalize">
                    {userRole?.replace("_", " ") || "N/A"}
                  </span>
                  . Your current status is:{" "}
                  <span className={`font-semibold ${statusInfo.className.split(" ")[1]}`}>{statusInfo.text}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  This is your personalized dashboard for the SingularityNET Ambassador Program. Here you can
                  participate in governance by voting on proposals and contributing to community decisions.
                </p>
                {userRole === "ADMIN" && (
                  <div className="mt-6 p-4 bg-purple-600/10 border border-purple-500/30 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-300">Admin Panel Access</h3>
                    <p className="text-slate-400 text-sm">
                      As an administrator, you can create new proposals and manage existing ones. You also have the
                      authority to approve or reject proposals after the voting period.
                    </p>
                  </div>
                )}
                {userRole === "CORE_CONTRIBUTOR" && (
                  <div className="mt-6 p-4 bg-sky-600/10 border border-sky-500/30 rounded-lg">
                    <h3 className="text-lg font-semibold text-sky-300">Core Contributor Privileges</h3>
                    <p className="text-slate-400 text-sm">
                      As a core contributor, you can participate in voting, provide feedback, and evaluate proposals.
                      Your input is valuable to the governance process.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dashboard Metrics */}
            <DashboardMetrics />

            {/* Quick Actions and Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActions userRole={userRole} />
              <RecentActivity />
            </div>

            {/* Calendar */}
            <DashboardCalendar />

            {/* Charts and Analytics */}
            <DashboardCharts />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
