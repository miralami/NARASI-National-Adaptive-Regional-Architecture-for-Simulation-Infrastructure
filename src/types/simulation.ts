/**
 * NARASI — Core simulation & domain type definitions.
 * Mirrors IMPLEMENTATION_MASTERPLAN §9, §10, §14.
 */

/* ------------------------------------------------------------------ */
/* Transit network domain                                              */
/* ------------------------------------------------------------------ */

export interface TransitStop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  /** Major interchange / transfer hub (MRT, KRL, or multi-corridor). */
  isTransferHub: boolean;
  /** Feeder-enabled hub (microtransit / angkot connectors). */
  isFeederHub: boolean;
  /** Calibrated baseline daily boardings at this stop. */
  baselineBoardings: number;
  /** Calibrated baseline population within 400m walking catchment. */
  catchmentPopulation: number;
}

export interface CorridorLink {
  id: string;
  sourceStopId: string;
  targetStopId: string;
  /** GeoJSON LineString coordinates (lng, lat). */
  coordinates: [number, number][];
  /** Route distance (km) — derived from geometry via turf. */
  distanceKm: number;
  /** Free-flow speed (km/h) for the bus lane. */
  freeFlowSpeedKmh: number;
  /** Lane capacity (veh/h) for the BPR congestion formula. */
  capacityVehPerHour: number;
  /** Synthetic baseline hourly car volume (prototype data). */
  carVolumePerHour: number;
  /** Baseline dedicated-BRT annotation (matches 85% ROW default). */
  isDedicatedBRTLane: boolean;
}

/* ------------------------------------------------------------------ */
/* Policy model                                                        */
/* ------------------------------------------------------------------ */

export interface PolicyLevers {
  /** Service headway in minutes (1.0–15.0, step 0.5). */
  headwayMinutes: number;
  /** Active bus fleet size (20–120, step 5). */
  fleetSize: number;
  /** Share of fleet that is electric (0.0–1.0, step 0.1). */
  electricBusRatio: number;
  /** Dedicated right-of-way enforcement (0.5–1.0, step 0.05). */
  dedicatedLaneRatio: number;
  /** Microtransit feeder connectors enabled. */
  feederConnectorActive: boolean;
  /** Corridor demand multiplier (0.8–1.5, step 0.05). */
  demandMultiplier: number;
}

export interface PolicyScenario {
  id: string;
  name: string;
  description: string;
  isBaseline: boolean;
  createdAt: string;
  levers: PolicyLevers;
}

/* ------------------------------------------------------------------ */
/* Simulation results                                                  */
/* ------------------------------------------------------------------ */

export type KpiId =
  | 'KPI-MOB-01'
  | 'KPI-MOB-02'
  | 'KPI-MOB-03'
  | 'KPI-TRN-01'
  | 'KPI-TRN-02'
  | 'KPI-ENV-01'
  | 'KPI-ECO-01'
  | 'KPI-EQT-01';

export interface KpiValues {
  avgTravelTimeMin: number;
  avgWaitTimeMin: number;
  commercialSpeedKmh: number;
  dailyRidership: number;
  transitModeSharePct: number;
  co2EmissionsTonnes: number;
  operationalCostIdrMillion: number;
  catchmentPopulation: number;
}

export interface RadarScores {
  mobility: number;
  adoption: number;
  environment: number;
  economy: number;
  access: number;
}

export type Verdict =
  | 'HIGHLY_EFFECTIVE'
  | 'TRADE_OFF_HEAVY'
  | 'COST_INEFFECTIVE'
  | 'NEUTRAL';

export interface PolicyInsight {
  headline: string;
  verdict: Verdict;
  keyTakeaways: string[];
  recommendation: string;
}

export interface SimulationResult {
  scenarioId: string;
  scenarioName: string;
  computedAt: string;
  kpis: KpiValues;
  radarScores: RadarScores;
  /** Link id → commercial bus speed (km/h). */
  linkSpeeds: Record<string, number>;
  /** Link id → dedicated-lane fraction applied by the ROW lever. */
  linkDedicatedFractions: Record<string, number>;
  /** Stop id → average waiting time (min). */
  stopWaitTimes: Record<string, number>;
  insight: PolicyInsight;
  /** Modal share split (trips/day) for the mode share chart. */
  modeSplit: {
    transit: number;
    car: number;
    motorcycle: number;
  };
  /** True when any modeled coefficient had to be clamped. */
  clamped: boolean;
}

/** Baseline wrapper: the reference scenario plus its precomputed result. */
export interface CorridorBaseline {
  scenario: PolicyScenario;
  result: SimulationResult;
}

export interface ITransportSimulator {
  /**
   * Runs the deterministic simulation pipeline for a policy scenario against
   * a corridor baseline. Target execution time < 50 ms (client-side).
   */
  runSimulation(baseline: CorridorBaseline, scenario: PolicyScenario): SimulationResult;
}

/* ------------------------------------------------------------------ */
/* UI / comparison helpers                                             */
/* ------------------------------------------------------------------ */

export type ViewMode = 'lab' | 'compare' | 'maturity';

export type KpiDirection = 'lower_is_better' | 'higher_is_better';

export interface KpiMeta {
  id: KpiId;
  label: string;
  shortLabel: string;
  dimension: string;
  unit: string;
  direction: KpiDirection;
  baseline: number;
}

export interface DeltaRow {
  kpi: KpiMeta;
  /** Absolute scenario value. */
  value: number;
  /** Absolute percentage change vs baseline (can be ±Infinity). */
  deltaPct: number | null;
  /** True when the change is an improvement for this metric direction. */
  isImprovement: boolean | null;
}

export interface DraftState {
  scenario: PolicyScenario;
  result: SimulationResult;
  deltas: DeltaRow[];
  /** True when draft levers differ from the last committed scenario. */
  isDirty: boolean;
}

/** KPI → KPI-id lookup for stable ordering everywhere. */
export const KPI_ORDER: KpiId[] = [
  'KPI-MOB-01',
  'KPI-MOB-02',
  'KPI-MOB-03',
  'KPI-TRN-01',
  'KPI-TRN-02',
  'KPI-ENV-01',
  'KPI-ECO-01',
  'KPI-EQT-01',
];
