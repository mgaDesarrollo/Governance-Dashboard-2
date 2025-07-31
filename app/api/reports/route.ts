import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const consensusStatus = searchParams.get("consensusStatus")

    let whereClause: any = {}

    // Filtro por búsqueda
    if (search) {
      whereClause.OR = [
        {
          workGroup: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        {
          quarter: {
            contains: search,
              mode: "insensitive"
          }
        },
        {
          year: {
            equals: parseInt(search) || undefined
          }
        }
      ]
    }

    // Filtro por estado de consenso
    if (consensusStatus) {
      whereClause.consensusStatus = consensusStatus
    }

    const reports = await prisma.quarterlyReport.findMany({
      where: whereClause,
      include: {
        workGroup: {
          select: {
            id: true,
            name: true,
            missionStatement: true
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
        budgetItems: {
          select: {
            id: true,
            amountUsd: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
} 