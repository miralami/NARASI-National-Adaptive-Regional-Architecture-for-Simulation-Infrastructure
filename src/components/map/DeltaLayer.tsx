/**
 * NARASI - Spatial delta layer (Scenario Comparison view).
 * IMPLEMENTATION_MASTERPLAN §12.5: Δv = v(scenario) − v(baseline).
 * Cyan stroke = speed gain, magenta stroke = speed loss.
 */

import { useMemo } from 'react';
import { PathLayer } from '@deck.gl/layers';
import type { Layer } from '@deck.gl/core';
import { CORRIDOR_1_LINKS } from '../../data/corridor1Links';
import { useMapHover } from './MapViewport';
import type { MapPickObject } from './tooltip';

const EPS = 0.05;

interface DeltaSegment {
  link: (typeof CORRIDOR_1_LINKS)[number];
  path: [number, number][];
  baseline: number;
  scenario: number;
}

export function useDeltaLayer(
  baselineSpeeds: Record<string, number>,
  scenarioSpeeds: Record<string, number>,
): Layer[] {
  const { setHover } = useMapHover();

  return useMemo(() => {
    const data: DeltaSegment[] = CORRIDOR_1_LINKS.map((link) => ({
      link,
      path: link.coordinates,
      baseline: baselineSpeeds[link.id] ?? 45,
      scenario: scenarioSpeeds[link.id] ?? 45,
    }));

    const route = new PathLayer<DeltaSegment>({
      id: 'delta-route-ref',
      data,
      pickable: false,
      getPath: (d) => d.path,
      getColor: [71, 85, 105, 90],
      getWidth: 120,
      widthUnits: 'meters',
      widthMinPixels: 1,
    });

    const delta = new PathLayer<DeltaSegment>({
      id: 'delta-overlay',
      data,
      pickable: true,
      getPath: (d) => d.path,
      getColor: (d) => {
        const delta = d.scenario - d.baseline;
        if (delta > EPS) return [6, 182, 212, 255]; // cyan gain
        if (delta < -EPS) return [232, 121, 249, 255]; // magenta loss
        return [148, 163, 184, 150]; // neutral
      },
      getWidth: 170,
      widthUnits: 'meters',
      widthMinPixels: 2,
      onHover: (info) => {
        const obj = info.object as DeltaSegment | undefined;
        setHover(
          obj
            ? {
                ...info,
                object: {
                  kind: 'delta',
                  link: obj.link,
                  delta: obj.scenario - obj.baseline,
                  speedKmh: obj.scenario,
                } satisfies MapPickObject,
              }
            : null,
        );
      },
    });

    return [route, delta];
  }, [baselineSpeeds, scenarioSpeeds, setHover]);
}
