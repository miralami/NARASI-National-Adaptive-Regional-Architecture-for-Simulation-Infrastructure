/**
 * NARASI - Policy lever controls (left panel).
 * Every lever change recomputes the deterministic simulation instantly.
 */

import type { ReactNode } from 'react';
import { Bus, Route, TrafficCone, Users, Zap } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import type { PolicyLevers } from '../../types/simulation';

interface SliderDef {
  key: keyof PolicyLevers;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  display: (v: number) => string;
  icon: ReactNode;
}

const SLIDERS: SliderDef[] = [
  { key: 'headwayMinutes', label: 'Headway', hint: 'min between buses', min: 1.0, max: 15.0, step: 0.5, unit: 'min', display: (v) => v.toFixed(1), icon: <Route size={14} className="text-brand-cyan" /> },
  { key: 'fleetSize', label: 'Fleet Size', hint: 'active buses', min: 20, max: 120, step: 5, unit: 'buses', display: (v) => String(Math.round(v)), icon: <Bus size={14} className="text-brand-cyan" /> },
  { key: 'electricBusRatio', label: 'Fleet Electrification', hint: 'share electric', min: 0, max: 1.0, step: 0.1, unit: '%', display: (v) => String(Math.round(v * 100)), icon: <Zap size={14} className="text-brand-violet" /> },
  { key: 'dedicatedLaneRatio', label: 'Dedicated ROW', hint: 'enforced bus lanes', min: 0.5, max: 1.0, step: 0.05, unit: '%', display: (v) => String(Math.round(v * 100)), icon: <TrafficCone size={14} className="text-brand-amber" /> },
  { key: 'demandMultiplier', label: 'Demand Level', hint: 'corridor demand', min: 0.8, max: 1.5, step: 0.05, unit: 'x', display: (v) => v.toFixed(2), icon: <Users size={14} className="text-brand-emerald" /> },
];

function SliderRow({ def, value, onChange }: { def: SliderDef; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-baseline justify-between">
        <div className="flex items-center gap-1.5">
          {def.icon}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            {def.label}
          </span>
        </div>
        <span className="font-mono text-sm font-semibold text-white">
          {def.display(value)}
          <span className="ml-0.5 text-[10px] text-slate-500">{def.unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="narasi-range w-full"
        aria-label={def.label}
      />
      <div className="flex justify-between font-mono text-[9px] text-slate-600">
        <span>{def.display(def.min)}</span>
        <span className="text-slate-500">{def.hint}</span>
        <span>{def.display(def.max)}</span>
      </div>
    </div>
  );
}

export function PolicySliders() {
  const draftLevers = useSimulationStore((s) => s.draftLevers);
  const setLever = useSimulationStore((s) => s.setLever);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Policy Levers
        </h3>
        <span className="font-mono text-[10px] text-slate-500">[SIMULATED]</span>
      </div>
      {SLIDERS.map((def) => (
        <SliderRow
          key={def.key}
          def={def}
          value={draftLevers[def.key] as number}
          onChange={(v) => setLever(def.key, v)}
        />
      ))}
      {/* Feeder toggle */}
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Route size={14} className="text-brand-violet" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Feeder Connectors
          </span>
        </div>
        <button
          type="button"
          onClick={() => setLever('feederConnectorActive', !draftLevers.feederConnectorActive)}
          className={`relative h-5 w-9 rounded-full transition-colors ${
            draftLevers.feederConnectorActive ? 'bg-brand-violet' : 'bg-edge'
          }`}
          aria-label="Toggle feeder connectors"
          aria-pressed={draftLevers.feederConnectorActive}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
              draftLevers.feederConnectorActive ? 'left-[18px]' : 'left-[2px]'
            }`}
          />
        </button>
      </div>
      <p className="text-[10px] text-slate-500">
        Microtransit / angkot connectors at hub shelters (400&thinsp;m&rarr;700&thinsp;m zones).
      </p>
    </div>
  );
}
