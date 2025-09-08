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
    includeExit: string;
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
    invalidCsv: string;
    other: string;
  };
}

export interface TravelRecord {
  start: number;
  end: number;
  name: string;
  details?:
    | {
        start: number;
        end: number;
        name: string;
      }[];
}

export interface ProcessedData {
  name: string;
  days: number;
  percentage: number;
}
