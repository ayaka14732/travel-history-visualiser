import type { Translation } from './types';

const zhTW: Translation = {
  // ── Meta ──────────────────────────────────────────────────────────────────
  appTitle: '旅行記錄視覺化器',
  langLabel: '中文',
  languageSectionLabel: '語言',

  // ── Sidebar ───────────────────────────────────────────────────────────────
  dataInputLabel: '旅行記錄資料',
  editDataBtn: '編輯資料',
  editorDialogTitle: '編輯旅行記錄',
  editorDialogApply: '確認',
  editorDialogCancel: '取消',

  formatHelpBtn: '格式說明 ?',
  helpBtn: '說明',
  aboutBtn: '關於',
  aboutTitle: '關於此工具',
  builtWith: '使用',
  builtWithSep: '、',
  builtWithSuffix: ' 與 ❤️ 製作',
  sponsorLabel: '打賞',
  sponsorDesc1: '旅行記錄視覺化器幫助你精確追蹤在各國家和地區停留的天數，包括申根區域的日數計算，讓你能夠從容規劃行程，避免不小心超出允許的停留時限。',
  sponsorDesc2: '這個工具採用氛圍編程（vibe coding）結合手動 debug 的方式開發而成。氛圍編程每一次迭代都需要消耗 AI token，是實實在在的金錢成本；手動 debug 則需要投入大量時間與精力，每一個細節都要反覆推敲。若這個工具對你有所幫助，非常期待你的支持，哪怕是請我喝杯咖啡，都是對這個項目莫大的鼓勵。',

  displayModeLabel: '顯示模式',
  modeDetailed: '小地點模式',
  modeOverview: '大地點模式',

  weekStartLabel: '週起始',
  weekStartSun: '週日',
  weekStartMon: '週一',

  showCalendarBtn: '顯示日曆',

  // ── Range ─────────────────────────────────────────────────────────────────
  rangeLabel: '顯示範圍',
  dataRangePrefix: '資料：',
  rangeModeStartEnd: '起訖日',
  rangeModeStartDuration: '起始日+天數',
  rangeModeEndDuration: '結束日+天數',
  startDateLabel: '開始日期',
  endDateLabel: '結束日期',
  durationLabel: '天數（預設 180）',
  displayRangeInfo: (start, end, days) => `顯示：${start} — ${end}（${days} 天）`,
  prevDayTitle: '前一天',
  nextDayTitle: '後一天',

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsLabel: '統計',
  statsTotalDays: '總天數',
  statsRecordedDays: '有記錄',
  statsLocations: '地點數',
  statsDaysSuffix: ' 天',

  // ── Errors ────────────────────────────────────────────────────────────────
  errorsLabel: '錯誤',
  errorDialogTitle: '解析錯誤',
  errorDialogClose: '關閉',

  // ── Calendar top bar ──────────────────────────────────────────────────────
  calendarLabel: '日曆',
  calendarDaysSuffix: ' 天',

  // ── Calendar empty state ──────────────────────────────────────────────────
  emptyTitle: '貼上旅行記錄即可自動顯示',
  emptyDesc: '支援三種格式：多行群組（大地點 + 小地點）、單行雙地點、單行單地點。已預載範例資料，修改後自動更新。',
  emptyHelpLink: '查看格式說明 →',

  // ── Weekdays (Sun–Sat) ────────────────────────────────────────────────────
  weekdays: ['日', '一', '二', '三', '四', '五', '六'],

  // ── Months ───────────────────────────────────────────────────────────────
  months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],

  // ── Range errors ─────────────────────────────────────────────────────────
  errStartTooEarly: (date) => `開始日期不得早於 ${date}`,
  errStartTooLate: (date) => `開始日期不得晚於 ${date}`,
  errEndTooLate: (date) => `結束日期不得晚於 ${date}`,
  errEndBeforeStart: '結束日期不得早於開始日期',

  // ── Format help popup ─────────────────────────────────────────────────────
  helpTitle: '記錄格式說明',
  helpCloseBtn: '關閉',
  helpIntro: '每一筆記錄由若干行組成，每行以',
  helpTabNote: 'Tab（⇥）或逗號（,）',
  helpIntroCont: '分隔為 6 個欄位。共有三種格式：',
  helpEmptyCell: '空',

  helpType1Title: '格式一：多行群組（大地點 + 多個小地點）',
  helpType1Desc:
    '第一行包含整段旅程的開始／結束日期、大地點名稱，以及第一個小地點的資訊。後續行以三個空欄開頭，依序列出其餘小地點。',
  helpType1ColHeader: '欄位：[群組開始] [群組結束] [大地點] [小地點] [小地點開始] [小地點結束]',
  helpType1Note:
    '以上表示 2024-06-29 至 2024-06-30 在「申根區域」（大地點）；小地點方面，06-29 在瑞士和法國，06-29 至 06-30 在瑞士。',

  helpType2Title: '格式二：單行，有大地點和小地點',
  helpType2Desc: '只有一行，第 4 欄填寫小地點，第 5、6 欄留空。小地點的日期範圍與大地點相同。',
  helpType2ColHeader: '欄位：[開始] [結束] [大地點] [小地點] [空] [空]',
  helpType2Note: '表示 2024-06-30 至 2024-07-05 在「英國」（大地點），小地點為「英格蘭」，日期同上。',

  helpType3Title: '格式三：單行，只有大地點',
  helpType3Desc: '只有一行，第 4、5、6 欄均留空。小地點自動與大地點相同。',
  helpType3ColHeader: '欄位：[開始] [結束] [大地點] [空] [空] [空]',
  helpType3Note: '表示 2024-07-18 至 2024-07-21 在「中國」，大小地點均為「中國」。',

  helpNotesTitle: '注意事項',
  helpNote1: '日期格式為 YYYYMMDD（8 位數字，無分隔符）。',
  helpNote2: '欄位之間以 Tab（⇥）或逗號（,）分隔，兩者均可（不可混用）。',
  helpNote3: '同一天若出現在多條小地點記錄中（如 20240224 丹麥），該天只計算一次。',
  helpNote4: '「小地點模式」使用小地點；「大地點模式」使用大地點。',
  helpNote5: '多筆記錄之間可以有空行，程式會自動忽略。',

  helpExampleTitle: '完整範例',
  helpExSchengen: '申根區域',
  helpExSwitzerland: '瑞士',
  helpExFrance: '法國',
  helpExUK: '英國',
  helpExEngland: '英格蘭',
  helpExChina: '中國',

  helpExampleData: [
    '20240629,20240630,申根區域,瑞士,20240629,20240629',
    ',,,法國,20240629,20240629',
    ',,,瑞士,20240629,20240630',
    '20240630,20240705,英國,英格蘭,,',
    '20240705,20240708,申根區域,法國,,',
    '20240708,20240717,英國,英格蘭,,',
    '20240718,20240721,中國,,,',
  ].join('\n'),

  defaultSampleData: [
    '20240629,20240630,申根區域,瑞士,20240629,20240629',
    ',,,法國,20240629,20240629',
    ',,,瑞士,20240629,20240630',
    '20240630,20240705,英國,英格蘭,,',
    '20240705,20240708,申根區域,法國,,',
    '20240708,20240717,英國,英格蘭,,',
    '20240718,20240721,中國,,,',
  ].join('\n'),

  // ── Mobile calendar popup ─────────────────────────────────────────────────
  calendarPopupClose: '×',
};

export default zhTW;
