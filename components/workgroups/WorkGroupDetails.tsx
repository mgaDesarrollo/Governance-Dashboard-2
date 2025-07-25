"use client";
import React, { useState } from "react";
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-purple-200 text-center w-full tracking-tight drop-shadow">{localWG.name}</h2>
        <div className="flex gap-2">
          {canRequestJoin && (
            <button
              className="px-3 py-1 bg-slate-700 hover:bg-purple-800 text-purple-200 hover:text-white rounded-lg text-sm font-semibold shadow transition-colors"
              onClick={() => setJoinOpen(true)}
            >
              Solicitar unirse
            </button>
          )}
          <button
            className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-semibold shadow transition-colors"
            onClick={handleEdit}
          >
            Editar
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-4 justify-center">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-2 py-1 rounded-t-lg font-semibold text-sm flex items-center gap-1 transition-colors border-b-2 focus:outline-none
              ${activeTab === tab.key
                ? 'bg-[#161b22] border-purple-500 text-purple-200 shadow'
                : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700 hover:text-purple-200'}`}
            style={{ minWidth: 0 }}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="truncate max-w-[110px]">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="bg-[#161b22] rounded-2xl shadow-2xl p-4 md:p-8 border border-slate-700 max-w-4xl mx-auto min-h-[350px] flex flex-col gap-6">
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
      </div>
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <form
            className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative border border-purple-700 flex flex-col gap-4"
            onSubmit={handleSave}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-purple-400 text-2xl font-bold"
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-purple-300 mb-2">Editar WorkGroup</h3>
            {editError && <div className="text-red-400 text-sm">{editError}</div>}
            {editSuccess && <div className="text-green-400 text-sm">¡Guardado exitoso!</div>}
            <label className="text-slate-300 text-sm font-semibold">Nombre
              <input
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className="text-slate-300 text-sm font-semibold">Tipo
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
            <label className="text-slate-300 text-sm font-semibold">Fecha de creación
              <input
                type="date"
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="dateOfCreation"
                value={form.dateOfCreation}
                onChange={handleChange}
                required
              />
            </label>
            <label className="text-slate-300 text-sm font-semibold">Estado
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
            <label className="text-slate-300 text-sm font-semibold">Misión
              <textarea
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="missionStatement"
                value={form.missionStatement}
                onChange={handleChange}
                rows={3}
                required
              />
            </label>
            <label className="text-slate-300 text-sm font-semibold">Áreas de enfoque (separadas por coma)
              <input
                className="mt-1 w-full rounded bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                name="goalsAndFocus"
                value={form.goalsAndFocus}
                onChange={handleChange}
                required
              />
            </label>
            <button
              type="submit"
              className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
            >
              Guardar cambios
            </button>
          </form>
        </div>
      )}
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