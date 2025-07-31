import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    console.log("API: Fetching comments for report:", reportId);

    // Verificar que el reporte existe
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      console.log("API: Report not found");
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Obtener todos los comentarios del reporte usando ConsensusComment
    const comments = await prisma.consensusComment.findMany({
      where: {
        reportId,
        parentCommentId: null // Solo comentarios principales
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
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log("API: Found comments:", comments.length);
    console.log("API: Comments structure:", JSON.stringify(comments, null, 2));

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 