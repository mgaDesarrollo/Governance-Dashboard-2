import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportId } = params;

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
      return NextResponse.json({ error: "Only workgroup admins can start new rounds" }, { status: 403 });
    }

    // Verificar que no hay una ronda activa
    const activeRound = await prisma.votingRound.findFirst({
      where: {
        reportId,
        status: "ACTIVA"
      }
    });

    if (activeRound) {
      return NextResponse.json({ error: "There is already an active round" }, { status: 400 });
    }

    // Obtener el número de la siguiente ronda
    const lastRound = await prisma.votingRound.findFirst({
      where: { reportId },
      orderBy: { roundNumber: "desc" }
    });

    const nextRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

    // Cerrar la ronda anterior si existe
    if (lastRound) {
      await prisma.votingRound.update({
        where: { id: lastRound.id },
        data: { status: "CERRADA", endedAt: new Date() }
      });
    }

    // Crear nueva ronda
    const newRound = await prisma.votingRound.create({
      data: {
        reportId,
        roundNumber: nextRoundNumber,
        status: "ACTIVA",
        startedAt: new Date()
      }
    });

    // Actualizar el estado del reporte a EN_CONSENSUS si no lo está
    if (report.consensusStatus === "PENDING") {
      await prisma.quarterlyReport.update({
        where: { id: reportId },
        data: { consensusStatus: "IN_CONSENSUS" }
      });
    }

    return NextResponse.json(newRound);
  } catch (error) {
    console.error("Error creating new round:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 