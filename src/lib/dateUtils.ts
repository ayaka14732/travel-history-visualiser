// 將 YYYYMMDD 格式的字串轉換為自 1970-01-01 起的天數
export const dateStrToNum = (dateStr: string): number => {
  if (dateStr.length !== 8) throw new Error("Invalid date string");

  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = parseInt(dateStr.slice(6, 8), 10);

  const targetUTC = Date.UTC(year, month, day);
  const epochUTC = Date.UTC(1970, 0, 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((targetUTC - epochUTC) / msPerDay);
};

// 取得今天的日期，並轉換為自 1970-01-01 起的天數
export const dateOfTodayToNum = (): number => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const targetUTC = Date.UTC(year, month, day);
  const epochUTC = Date.UTC(1970, 0, 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((targetUTC - epochUTC) / msPerDay);
};

// 取得一年前的日期，並轉換為自 1970-01-01 起的天數
export const oneYearAgoToNum = (): number => {
  const now = new Date();

  const year = now.getFullYear() - 1;
  const month = now.getMonth();
  const day = now.getDate();

  const targetUTC = Date.UTC(year, month, day);
  const epochUTC = Date.UTC(1970, 0, 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((targetUTC - epochUTC) / msPerDay);
};

// 取得兩年前的日期，並轉換為自 1970-01-01 起的天數
export const twoYearsAgoToNum = (): number => {
  const now = new Date();

  const year = now.getFullYear() - 2;
  const month = now.getMonth();
  const day = now.getDate();

  const targetUTC = Date.UTC(year, month, day);
  const epochUTC = Date.UTC(1970, 0, 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((targetUTC - epochUTC) / msPerDay);
};

// 取得今天的日期，並以 ISO 格式 (YYYY-MM-DD) 回傳
export const getIsoToday = (): string => {
  return new Date().toISOString().split("T")[0];
};

// 取得一年前的日期，並以 ISO 格式 (YYYY-MM-DD) 回傳
export const getIsoOneYearAgo = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().split("T")[0];
};

// 將 ISO 格式 (YYYY-MM-DD) 的日期字串轉換為自 1970-01-01 起的天數
export const isoDateStrToNum = (dateStr: string): number => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error("Invalid date string format, expected YYYY-MM-DD");
  }

  const [yearStr, monthStr, dayStr] = dateStr.split("-");

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const targetUTC = Date.UTC(year, month, day);
  const epochUTC = Date.UTC(1970, 0, 1);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((targetUTC - epochUTC) / msPerDay);
};

// 將天數數字格式化為字串
// 整數時不顯示小數點，非整數時顯示一位小數
export const formatDays = (days: number): string => {
  return Number.isInteger(days) ? days.toString() : days.toFixed(1);
};
