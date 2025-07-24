import React from "react";
import { Collaboration } from "../../lib/types";

interface Props {
  collaborations: Collaboration[];
  toolsUsed: string[];
  relatedProposals: string[];
}

const ConnectionsDependencies: React.FC<Props> = ({ collaborations, toolsUsed, relatedProposals }) => (
  <section className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">🔗 Conexiones y Dependencias</h3>
    <div>
      <span className="font-semibold text-slate-700">Colaboraciones:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {collaborations.map((c, i) => (
          <li key={i} className="mb-1">
            <span className="font-medium">{c.groupName}</span> — {c.collaborationType} (<span className="text-purple-600">{c.contact}</span>)
          </li>
        ))}
      </ul>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Herramientas utilizadas:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {toolsUsed.map((tool, i) => (
          <li key={i}>{tool}</li>
        ))}
      </ul>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Propuestas relacionadas:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {relatedProposals.map((proposal, i) => (
          <li key={i}>
            <a href={proposal} className="text-purple-600 hover:underline text-sm">Ver propuesta relacionada →</a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ConnectionsDependencies; 