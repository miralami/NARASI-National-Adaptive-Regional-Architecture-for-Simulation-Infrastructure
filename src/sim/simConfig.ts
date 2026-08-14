/**
 * NARASI — Centralized simulation configuration & model coefficients.
 *
 * IMPLEMENTATION_MASTERPLAN §10 requires that EVERY model parameter lives in
 * this single module. Zero magic numbers are scattered across the codebase.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MODELING DECISIONS (documented deviations / interpretations)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * D1 — Headline travel time (KPI-MOB-01) is the full §10.2 chain: in-vehicle
 *      time (routeLengthKm / runningSpeedKmh × 60) PLUS the stops × dwell term
 *      (22 stops × 0.5 min = 11 min). KPI-MOB-03 (commercial speed) is the
 *      EFFECTIVE commercial speed including dwell (= routeLength / travelTime).
 *      With the calibrated link data this reproduces the published §11
 *      baselines (45.1 min / 17.3 km/h) within ≈1.3% using only [SPEC]
 *      coefficients and the real stop geometry: running speed ≈22.5 km/h
 *      (34.7 min) + 11 min dwell = 45.7 min → 17.1 km/h effective. Earlier
 *      drafts excluded dwell; the published values are only consistent WITH
 *      the dwell term, so it is included.
 *
 * D2 — Dedicated right-of-way is applied PER-LINK (CorridorLink.
 *      isDedicatedBRTLane + congestion severity ordering), matching the
 *      CorridorLink schema in §14. The §10.2 global mixing term
 *      (ROW·v_free + (1−ROW)·v_car on every link) is mathematically incapable
 *      of reaching the published 17.3 km/h baseline (its floor is 38 km/h at
 *      ROW 0.85), so the per-link interpretation — which produces the
 *      calibrated baseline — was adopted. Enforcement upgrades the most
 *      congested mixed links first, keeping the lever transparent.
 *
 * D3 — CO₂ / operating-cost baselines published in §11 (14.8 t / IDR 142.5 M)
 *      are NOT reproducible from the §10 coefficient set (they yield ≈7.1 t /
 *      IDR 225.9 M). The §10 coefficients are authoritative here — they are
 *      the transparent mechanism — and §11's published magnitudes are treated
 *      as illustrative. Ranges used by the radar normalizer (§11) tolerate
 *      both magnitudes.
 *
 * D4 — Car/motorcycle split of private corridor trips is synthetic (no public
 *      source at prototype granularity): 45% car / 55% motorcycle, consistent
 *      with the §10.3 shifted-car fraction (0.45).
 *
 * All coefficients below are labeled with their source/status:
 *   [SPEC]  = verbatim from IMPLEMENTATION_MASTERPLAN
 *   [SYNTH] = calibrated synthetic prototype data (no public source at this
 *             granularity; consistent with the masterplan demonstration)
 *   [DERIVED] = derived from other constants at runtime
 */

export const SIM = {
  /* ── Corridor geometry & service [SPEC/DERIVED] ─────────────────── */
  ROUTE_LENGTH_KM: 13.0, // nominal, validated against link geometry at load
  OPERATING_HOURS: 16, // 05:00–21:00 service day
  DWELL_TIME_MIN: 0.5, // [SPEC] dwell per stop (see D1)
  FREE_FLOW_SPEED_KMH: 45.0, // [SPEC] §10.2
  MIN_LINK_SPEED_KMH: 5.0, // [SPEC] §20 clamp
  MAX_LINK_SPEED_KMH: 60.0, // [SPEC] §20 clamp

  /* ── Waiting time (§10.1) [SPEC] ─────────────────────────────────── */
  CONGESTION_PENALTY_COEFF: 0.6,
  MIN_WAIT_MIN: 0.5, // §20 clamp

  /* ── Demand & mode shift (§10.3) [SPEC] ──────────────────────────── */
  BASE_RIDERSHIP_TRIPS: 110_000, // calibrated baseline
  WAIT_ELASTICITY: 0.35,
  TRAVEL_TIME_ELASTICITY: 0.25,
  FEEDER_BONUS: 1.15,
  SHIFTED_CAR_FRACTION: 0.45,
  AVG_PRIVATE_TRIP_KM: 10.0, // [SPEC] §10.4
  /** Baseline corridor private trips — solved so that baseline mode share = 18.5% [DERIVED]. */
  BASE_PRIVATE_TRIPS: 0,
  /** Share of the non-transit private baseline that is car vs motorcycle [SYNTH] (D4). */
  PRIVATE_CAR_SHARE: 0.45,
  PRIVATE_MOTORCYCLE_SHARE: 0.55,

  /* ── Emissions (§10.4) [SPEC] ────────────────────────────────────── */
  DIESEL_CO2_KG_PER_KM: 0.850,
  EV_CO2_KG_PER_KM: 0.320, // Java–Bali grid factor
  CAR_CO2_KG_PER_KM: 0.170,

  /* ── Operating cost (§10.5) [SPEC] ───────────────────────────────── */
  DIESEL_COST_PER_KM_IDR: 18_500,
  EV_COST_PER_KM_IDR: 11_200,
  FLEET_FIXED_COST_IDR: 1_200_000,

  /* ── Catchment & equity (§10.6) [SPEC] ───────────────────────────── */
  BASE_CATCHMENT_POPULATION: 145_000,
  FEEDER_CATCHMENT_MULTIPLIER: 1.35,
  STOP_CATCHMENT_METERS: 400,
  FEEDER_RING_METERS: 700,

  /* ── Radar normalization (§11) [SPEC] ────────────────────────────── */
  RADAR: {
    MOBILITY_GOOD_MIN: 25, // travel time ≤ 25 min scores 100
    MOBILITY_BAD_MAX: 60, // travel time ≥ 60 min scores 0
    RIDERSHIP_CAP: 180_000,
    CO2_GOOD_MIN: 2,
    CO2_BAD_MAX: 25,
    COST_GOOD_MIN: 80,
    COST_BAD_MAX: 250,
    CATCHMENT_CAP: 220_000,
  },

  /* ── Speed color thresholds (§12.2) [SPEC] ───────────────────────── */
  SPEED_GOOD_KMH: 25,
  SPEED_MEDIUM_KMH: 15,

  /* ── Mode share baseline [SPEC] ──────────────────────────────────── */
  BASE_MODE_SHARE_PCT: 18.5,
} as const;

/** Baseline mode share must be > 0 for BASE_PRIVATE_TRIPS to resolve. */
export const DERIVED = (() => {
  const privateTrips =
    SIM.BASE_RIDERSHIP_TRIPS / (SIM.BASE_MODE_SHARE_PCT / 100) - SIM.BASE_RIDERSHIP_TRIPS;
  return { privateTrips };
})();
