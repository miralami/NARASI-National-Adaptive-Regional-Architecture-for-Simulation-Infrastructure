/**
 * NARASI - Stop node layer (ScatterplotLayer sized by boardings).
 * IMPLEMENTATION_MASTERPLAN §12.3: radius proportional to boarding volume,
 * hover tooltip with stop info.
 */

import { useMemo } from 'react';
import { ScatterplotLayer } from '@deck.gl/layers';
import type { Layer } from '@deck.gl/core';
import { CORRIDOR_1_STOPS } from '../../data/corridor1Stops';
import { useMapHover } from './MapViewport';
import type { MapPickObject } from './tooltip';

const MAX_BOARDINGS = 12000;

interface StopNodeDatum {
  stop: (typeof CORRIDOR_1_STOPS)[number];
  boardings: number;
  waitMin: number;
}

export function useStopNodesLayer(
  boardings: Record<string, number>,
  waitTimes: Record<string, number>,
): Layer[] {
  const { setHover } = useMapHover();

  return useMemo(() => {
    const data: StopNodeDatum[] = CORRIDOR_1_STOPS.map((stop) => ({
      stop,
      boardings: boardings[stop.id] ?? stop.baselineBoardings,
      waitMin: waitTimes[stop.id] ?? 1.5,
    }));

    const layer = new ScatterplotLayer<StopNodeDatum>({
      id: 'stop-nodes',
      data,
      pickable: true,
      getPosition: (d) => [d.stop.lng, d.stop.lat],
      getRadius: (d) => 45 + 105 * Math.sqrt(d.boardings / MAX_BOARDINGS),
      radiusUnits: 'meters',
      getFillColor: (d) =>
        d.stop.isTransferHub ? [139, 92, 246, 200] : [6, 182, 212, 175],
      stroked: true,
      getLineColor: [255, 255, 255, 90],
      getLineWidth: 1.2,
      lineWidthUnits: 'pixels',
      onHover: (info) => {
        const d = info.object as StopNodeDatum | undefined;
        setHover(
          d
            ? {
                ...info,
                object: {
                  kind: 'stop',
                  stop: d.stop,
                  boardings: d.boardings,
                  waitMin: d.waitMin,
                } satisfies MapPickObject,
              }
            : null,
        );
      },
    });

    return [layer];
  }, [boardings, waitTimes, setHover]);
}
