# NARASI Prototype (Level 2): Technical Implementation Report

## 1. System Overview & Technology Stack

NARASI (National Adaptive Regional Architecture for Simulation Infrastructure) is a client-side interactive transport policy laboratory prototype configured for TransJakarta Corridor 1 (Blok M ↔ Kota).

- **Core Framework**: React 18.3.1, Vite 5.4.11, TypeScript 5.6.3.
- **State Management**: Zustand 4.5.5 with `persist` middleware (`localStorage` key: `narasi-store-v1`).
- **Geospatial & Mapping**: MapLibre GL 4.7.1, Deck.gl 9.0.31 (`@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/mapbox`, `@deck.gl/react`), Turf 7.1.0 (`@turf/turf`).
- **Data Visualization**: Recharts 2.13.3 (`RadarChart`, `BarChart`).
- **Testing**: Vitest 2.1.8 (`src/sim/prototypeEngine.test.ts`).

---

## 2. Component & Architecture Structure

```
src/
├── main.tsx                         # React entrypoint
├── App.tsx                          # Shell layout & view routing ('lab' | 'compare' | 'maturity')
├── types/
│   └── simulation.ts                # Domain models (TransitStop, CorridorLink, PolicyLevers, SimulationResult, KpiValues)
├── store/
│   └── useSimulationStore.ts        # Zustand store, baseline initialization, draft state reactive calculations
├── sim/
│   ├── simConfig.ts                 # Authoritative configuration, constants, and modeling decisions D1–D4
│   ├── prototypeEngine.ts           # Pure deterministic engine implementing ITransportSimulator (<1 ms execution)
│   ├── kpiCalculator.ts             # KPI metadata, radar score normalization, delta matrix generation
│   ├── insightGenerator.ts          # Automated decision tree verdict & takeaway synthesizer
│   └── prototypeEngine.test.ts     # Vitest unit test suite
├── data/
│   ├── corridor1Stops.ts            # 22 transit stop definitions with spatial coordinates & boardings
│   ├── corridor1Links.ts            # 21 directional links with Haversine distance, volume & capacity
│   └── defaultScenarios.ts          # Baseline scenario + 4 preset experiments
└── components/
    ├── layout/                      # Header, ViewTabs
    ├── lab/                         # Main Policy Lab view layout
    ├── map/                         # Deck.gl map layers (CorridorLayer, StopNodesLayer, CatchmentBufferLayer, DeltaLayer)
    ├── controls/                    # PolicySliders, PresetsPicker, ScenarioManager
    ├── dashboard/                   # KpiSummaryGrid, TradeoffRadarChart, ModeShareChart, PolicyInsightCard
    ├── comparison/                  # ComparisonWorkbench, RadarOverlayChart, DeltaTable
    └── maturity/                    # ProgressiveTwinDiagram (5-level maturity ladder)
```

---

## 3. Simulation Workflow & Deterministic Engine Logic

The engine (`src/sim/prototypeEngine.ts`) executes a deterministic formula chain in $<1\text{ ms}$ with pure functions:

### 3.1 Step-by-Step Formula Chain

1. **Passenger Wait Time (§10.1)**:
   $$\text{baseWait} = \frac{H}{2}$$
   $$\text{penalty} = \max\left(0, \text{baseWait} \cdot (1 - \theta_{\text{ROW}}) \cdot 0.6\right)$$
   $$W = \max\left(0.5, \text{baseWait} + \text{penalty}\right) \quad (\text{min})$$

2. **Link Speeds & BPR Congestion Model (§10.2)**:
   $$\text{CI}_k = \frac{V_k \cdot \mu_{\text{demand}}}{C_k}$$
   $$v_{k, \text{car, raw}} = \frac{45.0}{1 + 0.15 \cdot (\text{CI}_k)^4}$$
   $$v_{k, \text{car}} = \text{clamp}(v_{k, \text{car, raw}}, 5.0, 60.0) \quad (\text{km/h})$$
   Dedicated ROW enforcement allocation assigns dedicated fractions $f_k \in [0, 1]$ prioritizing bottleneck links (`lnk-14` to `lnk-16`). Bus speed per link:
   $$v_{k, \text{bus}} = \text{clamp}(f_k \cdot 45.0 + (1 - f_k) \cdot v_{k, \text{car}}, 5.0, 60.0) \quad (\text{km/h})$$

3. **Running Time & Effective Commercial Speed (D1)**:
   $$T_{\text{running}} = \sum_{k=1}^{21} \frac{d_k}{v_{k, \text{bus}}} \cdot 60 \quad (\text{min})$$
   $$T_{\text{avg}} = T_{\text{running}} + (22 \cdot 0.5) \quad (\text{min})$$
   $$v_{\text{comm}} = \frac{13.0}{T_{\text{avg}} / 60} \quad (\text{km/h})$$

4. **Cobb-Douglas Mode Shift Elasticity (§10.3)**:
   $$\text{serviceIndex} = \left(\frac{W_{\text{ref}}}{W}\right)^{0.35} \cdot \left(\frac{T_{\text{ref}}}{T_{\text{avg}}}\right)^{0.25} \cdot (\text{feederActive} ? 1.15 : 1.0)$$
   $$R = 110,000 \cdot \mu_{\text{demand}} \cdot \text{serviceIndex} \quad (\text{trips/day})$$
   $$\Delta \text{CarTrips} = \max\left(0, (R - 110,000) \cdot 0.45\right)$$

5. **Net Daily $\text{CO}_2$ Emissions (§10.4)**:
   $$\text{busVKT} = \left(\frac{16 \cdot 60}{H} \cdot 2\right) \cdot 13.0$$
   $$\text{busCO2} = (\text{busVKT} \cdot (1 - \theta_{\text{EV}}) \cdot 0.850) + (\text{busVKT} \cdot \theta_{\text{EV}} \cdot 0.320)$$
   $$\text{carCO2Saved} = \Delta \text{CarTrips} \cdot 10.0 \cdot 0.170$$
   $$\text{netCO2} = \max\left(0, \frac{\text{busCO2} - \text{carCO2Saved}}{1000}\right) \quad (\text{t CO}_2/\text{day})$$

6. **Daily Operating Cost (§10.5)**:
   $$\text{OpCost} = \frac{\text{busVKT}(1 - \theta_{\text{EV}}) \cdot 18,500 + \text{busVKT} \cdot \theta_{\text{EV}} \cdot 11,200 + N_{\text{fleet}} \cdot 1,200,000}{1,000,000} \quad (\text{IDR M/day})$$

7. **Equity Catchment Population (§10.6)**:
   $$P_{\text{catch}} = \text{round}\left(145,000 \cdot (\text{feederActive} ? 1.35 : 1.0)\right) \quad (\text{residents})$$

8. **Mode Share Distribution (D4)**:
   $$\text{privateRemaining} = \max\left(0, 484,594.6 - \Delta \text{CarTrips}\right)$$
   $$\text{transitSharePct} = \frac{R}{R + \text{privateRemaining}} \cdot 100$$
   $$\text{carTrips} = \text{privateRemaining} \cdot 0.45, \quad \text{motorcycleTrips} = \text{privateRemaining} \cdot 0.55$$

---

## 4. Inputs, Scenarios & Outputs

### 4.1 Policy Levers (`PolicyLevers`)
- `headwayMinutes` (1.0–15.0 min, step 0.5)
- `fleetSize` (20–120 buses, step 5)
- `electricBusRatio` (0.0–1.0, step 0.1)
- `dedicatedLaneRatio` (0.50–1.00, step 0.05)
- `feederConnectorActive` (boolean)
- `demandMultiplier` (0.80–1.50, step 0.05)

### 4.2 Configured Scenario Presets

| Scenario Preset | Headway | Fleet | EV Ratio | Dedicated ROW | Feeders | Demand |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline (Current)** | 3.0 min | 60 | 0.0 | 85% | Off | 1.00× |
| **High-Frequency BRT** | 1.5 min | 90 | 0.2 | 85% | On | 1.00× |
| **100% Electrification** | 3.0 min | 60 | 1.0 | 85% | Off | 1.00× |
| **Dedicated ROW Enforcement** | 3.0 min | 60 | 0.0 | **100%** | Off | 1.00× |
| **Surge Demand Growth** | 2.5 min | 80 | 0.2 | 85% | On | 1.30× |

### 4.3 Simulation Outputs
- **8 Core KPIs**: Travel time, wait time, commercial speed, ridership, mode share, net $\text{CO}_2$, operating cost, catchment.
- **5 Radar Scores**: Mobility, adoption, environment, economy, access ($0\text{--}100$).
- **Spatial Vectors**: Link speeds (`linkSpeeds`), dedicated fractions (`linkDedicatedFractions`), stop wait times (`stopWaitTimes`).
- **Policy Insight**: Headline string, verdict classification, takeaway array, conditional recommendation.

---

## 5. KPI Definitions & Multi-Objective Radar Normalization

| KPI ID | Label | Unit | Direction | Baseline Value |
| :--- | :--- | :--- | :--- | :--- |
| `KPI-MOB-01` | Average Travel Time | min | lower_is_better | 45.7 min |
| `KPI-MOB-02` | Average Wait Time | min | lower_is_better | 1.6 min |
| `KPI-MOB-03` | Commercial Speed | km/h | higher_is_better | 17.1 km/h |
| `KPI-TRN-01` | Daily Ridership | trips/day | higher_is_better | 110,000 |
| `KPI-TRN-02` | Transit Mode Share | % | higher_is_better | 18.5% |
| `KPI-ENV-01` | Net Daily $\text{CO}_2$ Emissions | t $\text{CO}_2$/day | lower_is_better | 7.1 t |
| `KPI-ECO-01` | Daily Operating Cost | IDR M/day | lower_is_better | IDR 225.9 M |
| `KPI-EQT-01` | Catchment Population | residents | higher_is_better | 145,000 |

### Radar Normalization Functions (§11)
- $\text{mobility} = \text{clamp}\left(\frac{60 - T_{\text{avg}}}{60 - 25} \cdot 100, 0, 100\right)$
- $\text{adoption} = \text{clamp}\left(\frac{R}{180,000} \cdot 100, 0, 100\right)$
- $\text{environment} = \text{clamp}\left(\frac{25 - \text{netCO2}}{25 - 2} \cdot 100, 0, 100\right)$
- $\text{economy} = \text{clamp}\left(\frac{250 - \text{OpCost}}{250 - 80} \cdot 100, 0, 100\right)$
- $\text{access} = \text{clamp}\left(\frac{P_{\text{catch}}}{220,000} \cdot 100, 0, 100\right)$

---

## 6. Automated Policy Insight Layer

Implemented in `src/sim/insightGenerator.ts`, evaluating relative percentage changes:

- `HIGHLY_EFFECTIVE`: $\ge 5$ KPI improvements AND operating cost delta $\le 10\%$.
- `COST_INEFFECTIVE`: Operating cost delta $> 20\%$ AND ridership delta $< 10\%$ AND travel time delta $> -5\%$.
- `TRADE_OFF_HEAVY`: $\ge 2$ KPI improvements AND $\ge 1$ adverse KPI shift.
- `NEUTRAL`: Default state when shifts remain within baseline bounds ($\pm 5\%$).

---

## 7. Validation & Automated Testing

Covered in `src/sim/prototypeEngine.test.ts` (Vitest):
- **Baseline Accuracy**: Validates 13.0 km route distance, $\approx 17.1$ km/h effective speed, 45.7 min travel time, 110,000 ridership, 18.5% mode share.
- **Determinism**: Validates identical inputs produce bit-identical output objects.
- **Lever Sensitivity**: Validates single lever adjustments move expected KPIs in correct directions.
- **Safety Clamping**: Validates link speeds stay within $[5.0, 60.0]\text{ km/h}$, $\text{netCO2} \ge 0$, and radar scores $\in [0, 100]$.

---

## 8. Academic Screenshot Capture Guidance

1. **Figure 1: Policy Lab Screen (`viewMode = 'lab'`)**
   - Captures left policy control rail, interactive Deck.gl corridor map, KPI summary grid, trade-off radar chart, mode share breakdown, and policy insight card.
2. **Figure 2: Control Rail & Presets (`components/controls/`)**
   - Captures 6 policy lever sliders, preset selection chips, and custom scenario manager interface.
3. **Figure 3: Scenario Comparison Workbench (`viewMode = 'compare'`)**
   - Captures multi-scenario radar overlay chart, direction-aware KPI delta matrix table, and spatial speed delta map ($\Delta v = v_{\text{scenario}} - v_{\text{baseline}}$).
4. **Figure 4: Digital Twin Maturity Diagram (`viewMode = 'maturity'`)**
   - Captures the 5-level maturity ladder highlighting Level 2 (Single-Corridor Policy Laboratory) as active prototype state.

---

## 9. Current Limitations & Simplification Ceilings

1. **Single Corridor Boundary**: Prototype models TransJakarta Corridor 1 only (22 stops, 21 links). Multi-corridor transfer networks and city-wide routing dynamics are outside current scope.
2. **Static Traffic Assignment**: Bus running speed relies on macro-level link BPR congestion curves ($CI_k = V_k \cdot \mu / C_k$) rather than dynamic cell-transmission or agent-based microsimulation models (SUMO/MATSim).
3. **Aggregated Daily Operational Window**: Calculations assume a uniform 16-hour operating window ($05:00\text{--}21:00$) without explicit time-of-day peak/off-peak trip distribution matrices.
4. **Approximated GIS Geometry**: Stop coordinates and link line segments represent straight-line approximations calibrated to route totals rather than high-density GTFS shape files.
