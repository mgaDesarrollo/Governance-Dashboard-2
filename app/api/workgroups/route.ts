import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const workGroups = await prisma.workGroup.findMany({
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(workGroups)
}
