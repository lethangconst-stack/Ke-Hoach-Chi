import React, { useState } from 'react';
import { CATEGORY_META } from '../data/reportScenarios';
import { CategoryKey, ChartGranularity, TimeBarPoint } from '../types/report';
import { formatBillion } from '../utils/reportUtils';

interface QuarterlyStackedChartProps {
  points: TimeBarPoint[];
  legendCategories: CategoryKey[];
  granularity: ChartGranularity;
  onGranularityChange: (g: ChartGranularity) => void;
}

const STACK_ORDER: CategoryKey[] = [
  'haTang',
  'chungCu',
  'lienKeDC',
  'lienKeTM',
  'tmdv',
];

const GRANULARITY_OPTIONS: { value: ChartGranularity; label: string }[] = [
  { value: 'month', label: 'Tháng' },
  { value: 'quarter', label: 'Quý' },
  { value: 'year', label: 'Năm' },
];

const TITLE_BY_GRANULARITY: Record<ChartGranularity, string> = {
  month: 'GIÁ TRỊ THEO THÁNG',
  quarter: 'GIÁ TRỊ THEO QUÝ',
  year: 'GIÁ TRỊ THEO NĂM',
};

export const QuarterlyStackedChart: React.FC<QuarterlyStackedChartProps> = ({
  points,
  legendCategories,
  granularity,
  onGranularityChange,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isMonthly = granularity === 'month';
  const isYearly = granularity === 'year';

  const baseWidth = 560;
  const width = isMonthly ? Math.max(baseWidth, points.length * 24 + 24) : baseWidth;
  const height = isYearly ? 210 : 228;
  const padLeft = 12;
  const padRight = 12;
  const padTop = 26;
  const padBottom = isYearly ? 28 : 42;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxTotal = Math.max(100, ...points.map((p) => p.total));
  const slotW = points.length > 0 ? chartW / points.length : chartW;
  const barW = isYearly
    ? Math.min(44, Math.max(24, slotW * 0.45))
    : isMonthly
    ? 14
    : Math.min(26, Math.max(12, slotW * 0.68));

  // Group year spans for bottom tier labels (month & quarter modes)
  const yearGroups: { year: number; startIdx: number; endIdx: number }[] = [];
  points.forEach((pt, idx) => {
    const last = yearGroups[yearGroups.length - 1];
    if (!last || last.year !== pt.year) {
      yearGroups.push({ year: pt.year, startIdx: idx, endIdx: idx });
    } else {
      last.endIdx = idx;
    }
  });

  const hovered = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;

  return (
    <div className="relative">
      {/* Header Row: Title + Month / Quarter / Year Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h3 className="text-[11px] font-bold tracking-wide text-[#8C621F] uppercase">
          {TITLE_BY_GRANULARITY[granularity]}
        </h3>

        <div
          className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md"
          role="group"
          aria-label="Chọn chu kỳ hiển thị biểu đồ"
        >
          {GRANULARITY_OPTIONS.map((opt) => {
            const active = granularity === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setHoveredIdx(null);
                  onGranularityChange(opt.value);
                }}
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#A47128] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-600">
          {legendCategories.map((cat) => (
            <span key={cat} className="inline-flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-[2px] inline-block shrink-0"
                style={{ backgroundColor: CATEGORY_META[cat].color }}
              />
              <span>{CATEGORY_META[cat].label}</span>
            </span>
          ))}
        </div>

        {isMonthly && points.length > 20 && (
          <span className="text-[10px] italic text-slate-400">
            Cuộn ngang xem đủ {points.length} tháng
          </span>
        )}
      </div>

      {/* Scrollable Chart Viewport (scrolls cleanly only when monthly has many columns) */}
      <div className={isMonthly ? 'overflow-x-auto pb-1' : 'overflow-visible'}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={isMonthly ? { width: `${width}px`, minWidth: '100%' } : undefined}
          className={`${isMonthly ? 'h-[228px]' : 'w-full h-auto'} overflow-visible select-none block`}
          role="img"
          aria-label={`Biểu đồ ${TITLE_BY_GRANULARITY[granularity].toLowerCase()}`}
        >
          {/* Baseline */}
          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={width - padRight}
            y2={padTop + chartH}
            stroke="#CBD5E1"
            strokeWidth={1}
          />

          {/* Year Divider Ticks */}
          {!isYearly &&
            yearGroups.slice(1).map((yg) => {
              const x = padLeft + yg.startIdx * slotW;
              return (
                <line
                  key={`sep-${yg.year}`}
                  x1={x}
                  y1={padTop + chartH}
                  x2={x}
                  y2={height - 4}
                  stroke="#E2E8F0"
                  strokeWidth={1}
                />
              );
            })}

          {/* Stacked Columns */}
          {points.map((pt, idx) => {
            const cx = padLeft + idx * slotW + slotW / 2;
            const x = cx - barW / 2;
            const totalHeight = (pt.total / maxTotal) * chartH;
            const isHovered = hoveredIdx === idx;

            const rawSum = STACK_ORDER.reduce(
              (s, k) => s + (pt.breakdown[k] ?? 0),
              0
            );
            const scale = rawSum > 0 ? totalHeight / rawSum : 0;

            let currentY = padTop + chartH;

            return (
              <g
                key={pt.key}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <rect
                  x={padLeft + idx * slotW + 1}
                  y={padTop - 16}
                  width={Math.max(4, slotW - 2)}
                  height={chartH + 34}
                  rx={4}
                  fill={isHovered ? '#F8FAFC' : 'transparent'}
                />

                {STACK_ORDER.map((cat) => {
                  const val = pt.breakdown[cat] ?? 0;
                  if (val <= 0) return null;
                  const segH = Math.max(1.5, val * scale);
                  currentY -= segH;
                  return (
                    <rect
                      key={cat}
                      x={x}
                      y={currentY}
                      width={barW}
                      height={segH}
                      fill={CATEGORY_META[cat].color}
                      opacity={hoveredIdx !== null && !isHovered ? 0.72 : 1}
                      className="transition-opacity duration-150"
                    />
                  );
                })}

                {/* Value label above bar */}
                <text
                  x={cx}
                  y={Math.max(12, padTop + chartH - totalHeight - 5)}
                  textAnchor="middle"
                  className={`font-mono-num font-semibold ${
                    isMonthly
                      ? 'text-[7.5px]'
                      : isYearly
                      ? 'text-[10.5px]'
                      : points.length > 16
                      ? 'text-[8.5px]'
                      : 'text-[9.5px]'
                  } ${isHovered ? 'fill-[#9A1B0E]' : 'fill-slate-700'}`}
                >
                  {formatBillion(pt.total)}
                </text>

                {/* Primary X-axis label */}
                <text
                  x={cx}
                  y={padTop + chartH + 14}
                  textAnchor="middle"
                  className={`${
                    isMonthly ? 'text-[8.5px]' : isYearly ? 'text-[11px] font-semibold' : 'text-[9.5px] font-medium'
                  } fill-slate-600 font-mono-num`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}

          {/* Year Group Labels for Month / Quarter views */}
          {!isYearly &&
            yearGroups.map((yg) => {
              const xStart = padLeft + yg.startIdx * slotW;
              const xEnd = padLeft + (yg.endIdx + 1) * slotW;
              const midX = (xStart + xEnd) / 2;
              return (
                <text
                  key={`yr-${yg.year}`}
                  x={midX}
                  y={height - 7}
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-slate-600 font-mono-num"
                >
                  {yg.year}
                </text>
              );
            })}
        </svg>
      </div>

      {/* Hover Tooltip anchored outside scroll container so it never clips */}
      {hovered && (
        <div className="mt-2 sm:mt-0 sm:absolute sm:top-14 sm:right-2 bg-slate-900/95 text-white rounded-lg px-3 py-2 text-[11px] shadow-lg pointer-events-none z-20 min-w-[195px]">
          <div className="font-semibold text-amber-300 flex items-center justify-between gap-3 mb-1 pb-1 border-b border-slate-700">
            <span>{hovered.tooltipTitle}</span>
            <span className="font-mono-num text-white">
              {formatBillion(hovered.total)} tỷ
            </span>
          </div>
          <div className="space-y-0.5 tabular-nums">
            {STACK_ORDER.slice()
              .reverse()
              .map((cat) => {
                const v = hovered.breakdown[cat];
                if (!v) return null;
                return (
                  <div key={cat} className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <span
                        className="w-2 h-2 rounded-[2px]"
                        style={{ backgroundColor: CATEGORY_META[cat].color }}
                      />
                      {CATEGORY_META[cat].label}
                    </span>
                    <span className="font-mono-num font-medium">
                      {formatBillion(v)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
