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
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Pending: 'bg-yellow-100 text-yellow-800',
};

export const BasicIdentificationCard: React.FC<Props> = ({
  name,
  type,
  dateOfCreation,
  status,
  anchorContacts,
}) => (
  <section className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold flex items-center gap-2">📌 {name}</h2>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-200 text-gray-700'}`}>{status}</span>
    </div>
    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
      <div><span className="font-semibold">Tipo:</span> {type}</div>
      <div><span className="font-semibold">Creado:</span> {dateOfCreation}</div>
    </div>
    <div>
      <span className="font-semibold">Contactos ancla:</span>
      {Array.isArray(anchorContacts) && anchorContacts.length > 0 ? (
        <ul className="mt-1 ml-2 list-disc text-gray-700">
          {anchorContacts.map((c, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs text-gray-500">({c.role})</span>
              <span className="text-blue-600">{c.handle}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="ml-2 text-gray-400 text-sm">No hay contactos registrados.</span>
      )}
    </div>
  </section>
);

export default BasicIdentificationCard; 