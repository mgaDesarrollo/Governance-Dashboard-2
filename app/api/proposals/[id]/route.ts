import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get a specific proposal with votes and comments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const proposalId = params.id

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Check if the current user has voted
    const userVote = proposal.votes.find((vote) => vote.userId === session.user.id)

    // Check if the current user has commented
    const userComment = proposal.comments.find((comment) => comment.userId === session.user.id)

    return NextResponse.json({
      ...proposal,
      userVote: userVote?.type || null,
      userHasCommented: !!userComment,
    })
  } catch (error) {
    console.error("Error fetching proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update a proposal (status change)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN and SUPER_ADMIN can update proposals
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const proposalId = params.id
    const { status } = await request.json()

    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: { status },
    })

    return NextResponse.json(updatedProposal)
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete a proposal
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN and SUPER_ADMIN can delete proposals
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const proposalId = params.id

    // Delete related votes and comments first
    await prisma.vote.deleteMany({ where: { proposalId } })
    await prisma.comment.deleteMany({ where: { proposalId } })

    // Delete the proposal
    await prisma.proposal.delete({ where: { id: proposalId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
