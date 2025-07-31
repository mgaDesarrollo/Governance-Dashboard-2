"use client";
import React, { useState, useEffect } from "react";
import WorkGroupDetails from "@/components/workgroups/WorkGroupDetails";
import type { WorkGroup } from "@/lib/types";
import { BuildingIcon, UsersIcon, CalendarIcon, CheckCircleIcon } from "lucide-react";

// Tipo extendido para aceptar 'members'
type WorkGroupWithMembers = WorkGroup & { members?: any[] };

export default function WorkGroupsPage() {
  const [workGroups, setWorkGroups] = useState<WorkGroupWithMembers[] | undefined>(undefined);
  const [selected, setSelected] = useState<WorkGroupWithMembers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/workgroups")
      .then(res => res.json())
      .then(data => {
        setWorkGroups(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      {!selected && (
        <>
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-3 text-white tracking-wide">
            <BuildingIcon className="w-8 h-8 text-purple-400" />
            Workgroups and Guilds
          </h1>
          <p className="mb-8 text-slate-400 max-w-2xl font-medium">
            Control panel for workgroups and guilds. Explore active groups, their status and access their details.
          </p>
        </>
      )}
      {!selected && (
        <div className="w-full">
          {loading ? (
            <p className="text-slate-400 text-center py-12">Loading workgroups...</p>
          ) : !workGroups || workGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <BuildingIcon className="w-16 h-16 text-slate-700 mb-4" />
              <p className="text-slate-400 text-lg">No workgroups found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-slate-700 bg-slate-800">
              <table className="min-w-full bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <BuildingIcon className="w-3 h-3" />
                        <span>Name</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <BuildingIcon className="w-3 h-3" />
                        <span>Type</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" />
                        <span>Members</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Created</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Status</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {workGroups.map((wg) => (
                    <tr
                      key={wg.id}
                      className="hover:bg-slate-700/40 cursor-pointer transition-colors"
                      onClick={() => setSelected(wg)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-100">{wg.name}</td>
                      <td className="px-4 py-3 text-slate-300">{wg.type}</td>
                      <td className="px-4 py-3 text-slate-300">{wg.totalMembers}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {wg.dateOfCreation ? new Date(wg.dateOfCreation).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          wg.status === 'Active' 
                            ? 'bg-green-700 text-green-100 border-green-500' 
                            : wg.status === 'Inactive' 
                              ? 'bg-gray-700 text-gray-300 border-gray-500' 
                              : 'bg-yellow-700 text-yellow-100 border-yellow-500'
                        }`}>
                          {wg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(wg);
                          }}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </div>
  );
} 