import React from "react";

interface Props {
  missionStatement: string;
  goalsAndFocus: string[];
}

const MissionScopeCard: React.FC<Props> = ({ missionStatement, goalsAndFocus }) => (
  <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-purple-700 p-8 mb-6 flex flex-col gap-6">
    <h3 className="text-2xl font-bold flex items-center gap-3 text-purple-300 mb-2 drop-shadow">
      <span className="text-3xl">🧭</span>
      Mission & Scope
    </h3>
    <div className="mb-3">
      <span className="font-semibold text-purple-200 text-lg">Mission:</span>
      <p className="mt-1 text-slate-200 whitespace-pre-line text-base leading-relaxed bg-slate-800 rounded-lg px-4 py-2 border border-slate-700 shadow-inner">
        {missionStatement}
      </p>
    </div>
    <div>
      <span className="font-semibold text-purple-200 text-lg">Focus Areas:</span>
      <ul className="mt-2 ml-6 list-disc text-slate-100 text-base space-y-1">
        {goalsAndFocus.map((goal, i) => (
          <li key={i} className="pl-1">{goal}</li>
        ))}
      </ul>
    </div>
  </section>
);

export default MissionScopeCard; 