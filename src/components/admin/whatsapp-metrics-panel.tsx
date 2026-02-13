"use client";

import { useState } from "react";

import type { WhatsAppMetrics } from "@/types/whatsapp-analytics";

interface WhatsAppMetricsPanelProps {
  initialMetrics: WhatsAppMetrics;
  enabled: boolean;
}

export function WhatsAppMetricsPanel({ initialMetrics, enabled }: WhatsAppMetricsPanelProps) {
  const [metrics, setMetrics] = useState<WhatsAppMetrics>(initialMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const maxDailyCount = Math.max(...metrics.dailySeries.map((item) => item.count), 1);

  async function refreshMetrics() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/analytics/whatsapp");
      const payload = (await response.json()) as { metrics?: WhatsAppMetrics; error?: string };
      if (!response.ok || !payload.metrics) {
        throw new Error(payload.error ?? "No se pudieron cargar las metricas.");
      }
      setMetrics(payload.metrics);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Error cargando metricas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Analytics
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-slate-950">
            Clics hacia WhatsApp
          </h2>
        </div>
        <button
          type="button"
          onClick={refreshMetrics}
          disabled={!enabled || loading}
          className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{metrics.totalClicks}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ultimas 24h</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {metrics.last24HoursClicks}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ultimos 7 dias</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {metrics.last7DaysClicks}
          </p>
        </article>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 p-4 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-900">Tendencia diaria (ultimos 14 dias)</p>
          {metrics.dailySeries.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Sin datos todavia.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[560px]">
                <div
                  className="grid h-44 items-end gap-2"
                  style={{ gridTemplateColumns: `repeat(${metrics.dailySeries.length}, minmax(0, 1fr))` }}
                >
                  {metrics.dailySeries.map((item) => {
                    const heightPercent = Math.max(6, Math.round((item.count / maxDailyCount) * 100));
                    return (
                      <div key={item.date} className="flex h-full flex-col items-center justify-end gap-2">
                        <div className="text-[11px] font-semibold text-slate-600">{item.count}</div>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400"
                          style={{ height: `${heightPercent}%` }}
                          title={`${item.label}: ${item.count} clics`}
                        />
                        <div className="text-[10px] font-medium text-slate-500">{item.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">Por origen</p>
          <div className="mt-3 grid gap-2">
            {metrics.bySource.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos todavia.</p>
            ) : (
              metrics.bySource.map((item) => (
                <div
                  key={item.source}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <p className="text-sm font-medium text-slate-700">{item.source}</p>
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">Top productos consultados</p>
          <div className="mt-3 grid gap-2">
            {metrics.topProducts.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos todavia.</p>
            ) : (
              metrics.topProducts.map((item) => (
                <div
                  key={item.productName}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <p className="text-sm font-medium text-slate-700">{item.productName}</p>
                  <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
