"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart3Icon, 
  TrendingUpIcon, 
  PieChartIcon,
  ActivityIcon,
  UsersIcon,
  DollarSignIcon,
  CalendarIcon,
  TargetIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  BuildingIcon
} from "lucide-react"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

interface AnalyticsData {
  quarterlyReports: {
    total: number
    pending: number
    inConsensus: number
    consensed: number
    byQuarter: { quarter: string; count: number }[]
    byWorkGroup: { workGroup: string; count: number }[]
  }
  workGroups: {
    total: number
    active: number
    inactive: number
    byType: { type: string; count: number }[]
  }
  participants: {
    total: number
    active: number
    newThisMonth: number
    byRole: { role: string; count: number }[]
  }
  budget: {
    total: number
    average: number
    byWorkGroup: { workGroup: string; amount: number }[]
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        
        // Fetch data from APIs
        const [reportsRes, workgroupsRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/workgroups")
        ])
        
        const reports = await reportsRes.json()
        const workgroups = await workgroupsRes.json()

        // Process data for analytics
        const processedData: AnalyticsData = {
          quarterlyReports: {
            total: reports.length,
            pending: reports.filter((r: any) => r.consensusStatus === "PENDING").length,
            inConsensus: reports.filter((r: any) => r.consensusStatus === "IN_CONSENSUS").length,
            consensed: reports.filter((r: any) => r.consensusStatus === "CONSENSED").length,
            byQuarter: processQuarterlyData(reports),
            byWorkGroup: processWorkGroupData(reports)
          },
          workGroups: {
            total: workgroups.length,
            active: workgroups.filter((wg: any) => wg.status === "Active").length,
            inactive: workgroups.filter((wg: any) => wg.status === "Inactive").length,
            byType: processWorkGroupTypes(workgroups)
          },
          participants: {
            total: reports.reduce((sum: number, r: any) => sum + r.participants?.length || 0, 0),
            active: reports.reduce((sum: number, r: any) => sum + (r.participants?.length || 0), 0),
            newThisMonth: Math.floor(Math.random() * 20) + 5, // Mock data
            byRole: [
              { role: "Core Contributors", count: Math.floor(Math.random() * 50) + 20 },
              { role: "Community Members", count: Math.floor(Math.random() * 100) + 50 },
              { role: "Admins", count: Math.floor(Math.random() * 10) + 5 }
            ]
          },
          budget: {
            total: reports.reduce((sum: number, r: any) => 
              sum + r.budgetItems?.reduce((itemSum: number, item: any) => itemSum + (item.amountUsd || 0), 0) || 0, 0
            ),
            average: 0,
            byWorkGroup: processBudgetData(reports)
          }
        }

        processedData.budget.average = processedData.budget.total / processedData.quarterlyReports.total || 0
        
        setAnalyticsData(processedData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const processQuarterlyData = (reports: any[]) => {
    const quarters = ["Q1", "Q2", "Q3", "Q4"]
    return quarters.map(quarter => ({
      quarter,
      count: reports.filter(r => r.quarter === quarter).length
    }))
  }

  const processWorkGroupData = (reports: any[]) => {
    const workGroupCounts: { [key: string]: number } = {}
    reports.forEach(report => {
      const workGroupName = report.workGroup?.name || "Unknown"
      workGroupCounts[workGroupName] = (workGroupCounts[workGroupName] || 0) + 1
    })
    return Object.entries(workGroupCounts).map(([workGroup, count]) => ({ workGroup, count }))
  }

  const processWorkGroupTypes = (workgroups: any[]) => {
    const typeCounts: { [key: string]: number } = {}
    workgroups.forEach(wg => {
      typeCounts[wg.type] = (typeCounts[wg.type] || 0) + 1
    })
    return Object.entries(typeCounts).map(([type, count]) => ({ type, count }))
  }

  const processBudgetData = (reports: any[]) => {
    const budgetByWorkGroup: { [key: string]: number } = {}
    reports.forEach(report => {
      const workGroupName = report.workGroup?.name || "Unknown"
      const budget = report.budgetItems?.reduce((sum: number, item: any) => sum + (item.amountUsd || 0), 0) || 0
      budgetByWorkGroup[workGroupName] = (budgetByWorkGroup[workGroupName] || 0) + budget
    })
    return Object.entries(budgetByWorkGroup).map(([workGroup, amount]) => ({ workGroup, amount }))
  }

  if (loading) {
    return <LoadingSkeleton type="page" />
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
            <AlertCircleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Analytics & Insights</h1>
            <p className="text-gray-400 font-medium">Error loading analytics data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
          <BarChart3Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-wide">Analytics & Insights</h1>
          <p className="text-gray-400 font-medium">Comprehensive analytics and performance insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3Icon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Reports</p>
                <p className="text-2xl font-bold text-white">{analyticsData.quarterlyReports.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Consensed</p>
                <p className="text-2xl font-bold text-white">{analyticsData.quarterlyReports.consensed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Active Participants</p>
                <p className="text-2xl font-bold text-white">{analyticsData.participants.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSignIcon className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Budget</p>
                <p className="text-2xl font-bold text-white">${(analyticsData.budget.total / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="border-gray-700" />

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Reports Status */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Quarterly Reports Status</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">Pending</span>
                </div>
                <Badge variant="outline" className="text-blue-400">{analyticsData.quarterlyReports.pending}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">In Consensus</span>
                </div>
                <Badge variant="outline" className="text-yellow-400">{analyticsData.quarterlyReports.inConsensus}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-300">Consensed</span>
                </div>
                <Badge variant="outline" className="text-green-400">{analyticsData.quarterlyReports.consensed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Groups Overview */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BuildingIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Work Groups Overview</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Total Groups</span>
                <Badge variant="outline" className="text-gray-400">{analyticsData.workGroups.total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Active Groups</span>
                <Badge variant="outline" className="text-green-400">{analyticsData.workGroups.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Inactive Groups</span>
                <Badge variant="outline" className="text-gray-400">{analyticsData.workGroups.inactive}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Distribution */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSignIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Budget Distribution</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.budget.byWorkGroup.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 truncate">{item.workGroup}</span>
                  <Badge variant="outline" className="text-green-400">
                    ${(item.amount / 1000).toFixed(1)}K
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Participant Demographics */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Participant Demographics</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.participants.byRole.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{role.role}</span>
                  <Badge variant="outline" className="text-purple-400">{role.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Reports by Quarter */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Reports by Quarter</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.quarterlyReports.byQuarter.map((quarter, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{quarter.quarter}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(quarter.count / Math.max(...analyticsData.quarterlyReports.byQuarter.map(q => q.count))) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="outline" className="text-blue-400">{quarter.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work Groups by Type */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ActivityIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Work Groups by Type</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.workGroups.byType.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{type.type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(type.count / Math.max(...analyticsData.workGroups.byType.map(t => t.count))) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="outline" className="text-green-400">{type.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 