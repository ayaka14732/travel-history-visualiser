import { Language } from "../types";

const en_GB: Language = {
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
    includeExit: "Exit day count as full day, exclude entry day", // TODO: check
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
    invalidCsv: "Invalid CSV format, please check your input",
    other: "Other",
  },
};

export default en_GB;
