"use client"

import type React from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  UserCircle2Icon,
  MapPinIcon,
  LanguagesIcon,
  BriefcaseIcon,
  DownloadIcon,
  LinkedinIcon,
  GithubIcon,
  TwitterIcon,
  ActivityIcon,
  SparklesIcon,
  EyeIcon,
} from "lucide-react"
import type { UserAvailabilityStatus, Workgroup } from "@prisma/client"

interface UserCardProps {
  user: {
    id: string
    name: string // Discord username
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
  onViewProfile?: (userId: string) => void
}

const getStatusBadgeInfo = (status?: UserAvailabilityStatus | null) => {
  switch (status) {
    case "AVAILABLE":
      return {
        text: "Available",
        className: "bg-green-600/30 text-green-300 border-green-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
    case "BUSY":
      return {
        text: "Busy",
        className: "bg-yellow-600/30 text-yellow-300 border-yellow-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
    case "VERY_BUSY":
      return {
        text: "Very Busy",
        className: "bg-red-600/30 text-red-300 border-red-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
    default:
      return {
        text: "Unknown",
        className: "bg-slate-600/30 text-slate-300 border-slate-500/50",
        icon: <ActivityIcon className="h-3 w-3" />,
      }
  }
}

const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
  <Badge variant="outline" className="bg-slate-700 border-purple-500/30 text-purple-300 text-xs px-2 py-0.5">
    <SparklesIcon className="mr-1 h-3 w-3 text-purple-400" />
    {skill}
  </Badge>
)

export function UserCard({ user, onViewProfile }: UserCardProps) {
  const displayName = user.fullname || user.name
  const statusInfo = getStatusBadgeInfo(user.status)
  const skillsArray =
    user.skills
      ?.split(",")
      .map((s) => s.trim())
      .filter((s) => s) || []

  return (
    <Card className="bg-slate-800 border-slate-700/80 hover:border-purple-500/70 transition-all duration-300 ease-in-out shadow-lg hover:shadow-purple-500/20 overflow-hidden flex flex-col h-full">
      <CardHeader className="p-4">
        <div className="flex items-start space-x-3">
          {user.image ? (
            <Image
              src={user.image || "/placeholder.svg"}
              alt={displayName}
              width={72}
              height={72}
              className="rounded-full border-2 border-purple-500/50 object-cover aspect-square"
            />
          ) : (
            <div className="w-18 h-18 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center border-2 border-purple-500/50">
              <UserCircle2Icon className="h-10 w-10 text-slate-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-slate-100 truncate" title={displayName}>
              {displayName}
            </CardTitle>
            {user.professionalProfile?.tagline && (
              <p className="text-xs text-purple-300/90 truncate italic" title={user.professionalProfile.tagline}>
                "{user.professionalProfile.tagline}"
              </p>
            )}
            <div className="mt-1.5 flex items-center">
              <Badge
                variant="outline"
                className={`text-xs px-1.5 py-0.5 flex items-center gap-1 ${statusInfo.className}`}
              >
                {statusInfo.icon}
                {statusInfo.text}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 text-sm flex-grow">
        {(user.country || user.languages) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300">
            {user.country && (
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                {user.country}
              </div>
            )}
            {user.languages && (
              <div className="flex items-center">
                <LanguagesIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                {user.languages}
              </div>
            )}
          </div>
        )}

        {skillsArray.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-1.5">Skills:</h4>
            <div className="flex flex-wrap gap-1.5">
              {skillsArray.slice(0, 5).map(
                (
                  skill,
                  index, // Mostrar hasta 5 skills
                ) => (
                  <SkillBadge key={index} skill={skill} />
                ),
              )}
              {skillsArray.length > 5 && (
                <Badge variant="outline" className="text-xs bg-slate-700 border-slate-600">
                  +{skillsArray.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {user.workgroups && user.workgroups.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-400 mb-1.5">Workgroups:</h4>
            <div className="flex flex-wrap gap-1.5">
              {user.workgroups.map((wg) => (
                <Badge key={wg.id} variant="secondary" className="bg-slate-700/70 text-slate-300 text-xs px-2 py-0.5">
                  <BriefcaseIcon className="mr-1 h-3 w-3 text-slate-400" />
                  {wg.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t border-slate-700/50 mt-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex space-x-2">
            {onViewProfile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile(user.id)}
                className="text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 text-xs"
              >
                <EyeIcon className="mr-1 h-3 w-3" />
                View Profile
              </Button>
            )}
            {user.socialLinks?.linkedin && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 w-8 h-8"
              >
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <LinkedinIcon className="h-4 w-4" />
                </a>
              </Button>
            )}
            {user.socialLinks?.github && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 w-8 h-8"
              >
                <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                  <GithubIcon className="h-4 w-4" />
                </a>
              </Button>
            )}
            {user.socialLinks?.x && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-slate-400 hover:text-purple-400 hover:bg-slate-700/50 w-8 h-8"
              >
                <a href={user.socialLinks.x} target="_blank" rel="noopener noreferrer" title="X (Twitter)">
                  <TwitterIcon className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          {user.professionalProfile?.linkCv && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 hover:border-purple-500/60"
            >
              <a href={user.professionalProfile.linkCv} target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="mr-1.5 h-4 w-4" />
                resume
              </a>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
