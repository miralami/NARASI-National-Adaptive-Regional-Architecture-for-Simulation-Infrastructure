/**
 * NARASI - Preset scenario picker (one-click experiments).
 */

import { Zap, TrafficCone, Clock3, TrendingUp } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';

const PRESET_ICONS: Record<string, React.ReactNode> = {
  'preset-high-frequency': <Clock3 size={14} />,
  'preset-electrification': <Zap size={14} />,
  'preset-row-enforcement': <TrafficCone size={14} />,
  'preset-demand-surge': <TrendingUp size={14} />,
};

const PRESET_ACCENTS: Record<string, string> = {
  'preset-high-frequency': 'border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/10',
  'preset-electrification': 'border-brand-violet/60 text-brand-violet hover:bg-brand-violet/10',
  'preset-row-enforcement': 'border-brand-amber/60 text-brand-amber hover:bg-brand-amber/10',
  'preset-demand-surge': 'border-brand-emerald/60 text-brand-emerald hover:bg-brand-emerald/10',
};

export function PresetsPicker() {
  const scenarios = useSimulationStore((s) => s.scenarios);
  const loadScenario = useSimulationStore((s) => s.loadScenario);
  const activeId = useSimulationStore((s) => s.activeScenarioId);

  const presets = scenarios.filter((s) => s.id.startsWith('preset-'));

  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        Preset Experiments
      </h3>
      <div className="space-y-1.5">
        {presets.map((p) => {
          const active = activeId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => loadScenario(p.id)}
              className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
                active
                  ? `${PRESET_ACCENTS[p.id]} border`
                  : 'border-edge/60 text-slate-300 hover:border-slate-500 hover:bg-panel'
              }`}
            >
              {PRESET_ICONS[p.id]}
              <span className="font-semibold">{p.name}</span>
              {active ? (
                <span className="ml-auto rounded bg-brand-cyan/20 px-1.5 py-0.5 font-mono text-[9px] text-brand-cyan">
                  LOADED
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
