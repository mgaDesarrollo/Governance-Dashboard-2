"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserCard } from "@/components/user-card"
import { ArrowLeftIcon, UsersIcon, Loader2Icon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
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

export default function CollaboratorsPage() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [users, setUsers] = useState<PublicProfileUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<PublicProfileUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

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
        setUsers(data)
        setFilteredUsers(data)
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

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase()
    const filteredData = users.filter((item) => {
      return (
        item.name.toLowerCase().includes(lowercasedFilter) ||
        (item.fullname && item.fullname.toLowerCase().includes(lowercasedFilter)) ||
        (item.skills && item.skills.toLowerCase().includes(lowercasedFilter)) ||
        (item.country && item.country.toLowerCase().includes(lowercasedFilter)) ||
        (item.professionalProfile?.tagline && item.professionalProfile.tagline.toLowerCase().includes(lowercasedFilter))
      )
    })
    setFilteredUsers(filteredData)
  }, [searchTerm, users])

  const handleViewProfile = (userId: string) => {
    setSelectedUserId(userId)
    setIsProfileDialogOpen(true)
  }

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2Icon className="h-16 w-16 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100 self-start sm:self-center"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <UsersIcon className="h-7 w-7 text-purple-400" />
          <h1 className="text-2xl font-bold">Collaborators</h1>
        </div>
        <div className="relative w-full sm:w-auto">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search collaborators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-slate-800 border-slate-700 text-slate-50 placeholder-slate-400 pl-10 focus:border-purple-500"
          />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} onViewProfile={handleViewProfile} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <UsersIcon className="mx-auto h-16 w-16 text-slate-600 mb-4" />
          <p className="text-xl text-slate-400">
            {searchTerm ? `No collaborators found matching "${searchTerm}".` : "No collaborators to display."}
          </p>
        </div>
      )}

      <UserProfileDialog userId={selectedUserId} open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />
    </div>
  )
}
