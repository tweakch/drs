'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { TeamAnalysis } from '@/lib/analytics/types';

// R10 pace-vs-consistency scatter · R11 best-vs-median bars.
const AXIS = '#8a909c';
const GRID = '#2b2f38';

export function PaceConsistency({ data }: { data: TeamAnalysis[] }) {
  const scatterRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const sCtx = scatterRef.current;
    const bCtx = barRef.current;
    if (!sCtx || !bCtx) return;

    const scatter = new Chart(sCtx, {
      type: 'scatter',
      data: {
        datasets: data.map((d) => ({
          label: d.name,
          data: [{ x: d.median, y: d.std }],
          backgroundColor: d.color,
          pointRadius: 5,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Median lap (s)', color: AXIS },
            ticks: { color: AXIS },
            grid: { color: GRID },
          },
          y: {
            title: { display: true, text: 'σ (s)', color: AXIS },
            ticks: { color: AXIS },
            grid: { color: GRID },
          },
        },
        plugins: { legend: { display: false } },
      },
    });

    const bar = new Chart(bCtx, {
      type: 'bar',
      data: {
        labels: data.map((d) => d.name),
        datasets: [
          { label: 'Best', data: data.map((d) => d.best), backgroundColor: '#3ea7ff' },
          { label: 'Median', data: data.map((d) => d.median), backgroundColor: '#ff5a3c' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: AXIS, maxRotation: 90, minRotation: 60, font: { size: 9 } },
            grid: { color: GRID },
          },
          y: {
            title: { display: true, text: 'Lap time (s)', color: AXIS },
            ticks: { color: AXIS },
            grid: { color: GRID },
            beginAtZero: false,
          },
        },
        plugins: { legend: { labels: { color: '#f4f4f1', boxWidth: 10, font: { size: 10 } } } },
      },
    });

    return () => {
      scatter.destroy();
      bar.destroy();
    };
  }, [data]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-line bg-asphalt-2 p-4">
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          03 · Pace vs consistency
        </h3>
        <div className="h-[300px]">
          <canvas ref={scatterRef} />
        </div>
        <p className="mt-2 text-[11px] text-dim">Lower-left is ideal — fast and consistent.</p>
      </div>
      <div className="rounded-lg border border-line bg-asphalt-2 p-4">
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          Best vs median
        </h3>
        <div className="h-[300px]">
          <canvas ref={barRef} />
        </div>
        <p className="mt-2 text-[11px] text-dim">
          The gap is untapped pace — consistency headroom.
        </p>
      </div>
    </div>
  );
}
