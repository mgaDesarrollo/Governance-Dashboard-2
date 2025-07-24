import React from "react";
import { PastBudget } from "../../lib/types";

interface Props {
  currentBudgetTier: string;
  currentBudget: string;
  utilizationSummary: string;
  fundingSources: string[];
  nextProposal: string;
  budgetProposalLink: string;
  pastBudgets: PastBudget[];
}

const BudgetResources: React.FC<Props> = ({
  currentBudgetTier,
  currentBudget,
  utilizationSummary,
  fundingSources,
  nextProposal,
  budgetProposalLink,
  pastBudgets,
}) => (
  <section className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">📌 Presupuesto y Recursos</h3>
    <div className="flex flex-wrap gap-6">
      <div>
        <span className="font-semibold text-slate-700">Nivel:</span>
        <span className="ml-2 text-slate-600">{currentBudgetTier}</span>
      </div>
      <div>
        <span className="font-semibold text-slate-700">Presupuesto actual:</span>
        <span className="ml-2 text-slate-600">{currentBudget}</span>
      </div>
      <div>
        <span className="font-semibold text-slate-700">Próxima propuesta:</span>
        <span className="ml-2 text-slate-600">{nextProposal}</span>
      </div>
      <a
        href={budgetProposalLink}
        className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline hover:text-purple-800 transition-colors text-sm"
      >
        Ver propuesta de presupuesto <span aria-hidden>→</span>
      </a>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Resumen de utilización:</span>
      <span className="ml-2 text-slate-600">{utilizationSummary}</span>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Fuentes de financiamiento:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {fundingSources.map((source, i) => (
          <li key={i}>{source}</li>
        ))}
      </ul>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Historial de presupuestos:</span>
      <ul className="mt-2 flex flex-col gap-2 ml-4">
        {pastBudgets.map((b, i) => (
          <li key={i} className="flex items-center gap-2 text-slate-700">
            <span className="font-medium">{b.title}:</span>
            <span>{b.amount}</span>
            <a
              href={b.link}
              className="text-purple-600 hover:underline text-sm ml-2"
            >
              Ver detalle →
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default BudgetResources; 