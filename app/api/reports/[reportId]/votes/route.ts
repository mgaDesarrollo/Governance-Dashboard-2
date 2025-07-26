import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params;

    // Verificar que el reporte existe
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Obtener la ronda activa
    const activeRound = await prisma.votingRound.findFirst({
      where: {
        reportId,
        status: "ACTIVA"
      },
      orderBy: { roundNumber: "desc" }
    });

    if (!activeRound) {
      return NextResponse.json({ votes: [], activeRound: null });
    }

    // Obtener todos los votos de la ronda activa
    const votes = await prisma.consensusVote.findMany({
      where: {
        reportId,
        roundId: activeRound.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        objection: {
          include: {
            resolvedBy: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calcular estadísticas
    const stats = {
      aFavor: votes.filter(v => v.voteType === "A_FAVOR").length,
      enContra: votes.filter(v => v.voteType === "EN_CONTRA").length,
      objetar: votes.filter(v => v.voteType === "OBJETAR").length,
      abstenerse: votes.filter(v => v.voteType === "ABSTENERSE").length,
      total: votes.length
    };

    return NextResponse.json({
      votes,
      activeRound,
      stats
    });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 