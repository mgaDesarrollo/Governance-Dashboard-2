"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { XIcon, FileTextIcon, PlusIcon, MinusIcon, CalendarIcon, UsersIcon, CurrencyIcon, CheckCircleIcon, ClockIcon, BuildingIcon } from "lucide-react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

// Tipos para challenges
type Challenge = string;
type ChallengeEdit = { text: string; completed: boolean };

export default function QuarterlyReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState([]);
  const [workgroups, setWorkgroups] = useState([]);
  const [filters, setFilters] = useState({ workgroup: "", year: "", quarter: "" });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  // Cambiar el tipo de form para que participants sea string[] y budgetItems sea tipado correctamente
  const [form, setForm] = useState<{
    workgroup: string;
    year: number;
    quarter: string;
    detail: string;
    theoryOfChange: string;
    challenges: string[];
    participation: string;
    plans: string;
    participants: string[];
    budgetItems: { name: string; description: string; amountUsd: number }[];
  }>({
    workgroup: "",
    year: new Date().getFullYear(),
    quarter: "Q1",
    detail: "",
    theoryOfChange: "",
    challenges: [],
    participation: "",
    plans: "",
    participants: [],
    budgetItems: [{ name: "", description: "", amountUsd: 0 }],
  });
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{ open: boolean; report: any; editing?: boolean; form?: any } | null>(null);

  // Fetch all reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const res = await fetch("/api/quarterly-reports");
      const data = await res.json();
      setReports(data);
      setLoading(false);
    };
    fetchReports();
  }, []);

  // Fetch workgroups for filter
  useEffect(() => {
    const fetchWorkgroups = async () => {
      const res = await fetch("/api/workgroups");
      const data = await res.json();
      setWorkgroups(data);
    };
    fetchWorkgroups();
  }, []);

  // Cargar miembros al seleccionar workgroup
  useEffect(() => {
    if (form.workgroup) {
      fetch(`/api/workgroups/${form.workgroup}/members`)
        .then(res => res.json())
        .then(data => setMembers(data));
    } else {
      setMembers([]);
    }
  }, [form.workgroup]);

  // Filtros
  const filteredReports = reports.filter((r: any) => {
    return (
      (!filters.workgroup || r.workGroup.id === filters.workgroup) &&
      (!filters.year || r.year === Number(filters.year)) &&
      (!filters.quarter || r.quarter === filters.quarter)
    );
  });

  // Verificar si el usuario es admin o super admin
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  // Obtener años únicos para el filtro
  const years = Array.from(new Set(reports.map((r: any) => r.year)));

  // Handler para campos del formulario
  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handler para participantes
  const handleParticipantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selected: string[] = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setForm(f => ({ ...f, participants: selected }));
  };

  // Handler para items de presupuesto
  const handleBudgetItemChange = (idx: number, field: "name" | "description" | "amountUsd", value: any) => {
    setForm(f => {
      const items = [...f.budgetItems];
      (items[idx][field] as any) = field === "amountUsd" ? Number(value) : value;
      return { ...f, budgetItems: items };
    });
  };

  const addBudgetItem = () => {
    setForm(f => ({ ...f, budgetItems: [...f.budgetItems, { name: "", description: "", amountUsd: 0 }] }));
  };
  const removeBudgetItem = (idx: number) => {
    setForm(f => ({ ...f, budgetItems: f.budgetItems.filter((_, i) => i !== idx) }));
  };

  // Enviar formulario
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(`/api/workgroups/${form.workgroup}/quarterly-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(form.year),
          quarter: form.quarter,
          detail: form.detail,
          theoryOfChange: form.theoryOfChange,
          challenges: form.challenges.map((c: string) => ({ text: c, completed: false })),
          plans: form.plans,
          participants: form.participants,
          budgetItems: form.budgetItems.filter(item => item.name && item.amountUsd > 0),
        })
      });
      if (res.ok) {
        setOpen(false);
        setForm({
          workgroup: "",
          year: new Date().getFullYear(),
          quarter: "Q1",
          detail: "",
          theoryOfChange: "",
          challenges: [],
          participation: "",
          plans: "",
          participants: [],
          budgetItems: [{ name: "", description: "", amountUsd: 0 }],
        });
        // Refetch reports
        const reportsRes = await fetch("/api/quarterly-reports");
        setReports(await reportsRes.json());
        setSuccessMessage("Report created successfully!");
      } else {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch {}
        if (res.status === 403) {
          setError("Only group members can create quarterly reports. Please join or wait to be accepted.");
        } else {
          setError((errorData as any).message || (errorData as any).error || "Unknown error creating report");
        }
        console.error("Error creating report:", errorData);
      }
    } catch (err) {
      setError("Network error creating report");
    }
    setSubmitting(false);
  };

  const router = useRouter();

  // Handler para editar reporte
  const handleEditReport = () => {
    if (!detailModal) return;
    let challenges = detailModal.report?.challenges;
    if (Array.isArray(challenges)) {
      // Si es array de strings, transformar
      if (challenges.length === 0 || typeof challenges[0] === 'string') {
        challenges = challenges.map((c: any) => ({ text: c, completed: false }));
      } else {
        // Si es array de objetos, asegurar que text sea string
        challenges = challenges.map((c: any) => ({
          text: typeof c.text === 'string' 
            ? c.text 
            : typeof c.text === 'object' 
              ? JSON.stringify(c.text) 
              : String(c.text),
          completed: !!c.completed
        }));
      }
    } else if (typeof challenges === 'string') {
      challenges = [{ text: challenges, completed: false }];
    } else if (!challenges) {
      challenges = [];
    }
    setDetailModal({
      ...detailModal,
      editing: true,
      form: {
        detail: detailModal.report?.detail || "",
        theoryOfChange: detailModal.report?.theoryOfChange || "",
        challenges: challenges,
        plans: detailModal.report?.plans || "",
        year: detailModal.report?.year || "",
        quarter: detailModal.report?.quarter || "Q1",
        budgetItems: detailModal.report?.budgetItems?.map((item: any) => ({ ...item })) || [],
        participants: detailModal.report?.participants?.map((p: any) => p.user?.id) || [],
      }
    });
  };

  const handleEditFormChange = (e: any) => {
    if (!detailModal) return;
    const { name, value } = e.target;
    setDetailModal({
      ...detailModal,
      form: { ...detailModal.form, [name]: value }
    });
  };

  const handleEditBudgetItemChange = (idx: number, field: string, value: any) => {
    if (!detailModal) return;
    const items = [...detailModal.form.budgetItems];
    items[idx][field] = field === "amountUsd" ? Number(value) : value;
    setDetailModal({
      ...detailModal,
      form: { ...detailModal.form, budgetItems: items }
    });
  };

  const handleAddBudgetItemEdit = () => {
    if (!detailModal) return;
    setDetailModal({
      ...detailModal,
      form: {
        ...detailModal.form,
        budgetItems: [...detailModal.form.budgetItems, { name: "", description: "", amountUsd: 0 }]
      }
    });
  };
  const handleRemoveBudgetItemEdit = (idx: number) => {
    if (!detailModal) return;
    setDetailModal({
      ...detailModal,
      form: {
        ...detailModal.form,
        budgetItems: detailModal.form.budgetItems.filter((_: any, i: number) => i !== idx)
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!detailModal) return;
    const reportId = detailModal.report.id;
    const res = await fetch(`/api/quarterly-reports/${reportId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...detailModal.form,
        year: Number(detailModal.form.year),
        budgetItems: detailModal.form.budgetItems.filter((item: any) => item.name && item.amountUsd > 0),
        participants: detailModal.form.participants,
      })
    });
    if (res.ok) {
      // Refrescar lista de reportes
      const reportsRes = await fetch("/api/quarterly-reports");
      setReports(await reportsRes.json());
      setDetailModal(m => m ? { ...m, editing: false } : null);
    } else {
      alert("Error updating report");
    }
  };

  const handleCancelEdit = () => {
    setDetailModal(m => m ? { ...m, editing: false } : null);
  };

  return (
    <div className="w-full space-y-6 -m-6 p-6 -mx-6">
      {/* DEBUG: Mostrar userId de la sesión y workGroupId seleccionado */}
      <div className="text-xs text-slate-400 mb-2">
        Your userId: <span className="font-mono">{session?.user?.id}</span> | Selected workGroupId: <span className="font-mono">{form.workgroup}</span>
      </div>
      
      {/* Header con título y estadísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold text-white tracking-wide flex items-center gap-3">
            <FileTextIcon className="w-8 h-8 text-purple-400" />
            Quarterly Reports
          </h1>
          
          {/* Estadísticas elegantes */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-medium">Active</span>
              <span className="text-green-300 font-bold">{filteredReports.filter((r: any) => r.status === 'IN_CONSENSUS' || r.status === 'DRAFT').length}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-500/10 border border-slate-500/20 rounded-full">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <span className="text-slate-400 font-medium">Expired</span>
              <span className="text-slate-300 font-bold">{filteredReports.filter((r: any) => r.status === 'EXPIRED').length}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 border border-green-600/20 rounded-full">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-green-500 font-medium">Approved</span>
              <span className="text-green-400 font-bold">{filteredReports.filter((r: any) => r.status === 'CONSENSED').length}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-400 font-medium">Total</span>
              <span className="text-blue-300 font-bold">{filteredReports.length}</span>
            </div>
          </div>
        </div>

        <button onClick={() => setOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded shadow transition-all flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Create Report
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-xs mb-1">Workgroup</label>
          <select
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100"
            value={filters.workgroup}
            onChange={e => setFilters(f => ({ ...f, workgroup: e.target.value }))}
          >
            <option value="">All workgroups</option>
            {workgroups.map((wg: any) => (
              <option key={wg.id} value={wg.id}>{wg.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Year</label>
          <select
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100"
            value={filters.year}
            onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
          >
            <option value="">All years</option>
            {years.map((year: number) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Quarter</label>
          <select
            className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100"
            value={filters.quarter}
            onChange={e => setFilters(f => ({ ...f, quarter: e.target.value }))}
          >
            <option value="">All quarters</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
        </div>
      </div>
      {loading ? (
        <LoadingSkeleton type="page" />
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <FileTextIcon className="w-16 h-16 text-slate-700 mb-4" />
          <p className="text-slate-400 text-lg">No quarterly reports found for the selected filters.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg shadow border border-slate-700 bg-slate-800">
          <table className="w-full bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <BuildingIcon className="w-3 h-3" />
                    <span>Workgroup</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Year</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Quarter</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" />
                    <span>Participants</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <CurrencyIcon className="w-3 h-3" />
                    <span>Budget (USD)</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>Created At</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredReports.map((r: any) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-700/40 cursor-pointer transition-colors"
                  onClick={() => {
                    let challenges = r.challenges;
                    console.log('Original challenges:', challenges, typeof challenges, Array.isArray(challenges));
                    if (Array.isArray(challenges)) {
                      // Si es array de strings, transformar
                      if (challenges.length === 0 || typeof challenges[0] === 'string') {
                        challenges = challenges.map((c: any) => ({ text: c, completed: false }));
                        console.log('Transformed string array to objects:', challenges);
                      } else {
                        // Si es array de objetos, asegurar que text sea string
                        challenges = challenges.map((c: any) => ({
                          text: typeof c.text === 'string' 
                            ? c.text 
                            : typeof c.text === 'object' 
                              ? JSON.stringify(c.text) 
                              : String(c.text),
                          completed: !!c.completed
                        }));
                        console.log('Transformed object array with proper text:', challenges);
                      }
                    } else if (typeof challenges === 'string') {
                      challenges = [{ text: challenges, completed: false }];
                      console.log('Transformed string to object:', challenges);
                    } else if (!challenges) {
                      challenges = [];
                      console.log('Set empty array for null/undefined challenges');
                    }
                    console.log('Final challenges for modal:', challenges);
                    setDetailModal({ open: true, report: { ...r, challenges } });
                  }}
                >
                  <td className="px-4 py-3 font-medium text-slate-100">{r.workGroup?.name}</td>
                  <td className="px-4 py-3">{r.year}</td>
                  <td className="px-4 py-3">{r.quarter}</td>
                  <td className="px-4 py-3">{r.participants.length}</td>
                  <td className="px-4 py-3">{r.budgetItems.reduce((sum: number, item: any) => sum + item.amountUsd, 0)}</td>
                  <td className="px-4 py-3">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm({ ...form, workgroup: "", year: new Date().getFullYear(), quarter: "Q1", detail: "", theoryOfChange: "", challenges: [], participation: "", plans: "", participants: [], budgetItems: [{ name: "", description: "", amountUsd: 0 }] }); setError(null); setSuccessMessage(null); } }}>
        <DialogContent className="bg-slate-900 w-full max-w-3xl mx-auto rounded-lg shadow-lg p-0 border border-slate-700 flex flex-col max-h-screen animate-fade-in">
          {/* Header fijo */}
          <div className="flex items-center justify-between border-b border-slate-700 px-8 py-4 sticky top-0 bg-slate-900 z-10">
            <div>
              <DialogTitle asChild>
                <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
                  <FileTextIcon className="w-7 h-7 text-purple-400" /> New Quarterly Report
                </h2>
              </DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">Fill in the fields to create a new quarterly report.</DialogDescription>
            </div>
            <button onClick={() => setOpen(false)} className="text-2xl text-slate-400 hover:text-purple-400 font-bold focus:outline-none">×</button>
          </div>
          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <form id="quarterly-report-form" ref={formRef} onSubmit={handleSubmit} className="space-y-5 pb-2">
              <div>
                <label className="block text-slate-300 mb-1">Workgroup</label>
                <select name="workgroup" value={form.workgroup} onChange={handleFormChange} required className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500">
                  <option value="">Select a workgroup</option>
                  {workgroups.map((wg: any) => (
                    <option key={wg.id} value={wg.id}>{wg.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1">Year</label>
                  <input name="year" type="number" value={form.year} onChange={handleFormChange} required min={2000} max={2100} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border" placeholder="e.g. 2025" />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Quarter</label>
                  <select name="quarter" value={form.quarter} onChange={handleFormChange} required className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border">
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Detail</label>
                <textarea name="detail" value={form.detail} onChange={handleFormChange} required rows={2} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border" placeholder="Brief summary of the quarter" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Theory of Change / Objective</label>
                <textarea name="theoryOfChange" value={form.theoryOfChange} onChange={handleFormChange} required rows={2} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border" placeholder="What changes and impact are expected?" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Challenges and Learnings</label>
                <div className="space-y-2">
                  {form.challenges.map((challenge, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={challenge}
                        onChange={(e) => {
                          const newChallenges = [...form.challenges];
                          newChallenges[index] = e.target.value;
                          setForm(f => ({ ...f, challenges: newChallenges }));
                        }}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border"
                        placeholder="e.g., Increased user engagement"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newChallenges = form.challenges.filter((_: Challenge, i: number) => i !== index);
                          setForm(f => ({ ...f, challenges: newChallenges }));
                        }}
                        className="bg-red-700 text-white rounded px-2 py-1 flex items-center"
                        title="Remove challenge"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, challenges: [...f.challenges, ""] }))}
                  className="bg-slate-700 text-white rounded px-2 py-1 flex items-center mt-2"
                  title="Add challenge"
                >
                  <PlusIcon className="w-4 h-4 mr-1" /> Add Challenge
                </button>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Plans for Next Quarter</label>
                <textarea name="plans" value={form.plans} onChange={handleFormChange} required rows={2} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border" placeholder="What do you plan to achieve?" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Participants</label>
                <select name="participants" multiple value={form.participants} onChange={handleParticipantsChange} required size={Math.min(6, members.length)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border">
                  {members.map((m: any) => (
                    <option key={m.id} value={m.user?.id}>
                      {m.user?.name} ({m.user?.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Budget</label>
                <div className="space-y-2">
                  {form.budgetItems.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input placeholder="Name" value={item.name} onChange={e => handleBudgetItemChange(idx, "name", e.target.value)} required className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border" />
                      <input placeholder="Description" value={item.description} onChange={e => handleBudgetItemChange(idx, "description", e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border" />
                      <input placeholder="Amount (USD)" type="number" value={item.amountUsd} onChange={e => handleBudgetItemChange(idx, "amountUsd", e.target.value)} min={0} required className="w-32 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border" />
                      {form.budgetItems.length > 1 && (
                        <button type="button" onClick={() => removeBudgetItem(idx)} className="bg-red-700 text-white rounded px-2 py-1 ml-1 flex items-center" title="Remove item"><MinusIcon className="w-4 h-4" /></button>
                      )}
                      {idx === form.budgetItems.length - 1 && (
                        <button type="button" onClick={addBudgetItem} className="bg-slate-700 text-white rounded px-2 py-1 ml-1 flex items-center" title="Add item"><PlusIcon className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-right text-purple-300 font-semibold mt-2">
                  Total: {form.budgetItems.reduce((sum, item) => sum + Number(item.amountUsd || 0), 0)} USD
                </div>
              </div>
              {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
              {successMessage && <div className="text-green-400 text-sm mt-2">{successMessage}</div>}
              <button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-8 rounded shadow transition-all w-full md:w-auto mt-6 mx-auto block"
              >
                {submitting ? "Creating..." : "Create Report"}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal para ver toda la información del reporte */}
      {detailModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] relative border border-purple-700 flex flex-col">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 text-2xl font-bold z-10"
              onClick={() => setDetailModal(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-2xl font-bold text-purple-300">Quarterly Report Details</h3>
            </div>
            {/* Si está en modo edición, mostrar formulario editable */}
            {detailModal.editing ? (
              <form className="flex-1 overflow-y-auto p-6 space-y-4" onSubmit={e => { e.preventDefault(); handleSaveEdit(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                  <div>
                    <label className="font-semibold text-purple-200">Year:</label>
                    <input name="year" type="number" value={detailModal.form.year} onChange={handleEditFormChange} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100" />
                  </div>
                  <div>
                    <label className="font-semibold text-purple-200">Quarter:</label>
                    <select name="quarter" value={detailModal.form.quarter} onChange={handleEditFormChange} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100">
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-purple-200">Detail:</label>
                    <textarea name="detail" value={detailModal.form.detail} onChange={handleEditFormChange} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-purple-200">Theory of Change / Objective:</label>
                    <textarea name="theoryOfChange" value={detailModal.form.theoryOfChange} onChange={handleEditFormChange} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-purple-200">Challenges and Learnings:</label>
                    <div className="space-y-2">
                      {detailModal.form.challenges.map((challenge: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={typeof challenge.text === 'string' 
                              ? challenge.text 
                              : typeof challenge.text === 'object' 
                                ? JSON.stringify(challenge.text) 
                                : String(challenge.text)}
                            onChange={(e) => {
                              const newChallenges = [...detailModal.form.challenges];
                              newChallenges[index] = { ...newChallenges[index], text: e.target.value };
                              setDetailModal({ ...detailModal, form: { ...detailModal.form, challenges: newChallenges } });
                            }}
                            className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
                            placeholder="e.g., Increased user engagement"
                          />
                          <input
                            type="checkbox"
                            checked={challenge.completed}
                            onChange={(e) => {
                              const newChallenges = [...detailModal.form.challenges];
                              newChallenges[index] = { ...newChallenges[index], completed: e.target.checked };
                              setDetailModal({ ...detailModal, form: { ...detailModal.form, challenges: newChallenges } });
                            }}
                            className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newChallenges = detailModal.form.challenges.filter((_: ChallengeEdit, i: number) => i !== index);
                              setDetailModal({ ...detailModal, form: { ...detailModal.form, challenges: newChallenges } });
                            }}
                            className="bg-red-700 text-white rounded px-2 py-1 flex items-center"
                            title="Remove challenge"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-purple-200">Plans for Next Quarter:</label>
                    <textarea name="plans" value={detailModal.form.plans} onChange={handleEditFormChange} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-semibold text-purple-200">Budget Items:</label>
                    <div className="space-y-2">
                      {detailModal.form.budgetItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input placeholder="Name" value={item.name} onChange={e => handleEditBudgetItemChange(idx, "name", e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100" />
                          <input placeholder="Description" value={item.description} onChange={e => handleEditBudgetItemChange(idx, "description", e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100" />
                          <input placeholder="Amount (USD)" type="number" value={item.amountUsd} onChange={e => handleEditBudgetItemChange(idx, "amountUsd", e.target.value)} min={0} className="w-32 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100" />
                          {detailModal.form.budgetItems.length > 1 && (
                            <button type="button" onClick={() => handleRemoveBudgetItemEdit(idx)} className="bg-red-700 text-white rounded px-2 py-1 ml-1 flex items-center" title="Remove item"><MinusIcon className="w-4 h-4" /></button>
                          )}
                          {idx === detailModal.form.budgetItems.length - 1 && (
                            <button type="button" onClick={handleAddBudgetItemEdit} className="bg-slate-700 text-white rounded px-2 py-1 ml-1 flex items-center" title="Add item"><PlusIcon className="w-4 h-4" /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-purple-200">Participants:</label>
                    <select name="participants" multiple value={detailModal.form.participants} onChange={handleEditFormChange} size={Math.min(6, members.length)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 focus:ring-2 focus:ring-purple-500 box-border">
                      {members.map((m: any) => (
                        <option key={m.id} value={m.user?.id}>
                          {m.user?.name} ({m.user?.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6 pt-4 border-t border-slate-700">
                  <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors">Save changes</button>
                  <button type="button" className="bg-slate-700 hover:bg-slate-800 text-slate-200 font-semibold px-4 py-2 rounded-lg shadow transition-colors" onClick={handleCancelEdit}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                  <div className="flex items-center gap-2"><BuildingIcon className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-200">Workgroup:</span> {detailModal.report?.workGroup?.name}</div>
                  <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-200">Year:</span> {detailModal.report?.year}</div>
                  <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-200">Quarter:</span> {detailModal.report?.quarter}</div>
                  <div className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-200">Created at:</span> {detailModal.report?.createdAt ? new Date(detailModal.report?.createdAt).toLocaleString() : "-"}</div>
                  <div className="md:col-span-2"><span className="font-semibold text-purple-200">Detail:</span>
                    <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700 whitespace-pre-line">{detailModal.report?.detail}</div>
                  </div>
                  <div className="md:col-span-2"><span className="font-semibold text-purple-200">Theory of Change / Objective:</span>
                    <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700 whitespace-pre-line">{detailModal.report?.theoryOfChange}</div>
                  </div>
                  <div className="md:col-span-2"><span className="font-semibold text-purple-200">Challenges and Learnings:</span>
                    <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700 whitespace-pre-line">
                      {(() => {
                        const challenges = detailModal.report?.challenges;
                        console.log('Challenges debug:', challenges, typeof challenges, Array.isArray(challenges));
                        
                        if (Array.isArray(challenges)) {
                          return challenges.map((challenge: any, index: number) => {
                            console.log('Challenge item:', challenge, typeof challenge);
                            if (typeof challenge === 'string') {
                              return <div key={index}>{challenge}</div>;
                            } else if (challenge && typeof challenge === 'object' && 'text' in challenge) {
                              // Si challenge.text es un objeto, extraer el texto
                              const textValue = typeof challenge.text === 'string' 
                                ? challenge.text 
                                : typeof challenge.text === 'object' 
                                  ? JSON.stringify(challenge.text) 
                                  : String(challenge.text);
                              return (
                                <div key={index} className="flex items-center gap-2 mb-1">
                                  <input type="checkbox" checked={!!challenge.completed} disabled className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-slate-600" />
                                  <span className={challenge.completed ? 'line-through text-slate-500' : ''}>{textValue}</span>
                                </div>
                              );
                            } else {
                              console.log('Invalid challenge item:', challenge);
                              return <div key={index} className="text-red-400">Invalid challenge format</div>;
                            }
                          });
                        } else if (challenges) {
                          console.log('Non-array challenges:', challenges);
                          return <div>{typeof challenges === 'object' ? JSON.stringify(challenges) : String(challenges)}</div>;
                        } else {
                          return <div className="text-slate-500 italic">No challenges</div>;
                        }
                      })()}
                    </div>
                  </div>
                  <div className="md:col-span-2"><span className="font-semibold text-purple-200">Plans for Next Quarter:</span>
                    <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700 whitespace-pre-line">{detailModal.report?.plans}</div>
                  </div>
                  <div className="flex items-center gap-2"><UsersIcon className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-200">Participants:</span> {detailModal.report?.participants?.length}</div>
                  <div className="flex items-center gap-2"><CurrencyIcon className="w-4 h-4 text-purple-400" /><span className="font-semibold text-purple-200">Budget (USD):</span> {detailModal.report?.budgetItems?.reduce((sum: number, item: any) => sum + item.amountUsd, 0)}</div>
                  <div className="md:col-span-2"><span className="font-semibold text-purple-200">Budget Items:</span>
                    <ul className="list-disc ml-6 mt-1">
                      {detailModal.report?.budgetItems?.map((item: any, idx: number) => (
                        <li key={idx} className="mb-1">
                          <span className="font-semibold">{item.name}</span>: {item.description} <span className="text-purple-300">(${item.amountUsd})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Botón Edit solo si el usuario es el creador */}
                {session?.user?.id && detailModal.report?.createdById === session.user.id && (
                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <button
                      className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
                      onClick={handleEditReport}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 