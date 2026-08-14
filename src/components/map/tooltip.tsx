/**
 * NARASI - Shared map pick objects & tooltip renderer.
 */

import type { ReactNode } from 'react';
import type { CorridorLink, TransitStop } from '../../types/simulation';
import { SIM } from '../../sim/simConfig';
import { fmtNum } from '../../lib/format';

/** Discriminated union carried by pickable map layers. */
export type MapPickObject =
  | { kind: 'stop'; stop: TransitStop; boardings: number; waitMin: number }
  | { kind: 'link'; link: CorridorLink; speedKmh: number; dedicatedFrac: number }
  | { kind: 'delta'; link: CorridorLink; delta: number; speedKmh: number };

/** §12.2 speed → color mapping (green ≥ 25, amber 15–24, red < 15). */
export function speedColor(speedKmh: number): [number, number, number] {
  if (speedKmh >= SIM.SPEED_GOOD_KMH) return [16, 185, 129]; // emerald
  if (speedKmh >= SIM.SPEED_MEDIUM_KMH) return [245, 158, 11]; // amber
  return [239, 68, 68]; // crimson
}

/** Renders a tooltip body for a picked map object. */
export function renderMapHoverContent(
  obj: MapPickObject | undefined,
): ReactNode {
  if (!obj) return null;
  if (obj.kind === 'stop') {
    const { stop, boardings, waitMin } = obj;
    return (
      <div className="font-sans text-xs text-slate-200">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-brand-cyan/20 px-1.5 py-0.5 font-mono text-[10px] text-brand-cyan">
            {stop.code}
          </span>
          <span className="font-semibold text-white">{stop.name}</span>
        </div>
        <div className="space-y-0.5 font-mono text-[11px] text-slate-400">
          <div>
            Boardings: <span className="text-slate-200">{fmtNum(boardings, 0)}/day</span>
          </div>
          <div>
            Wait: <span className="text-slate-200">{fmtNum(waitMin, 1)} min</span>
          </div>
          {stop.isTransferHub ? (
            <div className="text-brand-violet">Transfer hub (MRT / KRL / corridor)</div>
          ) : null}
        </div>
      </div>
    );
  }
  if (obj.kind === 'link') {
    const { link, speedKmh, dedicatedFrac } = obj;
    const [r, g, b] = speedColor(speedKmh);
    return (
      <div className="font-sans text-xs text-slate-200">
        <div className="mb-1 font-semibold text-white">
          Segment {link.id.replace('lnk-', '')}
        </div>
        <div className="space-y-0.5 font-mono text-[11px] text-slate-400">
          <div>
            Bus speed:{' '}
            <span style={{ color: `rgb(${r},${g},${b})` }}>{fmtNum(speedKmh, 1)} km/h</span>
          </div>
          <div>
            Length: <span className="text-slate-200">{fmtNum(link.distanceKm, 2)} km</span>
          </div>
          <div>
            Dedicated ROW: <span className="text-slate-200">{Math.round(dedicatedFrac * 100)}%</span>
          </div>
        </div>
      </div>
    );
  }
  // delta
  const { link, delta, speedKmh } = obj;
  const color = delta > 0.05 ? 'text-brand-emerald' : delta < -0.05 ? 'text-fuchsia-400' : 'text-slate-400';
  return (
    <div className="font-sans text-xs text-slate-200">
      <div className="mb-1 font-semibold text-white">Segment {link.id.replace('lnk-', '')}</div>
      <div className="space-y-0.5 font-mono text-[11px] text-slate-400">
        <div>
          Scenario speed: <span className="text-slate-200">{fmtNum(speedKmh, 1)} km/h</span>
        </div>
        <div>
          Δ vs baseline: <span className={color}>{delta >= 0 ? '+' : ''}{fmtNum(delta, 1)} km/h</span>
        </div>
      </div>
    </div>
  );
}
