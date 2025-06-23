import type { DefaultSession } from "next-auth"
// Estos son los tipos generados por Prisma. Si 'npx prisma generate' fue exitoso, deberían estar disponibles.
import type {
  UserRole as PrismaUserRole,
  ProposalStatus as PrismaProposalStatus,
  VoteType as PrismaVoteType,
  UserAvailabilityStatus as PrismaUserAvailabilityStatus,
  Workgroup as PrismaWorkgroup, // Añadido para usar el tipo Workgroup
} from "@prisma/client"

export type UserRole = PrismaUserRole
export type ProposalStatusType = PrismaProposalStatus
export type VoteTypeEnum = PrismaVoteType
export type UserAvailabilityStatus = PrismaUserAvailabilityStatus // Exportamos el tipo para usarlo
export type Workgroup = PrismaWorkgroup // Exportamos el tipo Workgroup

export interface User {
  id: string
  name: string
  role: UserRole
  email?: string | null
  image?: string | null
  status?: UserAvailabilityStatus | null // Añadido para el status del usuario
  workgroups?: Workgroup[] // Para los workgroups del usuario
  fullname?: string | null // Añadido para el nombre completo
}

export type SortableUserKeys = "name" | "role" | "email"

export interface ProposalAuthor {
  id: string
  name: string
  image?: string | null
}

export interface ProposalComment {
  id: string
  content: string
  createdAt: string
  user: ProposalAuthor
}

export interface ProposalVote {
  id: string
  type: VoteTypeEnum
  user: ProposalAuthor
}

export interface Proposal {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string // ✅ Campo agregado
  expiresAt: string
  status: ProposalStatusType
  positiveVotes: number
  negativeVotes: number
  abstainVotes: number
  author: ProposalAuthor
  votes?: ProposalVote[]
  comments?: ProposalComment[]
  _count?: {
    votes: number
    comments: number
  }
  userVote?: VoteTypeEnum | null
  userHasCommented?: boolean
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      status?: UserAvailabilityStatus | null // Añadido para el status del usuario
      // fullname?: string | null; // Opcional: si quieres fullname en la sesión
    } & DefaultSession["user"]
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbUserId?: string
    role?: UserRole
    status?: UserAvailabilityStatus | null // Añadido para el status del usuario
    // fullname?: string | null; // Opcional: si quieres fullname en el token
  }
}

// Tipos para el formulario de perfil, si los necesitas centralizados
export interface ProfileFormData {
  fullname: string
  image: string
  walletAddress: string
  status: UserAvailabilityStatus | ""
  skills: string
  country: string
  languages: string
  professionalProfile: {
    tagline: string
    bio: string
    experience: string
    linkCv: string
  }
  socialLinks: {
    facebook: string
    linkedin: string
    github: string
    x: string
  }
  selectedWorkgroupIds: string[]
}
