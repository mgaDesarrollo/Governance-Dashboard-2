import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const workgroups = await prisma.workGroup.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        dateOfCreation: true,
        status: true,
        missionStatement: true,
        goalsAndFocus: true,
        totalMembers: true,
        roles: true,
        memberDirectoryLink: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            role: true,
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
    })
    console.log(JSON.stringify(workgroups, null, 2));
    return NextResponse.json(workgroups)
  } catch (error) {
    console.error("Error listando workgroups:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
