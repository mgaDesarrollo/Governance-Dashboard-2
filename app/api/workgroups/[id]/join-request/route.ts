import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { message, userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: "No userId" }, { status: 400 })
  }
  const workGroupId = params.id
  const joinRequest = await prisma.workGroupJoinRequest.create({
    data: {
      userId,
      workGroupId,
      status: "pending",
      message,
    }
  })
  return NextResponse.json(joinRequest)
} 