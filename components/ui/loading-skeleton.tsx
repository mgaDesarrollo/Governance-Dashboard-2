import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface LoadingSkeletonProps {
  type?: "page" | "card" | "list"
  className?: string
}

export function LoadingSkeleton({ type = "page", className = "" }: LoadingSkeletonProps) {
  if (type === "page") {
    return (
      <div className={`min-h-screen bg-black p-6 w-full ${className}`}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-700 rounded w-64"></div>
                <div className="h-4 bg-gray-700 rounded w-96"></div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            
            {/* Separator skeleton */}
            <div className="h-px bg-gray-700 mb-6"></div>
            
            {/* Content skeleton */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === "card") {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="h-4 bg-gray-700 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-700 rounded w-16 animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  return null
} 