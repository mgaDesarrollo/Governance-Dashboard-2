import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const proposalId = params.id
    const { voteType } = await request.json()

    if (!["POSITIVE", "NEGATIVE", "ABSTAIN"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    // Check if proposal exists and is not expired
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (proposal.status !== "IN_REVIEW") {
      return NextResponse.json(
        {
          error:
            proposal.status === "EXPIRED"
              ? "Cannot vote on an expired proposal"
              : "Cannot vote on a proposal that is not in review",
        },
        { status: 400 },
      )
    }

    if (new Date(proposal.expiresAt) < new Date()) {
      // Instead of just returning an error, update the proposal status to EXPIRED
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: "EXPIRED" },
      })

      return NextResponse.json({ error: "Proposal has expired and has been marked as such" }, { status: 400 })
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId,
        },
      },
    })

    // Start a transaction to update vote counts
    const result = await prisma.$transaction(async (tx) => {
      // If user has already voted, update their vote
      if (existingVote) {
        // Decrement the previous vote count
        if (existingVote.type === "POSITIVE") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { positiveVotes: { decrement: 1 } },
          })
        } else if (existingVote.type === "NEGATIVE") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { negativeVotes: { decrement: 1 } },
          })
        } else if (existingVote.type === "ABSTAIN") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { abstainVotes: { decrement: 1 } },
          })
        }

        // Update the vote
        await tx.vote.update({
          where: { id: existingVote.id },
          data: { type: voteType },
        })
      } else {
        // Create a new vote
        await tx.vote.create({
          data: {
            type: voteType,
            userId: session.user.id,
            proposalId,
          },
        })
      }

      // Increment the new vote count
      if (voteType === "POSITIVE") {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { positiveVotes: { increment: 1 } },
        })
      } else if (voteType === "NEGATIVE") {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { negativeVotes: { increment: 1 } },
        })
      } else if (voteType === "ABSTAIN") {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { abstainVotes: { increment: 1 } },
        })
      }

      // Return the updated proposal
      return tx.proposal.findUnique({
        where: { id: proposalId },
        include: {
          votes: {
            where: { userId: session.user.id },
          },
        },
      })
    })

    return NextResponse.json({
      proposal: result,
      userVote: voteType,
    })
  } catch (error) {
    console.error("Error voting on proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
