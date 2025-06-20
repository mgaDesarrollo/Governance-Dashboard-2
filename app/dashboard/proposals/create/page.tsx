"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeftIcon, SaveIcon, AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { addDays, format } from "date-fns"

export default function CreateProposalPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [expiresAt, setExpiresAt] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authorized to create proposals
  const isAuthorized = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !expiresAt) {
      setError("Please fill in all fields")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          expiresAt: new Date(expiresAt).toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create proposal")
      }

      const proposal = await response.json()
      router.push(`/dashboard/proposals/${proposal.id}`)
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.replace("/")
    return null
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/proposals")}
          className="mb-6 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Proposals
        </Button>

        <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
          <AlertCircleIcon className="h-5 w-5 text-red-400" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to create proposals. Only administrators can create proposals.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 sm:p-6 lg:p-8">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard/proposals")}
        className="mb-6 bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Proposals
      </Button>

      <Card className="bg-slate-800 border-slate-700 max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Create New Proposal</CardTitle>
          <CardDescription className="text-slate-400">
            Fill in the details below to create a new proposal for the community to vote on.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
                <AlertCircleIcon className="h-5 w-5 text-red-400" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear, concise title"
                className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your proposal"
                className="min-h-[200px] bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
                required
              />
              <p className="text-xs text-slate-400">The proposal will be open for voting until this date.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                  Creating...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Create Proposal
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
