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

const tabs = [
  { key: 'general', label: 'General', icon: '📌' },
  { key: 'actividad', label: 'Actividad & Reportes', icon: '📅' },
  { key: 'presupuesto', label: 'Presupuesto & Recursos', icon: '💰' },
  { key: 'conexiones', label: 'Conexiones & Gobernanza', icon: '🔗' },
  { key: 'futuro', label: 'Futuro & Roadmap', icon: '🧭' },
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

  useEffect(() => {
    if ((localWG as any).id) {
      setLoadingRequests(true);
      fetch(`/api/workgroups/${(localWG as any).id}/join-request`)
        .then(res => res.json())
        .then(data => setJoinRequests(data))
        .finally(() => setLoadingRequests(false));
    }
  }, [localWG]);

  const handleAcceptRequest = async (requestId: string, userId: string) => {
    setAcceptingId(requestId);
    // Lógica para aceptar: agregar como miembro y actualizar estado de la solicitud
    await fetch(`/api/workgroups/${(localWG as any).id}/add-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    // (Opcional: actualizar estado de la solicitud a 'accepted' en backend si existe endpoint)
    setJoinRequests(reqs => reqs.filter(r => r.id !== requestId));
    setAcceptingId(null);
  };

  // Aquí puedes condicionar la visibilidad del botón según el usuario/rol/estado
  const canRequestJoin = true; // Cambia esto en el futuro según lógica de membresía

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
    setJoinSuccess(false);
    // TODO: Reemplaza por el userId real del usuario autenticado
    const userId = "mock-user-id";
    const res = await fetch(`/api/workgroups/${(localWG as any).id || ""}/join-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: joinMessage, userId }),
    });
    if (res.ok) {
      setJoinSuccess(true);
      setTimeout(() => {
        setJoinOpen(false);
        setJoinSuccess(false);
        setJoinMessage("");
      }, 1500);
    } else {
      alert("Error al enviar la solicitud");
    }
  };

  return (
    <div className="w-full">
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
        {/* Botón Editar pequeño y dentro del panel de detalles */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {canRequestJoin && (
            <button
              className="px-2 py-1 bg-slate-700 hover:bg-purple-800 text-purple-200 hover:text-white rounded-md text-xs font-semibold shadow transition-colors"
              onClick={() => setJoinOpen(true)}
            >
              Solicitar unirse
            </button>
          )}
          <button
            className="px-2 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-md text-xs font-semibold shadow transition-colors"
            onClick={handleEdit}
          >
            Editar
          </button>
        </div>
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
          {activeTab === 'actividad' && (
            <div className="mb-4 flex flex-col items-center justify-center min-h-[120px] text-slate-400 text-center">
              <span className="text-2xl mb-2">📅</span>
              <p className="text-lg font-semibold mb-1">Actividad & Reportes</p>
              <p>Aquí se mostrarán los reportes y la actividad del WorkGroup próximamente.</p>
            </div>
          )}
          {activeTab === 'presupuesto' && (
            <div className="mb-4 flex flex-col items-center justify-center min-h-[120px] text-slate-400 text-center">
              <span className="text-2xl mb-2">💰</span>
              <p className="text-lg font-semibold mb-1">Presupuesto & Recursos</p>
              <p>Aquí se mostrará la información de presupuesto y recursos del WorkGroup próximamente.</p>
            </div>
          )}
          {activeTab === 'conexiones' && (
            <div className="mb-4 flex flex-col items-center justify-center min-h-[120px] text-slate-400 text-center">
              <span className="text-2xl mb-2">🔗</span>
              <p className="text-lg font-semibold mb-1">Conexiones & Gobernanza</p>
              <p>Aquí se mostrarán las conexiones y la gobernanza del WorkGroup próximamente.</p>
            </div>
          )}
          {activeTab === 'futuro' && (
            <div className="mb-4 flex flex-col items-center justify-center min-h-[120px] text-slate-400 text-center">
              <span className="text-2xl mb-2">🧭</span>
              <p className="text-lg font-semibold mb-1">Futuro & Roadmap</p>
              <p>Aquí se mostrarán los planes futuros y el roadmap del WorkGroup próximamente.</p>
            </div>
          )}
        </>
        )}
        {/* Sección de solicitudes de ingreso */}
        {joinRequests.length > 0 && (
          <div className="mb-6 border border-purple-900 rounded-xl bg-slate-800 p-4">
            <h4 className="text-lg font-bold text-purple-300 mb-2 flex items-center gap-2">Solicitudes de ingreso pendientes</h4>
            {loadingRequests ? (
              <div className="text-slate-400">Cargando...</div>
            ) : (
              <ul className="space-y-2">
                {joinRequests.map(req => (
                  <li key={req.id} className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-2">
                    <div>
                      <span className="font-semibold text-purple-200">{req.user?.name}</span>
                      <span className="ml-2 text-slate-400 text-xs">{req.user?.email}</span>
                      {req.message && <span className="ml-4 text-slate-300 italic">"{req.message}"</span>}
                    </div>
                    <button
                      className="bg-green-700 hover:bg-green-800 text-white px-3 py-1 rounded shadow text-xs font-semibold disabled:opacity-60"
                      disabled={acceptingId === req.id}
                      onClick={() => handleAcceptRequest(req.id, req.userId)}
                    >
                      {acceptingId === req.id ? "Aceptando..." : "Aceptar"}
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
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-purple-300 mb-2">Solicitar unirse a este WorkGroup</h3>
            <label className="text-slate-300 text-sm font-semibold">Mensaje opcional
              <textarea
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="joinMessage"
                value={joinMessage}
                onChange={e => setJoinMessage(e.target.value)}
                rows={3}
                placeholder="¿Por qué quieres unirte? (opcional)"
              />
            </label>
            <button
              type="submit"
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
              disabled={joinSuccess}
            >
              {joinSuccess ? "Solicitud enviada!" : "Enviar solicitud"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WorkGroupDetails; 