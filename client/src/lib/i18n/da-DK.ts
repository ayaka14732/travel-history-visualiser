import type { Translation } from './types';

const daDK: Translation = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: 'Visualisering af rejsehistorik',
  langLabel: 'Dansk',
  languageSectionLabel: 'Sprog',

  // ── Sidebar ───────────────────────────────────────────────────────────────
  dataInputLabel: 'Rejsedata',
  editDataBtn: 'Rediger data',
  editorDialogTitle: 'Rediger rejseposter',
  editorDialogApply: 'Anvend',
  editorDialogCancel: 'Annuller',

  formatHelpBtn: 'Formathjælp ?',

  displayModeLabel: 'Visningstilstand',
  modeDetailed: 'Lille sted-tilstand',
  modeOverview: 'Stort sted-tilstand',

  weekStartLabel: 'Uge starter på',
  weekStartSun: 'Søndag',
  weekStartMon: 'Mandag',

  parseBtn: 'Analysér og vis',
  showCalendarBtn: 'Vis kalender',

  // ── Range ─────────────────────────────────────────────────────────────────
  rangeLabel: 'Visningsperiode',
  dataRangePrefix: 'Data: ',
  rangeModeStartEnd: 'Start–Slut',
  rangeModeStartDuration: 'Start+Dage',
  rangeModeEndDuration: 'Slut+Dage',
  startDateLabel: 'Startdato',
  endDateLabel: 'Slutdato',
  durationLabel: 'Dage (standard 180)',
  displayRangeInfo: (start, end, days) => `Viser: ${start} — ${end} (${days} dage)`,
  prevDayTitle: 'Forrige dag',
  nextDayTitle: 'Næste dag',

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: 'Statistik',
  statsTotalDays: 'Dage i alt',
  statsRecordedDays: 'Registreret',
  statsLocations: 'Steder',
  statsDaysSuffix: 'd',

  // ── Errors ────────────────────────────────────────────────────────────────
  errorsLabel: 'Fejl',
  errorDialogTitle: 'Analysefejl',
  errorDialogClose: 'Luk',

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: 'Kalender',
  calendarDaysSuffix: ' dage',

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: 'Indsæt rejsedata og klik "Analysér og vis"',
  emptyDesc:
    'Tre formater understøttes: flerlinjegrupper (stort sted + små steder), enkeltlinje med lille sted og enkeltlinje kun med stort sted. Eksempeldata er forudindlæst til venstre.',
  emptyHelpLink: 'Se formatguide →',

  // ── Weekdays (Sun–Sat) ────────────────────────────────────────────────────
  weekdays: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],

  // ── Months ───────────────────────────────────────────────────────────────
  months: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],

  // ── Range errors ─────────────────────────────────────────────────────────
  errStartTooEarly: (date) => `Startdato må ikke være tidligere end ${date}`,
  errStartTooLate: (date) => `Startdato må ikke være senere end ${date}`,
  errEndTooLate: (date) => `Slutdato må ikke være senere end ${date}`,
  errEndBeforeStart: 'Slutdato må ikke være tidligere end startdato',

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: 'Formatguide',
  helpCloseBtn: 'Luk',
  helpIntro: 'Hver post består af én eller flere linjer, hvor felter er adskilt af',
  helpTabNote: 'Tab (⇥) eller komma (,)',
  helpIntroCont: ' til at adskille 6 felter pr. linje. Tre formater understøttes:',
  helpEmptyCell: 'Tom',

  helpType1Title: 'Format 1: Flerlinjegruppe (stort sted + små steder)',
  helpType1Desc:
    'Første linje indeholder de overordnede start-/slutdatoer, det store steds navn og det første lille sted. Efterfølgende linjer begynder med tre tomme felter og angiver yderligere små steder.',
  helpType1ColHeader: 'Felter: [Gruppestart] [Gruppeslut] [Stort sted] [Lille sted] [Lille start] [Lille slut]',
  helpType1Note:
    'Dette betyder 2024-06-29 til 2024-06-30 i Schengenområdet (stort sted); små steder: Schweiz og Frankrig den 29. jun, Schweiz den 29.–30. jun.',

  helpType2Title: 'Format 2: Enkeltlinje med stort sted og lille sted',
  helpType2Desc:
    'Kun én linje. Felt 4 indeholder det lille sted; felt 5 og 6 er tomme. Det lille steds datointerval svarer til det store steds.',
  helpType2ColHeader: 'Felter: [Start] [Slut] [Stort sted] [Lille sted] [Tom] [Tom]',
  helpType2Note: 'Dette betyder 2024-06-30 til 2024-07-05 i UK (stort sted), lille sted England, samme datointerval.',

  helpType3Title: 'Format 3: Enkeltlinje, kun stort sted',
  helpType3Desc: 'Kun én linje. Felt 4, 5 og 6 er alle tomme. Det lille sted er som standard det samme som det store sted.',
  helpType3ColHeader: 'Felter: [Start] [Slut] [Stort sted] [Tom] [Tom] [Tom]',
  helpType3Note: 'Dette betyder 2024-07-18 til 2024-07-21 i Kina; både stort sted og lille sted er Kina.',

  helpNotesTitle: 'Bemærkninger',
  helpNote1: 'Datoformat er YYYYMMDD (8 cifre, ingen separatorer).',
  helpNote2: 'Felter adskilles af Tab (\u21e5) eller komma (,) — begge virker, men bland dem ikke på samme linje.',
  helpNote3: 'Hvis samme dag optræder i flere lille sted-poster (f.eks. 20240224 Danmark), tælles den kun én gang.',
  helpNote4: '"Lille sted-tilstand" bruger små steder; "Stort sted-tilstand" bruger store steder.',
  helpNote5: 'Tomme linjer mellem poster ignoreres.',

  helpExampleTitle: 'Fuldt eksempel',
  helpExSchengen: 'Schengen-området',
  helpExSwitzerland: 'Schweiz',
  helpExFrance: 'Frankrig',
  helpExUK: 'Storbritannien',
  helpExEngland: 'England',
  helpExChina: 'Kina',

  helpExampleData: [
    '20240629,20240630,Schengen-området,Schweiz,20240629,20240629',
    ',,,Frankrig,20240629,20240629',
    ',,,Schweiz,20240629,20240630',
    '20240630,20240705,Storbritannien,England,,',
    '20240705,20240708,Schengen-området,Frankrig,,',
    '20240708,20240717,Storbritannien,England,,',
    '20240718,20240721,Kina,,,',
  ].join('\n'),

  defaultSampleData: [
    '20240629,20240630,Schengen-området,Schweiz,20240629,20240629',
    ',,,Frankrig,20240629,20240629',
    ',,,Schweiz,20240629,20240630',
    '20240630,20240705,Storbritannien,England,,',
    '20240705,20240708,Schengen-området,Frankrig,,',
    '20240708,20240717,Storbritannien,England,,',
    '20240718,20240721,Kina,,,',
  ].join('\n'),

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: '×',
};

export default daDK;
