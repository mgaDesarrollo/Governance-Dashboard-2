import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    console.log("API: Creating new voting round for report:", reportId);

    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("API: Unauthorized - No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar que el usuario es admin o super admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      console.log("API: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar permisos de administrador
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
    
    // Verificar si es admin de algún workgroup
    const workgroupMemberships = await prisma.workGroupMember.findMany({
      where: {
        userId: session.user.id,
        role: {
          in: ["ADMIN", "SUPER_ADMIN"]
        }
      }
    });
    
    const isWorkgroupAdmin = workgroupMemberships.length > 0;

    if (!isAdmin && !isWorkgroupAdmin) {
      console.log("API: Insufficient permissions");
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Verificar que el reporte existe
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      console.log("API: Report not found");
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Cerrar la ronda activa anterior si existe
    await prisma.votingRound.updateMany({
      where: {
        reportId,
        status: "ACTIVA"
      },
      data: {
        status: "CERRADA",
        endedAt: new Date()
      }
    });

    // Obtener el número de la siguiente ronda
    const lastRound = await prisma.votingRound.findFirst({
      where: { reportId },
      orderBy: { roundNumber: "desc" }
    });

    const nextRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

    // Crear nueva ronda de votación
    const newRound = await prisma.votingRound.create({
      data: {
        reportId,
        roundNumber: nextRoundNumber,
        status: "ACTIVA",
        startedAt: new Date()
      }
    });

    // Actualizar el estado del reporte a IN_CONSENSUS
    await prisma.quarterlyReport.update({
      where: { id: reportId },
      data: { consensusStatus: "IN_CONSENSUS" }
    });

    console.log("API: New voting round created:", newRound.id);

    return NextResponse.json({ 
      success: true, 
      votingRound: newRound 
    });
  } catch (error) {
    console.error("Error creating voting round:", error);
    console.error("Error details:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 