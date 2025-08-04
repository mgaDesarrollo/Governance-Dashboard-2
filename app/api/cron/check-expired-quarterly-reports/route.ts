import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Esta función se puede llamar mediante un cron job o manualmente
export async function GET(request: Request) {
  try {
    // Verificar si la solicitud incluye una clave de API válida
    const url = new URL(request.url)
    const apiKey = url.searchParams.get("apiKey")

    // En producción, deberías verificar una clave de API real
    // Por ahora, usamos una clave simple para demostración
    if (apiKey !== process.env.CRON_API_KEY && apiKey !== "demo-key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar quarterly reports que han expirado pero siguen en estado IN_CONSENSUS
    const now = new Date()
    
    // Calcular la fecha límite para quarterly reports (3 meses después de la creación)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    const expiredQuarterlyReports = await prisma.quarterlyReport.findMany({
      where: {
        consensusStatus: "IN_CONSENSUS",
        createdAt: {
          lt: threeMonthsAgo,
        },
      },
      include: {
        workGroup: true,
        createdBy: true,
      },
    })

    // Actualizar el estado de los quarterly reports expirados
    const updatePromises = expiredQuarterlyReports.map((report) =>
      prisma.quarterlyReport.update({
        where: { id: report.id },
        data: { consensusStatus: "CONSENSED" },
      }),
    )

    const updatedReports = await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `${updatedReports.length} quarterly reports marked as expired`,
      updatedReports: updatedReports.map((r) => ({ 
        id: r.id, 
        workGroupId: r.workGroupId,
        year: r.year,
        quarter: r.quarter
      })),
    })
  } catch (error) {
    console.error("Error checking expired quarterly reports:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 