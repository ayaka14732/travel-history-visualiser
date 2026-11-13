import { resolveLocation } from './countryData';

/**
 * Travel History Parser
 *
 * Data format (tab- or comma-separated, 6 columns per row):
 * Each line is split by Tab if it contains a Tab character, otherwise by comma.
 *
 * Type 1 — Multi-row group (major location + multiple minor locations):
 *   20240221\t20240226\t申根區域\t希臘\t20240221\t20240221
 *   \t\t\t丹麥\t20240221\t20240224
 *   \t\t\t瑞典\t20240224\t20240224
 *   \t\t\t丹麥\t20240224\t20240226
 *
 * Type 2 — Single row with both major + minor location (no minor dates):
 *   20240630\t20240705\t英國\t英格蘭\t\t
 *
 * Type 3 — Single row with major location only (minor = major):
 *   20240219\t20240221\t新加坡\t\t\t
 *
 * Validation performed (every problem is reported in `errors`):
 *   - Date strings must be 8 digits and represent a valid calendar date
 *   - groupEnd must not be before groupStart
 *   - minorEnd must not be before minorStart
 *   - minorStart must not be before groupStart
 *   - minorEnd must not be after groupEnd
 *   - Groups with an invalid header and continuation rows with invalid dates are skipped
 */

// ---------------------------------------------------------------------------
// Core date utilities
// ---------------------------------------------------------------------------

/** Parse a YYYYMMDD string into a Date (local midnight). Returns null if invalid. */
export function tryParseDate(s: string): Date | null {
  if (!/^\d{8}$/.test(s)) return null;
  const y = parseInt(s.slice(0, 4), 10);
  const m = parseInt(s.slice(4, 6), 10) - 1; // 0-indexed
  const d = parseInt(s.slice(6, 8), 10);
  const date = new Date(y, m, d);
  // Verify the date is valid (e.g. month 13 or day 32 would roll over)
  if (date.getFullYear() !== y || date.getMonth() !== m || date.getDate() !== d) {
    return null;
  }
  return date;
}

/** Format a Date as YYYY-MM-DD (also the value format of <input type="date">). */
export function formatDateDisplay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Add `n` days to a Date, returning a new Date. */
export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

/** Number of days between two dates (end - start). Positive if end > start. */
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / 86_400_000);
}

// ---------------------------------------------------------------------------
// Row-level parsing
// ---------------------------------------------------------------------------

/** A single location span. */
interface MinorEntry {
  location: string;
  startDate: Date;
  endDate: Date;
}

/** A parsed travel record group. */
interface TravelGroup {
  groupStart: Date;
  groupEnd: Date;
  /** Major location (e.g. "SCHENGEN", "GB", "SG"). */
  majorLocation: string;
  /** Minor location entries. If none given, defaults to majorLocation for the whole range. */
  minorEntries: MinorEntry[];
}

type RowResult<T> = { ok: true; value: T } | { ok: false; error: string };

/** Parse an optional date field. Empty → null; invalid → null plus a warning. */
function parseDateField(s: string, fieldName: string, rowDesc: string, warnings: string[]): Date | null {
  if (!s) return null;
  const d = tryParseDate(s);
  if (!d) warnings.push(`[${rowDesc}] ${fieldName} "${s}" is not a valid YYYYMMDD date`);
  return d;
}

/** Validate a minor entry's dates against the group range. */
function validateMinorEntry(
  { location, startDate, endDate }: MinorEntry,
  groupStart: Date,
  groupEnd: Date,
  rowDesc: string,
): string[] {
  const prefix = `[${rowDesc}] Minor location "${location}":`;
  const warnings: string[] = [];
  if (endDate < startDate) {
    warnings.push(
      `${prefix} minorEnd ${formatDateDisplay(endDate)} is before minorStart ${formatDateDisplay(startDate)}`,
    );
  }
  if (startDate < groupStart) {
    warnings.push(
      `${prefix} minorStart ${formatDateDisplay(startDate)} is before groupStart ${formatDateDisplay(groupStart)}`,
    );
  }
  if (endDate > groupEnd) {
    warnings.push(`${prefix} minorEnd ${formatDateDisplay(endDate)} is after groupEnd ${formatDateDisplay(groupEnd)}`);
  }
  return warnings;
}

/**
 * Parse a "continuation row" (first 3 cells empty):
 *   \t \t \t minorLocation \t minorStart \t minorEnd
 */
function parseContinuationRow(
  [t0, t1, t2, t3, t4, t5]: string[],
  groupStart: Date,
  groupEnd: Date,
  rowDesc: string,
  warnings: string[],
): RowResult<MinorEntry> {
  if (t0 || t1 || t2) {
    return { ok: false, error: `[${rowDesc}] Not a continuation row (first 3 tokens not empty)` };
  }
  if (!t3) {
    return { ok: false, error: `[${rowDesc}] Continuation row has empty minor location` };
  }
  const location = resolveLocation(t3);
  const startDate = parseDateField(t4, 'minorStart', rowDesc, warnings);
  const endDate = parseDateField(t5, 'minorEnd', rowDesc, warnings);
  if (!startDate || !endDate) {
    return {
      ok: false,
      error: `[${rowDesc}] Continuation row for "${location}" has invalid or missing dates: "${t4}", "${t5}"`,
    };
  }
  const entry = { location, startDate, endDate };
  warnings.push(...validateMinorEntry(entry, groupStart, groupEnd, rowDesc));
  return { ok: true, value: entry };
}

/**
 * Parse a group: a header row
 *   groupStart \t groupEnd \t majorLocation \t minorLocation \t minorStart \t minorEnd
 * followed by optional continuation rows.
 *
 * Returns ok:false only for fatal header errors (invalid group dates or missing majorLocation).
 */
function parseGroup(rows: string[][], groupIndex: number, warnings: string[]): RowResult<TravelGroup> {
  const [t0, t1, t2, t3, t4, t5] = rows[0];
  const rowDesc = `group ${groupIndex + 1}, row 1`;

  const groupStart = tryParseDate(t0);
  if (!groupStart) return { ok: false, error: `[${rowDesc}] Invalid groupStart: "${t0}"` };
  const groupEnd = tryParseDate(t1);
  if (!groupEnd) return { ok: false, error: `[${rowDesc}] Invalid groupEnd: "${t1}"` };
  if (!t2) return { ok: false, error: `[${rowDesc}] majorLocation is empty` };

  if (groupEnd < groupStart) {
    warnings.push(
      `[${rowDesc}] groupEnd ${formatDateDisplay(groupEnd)} is before groupStart ${formatDateDisplay(groupStart)}`,
    );
  }

  const majorLocation = resolveLocation(t2);
  const minorEntries: MinorEntry[] = [];

  if (t3) {
    // Type 2 (no minor dates) inherits the group range; Type 1 header gives explicit minor dates
    const entry = {
      location: resolveLocation(t3),
      startDate: parseDateField(t4, 'minorStart', rowDesc, warnings) ?? groupStart,
      endDate: parseDateField(t5, 'minorEnd', rowDesc, warnings) ?? groupEnd,
    };
    if (t4 || t5) warnings.push(...validateMinorEntry(entry, groupStart, groupEnd, rowDesc));
    minorEntries.push(entry);
  }

  for (let i = 1; i < rows.length; i++) {
    const contDesc = `group ${groupIndex + 1}, row ${i + 1}`;
    const cont = parseContinuationRow(rows[i], groupStart, groupEnd, contDesc, warnings);
    if (cont.ok) minorEntries.push(cont.value);
    else warnings.push(`Skipped continuation row: ${cont.error}`);
  }

  if (minorEntries.length === 0) {
    minorEntries.push({ location: majorLocation, startDate: groupStart, endDate: groupEnd });
  }

  return { ok: true, value: { groupStart, groupEnd, majorLocation, minorEntries } };
}

// ---------------------------------------------------------------------------
// Top-level text splitter
// ---------------------------------------------------------------------------

/** Split text into groups of rows; each row is exactly 6 trimmed cells. A row whose first cell is a date starts a new group. */
function splitIntoGroups(text: string): string[][][] {
  const groups: string[][][] = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = line.split(line.includes('\t') ? '\t' : ',').map((c) => c.trim());
    const row = Array.from({ length: 6 }, (_, i) => cells[i] ?? '');

    if (/^\d{8}$/.test(row[0])) groups.push([row]);
    else groups.at(-1)?.push(row); // rows before the first header are ignored
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Output of parseTravelData. */
export interface TravelParseResult {
  /** The earliest date found in the data. */
  startDate: Date;
  /** The latest date found in the data. */
  endDate: Date;
  /**
   * Array indexed by day offset from startDate.
   * Each element is the deduplicated list of location codes for that day.
   */
  dailyLocations: string[][];
  /** Errors from parsing and validation. If non-empty, results should not be used. */
  errors: string[];
}

/**
 * Parse travel history text data.
 *
 * @param dataText    Raw tab- or comma-separated travel data text.
 * @param isDetailed  If true, use minor locations; otherwise use major locations.
 */
export function parseTravelData(dataText: string, isDetailed: boolean): TravelParseResult {
  const errors: string[] = [];
  const groups: TravelGroup[] = [];

  splitIntoGroups(dataText).forEach((rows, gi) => {
    const result = parseGroup(rows, gi, errors);
    if (result.ok) groups.push(result.value);
    else errors.push(`Skipped group ${gi + 1}: ${result.error}`);
  });

  if (groups.length === 0) {
    const today = new Date();
    return {
      startDate: today,
      endDate: today,
      dailyLocations: [[]],
      errors: errors.length > 0 ? errors : ['No valid groups found in input.'],
    };
  }

  let minDate = groups[0].groupStart;
  let maxDate = groups[0].groupEnd;
  for (const g of groups) {
    if (g.groupStart < minDate) minDate = g.groupStart;
    if (g.groupEnd > maxDate) maxDate = g.groupEnd;
  }

  const totalDays = daysBetween(minDate, maxDate) + 1;
  const dailySets = Array.from({ length: totalDays }, () => new Set<string>());

  for (const group of groups) {
    const spans =
      isDetailed ?
        group.minorEntries
      : [{ location: group.majorLocation, startDate: group.groupStart, endDate: group.groupEnd }];
    for (const { location, startDate, endDate } of spans) {
      // Minor entries may lie outside the overall range (already reported as errors); clamp them
      const from = Math.max(0, daysBetween(minDate, startDate));
      const to = Math.min(totalDays - 1, daysBetween(minDate, endDate));
      for (let i = from; i <= to; i++) dailySets[i].add(location);
    }
  }

  return {
    startDate: minDate,
    endDate: maxDate,
    dailyLocations: dailySets.map((s) => Array.from(s)),
    errors,
  };
}

// ---------------------------------------------------------------------------
// Range helpers
// ---------------------------------------------------------------------------

/** Daily locations for [start, end]; both must lie within the result's date range. */
export function sliceDays(result: TravelParseResult, start: Date, end: Date): string[][] {
  return result.dailyLocations.slice(daysBetween(result.startDate, start), daysBetween(result.startDate, end) + 1);
}

export interface CountryStat {
  location: string;
  days: number;
}

/** Per-location day counts, most days first. */
export function computeStats(dailyLocations: string[][]): CountryStat[] {
  const counts = new Map<string, number>();
  for (const dayLocs of dailyLocations) {
    for (const loc of dayLocs) {
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([location, days]) => ({ location, days })).sort((a, b) => b.days - a.days);
}
