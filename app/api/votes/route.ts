import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, voteType, comment } = body;

    // Validaciones
    if (!reportId || !voteType || !comment) {
      return NextResponse.json({ 
        error: "Missing required fields: reportId, voteType, comment" 
      }, { status: 400 });
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({ 
        error: "Comment must be at least 10 characters long" 
      }, { status: 400 });
    }

    // Verificar que el reporte existe y está en estado de consenso
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId },
      include: {
        votingRounds: {
          where: { status: "ACTIVA" },
          orderBy: { roundNumber: "desc" },
          take: 1
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.consensusStatus === "CONSENSED") {
      return NextResponse.json({ error: "Report already consensed" }, { status: 400 });
    }

    // Obtener la ronda activa
    const activeRound = report.votingRounds[0];
    if (!activeRound) {
      return NextResponse.json({ error: "No active voting round found" }, { status: 400 });
    }

    // Verificar si el usuario ya votó en esta ronda
    const existingVote = await prisma.consensusVote.findUnique({
      where: {
        userId_roundId: {
          userId: session.user.id,
          roundId: activeRound.id
        }
      }
    });

    if (existingVote) {
      // Actualizar el voto existente
      const updatedVote = await prisma.consensusVote.update({
        where: { id: existingVote.id },
        data: {
          voteType,
          comment,
          updatedAt: new Date()
        },
        include: {
          user: true,
          objection: true
        }
      });

      // Si el voto es de tipo OBJETAR, crear o actualizar la objeción
      if (voteType === "OBJETAR") {
        await prisma.objection.upsert({
          where: { voteId: updatedVote.id },
          update: {},
          create: {
            voteId: updatedVote.id,
            status: "PENDIENTE"
          }
        });
      }

      return NextResponse.json(updatedVote);
    }

    // Crear nuevo voto
    const newVote = await prisma.consensusVote.create({
      data: {
        userId: session.user.id,
        reportId,
        voteType,
        comment,
        roundId: activeRound.id
      },
      include: {
        user: true,
        objection: true
      }
    });

    // Si el voto es de tipo OBJETAR, crear la objeción
    if (voteType === "OBJETAR") {
      await prisma.objection.create({
        data: {
          voteId: newVote.id,
          status: "PENDIENTE"
        }
      });
    }

    return NextResponse.json(newVote);
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 