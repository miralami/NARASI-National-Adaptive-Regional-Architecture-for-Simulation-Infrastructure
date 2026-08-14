/**
 * NARASI - KPI metadata, radar scoring and delta computation.
 *
 * Radar normalization formulas are verbatim from IMPLEMENTATION_MASTERPLAN
 * §11. Deltas are direction-aware (an improvement is green, an adverse change
 * is red, regardless of whether "higher" or "lower" is better).
 */

import type {
  DeltaRow,
  KpiId,
  KpiMeta,
  KpiValues,
  RadarScores,
} from '../types/simulation';
import { KPI_ORDER } from '../types/simulation';
import { SIM } from './simConfig';

export const KPI_META: Record<KpiId, KpiMeta> = {
  'KPI-MOB-01': {
    id: 'KPI-MOB-01',
    label: 'Average Travel Time',
    shortLabel: 'Travel Time',
    dimension: 'Mobility',
    unit: 'min',
    direction: 'lower_is_better',
    baseline: 0,
  },
  'KPI-MOB-02': {
    id: 'KPI-MOB-02',
    label: 'Average Wait Time',
    shortLabel: 'Wait Time',
    dimension: 'Mobility',
    unit: 'min',
    direction: 'lower_is_better',
    baseline: 0,
  },
  'KPI-MOB-03': {
    id: 'KPI-MOB-03',
    label: 'Commercial Speed',
    shortLabel: 'Speed',
    dimension: 'Mobility',
    unit: 'km/h',
    direction: 'higher_is_better',
    baseline: 0,
  },
  'KPI-TRN-01': {
    id: 'KPI-TRN-01',
    label: 'Daily Ridership',
    shortLabel: 'Ridership',
    dimension: 'Public Transport',
    unit: 'trips/day',
    direction: 'higher_is_better',
    baseline: 0,
  },
  'KPI-TRN-02': {
    id: 'KPI-TRN-02',
    label: 'Transit Mode Share',
    shortLabel: 'Mode Share',
    dimension: 'Public Transport',
    unit: '%',
    direction: 'higher_is_better',
    baseline: 0,
  },
  'KPI-ENV-01': {
    id: 'KPI-ENV-01',
    label: 'Net Daily CO2 Emissions',
    shortLabel: 'CO2',
    dimension: 'Environment',
    unit: 't CO2/day',
    direction: 'lower_is_better',
    baseline: 0,
  },
  'KPI-ECO-01': {
    id: 'KPI-ECO-01',
    label: 'Daily Operating Cost',
    shortLabel: 'Op. Cost',
    dimension: 'Economics',
    unit: 'IDR M/day',
    direction: 'lower_is_better',
    baseline: 0,
  },
  'KPI-EQT-01': {
    id: 'KPI-EQT-01',
    label: 'Catchment Population',
    shortLabel: 'Catchment',
    dimension: 'Equity',
    unit: 'people',
    direction: 'higher_is_better',
    baseline: 0,
  },
};

const kpiValue = (k: KpiValues, id: KpiId): number => {
  switch (id) {
    case 'KPI-MOB-01': return k.avgTravelTimeMin;
    case 'KPI-MOB-02': return k.avgWaitTimeMin;
    case 'KPI-MOB-03': return k.commercialSpeedKmh;
    case 'KPI-TRN-01': return k.dailyRidership;
    case 'KPI-TRN-02': return k.transitModeSharePct;
    case 'KPI-ENV-01': return k.co2EmissionsTonnes;
    case 'KPI-ECO-01': return k.operationalCostIdrMillion;
    case 'KPI-EQT-01': return k.catchmentPopulation;
  }
};

/** Multi-objective radar normalization (§11) - 0..100 per dimension. */
export function computeRadarScores(k: KpiValues): RadarScores {
  const { RADAR } = SIM;
  const mobility = clampScore(((RADAR.MOBILITY_BAD_MAX - k.avgTravelTimeMin) /
    (RADAR.MOBILITY_BAD_MAX - RADAR.MOBILITY_GOOD_MIN)) * 100);
  const adoption = clampScore((k.dailyRidership / RADAR.RIDERSHIP_CAP) * 100);
  const environment = clampScore(((RADAR.CO2_BAD_MAX - k.co2EmissionsTonnes) /
    (RADAR.CO2_BAD_MAX - RADAR.CO2_GOOD_MIN)) * 100);
  const economy = clampScore(((RADAR.COST_BAD_MAX - k.operationalCostIdrMillion) /
    (RADAR.COST_BAD_MAX - RADAR.COST_GOOD_MIN)) * 100);
  const access = clampScore((k.catchmentPopulation / RADAR.CATCHMENT_CAP) * 100);
  return { mobility, adoption, environment, economy, access };
}

function clampScore(v: number): number {
  return Math.min(100, Math.max(0, v));
}

/** Direction-aware delta rows for a scenario vs the baseline result. */
export function computeDeltas(baseline: KpiValues, scenario: KpiValues): DeltaRow[] {
  return KPI_ORDER.map((id) => {
    const meta = { ...KPI_META[id], baseline: kpiValue(baseline, id) };
    const value = kpiValue(scenario, id);
    const base = meta.baseline;
    const deltaPct = base === 0 ? null : ((value - base) / base) * 100;
    let isImprovement: boolean | null = null;
    if (deltaPct !== null && deltaPct !== 0) {
      isImprovement = meta.direction === 'lower_is_better' ? deltaPct < 0 : deltaPct > 0;
    }
    return { kpi: meta, value, deltaPct, isImprovement };
  });
}
