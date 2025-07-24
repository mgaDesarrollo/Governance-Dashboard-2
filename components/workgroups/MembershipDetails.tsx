import React from "react";

interface Props {
  totalMembers: string;
  roles: string[];
  memberDirectoryLink: string;
}

const MembershipDetails: React.FC<Props> = ({ totalMembers, roles, memberDirectoryLink }) => (
  <section className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">👥 Membresía y Roles</h3>
    <div>
      <span className="font-semibold text-slate-700">Miembros:</span>
      <span className="ml-2 text-slate-600">{totalMembers}</span>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Roles:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {roles.map((role, i) => (
          <li key={i}>{role}</li>
        ))}
      </ul>
    </div>
    <div>
      <a
        href={memberDirectoryLink}
        className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline hover:text-purple-800 transition-colors text-sm mt-2"
      >
        Ver directorio de miembros <span aria-hidden>→</span>
      </a>
    </div>
  </section>
);

export default MembershipDetails; 