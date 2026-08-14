/**
 * NARASI - Deterministic prototype simulation engine.
 *
 * Implements ITransportSimulator with the transparent, explainable formula
 * chain from IMPLEMENTATION_MASTERPLAN §10. Pure functions only - no side
 * effects, no randomness, <1 ms per run. Structurally replaceable by a future
 * SUMO/MATSim-backed implementation behind the same interface (§9).
 *
 * All coefficients live in simConfig.ts (see MODELING DECISIONS D1-D4 there).
 */

import type {
  CorridorBaseline,
  CorridorLink,
  ITransportSimulator,
  PolicyLevers,
  PolicyScenario,
  SimulationResult,
} from '../types/simulation';
import { SIM, DERIVED } from './simConfig';
import { CORRIDOR_1_LINKS, ROUTE_TOTAL_KM } from '../data/corridor1Links';
import { STOP_BY_ID } from '../data/corridor1Stops';
import { computeRadarScores } from './kpiCalculator';
import { generateInsight } from './insightGenerator';

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Congestion index per §10.2: CI_k = carVol * demandMult / capacity. */
function congestionIndex(link: CorridorLink, demandMultiplier: number): number {
  return (link.carVolumePerHour * demandMultiplier) / link.capacityVehPerHour;
}

/**
 * Per-link dedicated-lane fraction derived from the ROW enforcement lever.
 *
 * The lever selects the route length (km) that operates in a dedicated BRT
 * lane. Upgrade priority goes to the most congested mixed-traffic bottleneck
 * links first; when enforcement is reduced, the least congested dedicated
 * links are demoted first. Fractional dedication blends bus and car speeds on
 * the boundary link (segment-level generalization of §10.2's mixing term).
 */
function dedicatedFractions(links: CorridorLink[], lever: number): Map<string, number> {
  const totalKm = links.reduce((a, l) => a + l.distanceKm, 0);
  const targetKm = clamp(lever, 0, 1) * totalKm;

  const bottleneckLinks = links
    .filter((l) => !l.isDedicatedBRTLane)
    .sort(
      (a, b) =>
        b.carVolumePerHour / b.capacityVehPerHour - a.carVolumePerHour / a.capacityVehPerHour ||
        b.distanceKm - a.distanceKm,
    );
  const coreLinks = links
    .filter((l) => l.isDedicatedBRTLane)
    .sort(
      (a, b) =>
        a.carVolumePerHour / a.capacityVehPerHour - b.carVolumePerHour / b.capacityVehPerHour ||
        a.distanceKm - b.distanceKm,
    );

  const fractions = new Map<string, number>();
  links.forEach((l) => fractions.set(l.id, l.isDedicatedBRTLane ? 1 : 0));

  const baselineDedicatedKm = coreLinks.reduce((a, l) => a + l.distanceKm, 0);
  let remaining = targetKm - baselineDedicatedKm;

  if (remaining > 0) {
    // Upgrade bottleneck links (most congested first).
    for (const link of bottleneckLinks) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, link.distanceKm);
      fractions.set(link.id, take / link.distanceKm);
      remaining -= take;
    }
  } else if (remaining < 0) {
    // Demote core links (least congested first).
    remaining = -remaining;
    for (const link of coreLinks) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, link.distanceKm);
      fractions.set(link.id, 1 - take / link.distanceKm);
      remaining -= take;
    }
  }

  return fractions;
}

/** §10.2 link-level model -> commercial speed via harmonic travel time. */
function linkLevelModel(
  links: CorridorLink[],
  levers: PolicyLevers,
): {
  linkSpeeds: Record<string, number>;
  linkDedicatedFractions: Record<string, number>;
  commercialSpeedKmh: number;
  clamped: boolean;
} {
  const fractions = dedicatedFractions(links, levers.dedicatedLaneRatio);
  const linkSpeeds: Record<string, number> = {};
  const linkDedicatedFractions: Record<string, number> = {};
  let clamped = false;

  let timeHours = 0;
  let lengthKm = 0;

  for (const link of links) {
    const ci = congestionIndex(link, levers.demandMultiplier);
    const rawCarSpeed = SIM.FREE_FLOW_SPEED_KMH / (1 + 0.15 * Math.pow(ci, 4));
    const carSpeed = clamp(rawCarSpeed, SIM.MIN_LINK_SPEED_KMH, SIM.MAX_LINK_SPEED_KMH);
    if (carSpeed !== rawCarSpeed) clamped = true;

    const frac = fractions.get(link.id) ?? 0;
    const busSpeed = clamp(
      frac * SIM.FREE_FLOW_SPEED_KMH + (1 - frac) * carSpeed,
      SIM.MIN_LINK_SPEED_KMH,
      SIM.MAX_LINK_SPEED_KMH,
    );

    linkSpeeds[link.id] = busSpeed;
    linkDedicatedFractions[link.id] = frac;
    timeHours += link.distanceKm / busSpeed;
    lengthKm += link.distanceKm;
  }

  return { linkSpeeds, linkDedicatedFractions, commercialSpeedKmh: lengthKm / timeHours, clamped };
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

/**
 * Core deterministic pipeline. Exposed separately so the baseline result can
 * be bootstrapped with its own KPIs as reference (self-comparison → neutral
 * insight). Public callers should use `prototypeEngine.runSimulation`.
 */
export function computeResult(
  scenario: PolicyScenario,
  baseKpis?: SimulationResult['kpis'],
): SimulationResult {
  const levers = scenario.levers;
  const links = CORRIDOR_1_LINKS;
  const base = baseKpis ?? null;

    /* 1 - Waiting time (§10.1) */
    const baseWait = levers.headwayMinutes / 2;
    const congestionPenalty =
      Math.max(0, baseWait * (1 - levers.dedicatedLaneRatio) * SIM.CONGESTION_PENALTY_COEFF);
    const avgWaitTimeMin = Math.max(SIM.MIN_WAIT_MIN, baseWait + congestionPenalty);

    /* 2 - Link speeds & travel time (§10.2, D1) */
    const {
      linkSpeeds,
      linkDedicatedFractions,
      commercialSpeedKmh: runningSpeedKmh,
      clamped,
    } = linkLevelModel(links, levers);
    const stopCount = Object.keys(STOP_BY_ID).length;
    const avgTravelTimeMin =
      (ROUTE_TOTAL_KM / runningSpeedKmh) * 60 + stopCount * SIM.DWELL_TIME_MIN;
    /* Effective commercial speed incl. dwell (§11: 13.0 km / 45.1 min ≈ 17.3). */
    const commercialSpeedKmh = ROUTE_TOTAL_KM / (avgTravelTimeMin / 60);

    /* 3 - Elasticity & mode shift (§10.3) */
    const baseWaitRef = base?.avgWaitTimeMin ?? avgWaitTimeMin;
    const baseTravelRef = base?.avgTravelTimeMin ?? avgTravelTimeMin;
    const serviceIndex =
      Math.pow(baseWaitRef / avgWaitTimeMin, SIM.WAIT_ELASTICITY) *
      Math.pow(baseTravelRef / avgTravelTimeMin, SIM.TRAVEL_TIME_ELASTICITY) *
      (levers.feederConnectorActive ? SIM.FEEDER_BONUS : 1.0);
    const dailyRidership = SIM.BASE_RIDERSHIP_TRIPS * levers.demandMultiplier * serviceIndex;
    const shiftedCarTrips = Math.max(0, (dailyRidership - SIM.BASE_RIDERSHIP_TRIPS) * SIM.SHIFTED_CAR_FRACTION);

    /* 4 - VKT & CO2 (§10.4) */
    const busTripsPerDay = ((SIM.OPERATING_HOURS * 60) / levers.headwayMinutes) * 2;
    const busVkt = busTripsPerDay * ROUTE_TOTAL_KM;
    const dieselVkt = busVkt * (1 - levers.electricBusRatio);
    const evVkt = busVkt * levers.electricBusRatio;
    const savedCarVkt = shiftedCarTrips * SIM.AVG_PRIVATE_TRIP_KM;
    const busCo2Kg = dieselVkt * SIM.DIESEL_CO2_KG_PER_KM + evVkt * SIM.EV_CO2_KG_PER_KM;
    const carCo2SavedKg = savedCarVkt * SIM.CAR_CO2_KG_PER_KM;
    const co2EmissionsTonnes = Math.max(0, (busCo2Kg - carCo2SavedKg) / 1000);

    /* 5 - Operating cost (§10.5) */
    const operationalCostIdrMillion =
      (dieselVkt * SIM.DIESEL_COST_PER_KM_IDR +
        evVkt * SIM.EV_COST_PER_KM_IDR +
        levers.fleetSize * SIM.FLEET_FIXED_COST_IDR) /
      1_000_000;

    /* 6 - Catchment & equity (§10.6) */
    const catchmentPopulation = Math.round(
      SIM.BASE_CATCHMENT_POPULATION *
        (levers.feederConnectorActive ? SIM.FEEDER_CATCHMENT_MULTIPLIER : 1.0),
    );

    /* 7 - Mode share (baseline calibrated to 18.5%) */
    const privateRemaining = Math.max(0, DERIVED.privateTrips - shiftedCarTrips);
    const totalTrips = dailyRidership + privateRemaining;
    const transitModeSharePct = (dailyRidership / totalTrips) * 100;
    const carModeTrips = privateRemaining * SIM.PRIVATE_CAR_SHARE;
    const motorcycleModeTrips = privateRemaining * SIM.PRIVATE_MOTORCYCLE_SHARE;

    const kpis = {
      avgTravelTimeMin,
      avgWaitTimeMin,
      commercialSpeedKmh,
      dailyRidership,
      transitModeSharePct,
      co2EmissionsTonnes,
      operationalCostIdrMillion,
      catchmentPopulation,
    };

    const radarScores = computeRadarScores(kpis);
    const insight = generateInsight(scenario, kpis, base ?? kpis, shiftedCarTrips);

    /* Stop-level waiting times (uniform formula; §10.1) */
    const stopWaitTimes: Record<string, number> = {};
    for (const stopId of Object.keys(STOP_BY_ID)) {
      stopWaitTimes[stopId] = avgWaitTimeMin;
    }

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      computedAt: new Date().toISOString(),
      kpis,
      radarScores,
      linkSpeeds,
      linkDedicatedFractions,
      stopWaitTimes,
      insight,
      modeSplit: {
        transit: dailyRidership,
        car: carModeTrips,
        motorcycle: motorcycleModeTrips,
      },
      clamped,
    };
}

export const prototypeEngine: ITransportSimulator = {
  runSimulation(baseline: CorridorBaseline, scenario: PolicyScenario): SimulationResult {
    return computeResult(scenario, baseline.result.kpis);
  },
};
