/**
 * NARASI - Multi-objective trade-off radar chart (Recharts).
 * IMPLEMENTATION_MASTERPLAN §11: 5 normalized dimensions (0-100).
 */

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import type { RadarScores } from '../../types/simulation';

export interface RadarSeries {
  id: string;
  name: string;
  scores: RadarScores;
  color: string;
  dashed?: boolean;
  fillOpacity?: number;
}

const AXIS_LABELS: [keyof RadarScores, string][] = [
  ['mobility', 'Mobility'],
  ['adoption', 'Transit Adoption'],
  ['environment', 'Cleanliness'],
  ['economy', 'Financial Eff.'],
  ['access', 'Population Access'],
];

export function TradeoffRadarChart({ series }: { series: RadarSeries[] }) {
  const data = AXIS_LABELS.map(([key, label]) => {
    const row: Record<string, string | number> = { axis: label };
    for (const s of series) row[s.id] = Math.round(s.scores[key]);
    return row;
  });

  return (
    <div className="flex h-full min-h-64 w-full flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis
            domain={[0, 100]}
            tickCount={4}
            tick={{ fill: '#475569', fontSize: 9 }}
            axisLine={false}
          />
          {series.map((s) => (
            <Radar
              key={s.id}
              name={s.name}
              dataKey={s.id}
              stroke={s.color}
              fill={s.color}
              fillOpacity={s.fillOpacity ?? 0.18}
              strokeDasharray={s.dashed ? '6 4' : undefined}
              strokeWidth={1.8}
              isAnimationActive={true}
              animationDuration={350}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {series.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span
              className="inline-block h-1.5 w-3 rounded-full"
              style={{
                background: s.dashed ? 'repeating-linear-gradient(90deg, ' + s.color + ' 0 4px, transparent 4px 7px)' : s.color,
              }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
