/**
 * Travel History Visualiser — Main Page
 * Design: Swiss SBB/CFF/FFS (without branding label)
 * - Desktop: Left sidebar (296px) + Right calendar
 * - Mobile: Sidebar only; calendar opens as full-screen popup via "顯示日曆" button
 * - Primary color: #EB0000 (SBB Red)
 * - Typography: IBM Plex Mono (dates), IBM Plex Sans (labels)
 * - Sharp corners, thin borders, dense layout
 * - Mode names: 小地點模式 / 大地點模式
 * - Range modes: 指定起訖日 / 指定起始日和天數 / 指定結束日和天數
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

type RangeMode = "start-end" | "start-duration" | "end-duration";

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
// Format Help Popup
// ---------------------------------------------------------------------------
function FormatHelpPopup({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-0"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white border border-border w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col"
        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#EB0000] flex-shrink-0">
          <h2 className="text-[14px] font-bold text-white">記錄格式說明</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-[18px] leading-none font-light"
            aria-label="關閉"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 text-[12px] text-[#222] leading-relaxed">
          <p>
            每一筆記錄由若干行組成，每行以 <strong>Tab（⇥）</strong> 分隔為 6 個欄位。
            共有三種格式：
          </p>

          {/* Type 1 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-[#EB0000]" />
              <span className="font-semibold text-[13px]">格式一：多行群組（大地點 + 多個小地點）</span>
            </div>
            <p className="mb-2 text-[#555]">
              第一行包含整段旅程的開始／結束日期、大地點名稱，以及第一個小地點的資訊。
              後續行以三個空欄開頭，依序列出其餘小地點。
            </p>
            <div
              className="bg-[#fafafa] border border-border p-3 text-[11px] leading-[1.8] overflow-x-auto"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <div className="text-[#888] mb-1">欄位：[群組開始] [群組結束] [大地點] [小地點] [小地點開始] [小地點結束]</div>
              <div><span className="text-[#EB0000]">20240629</span>  <span className="text-[#EB0000]">20240630</span>  <span className="text-blue-700">申根區域</span>  <span className="text-green-700">瑞士</span>  20240629  20240629</div>
              <div className="text-[#aaa]">[空]  [空]  [空]  <span className="text-green-700">法國</span>  20240629  20240629</div>
              <div className="text-[#aaa]">[空]  [空]  [空]  <span className="text-green-700">瑞士</span>  20240629  20240630</div>
            </div>
            <p className="mt-2 text-[#555]">
              以上表示 2024-06-29 至 2024-06-30 在「申根區域」（大地點）；
              小地點方面，06-29 在瑞士和法國，06-29 至 06-30 在瑞士。
            </p>
          </div>

          {/* Type 2 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-[#EB0000]" />
              <span className="font-semibold text-[13px]">格式二：單行，有大地點和小地點</span>
            </div>
            <p className="mb-2 text-[#555]">
              只有一行，第 4 欄填寫小地點，第 5、6 欄留空。
              小地點的日期範圍與大地點相同。
            </p>
            <div
              className="bg-[#fafafa] border border-border p-3 text-[11px] leading-[1.8] overflow-x-auto"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <div className="text-[#888] mb-1">欄位：[開始] [結束] [大地點] [小地點] [空] [空]</div>
              <div><span className="text-[#EB0000]">20240630</span>  <span className="text-[#EB0000]">20240705</span>  <span className="text-blue-700">英國</span>  <span className="text-green-700">英格蘭</span>  [空]  [空]</div>
            </div>
            <p className="mt-2 text-[#555]">
              表示 2024-06-30 至 2024-07-05 在「英國」（大地點），小地點為「英格蘭」，日期同上。
            </p>
          </div>

          {/* Type 3 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-[#EB0000]" />
              <span className="font-semibold text-[13px]">格式三：單行，只有大地點</span>
            </div>
            <p className="mb-2 text-[#555]">
              只有一行，第 4、5、6 欄均留空。小地點自動與大地點相同。
            </p>
            <div
              className="bg-[#fafafa] border border-border p-3 text-[11px] leading-[1.8] overflow-x-auto"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <div className="text-[#888] mb-1">欄位：[開始] [結束] [大地點] [空] [空] [空]</div>
              <div><span className="text-[#EB0000]">20240718</span>  <span className="text-[#EB0000]">20240721</span>  <span className="text-blue-700">中國</span>  [空]  [空]  [空]</div>
            </div>
            <p className="mt-2 text-[#555]">
              表示 2024-07-18 至 2024-07-21 在「中國」，大小地點均為「中國」。
            </p>
          </div>

          {/* Notes */}
          <div className="border-t border-border pt-4">
            <div className="font-semibold text-[13px] mb-2">注意事項</div>
            <ul className="space-y-1 text-[#555] list-none">
              <li className="flex gap-2"><span className="text-[#EB0000] font-bold">·</span><span>日期格式為 <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>YYYYMMDD</span>（8 位數字，無分隔符）。</span></li>
              <li className="flex gap-2"><span className="text-[#EB0000] font-bold">·</span><span>欄位之間以單個 <strong>Tab</strong> 分隔，不是空格。</span></li>
              <li className="flex gap-2"><span className="text-[#EB0000] font-bold">·</span><span>同一天若出現在多條小地點記錄中（如 20240224 丹麥），該天只計算一次。</span></li>
              <li className="flex gap-2"><span className="text-[#EB0000] font-bold">·</span><span>「小地點模式」使用小地點；「大地點模式」使用大地點。</span></li>
              <li className="flex gap-2"><span className="text-[#EB0000] font-bold">·</span><span>多筆記錄之間可以有空行，程式會自動忽略。</span></li>
            </ul>
          </div>

          {/* Full example */}
          <div className="border-t border-border pt-4">
            <div className="font-semibold text-[13px] mb-2">完整範例</div>
            <div
              className="bg-[#fafafa] border border-border p-3 text-[11px] leading-[1.8] overflow-x-auto whitespace-pre"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
{`20240629\t20240630\t申根區域\t瑞士\t20240629\t20240629
\t\t\t法國\t20240629\t20240629
\t\t\t瑞士\t20240629\t20240630
20240630\t20240705\t英國\t英格蘭\t\t
20240705\t20240708\t申根區域\t法國\t\t
20240708\t20240717\t英國\t英格蘭\t\t
20240718\t20240721\t中國\t\t\t`}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#EB0000] text-white text-[12px] font-semibold hover:bg-[#c00000]"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calendar popup (mobile only)
// ---------------------------------------------------------------------------
interface CalendarPopupProps {
  result: TravelParseResult;
  viewStart: Date;
  viewEnd: Date;
  isDetailed: boolean;
  onClose: () => void;
}

function CalendarPopup({ result, viewStart, viewEnd, isDetailed, onClose }: CalendarPopupProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[#EB0000] flex-shrink-0">
        <div className="flex-1 min-w-0">
          <span
            className="text-[11px] text-white/80"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {formatDateDisplay(viewStart)} — {formatDateDisplay(viewEnd)}
            &nbsp;·&nbsp;{daysBetween(viewStart, viewEnd) + 1} 天
            &nbsp;·&nbsp;{isDetailed ? "小地點模式" : "大地點模式"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-[20px] leading-none font-light flex-shrink-0 px-1"
          aria-label="關閉日曆"
        >
          ×
        </button>
      </div>
      {/* Calendar scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <CalendarGrid result={result} viewStart={viewStart} viewEnd={viewEnd} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Date stepper: input + − / + buttons
// ---------------------------------------------------------------------------
interface DateStepperProps {
  label: string;
  value: string;
  min: string;
  max: string;
  onChange: (v: string) => void;
}

function DateStepper({ label, value, min, max, onChange }: DateStepperProps) {
  const step = (delta: number) => {
    const d = fromInputDate(value);
    if (!d) return;
    const nd = addDays(d, delta);
    const minD = fromInputDate(min);
    const maxD = fromInputDate(max);
    if (minD && nd < minD) return;
    if (maxD && nd > maxD) return;
    onChange(toInputDate(nd));
  };

  return (
    <div>
      <label className="block text-[10px] text-[#666] mb-0.5">{label}</label>
      <div className="flex">
        <button
          onClick={() => step(-1)}
          className="w-7 flex-shrink-0 border border-r-0 border-border bg-[#f5f5f5] hover:bg-[#eee] text-[#444] text-[13px] font-semibold flex items-center justify-center"
          title="前一天"
        >
          −
        </button>
        <input
          type="date"
          className="flex-1 min-w-0 text-[11px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          onClick={() => step(1)}
          className="w-7 flex-shrink-0 border border-l-0 border-border bg-[#f5f5f5] hover:bg-[#eee] text-[#444] text-[13px] font-semibold flex items-center justify-center"
          title="後一天"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Duration stepper
// ---------------------------------------------------------------------------
interface DurationStepperProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function DurationStepper({ label, value, onChange }: DurationStepperProps) {
  return (
    <div>
      <label className="block text-[10px] text-[#666] mb-0.5">{label}</label>
      <div className="flex">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-7 flex-shrink-0 border border-r-0 border-border bg-[#f5f5f5] hover:bg-[#eee] text-[#444] text-[13px] font-semibold flex items-center justify-center"
        >
          −
        </button>
        <input
          type="number"
          className="flex-1 min-w-0 text-[11px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          value={value}
          min={1}
          max={3650}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 180))}
        />
        <button
          onClick={() => onChange(Math.min(3650, value + 1))}
          className="w-7 flex-shrink-0 border border-l-0 border-border bg-[#f5f5f5] hover:bg-[#eee] text-[#444] text-[13px] font-semibold flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
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
// Calendar grid
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

  const startDow = viewStart.getDay();
  const paddedDays: Array<{ date: Date | null; locations: string[] }> = [
    ...Array.from({ length: startDow }, () => ({ date: null as Date | null, locations: [] as string[] })),
    ...days,
  ];

  const remainder = paddedDays.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      paddedDays.push({ date: null, locations: [] });
    }
  }

  const weeks: typeof paddedDays[] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <div className="w-full">
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
// Range mode selector (3 modes)
// ---------------------------------------------------------------------------
const RANGE_MODES: { id: RangeMode; label: string }[] = [
  { id: "start-end",      label: "指定起訖日" },
  { id: "start-duration", label: "指定起始日和天數" },
  { id: "end-duration",   label: "指定結束日和天數" },
];

// ---------------------------------------------------------------------------
// Main Home component
// ---------------------------------------------------------------------------
export default function Home() {
  const [dataText, setDataText] = useState(SAMPLE_DATA);
  const [isDetailed, setIsDetailed] = useState(true);
  const [parseResult, setParseResult] = useState<TravelParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);

  // Range mode state
  const [rangeMode, setRangeMode] = useState<RangeMode>("start-end");
  const [customStartStr, setCustomStartStr] = useState("");
  const [customEndStr, setCustomEndStr] = useState("");
  const [durationDays, setDurationDays] = useState(180);

  const handleParse = useCallback(() => {
    try {
      const result = parseTravelData(dataText, isDetailed);
      setParseResult(result);
      setParseError(null);
      setCustomStartStr(toInputDate(result.startDate));
      setCustomEndStr(toInputDate(result.endDate));
      setRangeMode("start-end");
      setDurationDays(daysBetween(result.startDate, result.endDate) + 1);
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : String(e));
    }
  }, [dataText, isDetailed]);

  const { viewStart, viewEnd, rangeError } = useMemo(() => {
    if (!parseResult) return { viewStart: new Date(), viewEnd: new Date(), rangeError: null };

    const dataStart = parseResult.startDate;
    const dataEnd = parseResult.endDate;
    let vs: Date = dataStart;
    let ve: Date = dataEnd;
    let rangeError: string | null = null;

    const clampStart = (d: Date): Date => {
      if (d < dataStart) { rangeError = `開始日期不得早於 ${formatDateDisplay(dataStart)}`; return dataStart; }
      if (d > dataEnd)   { rangeError = `開始日期不得晚於 ${formatDateDisplay(dataEnd)}`; return dataStart; }
      return d;
    };
    const clampEnd = (d: Date, start: Date): Date => {
      if (d > dataEnd)  { rangeError = (rangeError ? rangeError + "\n" : "") + `結束日期不得晚於 ${formatDateDisplay(dataEnd)}`; return dataEnd; }
      if (d < start)    { rangeError = (rangeError ? rangeError + "\n" : "") + `結束日期不得早於開始日期`; return dataEnd; }
      return d;
    };

    if (rangeMode === "start-end") {
      const sd = fromInputDate(customStartStr);
      const ed = fromInputDate(customEndStr);
      if (sd) vs = clampStart(sd);
      if (ed) ve = clampEnd(ed, vs);
    } else if (rangeMode === "start-duration") {
      const sd = fromInputDate(customStartStr);
      if (sd) vs = clampStart(sd);
      ve = addDays(vs, durationDays - 1);
      if (ve > dataEnd) ve = dataEnd;
    } else {
      // end-duration
      const ed = fromInputDate(customEndStr);
      if (ed) ve = clampEnd(ed, dataStart);
      vs = addDays(ve, -(durationDays - 1));
      if (vs < dataStart) vs = dataStart;
    }

    return { viewStart: vs, viewEnd: ve, rangeError };
  }, [parseResult, rangeMode, customStartStr, customEndStr, durationDays]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Format help popup */}
      {showHelp && <FormatHelpPopup onClose={() => setShowHelp(false)} />}

      {/* Mobile calendar popup */}
      {showCalendarPopup && parseResult && (
        <CalendarPopup
          result={parseResult}
          viewStart={viewStart}
          viewEnd={viewEnd}
          isDetailed={isDetailed}
          onClose={() => setShowCalendarPopup(false)}
        />
      )}

      {/* ── Left Sidebar ── full width on mobile, fixed 296px on desktop */}
      <aside className="w-full md:w-[296px] flex-shrink-0 md:border-r border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-[#c00000] bg-[#EB0000]">
          <h1 className="text-[15px] font-bold text-white leading-tight">
            Travel History Visualiser
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Data input */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <label
                className="text-[10px] text-[#888] uppercase tracking-widest"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                旅行記錄資料
              </label>
              <button
                onClick={() => setShowHelp(true)}
                className="text-[10px] text-[#EB0000] hover:underline font-medium"
              >
                格式說明 ?
              </button>
            </div>
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
                小地點模式
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
                大地點模式
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

          {/* Mobile: show calendar button */}
          {parseResult && (
            <div className="px-3 py-2 border-b border-border md:hidden">
              <button
                onClick={() => setShowCalendarPopup(true)}
                className="w-full py-1.5 border border-[#EB0000] text-[#EB0000] text-[12px] font-semibold hover:bg-[#fff5f5] active:bg-[#ffe0e0]"
              >
                顯示日曆
              </button>
            </div>
          )}

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

              {/* Range mode selector — 3 modes, wrap on mobile */}
              <div className="flex flex-wrap mb-2 border border-border">
                {RANGE_MODES.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setRangeMode(m.id)}
                    className={[
                      "flex-1 min-w-0 py-0.5 text-[10px] font-medium whitespace-nowrap px-1",
                      i > 0 ? "border-l border-border" : "",
                      rangeMode === m.id
                        ? "bg-[#222] text-white"
                        : "bg-white text-[#555] hover:bg-[#f5f5f5]",
                    ].join(" ")}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                {/* start-end: two date pickers */}
                {rangeMode === "start-end" && (
                  <>
                    <DateStepper
                      label="開始日期"
                      value={customStartStr}
                      min={toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomStartStr}
                    />
                    <DateStepper
                      label="結束日期"
                      value={customEndStr}
                      min={customStartStr || toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomEndStr}
                    />
                  </>
                )}

                {/* start-duration: start date + days */}
                {rangeMode === "start-duration" && (
                  <>
                    <DateStepper
                      label="起始日期"
                      value={customStartStr}
                      min={toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomStartStr}
                    />
                    <DurationStepper
                      label="天數（預設 180）"
                      value={durationDays}
                      onChange={setDurationDays}
                    />
                  </>
                )}

                {/* end-duration: end date + days */}
                {rangeMode === "end-duration" && (
                  <>
                    <DateStepper
                      label="結束日期"
                      value={customEndStr}
                      min={toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomEndStr}
                    />
                    <DurationStepper
                      label="天數（預設 180）"
                      value={durationDays}
                      onChange={setDurationDays}
                    />
                  </>
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

      {/* ── Main calendar area — hidden on mobile ── */}
      <main className="hidden md:flex flex-1 flex-col overflow-hidden">
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
                {isDetailed ? "小地點模式" : "大地點模式"}
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
              <button
                onClick={() => setShowHelp(true)}
                className="mt-4 text-[12px] text-[#EB0000] hover:underline font-medium"
              >
                查看格式說明 →
              </button>
            </div>
          ) : (
            <CalendarGrid result={parseResult} viewStart={viewStart} viewEnd={viewEnd} />
          )}
        </div>
      </main>
    </div>
  );
}
