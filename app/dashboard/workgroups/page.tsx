"use client";
import React, { useState, useEffect } from "react";
import WorkGroupsList from "@/components/workgroups/WorkGroupsList";
import WorkGroupDetails from "@/components/workgroups/WorkGroupDetails";
import type { WorkGroup } from "@/lib/types";

// Tipo extendido para aceptar 'members'
type WorkGroupWithMembers = WorkGroup & { members?: any[] };

export default function WorkGroupsPage() {
  const [workGroups, setWorkGroups] = useState<WorkGroupWithMembers[] | undefined>(undefined);
  const [selected, setSelected] = useState<WorkGroupWithMembers | null>(null);

  useEffect(() => {
    fetch("/api/workgroups")
      .then(res => res.json())
      .then(data => setWorkGroups(data));
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-50 p-6">
      {!selected && (
        <>
          <h1 className="text-3xl font-bold mb-6 text-purple-400">Workgroups and Guilds</h1>
          <p className="mb-8 text-slate-400 max-w-2xl">
            Control panel for workgroups and guilds. Explore active groups, their status and access their details.
          </p>
        </>
      )}
      {!selected && (
        <div className="w-full max-w-7xl mx-auto">
          <WorkGroupsList workGroups={workGroups} onSelect={setSelected} />
        </div>
      )}
      {selected && (
        <div className="w-full flex flex-col items-center justify-start">
          <div className="w-full max-w-4xl mx-auto mt-8 mb-8 p-0 relative">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 text-2xl font-bold z-10"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="bg-slate-900 rounded-2xl shadow-2xl p-0">
              <WorkGroupDetails workGroup={selected as any} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 