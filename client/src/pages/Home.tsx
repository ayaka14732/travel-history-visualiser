/**
 * Travel History Visualiser — Main Page
 * Design:
 * - Desktop: Left sidebar (360px) + Right calendar
 * - Mobile: Sidebar only; calendar opens as full-screen popup via "Show Calendar" button
 * - i18n: all UI strings via useLocale() hook
 */

import { useState, useMemo, useCallback, useRef, useEffect, type ReactNode } from 'react';
import Editor from '@monaco-editor/react';
import {
  parseTravelData,
  computeStats,
  sliceDays,
  addDays,
  daysBetween,
  formatDateDisplay,
  tryParseDate,
  type TravelParseResult,
} from '@/lib/travelParser';
import { getLocationColor } from '@/lib/countryColors';
import { getDisplayName, getFlagEmoji } from '@/lib/countryData';
import { useLocale } from '@/contexts/LocaleContext';
import { LOCALES, type Locale } from '@/lib/i18n';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type RangeMode = 'start-end' | 'start-duration' | 'end-duration';

/** Parse the YYYY-MM-DD value of an <input type="date"> (empty when cleared). */
function fromInputDate(s: string): Date | null {
  return tryParseDate(s.replaceAll('-', ''));
}

const RED_BUTTON = 'px-4 py-1.5 bg-[#EB0000] text-white text-[12px] font-semibold hover:bg-[#c00000]';

// ---------------------------------------------------------------------------
// Language selector dropdown
// ---------------------------------------------------------------------------
function LangSelector() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[#333] hover:text-[#EB0000] text-[13px] font-medium px-2 py-1 border border-border hover:border-[#EB0000] w-full justify-between bg-white"
        aria-label="Select language"
      >
        <span>{LOCALES[locale].langLabel}</span>
        <span className="text-[10px] opacity-70">▾</span>
      </button>
      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-0.5 z-40 bg-white border border-border shadow-sm min-w-full">
            {(Object.keys(LOCALES) as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={[
                  'w-full text-left px-3 py-2 text-[13px]',
                  l === locale ? 'bg-[#EB0000] text-white' : 'text-[#222] hover:bg-[#f5f5f5]',
                ].join(' ')}
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
// Popup shell: dimmed overlay, red title bar, body, footer. Closes on Escape or backdrop click.
// ---------------------------------------------------------------------------
interface PopupProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  panelClassName: string;
  panelStyle?: React.CSSProperties;
  footer: ReactNode;
  children: ReactNode;
}

function Popup({ title, closeLabel, onClose, panelClassName, panelStyle, footer, children }: PopupProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-white border border-border flex flex-col ${panelClassName}`} style={panelStyle}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#EB0000] flex-shrink-0">
          <h2 className="text-[14px] font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-[18px] leading-none font-light px-1"
            aria-label={closeLabel}
          >
            ×
          </button>
        </div>
        {children}
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2 flex-shrink-0">{footer}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Format Help Popup
// ---------------------------------------------------------------------------
function FormatHelpPopup({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  const empty = `[${t.helpEmptyCell}]`;

  return (
    <Popup
      title={t.helpTitle}
      closeLabel={t.helpCloseBtn}
      onClose={onClose}
      panelClassName="w-full max-w-2xl max-h-[92vh] overflow-y-auto"
      footer={
        <button onClick={onClose} className={RED_BUTTON}>
          {t.helpCloseBtn}
        </button>
      }
    >
      <div className="px-5 py-4 space-y-5 text-[12px] text-[#222] leading-relaxed">
        <p>
          {t.helpIntro} <strong>{t.helpTabNote}</strong>
          {t.helpIntroCont}
        </p>

        <HelpSection
          title={t.helpType1Title}
          desc={t.helpType1Desc}
          colHeader={t.helpType1ColHeader}
          note={t.helpType1Note}
          rows={[
            {
              cols: ['20240629', '20240630', t.helpExSchengen, t.helpExSwitzerland, '20240629', '20240629'],
              highlight: [0, 1, 2, 3],
            },
            { cols: [empty, empty, empty, t.helpExFrance, '20240629', '20240629'], highlight: [3] },
            { cols: [empty, empty, empty, t.helpExSwitzerland, '20240629', '20240630'], highlight: [3] },
          ]}
        />

        <HelpSection
          title={t.helpType2Title}
          desc={t.helpType2Desc}
          colHeader={t.helpType2ColHeader}
          note={t.helpType2Note}
          rows={[
            { cols: ['20240630', '20240705', t.helpExUK, t.helpExEngland, empty, empty], highlight: [0, 1, 2, 3] },
          ]}
        />

        <HelpSection
          title={t.helpType3Title}
          desc={t.helpType3Desc}
          colHeader={t.helpType3ColHeader}
          note={t.helpType3Note}
          rows={[{ cols: ['20240718', '20240721', t.helpExChina, empty, empty, empty], highlight: [0, 1, 2] }]}
        />

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

        <div className="border-t border-border pt-4">
          <div className="font-semibold text-[13px] mb-2">{t.helpExampleTitle}</div>
          <div className="bg-[#fafafa] border border-border p-3 text-[11px] leading-[1.8] overflow-x-auto whitespace-pre font-mono">
            {t.helpExampleData}
          </div>
        </div>
      </div>
    </Popup>
  );
}

// Colour of each highlighted column in the help examples: dates, major location, minor location
const HELP_COLUMN_COLORS = ['text-[#EB0000]', 'text-[#EB0000]', 'text-blue-700', 'text-green-700'];

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
      <div className="bg-[#fafafa] border border-border p-3 text-[11px] leading-[1.8] overflow-x-auto font-mono">
        <div className="text-[#888] mb-1">{colHeader}</div>
        {rows.map((row, ri) => (
          <div key={ri} className={ri > 0 ? 'text-[#aaa]' : ''}>
            {row.cols.map((col, ci) => (
              <span
                key={ci}
                className={[ci > 0 ? 'ml-2' : '', row.highlight.includes(ci) ? HELP_COLUMN_COLORS[ci] : ''].join(' ')}
              >
                {col}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[#555]">{note}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "Built with Manus, Claude Code and ❤️" credit line
// ---------------------------------------------------------------------------
function BuiltWith({ linkClassName }: { linkClassName: string }) {
  const { t } = useLocale();
  return (
    <>
      {t.builtWith}{' '}
      <a href="https://manus.im" target="_blank" rel="noopener noreferrer" className={linkClassName}>
        Manus
      </a>
      {t.builtWithSep}
      <a href="https://claude.ai/code" target="_blank" rel="noopener noreferrer" className={linkClassName}>
        Claude Code
      </a>
      {t.builtWithSuffix}
    </>
  );
}

// ---------------------------------------------------------------------------
// About Popup
// ---------------------------------------------------------------------------
function AboutPopup({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();

  return (
    <Popup
      title={t.aboutTitle}
      closeLabel={t.helpCloseBtn}
      onClose={onClose}
      panelClassName="w-full max-w-sm"
      footer={
        <button onClick={onClose} className={RED_BUTTON}>
          {t.helpCloseBtn}
        </button>
      }
    >
      <div className="px-5 py-5 space-y-4 text-[13px] text-[#222] leading-relaxed">
        <div>
          <div className="text-[15px] font-bold text-[#EB0000] mb-1">{t.appTitle}</div>
          <p className="text-[12px] text-[#555]">{t.aboutDescription}</p>
        </div>

        <div className="border-t border-border pt-4 text-[12px] text-[#555] space-y-1">
          <div>
            <BuiltWith linkClassName="text-[#EB0000] hover:underline font-medium" />
          </div>
          <div>
            <a
              href="https://github.com/ayaka14732/travel-history-visualiser-manus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EB0000] hover:underline"
            >
              https://github.com/ayaka14732/travel-history-visualiser-manus
            </a>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="text-[12px] font-semibold text-[#222]">{t.sponsorLabel}</div>
          {[t.sponsorDesc1, t.sponsorDesc2, t.sponsorDesc3].map((p) => (
            <p key={p} className="text-[12px] text-[#555] leading-relaxed">
              {p}
            </p>
          ))}
          <div className="flex gap-4 justify-center pt-1">
            {[
              { src: 'https://ayaka14732.github.io/sponsor/alipay.jpg', name: 'Alipay' },
              { src: 'https://ayaka14732.github.io/sponsor/wechat.png', name: 'WeChat Pay' },
            ].map(({ src, name }) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <img src={src} alt={name} className="w-28 h-28 object-contain border border-border" />
                <span className="text-[11px] text-[#555]">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Popup>
  );
}

// ---------------------------------------------------------------------------
// Monaco Editor Popup
// ---------------------------------------------------------------------------
function MonacoEditorPopup({
  initialValue,
  onApply,
  onClose,
}: {
  initialValue: string;
  onApply: (value: string) => void;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [editorValue, setEditorValue] = useState(initialValue);

  return (
    <Popup
      title={t.editorDialogTitle}
      closeLabel={t.editorDialogCancel}
      onClose={onClose}
      panelClassName=""
      panelStyle={{ width: 'min(96vw, 900px)', height: 'min(90vh, 680px)' }}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-border text-[12px] font-medium text-[#555] hover:bg-[#f0f0f0]"
          >
            {t.editorDialogCancel}
          </button>
          <button onClick={() => onApply(editorValue)} className={RED_BUTTON}>
            {t.editorDialogApply}
          </button>
        </>
      }
    >
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          value={editorValue}
          onChange={(val) => setEditorValue(val ?? '')}
          options={{
            fontFamily: "'IBM Plex Mono', 'Cascadia Code', 'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'off',
            renderWhitespace: 'boundary',
            tabSize: 4,
            insertSpaces: false,
            lineNumbers: 'on',
            folding: false,
            glyphMargin: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: { top: 10, bottom: 10 },
          }}
          theme="light"
        />
      </div>
    </Popup>
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
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md border-t-4 border-[#EB0000] shadow-lg font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <span className="text-[13px] font-bold text-[#EB0000] uppercase tracking-wide">{t.errorDialogTitle}</span>
          <button
            onClick={onClose}
            className="text-[#888] hover:text-[#222] text-[18px] leading-none font-light px-1"
            aria-label={t.errorDialogClose}
          >
            ×
          </button>
        </div>
        <div className="px-4 py-3 max-h-64 overflow-y-auto">
          {errors.map((err, i) => (
            <div key={i} className="flex gap-2 py-1 border-b border-border last:border-0">
              <span className="text-[#EB0000] font-bold text-[11px] flex-shrink-0 mt-0.5">✕</span>
              <span className="text-[11px] text-[#222] leading-relaxed">{err}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#EB0000] text-white text-[11px] font-medium hover:bg-[#c00000] transition-colors"
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
  weekStartsMonday: boolean;
  onClose: () => void;
}

function CalendarPopup({ result, viewStart, viewEnd, isDetailed, weekStartsMonday, onClose }: CalendarPopupProps) {
  const { t } = useLocale();
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-[#EB0000] flex-shrink-0">
        <div className="flex-1 min-w-0">
          <span className="text-[11px] text-white/80 font-mono">
            {formatDateDisplay(viewStart)} — {formatDateDisplay(viewEnd)}
            &nbsp;·&nbsp;{daysBetween(viewStart, viewEnd) + 1}
            {t.calendarDaysSuffix}
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
        <CalendarGrid result={result} viewStart={viewStart} viewEnd={viewEnd} weekStartsMonday={weekStartsMonday} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// useLongPress: fires callback immediately on press, then repeatedly after delay
// ---------------------------------------------------------------------------
function useLongPress(callback: () => void, { delay = 400, interval = 80 } = {}) {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const start = useCallback(() => {
    cbRef.current(); // fire immediately
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => cbRef.current(), interval);
    }, delay);
  }, [delay, interval]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(intervalRef.current);
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      start();
    },
    onTouchEnd: stop,
  };
}

// ---------------------------------------------------------------------------
// Stepper: label + [−] input [+], with long-press repeat on the buttons
// ---------------------------------------------------------------------------
interface StepperProps {
  label: string;
  onStep: (delta: number) => void;
  prevTitle?: string;
  nextTitle?: string;
  children: ReactNode;
}

const STEP_BUTTON =
  'w-7 flex-shrink-0 border border-border bg-[#f5f5f5] hover:bg-[#eee] active:bg-[#e0e0e0] text-[#444] text-[13px] font-semibold flex items-center justify-center select-none';
const STEPPER_INPUT =
  'flex-1 min-w-0 text-[13px] border border-border px-1.5 py-1 bg-white focus:outline-none focus:border-[#EB0000] font-mono';

function Stepper({ label, onStep, prevTitle, nextTitle, children }: StepperProps) {
  const prevPress = useLongPress(() => onStep(-1));
  const nextPress = useLongPress(() => onStep(1));

  return (
    <div>
      <label className="block text-[12px] text-[#555] mb-0.5">{label}</label>
      <div className="flex">
        <button {...prevPress} className={`${STEP_BUTTON} border-r-0`} title={prevTitle}>
          −
        </button>
        {children}
        <button {...nextPress} className={`${STEP_BUTTON} border-l-0`} title={nextTitle}>
          +
        </button>
      </div>
    </div>
  );
}

interface DateStepperProps {
  label: string;
  value: string;
  min: Date;
  max: Date;
  onChange: (v: string) => void;
}

function DateStepper({ label, value, min, max, onChange }: DateStepperProps) {
  const { t } = useLocale();
  const step = (delta: number) => {
    const d = fromInputDate(value);
    if (!d) return; // input was cleared
    const nd = addDays(d, delta);
    if (nd >= min && nd <= max) onChange(formatDateDisplay(nd));
  };

  return (
    <Stepper label={label} onStep={step} prevTitle={t.prevDayTitle} nextTitle={t.nextDayTitle}>
      <input
        type="date"
        className={STEPPER_INPUT}
        value={value}
        min={formatDateDisplay(min)}
        max={formatDateDisplay(max)}
        onChange={(e) => onChange(e.target.value)}
      />
    </Stepper>
  );
}

const MAX_DURATION = 3650;

function DurationStepper({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <Stepper label={label} onStep={(delta) => onChange(Math.min(MAX_DURATION, Math.max(1, value + delta)))}>
      <input
        type="number"
        className={STEPPER_INPUT}
        value={value}
        min={1}
        max={MAX_DURATION}
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 180))}
      />
    </Stepper>
  );
}

// ---------------------------------------------------------------------------
// Radio pair (two mutually exclusive options)
// ---------------------------------------------------------------------------
function RadioPair<T>({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: T;
  options: [{ value: T; label: string }, { value: T; label: string }];
  onChange: (v: T) => void;
}) {
  return (
    <div className="px-3 py-2 border-b border-border">
      <span className="block text-[13px] font-semibold text-[#555] mb-1.5">{label}</span>
      <div className="grid grid-cols-2">
        {options.map((o) => (
          <label key={o.label} className="flex items-center gap-1.5 text-[13px] text-[#555] cursor-pointer">
            <input
              type="radio"
              name={name}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="accent-[#EB0000]"
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Location chip
// ---------------------------------------------------------------------------
function LocationChip({ location }: { location: string }) {
  const { locale } = useLocale();
  const flag = getFlagEmoji(location);
  const color = getLocationColor(location);
  return (
    <span
      className="inline-flex items-center gap-1 px-1 py-0 text-[12px] font-medium leading-[20px] whitespace-nowrap"
      style={{
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
      }}
    >
      {flag && <span className="text-[14px] leading-none">{flag}</span>}
      <span>{getDisplayName(location, locale)}</span>
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
}

function DayCell({ date, locations, isToday }: DayCellProps) {
  const { t } = useLocale();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return (
    <div
      className={[
        'border-b border-r border-border flex flex-col min-h-[56px] p-1 relative',
        isWeekend ? 'bg-[#fafafa]' : 'bg-white',
        isToday ? 'outline outline-1 outline-[#EB0000] outline-offset-[-1px]' : '',
      ].join(' ')}
    >
      {date.getDate() === 1 && (
        <span className="text-[11px] text-[#EB0000] font-semibold leading-none mb-0.5">
          {t.months[date.getMonth()]}
        </span>
      )}
      <span
        className={[
          'text-[13px] font-semibold leading-none font-mono',
          isToday ? 'text-[#EB0000]'
          : isWeekend ? 'text-[#999]'
          : 'text-[#222]',
        ].join(' ')}
      >
        {String(date.getDate()).padStart(2, '0')}
      </span>
      {locations.length === 0 ?
        <span className="text-[12px] text-[#ddd] mt-1">—</span>
      : <div className="flex flex-wrap gap-[2px] mt-1">
          {locations.map((loc) => (
            <LocationChip key={loc} location={loc} />
          ))}
        </div>
      }
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
  weekStartsMonday: boolean;
}

function CalendarGrid({ result, viewStart, viewEnd, weekStartsMonday }: CalendarGridProps) {
  const { t } = useLocale();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // weekStartsMonday: Sun=0→6, Mon=1→0, …, Sat=6→5; else use getDay() directly
  const startDow = weekStartsMonday ? (viewStart.getDay() + 6) % 7 : viewStart.getDay();
  const cells: ({ date: Date; locations: string[] } | null)[] = [
    ...Array<null>(startDow).fill(null),
    ...sliceDays(result, viewStart, viewEnd).map((locations, i) => ({ date: addDays(viewStart, i), locations })),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const orderedWeekdays = weekStartsMonday ? [...t.weekdays.slice(1), t.weekdays[0]] : t.weekdays;
  const weekendCols = weekStartsMonday ? [5, 6] : [0, 6];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 border-t border-l border-border sticky top-0 z-10 bg-white">
        {orderedWeekdays.map((d, i) => (
          <div
            key={d}
            className={[
              'border-b border-r border-border px-1 py-1.5 text-center text-[12px] font-semibold',
              weekendCols.includes(i) ? 'text-[#999] bg-[#fafafa]' : 'text-[#555]',
            ].join(' ')}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-border">
        {cells.map((cell, i) =>
          cell ?
            <DayCell
              key={i}
              date={cell.date}
              locations={cell.locations}
              isToday={cell.date.getTime() === today.getTime()}
            />
          : <div key={i} className="border-b border-r border-border min-h-[56px] bg-[#f5f5f5]" />,
        )}
      </div>
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
  const { t, locale } = useLocale();
  const days = useMemo(() => sliceDays(result, viewStart, viewEnd), [result, viewStart, viewEnd]);
  const stats = useMemo(() => computeStats(days), [days]);
  const coveredDays = days.filter((d) => d.length > 0).length;

  return (
    <div>
      <div className="mb-1.5">
        <span className="text-[13px] font-semibold text-[#555]">{t.statsLabel}</span>
      </div>
      <div className="flex gap-4 pt-1 mb-3">
        {[
          { val: days.length, label: t.statsTotalDays, red: true },
          { val: coveredDays, label: t.statsRecordedDays, red: false },
          { val: stats.length, label: t.statsLocations, red: false },
        ].map(({ val, label, red }) => (
          <div key={label}>
            <div className={`text-[22px] font-semibold leading-none ${red ? 'text-[#EB0000]' : 'text-[#222]'}`}>
              {val}
            </div>
            <div className="text-[12px] text-[#888] mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div>
        {stats.map((s) => {
          const color = getLocationColor(s.location);
          const flag = getFlagEmoji(s.location);
          const pct = Math.round((s.days / days.length) * 100);
          return (
            <div key={s.location} className="py-[5px] border-b border-[#f0f0f0]">
              <div className="flex items-center gap-1.5 mb-1">
                {flag ?
                  <span className="text-[18px] leading-none flex-shrink-0">{flag}</span>
                : <span
                    className="inline-block flex-shrink-0"
                    style={{
                      width: '1.2em',
                      height: '0.9em',
                      borderRadius: '2px',
                      fontSize: '18px',
                      backgroundColor: color.border,
                      verticalAlign: 'middle',
                    }}
                  />
                }
                <span className="flex-1 text-[13px] text-[#222] truncate">{getDisplayName(s.location, locale)}</span>
                <span className="text-[12px] text-[#888] w-8 text-right">{pct}%</span>
                <span className="text-[12px] font-semibold text-[#222] w-10 text-right">
                  {s.days}
                  {t.statsDaysSuffix}
                </span>
              </div>
              <div className="h-[3px] bg-[#f0f0f0] w-full">
                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color.border }} />
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

  // null = user has not edited yet → show the current locale's sample data (follows locale changes)
  const [editedText, setEditedText] = useState<string | null>(null);
  const dataText = editedText ?? t.defaultSampleData;

  const [isDetailed, setIsDetailed] = useState(true);
  const [weekStartsMonday, setWeekStartsMonday] = useState(true);
  const [parseResult, setParseResult] = useState<TravelParseResult | null>(null);
  const [parseError, setParseError] = useState<string[] | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [showMonacoEditor, setShowMonacoEditor] = useState(false);

  // Range mode state
  const [rangeMode, setRangeMode] = useState<RangeMode>('start-end');
  const [customStartStr, setCustomStartStr] = useState('');
  const [customEndStr, setCustomEndStr] = useState('');
  const [durationDays, setDurationDays] = useState(180);

  const prevDataTextRef = useRef<string | null>(null);

  useEffect(() => {
    const isNewData = prevDataTextRef.current !== dataText;
    prevDataTextRef.current = dataText;
    const result = parseTravelData(dataText, isDetailed);
    if (result.errors.length > 0) {
      setParseError(result.errors);
      setParseResult(null);
      return;
    }
    setParseResult(result);
    setParseError(null);
    if (isNewData) {
      toast.success(t.parseSuccess(result.dailyLocations.length));
      setCustomStartStr(formatDateDisplay(result.startDate));
      setCustomEndStr(formatDateDisplay(result.endDate));
      setRangeMode('start-end');
      setDurationDays(daysBetween(result.startDate, result.endDate) + 1);
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
      if (d < dataStart) {
        rangeError = t.errStartTooEarly(formatDateDisplay(dataStart));
        return dataStart;
      }
      if (d > dataEnd) {
        rangeError = t.errStartTooLate(formatDateDisplay(dataEnd));
        return dataStart;
      }
      return d;
    };
    const clampEnd = (d: Date, start: Date): Date => {
      if (d > dataEnd) {
        rangeError = (rangeError ? rangeError + '\n' : '') + t.errEndTooLate(formatDateDisplay(dataEnd));
        return dataEnd;
      }
      if (d < start) {
        rangeError = (rangeError ? rangeError + '\n' : '') + t.errEndBeforeStart;
        return dataEnd;
      }
      return d;
    };

    if (rangeMode === 'start-end') {
      const sd = fromInputDate(customStartStr);
      const ed = fromInputDate(customEndStr);
      if (sd) vs = clampStart(sd);
      if (ed) ve = clampEnd(ed, vs);
    } else if (rangeMode === 'start-duration') {
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
    { id: 'start-end', label: t.rangeModeStartEnd },
    { id: 'start-duration', label: t.rangeModeStartDuration },
    { id: 'end-duration', label: t.rangeModeEndDuration },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showHelp && <FormatHelpPopup onClose={() => setShowHelp(false)} />}

      {showAbout && <AboutPopup onClose={() => setShowAbout(false)} />}

      {showMonacoEditor && (
        <MonacoEditorPopup
          initialValue={dataText}
          onApply={(val) => {
            setEditedText(val);
            setShowMonacoEditor(false);
          }}
          onClose={() => setShowMonacoEditor(false)}
        />
      )}

      {parseError && <ErrorDialog errors={parseError} onClose={() => setParseError(null)} />}

      {showCalendarPopup && parseResult && (
        <CalendarPopup
          result={parseResult}
          viewStart={viewStart}
          viewEnd={viewEnd}
          isDetailed={isDetailed}
          weekStartsMonday={weekStartsMonday}
          onClose={() => setShowCalendarPopup(false)}
        />
      )}

      {/* ── Left Sidebar ── full width on mobile, fixed 360px on desktop */}
      <aside className="w-full md:w-[360px] flex-shrink-0 md:border-r border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-[#c00000] bg-[#EB0000] flex items-center justify-between gap-2">
          <h1 className="text-[20px] font-bold text-white leading-tight truncate">{t.appTitle}</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Language selector */}
          <div className="px-3 py-2 border-b border-border">
            <label className="block text-[13px] font-semibold text-[#555] mb-1.5">{t.languageSectionLabel}</label>
            <LangSelector />
          </div>

          {/* Data input */}
          <div className="px-3 py-2 border-b border-border">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#555]">{t.dataInputLabel}</label>
              <button
                onClick={() => setShowMonacoEditor(true)}
                className="text-[12px] text-[#555] hover:text-[#EB0000] font-medium flex items-center gap-1"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M11 2l3 3-8 8H3v-3l8-8z" />
                </svg>
                <span>{t.editDataBtn}</span>
              </button>
            </div>
          </div>

          <RadioPair
            label={t.displayModeLabel}
            name="displayMode"
            value={isDetailed}
            options={[
              { value: true, label: t.modeDetailed },
              { value: false, label: t.modeOverview },
            ]}
            onChange={setIsDetailed}
          />

          <RadioPair
            label={t.weekStartLabel}
            name="weekStart"
            value={weekStartsMonday}
            options={[
              { value: false, label: t.weekStartSun },
              { value: true, label: t.weekStartMon },
            ]}
            onChange={setWeekStartsMonday}
          />

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
              <label className="block text-[13px] font-semibold text-[#555] mb-1.5">{t.rangeLabel}</label>
              <div className="text-[12px] text-[#aaa] mb-2">
                {t.dataRangePrefix}
                {formatDateDisplay(parseResult.startDate)} — {formatDateDisplay(parseResult.endDate)}
              </div>

              {/* Range mode selector */}
              <div className="flex flex-wrap mb-2 border border-border">
                {rangeModes.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setRangeMode(m.id)}
                    className={[
                      'flex-1 min-w-0 py-1 text-[12px] font-medium whitespace-nowrap px-1',
                      i > 0 ? 'border-l border-border' : '',
                      rangeMode === m.id ? 'bg-[#222] text-white' : 'bg-white text-[#555] hover:bg-[#f5f5f5]',
                    ].join(' ')}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                {rangeMode !== 'end-duration' && (
                  <DateStepper
                    label={t.startDateLabel}
                    value={customStartStr}
                    min={parseResult.startDate}
                    max={parseResult.endDate}
                    onChange={setCustomStartStr}
                  />
                )}
                {rangeMode !== 'start-duration' && (
                  <DateStepper
                    label={t.endDateLabel}
                    value={customEndStr}
                    min={
                      rangeMode === 'start-end' ?
                        (fromInputDate(customStartStr) ?? parseResult.startDate)
                      : parseResult.startDate
                    }
                    max={parseResult.endDate}
                    onChange={setCustomEndStr}
                  />
                )}
                {rangeMode !== 'start-end' && (
                  <DurationStepper label={t.durationLabel} value={durationDays} onChange={setDurationDays} />
                )}

                {rangeError && <div className="text-[12px] text-[#EB0000] whitespace-pre-line">{rangeError}</div>}

                <div className="text-[12px] text-[#aaa]">
                  {t.displayRangeInfo(
                    formatDateDisplay(viewStart),
                    formatDateDisplay(viewEnd),
                    daysBetween(viewStart, viewEnd) + 1,
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

        {/* Sidebar footer */}
        <div className="flex-shrink-0 border-t border-border px-3 py-2 bg-white">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#666] leading-tight">
              <BuiltWith linkClassName="text-[#555] hover:text-[#EB0000] transition-colors font-medium" />
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {[
                { label: t.aboutBtn, onClick: () => setShowAbout(true) },
                { label: t.helpBtn, onClick: () => setShowHelp(true) },
              ].map(({ label, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="text-[11px] text-[#555] hover:text-[#EB0000] px-2 py-1 border border-border hover:border-[#EB0000] bg-white transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main calendar area — hidden on mobile ── */}
      <main className="hidden md:flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-4 py-2 border-b border-border flex items-center gap-3 bg-white flex-shrink-0">
          <div className="w-1 h-4 bg-[#EB0000]" />
          <span className="text-[13px] font-semibold text-[#555]">{t.calendarLabel}</span>
          {parseResult && (
            <>
              <span className="text-[13px] text-[#555]">
                {formatDateDisplay(viewStart)} — {formatDateDisplay(viewEnd)}
              </span>
              <span className="text-[13px] font-semibold text-[#EB0000]">
                {daysBetween(viewStart, viewEnd) + 1}
                {t.calendarDaysSuffix}
              </span>
              <span className="text-[12px] text-[#aaa]">{isDetailed ? t.modeDetailed : t.modeOverview}</span>
            </>
          )}
        </div>

        {/* Calendar scroll area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {!parseResult ?
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-12 h-[3px] bg-[#EB0000] mb-6" />
              <h2 className="text-[16px] font-semibold text-[#222] mb-2">{t.emptyTitle}</h2>
              <p className="text-[12px] text-[#888] max-w-sm leading-relaxed">{t.emptyDesc}</p>
            </div>
          : <CalendarGrid
              result={parseResult}
              viewStart={viewStart}
              viewEnd={viewEnd}
              weekStartsMonday={weekStartsMonday}
            />
          }
        </div>
      </main>
    </div>
  );
}
