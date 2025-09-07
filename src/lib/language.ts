export interface Language {
  code: string;
  name: string;
  flag: string;
  translations: {
    title: string;
    inputLabel: string;
    inputType: string;
    csvPlaceholder: string;
    importPlaceholder: string;
    settings: string;
    period: string;
    allTime: string;
    last2years: string;
    last1year: string;
    last180Days: string;
    customRange: string;
    fromDate: string;
    toDate: string;
    countingMethod: string;
    fullDay: string;
    halfDay: string;
    includeEntry: string;
    displayFormat: string;
    pieChart: string;
    table: string;
    sortBy: string;
    byDays: string;
    byTime: string;
    pieDisplay: string;
    showPercentage: string;
    showDays: string;
    breakdown: string;
    byRegion: string;
    byDetails: string;
    location: string;
    totalDays: string;
    percentage: string;
    invalidJson: string;
  };
}

export const languages: Language[] = [
  {
    code: "zh-HK",
    name: "中文",
    flag: "🇭🇰",
    translations: {
      title: "旅行記錄可視化器",
      inputLabel: "旅行記錄",
      inputType: "輸入格式",
      csvPlaceholder: "請貼上您的旅行記錄 CSV 數據...",
      importPlaceholder: "導入旅行記錄以開始可視化",
      settings: "設定",
      period: "統計期間",
      allTime: "所有記錄",
      last2years: "近兩年",
      last1year: "近一年",
      last180Days: "近 180 日",
      customRange: "自訂範圍",
      fromDate: "起始日",
      toDate: "結束日",
      countingMethod: "計算方法",
      fullDay: "入境及出境當日各計一日",
      halfDay: "入境及出境當日各計半日",
      includeEntry: "入境當日計一日，出境當日不計",
      displayFormat: "顯示格式",
      pieChart: "餅圖",
      table: "表格",
      sortBy: "排序方式",
      byDays: "按天數排序",
      byTime: "按時間排序",
      pieDisplay: "餅圖顯示",
      showPercentage: "顯示百分比",
      showDays: "顯示天數",
      breakdown: "地區拆分",
      byRegion: "大致地區",
      byDetails: "詳細地區",
      location: "地點",
      totalDays: "總天數",
      percentage: "佔比",
      invalidJson: "JSON 格式錯誤，請檢查輸入",
    },
  },
  {
    code: "en-GB",
    name: "English",
    flag: "🇬🇧",
    translations: {
      title: "Travel History Visualiser",
      inputLabel: "Travel Records",
      inputType: "Input Format",
      csvPlaceholder: "Please paste your travel records CSV data...",
      importPlaceholder: "Import travel records to start visualising",
      settings: "Settings",
      period: "Statistics Period",
      allTime: "All Records",
      last2years: "Last 2 Years",
      last1year: "Last 1 Year",
      last180Days: "Last 180 Days",
      customRange: "Custom Range",
      fromDate: "From Date",
      toDate: "To Date",
      countingMethod: "Counting Method",
      fullDay: "Entry and exit days count as full day", // TODO: check
      halfDay: "Entry and exit days count as half day", // TODO: check
      includeEntry: "Entry day count as full day, exclude exit day", // TODO: check
      displayFormat: "Display Format",
      pieChart: "Pie Chart",
      table: "Table",
      sortBy: "Sort By",
      byDays: "By Number of Days",
      byTime: "By Time",
      pieDisplay: "Pie Chart Display",
      showPercentage: "Show Percentage",
      showDays: "Show Days",
      breakdown: "Location Breakdown",
      byRegion: "By General Region",
      byDetails: "By Detailed Region",
      location: "Location",
      totalDays: "Total Days",
      percentage: "Percentage",
      invalidJson: "Invalid JSON format, please check your input",
    },
  },
];
