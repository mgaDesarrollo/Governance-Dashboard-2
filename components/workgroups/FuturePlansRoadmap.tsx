import React from "react";

interface Props {
  nextSteps: string[];
  milestoneTimelineLink?: string;
  openCalls: string[];
  nextCycleProposalIdeas?: string[];
}

const FuturePlansRoadmap: React.FC<Props> = ({ nextSteps, milestoneTimelineLink, openCalls, nextCycleProposalIdeas }) => (
  <section className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">🧭 Planes Futuros y Roadmap</h3>
    <div>
      <span className="font-semibold text-slate-700">Próximos pasos:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {nextSteps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ul>
    </div>
    {milestoneTimelineLink && (
      <div>
        <a
          href={milestoneTimelineLink}
          className="inline-flex items-center gap-1 text-purple-600 font-medium hover:underline hover:text-purple-800 transition-colors text-sm"
        >
          Ver roadmap visual →
        </a>
      </div>
    )}
    <div>
      <span className="font-semibold text-slate-700">Convocatorias abiertas:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {openCalls.map((call, i) => (
          <li key={i}>{call}</li>
        ))}
      </ul>
    </div>
    {nextCycleProposalIdeas && nextCycleProposalIdeas.length > 0 && (
      <div>
        <span className="font-semibold text-slate-700">Ideas para el próximo ciclo:</span>
        <ul className="mt-1 ml-4 list-disc text-slate-700">
          {nextCycleProposalIdeas.map((idea, i) => (
            <li key={i} className="flex items-center gap-2">
              <span>{idea}</span>
              <button className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors">Upvote</button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
);

export default FuturePlansRoadmap; 