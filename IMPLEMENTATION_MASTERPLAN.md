# IMPLEMENTATION MASTERPLAN — NARASI PROTOTYPE
**National Adaptive Regional Architecture for Simulation Infrastructure**
*Virtual Mobility Policy Laboratory Proof-of-Concept*

---

## 1. Executive Summary

This document is the authoritative, synthesized implementation specification for the **NARASI Prototype**. It resolves and unifies two prior proposals (`pro3.1.md` and `flash3.6.md`) into a single, concrete engineering blueprint for the next coding agent.

NARASI is the proposed **National Adaptive Regional Architecture for Simulation Infrastructure** described in `plan.md`. Its core vision is a federated **Progressive Urban Mobility Digital Twin framework for Indonesia** that allows regions—from data-limited areas to highly connected smart cities—to virtually experiment with, simulate, evaluate, and compare transportation policies before physical implementation.

### Key Architectural Resolutions
1. **Scope & Execution Environment**: A 100% client-side Single Page Application (SPA) built with **Vite + React + TypeScript + MapLibre GL JS + Deck.gl + Recharts + Zustand + Tailwind CSS**. Zero server infrastructure, zero database dependencies, zero authentication setup required for the prototype.
2. **Demonstration Environment**: **TransJakarta Corridor 1 (Blok M $\leftrightarrow$ Kota, ~13 km, 22 stations)**. It is the only corridor in Indonesia with open GTFS feed structures, public BPS ridership figures, and PTv2 OpenStreetMap mapping.
3. **Simulation Approach**: A **transparent, explainable, deterministic client-side simulation engine** housed behind an extensible `ITransportSimulator` interface. Avoids opaque multi-step stochastic assignment while providing realistic, immediate responses to policy lever adjustments (<50ms calculation time).
4. **Policy Laboratory Focus**: The application is designed as a **Policy Experimentation Environment**, not a generic GIS viewer or administrative dashboard. It features spatial delta heatmaps, multi-objective trade-off radar charts, side-by-side scenario comparisons, and an automated **Policy Insight Layer**.

---

## 2. Relationship to `plan.md`

`plan.md` defines the long-term national architecture and governance model. The prototype is a focused, high-conviction proof-of-concept.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 LONG-TERM VISION (plan.md)                             │
│   National Federated Progressive Digital Twin Infrastructure for Indonesian Cities     │
│   Level 1 (Spatial) ──► Level 2 (Operational) ──► Level 3 (Dynamic) ──► Level 4 (Predictive) │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PROTOTYPE SCOPE (This Masterplan)                        │
│   Virtual Mobility Policy Laboratory Proof-of-Concept                                 │
│   Corridor Focus: TransJakarta Corridor 1 (Blok M - Kota)                              │
│   Demonstrates: Baseline ──► Scenario ──► Sim ──► KPIs ──► Comparison ──► Policy Insight  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Principles Maintained from `plan.md`
- **Heterogeneous Data Maturity**: The system explicitly acknowledges that Indonesian cities differ in digital readiness. The prototype visibly implements Level 2 (Operational Twin) capabilities for Jakarta while featuring a **Progressive Digital Twin Diagram** explaining how lower-maturity regions start at Level 1 and evolve over time.
- **Multi-Objective Evaluation**: Rejects single "magic scores." Surfaces transparent trade-offs across Mobility, Public Transport, Environment, Economics, and Equity.
- **Evidence Over Assumptions**: Replaces physical policy trial-and-error with virtual experimentation.

---

## 3. Prototype Objective & Implementation North Star

### Implementation North Star
> **A user can open NARASI, inspect the TransJakarta Corridor 1 baseline, modify a transport policy variable (such as headway, fleet electrification, right-of-way enforcement, or feeder integration), run the simulation instantly, observe spatial and numerical changes, compare scenarios side-by-side on a multi-objective radar chart, and receive a clear, evidence-based policy insight explaining the trade-offs.**

### Core Thesis Being Proven
1. Transportation policies can be tested virtually in a browser before physical deployment.
2. Complex multi-objective trade-offs (e.g., faster travel time vs. higher operating cost vs. lower emissions) can be presented clearly to non-technical policy decisions-makers.
3. A Progressive Digital Twin architecture allows data-limited cities to participate in evidence-based planning.

---

## 4. Target User & Core Use Case

### Primary User Persona
**Regional Transport Planner / Policy Analyst** (e.g., Dishub DKI Jakarta official, Bappenas transport strategist, or regional urban planning consultant).
- **Goal**: Evaluate proposed public transport interventions and present evidence-based recommendations to municipal decision-makers.
- **Pain Point**: Physical policy trials (changing routes, buying EV fleets, reallocating lanes) are expensive, disruptive, and politically risky if they fail.

### Primary Use Case Scenario
A planner wants to evaluate whether reducing headway on Corridor 1 from 3.0 minutes to 1.5 minutes and electrifying 100% of the fleet justifies the increased municipal operational budget. They use NARASI to simulate the policy, compare it against the baseline, and generate an executive trade-off summary.

---

## 5. Demonstration Environment Specification

### Selected Corridor: TransJakarta Corridor 1 (Blok M $\leftrightarrow$ Kota)
- **Geometry**: ~13.0 km north-south arterial axis connecting South Jakarta (Blok M) to Central Jakarta (Monas, Harmoni, Bundaran HI) and North/West Jakarta (Kota).
- **Stops**: 22 BRT shelters (including major hubs: Blok M, Dukuh Atas, Bundaran HI, Harmoni, Monas, Kota).
- **Ridership**: ~110,000 daily passenger trips (scaled baseline representation).

```
[Blok M Hub] ═══ (South Corridor) ═══ [Dukuh Atas / MRT Hub] ═══ [Bundaran HI]
                                                                        ║
[Jakarta Kota / KRL Hub] ═══ [Monas] ═══ [Harmoni Interchange] ═════════╝
```

### Why This Corridor?
1. **Data Availability**: Only Indonesian transit corridor with standardized GTFS structures, public BPS ridership figures, and PTv2-validated OpenStreetMap geometries.
2. **Policy Relevance**: Represents Indonesia's busiest BRT line, intersecting MRT Jakarta (Dukuh Atas) and KRL Commuterline (Kota).
3. **Clear Bottlenecks**: Combines dedicated BRT lanes (85% of route) with mixed-traffic bottlenecks near Harmoni/Monas (15%), allowing realistic right-of-way policy simulations.

---

## 6. NARASI Policy Experimentation Loop

The core UX of NARASI follows a 6-step loop:

```
  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
  │ 1. SELECT        │ ───► │ 2. CONFIGURE     │ ───► │ 3. RUN           │
  │    BASELINE      │      │    POLICY LEVERS │      │    SIMULATION    │
  └──────────────────┘      └──────────────────┘      └─────────┬────────┘
                                                                │
  ┌──────────────────┐      ┌──────────────────┐                │
  │ 6. DERIVE POLICY │ ◄─── │ 5. COMPARE       │ ◄──────────────┘
  │    INSIGHT       │      │    SCENARIOS     │ 4. VIEW KPIS & SPATIAL DELTAS
  └──────────────────┘      └──────────────────┘
```

1. **Select Baseline**: Load Corridor 1 standard operational profile (3-min headway, 60 diesel buses, 85% dedicated lane).
2. **Configure Policy Levers**: Adjust headway sliders, fleet EV mix %, ROW enforcement, or feeder connectors.
3. **Run Simulation**: Trigger instant (<50ms) client-side re-calculation.
4. **View KPIs & Spatial Deltas**: Inspect updated metric cards, link speed heatmaps, and stop wait-time indicators.
5. **Compare Scenarios**: Overlay active scenario vs. baseline or alternate scenarios on a multi-objective radar chart and side-by-side delta table.
6. **Derive Policy Insight**: Read the generated **Policy Insight Card** summarizing net trade-offs (e.g., "High-Frequency Policy: Travel time -14%, Ridership +18%, Operating Cost +40%").

---

## 7. Product Experience & Visual Direction

### Visual Style: "Policy Laboratory"
The application must feel like an authoritative, high-tech policy command center—not a generic SaaS admin dashboard or student project.

- **Theme**: Dark Slate base (`#0F172A`), dark slate cards (`#1E293B`), subtle borders (`#334155`).
- **Accent Color Palette**:
  - **Electric Cyan (`#06B6D4`)**: Primary brand accent, Baseline indicators.
  - **Emerald Green (`#10B981`)**: Scenario A / Positive delta (`▲ +12%`).
  - **Amber Warm (`#F59E0B`)**: Scenario B / Warning delta.
  - **Crimson Red (`#EF4444`)**: Congestion bottleneck / Negative delta (`▼ -8%`).
  - **Violet Glow (`#8B5CF6`)**: Electric Fleet / Equity indicator.
- **Typography**:
  - **UI / Headings**: Clean, technical sans-serif (`Inter`, system-ui).
  - **Data / Metrics / Numbers**: Crisp monospace font (`JetBrains Mono`, `Fira Code`, or `ui-monospace`).
- **Map Aesthetics**: Dark basemap (CARTO Dark Matter / Positron) with glowing neon vector overlays for routes, animated flow particles, and translucent stop buffers.
- **Panel Finish**: Sleek glassmorphism (`backdrop-blur-md`, `bg-slate-900/80`, `border border-slate-700/50`).

---

## 8. Information Architecture & Screen Design

The application uses a **single workbench layout** with 3 distinct view modes accessible via a persistent top header bar:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER: [NARASI Logo]  [Corridor: Blok M - Kota]  [Twin Level: 2 (Operational)]          │
│         View Modes:  (•) Policy Lab   ( ) Scenario Comparison   ( ) Twin Maturity        │
├────────────────────────────────┬─────────────────────────────────────────────────────────┤
│ LEFT PANEL (340px)             │ MAIN VIEWPORT: INTERACTIVE MAP (MapLibre + Deck.gl)    │
│ ┌────────────────────────────┐ │ - Corridor 1 Route Line (Speed Color-Coded)            │
│ │ Scenario Selector          │ │ - Stop Nodes (Size = Boarding Volume)                  │
│ │ [Baseline] [Scenario A] +  │ │ - Catchment Buffer Rings (400m / Feeder Connections)    │
│ ├────────────────────────────┤ │ - Spatial Speed Delta Heatmap Overlay                  │
│ │ Policy Levers              │ ├─────────────────────────────────────────────────────────┤
│ │ • Headway (min): [ 3.0 ]   │ │ BOTTOM DASHBOARD PANEL (Collapsible)                    │
│ │ • Fleet EV %:    [ 20% ]   │ │ ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐ │
│ │ • Dedicated ROW: [ 85% ]   │ │ │ Avg TravelTime│ │ Daily CO2     │ │ Multi-Objective │ │
│ │ • Feeder Hubs:   [ On ]    │ │ │ 38.5 min      │ │ 12.4 tonnes   │ │ Trade-off Radar │ │
│ │ • Demand Mult:   [ 1.0x]   │ │ │ ▼ -14.2%      │ │ ▼ -42.0%      │ │ (Recharts)      │ │
│ ├────────────────────────────┤ │ └───────────────┘ └───────────────┘ └─────────────────┘ │
│ │ [ RUN SIMULATION ]         │ │ ┌─────────────────────────────────────────────────────┐ │
│ └────────────────────────────┘ │ │ POLICY INSIGHT CARD: "Scenario A reduces wait time..."│ │
│                                │ └─────────────────────────────────────────────────────┘ │
└────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

### View 1: Policy Lab (Primary Workbench)
- **Left Control Panel**: Policy sliders, preset scenario selector, scenario saving/renaming controls, and simulation trigger button.
- **Main Map Canvas**: Interactive vector map rendering Corridor 1 geometry, speed profiles, stop locations, and catchment buffers.
- **Bottom Panel**: Live KPI metrics grid, mode share pie/bar chart, speed profile timeline, and the **Policy Insight Card**.

### View 2: Scenario Comparison (Side-by-Side Trade-off View)
- **Scenario Selector**: Choose any 2 or 3 saved scenarios (e.g., Baseline vs. 100% Electrification vs. High Frequency).
- **Multi-Objective Radar Chart**: Overlaid radar polygons showing relative performance across 5 dimensions (Mobility, Transit Adoption, Environmental Cleanliness, Financial Efficiency, Population Access).
- **Detailed Delta Table**: Side-by-side numerical matrix displaying absolute values and relative percentage changes (`+18.5%`, `-12.0%`), color-coded by metric direction (green = positive outcome, red = adverse outcome).
- **Spatial Difference Map**: Map layer displaying link speed differences ($\Delta \text{Speed} = \text{Speed}_{\text{Scenario}} - \text{Speed}_{\text{Baseline}}$).

### View 3: Twin Maturity Framework (Educational / Governance View)
- **Interactive Maturity Stage Diagram**: Showcases NARASI’s 4-level progressive twin architecture:
  - **Level 1 — Spatial Twin**: Road network, transit stops, land use (Available for all Indonesian cities).
  - **Level 2 — Operational Twin**: Routes, schedules, fleet mix, ridership baselines (**Current Prototype Level**).
  - **Level 3 — Dynamic Twin**: Near-real-time telemetry, traffic signals, weather, live congestion feeds.
  - **Level 4 — Predictive Policy Twin**: Multi-city forecasting, federated optimization, automated policy search.
- **Governance Context Banner**: Explains why Indonesia's unequal regional data maturity requires a progressive framework rather than a rigid top-down system.

---

## 9. Simulation Architecture & Interface Specification

To maintain clean software architecture and future-proof the codebase, the simulation engine is decoupled from UI components via a clean TypeScript interface `ITransportSimulator`.

### Interface Contract (`src/types/simulation.ts`)

```typescript
export interface ITransportSimulator {
  /**
   * Runs the deterministic simulation pipeline for a given policy scenario against a corridor baseline.
   * Execution time must be < 50ms.
   */
  runSimulation(baseline: CorridorBaseline, scenario: PolicyScenario): SimulationResult;
}
```

This guarantees that a future version of NARASI can swap out the prototype simulator module with a SUMO/MATSim backend server wrapper without rewriting UI or state management code.

---

## 10. Prototype Simulation Engine & Mathematical Model

### Design Philosophy: Transparent, Explainable, Deterministic
The prototype simulation engine intentionally avoids heavy multi-step stochastic matrix solving. Instead, it uses **calibrated, transparent, deterministic formulas** that calculate instantaneous scenario responses based on standard transport planning equations.

All model parameters are centralized in `src/sim/simConfig.ts`—zero magic numbers are scattered across the codebase.

### Mathematical Equations

#### 1. Transit Service & Average Waiting Time
$$\text{Base Wait Time (min)} = \frac{\text{Headway}}{2}$$
$$\text{Congestion Penalty (min)} = \max\left(0, \frac{\text{Headway}}{2} \times \left(1.0 - \text{Dedicated Lane Ratio}\right) \times 0.6\right)$$
$$\text{Average Wait Time} = \text{Base Wait Time} + \text{Congestion Penalty}$$

#### 2. Commercial Speed & Link Speed (BPR Formula Calibration)
For each link segment $k$:
$$v_{\text{free}} = \text{Free Flow Speed (km/h)} \quad (\text{Default: } 45 \text{ km/h})$$
$$\text{Congestion Index } (CI_k) = \frac{\text{Car Volume}_k \times \text{Demand Multiplier}}{\text{Link Capacity}_k}$$
$$v_{\text{car}, k} = \frac{v_{\text{free}}}{1 + 0.15 \times (CI_k)^4}$$
$$v_{\text{bus}, k} = (\text{Dedicated Lane Ratio}) \cdot v_{\text{free}} + (1 - \text{Dedicated Lane Ratio}) \cdot v_{\text{car}, k}$$
$$\text{Average Bus Commercial Speed} = \frac{\sum \text{Length}_k}{\sum (\text{Length}_k / v_{\text{bus}, k})}$$
$$\text{Total Bus Travel Time (min)} = \frac{\text{Route Length (13 km)}}{\text{Average Bus Commercial Speed}} \times 60 + (\text{Stops} \times \text{Dwell Time (0.5 min)})$$

#### 3. Elasticity & Mode Shift (Transit Adoption)
Changes in bus travel time and waiting time induce mode shift from private cars/motorcycles to public transit:
$$\Delta \text{Service Index} = \left(\frac{\text{Wait}_{\text{base}}}{\text{Wait}_{\text{scenario}}}\right)^{0.35} \times \left(\frac{\text{TravelTime}_{\text{base}}}{\text{TravelTime}_{\text{scenario}}}\right)^{0.25} \times (\text{Feeder Bonus: } 1.15 \text{ if active else } 1.0)$$
$$\text{Daily Ridership} = \text{Base Ridership (110,000)} \times \text{Demand Multiplier} \times \Delta \text{Service Index}$$
$$\text{Shifted Private Car Trips} = \max\left(0, (\text{Daily Ridership} - \text{Base Ridership}) \times 0.45\right)$$

#### 4. Vehicle Kilometers Traveled (VKT) & CO₂ Emissions
$$\text{Bus Trips / Day} = \left(\frac{\text{Operating Hours (16 hr) } \times 60}{\text{Headway}}\right) \times 2$$
$$\text{Bus VKT} = \text{Bus Trips / Day} \times 13.0 \text{ km}$$
$$\text{Diesel Bus VKT} = \text{Bus VKT} \times (1 - \text{EV Ratio})$$
$$\text{EV Bus VKT} = \text{Bus VKT} \times \text{EV Ratio}$$
$$\text{Saved Car VKT} = \text{Shifted Private Car Trips} \times \text{Avg Trip Length (10 km)}$$
$$\text{Bus CO}_2 \text{ (kg)} = (\text{Diesel Bus VKT} \times 0.850) + (\text{EV Bus VKT} \times 0.320 \text{ [Indonesian Grid Factor]})$$
$$\text{Car CO}_2 \text{ Saved (kg)} = \text{Saved Car VKT} \times 0.170$$
$$\text{Net Daily CO}_2 \text{ Emissions (tonnes)} = \frac{\text{Bus CO}_2 - \text{Car CO}_2 \text{ Saved}}{1000}$$

#### 5. Daily Operating Cost
$$\text{Daily Operating Cost (IDR Millions)} = \frac{(\text{Diesel Bus VKT} \times 18,500) + (\text{EV Bus VKT} \times 11,200) + (\text{Fleet Size} \times 1,200,000)}{1,000,000}$$

#### 6. Population Catchment & Equity
$$\text{Base Catchment Population} = 145,000 \text{ (People within 400m of Corridor 1 stops)}$$
$$\text{Scenario Catchment} = \text{Base Catchment} \times (\text{Feeder Active ? } 1.35 : 1.0)$$

---

## 11. KPI & Multi-Objective Evaluation Framework

The prototype evaluates policies across 8 distinct metrics organized into 5 thematic dimensions:

| Metric ID | Metric Name | Dimension | Unit | Direction | Baseline Value |
|---|---|---|---|---|---|
| `KPI-MOB-01` | Average Travel Time | Mobility | minutes | Lower is better | 45.0 min |
| `KPI-MOB-02` | Average Wait Time | Mobility | minutes | Lower is better | 1.8 min (3 min headway) |
| `KPI-MOB-03` | Commercial Speed | Mobility | km/h | Higher is better | 17.3 km/h |
| `KPI-TRN-01` | Daily Ridership | Public Transport | trips/day | Higher is better | 110,000 trips |
| `KPI-TRN-02` | Transit Mode Share | Public Transport | % | Higher is better | 18.5 % |
| `KPI-ENV-01` | Net Daily CO₂ Emissions| Environment | tonnes CO₂/day | Lower is better | 14.8 tonnes |
| `KPI-ECO-01` | Daily Operating Cost | Economics | IDR Millions/day| Lower is better | IDR 142.5 M |
| `KPI-EQT-01` | Catchment Population | Equity | people | Higher is better | 145,000 people |

### Multi-Objective Radar Score Normalization (0–100 Scale)
To populate the 5-axis Radar Chart transparently:
- **Mobility Score**: $\min\left(100, \max\left(0, \frac{60 - \text{TravelTime}}{60 - 25} \times 100\right)\right)$
- **Transit Adoption Score**: $\min\left(100, \max\left(0, \frac{\text{Ridership}}{180,000} \times 100\right)\right)$
- **Environmental Cleanliness Score**: $\min\left(100, \max\left(0, \frac{25 - \text{CO2}}{25 - 2} \times 100\right)\right)$
- **Financial Efficiency Score**: $\min\left(100, \max\left(0, \frac{250 - \text{OperatingCost}}{250 - 80} \times 100\right)\right)$
- **Population Access Score**: $\min\left(100, \max\left(0, \frac{\text{Catchment}}{220,000} \times 100\right)\right)$

---

## 12. Spatial Visualization & Scenario Comparison Workbench

### Map Layer Stack (MapLibre GL JS + Deck.gl)
1. **Basemap**: CARTO Dark Matter vector tile service (Free, zero API key).
2. **Corridor Route Layer (`PathLayer`)**:
   - Color-coded by link commercial speed (Green $\ge 25$ km/h, Yellow $15-24$ km/h, Red $< 15$ km/h).
   - Glow width scales with bus service frequency.
3. **Station Nodes (`ScatterplotLayer`)**:
   - Circle radius proportional to daily boarding volume.
   - Hover tooltip displays stop name, boarding count, and local wait time.
4. **Catchment Buffer Rings (`PolygonLayer` / Turf.js buffer)**:
   - 400m walk catchment rings around stations.
   - Expanding translucent feeder coverage zones when feeder policy is active.
5. **Spatial Delta Overlay (`PathLayer` - Comparison View)**:
   - Visualizes speed differences ($\Delta v = v_{\text{Scenario}} - v_{\text{Baseline}}$).
   - Cyan stroke = speed gain, Magenta stroke = speed loss.

---

## 13. Policy Insight & Automated Evidence Layer

A core differentiator from generic dashboards is the **Policy Insight Layer**. Located in the bottom workbench panel, this component automatically synthesizes simulation outputs into a concise, human-readable executive summary.

### Insight Generation Rule Engine (`src/sim/insightGenerator.ts`)

```typescript
export interface PolicyInsight {
  headline: string;
  verdict: 'HIGHLY_EFFECTIVE' | 'TRADE_OFF_HEAVY' | 'COST_INEFFECTIVE' | 'NEUTRAL';
  keyTakeaways: string[];
  recommendation: string;
}
```

### Sample Generated Output
- **Headline**: *"High-Frequency Electrification Scenario yields +18.2% ridership gain and -68% CO₂ reduction, but increases daily operating budget by +34.5%."*
- **Verdict**: `TRADE_OFF_HEAVY`
- **Key Takeaways**:
  - *"Headway reduction to 1.5 min cuts passenger wait time by 50% (from 1.8 min to 0.9 min), driving ~20,000 car-to-bus trip shifts."*
  - *"Transitioning 80% fleet to EV saves 10.1 tonnes of daily CO₂, even accounting for Java-Bali power grid carbon intensity."*
  - *"Operating costs increase by IDR 49.2 Million/day due to expanded fleet size (90 buses vs 60 baseline)."*
- **Policy Recommendation**: *"Recommend implementation if municipal climate fund or clean transit subsidy can offset the IDR 49.2M daily operational gap."*

---

## 14. Data Architecture, Schema & Data Provenance

### Strict Data Provenance Hierarchy
To ensure modeling integrity and scientific honesty:
1. **Sourced Data**: Real geospatial coordinates for TransJakarta Corridor 1 route and 22 stops (derived from OpenStreetMap PTv2 and GTFS shapes).
2. **Derived Data**: Calculated segment lengths, stop-to-stop distances, and geospatial buffer polygons (via `@turf/turf`).
3. **Calibrated Synthetic Data**: Baseline passenger OD matrices and zone demographics calibrated against BPS DKI Jakarta statistics.
4. **Simulated Outputs**: All dynamic metrics generated by the simulation engine are strictly labeled in the UI as `[SIMULATED EXPERIMENT OUTPUT]`.

### TypeScript Data Schemas (`src/types/simulation.ts`)

```typescript
export interface TransitStop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  isTransferHub: boolean;
  baselineBoardings: number;
  catchmentPopulation: number;
}

export interface CorridorLink {
  id: string;
  sourceStopId: string;
  targetStopId: string;
  distanceKm: number;
  freeFlowSpeedKmh: number;
  capacityVehPerHour: number;
  isDedicatedBRTLane: boolean;
  coordinates: [number, number][]; // GeoJSON LineString coordinates
}

export interface PolicyLevers {
  headwayMinutes: number;         // 1.0 to 15.0 (step 0.5)
  fleetSize: number;              // 20 to 120 (step 5)
  electricBusRatio: number;       // 0.0 to 1.0 (step 0.1)
  dedicatedLaneRatio: number;     // 0.5 to 1.0 (step 0.05)
  feederConnectorActive: boolean; // boolean
  demandMultiplier: number;       // 0.8 to 1.5 (step 0.05)
}

export interface PolicyScenario {
  id: string;
  name: string;
  description: string;
  isBaseline: boolean;
  createdAt: string;
  levers: PolicyLevers;
}

export interface SimulationResult {
  scenarioId: string;
  computedAt: string;
  kpis: {
    avgTravelTimeMin: number;
    avgWaitTimeMin: number;
    commercialSpeedKmh: number;
    dailyRidership: number;
    transitModeSharePct: number;
    co2EmissionsTonnes: number;
    operationalCostIdrMillion: number;
    catchmentPopulation: number;
  };
  radarScores: {
    mobility: number;
    adoption: number;
    environment: number;
    economy: number;
    access: number;
  };
  linkSpeeds: Record<string, number>;
  stopWaitTimes: Record<string, number>;
  insight: PolicyInsight;
}
```

---

## 15. Progressive Digital Twin / Maturity Representation

The UI explicitly showcases NARASI’s 4-level progressive maturity framework via a dedicated header badge and modal/diagram view (`ProgressiveTwinDiagram.tsx`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   NARASI PROGRESSIVE DIGITAL TWIN ARCHITECTURE                         │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ LEVEL 1           │ LEVEL 2           │ LEVEL 3           │ LEVEL 4                    │
│ SPATIAL TWIN      │ OPERATIONAL TWIN  │ DYNAMIC TWIN      │ PREDICTIVE POLICY TWIN     │
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│ • Road network    │ • Route schedules │ • Real-time IoT   │ • Multi-city forecasting   │
│ • Stop locations  │ • Fleet mix       │ • Live GPS feeds  │ • Automated policy search  │
│ • Land use        │ • Demographics    │ • Signal timing   │ • Federated optimization   │
│ • Population      │ • Demand baseline │ • Weather/traffic │ • Cross-regional trade-offs│
├───────────────────┼───────────────────┼───────────────────┼────────────────────────────┤
│ Baseline Coverage │ [PROTOTYPE LEVEL] │ Future Extension  │ Long-term Vision           │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
```

This ensures decision-makers understand that a data-limited city (e.g., small regency) can start at Level 1/2 without waiting for multi-million-dollar Level 3/4 IoT infrastructure.

---

## 16. Technical Architecture & Component Tree

### Stack Overview
- **Build Tool / Framework**: Vite + React 18 + TypeScript.
- **State Management**: Zustand (with `persist` middleware for local scenario persistence).
- **Mapping Stack**: MapLibre GL JS + `@deck.gl/react` + `@deck.gl/mapbox` (`MapboxOverlay`).
- **Data Visualization**: Recharts (RadarChart, BarChart, ResponsiveContainer).
- **Styling**: Tailwind CSS + Lucide React icons + custom glassmorphism utilities.
- **Geospatial Utilities**: `@turf/turf` (line distance, point-in-polygon, buffer generation).

### Directory & Component Hierarchy

```
narasi-prototype/
├── public/
│   └── data/
│       └── corridor1-baseline.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── WorkbenchLayout.tsx
│   │   │   └── ViewTabs.tsx
│   │   ├── controls/
│   │   │   ├── ScenarioManager.tsx
│   │   │   ├── PolicySliders.tsx
│   │   │   └── PresetsPicker.tsx
│   │   ├── map/
│   │   │   ├── MapViewport.tsx
│   │   │   ├── CorridorLayer.tsx
│   │   │   ├── StopNodesLayer.tsx
│   │   │   └── CatchmentBufferLayer.tsx
│   │   ├── dashboard/
│   │   │   ├── KpiSummaryGrid.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── TradeoffRadarChart.tsx
│   │   │   ├── ModeShareChart.tsx
│   │   │   └── PolicyInsightCard.tsx
│   │   ├── comparison/
│   │   │   ├── ComparisonWorkbench.tsx
│   │   │   ├── DeltaTable.tsx
│   │   │   └── RadarOverlayChart.tsx
│   │   └── maturity/
│   │       └── ProgressiveTwinDiagram.tsx
│   ├── data/
│   │   ├── corridor1Stops.ts
│   │   ├── corridor1Links.ts
│   │   └── defaultScenarios.ts
│   ├── sim/
│   │   ├── simConfig.ts           # Centralized coefficients & constants
│   │   ├── prototypeEngine.ts     # Implementation of ITransportSimulator
│   │   ├── kpiCalculator.ts       # Metric derivations & radar scoring
      └── insightGenerator.ts    # Automated policy insight synthesis
│   ├── store/
│   │   └── useSimulationStore.ts # Core Zustand store
│   ├── types/
│   │   └── simulation.ts          # All TypeScript definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 17. Dependency-Aware Implementation Sequence

The next coding agent must follow this strict 10-phase execution sequence. Do NOT jump to visual polish before the core vertical slice is working.

```
[Phase 0: Setup] ──► [Phase 1: Shell] ──► [Phase 2: Spatial Map] ──► [Phase 3: Baseline Data]
                                                                            │
[Phase 7: Comparison] ◄── [Phase 6: KPIs & Radar] ◄── [Phase 5: Sim Engine] ◄── [Phase 4: Sliders]
        │
        ▼
[Phase 8: Insight & Twin] ──► [Phase 9: Polish & Validate]
```

### Phase 0: Project Setup & Dependencies
- **Action**: Initialize Vite + React + TS project. Install Tailwind CSS, `maplibre-gl`, `deck.gl`, `@deck.gl/react`, `@deck.gl/mapbox`, `recharts`, `zustand`, `lucide-react`, `@turf/turf`.
- **Criteria**: App builds cleanly (`npm run dev`), dark theme styling configured.

### Phase 1: Workbench Shell & State Store
- **Action**: Construct 3-panel workbench layout (`Header.tsx`, left control panel shell, map container, bottom dashboard shell). Build Zustand store (`useSimulationStore.ts`).
- **Criteria**: View mode switching works between Policy Lab, Comparison, and Twin Maturity.

### Phase 2: Corridor 1 Spatial Layer
- **Action**: Load TransJakarta Corridor 1 stops (`corridor1Stops.ts`) and links (`corridor1Links.ts`). Render MapLibre map centered on Jakarta with Deck.gl route paths and stop node layers.
- **Criteria**: Route line from Blok M to Kota renders crisp vector line over dark basemap with station tooltips.

### Phase 3: Baseline Model Definition
- **Action**: Encode baseline policy configuration and static baseline metrics in store.
- **Criteria**: Baseline values correctly populated in state and visible in UI cards.

### Phase 4: Policy Scenario Controls
- **Action**: Implement `PolicySliders.tsx` and `PresetsPicker.tsx`. Wire sliders (Headway, EV %, Dedicated Lane %, Feeder Toggle, Demand Multiplier) to state.
- **Criteria**: Adjusting sliders updates draft scenario state seamlessly.

### Phase 5: Prototype Simulation Engine
- **Action**: Implement `prototypeEngine.ts` following `ITransportSimulator`. Add math functions for wait time, speed, ridership shift, CO₂ emissions, operating cost, and catchment.
- **Criteria**: Changing policy sliders instantly (<50ms) triggers simulation re-calculation and returns valid updated results.

### Phase 6: KPI Dashboard & Multi-Objective Radar Chart
- **Action**: Build `KpiSummaryGrid.tsx`, `MetricCard.tsx` with delta indicators (`▲ +12%`), and `TradeoffRadarChart.tsx` (Recharts).
- **Criteria**: Sliders move $\rightarrow$ KPI values, delta indicators, and radar polygon animate smoothly.

### Phase 7: Scenario Comparison Workbench
- **Action**: Build `ComparisonWorkbench.tsx` and `DeltaTable.tsx`. Render side-by-side scenario comparison table and overlaid multi-scenario radar chart.
- **Criteria**: User can select Baseline vs Scenario A vs Scenario B and inspect clear numerical and spatial deltas.

### Phase 8: Policy Insight Layer & Progressive Twin Diagram
- **Action**: Build `PolicyInsightCard.tsx` (rule engine) and `ProgressiveTwinDiagram.tsx` (Level 1–4 visualization).
- **Criteria**: Bottom dashboard displays concise, evidence-based text summaries of policy trade-offs; Twin diagram renders cleanly.

### Phase 9: Visual Polish & End-to-End Validation
- **Action**: Apply glassmorphism styling, crisp monospace typography, glowing route accents, and verify edge cases.
- **Criteria**: Zero console errors. Full workflow (Baseline $\rightarrow$ Lever Tweak $\rightarrow$ Sim $\rightarrow$ Radar Comparison $\rightarrow$ Policy Insight) executable smoothly in under 30 seconds.

---

## 18. MVP Scope Boundaries

### MUST HAVE (Required for Prototype)
- TransJakarta Corridor 1 baseline data (22 stops, ~13 km geometry).
- 5 interactive policy levers (Headway, Fleet EV %, Dedicated Lane %, Feeder Toggle, Demand Multiplier).
- 4 preset policy scenarios (High-Frequency BRT, 100% Electrification, Dedicated ROW Enforcement, Surge Demand Growth).
- Instant client-side deterministic simulation pipeline (<50ms).
- 8 core KPIs across 5 dimensions (Travel Time, Wait Time, Speed, Ridership, Mode Share, CO₂, Cost, Catchment).
- Interactive MapLibre GL + Deck.gl corridor map with speed color-coding.
- Recharts multi-objective trade-off radar chart.
- Side-by-side scenario comparison table with delta indicators.
- Automated **Policy Insight Card** summary.
- Progressive Twin Level 1–4 diagram.

### SHOULD HAVE (If Time Permits)
- Animated passenger flow particles using Deck.gl `TripsLayer`.
- Stop detail modal showing stop-level boardings and local 400m catchment ring.
- Save / Export scenario configuration to JSON download.

### FUTURE (Explicitly Excluded from Prototype)
- Full Jakarta city network or multi-city network maps.
- Backend server (Node, Python, Go) or database storage.
- Live SUMO or MATSim C++ binary integration.
- Real-time IoT / GPS telemetry ingestion.
- AI-based automated policy optimization algorithms.
- User authentication, login, or cloud syncing.

---

## 19. Acceptance Criteria

The prototype is successful if and only if all of the following criteria are satisfied:

1. **The Core Loop Criterion**:
   > A user can open NARASI, view the Blok M–Kota baseline, change a policy lever (e.g. reduce headway from 3.0 to 1.5 min), click Run Simulation, view updated KPI cards, observe link speed heatmaps, compare the scenario against baseline on a radar chart, and read a clear policy insight explaining the trade-offs.
2. **Performance Criterion**: Simulation calculation completes in $< 50\text{ ms}$ entirely in the browser without UI freezes.
3. **UX & Aesthetic Criterion**: The UI looks like a serious policy laboratory using dark slate slate theme (`#0F172A`), electric cyan/emerald accents, monospaced numbers, and glassmorphism panels.
4. **Data Integrity Criterion**: All simulated outputs are clearly tagged with `[SIMULATED EXPERIMENT OUTPUT]`, and model coefficients are centralized in `simConfig.ts`.
5. **Progressive Twin Criterion**: The application explicitly showcases the Level 1–4 Progressive Twin architecture diagram to contextualize the prototype within Indonesia's long-term vision.

---

## 20. Risks, Modeling Assumptions & Mitigations

| Risk Category | Identified Risk | Impact | Recommended Mitigation |
|---|---|---|---|
| **Technical** | Map tile failure or commercial API key requirements. | High | Use CARTO Dark Matter vector tile service (`https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`); 100% free, zero API key needed. |
| **Modeling** | Unrealistic mathematical outputs (e.g., negative travel time or infinite congestion). | Medium | Enforce strict value clamping in `kpiCalculator.ts` (min speed 5 km/h, max speed 60 km/h, min wait 0.5 min). |
| **Scope Creep** | Implementation agent trying to build a backend or integrate SUMO binaries. | High | Enforce hard non-goals. The prototype is 100% client-side SPA. |
| **UX Quality** | Application looking like a standard admin panel rather than a policy laboratory. | Medium | Enforce dark slate theme, neon map overlays, monospaced fonts for metrics, and the Policy Insight card. |

---

## 21. Future Evolution Path & Production Integration

While the prototype runs client-side, its architecture directly paves the way for the production system:

1. **Simulator Replacement**: The `ITransportSimulator` interface allows swapping `prototypeEngine.ts` with a `SumoRpcSimulator.ts` client that calls a SUMO micro-simulation server.
2. **Data Layer Federation**: Local `corridor1Stops.ts` static objects will be replaced by regional GeoJSON API endpoints served by city transport departments (Dishub).
3. **Level Progression**: Cities will register their maturity level (Level 1 to Level 4) in the regional registry, automatically unlocking advanced simulation engines as data quality increases.

---

## 22. Handoff Summary

### Implementation North Star
> **Build a fast, interactive, client-side web prototype demonstrating how Indonesian transport planners can virtually test, compare, and quantify multi-objective trade-offs of transit policies on TransJakarta Corridor 1 before real-world physical deployment.**

### First Vertical Slice
**Phase 0 through Phase 2**: Initialize Vite+React+TS app, set up Tailwind dark slate theme, render MapLibre GL + Deck.gl map canvas, and display TransJakarta Corridor 1 route line & 22 stop nodes.

### Hard Non-Goals for Implementation Agent
- **DO NOT** create a backend server (Node.js, Express, Python, etc.).
- **DO NOT** attempt to download, compile, or run SUMO or MATSim binaries.
- **DO NOT** build user authentication, user management, or database integrations.
- **DO NOT** create unrequested markdown documentation files.
- **DO NOT** write application code outside the specified single React SPA directory structure.
