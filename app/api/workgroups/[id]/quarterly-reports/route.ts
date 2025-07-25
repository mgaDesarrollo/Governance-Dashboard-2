import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET: Listar quarterly reports de un workgroup
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workGroupId = params.id
    // Listar los quarterly reports del workgroup, incluyendo participantes, presupuesto y comentarios
    const reports = await prisma.quarterlyReport.findMany({
      where: { workGroupId },
      include: {
        participants: { include: { user: true } },
        budgetItems: true,
        comments: { include: { user: true } }
      },
      orderBy: [
        { year: "desc" },
        { quarter: "desc" }
      ]
    })
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error listando quarterly reports:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST: Crear un nuevo quarterly report para un workgroup
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const userId = session.user.id
    const { id: workGroupId } = await params
    console.log("[POST /quarterly-reports] userId:", userId, "workGroupId:", workGroupId);
    const members = await prisma.workGroupMember.findMany({ where: { workGroupId } });
    console.log("[POST /quarterly-reports] Miembros del grupo:", members);

    // Verificar que el usuario sea miembro y admin del workgroup
    const membership = await prisma.workGroupMember.findFirst({
      where: {
        userId,
        workGroupId
      }
    })
    console.log("[POST /quarterly-reports] Resultado búsqueda membresía:", membership);
    if (!membership) {
      return NextResponse.json({ error: "Solo miembros del workgroup pueden crear reportes" }, { status: 403 })
    }

    const body = await request.json()
    const {
      year,
      quarter,
      detail,
      theoryOfChange,
      challenges,
      participation,
      plans,
      participants, // array de userIds
      budgetItems // array de { name, description, amountUsd }
    } = body

    // Crear el quarterly report
    const report = await prisma.quarterlyReport.create({
      data: {
        workGroupId,
        year,
        quarter,
        detail,
        theoryOfChange,
        challenges,
        participation,
        plans,
        createdById: userId,
        participants: {
          create: participants?.map((userId: string) => ({ userId })) || []
        },
        budgetItems: {
          create: budgetItems?.map((item: any) => ({
            name: item.name,
            description: item.description,
            amountUsd: item.amountUsd
          })) || []
        }
      },
      include: {
        participants: { include: { user: true } },
        budgetItems: true
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error creando quarterly report:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
} 