"use client"

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

export function DashboardMetrics() {
  // Mock data - en producción esto vendría de tu API
  const metrics = [
    {
      title: "Active Proposals",
      value: 12,
      description: "Currently open for voting",
      icon: <FileTextIcon className="h-4 w-4" />,
      trend: { value: "+2", isPositive: true },
      color: "blue" as const,
    },
    {
      title: "Pending Proposals",
      value: 5,
      description: "Awaiting your vote",
      icon: <ClockIcon className="h-4 w-4" />,
      trend: { value: "+1", isPositive: true },
      color: "yellow" as const,
    },
    {
      title: "Approved This Month",
      value: 8,
      description: "Successfully passed proposals",
      icon: <CheckCircleIcon className="h-4 w-4" />,
      trend: { value: "+3", isPositive: true },
      color: "green" as const,
    },
    {
      title: "Rejected This Month",
      value: 2,
      description: "Proposals that didn't pass",
      icon: <XCircleIcon className="h-4 w-4" />,
      trend: { value: "-1", isPositive: true },
      color: "red" as const,
    },
    {
      title: "Community Members",
      value: 247,
      description: "Active participants",
      icon: <UsersIcon className="h-4 w-4" />,
      trend: { value: "+12", isPositive: true },
      color: "purple" as const,
    },
    {
      title: "Total Votes Cast",
      value: "1.2K",
      description: "This month's participation",
      icon: <VoteIcon className="h-4 w-4" />,
      trend: { value: "+15%", isPositive: true },
      color: "orange" as const,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <TrendingUpIcon className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Dashboard Metrics</h2>
          <p className="text-sm text-slate-400">Key performance indicators and statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  )
}
