/**
 * NARASI - Single KPI metric card with direction-aware delta.
 */

import type { KpiMeta } from '../../types/simulation';
import { fmtNum, fmtDeltaPct } from '../../lib/format';

const DIM_COLORS: Record<string, string> = {
  Mobility: 'text-brand-cyan',
  'Public Transport': 'text-brand-emerald',
  Environment: 'text-brand-amber',
  Economics: 'text-brand-crimson',
  Equity: 'text-brand-violet',
};

interface MetricCardProps {
  meta: KpiMeta;
  value: number;
  baselineValue: number;
  deltaPct: number | null;
  isImprovement: boolean | null;
}

export function MetricCard({ meta, value, baselineValue, deltaPct, isImprovement }: MetricCardProps) {
  const deltaColor =
    isImprovement === null
      ? 'text-slate-400'
      : isImprovement
        ? 'text-brand-emerald'
        : 'text-brand-crimson';

  return (
    <div className="glass-card flex flex-col justify-between p-3">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {meta.shortLabel}
        </span>
        <span className={`font-mono text-[9px] ${DIM_COLORS[meta.dimension] ?? 'text-slate-400'}`}>
          {meta.dimension}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-xl font-bold text-white">{fmtNum(value)}</span>
        <span className="font-mono text-[10px] text-slate-500">{meta.unit}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-1">
        {deltaPct !== null && deltaPct !== 0 ? (
          <span className={`font-mono text-[11px] font-semibold ${deltaColor}`}>
            {deltaPct > 0 ? '\u25B2' : '\u25BC'} {fmtDeltaPct(deltaPct)}
          </span>
        ) : (
          <span className="font-mono text-[11px] text-slate-500">&mdash; vs baseline</span>
        )}
        <span className="font-mono text-[9px] text-slate-600">base {fmtNum(baselineValue)}</span>
      </div>
    </div>
  );
}
