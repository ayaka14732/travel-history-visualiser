"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, BarChart3, Settings, ChevronDown, Upload, X, Languages, Github as GitHub } from "lucide-react";

import languages from "@/lib/languages";
import numSpansToCount from "@/lib/numSpansToCount";
import {
  dateOfTodayToNum,
  formatDays,
  getIsoOneYearAgo,
  getIsoToday,
  isoDateStrToNum,
  oneYearAgoToNum,
  twoYearsAgoToNum,
} from "@/lib/dateUtils";
import { Language, ProcessedData } from "@/lib/types";
import parseCSVInput from "@/lib/parseCSVInput";
import { colours } from "@/lib/colours";

import RadioSelect from "@/components/RadioSelect";
import TableDisplay from "@/components/TableDisplay";

const sampleData = `20190219	20190222	日本			
20190222	20190225	阿聯酋			
20190225	20190305	申根區域	瑞士	20190225	20190228
			法國	20190228	20190303
			摩納哥	20190303	20190305
20190305	20190315	英國	英格蘭		
20190315	20190325	美國			
20190325	20190401	開曼羣島			
20190402	20190410	日本			
20190410	20190420	中國			
20190420	20190501	新加坡			
20190502	20190510	澳洲			
20190510	20190520	新西蘭			
20190521	20190525	日本			
20190525	20190605	俄羅斯			
20190605	20190615	申根區域	德國	20190605	20190609
			奧地利	20190609	20190615
20190615	20190630	英國	英格蘭	20190615	20190622
			蘇格蘭	20190622	20190622
			英格蘭	20190622	20190622
			蘇格蘭	20190622	20190623
			英格蘭	20190623	20190630
20190630	20190715	申根區域	挪威	20190630	20190710
			冰島	20190710	20190715
20190715	20190725	加拿大			
20190725	20190820	美國			
20190821	20190901	日本			
20190901	20190910	韓國			
20190910	20190920	中國			
20190921	20191001	阿曼			
20191001	20191015	印度			
20191016	20191101	日本			`;

const setDocumentLang = (langCode: string) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = langCode;
  }
};

/**
 * Merges entries in a ProcessedData array where the `percentage` is less than 1%.
 * All such entries are combined into a single entry with the name set to "Other".
 * The `days` values of the merged entries are summed.
 * The merged entry is appended to the resulting array, which retains all entries
 * with `percentage >= 1%` unmodified.
 *
 * @param data - An array of ProcessedData objects to be merged.
 * @returns A new array of ProcessedData with low-percentage entries merged into "Other".
 */
const mergeLowPercentageData = (data: ProcessedData[], otherName: string): ProcessedData[] => {
  if (data.length === 0) return [];

  const result: ProcessedData[] = [];
  let otherDays = 0;
  let otherPercentage = 0;

  for (const entry of data) {
    if (entry.percentage < 2) {
      otherDays += entry.days;
      otherPercentage += entry.percentage;
    } else {
      result.push(entry);
    }
  }

  if (otherDays > 0) {
    result.push({
      name: otherName,
      days: otherDays,
      percentage: otherPercentage,
    });
  }

  return result;
};

const TravelVisualiser = () => {
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [csvInput, setCsvInput] = useState(sampleData);
  const [period, setPeriod] = useState<"all" | "2years" | "1year" | "180" | "custom">("all");
  const [customFrom, setCustomFrom] = useState(getIsoOneYearAgo());
  const [customTo, setCustomTo] = useState(getIsoToday());
  const [countingMethod, setCountingMethod] = useState<"full" | "half" | "entry" | "exit">("full");
  const [displayFormat, setDisplayFormat] = useState<"pie" | "table">("pie");
  const [sortBy, setSortBy] = useState<"days" | "time">("days");
  const [pieDisplay, setPieDisplay] = useState<"percentage" | "days">("percentage");
  const [breakdown, setBreakdown] = useState<"region" | "details">("region");
  const [error, setError] = useState("");
  const [inputModalOpen, setInputModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputModalRef = useRef<HTMLDivElement>(null);

  const t = currentLang.translations;

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }

      if (inputModalRef.current && !inputModalRef.current.contains(event.target as Node)) {
        setInputModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const parsedData = useMemo(() => {
    let result;
    try {
      result = parseCSVInput(csvInput);
    } catch (e) {
      setError("Error: " + ((e as Error).message || t.invalidCsv));
      return [];
    }
    setError("");
    return result;
  }, [csvInput, t.invalidCsv]);

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
        if (!regionToDateSpansMap.has(detail.name)) regionToDateSpansMap.set(detail.name, []);
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
          : period === "custom"
          ? isoDateStrToNum(customFrom)
          : null;
      const upperCutOff = period === "custom" ? isoDateStrToNum(customTo) : null;
      const days =
        countingMethod === "full"
          ? numSpansToCount(spans, "countAs1", "countAs1", lowerCutOff, upperCutOff)
          : countingMethod === "half"
          ? numSpansToCount(spans, "countAs0.5", "countAs0.5", lowerCutOff, upperCutOff)
          : countingMethod === "entry"
          ? numSpansToCount(spans, "countAs1", "countAs0", lowerCutOff, upperCutOff)
          : numSpansToCount(spans, "countAs0", "countAs1", lowerCutOff, upperCutOff);

      if (days === 0) continue;
      regionToNumOfDaysMap.set(region, days);
    }

    const totalDays = Array.from(regionToNumOfDaysMap.values()).reduce((sum, days) => sum + days, 0);

    const result: ProcessedData[] = Array.from(regionToNumOfDaysMap.entries()).map(([name, days]) => ({
      name,
      days,
      percentage: totalDays > 0 ? (days / totalDays) * 100 : 0,
    }));

    result.sort((a, b) => b.days - a.days);

    return result;
  }, [parsedData, countingMethod, breakdown, sortBy, period, customFrom, customTo]);

  const mergedProcessedData = useMemo(() => {
    return mergeLowPercentageData(processedData, t.other);
  }, [processedData, t.other]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap gap-y-6 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-violet-400" />
          {t.title}
        </h1>
        <div className="flex items-center">
          {/* Language Selector */}
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

          {/* GitHub Link */}
          <div className="ml-4 text-gray-400 hover:text-white transition-colors cursor-pointer px-1">
            <a href="https://github.com/ayaka14732/travel-history-visualiser" target="_blank">
              <GitHub />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="xl:col-span-1 space-y-6">
          {/* JSON Input Button */}
          <div className="bg-gray-900 rounded-xl p-6">
            <button
              onClick={() => setInputModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 text-white py-3 px-6 rounded-lg transition-colors">
              <Upload className="w-5 h-5" />
              <span className="font-medium">{t.inputLabel}</span>
            </button>
            {error && <p className="text-red-400 text-sm mt-5">{error}</p>}
          </div>

          {/* Input Modal */}
          {inputModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col" ref={inputModalRef}>
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <h3 className="text-xl font-bold">{t.inputLabel}</h3>
                  <button onClick={() => setInputModalOpen(false)} className="text-gray-400 hover:text-white p-2">
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
                    onClick={() => setInputModalOpen(false)}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors">
                    取消
                  </button>
                  <button
                    onClick={() => setInputModalOpen(false)}
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
            <h4 className="visualiser-settings-label">{t.period}</h4>
            <RadioSelect
              state={period}
              setState={setPeriod}
              options={[
                { value: "all", label: t.allTime },
                { value: "2years", label: t.last2years },
                { value: "1year", label: t.last1year },
                { value: "180", label: t.last180Days },
                { value: "custom", label: t.customRange }, // TODO: enable custom range
              ]}
            />

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
            <h4 className="visualiser-settings-label">{t.countingMethod}</h4>
            <RadioSelect
              state={countingMethod}
              setState={setCountingMethod}
              options={[
                { value: "full", label: t.fullDay },
                { value: "half", label: t.halfDay },
                { value: "entry", label: t.includeEntry },
                { value: "exit", label: t.includeExit },
              ]}
              wrap={true}
            />

            {/* Breakdown */}
            <h4 className="visualiser-settings-label">{t.breakdown}</h4>
            <RadioSelect
              state={breakdown}
              setState={setBreakdown}
              options={[
                { value: "region", label: t.byRegion },
                { value: "details", label: t.byDetails },
              ]}
            />

            {/* Display Format */}
            <h4 className="visualiser-settings-label">{t.displayFormat}</h4>
            <RadioSelect
              state={displayFormat}
              setState={setDisplayFormat}
              options={[
                { value: "pie", label: t.pieChart },
                { value: "table", label: t.table },
              ]}
            />

            {/* Table Sort */}
            {false /* TODO: implement sortBy */ && displayFormat === "table" && (
              <div>
                <h4 className="visualiser-settings-label">{t.sortBy}</h4>
                <RadioSelect
                  state={sortBy}
                  setState={setSortBy}
                  options={[
                    { value: "days", label: t.byDays },
                    { value: "time", label: t.byTime },
                  ]}
                />
              </div>
            )}

            {/* Pie Display */}
            {displayFormat === "pie" && (
              <>
                <h4 className="visualiser-settings-label">{t.pieDisplay}</h4>
                <RadioSelect
                  state={pieDisplay}
                  setState={setPieDisplay}
                  options={[
                    { value: "percentage", label: t.showPercentage },
                    { value: "days", label: t.showDays },
                  ]}
                />
              </>
            )}
          </div>
        </div>

        {/* Visualization Section */}
        <div className="xl:col-span-2">
          <div className="bg-gray-900 rounded-xl p-6">
            {processedData.length > 0 ? (
              <>
                <h2 className="text-xl font-bold mb-6">{displayFormat === "pie" ? t.pieChart : t.table}</h2>

                {displayFormat === "pie" ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mergedProcessedData}
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
                          {mergedProcessedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
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
                    <TableDisplay currentLang={currentLang} processedData={processedData} />
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
};

export default TravelVisualiser;
