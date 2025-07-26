import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = params;
    const body = await request.json();
    const { consensusStatus } = body;

    // Validaciones
    if (!consensusStatus || !["PENDING", "IN_CONSENSUS", "CONSENSED"].includes(consensusStatus)) {
      return NextResponse.json({ 
        error: "Invalid consensus status. Must be PENDING, IN_CONSENSUS, or CONSENSED" 
      }, { status: 400 });
    }

    // Verificar que el reporte existe
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId },
      include: {
        workGroup: {
          include: {
            members: {
              where: {
                userId: session.user.id,
                role: "admin"
              }
            }
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verificar que el usuario es administrador del workgroup
    const isAdmin = report.workGroup.members.length > 0;
    if (!isAdmin && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only workgroup admins can change consensus status" }, { status: 403 });
    }

    // Si se está marcando como CONSENSED, verificar que no hay objeciones válidas
    if (consensusStatus === "CONSENSED") {
      const validObjections = await prisma.objection.findMany({
        where: {
          vote: {
            reportId
          },
          status: "VALIDA"
        }
      });

      if (validObjections.length > 0) {
        return NextResponse.json({ 
          error: "Cannot mark as consensed while there are valid objections" 
        }, { status: 400 });
      }
    }

    // Actualizar el estado del reporte
    const updatedReport = await prisma.quarterlyReport.update({
      where: { id: reportId },
      data: { consensusStatus },
      include: {
        workGroup: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Si se está marcando como CONSENSED, cerrar la ronda activa
    if (consensusStatus === "CONSENSED") {
      await prisma.votingRound.updateMany({
        where: {
          reportId,
          status: "ACTIVA"
        },
        data: {
          status: "CONSENSADA",
          endedAt: new Date()
        }
      });
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error updating consensus status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 