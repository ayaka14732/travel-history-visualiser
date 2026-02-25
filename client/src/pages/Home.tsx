/**
 * Travel History Visualiser — Main Page
 * Design: Swiss SBB/CFF/FFS (without branding label)
 * - Desktop: Left sidebar (296px) + Right calendar
 * - Mobile: Sidebar only; calendar opens as full-screen popup via "Show Calendar" button
 * - Primary color: #EB0000 (SBB Red)
 * - Typography: IBM Plex Mono (dates), IBM Plex Sans (labels)
 * - Sharp corners, thin borders, dense layout
 * - i18n: all UI strings via useLocale() hook
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES, LOCALE_ORDER, type Locale } from "@/lib/i18n";

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
// Language selector dropdown
// ---------------------------------------------------------------------------
function LangSelector() {
  const { locale, setLocale, localeOrder } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-white/80 hover:text-white text-[13px] font-medium px-1.5 py-0.5 border border-white/30 hover:border-white/60"
        aria-label="Select language"
      >
        <span>{LOCALES[locale].langLabel}</span>
        <span className="text-[10px] opacity-70">▾</span>
      </button>
      {open && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-0.5 z-40 bg-white border border-border shadow-sm min-w-[140px]">
            {(localeOrder as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLocale(l); setOpen(false); }}
                className={[
                  "w-full text-left px-3 py-2 text-[13px]",
                  l === locale
                    ? "bg-[#EB0000] text-white"
                    : "text-[#222] hover:bg-[#f5f5f5]",
                ].join(" ")}
              >
                {LOCALES[l].langLabel}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Format Help Popup
// ---------------------------------------------------------------------------
function FormatHelpPopup({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();

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
          <h2 className="text-[14px] font-bold text-white">{t.helpTitle}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-[18px] leading-none font-light"
            aria-label={t.helpCloseBtn}
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 text-[12px] text-[#222] leading-relaxed">
          <p>
            {t.helpIntro}{" "}
            <strong>{t.helpTabNote}</strong>
            {t.helpIntroCont}
          </p>

          {/* Type 1 */}
          <HelpSection
            title={t.helpType1Title}
            desc={t.helpType1Desc}
            colHeader={t.helpType1ColHeader}
            note={t.helpType1Note}
            rows={[
              { cols: ["20240629", "20240630", "申根區域", "瑞士", "20240629", "20240629"], highlight: [0,1,2,3] },
              { cols: [`[${t.helpEmptyCell}]`, `[${t.helpEmptyCell}]`, `[${t.helpEmptyCell}]`, "法國", "20240629", "20240629"], highlight: [3] },
              { cols: [`[${t.helpEmptyCell}]`, `[${t.helpEmptyCell}]`, `[${t.helpEmptyCell}]`, "瑞士", "20240629", "20240630"], highlight: [3] },
            ]}
          />

          {/* Type 2 */}
          <HelpSection
            title={t.helpType2Title}
            desc={t.helpType2Desc}
            colHeader={t.helpType2ColHeader}
            note={t.helpType2Note}
            rows={[
              { cols: ["20240630", "20240705", "英國", "英格蘭", `[${t.helpEmptyCell}]`, `[${t.helpEmptyCell}]`], highlight: [0,1,2,3] },
            ]}
          />

          {/* Type 3 */}
          <HelpSection
            title={t.helpType3Title}
            desc={t.helpType3Desc}
            colHeader={t.helpType3ColHeader}
            note={t.helpType3Note}
            rows={[
              { cols: ["20240718", "20240721", "中國", `[${t.helpEmptyCell}]`, `[${t.helpEmptyCell}]`, `[${t.helpEmptyCell}]`], highlight: [0,1,2] },
            ]}
          />

          {/* Notes */}
          <div className="border-t border-border pt-4">
            <div className="font-semibold text-[13px] mb-2">{t.helpNotesTitle}</div>
            <ul className="space-y-1 text-[#555] list-none">
              {[t.helpNote1, t.helpNote2, t.helpNote3, t.helpNote4, t.helpNote5].map((note, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#EB0000] font-bold">·</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Full example */}
          <div className="border-t border-border pt-4">
            <div className="font-semibold text-[13px] mb-2">{t.helpExampleTitle}</div>
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
            {t.helpCloseBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper sub-component for format help sections
interface HelpSectionProps {
  title: string;
  desc: string;
  colHeader: string;
  note: string;
  rows: { cols: string[]; highlight: number[] }[];
}

function HelpSection({ title, desc, colHeader, note, rows }: HelpSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-4 bg-[#EB0000]" />
        <span className="font-semibold text-[13px]">{title}</span>
      </div>
      <p className="mb-2 text-[#555]">{desc}</p>
      <div
        className="bg-[#fafafa] border border-border p-3 text-[11px] leading-[1.8] overflow-x-auto"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        <div className="text-[#888] mb-1">{colHeader}</div>
        {rows.map((row, ri) => (
          <div key={ri} className={ri > 0 ? "text-[#aaa]" : ""}>
            {row.cols.map((col, ci) => {
              const isDate = ci < 2 && row.highlight.includes(ci);
              const isRegion = ci === 2 && row.highlight.includes(ci);
              const isSub = ci === 3 && row.highlight.includes(ci);
              return (
                <span
                  key={ci}
                  className={[
                    ci > 0 ? "ml-2" : "",
                    isDate ? "text-[#EB0000]" : "",
                    isRegion ? "text-blue-700" : "",
                    isSub ? "text-green-700" : "",
                  ].join(" ")}
                >
                  {col}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[#555]">{note}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error dialog
// ---------------------------------------------------------------------------
function ErrorDialog({ errors, onClose }: { errors: string[]; onClose: () => void }) {
  const { t } = useLocale();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md border-t-4 border-[#EB0000] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <span
            className="text-[13px] font-bold text-[#EB0000] uppercase tracking-wide"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t.errorDialogTitle}
          </span>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-[#222] text-[18px] leading-none font-light px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {/* Error list */}
        <div className="px-4 py-3 max-h-64 overflow-y-auto">
          {errors.map((err, i) => (
            <div
              key={i}
              className="flex gap-2 py-1 border-b border-border last:border-0"
            >
              <span
                className="text-[#EB0000] font-bold text-[11px] flex-shrink-0 mt-0.5"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                ✕
              </span>
              <span
                className="text-[11px] text-[#222] leading-relaxed"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {err}
              </span>
            </div>
          ))}
        </div>
        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#EB0000] text-white text-[11px] font-medium hover:bg-[#c00000] transition-colors"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t.errorDialogClose}
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
  const { t } = useLocale();
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[#EB0000] flex-shrink-0">
        <div className="flex-1 min-w-0">
          <span
            className="text-[11px] text-white/80"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {formatDateDisplay(viewStart)} — {formatDateDisplay(viewEnd)}
            &nbsp;·&nbsp;{daysBetween(viewStart, viewEnd) + 1}{t.calendarDaysSuffix}
            &nbsp;·&nbsp;{isDetailed ? t.modeDetailed : t.modeOverview}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-[20px] leading-none font-light flex-shrink-0 px-1"
          aria-label="Close calendar"
        >
          {t.calendarPopupClose}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <CalendarGrid result={result} viewStart={viewStart} viewEnd={viewEnd} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// useLongPress: fires callback immediately on press, then repeatedly after delay
// ---------------------------------------------------------------------------
function useLongPress(callback: () => void, { delay = 400, interval = 80 } = {}) {
  const cbRef = useRef(callback);
  useEffect(() => { cbRef.current = callback; });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    cbRef.current(); // fire immediately
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => cbRef.current(), interval);
    }, delay);
  }, [delay, interval]);

  const stop = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); start(); },
    onTouchEnd: stop,
  };
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
  const { t } = useLocale();
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

  const prevPress = useLongPress(() => step(-1));
  const nextPress = useLongPress(() => step(1));

  return (
    <div>
      <label className="block text-[12px] text-[#555] mb-0.5">{label}</label>
      <div className="flex">
        <button
          {...prevPress}
          onClick={undefined}
          className="w-7 flex-shrink-0 border border-r-0 border-border bg-[#f5f5f5] hover:bg-[#eee] active:bg-[#e0e0e0] text-[#444] text-[13px] font-semibold flex items-center justify-center select-none"
          title={t.prevDayTitle}
        >
          −
        </button>
        <input
          type="date"
          className="flex-1 min-w-0 text-[13px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          {...nextPress}
          onClick={undefined}
          className="w-7 flex-shrink-0 border border-l-0 border-border bg-[#f5f5f5] hover:bg-[#eee] active:bg-[#e0e0e0] text-[#444] text-[13px] font-semibold flex items-center justify-center select-none"
          title={t.nextDayTitle}
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
  const prevPress = useLongPress(() => onChange(Math.max(1, value - 1)));
  const nextPress = useLongPress(() => onChange(Math.min(3650, value + 1)));

  return (
    <div>
      <label className="block text-[12px] text-[#555] mb-0.5">{label}</label>
      <div className="flex">
        <button
          {...prevPress}
          onClick={undefined}
          className="w-7 flex-shrink-0 border border-r-0 border-border bg-[#f5f5f5] hover:bg-[#eee] active:bg-[#e0e0e0] text-[#444] text-[13px] font-semibold flex items-center justify-center select-none"
        >
          −
        </button>
        <input
          type="number"
          className="flex-1 min-w-0 text-[13px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000]"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          value={value}
          min={1}
          max={3650}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 180))}
        />
        <button
          {...nextPress}
          onClick={undefined}
          className="w-7 flex-shrink-0 border border-l-0 border-border bg-[#f5f5f5] hover:bg-[#eee] active:bg-[#e0e0e0] text-[#444] text-[13px] font-semibold flex items-center justify-center select-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Location chip
// ---------------------------------------------------------------------------
function LocationChip({ location }: { location: string }) {
  const color = getLocationColor(location);
  return (
    <span
      className="inline-flex items-center px-1 py-0 text-[12px] font-medium leading-[20px] whitespace-nowrap"
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
  const { t } = useLocale();
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
        <span className="text-[11px] text-[#EB0000] font-semibold leading-none mb-0.5">
          {t.months[date.getMonth()]}
        </span>
      )}
      <div className="flex items-start justify-between gap-1">
        <span
          className={[
            "text-[13px] font-semibold leading-none",
            isToday ? "text-[#EB0000]" : isWeekend ? "text-[#999]" : "text-[#222]",
          ].join(" ")}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {String(dayNum).padStart(2, "0")}
        </span>
        <span className="text-[11px] text-[#ccc] leading-none">
          {t.weekdays[date.getDay()]}
        </span>
      </div>
      {isEmpty ? (
        <span className="text-[12px] text-[#ddd] mt-1">
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
  const { t } = useLocale();
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
        {t.weekdays.map((d, i) => (
          <div
            key={d}
            className={[
              "border-b border-r border-border px-1 py-1.5 text-center text-[12px] font-semibold",
              i === 0 || i === 6 ? "text-[#999] bg-[#fafafa]" : "text-[#555]",
            ].join(" ")}
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
  const { t } = useLocale();
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
        <span className="text-[13px] font-semibold text-[#555]">
          {t.statsLabel}
        </span>
      </div>
      <div className="flex gap-4 mb-3">
        {[
          { val: totalDays, label: t.statsTotalDays, red: true },
          { val: coveredDays, label: t.statsRecordedDays, red: false },
          { val: stats.length, label: t.statsLocations, red: false },
        ].map(({ val, label, red }) => (
          <div key={label}>
            <div
              className={`text-[22px] font-semibold leading-none ${red ? "text-[#EB0000]" : "text-[#222]"}`}
            >
              {val}
            </div>
            <div className="text-[12px] text-[#888] mt-0.5">{label}</div>
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
                <span className="flex-1 text-[13px] text-[#222] truncate">{s.location}</span>
                <span className="text-[12px] text-[#888] w-8 text-right">
                  {pct}%
                </span>
                <span className="text-[12px] font-semibold text-[#222] w-10 text-right">
                  {s.days}{t.statsDaysSuffix}
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
// Main Home component
// ---------------------------------------------------------------------------
export default function Home() {
  const { t } = useLocale();

  const [dataText, setDataText] = useState(SAMPLE_DATA);
  const [isDetailed, setIsDetailed] = useState(true);
  const [parseResult, setParseResult] = useState<TravelParseResult | null>(null);
  const [parseError, setParseError] = useState<string[] | null>(null);
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
      if (result.errors.length > 0) {
        setParseError(result.errors);
        setParseResult(null);
        return;
      }
      setParseResult(result);
      setParseError(null);
      setCustomStartStr(toInputDate(result.startDate));
      setCustomEndStr(toInputDate(result.endDate));
      setRangeMode("start-end");
      setDurationDays(daysBetween(result.startDate, result.endDate) + 1);
    } catch (e: unknown) {
      setParseError([e instanceof Error ? e.message : String(e)]);
      setParseResult(null);
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
      if (d < dataStart) { rangeError = t.errStartTooEarly(formatDateDisplay(dataStart)); return dataStart; }
      if (d > dataEnd)   { rangeError = t.errStartTooLate(formatDateDisplay(dataEnd)); return dataStart; }
      return d;
    };
    const clampEnd = (d: Date, start: Date): Date => {
      if (d > dataEnd)  { rangeError = (rangeError ? rangeError + "\n" : "") + t.errEndTooLate(formatDateDisplay(dataEnd)); return dataEnd; }
      if (d < start)    { rangeError = (rangeError ? rangeError + "\n" : "") + t.errEndBeforeStart; return dataEnd; }
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
      const ed = fromInputDate(customEndStr);
      if (ed) ve = clampEnd(ed, dataStart);
      vs = addDays(ve, -(durationDays - 1));
      if (vs < dataStart) vs = dataStart;
    }

    return { viewStart: vs, viewEnd: ve, rangeError };
  }, [parseResult, rangeMode, customStartStr, customEndStr, durationDays, t]);

  const rangeModes: { id: RangeMode; label: string }[] = [
    { id: "start-end",      label: t.rangeModeStartEnd },
    { id: "start-duration", label: t.rangeModeStartDuration },
    { id: "end-duration",   label: t.rangeModeEndDuration },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Format help popup */}
      {showHelp && <FormatHelpPopup onClose={() => setShowHelp(false)} />}

      {/* Error dialog */}
      {parseError && (
        <ErrorDialog
          errors={parseError}
          onClose={() => setParseError(null)}
        />
      )}

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
      <aside className="w-full md:w-[360px] flex-shrink-0 md:border-r border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-[#c00000] bg-[#EB0000] flex items-center justify-between gap-2">
          <h1 className="text-[16px] font-bold text-white leading-tight truncate">
            {t.appTitle}
          </h1>
          <LangSelector />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Data input */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <label
                className="text-[13px] font-semibold text-[#555]"
              >
                {t.dataInputLabel}
              </label>
              <button
                onClick={() => setShowHelp(true)}
                className="text-[12px] text-[#EB0000] hover:underline font-medium"
              >
                {t.formatHelpBtn}
              </button>
            </div>
            <textarea
              className="w-full text-[13px] bg-[#fafafa] border border-border p-1.5 resize-none focus:outline-none focus:border-[#EB0000] text-[#333] leading-relaxed"
              style={{ fontFamily: "'IBM Plex Mono', monospace", tabSize: 4 }}
              rows={10}
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              placeholder={t.dataInputPlaceholder}
              spellCheck={false}
            />

          </div>

          {/* Mode toggle */}
          <div className="px-3 py-2 border-b border-border">
            <label
              className="block text-[13px] font-semibold text-[#555] mb-1.5"
            >
              {t.displayModeLabel}
            </label>
            <div className="flex">
              <button
                onClick={() => setIsDetailed(true)}
                className={[
                  "flex-1 py-1.5 text-[13px] font-medium border",
                  isDetailed
                    ? "bg-[#EB0000] text-white border-[#EB0000]"
                    : "bg-white text-[#555] border-border hover:bg-[#f5f5f5]",
                ].join(" ")}
              >
                {t.modeDetailed}
              </button>
              <button
                onClick={() => setIsDetailed(false)}
                className={[
                  "flex-1 py-1.5 text-[13px] font-medium border-t border-b border-r",
                  !isDetailed
                    ? "bg-[#EB0000] text-white border-[#EB0000]"
                    : "bg-white text-[#555] border-border hover:bg-[#f5f5f5]",
                ].join(" ")}
              >
                {t.modeOverview}
              </button>
            </div>
          </div>

          {/* Parse button */}
          <div className="px-3 py-2 border-b border-border">
            <button
              onClick={handleParse}
              className="w-full py-2 bg-[#EB0000] text-white text-[14px] font-semibold hover:bg-[#c00000] active:bg-[#a00000]"
            >
              {t.parseBtn}
            </button>
          </div>

          {/* Mobile: show calendar button */}
          {parseResult && (
            <div className="px-3 py-2 border-b border-border md:hidden">
              <button
                onClick={() => setShowCalendarPopup(true)}
                className="w-full py-2 border border-[#EB0000] text-[#EB0000] text-[14px] font-semibold hover:bg-[#fff5f5] active:bg-[#ffe0e0]"
              >
                {t.showCalendarBtn}
              </button>
            </div>
          )}

          {/* Date range controls */}
          {parseResult && (
            <div className="px-3 py-2 border-b border-border">
              <label
                className="block text-[13px] font-semibold text-[#555] mb-1.5"
              >
                {t.rangeLabel}
              </label>
              <div className="text-[12px] text-[#aaa] mb-2">
                {t.dataRangePrefix}{formatDateDisplay(parseResult.startDate)} — {formatDateDisplay(parseResult.endDate)}
              </div>

              {/* Range mode selector */}
              <div className="flex flex-wrap mb-2 border border-border">
                {rangeModes.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setRangeMode(m.id)}
                    className={[
                      "flex-1 min-w-0 py-1 text-[12px] font-medium whitespace-nowrap px-1",
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
                {rangeMode === "start-end" && (
                  <>
                    <DateStepper
                      label={t.startDateLabel}
                      value={customStartStr}
                      min={toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomStartStr}
                    />
                    <DateStepper
                      label={t.endDateLabel}
                      value={customEndStr}
                      min={customStartStr || toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomEndStr}
                    />
                  </>
                )}

                {rangeMode === "start-duration" && (
                  <>
                    <DateStepper
                      label={t.startDateLabel}
                      value={customStartStr}
                      min={toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomStartStr}
                    />
                    <DurationStepper
                      label={t.durationLabel}
                      value={durationDays}
                      onChange={setDurationDays}
                    />
                  </>
                )}

                {rangeMode === "end-duration" && (
                  <>
                    <DateStepper
                      label={t.endDateLabel}
                      value={customEndStr}
                      min={toInputDate(parseResult.startDate)}
                      max={toInputDate(parseResult.endDate)}
                      onChange={setCustomEndStr}
                    />
                    <DurationStepper
                      label={t.durationLabel}
                      value={durationDays}
                      onChange={setDurationDays}
                    />
                  </>
                )}

                {rangeError && (
                  <div className="text-[12px] text-[#EB0000] whitespace-pre-line">
                    {rangeError}
                  </div>
                )}

                <div className="text-[12px] text-[#aaa]">
                  {t.displayRangeInfo(
                    formatDateDisplay(viewStart),
                    formatDateDisplay(viewEnd),
                    daysBetween(viewStart, viewEnd) + 1
                  )}
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


        </div>
      </aside>

      {/* ── Main calendar area — hidden on mobile ── */}
      <main className="hidden md:flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-4 py-2 border-b border-border flex items-center gap-3 bg-white flex-shrink-0">
          <div className="w-1 h-4 bg-[#EB0000]" />
          <span className="text-[13px] font-semibold text-[#555]">
            {t.calendarLabel}
          </span>
          {parseResult && (
            <>
              <span className="text-[13px] text-[#555]">
                {formatDateDisplay(viewStart)} — {formatDateDisplay(viewEnd)}
              </span>
              <span className="text-[13px] font-semibold text-[#EB0000]">
                {daysBetween(viewStart, viewEnd) + 1}{t.calendarDaysSuffix}
              </span>
              <span className="text-[12px] text-[#aaa]">
                {isDetailed ? t.modeDetailed : t.modeOverview}
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
                {t.emptyTitle}
              </h2>
              <p className="text-[12px] text-[#888] max-w-sm leading-relaxed">
                {t.emptyDesc}
              </p>
              <button
                onClick={() => setShowHelp(true)}
                className="mt-4 text-[12px] text-[#EB0000] hover:underline font-medium"
              >
                {t.emptyHelpLink}
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
