import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("API: Fetching quarterly reports for workgroup:", id);

    // Verificar que el workgroup existe
    const workgroup = await prisma.workGroup.findUnique({
      where: { id }
    });

    if (!workgroup) {
      console.log("API: Workgroup not found");
      return NextResponse.json({ error: "Workgroup not found" }, { status: 404 });
    }

    // Obtener todos los reportes trimestrales del workgroup
    const reports = await prisma.quarterlyReport.findMany({
      where: { workGroupId: id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        budgetItems: true,
        votingRounds: {
          orderBy: { roundNumber: "desc" }
        }
      },
      orderBy: [
        { year: "desc" },
        { quarter: "desc" }
      ]
    });

    console.log("API: Found reports:", reports.length);

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching quarterly reports:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    console.log("[POST /quarterly-reports] BODY recibido:", body);
    console.log("[POST /quarterly-reports] Tipo de challenges:", typeof body.challenges, Array.isArray(body.challenges), body.challenges);
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
    console.error("Error creando quarterly report:", error, error?.message, error?.stack);
    return NextResponse.json({ error: "Internal error", details: error?.message }, { status: 500 })
  }
} 