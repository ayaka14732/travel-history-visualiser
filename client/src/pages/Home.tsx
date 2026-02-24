/**
 * Travel History Visualiser — Main Page
 * Design: Swiss SBB/CFF/FFS
 * - Left sidebar: data input + controls + statistics
 * - Right main: calendar grid
 * - Primary color: #EB0000 (SBB Red)
 * - Typography: IBM Plex Mono (dates), IBM Plex Sans (labels)
 * - Sharp corners, thin borders, dense layout
 */

import { useState, useMemo, useCallback } from "react";
import {
  parseTravelData,
  computeStats,
  sliceResult,
  addDays,
  daysBetween,
  formatDateDisplay,
  type TravelParseResult,
} from "@/lib/travelParser";
import { getLocationColor } from "@/lib/countryColors";

// ---------------------------------------------------------------------------
// Sample data — uses actual tab characters
// ---------------------------------------------------------------------------
const SAMPLE_DATA = [
  "20240221\t20240226\t申根區域\t希臘\t20240221\t20240221",
  "\t\t\t丹麥\t20240221\t20240224",
  "\t\t\t瑞典\t20240224\t20240224",
  "\t\t\t丹麥\t20240224\t20240226",
  "20240629\t20240630\t申根區域\t瑞士\t20240629\t20240629",
  "\t\t\t法國\t20240629\t20240629",
  "\t\t\t瑞士\t20240629\t20240630",
  "20240630\t20240705\t英國\t英格蘭\t\t",
  "20240705\t20240708\t申根區域\t法國\t\t",
  "20240708\t20240717\t英國\t英格蘭\t\t",
  "20240718\t20240721\t中國\t\t\t",
].join("\n");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS_ZH = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromInputDate(s: string): Date | null {
  if (!s) return null;
  const parts = s.split("-");
  if (parts.length !== 3) return null;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  if (isNaN(d.getTime())) return null;
  return d;
}

// ---------------------------------------------------------------------------
// Location chip component
// ---------------------------------------------------------------------------
function LocationChip({ location }: { location: string }) {
  const color = getLocationColor(location);
  return (
    <span
      className="inline-flex items-center px-1 py-0 text-[11px] font-medium leading-[18px] whitespace-nowrap"
      style={{
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      {location}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Calendar day cell
// ---------------------------------------------------------------------------
interface DayCellProps {
  date: Date;
  locations: string[];
  isToday: boolean;
  isWeekend: boolean;
  isFirstOfMonth: boolean;
}

function DayCell({ date, locations, isToday, isWeekend, isFirstOfMonth }: DayCellProps) {
  const dayNum = date.getDate();
  const isEmpty = locations.length === 0;

  return (
    <div
      className={[
        "border-b border-r border-border flex flex-col min-h-[56px] p-1 relative",
        isWeekend ? "bg-[#fafafa]" : "bg-white",
        isToday ? "outline outline-1 outline-[#EB0000] outline-offset-[-1px]" : "",
      ].join(" ")}
    >
      {/* Month label on first of month */}
      {isFirstOfMonth && (
        <span
          className="text-[9px] text-[#EB0000] font-semibold leading-none mb-0.5 uppercase tracking-wide"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {MONTHS_ZH[date.getMonth()]}
        </span>
      )}
      <div className="flex items-start justify-between gap-1">
        <span
          className={[
            "text-[12px] font-semibold leading-none",
            isToday ? "text-[#EB0000]" : isWeekend ? "text-[#999]" : "text-[#222]",
          ].join(" ")}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {String(dayNum).padStart(2, "0")}
        </span>
        <span
          className="text-[9px] text-[#ccc] leading-none"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {WEEKDAYS_ZH[date.getDay()]}
        </span>
      </div>
      {isEmpty ? (
        <span
          className="text-[10px] text-[#ddd] mt-1"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          —
        </span>
      ) : (
        <div className="flex flex-wrap gap-[2px] mt-1">
          {locations.map((loc) => (
            <LocationChip key={loc} location={loc} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calendar grid — 7 columns (Sun–Sat)
// ---------------------------------------------------------------------------
interface CalendarGridProps {
  result: TravelParseResult;
  viewStart: Date;
  viewEnd: Date;
}

function CalendarGrid({ result, viewStart, viewEnd }: CalendarGridProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = daysBetween(viewStart, viewEnd) + 1;
  const days: Array<{ date: Date; locations: string[] }> = [];

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(viewStart, i);
    const offset = daysBetween(result.startDate, date);
    const locations =
      offset >= 0 && offset < result.dailyLocations.length
        ? result.dailyLocations[offset]
        : [];
    days.push({ date, locations });
  }

  // Pad start to Sunday
  const startDow = viewStart.getDay();
  const paddedDays: Array<{ date: Date | null; locations: string[] }> = [
    ...Array.from({ length: startDow }, () => ({ date: null as Date | null, locations: [] as string[] })),
    ...days,
  ];

  // Pad end to Saturday
  const remainder = paddedDays.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      paddedDays.push({ date: null, locations: [] });
    }
  }

  // Split into weeks
  const weeks: typeof paddedDays[] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="grid grid-cols-7 border-t border-l border-border sticky top-0 z-10 bg-white">
        {WEEKDAYS_ZH.map((d, i) => (
          <div
            key={d}
            className={[
              "border-b border-r border-border px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-widest",
              i === 0 || i === 6 ? "text-[#999] bg-[#fafafa]" : "text-[#555]",
            ].join(" ")}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {d}
          </div>
        ))}
      </div>
      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-l border-border">
          {week.map((cell, di) => {
            if (!cell.date) {
              return (
                <div
                  key={di}
                  className="border-b border-r border-border min-h-[56px] bg-[#f5f5f5]"
                />
              );
            }
            const isToday = cell.date.getTime() === today.getTime();
            const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
            const isFirstOfMonth = cell.date.getDate() === 1;
            return (
              <DayCell
                key={di}
                date={cell.date}
                locations={cell.locations}
                isToday={isToday}
                isWeekend={isWeekend}
                isFirstOfMonth={isFirstOfMonth}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Statistics panel
// ---------------------------------------------------------------------------
interface StatsPanelProps {
  result: TravelParseResult;
  viewStart: Date;
  viewEnd: Date;
}

function StatsPanel({ result, viewStart, viewEnd }: StatsPanelProps) {
  const sliced = useMemo(
    () => sliceResult(result, viewStart, viewEnd),
    [result, viewStart, viewEnd]
  );
  const stats = useMemo(() => computeStats(sliced), [sliced]);
  const totalDays = daysBetween(viewStart, viewEnd) + 1;
  const coveredDays = sliced.dailyLocations.filter((d) => d.length > 0).length;

  return (
    <div>
      <div className="border-b border-border pb-1 mb-2">
        <span
          className="text-[10px] text-[#888] uppercase tracking-widest"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          統計
        </span>
      </div>
      <div className="flex gap-4 mb-3">
        {[
          { val: totalDays, label: "總天數", red: true },
          { val: coveredDays, label: "有記錄", red: false },
          { val: stats.length, label: "地點數", red: false },
        ].map(({ val, label, red }) => (
          <div key={label}>
            <div
              className={`text-[20px] font-semibold leading-none ${red ? "text-[#EB0000]" : "text-[#222]"}`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {val}
            </div>
            <div className="text-[10px] text-[#888] mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      {/* Bar chart + table */}
      <div className="space-y-0">
        {stats.map((s) => {
          const color = getLocationColor(s.location);
          const pct = totalDays > 0 ? Math.round((s.days / totalDays) * 100) : 0;
          return (
            <div key={s.location} className="py-[5px] border-b border-[#f0f0f0]">
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-2 h-2 flex-shrink-0"
                  style={{ backgroundColor: color.border }}
                />
                <span className="flex-1 text-[12px] text-[#222] truncate">{s.location}</span>
                <span
                  className="text-[11px] text-[#888] w-7 text-right"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {pct}%
                </span>
                <span
                  className="text-[11px] font-semibold text-[#222] w-9 text-right"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {s.days}天
                </span>
              </div>
              {/* Bar */}
              <div className="h-[3px] bg-[#f0f0f0] w-full">
                <div
                  className="h-full"
                  style={{ width: `${pct}%`, backgroundColor: color.border }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Home component
// ---------------------------------------------------------------------------
export default function Home() {
  const [dataText, setDataText] = useState(SAMPLE_DATA);
  const [isDetailed, setIsDetailed] = useState(true);
  const [parseResult, setParseResult] = useState<TravelParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Custom view range
  const [customStartStr, setCustomStartStr] = useState("");
  const [customEndStr, setCustomEndStr] = useState("");
  const [durationDays, setDurationDays] = useState(180);
  const [useDuration, setUseDuration] = useState(false);

  // Parse on demand
  const handleParse = useCallback(() => {
    try {
      const result = parseTravelData(dataText, isDetailed);
      setParseResult(result);
      setParseError(null);
      setCustomStartStr(toInputDate(result.startDate));
      setCustomEndStr(toInputDate(result.endDate));
      setUseDuration(false);
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : String(e));
    }
  }, [dataText, isDetailed]);

  // Compute view range
  const { viewStart, viewEnd, rangeError } = useMemo(() => {
    if (!parseResult) return { viewStart: new Date(), viewEnd: new Date(), rangeError: null };

    let vs: Date = parseResult.startDate;
    let ve: Date = parseResult.endDate;
    let rangeError: string | null = null;

    if (customStartStr) {
      const d = fromInputDate(customStartStr);
      if (d) {
        if (d < parseResult.startDate) {
          rangeError = `開始日期不得早於 ${formatDateDisplay(parseResult.startDate)}`;
          vs = parseResult.startDate;
        } else if (d > parseResult.endDate) {
          rangeError = `開始日期不得晚於 ${formatDateDisplay(parseResult.endDate)}`;
          vs = parseResult.startDate;
        } else {
          vs = d;
        }
      }
    }

    if (useDuration) {
      ve = addDays(vs, durationDays - 1);
      if (ve > parseResult.endDate) ve = parseResult.endDate;
    } else if (customEndStr) {
      const d = fromInputDate(customEndStr);
      if (d) {
        if (d > parseResult.endDate) {
          rangeError = (rangeError ? rangeError + "\n" : "") +
            `結束日期不得晚於 ${formatDateDisplay(parseResult.endDate)}`;
          ve = parseResult.endDate;
        } else if (d < vs) {
          rangeError = (rangeError ? rangeError + "\n" : "") + `結束日期不得早於開始日期`;
          ve = parseResult.endDate;
        } else {
          ve = d;
        }
      }
    }

    return { viewStart: vs, viewEnd: ve, rangeError };
  }, [parseResult, customStartStr, customEndStr, durationDays, useDuration]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Left Sidebar ── */}
      <aside className="w-[296px] flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-[#c00000] bg-[#EB0000]">
          <div
            className="text-[10px] text-white/60 uppercase tracking-widest leading-none"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            SBB · CFF · FFS
          </div>
          <h1 className="text-[15px] font-bold text-white leading-tight mt-1">
            Travel History<br />Visualiser
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Data input */}
          <div className="px-3 py-2 border-b border-border">
            <label
              className="block text-[10px] text-[#888] uppercase tracking-widest mb-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              旅行記錄資料
            </label>
            <textarea
              className="w-full text-[11px] bg-[#fafafa] border border-border p-1.5 resize-none focus:outline-none focus:border-[#EB0000] text-[#333] leading-relaxed"
              style={{ fontFamily: "'IBM Plex Mono', monospace", tabSize: 4 }}
              rows={10}
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              placeholder={"貼上旅行記錄資料（Tab 分隔）..."}
              spellCheck={false}
            />
            {parseError && (
              <div
                className="mt-1 text-[11px] text-[#EB0000]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {parseError}
              </div>
            )}
          </div>

          {/* Mode toggle */}
          <div className="px-3 py-2 border-b border-border">
            <label
              className="block text-[10px] text-[#888] uppercase tracking-widest mb-1.5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              顯示模式
            </label>
            <div className="flex">
              <button
                onClick={() => setIsDetailed(true)}
                className={[
                  "flex-1 py-1 text-[11px] font-medium border",
                  isDetailed
                    ? "bg-[#EB0000] text-white border-[#EB0000]"
                    : "bg-white text-[#555] border-border hover:bg-[#f5f5f5]",
                ].join(" ")}
              >
                詳細（小地點）
              </button>
              <button
                onClick={() => setIsDetailed(false)}
                className={[
                  "flex-1 py-1 text-[11px] font-medium border-t border-b border-r",
                  !isDetailed
                    ? "bg-[#EB0000] text-white border-[#EB0000]"
                    : "bg-white text-[#555] border-border hover:bg-[#f5f5f5]",
                ].join(" ")}
              >
                概覽（大地點）
              </button>
            </div>
          </div>

          {/* Parse button */}
          <div className="px-3 py-2 border-b border-border">
            <button
              onClick={handleParse}
              className="w-full py-1.5 bg-[#EB0000] text-white text-[12px] font-semibold hover:bg-[#c00000] active:bg-[#a00000]"
            >
              解析並顯示
            </button>
          </div>

          {/* Date range controls */}
          {parseResult && (
            <div className="px-3 py-2 border-b border-border">
              <label
                className="block text-[10px] text-[#888] uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                顯示範圍
              </label>
              <div
                className="text-[10px] text-[#aaa] mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                資料：{formatDateDisplay(parseResult.startDate)} — {formatDateDisplay(parseResult.endDate)}
              </div>
              <div className="space-y-1.5">
                <div>
                  <label className="block text-[10px] text-[#666] mb-0.5">開始日期</label>
                  <input
                    type="date"
                    className="w-full text-[11px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000]"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    value={customStartStr}
                    min={toInputDate(parseResult.startDate)}
                    max={toInputDate(parseResult.endDate)}
                    onChange={(e) => setCustomStartStr(e.target.value)}
                  />
                </div>

                <div className="flex">
                  <button
                    onClick={() => setUseDuration(false)}
                    className={[
                      "flex-1 py-0.5 text-[10px] border",
                      !useDuration
                        ? "bg-[#222] text-white border-[#222]"
                        : "bg-white text-[#555] border-border hover:bg-[#f5f5f5]",
                    ].join(" ")}
                  >
                    指定結束日
                  </button>
                  <button
                    onClick={() => setUseDuration(true)}
                    className={[
                      "flex-1 py-0.5 text-[10px] border-t border-b border-r",
                      useDuration
                        ? "bg-[#222] text-white border-[#222]"
                        : "bg-white text-[#555] border-border hover:bg-[#f5f5f5]",
                    ].join(" ")}
                  >
                    指定天數
                  </button>
                </div>

                {useDuration ? (
                  <div>
                    <label className="block text-[10px] text-[#666] mb-0.5">
                      天數（預設 180）
                    </label>
                    <input
                      type="number"
                      className="w-full text-[11px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      value={durationDays}
                      min={1}
                      max={3650}
                      onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 180))}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-[#666] mb-0.5">結束日期</label>
                    <input
                      type="date"
                      className="w-full text-[11px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      value={customEndStr}
                      min={customStartStr || toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={(e) => setCustomEndStr(e.target.value)}
                    />
                  </div>
                )}

                {rangeError && (
                  <div
                    className="text-[10px] text-[#EB0000] whitespace-pre-line"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {rangeError}
                  </div>
                )}

                <div
                  className="text-[10px] text-[#aaa]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  顯示：{formatDateDisplay(viewStart)} — {formatDateDisplay(viewEnd)}
                  （{daysBetween(viewStart, viewEnd) + 1} 天）
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {parseResult && (
            <div className="px-3 py-2">
              <StatsPanel result={parseResult} viewStart={viewStart} viewEnd={viewEnd} />
            </div>
          )}

          {/* Warnings */}
          {parseResult && parseResult.warnings.length > 0 && (
            <div className="px-3 py-2 border-t border-border">
              <div
                className="text-[10px] text-[#888] uppercase tracking-widest mb-1"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                警告
              </div>
              {parseResult.warnings.map((w, i) => (
                <div
                  key={i}
                  className="text-[10px] text-[#EB0000]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── Main calendar area ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-4 py-2 border-b border-border flex items-center gap-3 bg-white flex-shrink-0">
          <div className="w-1 h-4 bg-[#EB0000]" />
          <span
            className="text-[10px] text-[#888] uppercase tracking-widest"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            日曆
          </span>
          {parseResult && (
            <>
              <span
                className="text-[11px] text-[#555]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {formatDateDisplay(viewStart)} — {formatDateDisplay(viewEnd)}
              </span>
              <span
                className="text-[11px] font-semibold text-[#EB0000]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {daysBetween(viewStart, viewEnd) + 1} 天
              </span>
              <span
                className="text-[10px] text-[#aaa]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {isDetailed ? "詳細模式" : "概覽模式"}
              </span>
            </>
          )}
        </div>

        {/* Calendar scroll area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {!parseResult ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-12 h-[3px] bg-[#EB0000] mb-6" />
              <h2 className="text-[16px] font-semibold text-[#222] mb-2">
                貼上旅行記錄，點擊「解析並顯示」
              </h2>
              <p className="text-[12px] text-[#888] max-w-sm leading-relaxed">
                支援三種格式：多行群組（大地點 + 小地點）、單行雙地點、單行單地點。
                左側已預載範例資料，可直接點擊解析。
              </p>
              <div
                className="mt-6 text-[10px] text-[#bbb] text-left max-w-md leading-relaxed"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <div className="mb-1 text-[#999]">格式範例（欄位以 Tab 分隔）：</div>
                <div className="text-[#bbb]">20240221  20240226  申根區域  希臘  20240221  20240221</div>
                <div className="text-[#bbb]">          丹麥  20240221  20240224</div>
                <div className="text-[#bbb] mt-1">20240630  20240705  英國  英格蘭</div>
                <div className="text-[#bbb] mt-1">20240219  20240221  新加坡</div>
              </div>
            </div>
          ) : (
            <CalendarGrid result={parseResult} viewStart={viewStart} viewEnd={viewEnd} />
          )}
        </div>
      </main>
    </div>
  );
}
