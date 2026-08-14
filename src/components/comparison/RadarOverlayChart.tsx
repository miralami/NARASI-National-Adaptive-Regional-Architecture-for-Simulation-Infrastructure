/**
 * NARASI - Overlaid multi-scenario radar chart (Comparison view).
 */

import type { SimulationResult } from '../../types/simulation';
import { TradeoffRadarChart, type RadarSeries } from '../dashboard/TradeoffRadarChart';

export interface RadarScenarioInput {
  id: string;
  name: string;
  result: SimulationResult;
  color: string;
}

export function RadarOverlayChart({ scenarios }: { scenarios: RadarScenarioInput[] }) {
  const series: RadarSeries[] = scenarios.map((s, i) => ({
    id: s.id,
    name: s.name,
    scores: s.result.radarScores,
    color: s.color,
    dashed: s.id === 'baseline' || i === 0,
    fillOpacity: s.id === 'baseline' ? 0.06 : 0.18,
  }));

  return <TradeoffRadarChart series={series} />;
}
