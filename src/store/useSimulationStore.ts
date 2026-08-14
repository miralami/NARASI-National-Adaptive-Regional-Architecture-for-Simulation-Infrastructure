/**
 * NARASI - Core application store (Zustand + persist).
 *
 * Owns: view mode, scenario registry, simulation results cache, and the
 * "draft" policy configuration being tuned in the Policy Lab. Custom
 * scenarios persist across reloads (localStorage).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type {
  DraftState,
  PolicyLevers,
  PolicyScenario,
  SimulationResult,
  ViewMode,
} from '../types/simulation';
import { DEFAULT_SCENARIOS, DEFAULT_LEVERS } from '../data/defaultScenarios';
import { computeResult } from '../sim/prototypeEngine';
import { computeDeltas } from '../sim/kpiCalculator';

/* Baseline twin: computed once, deterministic (see engine D1-D4). */
export const BASELINE_SCENARIO: PolicyScenario = DEFAULT_SCENARIOS.find(
  (s) => s.isBaseline,
)!;
export const BASELINE_RESULT: SimulationResult = computeResult(BASELINE_SCENARIO);
export const CORRIDOR_BASELINE = {
  scenario: BASELINE_SCENARIO,
  result: BASELINE_RESULT,
};

function computeResults(scenarios: PolicyScenario[]): Record<string, SimulationResult> {
  const out: Record<string, SimulationResult> = {};
  for (const s of scenarios) out[s.id] = computeResult(s, BASELINE_RESULT.kpis);
  return out;
}

const leversEqual = (a: PolicyLevers, b: PolicyLevers) =>
  a.headwayMinutes === b.headwayMinutes &&
  a.fleetSize === b.fleetSize &&
  a.electricBusRatio === b.electricBusRatio &&
  a.dedicatedLaneRatio === b.dedicatedLaneRatio &&
  a.feederConnectorActive === b.feederConnectorActive &&
  a.demandMultiplier === b.demandMultiplier;

interface SimulationStore {
  viewMode: ViewMode;
  scenarios: PolicyScenario[];
  results: Record<string, SimulationResult>;
  draftLevers: PolicyLevers;
  activeScenarioId: string | null;
  lastRunAt: string | null;

  setViewMode: (mode: ViewMode) => void;
  setLever: <K extends keyof PolicyLevers>(key: K, value: PolicyLevers[K]) => void;
  loadScenario: (id: string) => void;
  runSimulation: (name?: string) => void;
  deleteScenario: (id: string) => void;
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      viewMode: 'lab',
      scenarios: DEFAULT_SCENARIOS,
      results: computeResults(DEFAULT_SCENARIOS),
      draftLevers: { ...DEFAULT_LEVERS },
      activeScenarioId: 'baseline',
      lastRunAt: null,

      setViewMode: (viewMode) => set({ viewMode }),

      setLever: (key, value) =>
        set((s) => ({ draftLevers: { ...s.draftLevers, [key]: value } })),

      loadScenario: (id) => {
        const scn = get().scenarios.find((s) => s.id === id);
        if (!scn) return;
        set({ draftLevers: { ...scn.levers }, activeScenarioId: id });
      },

      runSimulation: (name) => {
        const { draftLevers, scenarios } = get();
        const customCount = scenarios.filter(
          (s) => !s.isBaseline && !s.id.startsWith('preset-'),
        ).length;
        const id = `custom-${Date.now()}`;
        const scenario: PolicyScenario = {
          id,
          name: name ?? `Scenario ${String.fromCharCode(65 + Math.min(customCount, 25))}`,
          description: 'Custom policy configuration created in the Policy Lab.',
          isBaseline: false,
          createdAt: new Date().toISOString(),
          levers: { ...draftLevers },
        };
        set((s) => ({
          scenarios: [...s.scenarios, scenario],
          results: {
            ...s.results,
            [id]: computeResult(scenario, BASELINE_RESULT.kpis),
          },
          activeScenarioId: id,
          lastRunAt: new Date().toISOString(),
        }));
      },

      deleteScenario: (id) =>
        set((s) => {
          if (id === 'baseline' || id.startsWith('preset-')) return s;
          const results = { ...s.results };
          delete results[id];
          return {
            scenarios: s.scenarios.filter((x) => x.id !== id),
            results,
            activeScenarioId: s.activeScenarioId === id ? 'baseline' : s.activeScenarioId,
          };
        }),
    }),
    {
      name: 'narasi-store-v1',
      partialize: (s) => ({
        viewMode: s.viewMode,
        scenarios: s.scenarios,
        draftLevers: s.draftLevers,
        activeScenarioId: s.activeScenarioId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<SimulationStore>;
        const scenarios = p.scenarios && p.scenarios.length ? p.scenarios : current.scenarios;
        return { ...current, ...p, scenarios, results: computeResults(scenarios) };
      },
    },
  ),
);

/** Live draft computation: result + direction-aware deltas vs baseline. */
export function useDraftState(): DraftState {
  const draftLevers = useSimulationStore((s) => s.draftLevers);
  const activeScenarioId = useSimulationStore((s) => s.activeScenarioId);
  const lastRunAt = useSimulationStore((s) => s.lastRunAt);
  const scenarios = useSimulationStore((s) => s.scenarios);

  const draft = useMemo<DraftState>(() => {
    const scenario: PolicyScenario = {
      id: 'draft',
      name: 'Draft scenario',
      description: 'Current lever configuration in the Policy Lab.',
      isBaseline: false,
      createdAt: '',
      levers: { ...draftLevers },
    };
    const result = computeResult(scenario, BASELINE_RESULT.kpis);
    const deltas = computeDeltas(BASELINE_RESULT.kpis, result.kpis);
    const active = scenarios.find((s) => s.id === activeScenarioId);
    const isDirty = !active || !leversEqual(active.levers, draftLevers);
    return { scenario, result, deltas, isDirty };
  }, [draftLevers, activeScenarioId, lastRunAt, scenarios]);

  return draft;
}
