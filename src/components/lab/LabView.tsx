/**
 * NARASI - Policy Lab view (main screen).
 * Left rail: policy levers + presets + scenario manager.
 * Main: live corridor map, KPI grid, radar, mode share, insight.
 */

import { useMemo } from 'react';
import { BASELINE_RESULT, useDraftState, useSimulationStore } from '../../store/useSimulationStore';
import type { DraftState } from '../../types/simulation';
import { MapHoverProvider, MapViewport } from '../map/MapViewport';
import { useCorridorLayers } from '../map/CorridorLayer';
import { useStopNodesLayer } from '../map/StopNodesLayer';
import { useCatchmentLayers } from '../map/CatchmentBufferLayer';
import { renderMapHoverContent, type MapPickObject } from '../map/tooltip';
import { PolicySliders } from '../controls/PolicySliders';
import { PresetsPicker } from '../controls/PresetsPicker';
import { ScenarioManager } from '../controls/ScenarioManager';
import { KpiSummaryGrid } from '../dashboard/KpiSummaryGrid';
import { TradeoffRadarChart } from '../dashboard/TradeoffRadarChart';
import { ModeShareChart } from '../dashboard/ModeShareChart';
import { PolicyInsightCard } from '../dashboard/PolicyInsightCard';

function CorridorMapContent({ draft, headway }: { draft: DraftState; headway: number }) {
  const corridorLayers = useCorridorLayers(
    draft.result.linkSpeeds,
    draft.result.linkDedicatedFractions,
    headway,
  );
  const stopLayers = useStopNodesLayer({}, draft.result.stopWaitTimes);
  const catchLayers = useCatchmentLayers(draft.scenario.levers.feederConnectorActive);
  const layers = useMemo(
    () => [...corridorLayers, ...stopLayers, ...catchLayers],
    [corridorLayers, stopLayers, catchLayers],
  );
  return (
    <MapViewport
      layers={layers}
      renderHoverContent={(info) => renderMapHoverContent(info.object as MapPickObject | undefined)}
    />
  );
}

export function LabView() {
  const draft = useDraftState();
  const headway = useSimulationStore((s) => s.draftLevers.headwayMinutes);

  const radarSeries = [
    {
      id: 'baseline',
      name: 'Baseline',
      scores: BASELINE_RESULT.radarScores,
      color: '#94a3b8',
      dashed: true,
      fillOpacity: 0.06,
    },
    {
      id: 'draft',
      name: 'Current Draft',
      scores: draft.result.radarScores,
      color: '#06B6D4',
      dashed: false,
      fillOpacity: 0.22,
    },
  ];

  return (
    <div className="grid h-full grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[300px_1fr] lg:overflow-hidden">
      {/* Left rail */}
      <aside className="glass-card h-fit overflow-y-auto p-3 lg:max-h-full">
        <PolicySliders />
        <hr className="my-3 border-edge/60" />
        <PresetsPicker />
        <hr className="my-3 border-edge/60" />
        <ScenarioManager />
      </aside>

      {/* Main */}
      <main className="flex min-h-0 flex-col gap-3 overflow-y-auto">
        <div className="glass-card relative min-h-[380px] flex-1 overflow-hidden">
          <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-edge/70 bg-abyss/80 px-2 py-1 font-mono text-[10px] text-slate-300 backdrop-blur">
            Corridor 1 &middot; Blok M &rarr; Kota &middot; {draft.result.kpis.commercialSpeedKmh.toFixed(1)} km/h
          </div>
          <MapHoverProvider>
            <CorridorMapContent draft={draft} headway={headway} />
          </MapHoverProvider>
        </div>

        <KpiSummaryGrid />

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          <div className="glass-card p-3">
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Multi-Objective Trade-off
            </h3>
            <div className="h-64">
              <TradeoffRadarChart series={radarSeries} />
            </div>
          </div>
          <div className="glass-card p-3">
            <h3 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Mode Share
            </h3>
            <div className="h-64">
              <ModeShareChart result={draft.result} />
            </div>
          </div>
          <div className="glass-card p-3">
            <PolicyInsightCard insight={draft.result.insight} />
          </div>
        </div>
      </main>
    </div>
  );
}
