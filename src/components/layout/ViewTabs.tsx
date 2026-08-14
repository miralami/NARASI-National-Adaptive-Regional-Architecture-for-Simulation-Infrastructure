/**
 * NARASI - View tabs (Policy Lab / Comparison / Maturity).
 */

import { GitCompareArrows, Layers3, SlidersHorizontal } from 'lucide-react';
import { useSimulationStore } from '../../store/useSimulationStore';
import type { ViewMode } from '../../types/simulation';

const TABS: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'lab', label: 'Policy Lab', icon: <SlidersHorizontal size={13} /> },
  { id: 'compare', label: 'Compare Scenarios', icon: <GitCompareArrows size={13} /> },
  { id: 'maturity', label: 'Progressive Twin', icon: <Layers3 size={13} /> },
];

export function ViewTabs() {
  const viewMode = useSimulationStore((s) => s.viewMode);
  const setViewMode = useSimulationStore((s) => s.setViewMode);

  return (
    <nav className="flex shrink-0 items-center gap-1 border-b border-edge/70 bg-abyss/70 px-3">
      {TABS.map((tab) => {
        const active = viewMode === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            className={`relative flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-colors ${
              active ? 'text-brand-cyan' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
            {active ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-cyan shadow-glow" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
