/**
 * Tests for travelParser.ts
 *
 * Run with: pnpm vitest run
 */

import { describe, it, expect } from "vitest";
import {
  parseTravelData,
  tryParseDate,
  formatDateDisplay,
  daysBetween,
  addDays,
} from "./travelParser";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a tab-separated line from an array of strings. */
function row(...cols: string[]): string {
  return cols.join("\t");
}

/** Shorthand: join lines into a data string. */
function data(...lines: string[]): string {
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// tryParseDate
// ---------------------------------------------------------------------------

describe("tryParseDate", () => {
  it("parses a valid date", () => {
    const d = tryParseDate("20240229"); // 2024 is a leap year
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2024);
    expect(d!.getMonth()).toBe(1); // 0-indexed
    expect(d!.getDate()).toBe(29);
  });

  it("returns null for non-8-digit string", () => {
    expect(tryParseDate("2024022")).toBeNull();
    expect(tryParseDate("202402210")).toBeNull();
    expect(tryParseDate("abcdefgh")).toBeNull();
    expect(tryParseDate("")).toBeNull();
  });

  it("returns null for invalid calendar date", () => {
    expect(tryParseDate("20241399")).toBeNull(); // month 13
    expect(tryParseDate("20240230")).toBeNull(); // Feb 30
    expect(tryParseDate("20230229")).toBeNull(); // 2023 is not a leap year
    expect(tryParseDate("20240132")).toBeNull(); // day 32
  });

  it("accepts valid boundary dates", () => {
    expect(tryParseDate("20240101")).not.toBeNull();
    expect(tryParseDate("20241231")).not.toBeNull();
    expect(tryParseDate("20240228")).not.toBeNull();
    expect(tryParseDate("20240229")).not.toBeNull(); // leap year
  });
});

// ---------------------------------------------------------------------------
// Type 3: single row, big location only
// ---------------------------------------------------------------------------

describe("Type 3 — single row, big location only", () => {
  const input = data(
    row("20240718", "20240721", "中國", "", "", "")
  );

  it("detailed mode: small location defaults to big location", () => {
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
    expect(formatDateDisplay(result.startDate)).toBe("2024-07-18");
    expect(formatDateDisplay(result.endDate)).toBe("2024-07-21");
    // 4 days: 18, 19, 20, 21
    expect(result.dailyLocations).toHaveLength(4);
    for (const day of result.dailyLocations) {
      expect(day).toEqual(["CN"]);
    }
  });

  it("overview mode: uses big location", () => {
    const result = parseTravelData(input, false);
    for (const day of result.dailyLocations) {
      expect(day).toEqual(["CN"]);
    }
  });
});

// ---------------------------------------------------------------------------
// Type 2: single row with sub-location, no sub dates
// ---------------------------------------------------------------------------

describe("Type 2 — single row with sub-location, no sub dates", () => {
  const input = data(
    row("20240630", "20240705", "英國", "英格蘭", "", "")
  );

  it("detailed mode: uses sub-location for entire range", () => {
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations).toHaveLength(6); // 30 Jun – 5 Jul
    for (const day of result.dailyLocations) {
      expect(day).toEqual(["GB-ENG"]);
    }
  });

  it("overview mode: uses big location", () => {
    const result = parseTravelData(input, false);
    for (const day of result.dailyLocations) {
      expect(day).toEqual(["GB"]);
    }
  });
});

// ---------------------------------------------------------------------------
// Type 1: multi-row group
// ---------------------------------------------------------------------------

describe("Type 1 — multi-row group", () => {
  // 20240221–20240226 申根區域
  //   希臘  20240221–20240221
  //   丹麥  20240221–20240224
  //   瑞典  20240224–20240224
  //   丹麥  20240224–20240226
  const input = data(
    row("20240221", "20240226", "申根區域", "希臘", "20240221", "20240221"),
    row("", "", "", "丹麥", "20240221", "20240224"),
    row("", "", "", "瑞典", "20240224", "20240224"),
    row("", "", "", "丹麥", "20240224", "20240226")
  );

  it("detailed mode: correct locations per day", () => {
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
    // 6 days: 21, 22, 23, 24, 25, 26
    expect(result.dailyLocations).toHaveLength(6);

    // Day 0: 20240221 — GR + DK
    expect(result.dailyLocations[0].sort()).toEqual(["DK", "GR"]);
    // Day 1: 20240222 — 丹麥 only
    expect(result.dailyLocations[1]).toEqual(["DK"]);
    // Day 2: 20240223 — 丹麥 only
    expect(result.dailyLocations[2]).toEqual(["DK"]);
    // Day 3: 20240224 — DK + SE (DK deduplicated)
    expect(result.dailyLocations[3].sort()).toEqual(["DK", "SE"]);
    // Day 4: 20240225 — 丹麥
    expect(result.dailyLocations[4]).toEqual(["DK"]);
    // Day 5: 20240226 — 丹麥
    expect(result.dailyLocations[5]).toEqual(["DK"]);
  });

  it("overview mode: all days are SCHENGEN", () => {
    const result = parseTravelData(input, false);
    for (const day of result.dailyLocations) {
      expect(day).toEqual(["SCHENGEN"]);
    }
  });

  it("deduplication: 20240224 丹麥 appears in two sub-entries but counts as 1 day", () => {
    const result = parseTravelData(input, true);
    // Day 3 (20240224) should have 丹麥 exactly once
    const day3 = result.dailyLocations[3];
    const danmarkCount = day3.filter((l) => l === "DK").length;
    expect(danmarkCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Mixed types: multiple groups
// ---------------------------------------------------------------------------

describe("Mixed groups — full sample data", () => {
  const input = data(
    row("20240629", "20240630", "申根區域", "瑞士", "20240629", "20240629"),
    row("", "", "", "法國", "20240629", "20240629"),
    row("", "", "", "瑞士", "20240629", "20240630"),
    row("20240630", "20240705", "英國", "英格蘭", "", ""),
    row("20240705", "20240708", "申根區域", "法國", "", ""),
    row("20240708", "20240717", "英國", "英格蘭", "", ""),
    row("20240718", "20240721", "中國", "", "", "")
  );

  it("parses without warnings", () => {
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
  });

  it("startDate is 2024-06-29, endDate is 2024-07-21", () => {
    const result = parseTravelData(input, true);
    expect(formatDateDisplay(result.startDate)).toBe("2024-06-29");
    expect(formatDateDisplay(result.endDate)).toBe("2024-07-21");
  });

  it("detailed: 2024-06-29 has CH and FR", () => {
    const result = parseTravelData(input, true);
    expect(result.dailyLocations[0].sort()).toEqual(["CH", "FR"]);
  });

  it("detailed: 2024-06-30 has CH and GB-ENG", () => {
    const result = parseTravelData(input, true);
    // offset 1 = 2024-06-30
    expect(result.dailyLocations[1].sort()).toEqual(["CH", "GB-ENG"]);
  });

  it("detailed: 2024-07-05 has GB-ENG and FR (transition day)", () => {
    const result = parseTravelData(input, true);
    // 2024-07-05 = offset 6
    const offset = daysBetween(result.startDate, new Date(2024, 6, 5));
    expect(result.dailyLocations[offset].sort()).toEqual(["FR", "GB-ENG"]);
  });

  it("overview: 2024-07-01 is GB", () => {
    const result = parseTravelData(input, false);
    const offset = daysBetween(result.startDate, new Date(2024, 6, 1));
    expect(result.dailyLocations[offset]).toEqual(["GB"]);
  });
});

// ---------------------------------------------------------------------------
// Validation: subEnd after groupEnd (the 20250526 typo scenario)
// ---------------------------------------------------------------------------

describe("Validation — subEnd after groupEnd", () => {
  // Simulates the typo: 20250526 instead of 20260526
  const input = data(
    row("20260521", "20260525", "英國", "英格蘭", "", ""),
    row("20260525", "20260604", "申根區域", "丹麥", "20260525", "20250526"), // typo: 2025
    row("", "", "", "法羅羣島", "20260526", "20260604")
  );

  it("emits a warning about subEnd before groupStart (year typo)", () => {
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some(
      (w) => w.includes("DK") && (w.includes("before groupStart") || w.includes("subEnd"))
    );
    expect(hasWarning).toBe(true);
  });

  it("still parses 法羅羣島 correctly despite the typo row", () => {
    const result = parseTravelData(input, true);
    // 法羅羣島 should appear from 20260526 to 20260604
    const offset526 = daysBetween(result.startDate, new Date(2026, 4, 26));
    expect(result.dailyLocations[offset526]).toContain("FO");
  });

  it("correct data (no typo) has no warnings", () => {
    const correctInput = data(
      row("20260521", "20260525", "英國", "英格蘭", "", ""),
      row("20260525", "20260604", "申根區域", "丹麥", "20260525", "20260526"),
      row("", "", "", "法羅羣島", "20260526", "20260604")
    );
    const result = parseTravelData(correctInput, true);
    expect(result.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Validation: subStart before groupStart
// ---------------------------------------------------------------------------

describe("Validation — subStart before groupStart", () => {
  const input = data(
    row("20240601", "20240610", "英國", "英格蘭", "20240531", "20240605") // subStart 1 day early
  );

  it("emits a warning about subStart before groupStart", () => {
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some(
      (w) => w.includes("GB-ENG") && w.includes("before groupStart")
    );
    expect(hasWarning).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Validation: subEnd before subStart
// ---------------------------------------------------------------------------

describe("Validation — subEnd before subStart", () => {
  const input = data(
    row("20240601", "20240610", "英國", "英格蘭", "20240605", "20240603") // end before start
  );

  it("emits a warning about subEnd before subStart", () => {
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some(
      (w) => w.includes("GB-ENG") && w.includes("before subStart")
    );
    expect(hasWarning).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Validation: groupEnd before groupStart
// ---------------------------------------------------------------------------

describe("Validation — groupEnd before groupStart", () => {
  const input = data(
    row("20240610", "20240601", "英國", "", "", "") // end before start
  );

  it("emits a warning about groupEnd before groupStart", () => {
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some(
      (w) => w.includes("groupEnd") && w.includes("before groupStart")
    );
    expect(hasWarning).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Validation: invalid date strings
// ---------------------------------------------------------------------------

describe("Validation — invalid date strings", () => {
  it("warns about non-8-digit date in sub-entry", () => {
    const input = data(
      row("20240601", "20240610", "英國", "英格蘭", "2024060X", "20240605")
    );
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some((w) => w.includes("2024060X"));
    expect(hasWarning).toBe(true);
  });

  it("warns about invalid calendar date (month 13)", () => {
    const input = data(
      row("20241399", "20241405", "英國", "", "", "")
    );
    // Fatal error: groupStart is invalid, group is skipped
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some(
      (w) => w.includes("20241399") || w.includes("Skipped group") || w.includes("not a valid calendar date") || w.includes("Invalid groupStart")
    );
    expect(hasWarning).toBe(true);
  });

  it("warns about Feb 29 in non-leap year", () => {
    const input = data(
      row("20230229", "20230305", "英國", "", "", "")
    );
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some(
      (w) => w.includes("20230229") || w.includes("Skipped group") || w.includes("not a valid calendar date") || w.includes("Invalid groupStart")
    );
    expect(hasWarning).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Validation: continuation row with invalid dates
// ---------------------------------------------------------------------------

describe("Validation — continuation row with invalid dates", () => {
  it("skips continuation row with invalid date and warns", () => {
    const input = data(
      row("20240601", "20240610", "申根區域", "法國", "20240601", "20240605"),
      row("", "", "", "德國", "20240606", "2024XXXX") // invalid subEnd
    );
    const result = parseTravelData(input, true);
    const hasWarning = result.errors.some(
      (w) => w.includes("DE") || w.includes("Skipped continuation")
    );
    expect(hasWarning).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("Edge cases", () => {
  it("single-day trip", () => {
    const input = data(row("20240101", "20240101", "新加坡", "", "", ""));
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations).toHaveLength(1);
    expect(result.dailyLocations[0]).toEqual(["SG"]);
  });

  it("empty input returns a warning", () => {
    const result = parseTravelData("", true);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((w) => w.includes("No valid groups"))).toBe(true);
  });

  it("blank lines between records are ignored", () => {
    const input = data(
      row("20240101", "20240103", "新加坡", "", "", ""),
      "",
      "   ",
      row("20240104", "20240106", "英國", "", "", "")
    );
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
    expect(result.groups).toHaveLength(2);
  });

  it("rows with fewer than 6 tokens are padded correctly", () => {
    // Only 3 tokens — should still parse as Type 3
    const input = "20240101\t20240103\t新加坡";
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["SG"]);
  });

  it("addDays and daysBetween are inverses", () => {
    const base = new Date(2024, 0, 1);
    for (const n of [0, 1, 30, 365, -1, -30]) {
      const shifted = addDays(base, n);
      expect(daysBetween(base, shifted)).toBe(n);
    }
  });
});

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

describe("computeStats deduplication", () => {
  it("20240224 丹麥 in two sub-entries counts as 1 day", async () => {
    const input = data(
      row("20240221", "20240226", "申根區域", "希臘", "20240221", "20240221"),
      row("", "", "", "丹麥", "20240221", "20240224"),
      row("", "", "", "瑞典", "20240224", "20240224"),
      row("", "", "", "丹麥", "20240224", "20240226")
    );
    const result = parseTravelData(input, true);
    const { computeStats } = await import("./travelParser");
    const stats = computeStats(result);
    const denmark = stats.find((s) => s.location === "DK");
    // 丹麥: 21, 22, 23, 24, 25, 26 = 6 days
    expect(denmark?.days).toBe(6);
    // 瑞典: only 24 = 1 day
    const sweden = stats.find((s) => s.location === "SE");
    expect(sweden?.days).toBe(1);
    // 希臘: only 21 = 1 day
    const greece = stats.find((s) => s.location === "GR");
    expect(greece?.days).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Location normalisation (countryData integration)
// ---------------------------------------------------------------------------

describe("Location normalisation", () => {
  it("Chinese input 英國 resolves to GB", () => {
    const result = parseTravelData(
      "20240101\t20240103\t英國\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["GB"]);
  });

  it("ISO code input GB resolves to GB", () => {
    const result = parseTravelData(
      "20240101\t20240103\tGB\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["GB"]);
  });

  it("Chinese input 丹麥 resolves to DK", () => {
    const result = parseTravelData(
      "20240101\t20240103\t丹麥\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["DK"]);
  });

  it("alternate Chinese name 千里達和多巴哥 resolves to TT", () => {
    const result = parseTravelData(
      "20240101\t20240103\t千里達和多巴哥\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["TT"]);
  });

  it("alternate Chinese name 特立尼達和多巴哥 also resolves to TT", () => {
    const result = parseTravelData(
      "20240101\t20240103\t特立尼達和多巴哥\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["TT"]);
  });

  it("known location 申根區域 resolves to SCHENGEN", () => {
    const result = parseTravelData(
      "20240101\t20240103\t申根區域\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["SCHENGEN"]);
  });

  it("English input Denmark resolves to DK", () => {
    const result = parseTravelData(
      "20240101\t20240103\tDenmark\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["DK"]);
  });

  it("French input France resolves to FR", () => {
    const result = parseTravelData(
      "20240101\t20240103\tFrance\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["FR"]);
  });

  it("case-insensitive: 'united kingdom' resolves to GB", () => {
    const result = parseTravelData(
      "20240101\t20240103\tunited kingdom\t\t\t",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["GB"]);
  });
});

// ---------------------------------------------------------------------------
// Comma-separated input
// ---------------------------------------------------------------------------

describe("Comma-separated input", () => {
  it("Type 3 with commas: single row big location only", () => {
    const result = parseTravelData(
      "20240718,20240721,中國,,,",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(formatDateDisplay(result.startDate)).toBe("2024-07-18");
    expect(formatDateDisplay(result.endDate)).toBe("2024-07-21");
    expect(result.dailyLocations).toHaveLength(4);
    expect(result.dailyLocations[0]).toEqual(["CN"]);
  });

  it("Type 2 with commas: single row with sub-location", () => {
    const result = parseTravelData(
      "20240630,20240705,英國,英格蘭,,",
      true
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["GB-ENG"]);
  });

  it("Type 1 with commas: multi-row group", () => {
    const input = [
      "20240629,20240630,申根區域,瑞士,20240629,20240629",
      ",,,法國,20240629,20240629",
      ",,,瑞士,20240629,20240630",
    ].join("\n");
    const result = parseTravelData(input, true);
    expect(result.errors).toHaveLength(0);
    expect(formatDateDisplay(result.startDate)).toBe("2024-06-29");
    expect(formatDateDisplay(result.endDate)).toBe("2024-06-30");
    // Day 0 (Jun 29): CH + FR
    expect(result.dailyLocations[0].sort()).toEqual(["CH", "FR"]);
    // Day 1 (Jun 30): CH only
    expect(result.dailyLocations[1]).toEqual(["CH"]);
  });

  it("comma input: location resolves to ISO code", () => {
    const result = parseTravelData(
      "20240101,20240103,Denmark,,,",
      false
    );
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["DK"]);
  });

  it("mixed: tab and comma lines in same input each parse independently", () => {
    const input = [
      "20240718\t20240721\t中國\t\t\t",
      "20240722,20240725,Denmark,,,",
    ].join("\n");
    const result = parseTravelData(input, false);
    expect(result.errors).toHaveLength(0);
    expect(result.dailyLocations[0]).toEqual(["CN"]);
    expect(result.dailyLocations[4]).toEqual(["DK"]);
  });
});
