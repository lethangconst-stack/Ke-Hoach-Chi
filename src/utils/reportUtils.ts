import { CATEGORY_META, SCENARIOS } from '../data/reportScenarios';
import {
  AnnualRow,
  CategoryKey,
  ChartGranularity,
  QuarterBarPoint,
  ScenarioPlan,
  TimeBarPoint,
} from '../types/report';

export function formatBillion(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return '–';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatDecimalBillion(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export interface ConsolidatedConfig {
  thuLamId: string;
  dongAnhId: string;
  linhNamDmtId: string;
  linhNamDcId: string | 'none';
}

export interface ConsolidatedResult {
  title: string;
  subtitle: string;
  totalValue: number;
  timeRange: string;
  years: number[];
  componentScenarios: ScenarioPlan[];
  categoryAnnualRows: AnnualRow[];
  projectAnnualRows: AnnualRow[];
  annualTotals: Record<number, number>;
  quarters: QuarterBarPoint[];
  legendCategories: CategoryKey[];
}

const QUARTER_ORDER: Record<QuarterBarPoint['quarter'], number> = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,
};

export function buildConsolidatedReport(config: ConsolidatedConfig): ConsolidatedResult {
  const chosenIds = [
    config.thuLamId,
    config.dongAnhId,
    config.linhNamDmtId,
    ...(config.linhNamDcId !== 'none' ? [config.linhNamDcId] : []),
  ];

  const componentScenarios = chosenIds
    .map((id) => SCENARIOS.find((s) => s.id === id))
    .filter((s): s is ScenarioPlan => Boolean(s));

  const yearSet = new Set<number>();
  componentScenarios.forEach((s) => s.years.forEach((y) => yearSet.add(y)));
  const years = Array.from(yearSet).sort((a, b) => a - b);

  const totalValue = componentScenarios.reduce((sum, s) => sum + s.totalValue, 0);

  // Aggregate by Category across chosen component scenarios
  const categoryKeys: CategoryKey[] = [
    'chungCu',
    'lienKeTM',
    'lienKeDC',
    'tmdv',
    'haTang',
  ];

  const categoryTotalsMap: Record<CategoryKey, { values: Record<number, number>; total: number }> = {
    chungCu: { values: {}, total: 0 },
    lienKeTM: { values: {}, total: 0 },
    lienKeDC: { values: {}, total: 0 },
    tmdv: { values: {}, total: 0 },
    haTang: { values: {}, total: 0 },
  };

  for (const s of componentScenarios) {
    for (const row of s.annualRows) {
      if (!row.categoryKey) continue;
      const bucket = categoryTotalsMap[row.categoryKey];
      bucket.total += row.total;
      for (const y of years) {
        const val = row.values[y];
        if (val) {
          bucket.values[y] = (bucket.values[y] ?? 0) + val;
        }
      }
    }
  }

  const categoryAnnualRows: AnnualRow[] = categoryKeys
    .filter((k) => categoryTotalsMap[k].total > 0)
    .map((k) => {
      const bucket = categoryTotalsMap[k];
      const formattedValues: Record<number, number | null> = {};
      for (const y of years) {
        formattedValues[y] = bucket.values[y] ? bucket.values[y] : null;
      }
      return {
        label: CATEGORY_META[k].label,
        swatchColor: CATEGORY_META[k].color,
        categoryKey: k,
        values: formattedValues,
        total: bucket.total,
      };
    });

  // Aggregate by Component Project
  const projectColors = ['#1E3A8A', '#0F766E', '#B45309', '#7C3AED'];
  const projectAnnualRows: AnnualRow[] = componentScenarios.map((s, idx) => {
    const vals: Record<number, number | null> = {};
    for (const y of years) {
      vals[y] = s.annualTotals[y] ?? null;
    }
    const shortProjectLabel =
      s.groupId === 'thu-lam'
        ? `Thư Lâm (${s.shortLabel})`
        : s.groupId === 'dong-anh'
        ? `Đông Anh (${s.shortLabel})`
        : s.groupId === 'linh-nam-dmt'
        ? `Lĩnh Nam ĐMT (${s.shortLabel})`
        : `Lĩnh Nam Định cư (${s.shortLabel})`;
    return {
      label: shortProjectLabel,
      swatchColor: projectColors[idx % projectColors.length],
      values: vals,
      total: s.totalValue,
    };
  });

  // Annual Totals
  const annualTotals: Record<number, number> = {};
  for (const y of years) {
    annualTotals[y] = componentScenarios.reduce(
      (sum, s) => sum + (s.annualTotals[y] ?? 0),
      0
    );
  }

  // Merge Quarterly Bars
  const qMap = new Map<string, QuarterBarPoint>();
  for (const s of componentScenarios) {
    for (const q of s.quarters) {
      const key = `${q.year}-${q.quarter}`;
      const existing = qMap.get(key) ?? {
        year: q.year,
        quarter: q.quarter,
        total: 0,
        breakdown: {},
      };
      existing.total += q.total;
      for (const [ck, val] of Object.entries(q.breakdown)) {
        if (val) {
          const cat = ck as CategoryKey;
          existing.breakdown[cat] = (existing.breakdown[cat] ?? 0) + val;
        }
      }
      qMap.set(key, existing);
    }
  }

  const quarters = Array.from(qMap.values()).sort(
    (a, b) => a.year - b.year || QUARTER_ORDER[a.quarter] - QUARTER_ORDER[b.quarter]
  );

  const legendCategories = categoryKeys.filter((k) =>
    quarters.some((q) => (q.breakdown[k] ?? 0) > 0)
  );

  const minYear = years[0] ?? 2026;
  const maxYear = years[years.length - 1] ?? 2030;
  const has2031 = maxYear >= 2031;

  return {
    title: `TỔNG HỢP DỰ ÁN – THƯ LÂM, ĐÔNG ANH, LĨNH NAM`,
    subtitle: `${componentScenarios.length} dự án thành phần đang gộp`,
    totalValue,
    timeRange: `Q4/${minYear} – ${has2031 ? '06/2031' : '05/2030'}`,
    years,
    componentScenarios,
    categoryAnnualRows,
    projectAnnualRows,
    annualTotals,
    quarters,
    legendCategories,
  };
}

export function exportReportCsv(
  title: string,
  years: number[],
  annualRows: AnnualRow[],
  annualTotals: Record<number, number>,
  quarters: QuarterBarPoint[]
) {
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const lines: string[] = [];
  lines.push(esc(title));
  lines.push('');
  lines.push(['GIÁ TRỊ THEO NĂM (Tỷ đồng)', ...years.map((y) => y), 'Tổng'].map(esc).join(','));

  for (const row of annualRows) {
    const label = row.isSubRow ? `  ${row.label}` : row.label;
    lines.push(
      [label, ...years.map((y) => row.values[y] ?? ''), row.total].map(esc).join(',')
    );
  }
  lines.push(
    ['Tổng cộng', ...years.map((y) => annualTotals[y] ?? ''), Object.values(annualTotals).reduce((a, b) => a + b, 0)]
      .map(esc)
      .join(',')
  );

  lines.push('');
  lines.push(['GIÁ TRỊ THEO QUÝ (Tỷ đồng)', 'Năm', 'Quý', 'Tổng quý', 'Chung cư', 'Liền kề TM', 'Liền kề ĐC', 'TMDV', 'Hạ tầng'].map(esc).join(','));
  for (const q of quarters) {
    lines.push(
      [
        `${q.quarter}/${q.year}`,
        q.year,
        q.quarter,
        q.total,
        q.breakdown.chungCu ?? 0,
        q.breakdown.lienKeTM ?? 0,
        q.breakdown.lienKeDC ?? 0,
        q.breakdown.tmdv ?? 0,
        q.breakdown.haTang ?? 0,
      ]
        .map(esc)
        .join(',')
    );
  }

  const csv = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ke_hoach_chi_giai_ngan_${title.toLowerCase().replace(/[^a-z0-9]+/gi, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const QUARTER_MONTHS: Record<QuarterBarPoint['quarter'], [number, number, number]> = {
  Q1: [1, 2, 3],
  Q2: [4, 5, 6],
  Q3: [7, 8, 9],
  Q4: [10, 11, 12],
};

function splitIntEvenly(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  const rem = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < rem ? 1 : 0));
}

function buildScenarioMonthPoints(scenario: ScenarioPlan): TimeBarPoint[] {
  const match = scenario.timeRange.match(/(\d{2})\/(\d{4})\s*[–-]\s*(\d{2})\/(\d{4})/);
  const startMonth = match ? Number(match[1]) : 1;
  const startYear = match ? Number(match[2]) : 2027;
  const endMonth = match ? Number(match[3]) : 12;
  const endYear = match ? Number(match[4]) : 2030;

  const lastQ = scenario.quarters[scenario.quarters.length - 1];
  const points: TimeBarPoint[] = [];

  for (const q of scenario.quarters) {
    let activeMonths: number[] = [...QUARTER_MONTHS[q.quarter]];

    if (q.year === 2026 && q.quarter === 'Q4') {
      activeMonths = [11, 12];
    } else {
      if (q.year === startYear && activeMonths.includes(startMonth)) {
        activeMonths = activeMonths.filter((m) => m >= startMonth);
      }
      if (
        lastQ &&
        q.year === lastQ.year &&
        q.quarter === lastQ.quarter &&
        q.year === endYear &&
        activeMonths.includes(endMonth)
      ) {
        activeMonths = activeMonths.filter((m) => m <= endMonth);
      }
    }

    if (activeMonths.length === 0) {
      activeMonths = [...QUARTER_MONTHS[q.quarter]];
    }

    const catEntries = Object.entries(q.breakdown) as [CategoryKey, number][];
    const perMonthBreakdowns: Partial<Record<CategoryKey, number>>[] = activeMonths.map(
      () => ({})
    );

    for (const [cat, val] of catEntries) {
      if (!val || val <= 0) continue;
      const splits = splitIntEvenly(Math.round(val), activeMonths.length);
      splits.forEach((s, idx) => {
        if (s > 0) perMonthBreakdowns[idx][cat] = s;
      });
    }

    // Also split q.total directly and reconcile rounding with breakdown sum
    const totalSplits = splitIntEvenly(Math.round(q.total), activeMonths.length);

    activeMonths.forEach((m, idx) => {
      const bd = perMonthBreakdowns[idx];
      const bdSum = Object.values(bd).reduce((s, v) => s + (v ?? 0), 0);
      const monthTotal = bdSum > 0 ? bdSum : totalSplits[idx];
      const mm = String(m).padStart(2, '0');
      points.push({
        key: `${q.year}-M${mm}`,
        label: `T${m}`,
        year: q.year,
        tooltipTitle: `Tháng ${mm} / ${q.year}`,
        total: monthTotal,
        breakdown: bd,
      });
    });
  }

  return points;
}

export function buildScenarioTimeSeries(
  scenario: ScenarioPlan,
  granularity: ChartGranularity
): TimeBarPoint[] {
  if (granularity === 'quarter') {
    return scenario.quarters.map((q) => ({
      key: `${q.year}-${q.quarter}`,
      label: q.quarter,
      year: q.year,
      tooltipTitle: `${q.quarter} / ${q.year}`,
      total: q.total,
      breakdown: q.breakdown,
    }));
  }

  if (granularity === 'year') {
    return scenario.years.map((y) => {
      const breakdown: Partial<Record<CategoryKey, number>> = {};
      for (const row of scenario.annualRows) {
        if (!row.categoryKey) continue;
        const val = row.values[y];
        if (val && val > 0) {
          breakdown[row.categoryKey] = (breakdown[row.categoryKey] ?? 0) + val;
        }
      }
      return {
        key: `Y${y}`,
        label: String(y),
        year: y,
        tooltipTitle: `Năm ${y}`,
        total: scenario.annualTotals[y] ?? 0,
        breakdown,
      };
    });
  }

  return buildScenarioMonthPoints(scenario);
}

export function buildConsolidatedTimeSeries(
  report: ConsolidatedResult,
  granularity: ChartGranularity
): TimeBarPoint[] {
  if (granularity === 'quarter') {
    return report.quarters.map((q) => ({
      key: `${q.year}-${q.quarter}`,
      label: q.quarter,
      year: q.year,
      tooltipTitle: `${q.quarter} / ${q.year}`,
      total: q.total,
      breakdown: q.breakdown,
    }));
  }

  if (granularity === 'year') {
    return report.years.map((y) => {
      const breakdown: Partial<Record<CategoryKey, number>> = {};
      for (const row of report.categoryAnnualRows) {
        if (!row.categoryKey) continue;
        const val = row.values[y];
        if (val && val > 0) {
          breakdown[row.categoryKey] = (breakdown[row.categoryKey] ?? 0) + val;
        }
      }
      return {
        key: `Y${y}`,
        label: String(y),
        year: y,
        tooltipTitle: `Năm ${y}`,
        total: report.annualTotals[y] ?? 0,
        breakdown,
      };
    });
  }

  // Merge monthly points across all selected component scenarios
  const monthMap = new Map<string, TimeBarPoint>();
  for (const sc of report.componentScenarios) {
    const pts = buildScenarioMonthPoints(sc);
    for (const pt of pts) {
      const existing = monthMap.get(pt.key) ?? {
        key: pt.key,
        label: pt.label,
        year: pt.year,
        tooltipTitle: pt.tooltipTitle,
        total: 0,
        breakdown: {},
      };
      existing.total += pt.total;
      for (const [k, v] of Object.entries(pt.breakdown)) {
        if (v) {
          const cat = k as CategoryKey;
          existing.breakdown[cat] = (existing.breakdown[cat] ?? 0) + v;
        }
      }
      monthMap.set(pt.key, existing);
    }
  }

  return Array.from(monthMap.values()).sort((a, b) => a.key.localeCompare(b.key));
}

