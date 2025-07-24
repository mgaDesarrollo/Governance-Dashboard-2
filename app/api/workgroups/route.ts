import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const workGroups = await prisma.workGroup.findMany({
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(workGroups)
}
