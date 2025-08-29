"use client"

import { useSessionWithRefresh } from "@/hooks/use-session"
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger, SidebarRail } from "@/components/ui/sidebar"
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/global-search"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import {
  LayoutDashboardIcon,
  FileTextIcon,
  UsersIcon,
  BarChart3Icon,
  ClockIcon,
  UserCogIcon,
  SettingsIcon,
  HelpCircleIcon,
  BellIcon,
  LogOutIcon,
  ActivityIcon,
  HomeIcon,
  UserIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon
} from "lucide-react"
import { usePathname } from "next/navigation"

// Definir los elementos del menú con permisos
const getMenuItems = (userRole: string) => {
  const baseItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HomeIcon
    },
    {
      title: "Community Proposals",
      url: "/dashboard/proposals",
      icon: FileTextIcon
    },
    {
      title: "Collaborators",
      url: "/dashboard/collaborators",
      icon: UsersIcon
    },
    {
      title: "WorkGroups & Guilds",
      url: "/dashboard/workgroups",
      icon: BarChart3Icon
    },

    {
      title: "Consensus",
      url: "/dashboard/consensus",
      icon: ClockIcon
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3Icon
    }
  ]

  const adminItems = [

  ]

  const superAdminItems = [
    {
      title: "User Management",
      url: "/dashboard/user-management",
      icon: UserCogIcon
    },
    {
      title: "System Settings",
      url: "/dashboard/system-settings",
      icon: SettingsIcon
    }
  ]

  const settingsItems = [
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: UserIcon
    }
  ]

  const supportItems = [
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: HelpCircleIcon
    },
    {
      title: "Notifications",
      url: "/dashboard/notifications",
      icon: BellIcon
    }
  ]

  return {
    main: baseItems,
    admin: userRole === "ADMIN" || userRole === "SUPER_ADMIN" ? adminItems : [],
    superAdmin: userRole === "SUPER_ADMIN" ? superAdminItems : [],
    settings: settingsItems,
    support: supportItems
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, refreshSession, signOut } = useSessionWithRefresh()
  const currentPath = usePathname()

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Please log in to access the dashboard.</p>
        </div>
      </div>
    )
  }

  const userRole = user.role
  const userStatus = user.status
  const menuItems = getMenuItems(userRole)

  const getStatusBadgeInfo = (status?: string) => {
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
      <div className="min-h-screen bg-black text-white flex font-mac">
        <Sidebar className="border-gray-700">
          <SidebarHeader className="border-b border-gray-700">
            <div className="flex items-center gap-3 px-2 py-3 border-b border-gray-700/50">
              {/* Logo personalizado */}
              <div className="relative w-10 h-10">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Fondo dividido diagonalmente */}
                  <defs>
                    <linearGradient id="diagonalGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e3a8a" /> {/* Azul oscuro */}
                      <stop offset="100%" stopColor="#166534" /> {/* Verde oscuro */}
                    </linearGradient>
                  </defs>
                  
                  {/* Fondo del logo */}
                  <rect width="100" height="100" rx="12" fill="url(#diagonalGradient)" />
                  
                  {/* Martillo (gavel) */}
                  <g fill="white">
                    {/* Cabeza del martillo */}
                    <rect x="15" y="25" width="20" height="8" rx="2" />
                    {/* Mango del martillo */}
                    <rect x="25" y="33" width="4" height="25" rx="2" />
                    {/* Bloque de sonido */}
                    <rect x="18" y="58" width="14" height="4" rx="1" />
                  </g>
                  
                  {/* Flecha curva */}
                  <path
                    d="M 20 70 Q 35 50 60 40 L 65 35 L 60 45 Q 45 55 30 65 Z"
                    fill="white"
                  />
                  
                  {/* Globo/Esfera */}
                  <g fill="none" stroke="white" strokeWidth="2">
                    {/* Círculo principal */}
                    <circle cx="70" cy="70" r="15" />
                    {/* Líneas de la cuadrícula */}
                    <line x1="55" y1="70" x2="85" y2="70" />
                    <line x1="70" y1="55" x2="70" y2="85" />
                    <line x1="60" y1="60" x2="80" y2="80" />
                    <line x1="80" y1="60" x2="60" y2="80" />
                  </g>
                </svg>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white tracking-wide">Governance</h1>
                <p className="text-xs text-gray-400 font-medium">Dashboard</p>
              </div>
            </div>

            {/* User information with profile image */}
            <div className="flex items-center gap-3 p-3 text-sm bg-black/50 rounded-lg mx-2">
              <Avatar className="h-8 w-8 border-2 border-purple-500/30">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="bg-purple-600/20 text-purple-300 text-xs font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-white truncate text-sm">{user.name || "User"}</span>
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
                        className="text-gray-300 hover:text-white hover:bg-black data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300 data-[active=true]:border-purple-500/50"
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
                          className="text-gray-300 hover:text-white hover:bg-black data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
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
                          className="text-gray-300 hover:text-white hover:bg-black data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
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
                        className="text-gray-300 hover:text-white hover:bg-black data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
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
                        className="text-gray-300 hover:text-white hover:bg-black data-[active=true]:bg-purple-600/20 data-[active=true]:text-purple-300"
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
                   onClick={() => {
                     // Usar el signOut del hook que ya está disponible
                     signOut()
                   }}
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
          <header className="flex h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-gray-700/50 px-4 sm:px-6 bg-transparent backdrop-blur-sm">
            <SidebarTrigger className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700/50 flex-shrink-0" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-gray-600 flex-shrink-0" />

            {/* Logo centrado con mejor diseño */}
            <div className="flex-1 flex justify-center min-w-0">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="SingularityNET Logo"
                  width={160}
                  height={32}
                  className="object-contain"
                  className="object-contain w-32 sm:w-40"
                  style={{ height: "auto" }}
                  priority
                />
              </div>
            </div>

            {/* Búsqueda global y controles */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <GlobalSearch />
              
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg border border-gray-700/30 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-300 font-medium">Live</span>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-lg border border-gray-700/30 backdrop-blur-sm">
                <span className="text-xs text-gray-300 font-medium">Dashboard</span>
              </div>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  )
} 