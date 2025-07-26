import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consensusStatus = searchParams.get('consensusStatus');

    // Construir el where clause
    const where: any = {};
    if (consensusStatus) {
      // Convertir el valor a mayúsculas para que coincida con el enum
      where.consensusStatus = consensusStatus.toUpperCase();
    }

    const reports = await prisma.quarterlyReport.findMany({
      where,
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
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 