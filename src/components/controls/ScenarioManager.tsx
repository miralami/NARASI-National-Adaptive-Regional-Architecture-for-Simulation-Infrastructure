/**
 * NARASI - Scenario manager (registry list + run simulation).
 *
 * The RUN button commits the current draft configuration as a new scenario
 * (a recorded experiment) so it can be compared against the baseline.
 */

import { useState } from 'react';
import { FlaskConical, Play, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useSimulationStore, useDraftState } from '../../store/useSimulationStore';
import { fmtTime } from '../../lib/format';

export function ScenarioManager() {
  const scenarios = useSimulationStore((s) => s.scenarios);
  const activeId = useSimulationStore((s) => s.activeScenarioId);
  const loadScenario = useSimulationStore((s) => s.loadScenario);
  const runSimulation = useSimulationStore((s) => s.runSimulation);
  const deleteScenario = useSimulationStore((s) => s.deleteScenario);
  const lastRunAt = useSimulationStore((s) => s.lastRunAt);
  const draft = useDraftState();
  const [nameInput, setNameInput] = useState('');

  const customCount = scenarios.filter((s) => !s.isBaseline && !s.id.startsWith('preset-')).length;

  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Scenarios
      </h3>

      <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
        {scenarios.map((s) => {
          const active = activeId === s.id;
          const isCustom = !s.isBaseline && !s.id.startsWith('preset-');
          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                active
                  ? 'border-brand-cyan/60 bg-brand-cyan/10 text-white'
                  : 'border-edge/60 text-slate-300 hover:bg-panel'
              }`}
            >
              <button
                type="button"
                onClick={() => loadScenario(s.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                {s.isBaseline ? (
                  <FlaskConical size={13} className="shrink-0 text-brand-cyan" />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      s.id.startsWith('preset-') ? 'bg-slate-400' : 'bg-brand-emerald'
                    }`}
                  />
                )}
                <span className="truncate font-medium">{s.name}</span>
              </button>
              {active && draft.isDirty ? (
                <span className="shrink-0 font-mono text-[9px] text-brand-amber">EDITED</span>
              ) : null}
              {isCustom ? (
                <button
                  type="button"
                  onClick={() => deleteScenario(s.id)}
                  className="shrink-0 text-slate-500 hover:text-brand-crimson"
                  aria-label={`Delete ${s.name}`}
                >
                  <Trash2 size={12} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => runSimulation(nameInput.trim() || undefined)}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-cyan px-3 py-2 text-sm font-bold text-abyss shadow-glow transition-colors hover:bg-cyan-400"
        >
          <Play size={15} />
          RUN SIMULATION
        </button>
        {lastRunAt ? (
          <p className="mt-1.5 text-center font-mono text-[10px] text-slate-500">
            Last run committed at {fmtTime(lastRunAt)}
          </p>
        ) : (
          <p className="mt-1.5 text-center text-[10px] text-slate-500">
            Commits the current levers as {customCount === 0 ? 'Scenario A' : `Scenario ${String.fromCharCode(65 + customCount)}`}
          </p>
        )}

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Scenario name (optional)"
            className="min-w-0 flex-1 rounded-md border border-edge/70 bg-panel px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-brand-cyan focus:outline-none"
          />
          <button
            type="button"
            onClick={() => runSimulation(nameInput.trim() || undefined)}
            className="shrink-0 rounded-md border border-edge px-2 text-slate-300 hover:bg-panel"
            aria-label="Add scenario with custom name"
            title="Add scenario with custom name"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => loadScenario('baseline')}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-edge/70 px-2 py-1.5 text-[11px] text-slate-400 transition-colors hover:bg-panel hover:text-slate-200"
        >
          <RotateCcw size={12} />
          Reset to Baseline
        </button>
      </div>
    </div>
  );
}
