import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const reports = await prisma.quarterlyReport.findMany({
      include: {
        workGroup: { select: { id: true, name: true } },
        participants: { include: { user: true } },
        budgetItems: true,
        comments: { include: { user: true } }
      },
      orderBy: [
        { year: "desc" },
        { quarter: "desc" }
      ]
    })
    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error listando quarterly reports globales:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
} 