import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Fetch all data in parallel
    const [workgroups, users] = await Promise.all([
      prisma.workGroup.findMany({
        include: {
          _count: {
            select: {
              members: true
            }
          }
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true
        }
      })
    ])



    // Process workgroups data
    const workGroups = {
      total: workgroups.length,
      active: workgroups.filter(wg => wg.status === "Active").length,
      inactive: workgroups.filter(wg => wg.status === "Inactive").length,
      byType: processWorkGroupTypes(workgroups)
    }

    // Process participants data
    const participants = {
      total: users.length,
      active: users.filter(u => u.status === "ACTIVE").length,
      newThisMonth: users.filter(u => {
        const createdAt = new Date(u.createdAt)
        const now = new Date()
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
      }).length,
      byRole: processUserRoles(users)
    }



    // Process activity data
    const activity = {

      topWorkGroups: workgroups
        .sort((a, b) => (b._count.members || 0) - (a._count.members || 0))
        .slice(0, 5)
        .map(wg => ({
          id: wg.id,
          name: wg.name,
          memberCount: wg._count.members || 0,
          status: wg.status
        }))
    }

    return NextResponse.json({
      workGroups,
      participants,
      activity
    })

  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}



function processWorkGroupTypes(workgroups: any[]) {
  const typeCounts: { [key: string]: number } = {}
  workgroups.forEach(wg => {
    const type = wg.type || "Unknown"
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })
  return Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

function processUserRoles(users: any[]) {
  const roleCounts: { [key: string]: number } = {}
  users.forEach(user => {
    const role = user.role || "USER"
    roleCounts[role] = (roleCounts[role] || 0) + 1
  })
  return Object.entries(roleCounts)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
}

 