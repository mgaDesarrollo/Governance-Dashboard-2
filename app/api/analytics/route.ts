import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Fetch all data in parallel
    const [reports, workgroups, users] = await Promise.all([
      prisma.quarterlyReport.findMany({
        include: {
          workGroup: true
        }
      }),
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

    // Process quarterly reports data
    const quarterlyReports = {
      total: reports.length,
      pending: reports.filter(r => r.consensusStatus === "PENDING").length,
      inConsensus: reports.filter(r => r.consensusStatus === "IN_CONSENSUS").length,
      consensed: reports.filter(r => r.consensusStatus === "CONSENSED").length,
      byQuarter: processQuarterlyData(reports),
      byWorkGroup: processWorkGroupData(reports)
    }

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

    // Process budget data
    const budget = {
      total: reports.reduce((sum, report) => {
        const budgetItems = report.budgetItems as any[] || []
        return sum + budgetItems.reduce((itemSum, item) => itemSum + (item.amountUsd || 0), 0)
      }, 0),
      average: 0,
      byWorkGroup: processBudgetData(reports)
    }

    // Calculate average budget
    budget.average = quarterlyReports.total > 0 ? budget.total / quarterlyReports.total : 0

    // Process activity data
    const activity = {
      recentReports: reports
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(report => ({
          id: report.id,
          title: report.title,
          workGroup: report.workGroup?.name || "Unknown",
          status: report.consensusStatus,
          createdAt: report.createdAt
        })),
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
      quarterlyReports,
      workGroups,
      participants,
      budget,
      activity
    })

  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}

function processQuarterlyData(reports: any[]) {
  const quarters = ["Q1", "Q2", "Q3", "Q4"]
  return quarters.map(quarter => ({
    quarter,
    count: reports.filter(r => r.quarter === quarter).length
  }))
}

function processWorkGroupData(reports: any[]) {
  const workGroupCounts: { [key: string]: number } = {}
  reports.forEach(report => {
    const workGroupName = report.workGroup?.name || "Unknown"
    workGroupCounts[workGroupName] = (workGroupCounts[workGroupName] || 0) + 1
  })
  return Object.entries(workGroupCounts)
    .map(([workGroup, count]) => ({ workGroup, count }))
    .sort((a, b) => b.count - a.count)
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

function processBudgetData(reports: any[]) {
  const budgetByWorkGroup: { [key: string]: number } = {}
  reports.forEach(report => {
    const workGroupName = report.workGroup?.name || "Unknown"
    const budgetItems = report.budgetItems as any[] || []
    const budget = budgetItems.reduce((sum, item) => sum + (item.amountUsd || 0), 0)
    budgetByWorkGroup[workGroupName] = (budgetByWorkGroup[workGroupName] || 0) + budget
  })
  return Object.entries(budgetByWorkGroup)
    .map(([workGroup, amount]) => ({ workGroup, amount }))
    .sort((a, b) => b.amount - a.amount)
} 