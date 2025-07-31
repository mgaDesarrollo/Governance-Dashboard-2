import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    console.log("API: Fetching votes for report:", reportId);

    // Verificar que el reporte existe
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      console.log("API: Report not found");
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Obtener la ronda de votación activa
    const activeRound = await prisma.votingRound.findFirst({
      where: {
        reportId,
        status: "ACTIVA"
      }
    });

    if (!activeRound) {
      console.log("API: No active voting round found");
      return NextResponse.json({ votes: [], statistics: { aFavor: 0, enContra: 0, objetar: 0, abstenerse: 0, total: 0 } });
    }

    // Obtener todos los votos de la ronda activa
    const votes = await prisma.consensusVote.findMany({
      where: {
        roundId: activeRound.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        objection: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Calcular estadísticas
    const statistics = {
      aFavor: votes.filter(vote => vote.voteType === "A_FAVOR").length,
      enContra: votes.filter(vote => vote.voteType === "EN_CONTRA").length,
      objetar: votes.filter(vote => vote.voteType === "OBJETAR").length,
      abstenerse: votes.filter(vote => vote.voteType === "ABSTENERSE").length,
      total: votes.length
    };

    console.log("API: Found votes:", votes.length);
    console.log("API: Vote statistics:", statistics);

    return NextResponse.json({ votes, statistics });
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 