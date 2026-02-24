/**
 * Travel History Parser — using parser combinator style
 *
 * Design: Swiss SBB/CFF/FFS — information-dense, precision-first
 *
 * Data format (tab-separated):
 *
 * Type 1 — Multi-row group (big location + multiple small locations):
 *   20240221\t20240226\t申根區域\t希臘\t20240221\t20240221
 *   \t\t\t丹麥\t20240221\t20240224
 *   \t\t\t瑞典\t20240224\t20240224
 *   \t\t\t丹麥\t20240224\t20240226
 *
 * Type 2 — Single row with both big + small location:
 *   20240630\t20240705\t英國\t英格蘭\t\t
 *
 * Type 3 — Single row with big location only (small = big):
 *   20240219\t20240221\t新加坡\t\t\t
 */

// ---------------------------------------------------------------------------
// Core date utilities
// ---------------------------------------------------------------------------

/** Parse a YYYYMMDD string into a Date (local midnight). */
export function parseDate(s: string): Date {
  const y = parseInt(s.slice(0, 4), 10);
  const m = parseInt(s.slice(4, 6), 10) - 1;
  const d = parseInt(s.slice(6, 8), 10);
  return new Date(y, m, d);
}

/** Format a Date to YYYYMMDD string. */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

/** Format a Date to YYYY-MM-DD for display. */
export function formatDateDisplay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Add `n` days to a Date, returning a new Date. */
export function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

/** Number of days between two dates (end - start), inclusive of start. */
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / 86_400_000);
}

/** Compare two dates by value (ignoring time). */
export function dateEquals(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

/** Consume one token unconditionally. */
function anyToken(): Parser<string> {
  return satisfy(() => true, "any token");
}

/** Consume a token that matches a YYYYMMDD date string (non-empty). */
function dateToken(): Parser<string> {
  return satisfy((s) => /^\d{8}$/.test(s), "YYYYMMDD date");
}

/** Consume a token that is either a YYYYMMDD date or empty string. */
function optionalDateToken(): Parser<string | null> {
  return (tokens) => {
    if (tokens.length === 0) return { ok: true, value: null, rest: [] };
    const [head, ...rest] = tokens;
    if (/^\d{8}$/.test(head)) return { ok: true, value: head, rest };
    if (head === "") return { ok: true, value: null, rest };
    return { ok: false, error: `Expected optional date but got "${head}"` };
  };
}

/** Consume a non-empty text token. */
function textToken(): Parser<string> {
  return satisfy((s) => s.trim().length > 0, "non-empty text");
}

/** Consume an empty token. */
function emptyToken(): Parser<null> {
  return (tokens) => {
    if (tokens.length === 0) return { ok: true, value: null, rest: [] };
    const [head, ...rest] = tokens;
    if (head === "") return { ok: true, value: null, rest };
    return { ok: false, error: `Expected empty token but got "${head}"` };
  };
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

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

/** A single sub-location entry within a group. */
export interface SubEntry {
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
  /** Big location (e.g. "申根區域", "英國", "新加坡"). */
  bigLocation: string;
  /** Sub-location entries. If none given, defaults to bigLocation for the whole range. */
  subEntries: SubEntry[];
}

// ---------------------------------------------------------------------------
// Row-level parsers
// ---------------------------------------------------------------------------

/**
 * Parse a "header row" of a group:
 *   groupStart \t groupEnd \t bigLocation \t subLocation \t subStart \t subEnd
 *
 * The last three fields may be empty (Type 2/3).
 */
function parseHeaderRow(tokens: string[]): ParseResult<{
  groupStart: Date;
  groupEnd: Date;
  bigLocation: string;
  firstSub: SubEntry | null;
}> {
  // Expect exactly 6 tokens
  if (tokens.length < 6) {
    return { ok: false, error: `Header row needs 6 tokens, got ${tokens.length}` };
  }

  const [t0, t1, t2, t3, t4, t5] = tokens;

  if (!/^\d{8}$/.test(t0)) return { ok: false, error: `Invalid groupStart: "${t0}"` };
  if (!/^\d{8}$/.test(t1)) return { ok: false, error: `Invalid groupEnd: "${t1}"` };
  if (!t2.trim()) return { ok: false, error: `bigLocation is empty` };

  const groupStart = parseDate(t0);
  const groupEnd = parseDate(t1);
  const bigLocation = t2.trim();

  // Determine first sub entry
  let firstSub: SubEntry | null = null;
  const subLoc = t3.trim();
  const subStartStr = t4.trim();
  const subEndStr = t5.trim();

  if (subLoc) {
    // Type 2: has sub location but no sub dates → use group dates
    if (!subStartStr && !subEndStr) {
      firstSub = { location: subLoc, startDate: groupStart, endDate: groupEnd };
    } else if (subStartStr && subEndStr) {
      // Type 1 header: has sub location AND sub dates
      firstSub = {
        location: subLoc,
        startDate: parseDate(subStartStr),
        endDate: parseDate(subEndStr),
      };
    } else {
      // Partial — treat as Type 2
      firstSub = { location: subLoc, startDate: groupStart, endDate: groupEnd };
    }
  }
  // Type 3: no sub location → firstSub stays null (will default to bigLocation later)

  return {
    ok: true,
    value: { groupStart, groupEnd, bigLocation, firstSub },
    rest: [],
  };
}

/**
 * Parse a "continuation row" (starts with 3 empty tokens):
 *   \t \t \t subLocation \t subStart \t subEnd
 */
function parseContinuationRow(tokens: string[]): ParseResult<SubEntry> {
  if (tokens.length < 6) {
    return { ok: false, error: `Continuation row needs 6 tokens, got ${tokens.length}` };
  }
  const [t0, t1, t2, t3, t4, t5] = tokens;
  if (t0 !== "" || t1 !== "" || t2 !== "") {
    return { ok: false, error: `Not a continuation row (first 3 tokens not empty)` };
  }
  const subLoc = t3.trim();
  if (!subLoc) return { ok: false, error: `Continuation row has empty sub location` };
  if (!/^\d{8}$/.test(t4) || !/^\d{8}$/.test(t5)) {
    return { ok: false, error: `Continuation row has invalid dates: "${t4}", "${t5}"` };
  }
  return {
    ok: true,
    value: { location: subLoc, startDate: parseDate(t4), endDate: parseDate(t5) },
    rest: [],
  };
}

// ---------------------------------------------------------------------------
// Group-level parser
// ---------------------------------------------------------------------------

/**
 * Parse a group of rows (header + optional continuation rows) into a TravelGroup.
 */
function parseGroup(rows: string[][]): ParseResult<TravelGroup> {
  if (rows.length === 0) return { ok: false, error: "Empty group" };

  const headerResult = parseHeaderRow(rows[0]);
  if (!headerResult.ok) return headerResult;

  const { groupStart, groupEnd, bigLocation, firstSub } = headerResult.value;
  const subEntries: SubEntry[] = [];

  if (firstSub) subEntries.push(firstSub);

  // Parse continuation rows
  for (let i = 1; i < rows.length; i++) {
    const contResult = parseContinuationRow(rows[i]);
    if (!contResult.ok) {
      // If it looks like a new header, stop here (shouldn't happen in well-formed input)
      break;
    }
    subEntries.push(contResult.value);
  }

  // If no sub entries at all, default to bigLocation for the whole group range
  if (subEntries.length === 0) {
    subEntries.push({ location: bigLocation, startDate: groupStart, endDate: groupEnd });
  }

  return {
    ok: true,
    value: { groupStart, groupEnd, bigLocation, subEntries },
    rest: [],
  };
}

// ---------------------------------------------------------------------------
// Top-level text parser
// ---------------------------------------------------------------------------

/**
 * Split raw text into row-groups.
 * A new group starts when the first token of a row is a non-empty YYYYMMDD date.
 */
function splitIntoGroups(text: string): string[][][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const groups: string[][][] = [];
  let current: string[][] = [];

  for (const line of lines) {
    const tokens = line.split("\t");
    // Normalize to exactly 6 tokens
    while (tokens.length < 6) tokens.push("");
    const row = tokens.slice(0, 6);

    const isHeader = /^\d{8}$/.test(row[0].trim());
    if (isHeader) {
      if (current.length > 0) groups.push(current);
      current = [row];
    } else {
      // Continuation row
      if (current.length > 0) {
        current.push(row);
      }
      // else: orphan continuation row — ignore
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
  /** Any parse warnings (non-fatal). */
  warnings: string[];
}

/**
 * Parse travel history text data.
 *
 * @param dataText  Raw tab-separated travel data text.
 * @param isDetailed  If true, use sub-locations; otherwise use big locations.
 * @returns TravelParseResult
 */
export function parseTravelData(dataText: string, isDetailed: boolean): TravelParseResult {
  const warnings: string[] = [];
  const rawGroups = splitIntoGroups(dataText);
  const groups: TravelGroup[] = [];

  for (const rawGroup of rawGroups) {
    const result = parseGroup(rawGroup);
    if (result.ok) {
      groups.push(result.value);
    } else {
      warnings.push(`Skipped group: ${result.error}`);
    }
  }

  if (groups.length === 0) {
    // Return empty result
    const today = new Date();
    return {
      startDate: today,
      endDate: today,
      dailyLocations: [[]],
      groups: [],
      warnings: ["No valid groups found in input."],
    };
  }

  // Determine overall date range
  let minDate = groups[0].groupStart;
  let maxDate = groups[0].groupEnd;
  for (const g of groups) {
    if (g.groupStart < minDate) minDate = g.groupStart;
    if (g.groupEnd > maxDate) maxDate = g.groupEnd;
  }

  const totalDays = daysBetween(minDate, maxDate) + 1;
  // dailyLocations[i] = Set of locations for day i (offset from minDate)
  const dailySets: Set<string>[] = Array.from({ length: totalDays }, () => new Set<string>());

  for (const group of groups) {
    if (isDetailed) {
      // Use sub-entries
      for (const sub of group.subEntries) {
        const startOffset = daysBetween(minDate, sub.startDate);
        const endOffset = daysBetween(minDate, sub.endDate);
        for (let i = startOffset; i <= endOffset; i++) {
          if (i >= 0 && i < totalDays) {
            dailySets[i].add(sub.location);
          }
        }
      }
    } else {
      // Use big location for the whole group range
      const startOffset = daysBetween(minDate, group.groupStart);
      const endOffset = daysBetween(minDate, group.groupEnd);
      for (let i = startOffset; i <= endOffset; i++) {
        if (i >= 0 && i < totalDays) {
          dailySets[i].add(group.bigLocation);
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
    warnings,
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
 * Compute per-country day counts from a TravelParseResult.
 * Each day is counted at most once per country, even if it appears in multiple sub-entries.
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
 * The custom range must be within the original data range.
 */
export function sliceResult(
  result: TravelParseResult,
  customStart: Date,
  customEnd: Date
): TravelParseResult {
  const startOffset = Math.max(0, daysBetween(result.startDate, customStart));
  const endOffset = Math.min(
    result.dailyLocations.length - 1,
    daysBetween(result.startDate, customEnd)
  );

  const sliced = result.dailyLocations.slice(startOffset, endOffset + 1);

  return {
    startDate: addDays(result.startDate, startOffset),
    endDate: addDays(result.startDate, endOffset),
    dailyLocations: sliced,
    groups: result.groups,
    warnings: result.warnings,
  };
}
