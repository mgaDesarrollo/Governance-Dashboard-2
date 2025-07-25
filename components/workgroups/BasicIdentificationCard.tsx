import React from 'react';
import { AnchorContact } from '../../lib/types';

interface Props {
  name: string;
  type: string;
  dateOfCreation: string;
  status: string;
  anchorContacts?: AnchorContact[];
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-700 text-green-200 border-green-400',
  Inactive: 'bg-gray-700 text-gray-200 border-gray-400',
  Pending: 'bg-yellow-700 text-yellow-200 border-yellow-400',
};

export const BasicIdentificationCard: React.FC<Props> = ({
  name,
  type,
  dateOfCreation,
  status,
  anchorContacts,
}) => (
  <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-purple-700 p-8 mb-6 flex flex-col gap-6">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-2xl font-bold flex items-center gap-3 text-purple-200 drop-shadow">
        <span className="text-3xl">📌</span>
        {name}
      </h2>
      <span className={`px-4 py-1 rounded-full text-xs font-bold border ${statusColors[status] || 'bg-gray-700 text-gray-200 border-gray-400'}`}>{status}</span>
    </div>
    <div className="flex flex-wrap gap-8 text-base text-slate-200 mb-2">
      <div><span className="font-semibold text-purple-200">Type:</span> {type}</div>
      <div><span className="font-semibold text-purple-200">Created:</span> {dateOfCreation}</div>
    </div>
    <div>
      <span className="font-semibold text-purple-200">Anchor Contacts:</span>
      {Array.isArray(anchorContacts) && anchorContacts.length > 0 ? (
        <ul className="mt-2 ml-4 list-disc text-slate-100 text-base space-y-1">
          {anchorContacts.map((c, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span className="font-medium text-purple-100">{c.name}</span>
              <span className="text-xs text-slate-400">({c.role})</span>
              <span className="text-blue-400">{c.handle}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="ml-2 text-slate-500 text-sm">No anchor contacts registered.</span>
      )}
    </div>
  </section>
);

export default BasicIdentificationCard; 