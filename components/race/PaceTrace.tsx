'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { TeamAnalysis } from '@/lib/analytics/types';

// R8 pace-trace line chart · R9 legend toggle (Chart.js interactive legend + all/none).
const AXIS = '#8a909c';
const GRID = '#2b2f38';

export function PaceTrace({ data }: { data: TeamAnalysis[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;
    const datasets = data.map((d) => {
      // Drop the grid-crossing lap 0 so the x-axis starts at racing lap 1.
      const laps = d.hasGridLap ? d.laps.slice(1) : d.laps;
      return {
        label: d.name,
        data: laps.map((t, i) => ({ x: i + 1, y: t })),
        borderColor: d.color,
        backgroundColor: d.color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.2,
      };
    });
    const chart = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', intersect: false },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Lap', color: AXIS },
            ticks: { color: AXIS },
            grid: { color: GRID },
          },
          y: {
            title: { display: true, text: 'Lap time (s)', color: AXIS },
            ticks: { color: AXIS },
            grid: { color: GRID },
          },
        },
        plugins: { legend: { labels: { color: '#f4f4f1', boxWidth: 10, font: { size: 10 } } } },
      },
    });
    chartRef.current = chart;
    return () => chart.destroy();
  }, [data]);

  const setAll = (visible: boolean) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.data.datasets.forEach((_, i) => chart.setDatasetVisibility(i, visible));
    chart.update();
  };

  return (
    <div className="rounded-lg border border-line bg-asphalt-2 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          02 · Pace trace
        </h3>
        <div className="flex gap-2 text-[11px]">
          <button
            onClick={() => setAll(true)}
            className="rounded border border-line px-2 py-0.5 text-muted hover:text-paint"
          >
            all
          </button>
          <button
            onClick={() => setAll(false)}
            className="rounded border border-line px-2 py-0.5 text-muted hover:text-paint"
          >
            none
          </button>
        </div>
      </div>
      <div className="h-[320px]">
        <canvas ref={canvasRef} />
      </div>
      <p className="mt-2 text-[11px] text-dim">Click a team in the legend to toggle its line.</p>
    </div>
  );
}
