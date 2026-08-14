# Plan — Progressive Urban Mobility Digital Twin titled: "NARASI: National Adaptive Regional Architecture for Simulation Infrastructure"

## 1. Core Vision

Build a future-facing **federated Progressive Urban Mobility Digital Twin for Indonesia**.

The system is not positioned as a new traffic simulator or simply another Digital Twin. Its purpose is to create a national framework where transportation policies can be **experimented with virtually before physical implementation**, while remaining usable by regions with very different levels of data and digital infrastructure.

Core principle:

> **Different cities → different data maturity → one evolving Digital Twin framework → virtual policy experiments → evidence-based transport decisions.**

The user-facing manifestation is a **Virtual Mobility Policy Laboratory**.

## 2. The Problem

Transportation planning in Indonesia faces three connected problems:

### Fragmentation
Spatial, transit, traffic, demographic, environmental, and operational data are often separated across systems and institutions.

### Unequal digital maturity
Jakarta and other major cities may have extensive sensors and operational data, while smaller or less-connected regions may only have basic maps and census information.

A future national system cannot assume every region has the same data infrastructure.

### Physical policy experimentation is expensive
Transport interventions—new routes, BRT/LRT corridors, feeder systems, service changes, road policies, or infrastructure investments—have long-lasting physical and financial consequences.

The proposed paradigm is:

> **Test the policy in a virtual representation first, then implement the strongest evidence-supported option in the real city.**

## 3. The Central Innovation

The strongest novelty is **Progressive + Federated Digital Twin architecture**.

### Progressive
The Digital Twin becomes more sophisticated as regional data maturity increases.

**Level 1 — Spatial Twin**
- road network
- transit infrastructure
- land use
- population
- topography

**Level 2 — Operational Twin**
- transit routes
- schedules
- fleet
- ridership
- demand
- traffic conditions

**Level 3 — Dynamic Twin**
- traffic telemetry
- vehicle/location data
- weather
- incidents
- traffic signals
- other near-real-time sources

**Level 4 — Predictive Policy Twin**
- forecasting
- scenario generation
- advanced simulation
- multi-objective optimization
- predictive policy evaluation

A region does not need Level 4 infrastructure to benefit from the system.

### Federated
Each city/region can maintain its own Digital Twin while conforming to a shared national conceptual/data framework.

This avoids requiring Indonesia to build one enormous centralized simulation of every city.

## 4. Virtual Mobility Policy Laboratory

The Policy Laboratory sits above the Digital Twin.

Its core interaction is:

**Baseline → Change one or more policy variables → Simulate → Measure → Compare → Decide**

Example scenarios:

- introduce a BRT corridor
- modify bus routes
- increase/decrease service frequency
- redesign feeder networks
- change fleet allocation
- introduce LRT/MRT extensions
- model population or demand growth
- test road-pricing/fare policies
- test road closures or disruptions
- compare infrastructure investment alternatives

The laboratory should answer:

> **“What happens if we do X instead of Y?”**

And eventually:

> **“Given our goals and constraints, which policy performs best?”**

## 5. Evaluation Framework

Policies should not be judged by a single metric.

Possible KPIs:

### Mobility
- average travel time
- delay
- network speed
- accessibility
- reliability

### Public Transport
- ridership
- coverage
- transfer burden
- service frequency
- passenger waiting time

### Environment
- CO₂ emissions
- fuel/energy consumption
- air-quality-related indicators

### Equity
- accessibility by income group
- underserved-area coverage
- distribution of travel-time benefits

### Resilience
- performance during road closures
- flooding/disruption scenarios
- recovery of mobility service

### Economics
- operating cost
- infrastructure cost assumptions
- cost-benefit indicators

The laboratory compares scenarios rather than pretending one universal KPI defines a “good” transport policy.

## 6. Indonesian Context

The framework should explicitly account for Indonesia's heterogeneous mobility environment.

Potential future adaptations include:

- motorcycle-heavy traffic
- mixed traffic
- informal/public transport such as Angkot
- irregular boarding/alighting
- heterogeneous road behavior
- different public-transport structures between cities

These are **contextual adaptations**, not the primary novelty claim.

The main novelty remains the progressive/federated architecture.

## 7. Prototype Scope

The prototype is intentionally much smaller than the national vision.

### Prototype goal

Demonstrate that the fundamental policy-experimentation loop works.

**Map/network → baseline → scenario → simulation → KPI → comparison**

### Initial scope

- one selected Indonesian urban area
- structured spatial/network data
- initially focus on bus/public transport
- a limited number of realistic policy scenarios
- one established simulation engine
- interactive scenario comparison

### Prototype should NOT require

- nationwide coverage
- full real-time Digital Twin
- live IoT infrastructure
- complete multimodal modelling
- autonomous AI policy generation
- national-scale deployment

The prototype proves the mechanism; the GFT proposes the future infrastructure.

## 8. Long-Term Roadmap

### Phase I — Spatial Foundation
Create interoperable spatial/network representations.

### Phase II — Operational Integration
Connect routes, schedules, fleets, ridership, and demand.

### Phase III — Dynamic Integration
Ingest near-real-time traffic, weather, incidents, and telemetry.

### Phase IV — Predictive Policy Laboratory
Use forecasting, advanced simulation, optimization, and multi-objective analysis.

### Phase V — Federated National Network
Connect city-level Digital Twins through shared standards and governance while allowing regional autonomy.

The roadmap should be presented as a long-term transformation, not as something a student team can deploy immediately.

## 9. Positioning Against Existing Systems

Do NOT claim that the proposal invents:

- Digital Twins
- transport simulation
- SUMO
- MATSim
- AI optimization
- scenario planning
- policy laboratories

Existing commercial and research systems already perform many of these functions.

The defensible positioning is:

> Existing technologies provide powerful pieces of the puzzle; the proposed framework organizes those capabilities into a progressive, federated policy-experimentation infrastructure designed for Indonesia's unequal data maturity.

The proposal should explicitly acknowledge existing systems and explain the remaining integration/context gap.

## 10. GFT-Level Vision

The project is a **future governance/infrastructure paradigm**, not merely a software product.

The long-term vision is for Indonesian decision-makers to treat major transport interventions as digitally testable policies.

Conceptually:

> **The real city becomes the source of evidence.  
> The Digital Twin becomes the experimental environment.  
> Policies become hypotheses.  
> Simulations become experiments.  
> KPIs become evidence.  
> Scenario comparison becomes decision support.**

## 11. Success Criteria

The concept succeeds if it can demonstrate:

1. A realistic baseline representation of a selected city/area.
2. Multiple transport policy scenarios.
3. Simulation outputs that change meaningfully between scenarios.
4. Transparent KPI comparison.
5. A clear policy trade-off rather than a black-box “best answer.”
6. A credible pathway from low-data regional twins to high-maturity predictive twins.
7. A convincing explanation of why this architecture matters specifically for Indonesia.

## 12. What We Must Avoid

Avoid turning the project into a feature list.

Do not make the core story:

> AI + IoT + GIS + Digital Twin + SUMO + GNN + cloud + dashboard.

That weakens the idea.

The story should remain:

> **Progressive, federated Digital Twins enable transportation policy experimentation across Indonesia despite unequal data maturity.**

Everything else exists to support that thesis.

## 13. Final One-Sentence Concept

> **A federated Progressive Urban Mobility Digital Twin framework that enables Indonesian regions—from data-limited areas to highly connected smart cities—to virtually test, compare, and refine transportation policies before implementing them in the real world.**
