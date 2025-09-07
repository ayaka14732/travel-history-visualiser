type BoundMode = "countAs0" | "countAs0.5" | "countAs1";

interface Span {
  start: number;
  end: number;
}

/**
 * Computes the effective count of unique integers covered by a list of spans,
 * applying inclusion rules for boundary values and a global range filter.
 *
 * ## Span Definition
 * Each `Span` is a interval defined by two integers: `start` and `end`.
 * Spans represent intervals from `start` to `end`.
 *
 * ## Bound Modes
 * `lowerBoundMode` and `upperBoundMode` define how the `start` and `end` boundaries
 * of each span are treated, respectively.
 *
 * - "countAs0"   : Excludes the bound entirely.
 * - "countAs0.5" : Includes the bound, but it is counted as 0.5 instead of 1.
 * - "countAs1"   : Includes the bound fully (as 1).
 *
 * ## Conflict Resolution
 * If a single number appears as both an end of one span and a start of another,
 * and the bound modes disagree, the **more inclusive mode** takes precedence:
 * "countAs1" > "countAs0.5" > "countAs0".
 * The number is only counted once globally, with the highest applicable weight.
 *
 * ## Cutoffs
 * `lowerCutOff` and `upperCutOff` define global exclusion thresholds:
 * - Values < `lowerCutOff` or > `upperCutOff` are ignored entirely, regardless of bound modes.
 *
 * @param spans           List of Span objects with `start` and `end` integers.
 * @param lowerBoundMode  Mode for treating the `start` of each span.
 * @param upperBoundMode  Mode for treating the `end` of each span.
 * @param lowerCutOff     Lower global cutoff.
 * @param upperCutOff     Upper global cutoff.
 *
 * @returns Total count of all unique integers across all spans, respecting boundary rules,
 *          cutoff range, and multi-count prevention, where 0.5 and 1 are accumulated as-is.
 */
const numSpansToCount = (
  spans: Span[],
  lowerBoundMode: BoundMode,
  upperBoundMode: BoundMode,
  lowerCutOff: number | null,
  upperCutOff: number | null
): number => {
  const weightMap: Map<number, number> = new Map(); // for boundary values
  let total = 0;

  const getWeight = (existing: number | undefined, incoming: number): number => {
    if (existing === undefined) return incoming;
    return Math.max(existing, incoming);
  };

  const modeToWeight = (mode: BoundMode): number => (mode === "countAs1" ? 1 : mode === "countAs0.5" ? 0.5 : 0);

  const lowerWeight = modeToWeight(lowerBoundMode);
  const upperWeight = modeToWeight(upperBoundMode);

  // TODO: handle start < lastEnd
  for (let { start, end } of spans) {
    // Clamp within cut-off boundaries
    if (lowerCutOff !== null) {
      if (end < lowerCutOff) continue;
      start = Math.max(start, lowerCutOff);
    }
    if (upperCutOff !== null) {
      if (start > upperCutOff) continue;
      end = Math.min(end, upperCutOff);
    }

    // Count lower bound
    if (lowerWeight > 0) {
      weightMap.set(start, getWeight(weightMap.get(start), lowerWeight));
    }

    // Count upper bound
    if (upperWeight > 0) {
      weightMap.set(end, getWeight(weightMap.get(end), upperWeight));
    }

    // Count the in-between values (weight = 1)
    total += start === end ? 0 : end - start - 1;
  }

  const boundaryWeights = Array.from(weightMap.values()).reduce((sum, w) => sum + w, 0);
  return total + boundaryWeights;
};

export default numSpansToCount;
