/**
 * NARASI - Catchment buffer layer (400m walk rings + feeder zones).
 * IMPLEMENTATION_MASTERPLAN §12.4: translucent 400m rings around stations;
 * expanding violet feeder zones when the feeder policy is active.
 */

import { useMemo } from 'react';
import { circle } from '@turf/turf';
import { PolygonLayer } from '@deck.gl/layers';
import type { Layer } from '@deck.gl/core';
import { CORRIDOR_1_STOPS } from '../../data/corridor1Stops';
import { SIM } from '../../sim/simConfig';

interface Ring {
  ring: [number, number][];
  fill: [number, number, number, number];
  line: [number, number, number, number];
}

const SEGMENTS = 36;

export function useCatchmentLayers(feederActive: boolean): Layer[] {
  const baseRings = useMemo<Ring[]>(
    () =>
      CORRIDOR_1_STOPS.map((stop) => {
        const ring = circle([stop.lng, stop.lat], SIM.STOP_CATCHMENT_METERS / 1000, {
          units: 'kilometers',
          steps: SEGMENTS,
        }).geometry.coordinates[0] as [number, number][];
        return {
          ring,
          fill: [6, 182, 212, 26],
          line: [6, 182, 212, 120],
        };
      }),
    [],
  );

  const feederRings = useMemo<Ring[]>(
    () =>
      feederActive
        ? CORRIDOR_1_STOPS.filter((s) => s.isFeederHub).map((stop) => {
            const ring = circle([stop.lng, stop.lat], SIM.FEEDER_RING_METERS / 1000, {
              units: 'kilometers',
              steps: SEGMENTS,
            }).geometry.coordinates[0] as [number, number][];
            return {
              ring,
              fill: [139, 92, 246, 40],
              line: [139, 92, 246, 200],
            };
          })
        : [],
    [feederActive],
  );

  return useMemo(() => {
    const layers: Layer[] = [
      new PolygonLayer<Ring>({
        id: 'catchment-400m',
        data: baseRings,
        pickable: false,
        getPolygon: (d) => d.ring,
        getFillColor: (d) => d.fill,
        stroked: true,
        getLineColor: (d) => d.line,
        getLineWidth: 1.2,
        lineWidthUnits: 'pixels',
      }),
    ];
    if (feederRings.length > 0) {
      layers.push(
        new PolygonLayer<Ring>({
          id: 'catchment-feeder',
          data: feederRings,
          pickable: false,
          getPolygon: (d) => d.ring,
          getFillColor: (d) => d.fill,
          stroked: true,
          getLineColor: (d) => d.line,
          getLineWidth: 1.5,
          lineWidthUnits: 'pixels',
        }),
      );
    }
    return layers;
  }, [baseRings, feederRings]);
}
