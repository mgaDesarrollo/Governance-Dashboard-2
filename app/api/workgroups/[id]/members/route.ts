import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = await Promise.resolve(context);
  const workGroupId = params.id;
  const members = await prisma.workGroupMember.findMany({
    where: { workGroupId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });
  return NextResponse.json(members);
} 