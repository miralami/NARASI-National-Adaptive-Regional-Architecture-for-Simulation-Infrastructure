/**
 * NARASI - App header: brand, provenance popover, simulated-data badge.
 */

import { useState } from 'react';
import { Braces, FlaskConical, Info } from 'lucide-react';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-edge/70 bg-abyss/90 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-cyan/15 text-brand-cyan">
          <FlaskConical size={16} />
        </span>
        <div className="leading-none">
          <h1 className="text-sm font-black tracking-tight text-white">
            NARASI<span className="text-brand-cyan">.</span>
          </h1>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">
            Corridor 1 Virtual Mobility Policy Laboratory
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-md border border-brand-amber/40 bg-brand-amber/10 px-2 py-1 font-mono text-[10px] font-bold text-brand-amber">
          <Braces size={11} />
          [SIMULATED]
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-edge text-slate-400 transition-colors hover:bg-panel hover:text-white"
            aria-label="About this simulation"
          >
            <Info size={14} />
          </button>
          {open ? (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-9 z-50 w-80 rounded-lg border border-edge bg-panel p-3 shadow-2xl pointer-events-auto">
                <h3 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                  Simulation Provenance
                </h3>
                <ul className="space-y-1.5 font-mono text-[10px] leading-snug text-slate-400">
                  <li>
                    <span className="text-brand-cyan">Data:</span> synthetic profile calibrated
                    to the masterplan baseline (22 stops, 13.0 km, 110,000 boardings/day).
                  </li>
                  <li>
                    <span className="text-brand-cyan">Engine:</span> deterministic client-side
                    BPR congestion model (no random seeds).
                  </li>
                  <li>
                    <span className="text-brand-cyan">Coefficients:</span> verbatim from
                    IMPLEMENTATION_MASTERPLAN &sect;10&ndash;&sect;11 (modelling decisions D1&ndash;D4).
                  </li>
                  <li>
                    <span className="text-brand-cyan">Repeatability:</span> identical inputs
                    always produce identical outputs.
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-2 w-full rounded border border-edge py-1 text-[10px] text-slate-300 hover:bg-abyss"
                >
                  Close
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
