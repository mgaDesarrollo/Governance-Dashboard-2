"use client";
import React, { useState, useEffect } from "react";
import { WorkGroup } from '../../lib/types';
import BasicIdentificationCard from './BasicIdentificationCard';
import MissionScopeCard from './MissionScopeCard';
import MembershipDetails from './MembershipDetails';
import ContributionsDeliverables from './ContributionsDeliverables';
import ActivityLogMeetings from './ActivityLogMeetings';
import ReportingEvaluation from './ReportingEvaluation';
import BudgetResources from './BudgetResources';
import ConnectionsDependencies from './ConnectionsDependencies';
import ConsentGovernance from './ConsentGovernance';
import FuturePlansRoadmap from './FuturePlansRoadmap';
import { useSession } from "next-auth/react";
import { BuildingIcon, CalendarIcon, ClockIcon, UsersIcon, CurrencyIcon } from "lucide-react";

const tabs = [
  { key: 'general', label: 'General', icon: '📌' },
  { key: 'activity', label: 'Activity & Reports', icon: '📅' },
  { key: 'budget', label: 'Budget & Resources', icon: '💰' },
  { key: 'links', label: 'Links & Governance', icon: '🔗' },
  { key: 'future', label: 'Future & Roadmap', icon: '🧭' },
];

interface Props {
  workGroup: WorkGroup;
}

const statusOptions = ['Active', 'Inactive', 'Pending'];
const typeOptions = ['Governance', 'Community', 'Research', 'Education', 'Regional', 'Documentation', 'Project', 'Data'];

const WorkGroupDetails: React.FC<Props> = ({ workGroup }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [editOpen, setEditOpen] = useState(false);
  const [localWG, setLocalWG] = useState(workGroup);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState("");
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    report: any;
  }>({ open: false, report: null });
  const { data: session } = useSession();

  useEffect(() => {
    if ((localWG as any).id) {
      setLoadingRequests(true);
      fetch(`/api/workgroups/${(localWG as any).id}/join-request`)
        .then(res => res.json())
        .then(data => setJoinRequests(data))
        .finally(() => setLoadingRequests(false));
     
      // Cargar reportes del workgroup
      setLoadingReports(true);
      fetch(`/api/workgroups/${(localWG as any).id}/quarterly-reports`)
        .then(res => res.json())
        .then(data => setReports(data))
        .catch(err => {
          console.error('Error loading reports:', err);
          setReports([]);
        })
        .finally(() => setLoadingReports(false));
    }
  }, [localWG]);

  const handleAcceptRequest = async (requestId: string, userId: string) => {
    setAcceptingId(requestId);
    // Logic to accept: add as member and update request status
    await fetch(`/api/workgroups/${(localWG as any).id}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    // Refresh pending requests from backend
    fetch(`/api/workgroups/${(localWG as any).id}/join-request`)
      .then(res => res.json())
      .then(data => setJoinRequests(data));
    setAcceptingId(null);
  };

  // Here you can condition the button visibility based on user/role/status
  const canRequestJoin = true; // Change this in the future based on membership logic

  // Form state for editing
  const [form, setForm] = useState({
    name: localWG.name,
    type: localWG.type,
    dateOfCreation: localWG.dateOfCreation,
    status: localWG.status,
    missionStatement: localWG.missionStatement,
    goalsAndFocus: localWG.goalsAndFocus.join(', '),
  });

  const handleEdit = () => setEditOpen(true);
  const handleClose = () => setEditOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess(false);
    try {
      const res = await fetch(`/api/workgroups/${(localWG as any).id || ""}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          dateOfCreation: form.dateOfCreation,
          status: form.status,
          missionStatement: form.missionStatement,
          goalsAndFocus: form.goalsAndFocus.split(',').map(g => g.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalWG(updated);
        setEditSuccess(true);
        setTimeout(() => {
          setEditOpen(false);
          setEditSuccess(false);
        }, 1200);
      } else {
        const data = await res.json();
        setEditError(data.error || "Error al guardar cambios");
      }
    } catch (err) {
      setEditError("Error de red o del servidor");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = session?.user?.id;
    if (!userId) {
      alert("You must be logged in to request to join.");
      return;
    }
    try {
      const res = await fetch(`/api/workgroups/${(localWG as any).id}/join-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: joinMessage }),
      });
      if (res.ok) {
        setJoinSuccess(true);
        setTimeout(() => {
          setJoinOpen(false);
          setJoinSuccess(false);
          setJoinMessage("");
        }, 1500);
      } else {
        alert("Error sending request");
      }
    } catch (error) {
      alert("Error sending request");
    }
  };

  const handleViewReportDetail = (report: any) => {
    setDetailModal({ open: true, report });
  };

  return (
    <div className="w-full">
      {/* DEBUG: Mostrar userId de la sesión */}
      <div className="text-xs text-slate-400 mb-2">Your userId: <span className="font-mono">{session?.user?.id}</span></div>
      <div className="flex flex-wrap gap-1 mb-4 justify-center">
        <div className="flex gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl px-4 py-2 shadow-lg">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-lg font-semibold text-base flex items-center gap-2 transition-all duration-200 focus:outline-none
                ${activeTab === tab.key
                  ? 'bg-purple-700 text-white shadow-lg scale-105 border border-purple-400'
                  : 'bg-slate-800 text-purple-200 hover:bg-purple-800 hover:text-white border border-transparent'}`}
              style={{ minWidth: 0 }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="truncate max-w-[120px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-[#161b22] rounded-2xl shadow-2xl p-4 md:p-8 max-w-4xl mx-auto min-h-[350px] flex flex-col gap-6 relative">
        {/* MODO EDICIÓN EN PÁGINA */}
        {editOpen ? (
          <form
            className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-8 border border-purple-700 flex flex-col gap-4"
            onSubmit={handleSave}
          >
            <h3 className="text-xl font-bold text-purple-300 mb-2">Edit WorkGroup</h3>
            {editError && <div className="text-red-400 text-sm">{editError}</div>}
            {editSuccess && <div className="text-green-400 text-sm">Saved successfully!</div>}
            <label className="text-slate-300 text-sm font-semibold">Name
              <input
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="text-slate-300 text-sm font-semibold">Type
              <select
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label className="text-slate-300 text-sm font-semibold">Creation date
              <input
                type="date"
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="dateOfCreation"
                value={form.dateOfCreation}
                onChange={handleChange}
                required
              />
            </label>
            <label className="text-slate-300 text-sm font-semibold">Status
              <select
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label className="text-slate-300 text-sm font-semibold">Mission
              <textarea
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="missionStatement"
                value={form.missionStatement}
                onChange={handleChange}
                rows={3}
                required
              />
            </label>
            <label className="text-slate-300 text-sm font-semibold">Focus areas (comma separated)
              <input
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="goalsAndFocus"
                value={form.goalsAndFocus}
                onChange={handleChange}
                required
              />
            </label>
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
              >
                Save changes
              </button>
              <button
                type="button"
                className="bg-slate-700 hover:bg-slate-800 text-slate-200 font-semibold px-4 py-2 rounded-lg shadow transition-colors"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
        // Vista normal
        <>
        {activeTab === 'general' && (
          <>
            {/* Botón Editar pequeño y dentro del panel de detalles */}
            {/* Small Edit button inside the details panel */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              {canRequestJoin && (
                <button
                  className="px-2 py-1 bg-slate-700 hover:bg-purple-800 text-purple-200 hover:text-white rounded-md text-xs font-semibold shadow transition-colors"
                  onClick={() => setJoinOpen(true)}
                >
                  Request to join
                </button>
              )}
              <button
                className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-xs font-semibold shadow transition-colors"
                onClick={handleEdit}
              >
                Edit
              </button>
            </div>
            <div className="mb-4">
              <BasicIdentificationCard
                name={localWG.name}
                type={localWG.type}
                dateOfCreation={localWG.dateOfCreation}
                status={localWG.status}
                anchorContacts={localWG.anchorContacts}
              />
            </div>
            <div className="mb-4 border-t border-slate-700 pt-4">
              <MissionScopeCard
                missionStatement={localWG.missionStatement}
                goalsAndFocus={localWG.goalsAndFocus}
              />
            </div>
            <div className="border-t border-slate-700 pt-4">
              <MembershipDetails
                totalMembers={localWG.totalMembers}
                roles={localWG.roles}
                memberDirectoryLink={localWG.memberDirectoryLink}
                workGroupId={(localWG as any).id}
              />
            </div>
          </>
        )}
        {activeTab === 'activity' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                Quarterly Reports
              </h3>
              <button
                onClick={() => window.open('/dashboard/quarterly-reports', '_blank')}
                className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-3 py-1 rounded text-sm transition-colors"
              >
                View all
              </button>
            </div>
            
            {loadingReports ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading reports...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="text-4xl mb-4 block">📊</span>
                <p className="text-lg font-semibold mb-2">No reports yet</p>
                <p className="text-sm">This workgroup has no quarterly reports yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow border border-slate-700 bg-slate-800">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">📅</span>
                          <span>Year/Quarter</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">👥</span>
                          <span>Participants</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">💰</span>
                          <span>Budget</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">📅</span>
                          <span>Created</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {reports.map((report: any) => (
                      <tr key={report.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-100">
                            {report.year} {report.quarter}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {report.participants?.length || 0}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          ${report.budgetItems?.reduce((sum: number, item: any) => sum + (item.amountUsd || 0), 0) || 0}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewReportDetail(report)}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                          >
                            View detail
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
        {activeTab === 'budget' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Budget & Resources
              </h3>
              <div className="text-sm text-slate-400">
                Total: ${reports.reduce((sum, report) => 
                  sum + (report.budgetItems?.reduce((itemSum: number, item: any) => itemSum + (item.amountUsd || 0), 0) || 0), 0
                ).toLocaleString()}
              </div>
            </div>
            
            {loadingReports ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-slate-400">Loading budget items...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <span className="text-4xl mb-4 block">💰</span>
                <p className="text-lg font-semibold mb-2">No budget items yet</p>
                <p className="text-sm">This workgroup has no quarterly reports with budget items.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg shadow border border-slate-700 bg-slate-800">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">📅</span>
                          <span>Report Period</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">🏷️</span>
                          <span>Item Name</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">📝</span>
                          <span>Description</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">💰</span>
                          <span>Amount (USD)</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">📊</span>
                          <span>% of Total</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {(() => {
                      // Calcular el total para los porcentajes
                      const totalBudget = reports.reduce((sum, report) => 
                        sum + (report.budgetItems?.reduce((itemSum: number, item: any) => itemSum + (item.amountUsd || 0), 0) || 0), 0
                      );
                      
                      // Crear lista plana de todos los items de presupuesto
                      const allBudgetItems = reports.flatMap(report => 
                        (report.budgetItems || []).map((item: any) => ({
                          ...item,
                          reportPeriod: `${report.year} ${report.quarter}`,
                          reportId: report.id
                        }))
                      );
                      
                      // Ordenar por monto (más alto primero)
                      return allBudgetItems
                        .sort((a, b) => (b.amountUsd || 0) - (a.amountUsd || 0))
                        .map((item, index) => (
                          <tr key={`${item.reportId}-${index}`} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-100">
                                {item.reportPeriod}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-slate-100">
                                {item.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              <div className="max-w-xs truncate" title={item.description}>
                                {item.description}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              <span className="font-semibold text-purple-300">
                                ${(item.amountUsd || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              <span className="text-sm">
                                {totalBudget > 0 ? ((item.amountUsd || 0) / totalBudget * 100).toFixed(1) : 0}%
                              </span>
                            </td>
                          </tr>
                        ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Estadísticas adicionales */}
            {reports.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-400 mb-1">Total Budget</div>
                  <div className="text-2xl font-bold text-purple-300">
                    ${reports.reduce((sum, report) => 
                      sum + (report.budgetItems?.reduce((itemSum: number, item: any) => itemSum + (item.amountUsd || 0), 0) || 0), 0
                    ).toLocaleString()}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-400 mb-1">Total Items</div>
                  <div className="text-2xl font-bold text-purple-300">
                    {reports.reduce((sum, report) => sum + (report.budgetItems?.length || 0), 0)}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-sm text-slate-400 mb-1">Average per Item</div>
                  <div className="text-2xl font-bold text-purple-300">
                    ${(() => {
                      const totalBudget = reports.reduce((sum, report) => 
                        sum + (report.budgetItems?.reduce((itemSum: number, item: any) => itemSum + (item.amountUsd || 0), 0) || 0), 0
                      );
                      const totalItems = reports.reduce((sum, report) => sum + (report.budgetItems?.length || 0), 0);
                      return totalItems > 0 ? (totalBudget / totalItems).toFixed(0) : 0;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'links' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-300 flex items-center gap-2">
                <span className="text-2xl">🔗</span>
                Links & Governance
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enlaces de Comunicación */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  Communication Channels
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400">💬</span>
                      <span className="font-medium text-slate-200">Slack Channel</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">📧</span>
                      <span className="font-medium text-slate-200">Email List</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Subscribe →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400">📱</span>
                      <span className="font-medium text-slate-200">Discord Server</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join →
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Enlaces de Documentación */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  Documentation & Resources
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600">📖</span>
                      <span className="font-medium text-slate-200">Wiki</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600">📋</span>
                      <span className="font-medium text-slate-200">Notion Workspace</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Access →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400">📊</span>
                      <span className="font-medium text-slate-200">Google Drive</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open →
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Enlaces de Desarrollo */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  Development & Tools
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">🐙</span>
                      <span className="font-medium text-slate-200">GitHub Repository</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-500">📋</span>
                      <span className="font-medium text-slate-200">Jira Board</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-green-500">📈</span>
                      <span className="font-medium text-slate-200">Analytics Dashboard</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View →
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Enlaces Externos */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <span className="text-xl">🌐</span>
                  External Links
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-600">🌍</span>
                      <span className="font-medium text-slate-200">Official Website</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400">🐦</span>
                      <span className="font-medium text-slate-200">Twitter</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Follow →
                    </a>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-800">💼</span>
                      <span className="font-medium text-slate-200">LinkedIn</span>
                    </div>
                    <a 
                      href="#" 
                      className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Connect →
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sección de Gobernanza */}
            <div className="mt-8">
              <h4 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                Governance Structure
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h5 className="text-lg font-semibold text-purple-200 mb-3">Decision Making Process</h5>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Consensus-based decisions for major changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Weekly meetings for operational decisions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Monthly reviews for strategic planning</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h5 className="text-lg font-semibold text-purple-200 mb-3">Roles & Responsibilities</h5>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Facilitator: Coordinates meetings and processes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Secretary: Documents decisions and actions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>Treasurer: Manages budget and finances</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'future' && (
          <div className="mb-4 flex flex-col items-center justify-center min-h-[120px] text-slate-400 text-center">
            <span className="text-2xl mb-2">🧭</span>
            <p className="text-lg font-semibold mb-1">Future & Roadmap</p>
            <p>Future plans and roadmap for this WorkGroup will be displayed here soon.</p>
          </div>
        )}
        </>
        )}
        {/* Sección de solicitudes de ingreso */}
        {joinRequests.length > 0 && (
          <div className="mb-6 border border-purple-900 rounded-xl bg-slate-800 p-4">
            <h4 className="text-lg font-bold text-purple-300 mb-2 flex items-center gap-2">Pending join requests</h4>
            {loadingRequests ? (
              <div className="text-slate-400">Loading...</div>
            ) : (
              <ul className="space-y-2">
                {joinRequests.map(req => (
                  <li key={req.id} className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-2">
                    <div>
                      <span className="font-semibold text-purple-200">{req.user?.name}</span>
                      <span className="ml-2 text-slate-400 text-xs">{req.user?.email}</span>
                      <span className="ml-2 text-slate-500 text-xs">userId: <span className="font-mono">{req.userId}</span></span>
                      {req.message && <span className="ml-4 text-slate-300 italic">"{req.message}"</span>}
      </div>
            <button
                      className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded shadow text-xs font-semibold disabled:opacity-60"
                      disabled={acceptingId === req.id}
                      onClick={() => handleAcceptRequest(req.id, req.userId)}
                    >
                      {acceptingId === req.id ? "Accepting..." : "Accept"}
            </button>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
      </div>
      {joinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <form
            className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 relative border border-purple-700 flex flex-col gap-4"
            onSubmit={handleJoin}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 text-2xl font-bold"
              type="button"
              onClick={() => setJoinOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-purple-300 mb-2">Request to join this WorkGroup</h3>
            <label className="text-slate-300 text-sm font-semibold">Optional message
              <textarea
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="joinMessage"
                value={joinMessage}
                onChange={e => setJoinMessage(e.target.value)}
                rows={3}
                placeholder="Why do you want to join? (optional)"
              />
            </label>
            <button
              type="submit"
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
              disabled={joinSuccess}
            >
              {joinSuccess ? "Request sent!" : "Send request"}
            </button>
          </form>
        </div>
      )}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] relative border border-purple-700 flex flex-col">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 text-2xl font-bold"
              type="button"
              onClick={() => setDetailModal({ open: false, report: null })}
              aria-label="Close"
            >
              ×
            </button>
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-2xl font-bold text-purple-300">Quarterly Report Details</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
                <div className="flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Workgroup:</span> 
                  <span className="text-slate-100">{detailModal.report?.workGroup?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Year:</span> 
                  <span className="text-slate-100">{detailModal.report?.year}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Quarter:</span> 
                  <span className="text-slate-100">{detailModal.report?.quarter}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Created at:</span> 
                  <span className="text-slate-100">{detailModal.report?.createdAt ? new Date(detailModal.report?.createdAt).toLocaleString() : "-"}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Detail:</span>
                  <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700 whitespace-pre-line text-slate-100">
                    {detailModal.report?.detail || "No detail provided"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Theory of Change / Objective:</span>
                  <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700 whitespace-pre-line text-slate-100">
                    {detailModal.report?.theoryOfChange || "No theory of change provided"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Challenges and Learnings:</span>
                  <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700">
                    {(() => {
                      const challenges = detailModal.report?.challenges;
                      if (Array.isArray(challenges)) {
                        return challenges.map((challenge: any, index: number) => {
                          if (typeof challenge === 'string') {
                            return <div key={index} className="text-slate-100">{challenge}</div>;
                          } else if (challenge && typeof challenge === 'object' && 'text' in challenge) {
                            const textValue = typeof challenge.text === 'string' 
                              ? challenge.text 
                              : typeof challenge.text === 'object' 
                                ? JSON.stringify(challenge.text) 
                                : String(challenge.text);
                            return (
                              <div key={index} className="flex items-center gap-2 mb-1">
                                <input type="checkbox" checked={!!challenge.completed} disabled className="w-4 h-4 text-purple-500 focus:ring-purple-500 border-slate-600" />
                                <span className={challenge.completed ? 'line-through text-slate-500' : 'text-slate-100'}>{textValue}</span>
                              </div>
                            );
                          } else {
                            return <div key={index} className="text-red-400">Invalid challenge format</div>;
                          }
                        });
                      } else if (challenges) {
                        return <div className="text-slate-100">{typeof challenges === 'object' ? JSON.stringify(challenges) : String(challenges)}</div>;
                      } else {
                        return <div className="text-slate-500 italic">No challenges</div>;
                      }
                    })()}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Plans for Next Quarter:</span>
                  <div className="bg-slate-800 rounded-lg px-4 py-2 mt-1 border border-slate-700 whitespace-pre-line text-slate-100">
                    {detailModal.report?.plans || "No plans provided"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Participants:</span> 
                  <span className="text-slate-100">{detailModal.report?.participants?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyIcon className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-purple-200">Budget (USD):</span> 
                  <span className="text-slate-100">{detailModal.report?.budgetItems?.reduce((sum: number, item: any) => sum + (item.amountUsd || 0), 0) || 0}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold text-purple-200">Budget Items:</span>
                  <ul className="list-disc ml-6 mt-1 text-slate-100">
                    {detailModal.report?.budgetItems?.map((item: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        <span className="font-semibold">{item.name}</span>: {item.description} <span className="text-purple-300">(${item.amountUsd})</span>
                      </li>
                    )) || <li className="text-slate-500 italic">No budget items</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkGroupDetails; 