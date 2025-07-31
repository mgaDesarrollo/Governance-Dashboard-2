"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeftIcon,
  UserPlusIcon,
  UsersIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldQuestionIcon,
  Trash2Icon,
  SearchIcon,
  ArrowUpAZIcon,
  ArrowDownAZIcon,
  ChevronsUpDownIcon,
} from "lucide-react"
import type { User as AppUser, UserRole, SortableUserKeys } from "@/lib/types"

const ROLES: UserRole[] = ["CORE_CONTRIBUTOR", "ADMIN"]
// This will be dynamically set based on the logged-in Super Admin's Discord ID from the session
let SUPER_ADMIN_ID_DYNAMIC = ""

export default function UserManagementPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [appUserRole, setAppUserRole] = useState<UserRole | null>(null)
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: SortableUserKeys; direction: "ascending" | "descending" }>({
    key: "name",
    direction: "ascending",
  })

  // Función para cargar usuarios desde la base de datos
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
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

    if (session?.user?.id) {
      // Establecer el rol del usuario actual
      setAppUserRole(session.user.role as UserRole)

      // Si el usuario no es super_admin, redirigir al dashboard
      if (session.user.role !== "SUPER_ADMIN") {
        console.log("User is not super admin, redirecting")
        router.replace("/dashboard")
        return
      }

      SUPER_ADMIN_ID_DYNAMIC = session.user.id

      // Cargar usuarios desde la base de datos
      fetchUsers()
    } else if (status === "authenticated" && !session?.user?.id) {
      console.error(
        "[UserManagement] Session is authenticated, but session.user.id is missing. Check NextAuth callbacks.",
      )
      router.replace("/") // Or an error page
      return
    }
  }, [session, status, router])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === SUPER_ADMIN_ID_DYNAMIC) {
      alert("Cannot change the role of the Super Admin.")
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user role")
      }

      // Refetch de usuarios tras actualizar el rol
      await fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role. Please try again.")
    }
  }

  const handleDeleteUser = async (userIdToDelete: string) => {
    if (userIdToDelete === SUPER_ADMIN_ID_DYNAMIC) {
      alert("The Super Admin account cannot be deleted.")
      return
    }

    try {
      const response = await fetch(`/api/users/${userIdToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      // Actualizar la lista de usuarios localmente
      setUsers(users.filter((user) => user.id !== userIdToDelete))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user. Please try again.")
    }
  }

  const requestSort = (key: SortableUserKeys) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnKey: SortableUserKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDownIcon className="ml-2 h-4 w-4 text-slate-500" />
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpAZIcon className="ml-2 h-4 w-4 text-purple-400" />
    ) : (
      <ArrowDownAZIcon className="ml-2 h-4 w-4 text-purple-400" />
    )
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <ShieldAlertIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
      case "ADMIN":
        return <ShieldCheckIcon className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0" />
      case "CORE_CONTRIBUTOR":
        return <ShieldQuestionIcon className="h-5 w-5 text-sky-400 mr-2 flex-shrink-0" />
      default:
        return null
    }
  }

  const sortedAndFilteredUsers = useMemo(() => {
    let processedUsers = [...users]
    if (searchTerm) {
      processedUsers = processedUsers.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    if (sortConfig.key) {
      processedUsers.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1
        return 0
      })
    }
    return processedUsers
  }, [users, searchTerm, sortConfig])

  if (isLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (appUserRole !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-white text-xl">Access Denied. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard")}
        className="mb-6 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="mb-8 bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlusIcon className="h-6 w-6 text-purple-400" />
            <CardTitle className="text-xl font-bold tracking-wide">User Creation Note</CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            Users are automatically added to the system with a 'Core Contributor' role upon their first login via
            Discord. The Super Admin (identified by their Discord ID configured in the dashboard) is assigned the
            'super_admin' role. You can manage existing users' roles below.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-6 w-6 text-purple-400" />
              <CardTitle className="text-xl font-bold tracking-wide">Manage User Roles</CardTitle>
            </div>
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search users by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 pl-10 focus:border-purple-500"
              />
            </div>
          </div>
          <CardDescription className="text-slate-400 mt-2">
            View and modify roles for existing users. The Super Admin role cannot be changed or deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/30">
                  <TableHead
                    className="text-slate-300 cursor-pointer hover:text-slate-100 transition-colors"
                    onClick={() => requestSort("name")}
                  >
                    <div className="flex items-center">User Name {getSortIcon("name")}</div>
                  </TableHead>
                  <TableHead
                    className="text-slate-300 cursor-pointer hover:text-slate-100 transition-colors"
                    onClick={() => requestSort("role")}
                  >
                    <div className="flex items-center">Current Role {getSortIcon("role")}</div>
                  </TableHead>
                  <TableHead className="text-slate-300">Change Role</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="font-medium text-slate-100 flex items-center">
                      {getRoleIcon(user.role)}
                      <span className="truncate">{user.name}</span>
                    </TableCell>
                    <TableCell className="capitalize text-slate-300">{user.role ? user.role.replace("_", " ") : <span className="italic text-slate-500">Sin rol</span>}</TableCell>
                    <TableCell>
                      {user.id !== SUPER_ADMIN_ID_DYNAMIC ? (
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}
                        >
                          <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600 text-slate-50">
                            {ROLES.map((role) => (
                              <SelectItem
                                key={role}
                                value={role}
                                className="capitalize hover:bg-slate-600 focus:bg-slate-600"
                              >
                                {role.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-slate-500 italic">Cannot change</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.id !== SUPER_ADMIN_ID_DYNAMIC ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="bg-red-700/80 hover:bg-red-600">
                              <Trash2Icon className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700 text-slate-50">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                This action cannot be undone. This will permanently delete the user{" "}
                                <span className="font-semibold text-slate-200">{user.name}</span> and remove their data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 border-slate-600 hover:bg-slate-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Yes, delete user
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <span className="text-sm text-slate-500 italic">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {sortedAndFilteredUsers.length === 0 && searchTerm && (
            <p className="text-center text-slate-400 py-4">No users found matching "{searchTerm}".</p>
          )}
          {users.length > 0 && sortedAndFilteredUsers.length === 0 && !searchTerm && (
            <p className="text-center text-slate-400 py-4">No users in the list. Add some users above.</p>
          )}
          {users.length === 0 && (
            <p className="text-center text-slate-400 py-4">No users in the list. Add some users above.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
