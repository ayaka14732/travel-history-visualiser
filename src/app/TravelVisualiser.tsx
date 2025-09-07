"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, BarChart3, Settings, ChevronDown, Upload, X, Languages } from "lucide-react";

import { languages, Language } from "@/lib/language";
import csvInputToJson from "@/lib/csvInputToJson";
import numSpansToCount from "@/lib/numSpansToCount";
import { dateOfTodayToNum, oneYearAgoToNum, twoYearsAgoToNum } from "@/lib/dateUtils";

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#6366f1",
  "#84cc16",
  "#f97316",
] as const;

const svgFlags = new Map<string, { url: string; alt: string }>([
  ["加利福尼亞州", { url: "/flags/Flag_of_California.svg", alt: "🏴󠁵󠁳󠁣󠁡󠁿" }],
  ["新澤西州", { url: "/flags/Flag_of_New_Jersey.svg", alt: "🏴󠁵󠁳󠁮󠁪󠁿" }],
  ["紐約州", { url: "/flags/Flag_of_New_York.svg", alt: "🏴󠁵󠁳󠁮󠁹󠁿" }],
]);

const emojiFlags = new Map<string, string>([
  ["中國內地", "🇨🇳"],
  ["新加坡", "🇸🇬"],
  ["英國", "🇬🇧"],
  ["美國", "🇺🇸"],
  ["加拿大", "🇨🇦"],
  ["泰國", "🇹🇭"],
  ["法國", "🇫🇷"],
  ["德國", "🇩🇪"],
  ["澳大利亞", "🇦🇺"],
  ["意大利", "🇮🇹"],
  ["日本", "🇯🇵"],
  ["香港", "🇭🇰"],
  ["挪威", "🇳🇴"],
  ["奧地利", "🇦🇹"],
  ["匈牙利", "🇭🇺"],
  ["法羅羣島", "🇫🇴"],
  ["瑞典", "🇸🇪"],
  ["西班牙", "🇪🇸"],
  ["芬蘭", "🇫🇮"],
  ["斯洛伐克", "🇸🇰"],
  ["澳門", "🇲🇴"],
  ["印度尼西亞", "🇮🇩"],
  ["希臘", "🇬🇷"],
  ["梵蒂岡", "🇻🇦"],
  ["荷蘭", "🇳🇱"],
  ["愛爾蘭", "🇮🇪"],
  ["葡萄牙", "🇵🇹"],
  ["馬來西亞", "🇲🇾"],
  ["捷克", "🇨🇿"],
  ["瑞士", "🇨🇭"],
  ["比利時", "🇧🇪"],
  ["丹麥", "🇩🇰"],
  ["英格蘭", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
  ["蘇格蘭", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
]);

const setDocumentLang = (langCode: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = langCode;
  }
};

interface Result {
  name: string;
  days: number;
  percentage: number;
}

// 將天數數字格式化為字串
// 整數時不顯示小數點，非整數時顯示一位小數
const formatDays = (days: number): string => {
  return Number.isInteger(days) ? days.toString() : days.toFixed(1);
};

export default function TravelVisualiser() {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [period, setPeriod] = useState<"all" | "2years" | "1year" | "180" | "90" | "custom">("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [countingMethod, setCountingMethod] = useState<"full" | "half" | "entry">("full");
  const [displayFormat, setDisplayFormat] = useState<"pie" | "table">("pie");
  const [sortBy, setSortBy] = useState<"days" | "time">("days");
  const [pieDisplay, setPieDisplay] = useState<"percentage" | "days">("percentage");
  const [breakdown, setBreakdown] = useState<"region" | "details">("region");
  const [error, setError] = useState("");
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = currentLang.translations;

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const parsedData = useMemo(() => {
    return csvInputToJson(csvInput);
  }, [csvInput, t.invalidJson]);

  const processedData = useMemo(() => {
    if (parsedData.length === 0) return [];

    const regionToDateSpansMap = new Map<string, { start: number; end: number }[]>();

    if (sortBy === "time") {
      throw new Error("Time sorting not implemented yet");
    }

    // 彙總每個地區的日期區間
    for (const record of parsedData) {
      const items = breakdown === "region" ? [record] : record.details || [record];
      for (const detail of items) {
        if (!regionToDateSpansMap.has(detail.name)) {
          regionToDateSpansMap.set(detail.name, []);
        }
        regionToDateSpansMap.get(detail.name)!.push({ start: detail.start, end: detail.end });
      }
    }

    // 計算每個地區的天數
    const regionToNumOfDaysMap = new Map<string, number>();
    for (const [region, spans] of regionToDateSpansMap.entries()) {
      const lowerCutOff =
        period === "2years"
          ? twoYearsAgoToNum()
          : period === "1year"
          ? oneYearAgoToNum()
          : period === "180"
          ? dateOfTodayToNum() - 180
          : null; // TODO:  period === "custom"
      const upperCutOff = null; // TODO: period === "custom"
      const days =
        countingMethod === "full"
          ? numSpansToCount(spans, "countAs1", "countAs1", lowerCutOff, upperCutOff)
          : countingMethod === "half"
          ? numSpansToCount(spans, "countAs0.5", "countAs0.5", lowerCutOff, upperCutOff)
          : numSpansToCount(spans, "countAs1", "countAs0", lowerCutOff, upperCutOff);

      if (days === 0) continue;
      regionToNumOfDaysMap.set(region, days);
    }

    const totalDays = Array.from(regionToNumOfDaysMap.values()).reduce((sum, days) => sum + days, 0);

    const result: Result[] = Array.from(regionToNumOfDaysMap.entries()).map(([name, days]) => ({
      name,
      days,
      percentage: totalDays > 0 ? (days / totalDays) * 100 : 0,
    }));

    result.sort((a, b) => b.days - a.days);

    return result;
  }, [parsedData, countingMethod, breakdown, sortBy, period]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-violet-400" />
          {t.title}
        </h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm hover:bg-gray-700 transition-colors">
            <Languages className="w-5 h-5 text-gray-400" />
            <span>{currentLang.name}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-600 rounded-lg shadow-xl z-50 min-w-32">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang);
                    setDocumentLang(lang.code);
                    setLangDropdownOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    currentLang.code === lang.code ? "bg-gray-700" : ""
                  }`}>
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="xl:col-span-1 space-y-6">
          {/* JSON Input Button */}
          <div className="bg-gray-900 rounded-xl p-6">
            <button
              onClick={() => setJsonModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white py-3 px-6 rounded-lg transition-colors">
              <Upload className="w-5 h-5" />
              <span className="font-medium">{t.inputLabel}</span>
            </button>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>

          {/* JSON Input Modal */}
          {jsonModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold">{t.inputLabel}</h3>
                  <button onClick={() => setJsonModalOpen(false)} className="text-gray-400 hover:text-white p-2">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <textarea
                    value={csvInput}
                    onChange={e => setCsvInput(e.target.value)}
                    placeholder={t.csvPlaceholder}
                    className="w-full flex-1 bg-gray-700 border border-gray-600 rounded-lg p-4 font-mono text-sm resize-none focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={() => setJsonModalOpen(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                    取消
                  </button>
                  <button
                    onClick={() => setJsonModalOpen(false)}
                    className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                    確定
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="bg-gray-900 rounded-xl p-6 space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-lg">
              <Settings className="w-5 h-5" />
              {t.settings}
            </h3>

            {/* Period */}
            <div>
              <h4 className="visualiser-settings-label">{t.period}</h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                {[
                  { value: "all", label: t.allTime },
                  { value: "2years", label: t.last2years },
                  { value: "1year", label: t.last1year },
                  { value: "180", label: t.last180Days },
                  // { value: "custom", label: t.customRange }, // TODO: enable custom range
                ].map(option => (
                  <label key={option.value} className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      value={option.value}
                      checked={period === option.value}
                      onChange={e => setPeriod(e.target.value as typeof period)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {period === "custom" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-400">{t.fromDate}</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-400">{t.toDate}</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Counting Method */}
            <div>
              <h4 className="visualiser-settings-label">{t.countingMethod}</h4>
              <div className="space-y-2">
                {[
                  { value: "full", label: t.fullDay },
                  { value: "half", label: t.halfDay },
                  { value: "entry", label: t.includeEntry },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-1">
                    <input
                      type="radio"
                      value={option.value}
                      checked={countingMethod === option.value}
                      onChange={e => setCountingMethod(e.target.value as typeof countingMethod)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <h4 className="visualiser-settings-label">{t.breakdown}</h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                {[
                  { value: "region", label: t.byRegion },
                  { value: "details", label: t.byDetails },
                ].map(option => (
                  <label key={option.value} className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      value={option.value}
                      checked={breakdown === option.value}
                      onChange={e => setBreakdown(e.target.value as typeof breakdown)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Display Format */}
            <div>
              <h4 className="visualiser-settings-label">{t.displayFormat}</h4>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                {[
                  { value: "pie", label: t.pieChart },
                  { value: "table", label: t.table },
                ].map(option => (
                  <label key={option.value} className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      value={option.value}
                      checked={displayFormat === option.value}
                      onChange={e => setDisplayFormat(e.target.value as typeof displayFormat)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Table Sort */}
            {displayFormat === "table" && (
              <div>
                <h4 className="visualiser-settings-label">{t.sortBy}</h4>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                  {[
                    { value: "days", label: t.byDays },
                    { value: "time", label: t.byTime },
                  ].map(option => (
                    <label key={option.value} className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={e => setSortBy(e.target.value as typeof sortBy)}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Pie Display */}
            {displayFormat === "pie" && (
              <div>
                <h4 className="visualiser-settings-label">{t.pieDisplay}</h4>
                <div className="flex gap-2">
                  {[
                    { value: "percentage", label: t.showPercentage },
                    { value: "days", label: t.showDays },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPieDisplay(option.value as typeof pieDisplay)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pieDisplay === option.value
                          ? "bg-violet-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Visualization Section */}
        <div className="xl:col-span-2">
          <div className="bg-gray-900 rounded-xl p-6">
            {processedData.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">{displayFormat === "pie" ? t.pieChart : t.table}</h2>
                  {/* <div className="text-sm text-gray-400">
                    {t.totalDays}: {formatDays(totalDays)} 天
                  </div> */}
                </div>

                {displayFormat === "pie" ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processedData}
                          isAnimationActive={false}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="days"
                          label={
                            ({ name, value, percentage }) =>
                              pieDisplay === "percentage"
                                ? `${name}: ${percentage.toFixed(1)}%`
                                : `${name}: ${formatDays(value!)} 天` // TODO: should not be nullable
                          }>
                          {processedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`${formatDays(value)} 天`, "天數"]}
                          contentStyle={{
                            backgroundColor: "#374151",
                            border: "1px solid #4b5563",
                            borderRadius: "8px",
                            color: "white",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th colSpan={2} className="text-left py-1 px-4 font-medium text-gray-300">
                            {t.location}
                          </th>
                          <th className="text-right py-1 px-4 font-medium text-gray-300">{t.totalDays}</th>
                          <th className="text-right py-1 px-4 font-medium text-gray-300">{t.percentage}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedData.map((item, index) => (
                          <tr key={item.name} className="border-b border-gray-700/50">
                            <td className="py-1 pl-4 w-11 text-left align-middle">
                              {svgFlags.has(item.name) ? (
                                <img
                                  className="visualiser-svg-flag"
                                  src={svgFlags.get(item.name)!.url}
                                  alt={svgFlags.get(item.name)!.alt}
                                />
                              ) : // <span className="visualiser-mock-flag california"></span>
                              emojiFlags.has(item.name) ? (
                                <span>{emojiFlags.get(item.name)}</span>
                              ) : (
                                <span
                                  className="visualiser-mock-flag"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                              )}
                            </td>
                            <td className="py-1 pr-4 flex items-center gap-3">{item.name}</td>
                            <td className="py-1 px-4 text-right">{formatDays(item.days)}</td>
                            <td className="py-1 px-4 text-right">{item.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">{t.importPlaceholder}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
