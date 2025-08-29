
"use client"

import React, { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Transition } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { SaveIcon, ArrowLeftIcon } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";
import WorkGroupSelector from "@/components/workgroup-selector";

interface BudgetItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function CreateProposalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposalType, setProposalType] = useState<"COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT">("COMMUNITY_PROPOSAL");
  const [quarter, setQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4" | "">("");
  const [expiresAt, setExpiresAt] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [selectedWorkGroups, setSelectedWorkGroups] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthorized = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        
        // Crear una URL temporal para previsualización
        const previewUrl = URL.createObjectURL(file);
        setAttachmentUrl(previewUrl);
        
        // Validar el tipo y tamaño del archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'application/pdf'];
        if (allowedTypes.indexOf(file.type) === -1) {
          throw new Error('Tipo de archivo no soportado. Por favor, sube una imagen o PDF.');
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('El archivo es demasiado grande. El tamaño máximo es 5MB.');
        }

        // Subir el archivo a Azure Blob Storage
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadType', 'proposal');

        const response = await fetch('/api/upload-blob', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error uploading file:', errorData);
          throw new Error(errorData.error || 'Error al subir el archivo');
        }

        const data = await response.json();
        if (!data.url) {
          throw new Error('No se recibió la URL del archivo subido');
        }

        setAttachment(file);

      } catch (err: any) {
        setError(err.message);
        setAttachment(null);
        setAttachmentUrl('');
      }
    }
  }, []);

  const handleSelectedWorkGroupsChange = useCallback((workGroupIds: string[]) => {
    setSelectedWorkGroups(workGroupIds);
  }, []);

  const handleProposalTypeChange = useCallback((value: "COMMUNITY_PROPOSAL" | "QUARTERLY_REPORT") => {
    setProposalType(value);
    if (value === "COMMUNITY_PROPOSAL") {
      setQuarter("");
    }
  }, []);

  const handleBudgetItemsChange = useCallback((items: BudgetItem[]) => {
    setBudgetItems(items);
  }, []);

  // Limpiar URLs de objetos cuando el componente se desmonte
  React.useEffect(() => {
    return () => {
      if (attachmentUrl) {
        URL.revokeObjectURL(attachmentUrl);
      }
    };
  }, [attachmentUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    if (!expiresAt) {
      setError("Expiration date is required");
      return;
    }

    if (proposalType === "QUARTERLY_REPORT" && !quarter) {
      setError("Quarter selection is required for quarterly reports");
      return;
    }

    const expirationDate = new Date(expiresAt);
    if (expirationDate <= new Date()) {
      setError("Expiration date must be in the future");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const proposalData = {
        title: title.trim(),
        description: description.trim(),
        expiresAt: expirationDate.toISOString(),
        attachment: attachmentUrl,
        proposalType,
        quarter: proposalType === "QUARTERLY_REPORT" ? quarter : null,
        budgetItems,
        workGroupIds: selectedWorkGroups,
      };

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create proposal");
      }

      const newProposal = await response.json();
      router.push(`/dashboard/proposals/${newProposal.id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/proposals")}
            className="mb-6 bg-black border-slate-700 hover:bg-black text-slate-300 hover:text-slate-100"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-400">You don't have permission to create proposals.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Transition
      show={true}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <div className="min-h-screen bg-black text-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/proposals")}
              className="mb-6 bg-black border-slate-700 hover:bg-black text-slate-300 hover:text-slate-100"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Proposals
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Create New Proposal</h1>
            <p className="text-slate-400">Submit a new proposal for community review and voting.</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-200">
                Title *
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter proposal title..."
                className="bg-black border-slate-600 text-slate-50 focus:border-purple-500 hover:border-purple-400 transition-colors"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-200">
                Description *
              </Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Describe your proposal in detail..."
              />
            </div>

            {/* Proposal Type */}
            <div className="space-y-2">
              <Label htmlFor="proposalType" className="text-slate-200">
                Proposal Type *
              </Label>
              <Select value={proposalType} onValueChange={handleProposalTypeChange}>
                <SelectTrigger className="bg-black border-slate-600 text-slate-50 focus:border-purple-500 hover:border-purple-400 transition-colors">
                  <SelectValue placeholder="Select proposal type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-slate-600">
                  <SelectItem value="COMMUNITY_PROPOSAL" className="text-slate-200 hover:bg-black">
                    Community Proposal
                  </SelectItem>
                  <SelectItem value="QUARTERLY_REPORT" className="text-slate-200 hover:bg-black">
                    Quarterly Report
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quarter Selection - Only for Quarterly Reports */}
            {proposalType === "QUARTERLY_REPORT" && (
              <div className="space-y-2">
                <Label htmlFor="quarter" className="text-slate-200">
                  Quarter *
                </Label>
                <Select value={quarter} onValueChange={(value: "Q1" | "Q2" | "Q3" | "Q4") => setQuarter(value)}>
                  <SelectTrigger className="bg-black border-slate-600 text-slate-50 focus:border-purple-500 hover:border-purple-400 transition-colors">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-slate-600">
                    <SelectItem value="Q1" className="text-slate-200 hover:bg-black">
                      Q1 (January - March)
                    </SelectItem>
                    <SelectItem value="Q2" className="text-slate-200 hover:bg-black">
                      Q2 (April - June)
                    </SelectItem>
                    <SelectItem value="Q3" className="text-slate-200 hover:bg-black">
                      Q3 (July - September)
                    </SelectItem>
                    <SelectItem value="Q4" className="text-slate-200 hover:bg-black">
                      Q4 (October - December)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Attachment */}
            <div className="space-y-2">
              <Label htmlFor="attachment" className="text-slate-200">
                Attachment (Optional)
              </Label>
              <div className="space-y-2">
                <Input
                  id="attachment"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="bg-black border-slate-600 text-slate-50 focus:border-purple-500 hover:border-purple-400 transition-colors cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer file:transition-colors"
                  disabled={isSubmitting}
                />
                {!attachmentUrl && (
                  <div className="mt-2 p-4 bg-black/20 rounded-lg border border-dashed border-slate-600 hover:border-slate-500 transition-colors">
                    <div className="text-center">
                      <span className="block text-2xl mb-2">📁</span>
                      <p className="text-slate-400 text-sm">
                        Upload supporting documents, images, or PDFs (max 5MB)
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        Supported formats: JPG, PNG, GIF, SVG, WebP, PDF
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Preview del archivo */}
                {attachmentUrl && (
                  <div className="mt-2 p-4 bg-gradient-to-r from-black to-black rounded-lg border border-slate-600 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {attachment?.type && attachment.type.startsWith('image/') ? '🖼️' : '📎'}
                        </span>
                        <p className="text-sm text-slate-200 font-medium">File selected</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAttachment(null);
                          setAttachmentUrl("");
                        }}
                        className="h-7 px-3 text-xs bg-red-900/30 border-red-700 text-red-300 hover:bg-red-800/30 hover:scale-105 transition-transform rounded-md"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/50 rounded-md border border-slate-600">
                      <div className="text-2xl">
                        {attachment?.type && attachment.type.startsWith('image/') ? '🖼️' : 
                         attachment?.type && attachment.type.includes('pdf') ? '📄' : '📎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 font-medium truncate">
                          {attachment?.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {attachment?.type && attachment.type.startsWith('image/') ? 'Image' : 
                           attachment?.type && attachment.type.includes('pdf') ? 'PDF Document' : 'File'} • 
                          {attachment && attachment.size ? (attachment.size / 1024 / 1024).toFixed(2) : '0'} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="text-slate-200">
                Expiration Date & Time *
              </Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-black border-slate-600 text-slate-50 focus:border-purple-500 hover:border-purple-400 transition-colors"
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-slate-400">
                Set when this proposal will expire for voting
              </p>
            </div>

            {/* WorkGroup Selector */}
            <div className="space-y-2">
              <WorkGroupSelector 
                selectedWorkGroups={selectedWorkGroups}
                onChange={handleSelectedWorkGroupsChange}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim() || !expiresAt || (proposalType === "QUARTERLY_REPORT" && !quarter)}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 rounded-lg shadow-lg hover:shadow-emerald-500/25 transform hover:-translate-y-0.5"
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
              
              <Button
                type="button" 
                onClick={() => router.push("/dashboard/proposals")}
                className="px-8 py-3 border-slate-600 text-slate-300 hover:bg-black hover:text-slate-100 transition-all duration-200 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  );
}
