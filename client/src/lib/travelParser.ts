import { resolveLocation } from './countryData';

/**
 * Travel History Parser — using parser combinator style
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
 * Validation performed:
 *   - Date strings must be 8 digits and represent a valid calendar date
 *   - groupEnd must not be before groupStart
 *   - minorEnd must not be before minorStart
 *   - minorStart must not be before groupStart
 *   - minorEnd must not be after groupEnd
 *   - Minor entries that fall entirely outside the group range are skipped with a warning
 *   - Gaps and overlaps between consecutive groups are reported as warnings
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

/** Parse a YYYYMMDD string into a Date. Throws if invalid. */
export function parseDate(s: string): Date {
  const d = tryParseDate(s);
  if (!d) throw new Error(`Invalid date string: "${s}"`);
  return d;
}

/** Format a Date to YYYYMMDD string. */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Format a Date to YYYY-MM-DD for display. */
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

/** Compare two dates by value (ignoring time). */
export function dateEquals(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ---------------------------------------------------------------------------
// Parser combinator primitives
// ---------------------------------------------------------------------------

type ParseResult<T> = { ok: true; value: T; rest: string[] } | { ok: false; error: string };

type Parser<T> = (tokens: string[]) => ParseResult<T>;

/** Consume one token that satisfies a predicate. */
function satisfy(pred: (s: string) => boolean, label: string): Parser<string> {
  return (tokens) => {
    if (tokens.length === 0) return { ok: false, error: `Expected ${label} but got end of input` };
    const [head, ...rest] = tokens;
    if (pred(head)) return { ok: true, value: head, rest };
    return { ok: false, error: `Expected ${label} but got "${head}"` };
  };
}

/** Consume a token that matches a YYYYMMDD date string (non-empty). */
function dateToken(): Parser<string> {
  return satisfy((s) => /^\d{8}$/.test(s), 'YYYYMMDD date');
}

/** Consume a non-empty text token. */
function textToken(): Parser<string> {
  return satisfy((s) => s.trim().length > 0, 'non-empty text');
}

/** Sequence two parsers. */
function seq2<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<[A, B]> {
  return (tokens) => {
    const ra = pa(tokens);
    if (!ra.ok) return ra;
    const rb = pb(ra.rest);
    if (!rb.ok) return rb;
    return { ok: true, value: [ra.value, rb.value], rest: rb.rest };
  };
}

/** Map over a parser result. */
function map<A, B>(pa: Parser<A>, f: (a: A) => B): Parser<B> {
  return (tokens) => {
    const r = pa(tokens);
    if (!r.ok) return r;
    return { ok: true, value: f(r.value), rest: r.rest };
  };
}

// Suppress unused-variable warnings for exported combinators
void seq2;
void map;
void dateToken;
void textToken;

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/** A single minor-location entry within a group. */
export interface MinorEntry {
  location: string;
  startDate: Date;
  endDate: Date;
}

/** A parsed travel record group. */
export interface TravelGroup {
  /** Overall start date of the group. */
  groupStart: Date;
  /** Overall end date of the group. */
  groupEnd: Date;
  /** Major location (e.g. "申根區域", "英國", "新加坡"). */
  majorLocation: string;
  /** Minor location entries. If none given, defaults to majorLocation for the whole range. */
  minorEntries: MinorEntry[];
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validate a date string and return the parsed Date plus any warning message.
 * Returns null for the date if it is invalid.
 */
function validateDateStr(s: string, fieldName: string, rowDesc: string): { date: Date | null; warning: string | null } {
  if (!s.trim()) return { date: null, warning: null }; // empty is handled by caller
  if (!/^\d{8}$/.test(s.trim())) {
    return {
      date: null,
      warning: `[${rowDesc}] ${fieldName} "${s}" is not 8 digits`,
    };
  }
  const d = tryParseDate(s.trim());
  if (!d) {
    return {
      date: null,
      warning: `[${rowDesc}] ${fieldName} "${s}" is not a valid calendar date`,
    };
  }
  return { date: d, warning: null };
}

// ---------------------------------------------------------------------------
// Row-level parsers
// ---------------------------------------------------------------------------

interface HeaderRowResult {
  groupStart: Date;
  groupEnd: Date;
  majorLocation: string;
  firstMinor: MinorEntry | null;
  warnings: string[];
}

/**
 * Parse a "header row" of a group:
 *   groupStart \t groupEnd \t majorLocation \t minorLocation \t minorStart \t minorEnd
 *
 * Returns ok:false only for fatal errors (unparseable group start/end or missing majorLocation).
 * Non-fatal issues are collected in warnings.
 */
function parseHeaderRow(tokens: string[], rowDesc: string): ParseResult<HeaderRowResult> {
  // Normalize to exactly 6 tokens
  const row = [...tokens];
  while (row.length < 6) row.push('');
  const [t0, t1, t2, t3, t4, t5] = row;

  const warnings: string[] = [];

  // ── groupStart (fatal if invalid) ────────────────────────────────────────
  const gsResult = validateDateStr(t0, 'groupStart', rowDesc);
  if (gsResult.warning) warnings.push(gsResult.warning);
  if (!gsResult.date) {
    return { ok: false, error: `[${rowDesc}] Invalid groupStart: "${t0}"` };
  }
  const groupStart = gsResult.date;

  // ── groupEnd (fatal if invalid) ───────────────────────────────────────────
  const geResult = validateDateStr(t1, 'groupEnd', rowDesc);
  if (geResult.warning) warnings.push(geResult.warning);
  if (!geResult.date) {
    return { ok: false, error: `[${rowDesc}] Invalid groupEnd: "${t1}"` };
  }
  const groupEnd = geResult.date;

  // ── groupEnd must not be before groupStart ────────────────────────────────
  if (groupEnd < groupStart) {
    warnings.push(
      `[${rowDesc}] groupEnd ${formatDateDisplay(groupEnd)} is before groupStart ${formatDateDisplay(groupStart)}`,
    );
  }

  // ── majorLocation (fatal if empty) ──────────────────────────────────────────
  const majorLocationRaw = t2.trim();
  if (!majorLocationRaw) {
    return { ok: false, error: `[${rowDesc}] majorLocation is empty` };
  }
  const majorLocationEntry = resolveLocation(majorLocationRaw);
  const majorLocation = majorLocationEntry ? majorLocationEntry.code : majorLocationRaw;

  // ── firstMinor ─────────────────────────────────────────────────────────────
  let firstMinor: MinorEntry | null = null;
  const minorLocRaw = t3.trim();
  const minorLocEntry = minorLocRaw ? resolveLocation(minorLocRaw) : null;
  const minorLoc = minorLocEntry ? minorLocEntry.code : minorLocRaw;
  const minorStartStr = t4.trim();
  const minorEndStr = t5.trim();

  if (minorLoc) {
    if (!minorStartStr && !minorEndStr) {
      // Type 2: minor dates inherit from group
      firstMinor = { location: minorLoc, startDate: groupStart, endDate: groupEnd };
    } else {
      // Type 1 header: explicit minor dates
      const ssResult = validateDateStr(minorStartStr, 'minorStart', rowDesc);
      if (ssResult.warning) warnings.push(ssResult.warning);
      const seResult = validateDateStr(minorEndStr, 'minorEnd', rowDesc);
      if (seResult.warning) warnings.push(seResult.warning);

      const minorStart = ssResult.date ?? groupStart;
      const minorEnd = seResult.date ?? groupEnd;

      const minorWarnings = validateMinorEntry(minorLoc, minorStart, minorEnd, groupStart, groupEnd, rowDesc);
      warnings.push(...minorWarnings);

      firstMinor = { location: minorLoc, startDate: minorStart, endDate: minorEnd };
    }
  }

  return {
    ok: true,
    value: { groupStart, groupEnd, majorLocation, firstMinor, warnings },
    rest: [],
  };
}

/**
 * Validate a minor entry's dates against the group range.
 * Returns an array of warning strings (empty if all OK).
 */
function validateMinorEntry(
  minorLoc: string,
  minorStart: Date,
  minorEnd: Date,
  groupStart: Date,
  groupEnd: Date,
  rowDesc: string,
): string[] {
  const warnings: string[] = [];

  if (minorEnd < minorStart) {
    warnings.push(
      `[${rowDesc}] Minor location "${minorLoc}": minorEnd ${formatDateDisplay(minorEnd)} is before minorStart ${formatDateDisplay(minorStart)}`,
    );
  }

  if (minorStart < groupStart) {
    warnings.push(
      `[${rowDesc}] Minor location "${minorLoc}": minorStart ${formatDateDisplay(minorStart)} is before groupStart ${formatDateDisplay(groupStart)}`,
    );
  }

  if (minorEnd > groupEnd) {
    warnings.push(
      `[${rowDesc}] Minor location "${minorLoc}": minorEnd ${formatDateDisplay(minorEnd)} is after groupEnd ${formatDateDisplay(groupEnd)}`,
    );
  }

  return warnings;
}

/**
 * Parse a "continuation row" (starts with 3 empty tokens):
 *   \t \t \t minorLocation \t minorStart \t minorEnd
 */
function parseContinuationRow(
  tokens: string[],
  groupStart: Date,
  groupEnd: Date,
  rowDesc: string,
): ParseResult<{ entry: MinorEntry; warnings: string[] }> {
  const row = [...tokens];
  while (row.length < 6) row.push('');
  const [t0, t1, t2, t3, t4, t5] = row;

  if (t0 !== '' || t1 !== '' || t2 !== '') {
    return {
      ok: false,
      error: `[${rowDesc}] Not a continuation row (first 3 tokens not empty)`,
    };
  }

  const minorLocRaw = t3.trim();
  if (!minorLocRaw) {
    return { ok: false, error: `[${rowDesc}] Continuation row has empty minor location` };
  }
  const minorLocEntry = resolveLocation(minorLocRaw);
  const minorLoc = minorLocEntry ? minorLocEntry.code : minorLocRaw;

  const warnings: string[] = [];

  const ssResult = validateDateStr(t4, 'minorStart', rowDesc);
  if (ssResult.warning) warnings.push(ssResult.warning);
  const seResult = validateDateStr(t5, 'minorEnd', rowDesc);
  if (seResult.warning) warnings.push(seResult.warning);

  if (!ssResult.date || !seResult.date) {
    return {
      ok: false,
      error: `[${rowDesc}] Continuation row for "${minorLoc}" has invalid or missing dates: "${t4}", "${t5}"`,
    };
  }

  const minorStart = ssResult.date;
  const minorEnd = seResult.date;

  const minorWarnings = validateMinorEntry(minorLoc, minorStart, minorEnd, groupStart, groupEnd, rowDesc);
  warnings.push(...minorWarnings);

  return {
    ok: true,
    value: { entry: { location: minorLoc, startDate: minorStart, endDate: minorEnd }, warnings },
    rest: [],
  };
}

// ---------------------------------------------------------------------------
// Group-level parser
// ---------------------------------------------------------------------------

/**
 * Parse a group of rows (header + optional continuation rows) into a TravelGroup.
 */
function parseGroup(rows: string[][], groupIndex: number): ParseResult<{ group: TravelGroup; warnings: string[] }> {
  if (rows.length === 0) return { ok: false, error: 'Empty group' };

  const rowDesc = `group ${groupIndex + 1}, row 1`;
  const headerResult = parseHeaderRow(rows[0], rowDesc);
  if (!headerResult.ok) return headerResult;

  const { groupStart, groupEnd, majorLocation, firstMinor, warnings } = headerResult.value;
  const minorEntries: MinorEntry[] = [];

  if (firstMinor) minorEntries.push(firstMinor);

  // Parse continuation rows
  for (let i = 1; i < rows.length; i++) {
    const contDesc = `group ${groupIndex + 1}, row ${i + 1}`;
    const contResult = parseContinuationRow(rows[i], groupStart, groupEnd, contDesc);
    if (!contResult.ok) {
      warnings.push(`Skipped continuation row: ${contResult.error}`);
      continue;
    }
    warnings.push(...contResult.value.warnings);
    minorEntries.push(contResult.value.entry);
  }

  // If no minor entries at all, default to majorLocation for the whole group range
  if (minorEntries.length === 0) {
    minorEntries.push({
      location: majorLocation,
      startDate: groupStart,
      endDate: groupEnd,
    });
  }

  return {
    ok: true,
    value: { group: { groupStart, groupEnd, majorLocation, minorEntries }, warnings },
    rest: [],
  };
}

// ---------------------------------------------------------------------------
// Top-level text splitter
// ---------------------------------------------------------------------------

/**
 * Detect the delimiter for a single line: Tab if the line contains a Tab,
 * otherwise comma. This allows both formats without mixing within a line.
 */
function detectDelimiter(line: string): string {
  return line.includes('\t') ? '\t' : ',';
}

function splitIntoGroups(text: string): string[][][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const groups: string[][][] = [];
  let current: string[][] = [];

  for (const line of lines) {
    const delim = detectDelimiter(line);
    const tokens = line.split(delim);
    // Normalize to exactly 6 tokens
    while (tokens.length < 6) tokens.push('');
    const row = tokens.slice(0, 6);

    const isHeader = /^\d{8}$/.test(row[0].trim());
    if (isHeader) {
      if (current.length > 0) groups.push(current);
      current = [row];
    } else {
      if (current.length > 0) {
        current.push(row);
      }
      // else: orphan continuation row — ignore silently
    }
  }
  if (current.length > 0) groups.push(current);

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
   * Each element is an array of location names for that day.
   * Duplicate locations on the same day are deduplicated.
   */
  dailyLocations: string[][];
  /** All parsed groups, for reference. */
  groups: TravelGroup[];
  /** Errors from parsing and validation. If non-empty, results should not be used. */
  errors: string[];
}

/**
 * Parse travel history text data.
 *
 * @param dataText    Raw tab- or comma-separated travel data text.
 * @param isDetailed  If true, use minor locations; otherwise use major locations.
 * @returns TravelParseResult
 */
export function parseTravelData(dataText: string, isDetailed: boolean): TravelParseResult {
  const allWarnings: string[] = [];
  const rawGroups = splitIntoGroups(dataText);
  const groups: TravelGroup[] = [];

  for (let gi = 0; gi < rawGroups.length; gi++) {
    const result = parseGroup(rawGroups[gi], gi);
    if (result.ok) {
      groups.push(result.value.group);
      allWarnings.push(...result.value.warnings);
    } else {
      allWarnings.push(`Skipped group ${gi + 1}: ${result.error}`);
    }
  }

  if (groups.length === 0) {
    const today = new Date();
    return {
      startDate: today,
      endDate: today,
      dailyLocations: [[]],
      groups: [],
      errors: allWarnings.length > 0 ? allWarnings : ['No valid groups found in input.'],
    };
  }

  // Determine overall date range from group boundaries
  let minDate = groups[0].groupStart;
  let maxDate = groups[0].groupEnd;
  for (const g of groups) {
    if (g.groupStart < minDate) minDate = g.groupStart;
    if (g.groupEnd > maxDate) maxDate = g.groupEnd;
  }

  const totalDays = daysBetween(minDate, maxDate) + 1;
  const dailySets: Set<string>[] = Array.from({ length: totalDays }, () => new Set<string>());

  for (const group of groups) {
    if (isDetailed) {
      // Use minor entries; skip any that fall entirely outside the overall range
      for (const entry of group.minorEntries) {
        const startOffset = daysBetween(minDate, entry.startDate);
        const endOffset = daysBetween(minDate, entry.endDate);
        for (let i = startOffset; i <= endOffset; i++) {
          if (i >= 0 && i < totalDays) {
            dailySets[i].add(entry.location);
          }
        }
      }
    } else {
      // Use big location for the whole group range
      const startOffset = daysBetween(minDate, group.groupStart);
      const endOffset = daysBetween(minDate, group.groupEnd);
      for (let i = startOffset; i <= endOffset; i++) {
        if (i >= 0 && i < totalDays) {
          dailySets[i].add(group.majorLocation);
        }
      }
    }
  }

  const dailyLocations = dailySets.map((s) => Array.from(s));

  return {
    startDate: minDate,
    endDate: maxDate,
    dailyLocations,
    groups,
    errors: allWarnings,
  };
}

// ---------------------------------------------------------------------------
// Statistics helper
// ---------------------------------------------------------------------------

export interface CountryStat {
  location: string;
  days: number;
}

/**
 * Compute per-location day counts from a TravelParseResult.
 * Each day is counted at most once per location, even if it appears in multiple minor entries.
 */
export function computeStats(result: TravelParseResult): CountryStat[] {
  const counts = new Map<string, number>();
  for (const dayLocs of result.dailyLocations) {
    for (const loc of dayLocs) {
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([location, days]) => ({ location, days }))
    .sort((a, b) => b.days - a.days);
}

// ---------------------------------------------------------------------------
// Slice helper — for custom date range
// ---------------------------------------------------------------------------

/**
 * Slice a TravelParseResult to a custom date range.
 */
export function sliceResult(result: TravelParseResult, customStart: Date, customEnd: Date): TravelParseResult {
  const startOffset = Math.max(0, daysBetween(result.startDate, customStart));
  const endOffset = Math.min(result.dailyLocations.length - 1, daysBetween(result.startDate, customEnd));

  const sliced = result.dailyLocations.slice(startOffset, endOffset + 1);

  return {
    startDate: addDays(result.startDate, startOffset),
    endDate: addDays(result.startDate, endOffset),
    dailyLocations: sliced,
    groups: result.groups,
    errors: result.errors,
  };
}
