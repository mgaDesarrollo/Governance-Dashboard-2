import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("API: Starting GET request for quarterly report");
    const { id } = await params;
    console.log("API: Report ID:", id);
    
    const session = await getServerSession(authOptions);
    console.log("API: Session:", session ? "Found" : "Not found");
    
    if (!session || !session.user) {
      console.log("API: Authentication failed");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const reportId = id;
    console.log("API: Looking for report with ID:", reportId);

    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId },
      include: {
        workGroup: {
          select: {
            id: true,
            name: true
          }
        },
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
          where: { status: "ACTIVA" },
          take: 1,
          include: {
            votes: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    console.log("API: Report found:", report ? "Yes" : "No");

    if (!report) {
      console.log("API: Report not found, returning 404");
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    console.log("API: Successfully returning report");
    return NextResponse.json(report);
  } catch (error) {
    console.error("API: Error fetching quarterly report:", error);
    console.error("API: Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = session.user.id;
    const reportId = params.id;
    const body = await request.json();

    // Verificar que el usuario sea el creador
    const report = await prisma.quarterlyReport.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    if (report.createdById !== userId) {
      return NextResponse.json({ error: "Only the creator can edit this report" }, { status: 403 });
    }

    // Actualizar el reporte principal
    const updated = await prisma.quarterlyReport.update({
      where: { id: reportId },
      data: {
        year: body.year,
        quarter: body.quarter,
        detail: body.detail,
        theoryOfChange: body.theoryOfChange,
        challenges: body.challenges,
        plans: body.plans,
      }
    });

    // Actualizar budgetItems: eliminar todos y volver a crear
    await prisma.quarterlyReportBudgetItem.deleteMany({ where: { quarterlyReportId: reportId } });
    if (Array.isArray(body.budgetItems)) {
      for (const item of body.budgetItems) {
        await prisma.quarterlyReportBudgetItem.create({
          data: {
            quarterlyReportId: reportId,
            name: item.name,
            description: item.description,
            amountUsd: item.amountUsd,
          }
        });
      }
    }

    // (Opcional: actualizar participantes si lo necesitas)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating quarterly report:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 