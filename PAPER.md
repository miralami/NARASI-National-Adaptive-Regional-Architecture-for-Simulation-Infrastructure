# NARASI: National Adaptive Regional Architecture for Simulation Infrastructure
## Micro-Level Policy Simulation & Digital Twin Maturity for TransJakarta Corridor 1 (Blok M – Kota)

**Authors:** NARASI Core Systems Engineering & Transport Modeling Group  
**Date:** August 14, 2026  
**Document Version:** 1.0.0-PROTOTYPE  
**Target Repository File:** `PAPER.md`

---

## Abstract
Urban bus rapid transit (BRT) networks in megacities of the Global South face severe operational bottlenecks, mixed-traffic congestion, and multi-objective trade-offs across mobility, environmental sustainability, economic viability, and social equity. This paper presents the mathematical formulation, empirical data provenance, deterministic engine architecture, and policy evaluation framework for **NARASI** (National Adaptive Regional Architecture for Simulation Infrastructure), parameterized specifically for TransJakarta Corridor 1 (Blok M ↔ Kota, 13.0 km, 22 stops, 21 links). Utilizing an exact micro-level deterministic simulation model, we quantify the impact of operational policy levers—headway frequency, fleet size, electrification ratio, right-of-way (ROW) dedicated lane enforcement, feeder connector activation, and demand scaling—on key performance indicators (KPIs). We validate baseline performance (45.67 min travel time, 17.08 km/h commercial speed, 110,000 trips/day, 18.5% mode share, 7.07 t/day net $\text{CO}_2$, and IDR 225.92M daily operating cost) and evaluate four policy presets. The results demonstrate that dedicated ROW enforcement through mixed-traffic bottlenecks (Harmoni/Monas) achieves a 37.96% reduction in travel time (to 28.33 min) and elevates commercial speed to 27.53 km/h without budget expansion, while 100% electrification cuts operational costs by 26.88% (to IDR 165.18M/day) and reduces net daily $\text{CO}_2$ emissions by 62.35%. Finally, we outline a four-tier Digital Twin Maturity Architecture evolving from static deterministic modeling to closed-loop adaptive control.

**Keywords:** Bus Rapid Transit, Deterministic Simulation, Traffic Congestion, BPR Function, Cobb-Douglas Elasticity, Decarbonization, Digital Twin, Policy Synthesis, TransJakarta.

---

## 1. Introduction & Background

The Jakarta Metropolitan Area (Jabodetabek), housing over 30 million residents, operates one of the world's longest Bus Rapid Transit (BRT) networks: TransJakarta. Corridor 1, connecting the commercial hub of Blok M in South Jakarta to the historic center of Kota in North Jakarta, serves as the spine of the capital's public transit network. Despite significant investments in dedicated infrastructure, Corridor 1 experiences acute performance degradation caused by physical mixed-traffic bottlenecks near central government and interchange hubs (notably around Monas and Harmoni), variable headways, grid-tied fleet emissions, and suburban feeder integration gaps.

Decision-makers face complex multi-objective optimization challenges. Operational interventions designed to minimize passenger waiting time or extend spatial catchment often incur substantial municipal budget increases or alter traffic flow dynamics. To enable evidence-based, transparent policy formulation without premature capital expenditure, the **NARASI** (National Adaptive Regional Architecture for Simulation Infrastructure) project provides a high-speed, mathematically rigorous, deterministic simulation framework.

This paper formally documents the complete NARASI model architecture, data provenance, analytical equations, automated policy synthesis logic, and preset experimental findings. All parameters, equations, boundary conditions, and numerical values contained herein reflect the exact codebase implementation across `simConfig.ts`, `prototypeEngine.ts`, `kpiCalculator.ts`, `insightGenerator.ts`, `corridor1Stops.ts`, `corridor1Links.ts`, and `defaultScenarios.ts`.

---

## 2. Corridor Network Topology & Data Provenance

TransJakarta Corridor 1 spans a nominal route length of $L = 13.0\text{ km}$, operating over a 16-hour daily service window ($05:00\text{--}21:00$). The physical corridor comprises $N_{\text{stops}} = 22$ transit hubs/stops connected sequentially by $N_{\text{links}} = 21$ directional arterial links.

```
[Blok M (st-01)] === (Links lnk-01 to lnk-13) ===> [Monas (st-13)]
                                                         ||
                                            [Mixed Bottleneck Block: lnk-14..lnk-16]
                                                         ||
[Kota (st-22)] <=== (Links lnk-17 to lnk-21) <=== [Harmoni (st-16)]
```

### 2.1 Stop Hub Data Provenance & Baseline Demographics
Stop locations are derived from TransJakarta Corridor 1 spatial geometries (`[SOURCE-APPROX]`), with baseline daily passenger boardings ($\sum B_i = 110,000\text{ trips/day}$) and 400 m catchment populations ($\sum P_i = 145,000\text{ residents}$) calibrated to prototype empirical estimates (`[CALIBRATED SYNTHETIC]`).

| Stop ID | Stop Name | Code | Latitude | Longitude | Transfer Hub | Feeder Hub | Baseline Boardings (trips/day) | Baseline Catchment (residents) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `st-01` | Blok M | `BLM` | -6.2444 | 106.7989 | **Yes** | **Yes** | 12,000 | 16,000 |
| `st-02` | Masjid Agung | `MSA` | -6.2341 | 106.8071 | No | No | 4,500 | 6,000 |
| `st-03` | ASEAN | `ASN` | -6.2266 | 106.8094 | No | No | 4,000 | 5,200 |
| `st-04` | Senayan (GBK) | `SEN` | -6.2241 | 106.8029 | No | No | 5,000 | 6,500 |
| `st-05` | Polda Metro Jaya | `PMJ` | -6.2150 | 106.8125 | No | No | 4,500 | 5,800 |
| `st-06` | Bendungan Hilir | `BDH` | -6.2102 | 106.8150 | No | No | 4,000 | 5,200 |
| `st-07` | Setiabudi Utara | `STU` | -6.2050 | 106.8193 | No | No | 4,500 | 5,900 |
| `st-08` | Karet Sudirman | `KRT` | -6.2013 | 106.8216 | No | No | 3,500 | 4,500 |
| `st-09` | Dukuh Atas 1 | `DKA` | -6.2006 | 106.8231 | **Yes** | **Yes** | 8,500 | 11,200 |
| `st-10` | Tosari | `TSR` | -6.1970 | 106.8230 | No | No | 3,500 | 4,500 |
| `st-11` | Bundaran HI | `BHI` | -6.1920 | 106.8220 | **Yes** | **Yes** | 7,500 | 9,900 |
| `st-12` | Sarinah | `SRH` | -6.1880 | 106.8230 | No | No | 4,000 | 5,200 |
| `st-13` | Monas | `MNS` | -6.1825 | 106.8232 | **Yes** | No | 6,000 | 7,900 |
| `st-14` | Balai Kota | `BKT` | -6.1795 | 106.8265 | No | No | 2,500 | 3,300 |
| `st-15` | Gambir | `GMB` | -6.1775 | 106.8285 | No | No | 3,000 | 4,000 |
| `st-16` | Harmoni | `HRM` | -6.1770 | 106.8273 | **Yes** | **Yes** | 10,000 | 13,200 |
| `st-17` | Sawah Besar | `SWB` | -6.1648 | 106.8288 | No | No | 3,500 | 4,600 |
| `st-18` | Mangga Besar | `MGB` | -6.1579 | 106.8297 | No | No | 3,000 | 4,000 |
| `st-19` | Pasar Baru | `PSB` | -6.1530 | 106.8250 | No | No | 2,500 | 3,300 |
| `st-20` | Olimo | `OLM` | -6.1516 | 106.8211 | No | No | 2,500 | 3,300 |
| `st-21` | Glodok | `GLD` | -6.1474 | 106.8197 | No | No | 3,500 | 4,600 |
| `st-22` | Kota | `KOT` | -6.1375 | 106.8148 | **Yes** | **Yes** | 8,000 | 10,900 |
| **Total** | — | — | — | — | **6 Hubs** | **6 Hubs** | **110,000** | **145,000** |

### 2.2 Link Geometry, Traffic Dynamics & Bottleneck Specification
Link segment distances ($d_k^{\text{raw}}$) are computed via Haversine distance between consecutive stop coordinates and normalized to match the nominal route length $L = 13.0\text{ km}$:

$$\alpha_{\text{norm}} = \frac{13.0}{\sum_{k=1}^{21} d_k^{\text{raw}}} \approx 0.9658, \quad d_k = d_k^{\text{raw}} \cdot \alpha_{\text{norm}}$$

Mixed-traffic links around the Harmoni/Monas government hub (`lnk-14`, `lnk-15`, `lnk-16`) are deliberately specified as un-enforced mixed lanes ($15\%$ of total route length) with reduced capacity ($C_k = 1000\text{ veh/h}$) and heavy car volumes ($V_k = 2900\text{ veh/h}$), resulting in a volume-to-capacity ratio $v/c \approx 2.90$.

| Link ID | Source Stop | Target Stop | Capacity $C_k$ (veh/h) | Car Volume $V_k$ (veh/h) | Baseline $v/c$ | Baseline ROW Dedicated? | Normalized Length $d_k$ (km) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `lnk-01` | Blok M | Masjid Agung | 2000 | 2500 | 1.25 | Dedicated | 1.488 |
| `lnk-02` | Masjid Agung | ASEAN | 2000 | 2200 | 1.10 | Dedicated | 0.846 |
| `lnk-03` | ASEAN | Senayan (GBK) | 1800 | 1800 | 1.00 | Dedicated | 0.741 |
| `lnk-04` | Senayan (GBK) | Polda Metro Jaya | 2000 | 2600 | 1.30 | Dedicated | 1.439 |
| `lnk-05` | Polda Metro Jaya | Bendungan Hilir | 2000 | 2400 | 1.20 | Dedicated | 0.589 |
| `lnk-06` | Bendungan Hilir | Setiabudi Utara | 2000 | 2800 | 1.40 | Dedicated | 0.730 |
| `lnk-07` | Setiabudi Utara | Karet Sudirman | 2000 | 2400 | 1.20 | Dedicated | 0.478 |
| `lnk-08` | Karet Sudirman | Dukuh Atas 1 | 2000 | 2600 | 1.30 | Dedicated | 0.179 |
| `lnk-09` | Dukuh Atas 1 | Tosari | 2000 | 2800 | 1.40 | Dedicated | 0.388 |
| `lnk-10` | Tosari | Bundaran HI | 2000 | 3000 | 1.50 | Dedicated | 0.547 |
| `lnk-11` | Bundaran HI | Sarinah | 2000 | 2800 | 1.40 | Dedicated | 0.432 |
| `lnk-12` | Sarinah | Monas | 2000 | 3000 | 1.50 | Dedicated | 0.593 |
| `lnk-13` | Monas | Balai Kota | 2000 | 3200 | 1.60 | Dedicated | 0.479 |
| `lnk-14` | Balai Kota | Gambir | 1000 | 2900 | **2.90** | **Mixed (Bottleneck)** | 0.316 |
| `lnk-15` | Gambir | Harmoni | 1000 | 2900 | **2.90** | **Mixed (Bottleneck)** | 0.160 |
| `lnk-16` | Harmoni | Sawah Besar | 1000 | 2900 | **2.90** | **Mixed (Bottleneck)** | 1.325 |
| `lnk-17` | Sawah Besar | Mangga Besar | 2000 | 2800 | 1.40 | Dedicated | 0.749 |
| `lnk-18` | Mangga Besar | Pasar Baru | 1800 | 2700 | 1.50 | Dedicated | 0.725 |
| `lnk-19` | Pasar Baru | Olimo | 1800 | 2500 | 1.39 | Dedicated | 0.441 |
| `lnk-20` | Olimo | Glodok | 2000 | 2600 | 1.30 | Dedicated | 0.479 |
| `lnk-21` | Glodok | Kota | 2000 | 2400 | 1.20 | Dedicated | 1.076 |
| **Total** | — | — | — | — | — | **85% Dedicated** | **13.000** |

---

## 3. Mathematical Model & Deterministic Simulation Engine

The NARASI engine implements a deterministic, multi-stage analytical model that executes in $< 1\text{ ms}$ per scenario run. The parameter space is defined by the policy lever vector:

$$\mathbf{\Theta} = \left( H, N_{\text{fleet}}, \theta_{\text{EV}}, \theta_{\text{ROW}}, \phi_{\text{feeder}}, \mu_{\text{demand}} \right)$$

where:
- $H \in [1.0, 15.0]$: Service headway in minutes.
- $N_{\text{fleet}} \in [10, 200]$: Active fleet size (buses).
- $\theta_{\text{EV}} \in [0.0, 1.0]$: Fraction of fleet electrified.
- $\theta_{\text{ROW}} \in [0.0, 1.0]$: Dedicated right-of-way enforcement ratio (fraction of route length).
- $\phi_{\text{feeder}} \in \{0, 1\}$: Binary feeder connector integration lever.
- $\mu_{\text{demand}} \in [0.5, 3.0]$: Demand growth multiplier.

```
           [ Policy Levers Vector Θ ]
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ 1. Waiting Time ]           [ 2. Link Speeds & BPR ]
       │                               │
       └───────────────┬───────────────┘
                       ▼
       [ 3. Cobb-Douglas Elasticity Index ]
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
[ 4. CO2 Emissions ] [ 5. Op Cost ] [ 6. Catchment & Mode Split ]
       │               │               │
       └───────────────┼───────────────┘
                       ▼
          [ 7. Multi-Objective Normalization ]
```

### 3.1 Waiting Time Model (§10.1)
Average passenger waiting time $W$ (min) consists of half the nominal headway plus a congestion delay penalty induced by un-enforced mixed ROW lanes:

$$W_{\text{raw}} = \frac{H}{2} + \max\left(0, \frac{H}{2} \cdot (1 - \theta_{\text{ROW}}) \cdot \gamma_{\text{penalty}}\right)$$

$$W = \max\left(W_{\min}, W_{\text{raw}}\right)$$

*Constants:* Congestion penalty coefficient $\gamma_{\text{penalty}} = 0.6$; Minimum wait clamp $W_{\min} = 0.5\text{ min}$.

### 3.2 BPR Congestion Function & Link Speed Model (§10.2)
For each link $k \in \{1, \dots, 21\}$, the private car speed $v_{k, \text{car}}$ is computed using the Bureau of Public Roads (BPR) congestion function:

$$\text{CI}_k = \frac{V_k \cdot \mu_{\text{demand}}}{C_k}$$

$$v_{k, \text{car, raw}} = \frac{v_{\text{free}}}{1 + 0.15 \cdot (\text{CI}_k)^4}$$

$$v_{k, \text{car}} = \text{clamp}\left(v_{k, \text{car, raw}}, v_{\min}, v_{\max}\right)$$

*Constants:* Free-flow speed $v_{\text{free}} = 45.0\text{ km/h}$; Min speed $v_{\min} = 5.0\text{ km/h}$; Max speed $v_{\max} = 60.0\text{ km/h}$.

### 3.3 Priority Allocation & Dynamic ROW Dedicated Fractions
The global lever $\theta_{\text{ROW}}$ specifies the target dedicated route length $L_{\text{target}} = \theta_{\text{ROW}} \cdot L$. The per-link dedicated fraction $f_k \in [0, 1]$ is dynamically allocated:
1. **Upgrades ($\theta_{\text{ROW}} > 0.85$):** Non-dedicated mixed links are prioritized by highest volume-to-capacity ratio $\text{CI}_k$, upgrading bottleneck segments first (`lnk-14`, `lnk-15`, `lnk-16`).
2. **Demotions ($\theta_{\text{ROW}} < 0.85$):** Core dedicated links are demoted starting with the least congested segments.

Bus speed on link $k$ blends free-flow transit speed and mixed car traffic speed:

$$v_{k, \text{bus}} = \text{clamp}\left( f_k \cdot v_{\text{free}} + (1 - f_k) \cdot v_{k, \text{car}}, v_{\min}, v_{\max} \right)$$

### 3.4 Harmonic Link Speeds & Total Travel Time (§10.2, D1)
Total in-vehicle running travel time across all 21 links is determined harmonically:

$$T_{\text{running}} = \sum_{k=1}^{21} \frac{d_k}{v_{k, \text{bus}}} \quad \text{(hours)}$$

The headline average travel time $T$ (min) incorporates total dwell time across all 22 stops ($t_{\text{dwell}} = 0.5\text{ min/stop}$):

$$T = (T_{\text{running}} \cdot 60) + (N_{\text{stops}} \cdot t_{\text{dwell}}) = (T_{\text{running}} \cdot 60) + 11.0\text{ min}$$

Effective commercial speed $v_{\text{comm}}$ (km/h) accounts for the full journey duration including dwell:

$$v_{\text{comm}} = \frac{L}{T / 60} = \frac{13.0}{T / 60}$$

### 3.5 Cobb-Douglas Mode Shift Elasticity Index (§10.3)
Passenger demand response to operational quality improvements is modeled via a Cobb-Douglas multiplicative service elasticity index $S$:

$$S = \left(\frac{W_{\text{ref}}}{W}\right)^{\varepsilon_w} \cdot \left(\frac{T_{\text{ref}}}{T}\right)^{\varepsilon_t} \cdot \left(1 + \phi_{\text{feeder}} \cdot (\beta_{\text{feeder}} - 1)\right)$$

$$R = R_{\text{base}} \cdot \mu_{\text{demand}} \cdot S$$

The number of private-car trips converted to public transit is given by:

$$\Delta N_{\text{shifted}} = \max\left(0, (R - R_{\text{base}}) \cdot \sigma_{\text{car}}\right)$$

*Constants:* $R_{\text{base}} = 110,000\text{ trips/day}$; Wait elasticity $\varepsilon_w = 0.35$; Travel time elasticity $\varepsilon_t = 0.25$; Feeder bonus multiplier $\beta_{\text{feeder}} = 1.15$; Shifted car fraction $\sigma_{\text{car}} = 0.45$.

### 3.6 Net $\text{CO}_2$ Emissions with Grid Factor (§10.4)
Daily vehicle kilometers traveled (VKT) by transit buses operating 16 hours per day:

$$N_{\text{trips/day}} = \left( \frac{16 \cdot 60}{H} \right) \cdot 2$$

$$\text{VKT}_{\text{bus}} = N_{\text{trips/day}} \cdot L$$

$$\text{VKT}_{\text{diesel}} = \text{VKT}_{\text{bus}} \cdot (1 - \theta_{\text{EV}}), \quad \text{VKT}_{\text{EV}} = \text{VKT}_{\text{bus}} \cdot \theta_{\text{EV}}$$

$$\text{VKT}_{\text{car, saved}} = \Delta N_{\text{shifted}} \cdot d_{\text{private\_trip}}$$

Direct bus emissions minus avoided car emissions yield net daily $\text{CO}_2$ (tonnes/day):

$$E_{\text{bus}} = \text{VKT}_{\text{diesel}} \cdot e_{\text{diesel}} + \text{VKT}_{\text{EV}} \cdot e_{\text{EV}}$$

$$E_{\text{car, saved}} = \text{VKT}_{\text{car, saved}} \cdot e_{\text{car}}$$

$$E_{\text{net}} = \max\left(0, \frac{E_{\text{bus}} - E_{\text{car, saved}}}{1000}\right)$$

*Constants:* Diesel bus emission factor $e_{\text{diesel}} = 0.850\text{ kg CO}_2/\text{km}$; Electric bus Java–Bali grid emission factor $e_{\text{EV}} = 0.320\text{ kg CO}_2/\text{km}$; Private car emission factor $e_{\text{car}} = 0.170\text{ kg CO}_2/\text{km}$; Average private trip distance $d_{\text{private\_trip}} = 10.0\text{ km}$.

### 3.7 Fleet Operating Cost (§10.5)
Total daily operational expenditure $C_{\text{op}}$ (IDR Millions/day) includes per-kilometer variable costs and fixed daily fleet maintenance fees:

$$C_{\text{op}} = \frac{\text{VKT}_{\text{diesel}} \cdot c_{\text{diesel}} + \text{VKT}_{\text{EV}} \cdot c_{\text{EV}} + N_{\text{fleet}} \cdot c_{\text{fixed}}}{1,000,000}$$

*Constants:* Diesel distance cost $c_{\text{diesel}} = \text{IDR } 18,500/\text{km}$; EV distance cost $c_{\text{EV}} = \text{IDR } 11,200/\text{km}$; Fixed fleet fee $c_{\text{fixed}} = \text{IDR } 1,200,000/\text{bus/day}$.

### 3.8 Equity Catchment Population (§10.6)
Spatial accessibility catchment $P_{\text{catch}}$ expands from the primary 400 m stop buffer to the 700 m outer ring when microtransit feeder connectors are activated:

$$P_{\text{catch}} = \text{round}\left( P_{\text{base}} \cdot \left(1 + \phi_{\text{feeder}} \cdot (\kappa_{\text{feeder}} - 1)\right) \right)$$

*Constants:* Base catchment population $P_{\text{base}} = 145,000\text{ residents}$; Feeder catchment multiplier $\kappa_{\text{feeder}} = 1.35$.

### 3.9 Mode Share Split (§10.3, D4)
Given baseline transit mode share $MS_{\text{base}} = 18.5\%$, total corridor trip demand is established by resolving initial private trips $N_{\text{private, base}}$:

$$N_{\text{private, base}} = \frac{R_{\text{base}}}{MS_{\text{base}} / 100} - R_{\text{base}} = \frac{110,000}{0.185} - 110,000 \approx 484,594.59\text{ trips/day}$$

Under any policy scenario, remaining non-transit private trips are split between cars ($45\%$) and motorcycles ($55\%$):

$$N_{\text{private, remaining}} = \max\left(0, N_{\text{private, base}} - \Delta N_{\text{shifted}}\right)$$

$$N_{\text{car}} = N_{\text{private, remaining}} \cdot 0.45, \quad N_{\text{motorcycle}} = N_{\text{private, remaining}} \cdot 0.55$$

$$MS_{\text{transit}} = \left( \frac{R}{R + N_{\text{private, remaining}}} \right) \cdot 100\%$$

---

## 4. Multi-Objective Normalization & Automated Policy Synthesis

### 4.1 Radar Normalization Boundaries (§11)
To allow direct comparison across disparate units, raw KPIs are normalized into a standardized $0\text{--}100$ score index across five multi-objective dimensions:

$$S_{\text{mobility}} = \text{clamp}\left( \frac{60.0 - T}{60.0 - 25.0} \cdot 100, 0, 100 \right)$$

$$S_{\text{adoption}} = \text{clamp}\left( \frac{R}{180,000} \cdot 100, 0, 100 \right)$$

$$S_{\text{environment}} = \text{clamp}\left( \frac{25.0 - E_{\text{net}}}{25.0 - 2.0} \cdot 100, 0, 100 \right)$$

$$S_{\text{economy}} = \text{clamp}\left( \frac{250.0 - C_{\text{op}}}{250.0 - 80.0} \cdot 100, 0, 100 \right)$$

$$S_{\text{access}} = \text{clamp}\left( \frac{P_{\text{catch}}}{220,000} \cdot 100, 0, 100 \right)$$

### 4.2 Automated Verdict Decision Tree (§13)
The automated policy synthesis layer calculates relative percentage deltas $\Delta_k = \frac{k_{\text{scenario}} - k_{\text{base}}}{k_{\text{base}}} \cdot 100\%$ for all indicators and evaluates the following deterministic classification tree:

```
                      [ Evaluate Policy Deltas ]
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
Cost Delta > 20% AND                              Improvements ≥ 5 AND
Ridership Delta < 10% AND                         Cost Delta ≤ 10%?
Travel Time Delta > -5%?                                   │
         │                                        ┌────────┴────────┐
   ┌─────┴─────┐                                  YES               NO
  YES          NO                                  │                │
   │           │                           [HIGHLY_EFFECTIVE]       │
[COST_INEFFECTIVE]                                                  ▼
               └───────────────┬──────────────────────── Improvements ≥ 2 AND
                               │                         Adverse ≥ 1?
                               │                                │
                               │                         ┌──────┴──────┐
                               │                        YES            NO
                               │                         │             │
                               └─────────────────► [TRADE_OFF_HEAVY] [NEUTRAL]
```

---

## 5. Experimental Evaluation & Presets Analysis

We evaluate the baseline operational model against four official NARASI policy presets (`defaultScenarios.ts`). All output metrics reported below represent exact computed values from the simulation engine.

### 5.1 Quantitative KPI & Radar Score Comparison Table

| Indicator / Metric | Unit | Baseline (Current) | High-Frequency BRT | 100% Electrification | Dedicated ROW Enforcement | Surge Demand Growth |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Input Policy Levers** | | | | | | |
| Service Headway $H$ | min | 3.0 | 1.5 | 3.0 | 3.0 | 2.5 |
| Active Fleet Size $N_{\text{fleet}}$ | buses | 60 | 90 | 60 | 60 | 80 |
| Electrification Share $\theta_{\text{EV}}$ | % | 0.0% | 20.0% | 100.0% | 0.0% | 20.0% |
| Dedicated ROW Enforcement $\theta_{\text{ROW}}$ | % | 85.0% | 85.0% | 85.0% | **100.0%** | 85.0% |
| Feeder Connectors $\phi_{\text{feeder}}$ | binary | Off | On | Off | Off | On |
| Demand Multiplier $\mu_{\text{demand}}$ | factor | 1.00× | 1.00× | 1.00× | 1.00× | 1.30× |
| **Primary System KPIs** | | | | | | |
| Average Travel Time $T$ | min | 45.67 | 45.67 | 45.67 | **28.33** | 45.76 |
| Average Waiting Time $W$ | min | 1.64 | **0.82** | 1.64 | 1.50 | 1.36 |
| Commercial Speed $v_{\text{comm}}$ | km/h | 17.08 | 17.08 | 17.08 | **27.53** | 17.05 |
| Daily Transit Ridership $R$ | trips/day | 110,000 | 161,232 | 110,000 | 127,737 | **175,197** |
| Transit Mode Share $MS_{\text{transit}}$ | % | 18.50% | 25.89% | 18.50% | 21.14% | **27.79**% |
| Net Daily $\text{CO}_2$ Emissions $E_{\text{net}}$ | t/day | 7.07 | **0.00** | 2.66 | **0.00** | **0.00** |
| Daily Operating Cost $C_{\text{op}}$ | IDR M/day | 225.92 | 391.55 | **165.18** | 225.92 | 266.13 |
| Catchment Population $P_{\text{catch}}$ | residents | 145,000 | **195,750** | 145,000 | 145,000 | **195,750** |
| Shifted Private Car Trips $\Delta N_{\text{shifted}}$ | trips/day | 0 | 23,054 | 0 | 7,981 | 29,338 |
| **Normalized Radar Scores** | (0--100) | | | | | |
| Mobility Dimension Score | | 40.95 | 40.95 | 40.95 | **90.48** | 40.69 |
| Adoption Dimension Score | | 61.11 | 89.57 | 61.11 | 70.96 | **97.33** |
| Environment Dimension Score | | 77.95 | **100.00** | 97.12 | **100.00** | **100.00** |
| Economy Dimension Score | | 14.16 | 0.00 | **49.89** | 14.16 | 0.00 |
| Access Dimension Score | | 65.91 | **88.98** | 65.91 | 65.91 | **88.98** |
| **Automated Policy Synthesis** | | | | | | |
| Verdict Classification | | **NEUTRAL** | **TRADE_OFF_HEAVY** | **NEUTRAL** | **TRADE_OFF_HEAVY** | **TRADE_OFF_HEAVY** |

### 5.2 Key Analytical Findings

1. **Dedicated ROW Enforcement (The Infrastructure Lever):**
   Upgrading ROW enforcement from $85\%$ to $100\%$ directly resolves the bottleneck across links `lnk-14` to `lnk-16`. This reduces travel time from $45.67\text{ min}$ to $28.33\text{ min}$ (a $-37.96\%$ reduction) and boosts commercial speed from $17.08\text{ km/h}$ to $27.53\text{ km/h}$ ($+61.18\%$). Because modal shift converts $7,981$ car trips per day, avoided car emissions fully offset diesel bus emissions, yielding **$0.00\text{ t/day}$ net $\text{CO}_2$** without increasing operating costs.

2. **100% Fleet Electrification (The Fiscal & Environmental Win-Win):**
   Transitioning the 60-bus fleet entirely from diesel to electric buses reduces net daily $\text{CO}_2$ emissions by $62.35\%$ (from $7.07\text{ t/day}$ to $2.66\text{ t/day}$ under the Java–Bali grid factor). Lower operational cost per kilometer ($\text{IDR } 11,200/\text{km}$ vs $\text{IDR } 18,500/\text{km}$) cuts total daily operating expenditure by **$26.88\%$** (saving $\text{IDR } 60.74\text{ Million/day}$).

3. **High-Frequency BRT (The Service Upgrade Trade-Off):**
   Halving headways to $1.5\text{ min}$ and expanding the fleet to 90 buses increases ridership to $161,232\text{ trips/day}$ ($+46.57\%$) and mode share to $25.89\%$. However, daily operating costs rise by $+73.31\%$ to $\text{IDR } 391.55\text{ M/day}$, triggering a `TRADE_OFF_HEAVY` verdict.

4. **Surge Demand Growth (Network Stress Test):**
   A $1.30\times$ demand surge drives ridership to $175,197\text{ trips/day}$ and transit mode share to $27.79\%$. Standard BPR congestion feedback slightly increases travel time to $45.76\text{ min}$, demonstrating the engine's sensitivity to traffic feedback.

---

## 6. Digital Twin Maturity Architecture

NARASI defines a structured, four-tier Digital Twin Maturity Architecture for urban transport infrastructure:

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: Closed-Loop Adaptive Twin                                     │
│ Real-time IoT feedback, dynamic signal priority & autonomous dispatch │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│ LEVEL 3: Predictive & Scenario Twin                                    │
│ MATSim/SUMO agent-based stochastic dynamic traffic assignment         │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│ LEVEL 2: Calibrated Micro-Level Prototype Twin (CURRENT NARASI)        │
│ Multi-link BPR function, Cobb-Douglas elasticity, explicit geometry   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│ LEVEL 1: Static Macro Model                                            │
│ Corridor-wide aggregated constants, offline spreadsheets               │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Level 1: Static Macro Model** — Aggegated, offline spreadsheets evaluating static travel times without segment-level congestion, demand feedback, or spatial catchments.
2. **Level 2: Calibrated Micro-Level Prototype Twin (Current Implementation)** — Deterministic multi-segment engine implementing explicit link topology, BPR congestion functions, Cobb-Douglas mode choice elasticity, spatial catchment analysis, and multi-objective policy synthesis in $<1\text{ ms}$.
3. **Level 3: Predictive & Scenario Twin (Near-Term Roadmap)** — Integration with open-source agent-based transport micro-simulators (SUMO / MATSim), incorporating stochastic departure times, synthetic population travel demand, and dynamic traffic assignment.
4. **Level 4: Closed-Loop Adaptive Twin (Target Vision)** — Real-time IoT telematics integration, automatic vehicle location (AVL) feedback, dynamic traffic signal priority (TSP) at intersections, and automated adaptive headway dispatching.

---

## 7. Conclusion & Future Roadmap

The NARASI deterministic simulation framework demonstrates that targeted infrastructure interventions—specifically dedicated ROW enforcement through bottleneck links—yield immediate improvements in commercial speed and travel time without expanding municipal operating budgets. Concurrently, fleet electrification provides substantial operational cost savings alongside carbon abatement.

### Roadmap for Future Enhancements
- **Dynamic Signal Priority (TSP):** Model intersection signal delay reductions at major junctions (e.g., Harmoni interchange).
- **Stochastic Agent Integration:** Transition from macro-elasticity trip shift models to agent-based utility maximization models.
- **Subway/MRT Intermodal Transfers:** Incorporate multi-modal ticket integration elasticities with the Jakarta MRT North-South line.

---

## References & Code Base Mapping

1. **Central Simulation Configuration:** `src/sim/simConfig.ts`
2. **Deterministic Simulation Engine:** `src/sim/prototypeEngine.ts`
3. **KPI & Radar Scoring Calculations:** `src/sim/kpiCalculator.ts`
4. **Automated Policy Synthesis:** `src/sim/insightGenerator.ts`
5. **Corridor 1 Stop Geometry & Demographics:** `src/data/corridor1Stops.ts`
6. **Link Dynamics & Bottlenecks:** `src/data/corridor1Links.ts`
7. **Policy Presets & Scenarios:** `src/data/defaultScenarios.ts`
