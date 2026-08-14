/**
 * NARASI - Scenario Comparison workbench.
 * Side-by-side trade-off view: radar overlay, delta table, spatial Δspeed map.
 */

import { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import { useSimulationStore, BASELINE_RESULT } from '../../store/useSimulationStore';
import { computeDeltas } from '../../sim/kpiCalculator';
import type { SimulationResult, PolicyScenario } from '../../types/simulation';
import { MapHoverProvider, MapViewport } from '../map/MapViewport';
import { useDeltaLayer } from '../map/DeltaLayer';
import { useStopNodesLayer } from '../map/StopNodesLayer';
import { useCatchmentLayers } from '../map/CatchmentBufferLayer';
import { renderMapHoverContent, type MapPickObject } from '../map/tooltip';
import { RadarOverlayChart } from './RadarOverlayChart';
import { DeltaTable, type DeltaTableColumn } from './DeltaTable';

const SCENARIO_COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
const MAX_SELECTED = 3;

function DeltaMapPanel({
  baseline,
  primary,
  feederActive,
}: {
  baseline: SimulationResult;
  primary: SimulationResult;
  feederActive: boolean;
}) {
  const deltaLayers = useDeltaLayer(baseline.linkSpeeds, primary.linkSpeeds);
  const stopLayers = useStopNodesLayer({}, primary.stopWaitTimes);
  const catchLayers = useCatchmentLayers(feederActive);
  const layers = useMemo(
    () => [...deltaLayers, ...stopLayers, ...catchLayers],
    [deltaLayers, stopLayers, catchLayers],
  );
  return (
    <MapViewport
      layers={layers}
      renderHoverContent={(info) => renderMapHoverContent(info.object as MapPickObject | undefined)}
    />
  );
}

interface SelectedScenario {
  scenario: PolicyScenario;
  result: SimulationResult;
}

export function ComparisonWorkbench() {
  const scenarios = useSimulationStore((s) => s.scenarios);
  const results = useSimulationStore((s) => s.results);
  const [selectedIds, setSelectedIds] = useState<string[]>(['baseline']);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  };

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => ({
          scenario: scenarios.find((s) => s.id === id),
          result: results[id],
        }))
        .filter((x): x is SelectedScenario => Boolean(x.scenario && x.result)),
    [selectedIds, scenarios, results],
  );

  const columns: DeltaTableColumn[] = selected.map((s, i) => ({
    id: s.scenario.id,
    name: s.scenario.name,
    color: SCENARIO_COLORS[i % SCENARIO_COLORS.length],
    rows: computeDeltas(BASELINE_RESULT.kpis, s.result.kpis),
  }));

  const baselineSelected = selected.some((s) => s.scenario.isBaseline);
  const primary = selected.find((s) => !s.scenario.isBaseline) ?? selected[0];
  const primaryColor =
    SCENARIO_COLORS[selected.findIndex((s) => s.scenario.id === primary?.scenario.id) % SCENARIO_COLORS.length];

  return (
    <div className="grid h-full grid-cols-1 gap-3 p-3 lg:grid-cols-2">
      {/* Left: scenario picker + radar + delta table */}
      <div className="flex flex-col gap-3 overflow-y-auto">
        <div className="glass-card p-3">
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Compare Scenarios ({selected.length}/{MAX_SELECTED})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {scenarios.map((s) => {
              const idx = selectedIds.indexOf(s.id);
              const on = idx >= 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    on
                      ? 'border-brand-cyan/70 bg-brand-cyan/15 text-white'
                      : 'border-edge/70 text-slate-400 hover:bg-panel'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
          {!baselineSelected ? (
            <p className="mt-2 text-[10px] text-brand-amber">
              Baseline is not selected — deltas and radar reference the baseline internally.
            </p>
          ) : null}
        </div>

        <div className="glass-card flex-1 p-3">
          <h3 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Multi-Objective Trade-off
          </h3>
          <div className="h-72">
            <RadarOverlayChart
              scenarios={selected.map((s, i) => ({
                id: s.scenario.id,
                name: s.scenario.name,
                result: s.result,
                color: SCENARIO_COLORS[i % SCENARIO_COLORS.length],
              }))}
            />
          </div>
        </div>

        <div className="glass-card p-3">
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            KPI Delta Matrix (vs Baseline)
          </h3>
          <DeltaTable columns={columns} />
        </div>
      </div>

      {/* Right: spatial delta map */}
      <div className="glass-card flex min-h-96 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-edge/50 px-3 py-2">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <Layers size={12} className="text-brand-cyan" />
            Spatial Speed Delta
          </h3>
          <span className="flex items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-full bg-brand-cyan" /> faster
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-3 rounded-full bg-fuchsia-400" /> slower
            </span>
          </span>
        </div>
        {primary ? (
          <>
            <p className="border-b border-edge/40 px-3 py-1.5 text-[11px] text-slate-400">
              <span className="font-semibold" style={{ color: primaryColor }}>
                {primary.scenario.name}
              </span>{' '}
              vs baseline — Δ speed = v(scenario) − v(baseline) on each segment
            </p>
            <div className="relative flex-1">
              <MapHoverProvider>
                <DeltaMapPanel
                  baseline={BASELINE_RESULT}
                  primary={primary.result}
                  feederActive={primary.scenario.levers.feederConnectorActive}
                />
              </MapHoverProvider>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
            Select at least one scenario to visualize.
          </div>
        )}
      </div>
    </div>
  );
}
