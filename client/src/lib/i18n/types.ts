/**
 * i18n type definitions
 * Add new locales to the `Locale` union and provide a corresponding translation file.
 */

export type Locale = 'zh-TW' | 'en-GB' | 'fr-CH' | 'da-DK';

export interface Translation {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: string;
  langLabel: string; // e.g. "繁體中文", "English (UK)"

  // ── Sidebar sections ──────────────────────────────────────────────────────
  languageSectionLabel: string; // "語言" / "Language"
  dataInputLabel: string;
  formatHelpBtn: string;
  helpBtn: string;
  aboutBtn: string;
  aboutTitle: string;
  aboutDescription: string; // short app description shown in About popup
  builtWith: string;     // prefix: "Built with" / "使用"
  builtWithSep: string;  // connector between the two links: " & " / "、"
  builtWithSuffix: string; // trailing text: "" / " 和❤️製作"
  sponsorLabel: string; // "打賞" / "Sponsor"
  sponsorDesc1: string; // paragraph about the app's usefulness
  sponsorDesc2: string; // paragraph about development effort + donation ask
  editDataBtn: string; // 編輯資料按鈕（開啟 Monaco Editor）
  editorDialogTitle: string; // Monaco 彈出視窗標題
  editorDialogApply: string; // 確認按鈕
  editorDialogCancel: string; // 取消按鈕

  displayModeLabel: string;
  modeDetailed: string; // 小地點模式
  modeOverview: string; // 大地點模式

  weekStartLabel: string; // 週起始
  weekStartSun: string; // 星期日
  weekStartMon: string; // 星期一

  showCalendarBtn: string; // mobile only

  // ── Range controls ────────────────────────────────────────────────────────
  rangeLabel: string;
  dataRangePrefix: string; // "資料："
  rangeModeStartEnd: string;
  rangeModeStartDuration: string;
  rangeModeEndDuration: string;
  startDateLabel: string;
  endDateLabel: string;
  durationLabel: string; // "天數（預設 180）"
  displayRangeInfo: (start: string, end: string, days: number) => string;
  prevDayTitle: string;
  nextDayTitle: string;

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: string;
  statsTotalDays: string;
  statsRecordedDays: string;
  statsLocations: string;
  statsDaysSuffix: string; // "天" / "d"

  // ── Errors ──────────────────────────────────────────────────────────────
  errorsLabel: string;
  errorDialogTitle: string;
  errorDialogClose: string;

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: string;
  calendarDaysSuffix: string;

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: string;
  emptyDesc: string;
  emptyHelpLink: string;

  // ── Calendar weekdays (Sun–Sat) ───────────────────────────────────────────
  weekdays: [string, string, string, string, string, string, string];

  // ── Calendar months ───────────────────────────────────────────────────────
  months: [string, string, string, string, string, string, string, string, string, string, string, string];

  // ── Range error messages ──────────────────────────────────────────────────
  errStartTooEarly: (date: string) => string;
  errStartTooLate: (date: string) => string;
  errEndTooLate: (date: string) => string;
  errEndBeforeStart: string;

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: string;
  helpCloseBtn: string;
  helpIntro: string;
  helpTabNote: string; // "Tab（⇥）"
  helpIntroCont: string; // " to separate 6 fields..." / "分隔為 6 個欄位..."
  helpEmptyCell: string; // "空" / "Empty" / "vide"

  helpType1Title: string;
  helpType1Desc: string;
  helpType1ColHeader: string;
  helpType1Note: string;

  helpType2Title: string;
  helpType2Desc: string;
  helpType2ColHeader: string;
  helpType2Note: string;

  helpType3Title: string;
  helpType3Desc: string;
  helpType3ColHeader: string;
  helpType3Note: string;

  helpNotesTitle: string;
  helpNote1: string;
  helpNote2: string;
  helpNote3: string;
  helpNote4: string;
  helpNote5: string;

  helpExampleTitle: string;
  /** The raw tab-separated example shown in the full-example block */
  helpExampleData: string;

  /** Localized place names used in the inline HelpSection example rows */
  helpExSchengen: string; // e.g. "申根區域" / "Schengen Area"
  helpExSwitzerland: string; // e.g. "瑞士" / "Switzerland"
  helpExFrance: string; // e.g. "法國" / "France"
  helpExUK: string; // e.g. "英國" / "United Kingdom"
  helpExEngland: string; // e.g. "英格蘭" / "England"
  helpExChina: string; // e.g. "中國" / "China"

  /** Per-locale sample data pre-loaded in the textarea */
  defaultSampleData: string;

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: string;
}
