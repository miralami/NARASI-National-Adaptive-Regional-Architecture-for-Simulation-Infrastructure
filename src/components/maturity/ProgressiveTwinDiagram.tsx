/**
 * NARASI - Progressive Twin maturity ladder.
 * IMPLEMENTATION_MASTERPLAN §20: NARASI evolves through 5 maturity levels.
 * This prototype sits at Level 2 (Single-Corridor Policy Laboratory).
 */

import { Boxes, Cpu, Database, GitBranch, LineChart } from 'lucide-react';

interface MaturityLevel {
  level: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  state: 'current' | 'reached' | 'future';
}

const LEVELS: MaturityLevel[] = [
  {
    level: 1,
    title: 'Static Corridor Profile',
    description: 'Fixed operational statistics for a single corridor, refreshed manually.',
    icon: <Database size={16} />,
    state: 'reached',
  },
  {
    level: 2,
    title: 'Single-Corridor Policy Laboratory',
    description:
      'Interactive what-if simulation: live KPIs, spatial mapping and scenario comparison for Corridor 1.',
    icon: <LineChart size={16} />,
    state: 'current',
  },
  {
    level: 3,
    title: 'Multi-Corridor Regional Twin',
    description: 'Extends the laboratory across all BRT corridors with network-level interactions.',
    icon: <Boxes size={16} />,
    state: 'future',
  },
  {
    level: 4,
    title: 'Real-Time Adaptive Control',
    description: 'Live sensor feeds, predictive headway control and dynamic fleet allocation.',
    icon: <Cpu size={16} />,
    state: 'future',
  },
  {
    level: 5,
    title: 'National Federated Twin',
    description: 'Multi-city federation (Jakarta, Surabaya, Medan, Makassar) under one governance model.',
    icon: <GitBranch size={16} />,
    state: 'future',
  },
];

export function ProgressiveTwinDiagram() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center gap-4 p-6">
      <div className="text-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-cyan">
          Progressive Twin Evolution
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          NARASI matures corridor-by-corridor. This prototype demonstrates Level 2.
        </p>
      </div>

      <div className="w-full space-y-2">
        {LEVELS.map((lvl) => {
          const current = lvl.state === 'current';
          const reached = lvl.state === 'reached';
          return (
            <div
              key={lvl.level}
              className={`relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                current
                  ? 'border-brand-cyan/70 bg-brand-cyan/10 shadow-glow'
                  : reached
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-edge/60 bg-panel/40 opacity-60'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  current
                    ? 'border-brand-cyan bg-brand-cyan/20 text-brand-cyan'
                    : reached
                      ? 'border-emerald-500/50 text-emerald-400'
                      : 'border-edge text-slate-500'
                }`}
              >
                {lvl.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">L{lvl.level}</span>
                  <span
                    className={`truncate text-sm font-semibold ${
                      current ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {lvl.title}
                  </span>
                </div>
                <p className="text-[11px] leading-snug text-slate-400">{lvl.description}</p>
              </div>
              {current ? (
                <span className="shrink-0 rounded bg-brand-cyan px-2 py-1 font-mono text-[9px] font-bold text-abyss">
                  PROTOTYPE LEVEL
                </span>
              ) : reached ? (
                <span className="shrink-0 font-mono text-[9px] uppercase text-emerald-400">
                  reached
                </span>
              ) : (
                <span className="shrink-0 font-mono text-[9px] uppercase text-slate-600">
                  planned
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="max-w-xl text-center text-[11px] leading-relaxed text-slate-500">
        Level 2 is fully functional in this build: policy levers, deterministic simulation,
        KPI/radar dashboards, spatial speed visualization and scenario comparison. Levels 3&ndash;5
        define the NARASI rollout roadmap and require the national data federation layer.
      </p>
    </div>
  );
}
