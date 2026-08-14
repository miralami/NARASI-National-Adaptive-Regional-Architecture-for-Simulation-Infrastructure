/**
 * NARASI - Automated Policy Insight Layer.
 *
 * Synthesizes simulation outputs into a concise, human-readable executive
 * summary (IMPLEMENTATION_MASTERPLAN §13). The generator reports TRADE-OFFS and
 * conditional recommendations. It NEVER issues unsupported authoritative
 * directives such as "this policy should be implemented" - that decision is
 * left to the policymaker (EXECUTION RULES §6).
 */

import type { KpiValues, PolicyInsight, PolicyScenario, Verdict } from '../types/simulation';

const fmtInt = (v: number) => Math.round(v).toLocaleString('en-US');
const fmt1 = (v: number) =>
  (v >= 100 ? Math.round(v) : Math.round(v * 10) / 10).toLocaleString('en-US');
const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${fmt1(v)}%`;
const fmtIdr = (v: number) => `IDR ${fmt1(v)} M`;

export function generateInsight(
  scenario: PolicyScenario,
  k: KpiValues,
  base: KpiValues,
  shiftedCarTrips: number,
): PolicyInsight {
  const d = (cur: number, ref: number) => ((cur - ref) / ref) * 100;

  const dTt = d(k.avgTravelTimeMin, base.avgTravelTimeMin);
  const dWait = d(k.avgWaitTimeMin, base.avgWaitTimeMin);
  const dSpeed = d(k.commercialSpeedKmh, base.commercialSpeedKmh);
  const dRid = d(k.dailyRidership, base.dailyRidership);
  const dCo2 = d(k.co2EmissionsTonnes, base.co2EmissionsTonnes);
  const dCost = d(k.operationalCostIdrMillion, base.operationalCostIdrMillion);
  const dCatch = d(k.catchmentPopulation, base.catchmentPopulation);

  const improvements = [dTt, dWait, -dCo2, -dCost, dRid, dCatch].filter((v) => v > 0).length;
  const adverse = [dTt, dWait, -dCo2, -dCost, dRid, dCatch].filter((v) => v < 0).length;
  const levers = scenario.levers;

  let verdict: Verdict;
  if (dCost > 20 && dRid < 10 && dTt > -5) {
    verdict = 'COST_INEFFECTIVE';
  } else if (improvements >= 5 && dCost <= 10) {
    verdict = 'HIGHLY_EFFECTIVE';
  } else if (improvements >= 2 && adverse >= 1) {
    verdict = 'TRADE_OFF_HEAVY';
  } else {
    verdict = 'NEUTRAL';
  }

  const bigGains: { label: string; pct: number }[] = [];
  if (dTt < 0) bigGains.push({ label: 'travel time', pct: dTt });
  if (dWait < 0) bigGains.push({ label: 'waiting time', pct: dWait });
  if (dRid > 0) bigGains.push({ label: 'ridership', pct: dRid });
  if (dCo2 < 0) bigGains.push({ label: 'net CO2', pct: dCo2 });
  bigGains.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  const gains = bigGains.slice(0, 2).map((g) => `${fmtPct(g.pct)} ${g.label}`);
  const headline =
    gains.length > 0
      ? `${scenario.name} yields ${gains.join(' and ')}${dCost > 0 ? `, but raises the daily operating budget by ${fmtPct(dCost)}` : dCost < 0 ? `, while cutting the daily operating budget by ${fmtPct(dCost)}` : ''}.`
      : `${scenario.name} shows no material change to corridor KPIs versus baseline.`;

  const takeaways: string[] = [];

  if (dWait <= -5 || dWait >= 5) {
    takeaways.push(
      `Headway of ${levers.headwayMinutes} min moves modeled waiting time ${dWait < 0 ? 'down' : 'up'} ${fmtPct(dWait)} (from ${fmt1(base.avgWaitTimeMin)} to ${fmt1(k.avgWaitTimeMin)} min).`,
    );
  }
  if (shiftedCarTrips > 1000) {
    takeaways.push(
      `The service improvement shifts ~${fmtInt(shiftedCarTrips)} private-car trips to bus per day.`,
    );
  }
  if (levers.electricBusRatio > 0 && dCo2 < 0) {
    takeaways.push(
      `A ${Math.round(levers.electricBusRatio * 100)}% electric fleet cuts modeled net corridor CO2 by ${fmtPct(dCo2)} (${fmt1(k.co2EmissionsTonnes)} t/day), using the Java-Bali grid emission factor.`,
    );
  }
  if (Math.abs(dSpeed) >= 3) {
    takeaways.push(
      `Commercial speed changes ${fmtPct(dSpeed)} to ${fmt1(k.commercialSpeedKmh)} km/h as dedicated-ROW enforcement covers ${Math.round(levers.dedicatedLaneRatio * 100)}% of the route.`,
    );
  }
  if (levers.feederConnectorActive && dCatch > 0) {
    takeaways.push(
      `Active feeder connectors expand the modeled 400 m catchment from ${fmtInt(base.catchmentPopulation)} to ${fmtInt(k.catchmentPopulation)} residents (+${fmtPct(dCatch)} access).`,
    );
  }
  if (dCost !== 0 && Math.abs(dCost) >= 3) {
    takeaways.push(
      `Daily operating cost moves ${fmtPct(dCost)} to ${fmtIdr(k.operationalCostIdrMillion)} driven by fleet size (${levers.fleetSize} buses) and service levels.`,
    );
  }
  if (levers.demandMultiplier !== 1) {
    takeaways.push(
      `Demand at ${levers.demandMultiplier.toFixed(2)}x baseline shifts ridership by ${fmtPct(dRid)} and feeds back into congestion (travel time ${fmtPct(dTt)}).`,
    );
  }
  if (takeaways.length === 0) {
    takeaways.push(
      `No KPI moves by more than 5% from baseline; the lever combination is effectively neutral on this corridor model.`,
    );
  }

  const recommendation = buildRecommendation(verdict, dCost, dRid, dTt, dCo2, k);

  return { headline, verdict, keyTakeaways: takeaways.slice(0, 4), recommendation };
}

function buildRecommendation(
  verdict: Verdict,
  dCost: number,
  dRid: number,
  dTt: number,
  dCo2: number,
  k: KpiValues,
): string {
  switch (verdict) {
    case 'HIGHLY_EFFECTIVE':
      return `Most objectives improve without a major budget increase. This combination is a strong candidate for further operational validation.`;
    case 'TRADE_OFF_HEAVY':
      return dCost > 0
        ? `The gains (${dRid >= 0 ? `ridership ${fmtPct(dRid)}` : ''}${dTt < 0 ? `, travel time ${fmtPct(dTt)}` : ''}${dCo2 < 0 ? `, CO2 ${fmtPct(dCo2)}` : ''}) come with an extra ${fmtIdr(k.operationalCostIdrMillion)} daily budget. Implementation is worth considering only if municipal climate or transit funding can absorb the operational gap, or if a lower-cost variant meets most objectives.`
        : `This scenario improves some objectives while worsening others (${dCost < 0 ? `operating cost ${fmtPct(dCost)}` : 'costs rise'}). A hybrid combination of the best-performing levers may capture more of the upside.`;
    case 'COST_INEFFECTIVE':
      return `The added operating cost is not matched by proportional ridership or travel-time gains. A cheaper service level (higher headway or smaller fleet) is likely to achieve most of the benefit.`;
    default:
      return       `Changes are within ±5% of baseline on all dimensions. Consider stronger levers (e.g., headway below 2.5 min, full ROW enforcement, or fleet electrification) to produce measurable effects.`;
  }
}
