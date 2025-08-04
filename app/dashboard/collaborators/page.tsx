"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserCard } from "@/components/user-card"
import { CollaboratorsFilters, type CollaboratorFilters } from "@/components/collaborators-filters"
import { UsersIcon, Loader2Icon } from "lucide-react"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import type { UserAvailabilityStatus, Workgroup } from "@prisma/client"

// Definir el tipo para los usuarios que se obtienen del API
type PublicProfileUser = {
  id: string
  name: string
  fullname?: string | null
  image?: string | null
  country?: string | null
  languages?: string | null
  status?: UserAvailabilityStatus | null
  skills?: string | null
  isOnline?: boolean
  lastSeen?: string | null
  professionalProfile?: {
    tagline?: string | null
    linkCv?: string | null
  } | null
  workgroups?: Pick<Workgroup, "id" | "name">[] | null
  socialLinks?: {
    linkedin?: string | null
    github?: string | null
    x?: string | null
  } | null
}

// Función para generar datos mock de estado online
const generateMockOnlineStatus = (users: PublicProfileUser[]): PublicProfileUser[] => {
  return users.map((user) => {
    const random = Math.random()

    if (random < 0.3) {
      // 30% online
      return {
        ...user,
        isOnline: true,
        lastSeen: new Date().toISOString(),
      }
    } else if (random < 0.5) {
      // 20% recently active (last 5 minutes)
      return {
        ...user,
        isOnline: false,
        lastSeen: new Date(Date.now() - Math.random() * 5 * 60 * 1000).toISOString(),
      }
    } else if (random < 0.7) {
      // 20% active in last hour
      return {
        ...user,
        isOnline: false,
        lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      }
    } else if (random < 0.9) {
      // 20% active in last day
      return {
        ...user,
        isOnline: false,
        lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      }
    } else {
      // 10% offline for days
      return {
        ...user,
        isOnline: false,
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    }
  })
}

// Función para aplicar filtros
const applyFilters = (users: PublicProfileUser[], filters: CollaboratorFilters): PublicProfileUser[] => {
  return users.filter((user) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        (user.fullname && user.fullname.toLowerCase().includes(searchLower)) ||
        (user.skills && user.skills.toLowerCase().includes(searchLower)) ||
        (user.country && user.country.toLowerCase().includes(searchLower)) ||
        (user.professionalProfile?.tagline && user.professionalProfile.tagline.toLowerCase().includes(searchLower))

      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.status !== "ALL" && user.status !== filters.status) {
      return false
    }

    // Online status filter
    if (filters.onlineStatus !== "ALL") {
      if (filters.onlineStatus === "ONLINE" && !user.isOnline) return false
      if (filters.onlineStatus === "OFFLINE" && user.isOnline) return false
      if (filters.onlineStatus === "RECENTLY_ACTIVE") {
        if (user.isOnline) return true
        if (!user.lastSeen) return false
        const lastSeenDate = new Date(user.lastSeen)
        const now = new Date()
        const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
        if (diffInMinutes > 60) return false // Only recently active (last hour)
      }
    }

    // Country filter
    if (filters.country && user.country !== filters.country) {
      return false
    }

    // Workgroup filter
    if (filters.workgroup) {
      const hasWorkgroup = user.workgroups?.some((wg) => wg.name === filters.workgroup)
      if (!hasWorkgroup) return false
    }

    // Skills filter
    if (filters.skills.length > 0) {
      const userSkills = user.skills?.split(",").map((s) => s.trim().toLowerCase()) || []
      const hasAllSkills = filters.skills.every((skill) =>
        userSkills.some((userSkill) => userSkill.includes(skill.toLowerCase())),
      )
      if (!hasAllSkills) return false
    }

    // CV filter
    if (filters.hasCV === true && !user.professionalProfile?.linkCv) {
      return false
    }
    if (filters.hasCV === false && user.professionalProfile?.linkCv) {
      return false
    }

    // Social links filter
    if (filters.hasSocialLinks === true) {
      const hasSocial = user.socialLinks?.linkedin || user.socialLinks?.github || user.socialLinks?.x
      if (!hasSocial) return false
    }
    if (filters.hasSocialLinks === false) {
      const hasSocial = user.socialLinks?.linkedin || user.socialLinks?.github || user.socialLinks?.x
      if (hasSocial) return false
    }

    return true
  })
}

export default function CollaboratorsPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [users, setUsers] = useState<PublicProfileUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<PublicProfileUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<CollaboratorFilters>({
    search: "",
    status: "ALL",
    onlineStatus: "ALL",
    country: "",
    workgroup: "",
    skills: [],
    hasCV: null,
    hasSocialLinks: null,
  })

  // Derived data for filter options - Fixed TypeScript error
  const availableCountries = Array.from(
    new Set(users.map((u) => u.country).filter((country): country is string => Boolean(country))),
  ).sort()

  const availableWorkgroups = Array.from(new Set(users.flatMap((u) => u.workgroups?.map((wg) => wg.name) || []))).sort()

  const availableSkills = Array.from(
    new Set(
      users.flatMap(
        (u) =>
          u.skills
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
      ),
    ),
  ).sort()

  useEffect(() => {
    if (sessionStatus === "loading") return
    if (sessionStatus === "unauthenticated") {
      router.replace("/")
      return
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/public-profiles")
        if (!response.ok) {
          throw new Error("Failed to fetch collaborators")
        }
        const data = await response.json()

        // Agregar datos mock de estado online
        const usersWithOnlineStatus = generateMockOnlineStatus(data)

        setUsers(usersWithOnlineStatus)
      } catch (error) {
        console.error("Error fetching collaborators:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionStatus === "authenticated") {
      fetchUsers()
    }
  }, [sessionStatus, router])

  // Apply filters whenever users or filters change
  useEffect(() => {
    const filtered = applyFilters(users, filters)
    setFilteredUsers(filtered)
  }, [users, filters])

  // Actualizar estado online cada 30 segundos (simulación)
  useEffect(() => {
    if (users.length === 0) return

    const interval = setInterval(() => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          const random = Math.random()

          // 10% de probabilidad de cambiar estado
          if (random < 0.1) {
            if (user.isOnline) {
              // Usuario online puede desconectarse
              return {
                ...user,
                isOnline: false,
                lastSeen: new Date().toISOString(),
              }
            } else {
              // Usuario offline puede conectarse (5% de probabilidad)
              if (random < 0.05) {
                return {
                  ...user,
                  isOnline: true,
                  lastSeen: new Date().toISOString(),
                }
              }
            }
          }

          return user
        })

        return updatedUsers
      })
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [users.length])

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId)
    setIsProfileDialogOpen(true)
  }

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <Loader2Icon className="h-16 w-16 text-purple-500 animate-spin" />
      </div>
    )
  }

  // Ordenar usuarios: online primero, luego por última vez visto
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1
    if (!a.isOnline && b.isOnline) return 1

    if (!a.isOnline && !b.isOnline) {
      const aLastSeen = a.lastSeen ? new Date(a.lastSeen).getTime() : 0
      const bLastSeen = b.lastSeen ? new Date(b.lastSeen).getTime() : 0
      return bLastSeen - aLastSeen
    }

    return 0
  })

  const onlineCount = filteredUsers.filter((user) => user.isOnline).length

  return (
    <div className="min-h-screen bg-transparent text-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <UsersIcon className="h-7 w-7 text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Collaborators</h1>
          <p className="text-sm text-slate-400 font-medium">
            {onlineCount} online • {filteredUsers.length} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <CollaboratorsFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableCountries={availableCountries}
          availableWorkgroups={availableWorkgroups}
          availableSkills={availableSkills}
          totalCount={users.length}
          filteredCount={filteredUsers.length}
        />
      </div>

      {/* Results */}
      {sortedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedUsers.map((user) => (
            <UserCard key={user.id} user={user} onViewProfile={handleViewProfile} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <UsersIcon className="mx-auto h-16 w-16 text-slate-600 mb-4" />
          <p className="text-xl text-slate-400 mb-2">No collaborators found</p>
          <p className="text-sm text-slate-500">Try adjusting your filters or search criteria</p>
        </div>
      )}

      <UserProfileDialog userId={selectedUserId} open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />
    </div>
  )
}
