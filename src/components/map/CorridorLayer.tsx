/**
 * NARASI - Corridor route layer (speed color-coded PathLayer).
 * IMPLEMENTATION_MASTERPLAN §12.2: color by link commercial speed, width
 * scales with service frequency (headway).
 */

import { useMemo } from 'react';
import { PathLayer } from '@deck.gl/layers';
import type { Layer } from '@deck.gl/core';
import { CORRIDOR_1_LINKS } from '../../data/corridor1Links';
import { useMapHover } from './MapViewport';
import { speedColor, type MapPickObject } from './tooltip';

interface CorridorSegment {
  link: (typeof CORRIDOR_1_LINKS)[number];
  path: [number, number][];
  speedKmh: number;
  dedicatedFrac: number;
}

export function useCorridorLayers(
  linkSpeeds: Record<string, number>,
  dedicatedFractions: Record<string, number>,
  headwayMinutes: number,
): Layer[] {
  const { setHover } = useMapHover();

  return useMemo(() => {
    const data: CorridorSegment[] = CORRIDOR_1_LINKS.map((link) => ({
      link,
      path: link.coordinates,
      speedKmh: linkSpeeds[link.id] ?? 45,
      dedicatedFrac: dedicatedFractions[link.id] ?? (link.isDedicatedBRTLane ? 1 : 0),
    }));

    const widthM = Math.min(220, Math.max(45, 30 + 170 / headwayMinutes));

    const glow = new PathLayer<CorridorSegment>({
      id: 'corridor-glow',
      data,
      pickable: false,
      getPath: (d) => d.path,
      getColor: (d) => [...speedColor(d.speedKmh), 40] as [number, number, number, number],
      getWidth: widthM * 2.4,
      widthUnits: 'meters',
      widthMinPixels: 3,
    });

    const core = new PathLayer<CorridorSegment>({
      id: 'corridor-core',
      data,
      pickable: true,
      getPath: (d) => d.path,
      getColor: (d) => [...speedColor(d.speedKmh), 255] as [number, number, number, number],
      getWidth: widthM,
      widthUnits: 'meters',
      widthMinPixels: 2,
      onHover: (info) => {
        const obj = info.object as CorridorSegment | undefined;
        setHover(
          obj
            ? {
                ...info,
                object: {
                  kind: 'link',
                  link: obj.link,
                  speedKmh: obj.speedKmh,
                  dedicatedFrac: obj.dedicatedFrac,
                } satisfies MapPickObject,
              }
            : null,
        );
      },
    });

    return [glow, core];
  }, [linkSpeeds, dedicatedFractions, headwayMinutes, setHover]);
}
