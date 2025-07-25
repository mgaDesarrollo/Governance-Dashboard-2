import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = await Promise.resolve(context);
  const workGroupId = params.id;
  const data = await req.json();
  try {
    const updated = await prisma.workGroup.update({
      where: { id: workGroupId },
      data: {
        name: data.name,
        type: data.type,
        dateOfCreation: data.dateOfCreation,
        status: data.status,
        missionStatement: data.missionStatement,
        goalsAndFocus: data.goalsAndFocus,
      }
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'No se pudo actualizar el WorkGroup' }, { status: 500 });
  }
} 