import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get a specific proposal with votes and comments
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: proposalId } = await params

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
        workgroup: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Obtener información de los workgroups asociados si existen
  let associatedWorkGroups: { id: string; name: string; type: string; status: string }[] = []
    if (proposal.workGroupIds && proposal.workGroupIds.length > 0) {
      associatedWorkGroups = await prisma.workGroup.findMany({
        where: {
          id: { in: proposal.workGroupIds }
        },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
        }
      })
    }

    // Check if the current user has voted
    const userVote = proposal.votes.find((vote) => vote.userId === session.user.id)

    // Check if the current user has commented
    const userComment = proposal.comments.find((comment) => comment.userId === session.user.id)

    return NextResponse.json({
      ...proposal,
      associatedWorkGroups,
      userVote: userVote?.type || null,
      userHasCommented: !!userComment,
    })
  } catch (error) {
    console.error("Error fetching proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update a proposal (status change or edit content)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: proposalId } = await params
    const body = await request.json()

    // Find the proposal first
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { authorId: true, status: true },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Check if this is a status update (admin only) or content edit (author only)
    if (body.status) {
      // Status update - only ADMIN and SUPER_ADMIN can update status
      if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: body.status },
      })

      return NextResponse.json(updatedProposal)
    } else {
      // Content edit - only the author can edit content
      if (proposal.authorId !== session.user.id) {
        return NextResponse.json({ error: "Only the author can edit this proposal" }, { status: 403 })
      }

      // Only allow editing if proposal is still IN_REVIEW
      if (proposal.status !== "IN_REVIEW") {
        return NextResponse.json({ error: "Cannot edit proposal that is not in review" }, { status: 400 })
      }

  const { title, description, expiresAt, attachment, proposalType, budgetItems, workGroupIds, quarter, links } = body

      const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          title,
          description,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          attachment: attachment || undefined,
          proposalType: proposalType || undefined,
          quarter: quarter || undefined,
          budgetItems: budgetItems || undefined,
          workGroupIds: workGroupIds || undefined,
          links: links || undefined,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json(updatedProposal)
    }
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete a proposal
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN and SUPER_ADMIN can delete proposals
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: proposalId } = await params

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
