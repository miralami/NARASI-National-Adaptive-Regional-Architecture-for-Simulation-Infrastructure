/**
 * NARASI — TransJakarta Corridor 1 link (segment) dataset.
 *
 * DATA PROVENANCE:
 *  - Geometry: [SOURCE-APPROX] segment coordinates are stop-to-stop straight
 *    line pairs derived from the approximated stop coordinates (see
 *    corridor1Stops.ts).
 *  - Distances: [DERIVED] computed from geometry via @turf/turf (haversine),
 *    then normalized so the route total equals the nominal 13.0 km used by
 *    the masterplan equations (§10). The normalization factor is exported
 *    below for full transparency.
 *  - Traffic volumes: [CALIBRATED SYNTHETIC] hourly car volumes and lane
 *    capacities are prototype estimates. Mixed-lane bottleneck links (near
 *    Harmoni/Monas) are deliberately oversaturated (v/c ≈ 2.9) to reproduce
 *    the calibrated baseline commercial speed of ≈17.3 km/h.
 */

import { distance } from '@turf/turf';
import type { CorridorLink } from '../types/simulation';
import { STOP_BY_ID } from './corridor1Stops';
import { SIM } from '../sim/simConfig';

/** Nominal route length per masterplan §5/§10. */
const NOMINAL_ROUTE_KM = SIM.ROUTE_LENGTH_KM;

interface LinkSpec {
  sourceStopId: string;
  targetStopId: string;
  capacityVehPerHour: number;
  carVolumePerHour: number;
  /** Baseline dedicated-BRT state (bottleneck links are mixed). */
  isDedicatedBRTLane: boolean;
}

const LINK_SPECS: LinkSpec[] = [
  // Blok M → Kota (northbound order)
  { sourceStopId: 'st-01', targetStopId: 'st-02', capacityVehPerHour: 2000, carVolumePerHour: 2500, isDedicatedBRTLane: true },
  { sourceStopId: 'st-02', targetStopId: 'st-03', capacityVehPerHour: 2000, carVolumePerHour: 2200, isDedicatedBRTLane: true },
  { sourceStopId: 'st-03', targetStopId: 'st-04', capacityVehPerHour: 1800, carVolumePerHour: 1800, isDedicatedBRTLane: true },
  { sourceStopId: 'st-04', targetStopId: 'st-05', capacityVehPerHour: 2000, carVolumePerHour: 2600, isDedicatedBRTLane: true },
  { sourceStopId: 'st-05', targetStopId: 'st-06', capacityVehPerHour: 2000, carVolumePerHour: 2400, isDedicatedBRTLane: true },
  { sourceStopId: 'st-06', targetStopId: 'st-07', capacityVehPerHour: 2000, carVolumePerHour: 2800, isDedicatedBRTLane: true },
  { sourceStopId: 'st-07', targetStopId: 'st-08', capacityVehPerHour: 2000, carVolumePerHour: 2400, isDedicatedBRTLane: true },
  { sourceStopId: 'st-08', targetStopId: 'st-09', capacityVehPerHour: 2000, carVolumePerHour: 2600, isDedicatedBRTLane: true },
  { sourceStopId: 'st-09', targetStopId: 'st-10', capacityVehPerHour: 2000, carVolumePerHour: 2800, isDedicatedBRTLane: true },
  { sourceStopId: 'st-10', targetStopId: 'st-11', capacityVehPerHour: 2000, carVolumePerHour: 3000, isDedicatedBRTLane: true },
  { sourceStopId: 'st-11', targetStopId: 'st-12', capacityVehPerHour: 2000, carVolumePerHour: 2800, isDedicatedBRTLane: true },
  { sourceStopId: 'st-12', targetStopId: 'st-13', capacityVehPerHour: 2000, carVolumePerHour: 3000, isDedicatedBRTLane: true },
  { sourceStopId: 'st-13', targetStopId: 'st-14', capacityVehPerHour: 2000, carVolumePerHour: 3200, isDedicatedBRTLane: true },
  // Harmoni/Monas mixed-traffic bottleneck block (15% of route)
  { sourceStopId: 'st-14', targetStopId: 'st-15', capacityVehPerHour: 1000, carVolumePerHour: 2900, isDedicatedBRTLane: false },
  { sourceStopId: 'st-15', targetStopId: 'st-16', capacityVehPerHour: 1000, carVolumePerHour: 2900, isDedicatedBRTLane: false },
  { sourceStopId: 'st-16', targetStopId: 'st-17', capacityVehPerHour: 1000, carVolumePerHour: 2900, isDedicatedBRTLane: false },
  { sourceStopId: 'st-17', targetStopId: 'st-18', capacityVehPerHour: 2000, carVolumePerHour: 2800, isDedicatedBRTLane: true },
  { sourceStopId: 'st-18', targetStopId: 'st-19', capacityVehPerHour: 1800, carVolumePerHour: 2700, isDedicatedBRTLane: true },
  { sourceStopId: 'st-19', targetStopId: 'st-20', capacityVehPerHour: 1800, carVolumePerHour: 2500, isDedicatedBRTLane: true },
  { sourceStopId: 'st-20', targetStopId: 'st-21', capacityVehPerHour: 2000, carVolumePerHour: 2600, isDedicatedBRTLane: true },
  { sourceStopId: 'st-21', targetStopId: 'st-22', capacityVehPerHour: 2000, carVolumePerHour: 2400, isDedicatedBRTLane: true },
];

function toPair(s: string): [number, number] {
  const stop = STOP_BY_ID[s];
  return [stop.lng, stop.lat];
}

/** Raw haversine distance (km) between consecutive stops. */
const RAW_DISTANCES = LINK_SPECS.map((spec) =>
  distance(toPair(spec.sourceStopId), toPair(spec.targetStopId), {
    units: 'kilometers',
  }),
);

const RAW_TOTAL_KM = RAW_DISTANCES.reduce((a, b) => a + b, 0);

/** Normalization factor applied so Σ distanceKm === NOMINAL_ROUTE_KM. */
export const ROUTE_DISTANCE_NORMALIZATION = NOMINAL_ROUTE_KM / RAW_TOTAL_KM;

export const CORRIDOR_1_LINKS: CorridorLink[] = LINK_SPECS.map((spec, i) => ({
  id: `lnk-${String(i + 1).padStart(2, '0')}`,
  sourceStopId: spec.sourceStopId,
  targetStopId: spec.targetStopId,
  coordinates: [toPair(spec.sourceStopId), toPair(spec.targetStopId)],
  distanceKm: RAW_DISTANCES[i] * ROUTE_DISTANCE_NORMALIZATION,
  freeFlowSpeedKmh: SIM.FREE_FLOW_SPEED_KMH,
  capacityVehPerHour: spec.capacityVehPerHour,
  carVolumePerHour: spec.carVolumePerHour,
  isDedicatedBRTLane: spec.isDedicatedBRTLane,
}));

export const ROUTE_TOTAL_KM = CORRIDOR_1_LINKS.reduce((a, l) => a + l.distanceKm, 0);

export const LINK_BY_ID: Record<string, CorridorLink> = Object.fromEntries(
  CORRIDOR_1_LINKS.map((l) => [l.id, l]),
);
