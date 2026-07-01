'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { positionsByLap } from '@/lib/analytics/positions';
import type { TeamAnalysis } from '@/lib/analytics/types';

// Position changes during the race — the order evolving lap by lap (FastF1 style).
const AXIS = '#8a909c';
const GRID = '#2b2f38';

export function PositionChart({ data }: { data: TeamAnalysis[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;
    const series = positionsByLap(data);
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: series.map((s) => ({
          label: s.name,
          data: s.points.map((p) => ({ x: p.lap, y: p.pos })),
          borderColor: s.color,
          backgroundColor: s.color,
          borderWidth: 1.5,
          pointRadius: 0,
          stepped: true,
        })),
      },
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
            reverse: true,
            min: 1,
            title: { display: true, text: 'Position', color: AXIS },
            ticks: { color: AXIS, stepSize: 1 },
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
          05 · Position changes
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
      <div className="h-[340px]">
        <canvas ref={canvasRef} />
      </div>
      <p className="mt-2 text-[11px] text-dim">
        Running order by cumulative time — a line dropping means places lost, climbing means places
        gained. Fast teams stay near the top; lapped teams fall away at the tail.
      </p>
    </div>
  );
}
