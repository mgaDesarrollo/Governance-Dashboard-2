import React from "react";
import { OngoingDecision } from "../../lib/types";

interface Props {
  ongoingDecisions: OngoingDecision[];
  voteNowLink: string;
  consensusArchiveLink: string;
  participationMetrics: string;
}

const statusColors: Record<string, string> = {
  Consent: "bg-green-100 text-green-800",
  Object: "bg-red-100 text-red-800",
  Abstain: "bg-yellow-100 text-yellow-800",
};

const ConsentGovernance: React.FC<Props> = ({
  ongoingDecisions,
  voteNowLink,
  consensusArchiveLink,
  participationMetrics,
}) => (
  <section className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">✅ Consentimiento y Gobernanza</h3>
    <div>
      <span className="font-semibold text-slate-700">Decisiones en curso:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {ongoingDecisions.map((d, i) => (
          <li key={i} className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-medium">{d.title}</span>
            <span className="text-xs text-slate-500">(Límite: {d.dueDate})</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[d.status] || 'bg-gray-200 text-gray-700'}`}>{d.status}</span>
          </li>
        ))}
      </ul>
      <a
        href={voteNowLink}
        className="inline-flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-md font-medium hover:bg-purple-700 transition-colors text-sm mt-3"
      >
        Votar ahora →
      </a>
    </div>
    <div>
      <a
        href={consensusArchiveLink}
        className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline hover:text-purple-800 transition-colors text-sm mt-2"
      >
        Ver archivo de consensos →
      </a>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Métricas de participación:</span>
      <span className="ml-2 text-slate-600">{participationMetrics}</span>
    </div>
  </section>
);

export default ConsentGovernance; 