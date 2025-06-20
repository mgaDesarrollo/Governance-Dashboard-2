import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get all proposals
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build the query
    const where = status ? { status: status as any } : {}

    // Get proposals with pagination
    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.proposal.count({ where })

    return NextResponse.json({
      proposals,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching proposals:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create a new proposal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN and SUPER_ADMIN can create proposals
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { title, description, expiresAt } = await request.json()

    // Validate required fields
    if (!title || !description || !expiresAt) {
      return NextResponse.json({ error: "Title, description, and expiration date are required" }, { status: 400 })
    }

    // Create the proposal
    const proposal = await prisma.proposal.create({
      data: {
        title,
        description,
        expiresAt: new Date(expiresAt),
        authorId: session.user.id,
      },
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
