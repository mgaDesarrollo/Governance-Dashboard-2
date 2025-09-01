"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, EditIcon, XIcon } from "lucide-react"
import type { Proposal } from "@/lib/types"
import BudgetItems, { BudgetItem } from "@/components/budget-items"
import WorkGroupSelector from "@/components/workgroup-selector"

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
  const [proposalType, setProposalType] = useState<"COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT">(
    (proposal.proposalType as "COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT") || "COMMUNITY_PROPOSAL"
  )
  const [quarter, setQuarter] = useState<string>(proposal.quarter || "Q1")
  const [selectedWorkGroups, setSelectedWorkGroups] = useState<string[]>(proposal.workGroupIds || [])
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(proposal.budgetItems || [])
  const [links, setLinks] = useState<string[]>(proposal.links || [])
  const [newLink, setNewLink] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when proposal changes
  useEffect(() => {
    if (proposal) {
      setTitle(proposal.title)
      setDescription(proposal.description)
      setExpiresAt(new Date(proposal.expiresAt).toISOString().slice(0, 16))
      setProposalType((proposal.proposalType as "COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT") || "COMMUNITY_PROPOSAL")
      setQuarter(proposal.quarter || "Q1")
      setSelectedWorkGroups(proposal.workGroupIds || [])
      setBudgetItems(proposal.budgetItems || [])
      setLinks(proposal.links || [])
      setError(null)
    }
  }, [proposal])

  const handleAddLink = () => {
    if (newLink && /^https?:\/\//.test(newLink)) {
      setLinks([...links, newLink])
      setNewLink("")
    }
  }
  const handleRemoveLink = (idx: number) => setLinks(links.filter((_, i) => i !== idx))

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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          expiresAt: expirationDate.toISOString(),
          proposalType,
          quarter: proposalType === "QUARTERLY_REPORT" ? quarter : undefined,
          workGroupIds: selectedWorkGroups,
          budgetItems,
          links,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update proposal")
      }

      const updatedProposal = await response.json()
      onSuccess(updatedProposal)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the proposal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      // Reset form when closing
      setTitle(proposal.title)
      setDescription(proposal.description)
      setExpiresAt(new Date(proposal.expiresAt).toISOString().slice(0, 16))
      setProposalType((proposal.proposalType as "COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT") || "COMMUNITY_PROPOSAL")
      setQuarter(proposal.quarter || "Q1")
      setSelectedWorkGroups(proposal.workGroupIds || [])
      setBudgetItems(proposal.budgetItems || [])
      setLinks(proposal.links || [])
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-black border-slate-700 text-slate-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <EditIcon className="h-5 w-5" />
            Edit Proposal
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Make changes to your proposal. The community will be able to see that it has been edited.
          </DialogDescription>
        </DialogHeader>

        <div className="h-[90vh] max-h-[90vh] overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
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

            {/* Description */}
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

            {/* Proposal Type */}
            <div className="space-y-2">
              <Label htmlFor="proposalType" className="text-slate-200">
                Proposal Type
              </Label>
              <Select value={proposalType} onValueChange={(value: "COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT") => setProposalType(value)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-slate-600">
                  <SelectItem value="COMMUNITY_PROPOSAL" className="text-slate-200 hover:bg-slate-700">
                    Community Proposal
                  </SelectItem>
                  <SelectItem value="QUARTERLY_REPORT" className="text-slate-200 hover:bg-slate-700">
                    Quarterly Report
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quarter (if Quarterly Report) */}
            {proposalType === "QUARTERLY_REPORT" && (
              <div className="space-y-2">
                <Label htmlFor="quarter" className="text-slate-200">
                  Quarter
                </Label>
                <Select value={quarter} onValueChange={(val: string) => setQuarter(val)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50 focus:border-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-slate-600">
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Workgroups */}
            <div className="space-y-2">
              <Label className="text-slate-200">
                Workgroups
              </Label>
              <WorkGroupSelector selectedWorkGroups={selectedWorkGroups} onChange={setSelectedWorkGroups} />
            </div>

            {/* Budget Items */}
            <div>
              <BudgetItems items={budgetItems} onChange={(items: BudgetItem[]) => setBudgetItems(items)} />
            </div>

            {/* Relevant Links */}
            <div className="space-y-2">
              <Label className="text-slate-200">
                Relevant Links
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="url"
                  placeholder="Add a link..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="flex-1 bg-slate-700 text-slate-50"
                  disabled={isSubmitting}
                />
                <Button type="button" onClick={handleAddLink} disabled={isSubmitting}>
                  Add
                </Button>
              </div>
              <ul className="list-disc pl-5">
                {links.map((link, idx) => (
                  <li key={idx} className="mb-1 flex items-center justify-between">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline break-all">
                      {link}
                    </a>
                    <Button variant="link" size="sm" onClick={() => handleRemoveLink(idx)} disabled={isSubmitting}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expiration Date */}
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

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Footer */}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
