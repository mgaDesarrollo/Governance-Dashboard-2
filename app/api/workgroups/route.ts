import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    // Opcional: Proteger este endpoint si solo usuarios logueados pueden ver la lista
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workgroups = await prisma.workgroup.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    })
    return NextResponse.json(workgroups)
  } catch (error) {
    console.error("Error fetching workgroups:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
