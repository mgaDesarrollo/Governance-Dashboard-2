import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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