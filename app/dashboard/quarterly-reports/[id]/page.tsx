"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function QuarterlyReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/quarterly-reports/${id}`)
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="p-8 text-slate-400">Cargando reporte...</div>;
  }
  if (!report) {
    return <div className="p-8 text-red-400">Reporte no encontrado.</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button className="mb-4 text-purple-400 hover:underline" onClick={() => router.back()}>&larr; Volver</button>
      <h1 className="text-3xl font-bold mb-2">Quarterly Report</h1>
      <div className="mb-4 text-slate-400">{report.workGroup?.name} | {report.year} {report.quarter}</div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Detalle</h2>
        <p className="text-slate-200 whitespace-pre-line">{report.detail}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Teoría de cambio / Objetivo</h2>
        <p className="text-slate-200 whitespace-pre-line">{report.theoryOfChange}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Desafíos y aprendizajes</h2>
        <p className="text-slate-200 whitespace-pre-line">{report.challenges}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Participación</h2>
        <p className="text-slate-200 whitespace-pre-line">{report.participation}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Planes para el próximo trimestre</h2>
        <p className="text-slate-200 whitespace-pre-line">{report.plans}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Participantes</h2>
        <ul className="list-disc ml-6 text-slate-200">
          {report.participants.map((p: any) => (
            <li key={p.user.id}>{p.user.name}</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Presupuesto</h2>
        <table className="min-w-full bg-slate-800 border border-slate-700 rounded mb-2">
          <thead>
            <tr className="text-slate-300">
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Monto (USD)</th>
            </tr>
          </thead>
          <tbody>
            {report.budgetItems.map((item: any, idx: number) => (
              <tr key={idx} className="border-t border-slate-700">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">{item.description}</td>
                <td className="px-3 py-2">{item.amountUsd}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right text-slate-300 font-semibold">
          Total: {report.budgetItems.reduce((sum: number, item: any) => sum + item.amountUsd, 0)} USD
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Comentarios</h2>
        {report.comments.length === 0 ? (
          <p className="text-slate-400">Aún no hay comentarios.</p>
        ) : (
          <ul className="space-y-2">
            {report.comments.map((c: any) => (
              <li key={c.id} className="bg-slate-700 rounded p-2">
                <div className="text-slate-200 font-semibold">{c.user.name}</div>
                <div className="text-slate-300 whitespace-pre-line">{c.content}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(c.updatedAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="text-xs text-slate-500 mt-8">
        Creado: {new Date(report.createdAt).toLocaleString()}<br />
        Última edición: {new Date(report.updatedAt).toLocaleString()}
      </div>
    </div>
  );
} 