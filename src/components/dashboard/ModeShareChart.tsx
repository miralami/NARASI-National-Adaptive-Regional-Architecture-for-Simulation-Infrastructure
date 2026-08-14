/**
 * NARASI - Mode share chart (transit vs car vs motorcycle, stacked).
 */

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { SimulationResult } from '../../types/simulation';
import { fmtInt } from '../../lib/format';

const COLORS = {
  transit: '#06B6D4',
  car: '#475569',
  motorcycle: '#F59E0B',
};

export function ModeShareChart({ result }: { result: SimulationResult }) {
  const { transit, car, motorcycle } = result.modeSplit;
  const total = transit + car + motorcycle;
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);

  const data = [
    { name: 'Corridor trips', transit: pct(transit), car: pct(car), motorcycle: pct(motorcycle) },
  ];

  return (
    <div className="flex h-full min-h-56 w-full flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            width={70}
          />
          <Bar dataKey="transit" stackId="a" radius={[0, 0, 0, 0]}>
            <Cell fill={COLORS.transit} />
          </Bar>
          <Bar dataKey="car" stackId="a">
            <Cell fill={COLORS.car} />
          </Bar>
          <Bar dataKey="motorcycle" stackId="a" radius={[0, 4, 4, 0]}>
            <Cell fill={COLORS.motorcycle} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {(
          [
            ['Transit', transit, COLORS.transit],
            ['Car', car, COLORS.car],
            ['Motorcycle', motorcycle, COLORS.motorcycle],
          ] as const
        ).map(([label, value, color]) => (
          <span key={label} className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
            <span className="inline-block h-1.5 w-3 rounded-full" style={{ background: color }} />
            {label} {pct(value).toFixed(1)}% <span className="text-slate-600">({fmtInt(value)})</span>
          </span>
        ))}
      </div>
    </div>
  );
}
