import type { Translation } from "./types";

const enGB: Translation = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: "Travel History Visualiser",
  langLabel: "English (UK)",

  // ── Sidebar ───────────────────────────────────────────────────────────────
  dataInputLabel: "Travel Record Data",
  dataInputPlaceholder: "Paste travel records here (tab-separated)\u2026",
  formatHelpBtn: "Format Help ?",

  displayModeLabel: "Display Mode",
  modeDetailed: "Sub-location Mode",
  modeOverview: "Region Mode",

  parseBtn: "Parse & Display",
  showCalendarBtn: "Show Calendar",

  // ── Range ─────────────────────────────────────────────────────────────────
  rangeLabel: "Display Range",
  dataRangePrefix: "Data: ",
  rangeModeStartEnd: "Start & End Date",
  rangeModeStartDuration: "Start Date & Duration",
  rangeModeEndDuration: "End Date & Duration",
  startDateLabel: "Start Date",
  endDateLabel: "End Date",
  durationLabel: "Days (default 180)",
  displayRangeInfo: (start, end, days) => `Showing: ${start} \u2014 ${end} (${days} days)`,
  prevDayTitle: "Previous day",
  nextDayTitle: "Next day",

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: "Statistics",
  statsTotalDays: "Total Days",
  statsRecordedDays: "Recorded",
  statsLocations: "Locations",
  statsDaysSuffix: "d",

  // ── Warnings ──────────────────────────────────────────────────────────────
  warningsLabel: "Warnings",

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: "Calendar",
  calendarDaysSuffix: " days",

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: 'Paste your travel records and click "Parse & Display"',
  emptyDesc: "Three formats are supported: multi-line groups (region + sub-locations), single-line with sub-location, and single-line region only. Sample data is pre-loaded on the left.",
  emptyHelpLink: "View format guide \u2192",

  // ── Weekdays (Sun\u2013Sat) ────────────────────────────────────────────────────
  weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

  // ── Months ───────────────────────────────────────────────────────────────
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  // ── Range errors ─────────────────────────────────────────────────────────
  errStartTooEarly: (date) => `Start date cannot be earlier than ${date}`,
  errStartTooLate: (date) => `Start date cannot be later than ${date}`,
  errEndTooLate: (date) => `End date cannot be later than ${date}`,
  errEndBeforeStart: "End date cannot be earlier than start date",

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: "Record Format Guide",
  helpCloseBtn: "Close",
  helpIntro: "Each record consists of one or more lines, with fields separated by",
  helpTabNote: "Tab (\u21e5)",

  helpType1Title: "Format 1: Multi-line group (region + sub-locations)",
  helpType1Desc: "The first line contains the overall start/end dates, the region name, and the first sub-location. Subsequent lines begin with three empty fields and list additional sub-locations.",
  helpType1ColHeader: "Fields: [Group Start] [Group End] [Region] [Sub-location] [Sub Start] [Sub End]",
  helpType1Note: "This means 2024-06-29 to 2024-06-30 in the Schengen Area (region); sub-locations: Switzerland and France on 29 Jun, Switzerland on 29\u201330 Jun.",

  helpType2Title: "Format 2: Single line with region and sub-location",
  helpType2Desc: "One line only. Field 4 contains the sub-location; fields 5 and 6 are empty. The sub-location date range matches the region.",
  helpType2ColHeader: "Fields: [Start] [End] [Region] [Sub-location] [Empty] [Empty]",
  helpType2Note: "This means 2024-06-30 to 2024-07-05 in the UK (region), sub-location England, same date range.",

  helpType3Title: "Format 3: Single line, region only",
  helpType3Desc: "One line only. Fields 4, 5, and 6 are all empty. The sub-location defaults to the same as the region.",
  helpType3ColHeader: "Fields: [Start] [End] [Region] [Empty] [Empty] [Empty]",
  helpType3Note: "This means 2024-07-18 to 2024-07-21 in China; both region and sub-location are China.",

  helpNotesTitle: "Notes",
  helpNote1: "Date format is YYYYMMDD (8 digits, no separators).",
  helpNote2: "Fields are separated by a single Tab character, not spaces.",
  helpNote3: "If the same day appears in multiple sub-location records (e.g. 20240224 Denmark), it is counted only once.",
  helpNote4: '"Sub-location Mode" uses sub-locations; "Region Mode" uses regions.',
  helpNote5: "Blank lines between records are ignored.",

  helpExampleTitle: "Full Example",

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: "\u00d7",
};

export default enGB;
