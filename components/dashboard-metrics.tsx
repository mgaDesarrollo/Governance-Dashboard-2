"use client"

import { useEffect, useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrendingUpIcon,
  UsersIcon,
  VoteIcon,
  BuildingIcon,
} from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  color: "blue" | "green" | "yellow" | "red" | "purple" | "orange"
}

const MetricCard = ({ title, value, description, icon, trend, color }: MetricCardProps) => {
  const colorClasses = {
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    green: "bg-green-500/10 border-green-500/30 text-green-300",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
    red: "bg-red-500/10 border-red-500/30 text-red-300",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-300",
    orange: "bg-orange-500/10 border-orange-500/30 text-orange-300",
  }

  const iconColorClasses = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    purple: "text-purple-400",
    orange: "text-orange-400",
  }

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <div className={`h-4 w-4 ${iconColorClasses[color]}`}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUpIcon
              className={`h-3 w-3 mr-1 ${trend.isPositive ? "text-green-400" : "text-red-400 rotate-180"}`}
            />
            <span className={`text-xs ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>{trend.value}</span>
            <span className="text-xs text-slate-500 ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface QuarterlyReport {
  id: string
  year: number
  quarter: string
  consensusStatus: "PENDING" | "IN_CONSENSUS" | "CONSENSED"
  workGroup: {
    name: string
  }
  participants: Array<{
    user: {
      id: string
    }
  }>
  budgetItems: Array<{
    amountUsd: number
  }>
}

interface WorkGroup {
  id: string
  name: string
  status: string
  totalMembers: string
}

export function DashboardMetrics() {
  const [quarterlyReports, setQuarterlyReports] = useState<QuarterlyReport[]>([])
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [reportsRes, workgroupsRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/workgroups")
        ])
        
        const reports = await reportsRes.json()
        const workgroups = await workgroupsRes.json()
        
        setQuarterlyReports(reports)
        setWorkGroups(workgroups)
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white tracking-wide">Dashboard Metrics</h2>
        </div>
        <p className="text-gray-400 text-sm">Loading metrics...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const totalReports = quarterlyReports.length
  const pendingConsensus = quarterlyReports.filter(r => r.consensusStatus === "PENDING").length
  const inConsensus = quarterlyReports.filter(r => r.consensusStatus === "IN_CONSENSUS").length
  const consensedReports = quarterlyReports.filter(r => r.consensusStatus === "CONSENSED").length
  const activeWorkgroups = workGroups.filter(wg => wg.status === "Active").length
  const totalParticipants = quarterlyReports.reduce((sum, report) => sum + report.participants.length, 0)

  const metrics = [
    {
      title: "Total Quarterly Reports",
      value: totalReports,
      description: "All quarterly reports created",
      icon: <FileTextIcon className="h-4 w-4" />,
      trend: { value: "+1", isPositive: true },
      color: "blue" as const,
    },
    {
      title: "Pending Consensus",
      value: pendingConsensus,
      description: "Reports awaiting community vote",
      icon: <ClockIcon className="h-4 w-4" />,
      trend: { value: "+1", isPositive: true },
      color: "yellow" as const,
    },
    {
      title: "In Consensus",
      value: inConsensus,
      description: "Reports currently being voted on",
      icon: <VoteIcon className="h-4 w-4" />,
      trend: { value: "+0", isPositive: true },
      color: "purple" as const,
    },
    {
      title: "Consensed Reports",
      value: consensedReports,
      description: "Reports that reached consensus",
      icon: <CheckCircleIcon className="h-4 w-4" />,
      trend: { value: "+1", isPositive: true },
      color: "green" as const,
    },
    {
      title: "Active Workgroups",
      value: activeWorkgroups,
      description: "Currently active workgroups",
      icon: <BuildingIcon className="h-4 w-4" />,
      trend: { value: "+1", isPositive: true },
      color: "orange" as const,
    },
    {
      title: "Total Participants",
      value: totalParticipants,
      description: "Community members participating",
      icon: <UsersIcon className="h-4 w-4" />,
      trend: { value: "+0", isPositive: true },
      color: "blue" as const,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="h-5 w-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white tracking-wide">Dashboard Metrics</h2>
      </div>
      <p className="text-gray-400 text-sm">Key performance indicators and statistics</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  )
}
