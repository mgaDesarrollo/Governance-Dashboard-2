import NextAuth, { type NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "@/lib/prisma"
import type { UserRole, UserAvailabilityStatus } from "@prisma/client"

interface DiscordProfile {
  id: string
  username: string
  avatar: string | null
  discriminator: string
  email?: string
  image_url?: string
}

const missingEnvVars: string[] = []
if (!process.env.DISCORD_CLIENT_ID) missingEnvVars.push("DISCORD_CLIENT_ID")
if (!process.env.DISCORD_CLIENT_SECRET) missingEnvVars.push("DISCORD_CLIENT_SECRET")
if (!process.env.NEXTAUTH_SECRET) missingEnvVars.push("NEXTAUTH_SECRET (Warning: Should be set for production)")
if (!process.env.DATABASE_URL) missingEnvVars.push("DATABASE_URL (Critical for Prisma)")
if (!process.env.NEXT_PUBLIC_SUPER_ADMIN_DISCORD_ID) {
  missingEnvVars.push("NEXT_PUBLIC_SUPER_ADMIN_DISCORD_ID (Critical for Super Admin role)")
}

// Improved NEXTAUTH_URL handling
const getNextAuthUrl = () => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Auto-detect for Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Default for development
  return "http://localhost:3000"
}

const nextAuthUrl = getNextAuthUrl()
console.log(`[NextAuth] Using NEXTAUTH_URL: ${nextAuthUrl}`)

if (missingEnvVars.some((v) => !v.includes("Warning"))) {
  const errorMsg = `[NextAuth Setup] FATAL ERROR: Missing critical environment variables: ${missingEnvVars.join(
    ", ",
  )}. Please check your .env.local or Vercel environment variable settings.`
  console.error(errorMsg)
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { 
        params: { 
          scope: "identify email guilds" 
        } 
      },
    }),
  ],
  debug: true, // Enable debug mode to see detailed logs
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("[NextAuth SignIn] Attempting sign in:", { 
        userId: user?.id, 
        provider: account?.provider,
        hasProfile: !!profile 
      })
      return true
    },
    async jwt({ token, account, profile, user }) {
      console.log("[NextAuth JWT] Processing token:", { 
        hasAccount: !!account, 
        hasProfile: !!profile,
        tokenUserId: token.sub 
      })
      
      if (account && profile) {
        const discordProfile = profile as DiscordProfile
        const superAdminDiscordId = process.env.NEXT_PUBLIC_SUPER_ADMIN_DISCORD_ID

        try {
          let dbUser = await prisma.user.findUnique({
            where: { id: discordProfile.id },
          })

          if (!dbUser) {
            const defaultRole: UserRole = discordProfile.id === superAdminDiscordId ? "SUPER_ADMIN" : "CORE_CONTRIBUTOR"
            const defaultStatus: UserAvailabilityStatus = "AVAILABLE"

            dbUser = await prisma.user.create({
              data: {
                id: discordProfile.id,
                name: discordProfile.username,
                email: discordProfile.email,
                image:
                  discordProfile.image_url ||
                  (discordProfile.avatar
                    ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                    : null),
                role: defaultRole,
                status: defaultStatus,
              },
            })
            console.log(
              `[NextAuth JWT] New user created in DB: ${dbUser.name}, Role: ${dbUser.role}, Status: ${dbUser.status}`,
            )
          } else {
            let needsUpdate = false
            const updateData: { name?: string; image?: string; role?: UserRole; status?: UserAvailabilityStatus } = {}

            if (dbUser.name !== discordProfile.username) {
              updateData.name = discordProfile.username
              needsUpdate = true
            }
            const newImage =
              discordProfile.image_url ||
              (discordProfile.avatar
                ? `https://cdn.discordapp.com/avatars/${discordProfile.id}/${discordProfile.avatar}.png`
                : null)
            if (dbUser.image !== newImage) {
              updateData.image = newImage
              needsUpdate = true
            }
            if (dbUser.id === superAdminDiscordId && dbUser.role !== "SUPER_ADMIN") {
              updateData.role = "SUPER_ADMIN"
              needsUpdate = true
            }
            if (!dbUser.status) {
              updateData.status = "AVAILABLE"
              needsUpdate = true
            }

            if (needsUpdate) {
              dbUser = await prisma.user.update({
                where: { id: discordProfile.id },
                data: updateData,
              })
              console.log(`[NextAuth JWT] User data updated in DB: ${dbUser.name}`)
            }
          }

          token.dbUserId = dbUser.id
          token.role = dbUser.role
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.image
          token.status = dbUser.status
        } catch (error: any) {
          console.error("❌❌❌ [NextAuth JWT] CRITICAL ERROR processing user in DB ❌❌❌", error)
          return { ...token, error: "DatabaseProcessingError" }
        }
      }
      return token
    },
    async session({ session, token }) {
      console.log("[NextAuth Session] Creating session:", { 
        hasToken: !!token, 
        hasDbUserId: !!token.dbUserId,
        hasError: !!token.error 
      })
      
      if (token.dbUserId && session.user) {
        session.user.id = token.dbUserId as string
        session.user.role = token.role as UserRole
        if (token.name) session.user.name = token.name as string
        if (token.email) session.user.email = token.email as string
        if (token.picture) session.user.image = token.picture as string
        if (token.status) session.user.status = token.status as UserAvailabilityStatus
      }
      if (token.error) {
        ;(session as any).error = token.error
      }
      return session
    },
  },
  events: {
    async signIn(message) {
      console.log("[NextAuth Event] signIn:", message.user?.name || message.user?.email, message.account?.provider)
    },
    async signOut(message) {
      console.log("[NextAuth Event] signOut session:", message.session?.user?.name)
    },
    async error(message) {
      console.error("[NextAuth Event] ERROR:", message)
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

let handler: any
try {
  if (
    missingEnvVars.some((v) => !v.includes("Warning") && (v === "DISCORD_CLIENT_ID" || v === "DISCORD_CLIENT_SECRET"))
  ) {
    console.error(
      "[NextAuth Init] Cannot initialize NextAuth due to missing Discord Client ID or Secret. Handler will not be created.",
    )
    handler = (req: Request, res: Response) => {
      return new Response(
        JSON.stringify({ error: "NextAuth configuration error due to missing Discord credentials." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
  } else {
    handler = NextAuth(authOptions)
  }
} catch (error) {
  console.error("[NextAuth Init] CRITICAL ERROR during NextAuth initialization:", error)
  handler = (req: Request, res: Response) => {
    return new Response(JSON.stringify({ error: "Critical NextAuth initialization failure." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export { handler as GET, handler as POST }
