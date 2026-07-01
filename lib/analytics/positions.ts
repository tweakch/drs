// Running order lap-by-lap — the data behind the "position changes" chart (the
// FastF1 position-changes plot, adapted to endurance karts). Pure & testable.
//
// At each completed lap k, teams are ranked by the cumulative time it took them to
// reach lap k — least time = ahead. A team only appears at laps it actually ran, so
// slower teams naturally drop out of later laps (they're being lapped).

export interface PositionPoint {
  lap: number;
  pos: number;
}

export interface PositionSeries {
  name: string;
  color: string;
  points: PositionPoint[];
}

export function positionsByLap(
  teams: { name: string; color: string; laps: number[] }[],
): PositionSeries[] {
  // Cumulative elapsed time after each lap, per team.
  const cum = teams.map((t) => {
    let running = 0;
    return t.laps.map((x) => (running += x));
  });
  const maxLaps = Math.max(0, ...teams.map((t) => t.laps.length));
  const series: PositionSeries[] = teams.map((t) => ({ name: t.name, color: t.color, points: [] }));

  for (let k = 0; k < maxLaps; k++) {
    const ranked = teams
      .map((_, i) => ({ i, time: k < teams[i].laps.length ? cum[i][k] : null }))
      .filter((r): r is { i: number; time: number } => r.time !== null)
      .sort((a, b) => a.time - b.time);
    ranked.forEach((r, rank) => series[r.i].points.push({ lap: k + 1, pos: rank + 1 }));
  }
  return series;
}
