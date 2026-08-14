/**
 * NARASI - KPI summary grid (8 metrics, live vs baseline).
 */

import { useDraftState } from '../../store/useSimulationStore';
import { KPI_ORDER } from '../../types/simulation';
import { MetricCard } from './MetricCard';

export function KpiSummaryGrid() {
  const draft = useDraftState();

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {KPI_ORDER.map((id) => {
        const row = draft.deltas.find((d) => d.kpi.id === id);
        if (!row) return null;
        return (
          <MetricCard
            key={id}
            meta={row.kpi}
            value={row.value}
            baselineValue={row.kpi.baseline}
            deltaPct={row.deltaPct}
            isImprovement={row.isImprovement}
          />
        );
      })}
    </div>
  );
}
