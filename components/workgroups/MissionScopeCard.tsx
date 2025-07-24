import React from "react";

interface Props {
  missionStatement: string;
  goalsAndFocus: string[];
}

const MissionScopeCard: React.FC<Props> = ({ missionStatement, goalsAndFocus }) => (
  <section className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
    <h3 className="text-xl font-semibold flex items-center gap-2 text-purple-700">🧭 Misión y Alcance</h3>
    <div>
      <span className="font-semibold text-slate-700">Misión:</span>
      <p className="mt-1 text-slate-600 whitespace-pre-line">{missionStatement}</p>
    </div>
    <div>
      <span className="font-semibold text-slate-700">Áreas de enfoque:</span>
      <ul className="mt-1 ml-4 list-disc text-slate-700">
        {goalsAndFocus.map((goal, i) => (
          <li key={i}>{goal}</li>
        ))}
      </ul>
    </div>
  </section>
);

export default MissionScopeCard; 