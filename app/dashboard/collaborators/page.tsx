"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserCard } from "@/components/user-card"
import { CollaboratorsFilters, type CollaboratorFilters } from "@/components/collaborators-filters"
import { UsersIcon, Loader2Icon } from "lucide-react"
import { UserProfileDialog } from "@/components/user-profile-dialog"
import type { UserAvailabilityStatus } from "@prisma/client"

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
  workgroups?: { id: string; name: string }[] | null
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
      return {
        ...user,
        isOnline: true,
        lastSeen: new Date().toISOString(),
      }
    } else if (random < 0.5) {
      return {
        ...user,
        isOnline: false,
        lastSeen: new Date(Date.now() - Math.random() * 5 * 60 * 1000).toISOString(),
      }
    } else if (random < 0.7) {
      return {
        ...user,
        isOnline: false,
        lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      }
    } else if (random < 0.9) {
      return {
        ...user,
        isOnline: false,
        lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      }
    } else {
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

    // Country filter
    if (filters.country && user.country !== filters.country) {
      return false
    }

    // Workgroup filter
    if (filters.workgroup && user.workgroups) {
      const hasWorkgroup = user.workgroups.some((wg) => wg.id === filters.workgroup)
      if (!hasWorkgroup) return false
    }

    // Skills filter
    if (filters.skills.length > 0 && user.skills) {
      const userSkills = user.skills.toLowerCase().split(",").map((s) => s.trim())
      const hasSkill = filters.skills.some((skill) => userSkills.indexOf(skill.toLowerCase()) !== -1)
      if (!hasSkill) return false
    }

    return true
  })
}

export default function CollaboratorsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<PublicProfileUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<PublicProfileUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [filters, setFilters] = useState<CollaboratorFilters>({
    search: "",
    status: "ALL",
    country: "",
    workgroup: "",
    skills: [],
  })

  // Estados para filtros
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [availableWorkgroups, setAvailableWorkgroups] = useState<{ id: string; name: string }[]>([])
  const [availableSkills, setAvailableSkills] = useState<string[]>([])

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/")
      return
    }

    if (sessionStatus === "authenticated") {
      fetchUsers()
    }
  }, [sessionStatus, router])

  useEffect(() => {
    const filtered = applyFilters(users, filters)
    setFilteredUsers(filtered)
  }, [users, filters])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/public-profiles")
      if (response.ok) {
        const data = await response.json()
        const usersWithMockStatus = generateMockOnlineStatus(data)
        setUsers(usersWithMockStatus)

        // Extraer datos para filtros
        const countries = [...new Set(data.map((u: PublicProfileUser) => u.country).filter(Boolean))]
        const workgroups = data
          .flatMap((u: PublicProfileUser) => u.workgroups || [])
          .filter((wg, index, arr) => arr.findIndex((w) => w.id === wg.id) === index)
        const skills = [...new Set(data.flatMap((u: PublicProfileUser) => u.skills?.split(",").map((s) => s.trim()) || []))]

        setAvailableCountries(countries)
        setAvailableWorkgroups(workgroups)
        setAvailableSkills(skills)
      } else {
        console.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Simular cambios de estado online
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          const random = Math.random()

          if (user.isOnline) {
            // Usuario online puede desconectarse (10% de probabilidad)
            if (random < 0.1) {
              return {
                ...user,
                isOnline: false,
                lastSeen: new Date().toISOString(),
              }
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2Icon className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading collaborators...</p>
        </div>
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header simplificado */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UsersIcon className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Collaborators</h1>
          </div>
          <p className="text-slate-400">
            {onlineCount} online • {filteredUsers.length} total
          </p>
        </div>

        {/* Filtros simplificados */}
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

        {/* Grid responsivo de colaboradores */}
        {sortedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedUsers.map((user) => (
              <UserCard key={user.id} user={user} onViewProfile={handleViewProfile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <UsersIcon className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <p className="text-xl text-slate-400 mb-2">No collaborators found</p>
            <p className="text-slate-500">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <UserProfileDialog userId={selectedUserId} open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />
    </div>
  )
}
