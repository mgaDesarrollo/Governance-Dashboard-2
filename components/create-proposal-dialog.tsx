"use client";
import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import BudgetItems, { BudgetItem } from "@/components/budget-items";
import WorkGroupSelector from "@/components/workgroup-selector";

export function CreateProposalDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [selectedWorkGroups, setSelectedWorkGroups] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState("Q1");
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [proposalType, setProposalType] = useState<"COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT">("COMMUNITY_PROPOSAL");
  const router = useRouter();

  const handleSelectedWorkGroupsChange = useCallback((workGroupIds: string[]) => {
    setSelectedWorkGroups(workGroupIds);
  }, []);

  const handleBudgetItemsChange = useCallback((items: BudgetItem[]) => {
    setBudgetItems(items);
  }, []);

  const handleAddLink = () => {
    if (newLink && /^https?:\/\//.test(newLink)) {
      setLinks([...links, newLink]);
      setNewLink("");
    }
  };

  const handleRemoveLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !expiresAt) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          proposalType,
          expiresAt: new Date(expiresAt).toISOString(),
          budgetItems,
          workGroupIds: selectedWorkGroups,
          quarter: proposalType === "QUARTERLY_REPORT" ? quarter : undefined,
          links,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create proposal");
      }
      const proposal = await response.json();
      setOpen(false);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        router.push(`/dashboard/proposals/${proposal.id}`);
      }, 100);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (proposalType === "QUARTERLY_REPORT") setQuarter("Q1");
  }, [proposalType]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold">Create Proposal</button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
        </DialogHeader>
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded mb-4">{error}</div>
        )}
          <div className="h-[90vh] max-h-[90vh] overflow-y-auto pr-2 flex flex-col justify-start">
            <form onSubmit={handleSubmit} className="space-y-4">
          {/* Proposal Title */}
          <div>
            <label className="block mb-1">Proposal Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white" />
          </div>
          {/* Proposal Type */}
          <div>
            <label className="block mb-1">Proposal Type</label>
            <select value={proposalType} onChange={e => setProposalType(e.target.value as any)} className="w-full p-2 rounded bg-slate-700 text-white">
              <option value="COMMUNITY_PROPOSAL">Community Proposal</option>
              <option value="QUARTERLY_REPORT">Quarterly Report & Proposal</option>
            </select>
          </div>
          {/* Quarter (solo si es Quarterly Report) */}
          {proposalType === "QUARTERLY_REPORT" && (
            <div>
              <label className="block mb-1">Quarter</label>
              <select value={quarter} onChange={e => setQuarter(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white">
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
          )}
          {/* Workgroup Selector */}
          <div>
            <label className="block mb-1">Workgroup</label>
            <div className="mt-2">
              {/* Selector avanzado para workgroups */}
              <WorkGroupSelector selectedWorkGroups={selectedWorkGroups} onChange={setSelectedWorkGroups} />
            </div>
          </div>
          {/* Expiration Date */}
          <div>
            <label className="block mb-1">Expiration Date</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} required className="w-full p-2 rounded bg-slate-700 text-white" />
          </div>
          {/* Description */}
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter proposal description..."
              required
              className="w-full p-2 rounded bg-slate-700 text-white min-h-[120px]"
            />
          </div>
          {/* Budget Items (arreglo editable) */}
          <div>
            <BudgetItems items={budgetItems} onChange={(items: BudgetItem[]) => setBudgetItems(items)} />
          </div>
          {/* Relevant Links */}
          <div>
            <label className="block mb-1">Relevant Links</label>
            <div className="flex gap-2 mb-2">
              <input type="url" placeholder="Add a link..." value={newLink} onChange={e => setNewLink(e.target.value)} className="flex-1 p-2 rounded bg-slate-700 text-white" />
              <button type="button" onClick={handleAddLink} className="bg-white text-black px-4 py-2 rounded">Add</button>
            </div>
            <ul className="list-disc pl-5">
              {links.map((link, idx) => (
                <li key={idx} className="mb-1">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-green-400 underline break-all">{link}</a>
                  <button type="button" className="ml-2 text-xs text-red-400" onClick={() => handleRemoveLink(idx)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black py-3 rounded font-bold mt-6">
              {isSubmitting ? "Creating..." : "Create Proposal"}
            </button>
          </DialogFooter>
        </form>
      </div>
      </DialogContent>
    </Dialog>
  );
}
