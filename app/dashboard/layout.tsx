"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
import type { UserRole, UserAvailabilityStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
      url: "/dashboard/admin/analytics",
      icon: BarChart3Icon,
      description: "View detailed analytics and reports",
    },
  ]

  const superAdminItems = [
    {
      title: "User Management",
      url: "/dashboard/admin/users",
      icon: UsersIcon,
      description: "Manage user accounts and permissions",
    },
    {
      title: "System Settings",
      url: "/dashboard/admin/settings",
      icon: SettingsIcon,
      description: "Configure system-wide settings",
    },
  ]

  const settingsItems = [
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: UserCogIcon,
      description: "Manage your profile and preferences",
    },
  ]

  const supportItems = [
    {
      title: "Help & Support",
      url: "/dashboard/support",
      icon: HelpCircleIcon,
      description: "Get help and support",
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellIcon,
      description: "Manage your notifications",
    },
  ]

  return {
    main: baseItems,
    admin: userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? adminItems : [],
    superAdmin: userRole === "SUPER_ADMIN" ? superAdminItems : [],
    settings: settingsItems,
    support: supportItems,
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState("")
  const [appUser, setAppUser] = useState({
    name: "",
    email: "",
    image: "",
    role: "CORE_CONTRIBUTOR" as UserRole,
    status: "AVAILABLE" as UserAvailabilityStatus,
  })

  useEffect(() => {
    if (status === "loading") {
      return
    }
    
    if (status === "unauthenticated") {
      router.push("/api/auth/signin")
      return
    }

    if (session?.user) {
      setAppUser({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        role: session.user.role || "CORE_CONTRIBUTOR",
        status: session.user.status || "AVAILABLE",
      })
    }
  }, [session, status, router])

  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  const userRole = appUser.role
  const userStatus = appUser.status
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

            {menuItems.admin.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.admin.map((item) => (
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
            )}

            {menuItems.superAdmin.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-400 font-bold tracking-wide">Super Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.superAdmin.map((item) => (
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
            )}

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

          <main className="flex-1">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 