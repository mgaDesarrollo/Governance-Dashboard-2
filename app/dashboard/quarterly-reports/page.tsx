"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";
import { useRouter } from "next/navigation";

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
    challenges: string;
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
    challenges: "",
    participation: "",
    plans: "",
    participants: [],
    budgetItems: [{ name: "", description: "", amountUsd: 0 }],
  });
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
    try {
      const res = await fetch(`/api/workgroups/${form.workgroup}/quarterly-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(form.year),
          quarter: form.quarter,
          detail: form.detail,
          theoryOfChange: form.theoryOfChange,
          challenges: form.challenges,
          participation: form.participation,
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
          challenges: "",
          participation: "",
          plans: "",
          participants: [],
          budgetItems: [{ name: "", description: "", amountUsd: 0 }],
        });
        // Refetch reports
        const reportsRes = await fetch("/api/quarterly-reports");
        setReports(await reportsRes.json());
      } else {
        alert("Error al crear el reporte");
      }
    } catch (err) {
      alert("Error al crear el reporte");
    }
    setSubmitting(false);
  };

  const router = useRouter();

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs mb-1">Workgroup</label>
            <select
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100"
              value={filters.workgroup}
              onChange={e => setFilters(f => ({ ...f, workgroup: e.target.value }))}
            >
              <option value="">Todos</option>
              {workgroups.map((wg: any) => (
                <option key={wg.id} value={wg.id}>{wg.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Año</label>
            <select
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100"
              value={filters.year}
              onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
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
              <option value="">Todos</option>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </div>
        </div>
        {isAdmin && (
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setOpen(true)}>
            Add new report
          </Button>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-4">Quarterly Reports</h1>
      {loading ? (
        <p className="text-slate-400">Cargando reportes...</p>
      ) : filteredReports.length === 0 ? (
        <p className="text-slate-400">No hay reportes trimestrales para los filtros seleccionados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-slate-800 border border-slate-700 rounded">
            <thead>
              <tr className="text-slate-300">
                <th className="px-3 py-2">Workgroup</th>
                <th className="px-3 py-2">Año</th>
                <th className="px-3 py-2">Quarter</th>
                <th className="px-3 py-2">Detalle</th>
                <th className="px-3 py-2">Participantes</th>
                <th className="px-3 py-2">Presupuesto (USD)</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r: any) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-700 hover:bg-slate-700/30 cursor-pointer"
                  onClick={() => router.push(`/dashboard/quarterly-reports/${r.id}`)}
                >
                  <td className="px-3 py-2">{r.workGroup?.name}</td>
                  <td className="px-3 py-2">{r.year}</td>
                  <td className="px-3 py-2">{r.quarter}</td>
                  <td className="px-3 py-2">{r.detail?.slice(0, 40)}{r.detail?.length > 40 ? '...' : ''}</td>
                  <td className="px-3 py-2">{r.participants.map((p: any) => p.user.name).join(", ")}</td>
                  <td className="px-3 py-2">{r.budgetItems.reduce((sum: number, item: any) => sum + item.amountUsd, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Quarterly Report</DialogTitle>
          </DialogHeader>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1">Workgroup</label>
              <select
                name="workgroup"
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 w-full"
                value={form.workgroup}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecciona un workgroup</option>
                {workgroups.map((wg: any) => (
                  <option key={wg.id} value={wg.id}>{wg.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs mb-1">Año</label>
                <Input name="year" type="number" value={form.year} onChange={handleFormChange} required min={2000} max={2100} />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">Quarter</label>
                <select
                  name="quarter"
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 w-full"
                  value={form.quarter}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1">Detalle</label>
              <Textarea name="detail" value={form.detail} onChange={handleFormChange} required rows={2} />
            </div>
            <div>
              <label className="block text-xs mb-1">Teoría de cambio / Objetivo</label>
              <Textarea name="theoryOfChange" value={form.theoryOfChange} onChange={handleFormChange} required rows={2} />
            </div>
            <div>
              <label className="block text-xs mb-1">Desafíos y aprendizajes</label>
              <Textarea name="challenges" value={form.challenges} onChange={handleFormChange} required rows={2} />
            </div>
            <div>
              <label className="block text-xs mb-1">Participación</label>
              <Textarea name="participation" value={form.participation} onChange={handleFormChange} required rows={2} />
            </div>
            <div>
              <label className="block text-xs mb-1">Planes para el próximo trimestre</label>
              <Textarea name="plans" value={form.plans} onChange={handleFormChange} required rows={2} />
            </div>
            <div>
              <label className="block text-xs mb-1">Participantes</label>
              <select
                name="participants"
                multiple
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 w-full"
                value={form.participants}
                onChange={handleParticipantsChange}
                required
                size={Math.min(6, members.length)}
              >
                {members.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Presupuesto</label>
              {form.budgetItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <Input
                    placeholder="Nombre"
                    value={item.name}
                    onChange={e => handleBudgetItemChange(idx, "name", e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Input
                    placeholder="Descripción"
                    value={item.description}
                    onChange={e => handleBudgetItemChange(idx, "description", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Monto (USD)"
                    type="number"
                    value={item.amountUsd}
                    onChange={e => handleBudgetItemChange(idx, "amountUsd", e.target.value)}
                    className="w-32"
                    min={0}
                    required
                  />
                  {form.budgetItems.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeBudgetItem(idx)}>-</Button>
                  )}
                  {idx === form.budgetItems.length - 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={addBudgetItem}>+</Button>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={submitting}>
                {submitting ? "Creando..." : "Crear Reporte"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 