/**
 * NARASI - Engine unit tests (deterministic, calibrated baseline).
 *
 * Covers: baseline calibration (§11), determinism, lever sensitivity,
 * clamping safety, radar ranges, and direction-aware deltas.
 */

import { describe, expect, it } from 'vitest';
import { computeResult, prototypeEngine } from './prototypeEngine';
import { computeDeltas, computeRadarScores } from './kpiCalculator';
import { DEFAULT_SCENARIOS, DEFAULT_LEVERS } from '../data/defaultScenarios';
import { ROUTE_TOTAL_KM } from '../data/corridor1Links';
import { SIM } from './simConfig';
import type { PolicyLevers, PolicyScenario } from '../types/simulation';

const BASELINE = DEFAULT_SCENARIOS.find((s) => s.isBaseline)!;
const BASELINE_RESULT = computeResult(BASELINE);

function scenario(levers: Partial<PolicyLevers>, id = 'test'): PolicyScenario {
  return {
    id,
    name: `Test ${id}`,
    description: 'unit test scenario',
    isBaseline: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    levers: { ...DEFAULT_LEVERS, ...levers },
  };
}

describe('baseline calibration (IMPLEMENTATION_MASTERPLAN §11)', () => {
  it('route total is the nominal 13.0 km', () => {
    expect(ROUTE_TOTAL_KM).toBeCloseTo(13.0, 6);
  });

  it('commercial speed is ~17.3 km/h (effective, incl. dwell)', () => {
    expect(BASELINE_RESULT.kpis.commercialSpeedKmh).toBeGreaterThan(16.5);
    expect(BASELINE_RESULT.kpis.commercialSpeedKmh).toBeLessThan(18.0);
  });

  it('headline travel time is ~45 min (running + dwell, D1)', () => {
    expect(BASELINE_RESULT.kpis.avgTravelTimeMin).toBeGreaterThan(44);
    expect(BASELINE_RESULT.kpis.avgTravelTimeMin).toBeLessThan(47);
  });

  it('ridership is ~110,000 trips/day', () => {
    expect(BASELINE_RESULT.kpis.dailyRidership).toBeCloseTo(110_000, 0);
  });

  it('transit mode share is ~18.5%', () => {
    expect(BASELINE_RESULT.kpis.transitModeSharePct).toBeGreaterThan(18.0);
    expect(BASELINE_RESULT.kpis.transitModeSharePct).toBeLessThan(19.0);
  });

  it('baseline wait time matches §10.1 formula', () => {
    const expected = Math.max(
      SIM.MIN_WAIT_MIN,
      DEFAULT_LEVERS.headwayMinutes / 2 +
        (DEFAULT_LEVERS.headwayMinutes / 2) * (1 - DEFAULT_LEVERS.dedicatedLaneRatio) * SIM.CONGESTION_PENALTY_COEFF,
    );
    expect(BASELINE_RESULT.kpis.avgWaitTimeMin).toBeCloseTo(expected, 6);
  });

  it('catchment equals the 145,000 baseline without feeders', () => {
    expect(BASELINE_RESULT.kpis.catchmentPopulation).toBe(SIM.BASE_CATCHMENT_POPULATION);
  });
});

describe('determinism', () => {
  it('identical inputs produce identical KPIs and link speeds', () => {
    const a = computeResult(BASELINE);
    const b = computeResult(BASELINE);
    expect(a.kpis).toEqual(b.kpis);
    expect(a.linkSpeeds).toEqual(b.linkSpeeds);
    expect(a.radarScores).toEqual(b.radarScores);
  });

  it('ITransportSimulator facade matches computeResult', () => {
    const viaFacade = prototypeEngine.runSimulation(
      { scenario: BASELINE, result: BASELINE_RESULT },
      BASELINE,
    );
    expect(viaFacade.kpis).toEqual(BASELINE_RESULT.kpis);
  });
});

describe('lever sensitivity (each lever moves the right KPI)', () => {
  it('shorter headway reduces wait time and grows ridership', () => {
    const r = computeResult(scenario({ headwayMinutes: 1.5 }), BASELINE_RESULT.kpis);
    expect(r.kpis.avgWaitTimeMin).toBeLessThan(BASELINE_RESULT.kpis.avgWaitTimeMin);
    expect(r.kpis.dailyRidership).toBeGreaterThan(BASELINE_RESULT.kpis.dailyRidership);
  });

  it('full electrification cuts CO2 while keeping ridership', () => {
    const r = computeResult(scenario({ electricBusRatio: 1.0 }), BASELINE_RESULT.kpis);
    expect(r.kpis.co2EmissionsTonnes).toBeLessThan(BASELINE_RESULT.kpis.co2EmissionsTonnes);
    expect(r.kpis.dailyRidership).toBeCloseTo(BASELINE_RESULT.kpis.dailyRidership, 0);
  });

  it('ROW enforcement to 100% raises commercial speed (bottleneck upgrade)', () => {
    const r = computeResult(scenario({ dedicatedLaneRatio: 1.0 }), BASELINE_RESULT.kpis);
    expect(r.kpis.commercialSpeedKmh).toBeGreaterThan(BASELINE_RESULT.kpis.commercialSpeedKmh);
    expect(r.linkDedicatedFractions).not.toEqual(BASELINE_RESULT.linkDedicatedFractions);
  });

  it('feeders extend catchment to the 1.35× multiplier', () => {
    const r = computeResult(scenario({ feederConnectorActive: true }), BASELINE_RESULT.kpis);
    expect(r.kpis.catchmentPopulation).toBe(Math.round(SIM.BASE_CATCHMENT_POPULATION * SIM.FEEDER_CATCHMENT_MULTIPLIER));
  });

  it('demand surge raises ridership and mode share', () => {
    const r = computeResult(scenario({ demandMultiplier: 1.3, headwayMinutes: 2.5 }), BASELINE_RESULT.kpis);
    expect(r.kpis.dailyRidership).toBeGreaterThan(BASELINE_RESULT.kpis.dailyRidership);
    expect(r.kpis.transitModeSharePct).toBeGreaterThan(BASELINE_RESULT.kpis.transitModeSharePct);
  });
});

describe('safety clamps (§20)', () => {
  it('link speeds stay within [MIN, MAX] under extreme demand', () => {
    const r = computeResult(scenario({ demandMultiplier: 1.5 }), BASELINE_RESULT.kpis);
    for (const v of Object.values(r.linkSpeeds)) {
      expect(v).toBeGreaterThanOrEqual(SIM.MIN_LINK_SPEED_KMH - 1e-9);
      expect(v).toBeLessThanOrEqual(SIM.MAX_LINK_SPEED_KMH + 1e-9);
    }
    expect(r.clamped).toBe(true);
  });

  it('CO2 never goes negative even with heavy mode shift', () => {
    const r = computeResult(
      scenario({ electricBusRatio: 1.0, demandMultiplier: 1.5, headwayMinutes: 1.5 }),
      BASELINE_RESULT.kpis,
    );
    expect(r.kpis.co2EmissionsTonnes).toBeGreaterThanOrEqual(0);
  });

  it('radar scores are always within 0..100', () => {
    const extremes = [
      scenario({ headwayMinutes: 15, demandMultiplier: 0.8 }),
      scenario({ headwayMinutes: 1, demandMultiplier: 1.5, electricBusRatio: 1, feederConnectorActive: true }),
    ];
    for (const s of extremes) {
      const scores = computeRadarScores(computeResult(s, BASELINE_RESULT.kpis).kpis);
      for (const v of Object.values(scores)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('direction-aware deltas', () => {
  it('baseline vs itself has zero deltas', () => {
    const deltas = computeDeltas(BASELINE_RESULT.kpis, BASELINE_RESULT.kpis);
    for (const d of deltas) {
      expect(Math.abs(d.deltaPct ?? 0)).toBeLessThan(1e-9);
      expect(d.isImprovement).toBeNull();
    }
  });

  it('travel-time reduction flags as improvement for a lower-is-better KPI', () => {
    const better = computeResult(scenario({ dedicatedLaneRatio: 1.0 }), BASELINE_RESULT.kpis);
    const deltas = computeDeltas(BASELINE_RESULT.kpis, better.kpis);
    const travel = deltas.find((d) => d.kpi.id === 'KPI-MOB-01')!;
    expect(travel.deltaPct).toBeLessThan(0);
    expect(travel.isImprovement).toBe(true);
  });

  it('all preset scenarios compute without crashing', () => {
    for (const s of DEFAULT_SCENARIOS) {
      const r = computeResult(s, BASELINE_RESULT.kpis);
      expect(r.kpis.dailyRidership).toBeGreaterThan(0);
      expect(Object.keys(r.linkSpeeds)).toHaveLength(21);
      expect(Object.keys(r.stopWaitTimes)).toHaveLength(22);
    }
  });
});
