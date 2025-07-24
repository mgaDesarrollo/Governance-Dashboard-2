"use client";
import React, { useState, useEffect } from "react";
import WorkGroupsList from "@/components/workgroups/WorkGroupsList";
import WorkGroupDetails from "@/components/workgroups/WorkGroupDetails";
import type { WorkGroup } from "@/lib/types";

export default function WorkGroupsPage() {
  const [workGroups, setWorkGroups] = useState<WorkGroup[] | undefined>(undefined);
  const [selected, setSelected] = useState<WorkGroup | null>(null);

  useEffect(() => {
    fetch("/api/workgroups")
      .then(res => res.json())
      .then(data => setWorkGroups(data));
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">Grupos de trabajo y gremios</h1>
      <p className="mb-8 text-slate-400 max-w-2xl">
        Panel de control para grupos de trabajo y gremios. Explora los grupos activos, su estado y accede a sus detalles.
      </p>
      <div className="w-full max-w-7xl mx-auto">
        <WorkGroupsList workGroups={workGroups} onSelect={setSelected} />
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto p-6 relative border border-purple-700">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 text-2xl font-bold"
              onClick={() => setSelected(null)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <WorkGroupDetails workGroup={selected} />
          </div>
        </div>
      )}
    </main>
  );
} 