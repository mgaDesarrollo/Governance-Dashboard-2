"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  UserCircle2Icon,
  ShieldCheckIcon,
  UserCogIcon,
  AlertTriangleIcon,
  FileTextIcon,
  TimerIcon,
  SettingsIcon,
  ActivityIcon,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { UserRole, UserAvailabilityStatus } from "@/lib/types" // Importar UserAvailabilityStatus
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoadingPage, setIsLoadingPage] = useState(true)

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
  const userStatus = appUser.status as UserAvailabilityStatus | undefined // Puede ser undefined si no está en la sesión
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN"

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
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <header className="bg-slate-800/50 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboardIcon className="h-7 w-7 text-purple-400" />
            <h1 className="text-xl font-semibold">Governance Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <UserCircle2Icon className="h-6 w-6 text-slate-400 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="font-medium text-slate-100">{appUser.name || "User"}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 border-purple-500/50 bg-purple-600/20 text-purple-300 capitalize flex items-center"
                  >
                    <ShieldCheckIcon className="mr-1 h-3 w-3" />
                    {userRole?.replace("_", " ") || "N/A"}
                  </Badge>
                  {userStatus && (
                    <Badge
                      variant="outline"
                      className={`text-xs px-1.5 py-0.5 capitalize flex items-center ${statusInfo.className}`}
                    >
                      {statusInfo.icon}
                      {statusInfo.text}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/profile/edit")}
              className="font-semibold text-purple-300 border-purple-500/70 hover:bg-purple-500/20 hover:text-purple-200 hover:border-purple-400 transition-all duration-150 ease-in-out shadow-sm hover:shadow-md hover:shadow-purple-500/30"
              title="Edit Your Profile"
            >
              <SettingsIcon className="mr-1.5 h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-slate-400 hover:text-purple-400 hover:bg-slate-700"
              title="Logout"
            >
              <LogOutIcon className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... (resto del contenido del main sin cambios) ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {userRole === "SUPER_ADMIN" && (
            <Button
              onClick={() => router.push("/dashboard/user-management")}
              className="bg-green-600 hover:bg-green-700 text-white h-auto py-3"
            >
              <UserCogIcon className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Users</div>
                <div className="text-xs opacity-90">Add, remove, or change user roles</div>
              </div>
            </Button>
          )}

          <Button
            onClick={() => router.push("/dashboard/proposals")}
            className="bg-purple-600 hover:bg-purple-700 text-white h-auto py-3"
          >
            <FileTextIcon className="mr-2 h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Proposals</div>
              <div className="text-xs opacity-90">View and vote on community proposals</div>
            </div>
          </Button>

          {isAdmin && (
            <Button
              onClick={() => router.push("/dashboard/admin/check-expired-proposals")}
              className="bg-slate-600 hover:bg-slate-700 text-white h-auto py-3"
            >
              <TimerIcon className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Check Expired Proposals</div>
                <div className="text-xs opacity-90">Update status of expired proposals</div>
              </div>
            </Button>
          )}
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome, {appUser.name || "User"}!</CardTitle>
            <CardDescription className="text-slate-400">
              You are logged in as a{" "}
              <span className="font-semibold text-purple-400 capitalize">{userRole?.replace("_", " ") || "N/A"}</span>.
              Your current status is:{" "}
              <span className={`font-semibold ${statusInfo.className.split(" ")[1]}`}>{statusInfo.text}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">
              This is your personalized dashboard for the SingularityNET Ambassador Program. Here you can participate in
              governance by voting on proposals and contributing to community decisions.
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
                  As a core contributor, you can participate in voting, provide feedback, and evaluate proposals. Your
                  input is valuable to the governance process.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-slate-800/70 border-slate-700 hover:border-purple-600/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg text-slate-200">Upcoming Feature {i + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">
                  Details about this feature will be available soon. Stay tuned for updates on proposal management,
                  voting systems, and community feedback tools.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
