/**
 * NARASI - Side-by-side scenario delta table.
 * Absolute values + direction-aware percentage deltas vs baseline.
 */

import type { DeltaRow } from '../../types/simulation';
import { KPI_ORDER } from '../../types/simulation';
import { fmtNum, fmtDeltaPct } from '../../lib/format';

export interface DeltaTableColumn {
  id: string;
  name: string;
  color: string;
  rows: DeltaRow[];
}

export function DeltaTable({ columns }: { columns: DeltaTableColumn[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border-b border-edge/60 py-1.5 pr-2 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Metric
            </th>
            {columns.map((c) => (
              <th
                key={c.id}
                className="border-b border-edge/60 px-2 py-1.5 text-right font-mono text-[10px] uppercase tracking-wider"
                style={{ color: c.color }}
              >
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KPI_ORDER.map((id) => (
            <tr key={id} className="border-b border-edge/40">
              <td className="py-1.5 pr-2">
                <div className="font-medium text-slate-300">
                  {columns[0]?.rows.find((r) => r.kpi.id === id)?.kpi.label ?? id}
                </div>
                <div className="font-mono text-[9px] text-slate-600">
                  {columns[0]?.rows.find((r) => r.kpi.id === id)?.kpi.unit}
                </div>
              </td>
              {columns.map((c) => {
                const row = c.rows.find((r) => r.kpi.id === id);
                if (!row) return <td key={c.id} />;
                const color =
                  row.isImprovement === null || row.deltaPct === null
                    ? 'text-slate-400'
                    : row.isImprovement
                      ? 'text-brand-emerald'
                      : 'text-brand-crimson';
                return (
                  <td key={c.id} className="px-2 py-1.5 text-right">
                    <div className="font-mono font-semibold text-slate-100">
                      {fmtNum(row.value)}
                    </div>
                    <div className={`font-mono text-[10px] ${color}`}>
                      {row.deltaPct === null || row.deltaPct === 0
                        ? '—'
                        : `${row.deltaPct > 0 ? '\u25B2' : '\u25BC'} ${fmtDeltaPct(row.deltaPct)}`}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
