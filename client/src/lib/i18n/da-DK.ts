import type { Translation } from "./types";

const daDK: Translation = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: "Rejsehistorik",
  langLabel: "Dansk",
  languageSectionLabel: "Sprog",

  // ── Sidebar ───────────────────────────────────────────────────────────────
  dataInputLabel: "Rejsedata",
  dataInputPlaceholder: "Indsæt rejsedata her (tabulatorsepareret)…",
  expandEditorBtn: "Udvid editor",
  editorDialogTitle: "Rediger rejseposter",
  editorDialogApply: "Anvend",
  editorDialogCancel: "Annuller",

  formatHelpBtn: "Formathjælp ?",

  displayModeLabel: "Visningstilstand",
  modeDetailed: "Understed-tilstand",
  modeOverview: "Hovedsted-tilstand",

  weekStartLabel: "Uge starter på",
  weekStartSun: "Søndag",
  weekStartMon: "Mandag",

  parseBtn: "Analysér og vis",
  showCalendarBtn: "Vis kalender",

  // ── Range ─────────────────────────────────────────────────────────────────
  rangeLabel: "Visningsperiode",
  dataRangePrefix: "Data: ",
  rangeModeStartEnd: "Start–Slut",
  rangeModeStartDuration: "Start+Dage",
  rangeModeEndDuration: "Slut+Dage",
  startDateLabel: "Startdato",
  endDateLabel: "Slutdato",
  durationLabel: "Dage (standard 180)",
  displayRangeInfo: (start, end, days) => `Viser: ${start} — ${end} (${days} dage)`,
  prevDayTitle: "Forrige dag",
  nextDayTitle: "Næste dag",

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: "Statistik",
  statsTotalDays: "Dage i alt",
  statsRecordedDays: "Registreret",
  statsLocations: "Steder",
  statsDaysSuffix: "d",

  // ── Errors ────────────────────────────────────────────────────────────────
  errorsLabel: "Fejl",
  errorDialogTitle: "Analysefejl",
  errorDialogClose: "Luk",

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: "Kalender",
  calendarDaysSuffix: " dage",

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: 'Indsæt rejsedata og klik "Analysér og vis"',
  emptyDesc: "Tre formater understøttes: flerlinjegrupper (region + understeder), enkeltlinje med understed og enkeltlinje kun med region. Eksempeldata er forudindlæst til venstre.",
  emptyHelpLink: "Se formatguide →",

  // ── Weekdays (Sun–Sat) ────────────────────────────────────────────────────
  weekdays: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"],

  // ── Months ───────────────────────────────────────────────────────────────
  months: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],

  // ── Range errors ─────────────────────────────────────────────────────────
  errStartTooEarly: (date) => `Startdato må ikke være tidligere end ${date}`,
  errStartTooLate: (date) => `Startdato må ikke være senere end ${date}`,
  errEndTooLate: (date) => `Slutdato må ikke være senere end ${date}`,
  errEndBeforeStart: "Slutdato må ikke være tidligere end startdato",

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: "Formatguide",
  helpCloseBtn: "Luk",
  helpIntro: "Hver post består af én eller flere linjer, hvor felter er adskilt af",
  helpTabNote: "Tab (⇥)",
  helpIntroCont: " til at adskille 6 felter pr. linje. Tre formater understøttes:",
  helpEmptyCell: "Tom",

  helpType1Title: "Format 1: Flerlinjegruppe (region + understeder)",
  helpType1Desc: "Første linje indeholder de overordnede start-/slutdatoer, regionnavnet og det første understed. Efterfølgende linjer begynder med tre tomme felter og angiver yderligere understeder.",
  helpType1ColHeader: "Felter: [Gruppestart] [Gruppeslut] [Region] [Understed] [Understart] [Underslut]",
  helpType1Note: "Dette betyder 2024-06-29 til 2024-06-30 i Schengenområdet (region); understeder: Schweiz og Frankrig den 29. jun, Schweiz den 29.–30. jun.",

  helpType2Title: "Format 2: Enkeltlinje med region og understed",
  helpType2Desc: "Kun én linje. Felt 4 indeholder understedet; felt 5 og 6 er tomme. Understedets datointerval svarer til regionens.",
  helpType2ColHeader: "Felter: [Start] [Slut] [Region] [Understed] [Tom] [Tom]",
  helpType2Note: "Dette betyder 2024-06-30 til 2024-07-05 i UK (region), understed England, samme datointerval.",

  helpType3Title: "Format 3: Enkeltlinje, kun region",
  helpType3Desc: "Kun én linje. Felt 4, 5 og 6 er alle tomme. Understedet er som standard det samme som regionen.",
  helpType3ColHeader: "Felter: [Start] [Slut] [Region] [Tom] [Tom] [Tom]",
  helpType3Note: "Dette betyder 2024-07-18 til 2024-07-21 i Kina; både region og understed er Kina.",

  helpNotesTitle: "Bemærkninger",
  helpNote1: "Datoformat er YYYYMMDD (8 cifre, ingen separatorer).",
  helpNote2: "Felter adskilles af Tab (\u21e5) eller komma (,) — begge virker, men bland dem ikke på samme linje.",
  helpNote3: "Hvis samme dag optræder i flere understeds-poster (f.eks. 20240224 Danmark), tælles den kun én gang.",
  helpNote4: '"Understed-tilstand" bruger understeder; "Hovedsted-tilstand" bruger regioner.',
  helpNote5: "Tomme linjer mellem poster ignoreres.",

  helpExampleTitle: "Fuldt eksempel",
  helpExSchengen: "Schengen-området",
  helpExSwitzerland: "Schweiz",
  helpExFrance: "Frankrig",
  helpExUK: "Storbritannien",
  helpExEngland: "England",
  helpExChina: "Kina",

  helpExampleData: [
    "20240629,20240630,Schengen-området,Schweiz,20240629,20240629",
    ",,,Frankrig,20240629,20240629",
    ",,,Schweiz,20240629,20240630",
    "20240630,20240705,Storbritannien,England,,",
    "20240705,20240708,Schengen-området,Frankrig,,",
    "20240708,20240717,Storbritannien,England,,",
    "20240718,20240721,Kina,,,",
  ].join("\n"),

  defaultSampleData: [
    "20240629,20240630,Schengen-området,Schweiz,20240629,20240629",
    ",,,Frankrig,20240629,20240629",
    ",,,Schweiz,20240629,20240630",
    "20240630,20240705,Storbritannien,England,,",
    "20240705,20240708,Schengen-området,Frankrig,,",
    "20240708,20240717,Storbritannien,England,,",
    "20240718,20240721,Kina,,,",
  ].join("\n"),

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: "×",
};

export default daDK;
