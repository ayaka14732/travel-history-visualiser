import type { Translation } from './types';

const enGB: Translation = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: 'Travel History Visualiser',
  langLabel: 'English',
  languageSectionLabel: 'Language',

  // ── Sidebar ───────────────────────────────────────────────────────────────
  dataInputLabel: 'Travel Record Data',
  editDataBtn: 'Edit Data',
  editorDialogTitle: 'Edit Travel Records',
  editorDialogApply: 'Apply',
  editorDialogCancel: 'Cancel',

  formatHelpBtn: 'Format Help ?',
  helpBtn: 'Help',
  aboutBtn: 'About',
  aboutTitle: 'About',
  aboutDescription: 'A calendar-based visualiser for personal travel history records.',
  builtWith: 'Built with',
  builtWithSep: ', ',
  builtWithSuffix: ' and ❤️',
  sponsorLabel: 'Sponsor',
  sponsorDesc1: 'Travel History Visualiser helps you keep a precise record of the days you have spent in each country and region, including Schengen Area calculations, so you can plan your trips with confidence and never accidentally exceed your permitted stay.',
  sponsorDesc2: 'This tool was built using vibe coding together with careful manual debugging. vibe coding relies on AI assistance, which means real token costs with every iteration. Manual debugging, meanwhile, demands time and patience at every step. If this app has been useful to you, I would be genuinely grateful for your support. Even a small tip, enough for a coffee, means a lot and helps keep the project going.',

  displayModeLabel: 'Display Mode',
  modeDetailed: 'Minor Location Mode',
  modeOverview: 'Major Location Mode',

  weekStartLabel: 'Week Starts On',
  weekStartSun: 'Sunday',
  weekStartMon: 'Monday',

  showCalendarBtn: 'Show Calendar',

  // ── Range ─────────────────────────────────────────────────────────────────
  rangeLabel: 'Display Range',
  dataRangePrefix: 'Data: ',
  rangeModeStartEnd: 'Start–End',
  rangeModeStartDuration: 'Start+Days',
  rangeModeEndDuration: 'End+Days',
  startDateLabel: 'Start Date',
  endDateLabel: 'End Date',
  durationLabel: 'Days (default 180)',
  displayRangeInfo: (start, end, days) => `Showing: ${start} \u2014 ${end} (${days} days)`,
  prevDayTitle: 'Previous day',
  nextDayTitle: 'Next day',

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: 'Statistics',
  statsTotalDays: 'Total Days',
  statsRecordedDays: 'Recorded',
  statsLocations: 'Locations',
  statsDaysSuffix: 'd',

  // ── Warnings ──────────────────────────────────────────────────────────────
  errorsLabel: 'Errors',
  errorDialogTitle: 'Parse Error',
  errorDialogClose: 'Close',

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: 'Calendar',
  calendarDaysSuffix: ' days',

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: 'Paste your travel records to visualise',
  emptyDesc:
    'Three formats are supported: multi-line groups (major location + minor locations), single-line with minor location, and single-line major location only. Sample data is pre-loaded and updates automatically as you edit.',
  emptyHelpLink: 'View format guide \u2192',

  // ── Weekdays (Sun\u2013Sat) ────────────────────────────────────────────────────
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

  // ── Months ───────────────────────────────────────────────────────────────
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  // ── Range errors ─────────────────────────────────────────────────────────
  errStartTooEarly: (date) => `Start date cannot be earlier than ${date}`,
  errStartTooLate: (date) => `Start date cannot be later than ${date}`,
  errEndTooLate: (date) => `End date cannot be later than ${date}`,
  errEndBeforeStart: 'End date cannot be earlier than start date',

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: 'Record Format Guide',
  helpCloseBtn: 'Close',
  helpIntro: 'Each record consists of one or more lines, with fields separated by',
  helpTabNote: 'Tab (\u21e5) or comma (,)',
  helpIntroCont: ' to separate 6 fields per line. Three formats are supported:',
  helpEmptyCell: 'Empty',

  helpType1Title: 'Format 1: Multi-line group (major location + minor locations)',
  helpType1Desc:
    'The first line contains the overall start/end dates, the major location name, and the first minor location. Subsequent lines begin with three empty fields and list additional minor locations.',
  helpType1ColHeader: 'Fields: [Group Start] [Group End] [Major Location] [Minor Location] [Minor Start] [Minor End]',
  helpType1Note:
    'This means 2024-06-29 to 2024-06-30 in the Schengen Area (major location); minor locations: Switzerland and France on 29 Jun, Switzerland on 29\u201330 Jun.',

  helpType2Title: 'Format 2: Single line with major location and minor location',
  helpType2Desc:
    'One line only. Field 4 contains the minor location; fields 5 and 6 are empty. The minor location date range matches the major location.',
  helpType2ColHeader: 'Fields: [Start] [End] [Major Location] [Minor Location] [Empty] [Empty]',
  helpType2Note:
    'This means 2024-06-30 to 2024-07-05 in the UK (major location), minor location England, same date range.',

  helpType3Title: 'Format 3: Single line, major location only',
  helpType3Desc:
    'One line only. Fields 4, 5, and 6 are all empty. The minor location defaults to the same as the major location.',
  helpType3ColHeader: 'Fields: [Start] [End] [Major Location] [Empty] [Empty] [Empty]',
  helpType3Note: 'This means 2024-07-18 to 2024-07-21 in China; both major location and minor location are China.',

  helpNotesTitle: 'Notes',
  helpNote1: 'Date format is YYYYMMDD (8 digits, no separators).',
  helpNote2: 'Fields are separated by Tab (\u21e5) or comma (,) — either works, but do not mix both in the same line.',
  helpNote3:
    'If the same day appears in multiple minor location records (e.g. 20240224 Denmark), it is counted only once.',
  helpNote4: '"Minor Location Mode" uses minor locations; "Major Location Mode" uses major locations.',
  helpNote5: 'Blank lines between records are ignored.',

  helpExampleTitle: 'Full Example',
  helpExSchengen: 'Schengen Area',
  helpExSwitzerland: 'Switzerland',
  helpExFrance: 'France',
  helpExUK: 'United Kingdom',
  helpExEngland: 'England',
  helpExChina: 'China',

  helpExampleData: [
    '20240629,20240630,Schengen Area,Switzerland,20240629,20240629',
    ',,,France,20240629,20240629',
    ',,,Switzerland,20240629,20240630',
    '20240630,20240705,United Kingdom,England,,',
    '20240705,20240708,Schengen Area,France,,',
    '20240708,20240717,United Kingdom,England,,',
    '20240718,20240721,China,,,',
  ].join('\n'),

  defaultSampleData: [
    '20240629,20240630,Schengen Area,Switzerland,20240629,20240629',
    ',,,France,20240629,20240629',
    ',,,Switzerland,20240629,20240630',
    '20240630,20240705,United Kingdom,England,,',
    '20240705,20240708,Schengen Area,France,,',
    '20240708,20240717,United Kingdom,England,,',
    '20240718,20240721,China,,,',
  ].join('\n'),

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: '\u00d7',
};

export default enGB;
