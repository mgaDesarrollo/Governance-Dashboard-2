"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CalendarIcon, EditIcon } from "lucide-react"
import type { Proposal } from "@/lib/types"

interface EditProposalDialogProps {
  proposal: Proposal
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (updatedProposal: Proposal) => void
}

export function EditProposalDialog({ proposal, open, onOpenChange, onSuccess }: EditProposalDialogProps) {
  const [title, setTitle] = useState(proposal.title)
  const [description, setDescription] = useState(proposal.description)
  const [expiresAt, setExpiresAt] = useState(new Date(proposal.expiresAt).toISOString().slice(0, 16))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required")
      return
    }

    const expirationDate = new Date(expiresAt)
    if (expirationDate <= new Date()) {
      setError("Expiration date must be in the future")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH", // Cambiado de PUT a PATCH
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          expiresAt: expirationDate.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update proposal")
      }

      const updatedProposal = await response.json()
      onSuccess(updatedProposal)
      onOpenChange(false) // Cerrar el modal después del éxito
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle(proposal.title)
    setDescription(proposal.description)
    setExpiresAt(new Date(proposal.expiresAt).toISOString().slice(0, 16))
    setError(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700 text-slate-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <EditIcon className="h-5 w-5" />
            Edit Proposal
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Make changes to your proposal. The community will be able to see that it has been edited.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-200">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title..."
              className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed description of your proposal..."
              className="min-h-[200px] bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500 resize-y"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="text-slate-200 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Expiration Date & Time
            </Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500"
              disabled={isSubmitting}
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md">{error}</div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                  Updating...
                </>
              ) : (
                <>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Update Proposal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
