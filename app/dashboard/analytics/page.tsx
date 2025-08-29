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
  BuildingIcon,
  FileTextIcon,
  UserPlusIcon
} from "lucide-react"
import { LoadingSkeleton, SimpleLoading } from "@/components/ui/loading-skeleton"

interface AnalyticsData {
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
  activity: {
    topWorkGroups: {
      id: string
      name: string
      memberCount: number
      status: string
    }[]
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        
        const response = await fetch("/api/analytics")
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }
        
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  if (loading) {
    return <SimpleLoading size="lg" className="min-h-[400px]" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONSENSED": return "text-green-400"
      case "IN_CONSENSUS": return "text-yellow-400"
      case "PENDING": return "text-blue-400"
      default: return "text-gray-400"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "CONSENSED": return "bg-green-500/20 text-green-300 border-green-500/30"
      case "IN_CONSENSUS": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "PENDING": return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
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


        <Card className="bg-black border-gray-700">
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


      </div>

      <Separator className="border-gray-700" />

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* Work Groups Overview */}
        <Card className="bg-black border-gray-700">
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



        {/* Participant Demographics */}
        <Card className="bg-black border-gray-700">
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* Top Work Groups */}
        <Card className="bg-black border-gray-700">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BuildingIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white tracking-wide">Top Work Groups</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.activity.topWorkGroups.map((workgroup, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-gray-700">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white truncate">{workgroup.name}</p>
                    <p className="text-xs text-gray-400">{workgroup.status}</p>
                  </div>
                  <Badge variant="outline" className="text-green-400">
                    {workgroup.memberCount} members
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* Work Groups by Type */}
        <Card className="bg-black border-gray-700">
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

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlusIcon className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">New This Month</p>
                <p className="text-2xl font-bold text-white">{analyticsData.participants.newThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>



        <Card className="bg-black border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TargetIcon className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400 font-medium">Total Participants</p>
                <p className="text-2xl font-bold text-white">{analyticsData.participants.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 