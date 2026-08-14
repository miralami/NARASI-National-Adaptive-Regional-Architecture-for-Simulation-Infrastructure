/**
 * NARASI - Number formatting helpers (monospace, policy-lab presentation).
 */

export const fmtInt = (v: number): string => Math.round(v).toLocaleString('en-US');

/** Compact decimals: 123.45 -> "123", 12.345 -> "12.3", 1.2345 -> "1.23". */
export const fmtNum = (v: number, digits = 2): string =>
  Number.isInteger(v)
    ? v.toLocaleString('en-US')
    : v.toLocaleString('en-US', { maximumFractionDigits: digits });

/** Percentage delta with sign: +12.4% / -8.0% / 0%. */
export const fmtDeltaPct = (pct: number): string =>
  `${pct > 0 ? '+' : ''}${fmtNum(pct, 1)}%`;

/** IDR millions with compact formatting. */
export const fmtIdrM = (v: number): string => `IDR ${fmtNum(v, 1)} M`;

/** Timestamp -> HH:MM:SS local time. */
export const fmtTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('en-GB', { hour12: false });
