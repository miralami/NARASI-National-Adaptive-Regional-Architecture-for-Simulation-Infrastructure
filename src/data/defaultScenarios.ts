/**
 * NARASI — Default policy scenarios.
 *
 * Baseline + 4 preset experiments (IMPLEMENTATION_MASTERPLAN §18 MUST HAVE).
 * Presets are one-click starting points for the policy laboratory.
 */

import type { PolicyScenario } from '../types/simulation';

export const DEFAULT_LEVERS = {
  headwayMinutes: 3.0,
  fleetSize: 60,
  electricBusRatio: 0.0,
  dedicatedLaneRatio: 0.85,
  feederConnectorActive: false,
  demandMultiplier: 1.0,
};

export const DEFAULT_SCENARIOS: PolicyScenario[] = [
  {
    id: 'baseline',
    name: 'Baseline (Current Operations)',
    description:
      'Standard Corridor 1 profile: 3-minute headway, 60 diesel buses, 85% dedicated right-of-way.',
    isBaseline: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    levers: { ...DEFAULT_LEVERS },
  },
  {
    id: 'preset-high-frequency',
    name: 'High-Frequency BRT',
    description:
      'Halve headway to 1.5 min with an expanded 90-bus fleet and active microtransit feeders.',
    isBaseline: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    levers: {
      headwayMinutes: 1.5,
      fleetSize: 90,
      electricBusRatio: 0.2,
      dedicatedLaneRatio: 0.85,
      feederConnectorActive: true,
      demandMultiplier: 1.0,
    },
  },
  {
    id: 'preset-electrification',
    name: '100% Electrification',
    description: 'Full fleet transition to electric buses (Java–Bali grid emissions factor).',
    isBaseline: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    levers: {
      headwayMinutes: 3.0,
      fleetSize: 60,
      electricBusRatio: 1.0,
      dedicatedLaneRatio: 0.85,
      feederConnectorActive: false,
      demandMultiplier: 1.0,
    },
  },
  {
    id: 'preset-row-enforcement',
    name: 'Dedicated ROW Enforcement',
    description: 'Enforce fully dedicated lanes through the Harmoni/Monas mixed-traffic bottlenecks.',
    isBaseline: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    levers: {
      headwayMinutes: 3.0,
      fleetSize: 60,
      electricBusRatio: 0.0,
      dedicatedLaneRatio: 1.0,
      feederConnectorActive: false,
      demandMultiplier: 1.0,
    },
  },
  {
    id: 'preset-demand-surge',
    name: 'Surge Demand Growth',
    description: '1.3× corridor demand served with tightened 2.5-min headway and feeder connectors.',
    isBaseline: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    levers: {
      headwayMinutes: 2.5,
      fleetSize: 80,
      electricBusRatio: 0.2,
      dedicatedLaneRatio: 0.85,
      feederConnectorActive: true,
      demandMultiplier: 1.3,
    },
  },
];
