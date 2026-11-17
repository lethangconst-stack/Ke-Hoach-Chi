export type ProjectGroupId =
  | 'tong-hop'
  | 'thu-lam'
  | 'dong-anh'
  | 'linh-nam-dmt'
  | 'linh-nam-dc'
  | 'mong-ham';

export type CategoryKey =
  | 'chungCu'
  | 'lienKeTM'
  | 'lienKeDC'
  | 'tmdv'
  | 'haTang';

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  color: string;
}

export interface AnnualRow {
  label: string;
  isSubRow?: boolean;
  swatchColor?: string;
  swatchBorder?: boolean;
  categoryKey?: CategoryKey;
  values: Record<number, number | null>; // year -> value (tỷ đồng)
  total: number;
}

export type ChartGranularity = 'month' | 'quarter' | 'year';

export interface QuarterBarPoint {
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  total: number;
  breakdown: Partial<Record<CategoryKey, number>>;
}

export interface TimeBarPoint {
  key: string;
  label: string;
  subLabel?: string;
  year: number;
  tooltipTitle: string;
  total: number;
  breakdown: Partial<Record<CategoryKey, number>>;
}

export interface ScenarioPlan {
  id: string;
  groupId: Exclude<ProjectGroupId, 'tong-hop' | 'mong-ham'>;
  shortLabel: string;
  title: string;
  mapImage: string;
  mapCaption: string;
  totalValue: number;
  timeRange: string;
  durationBullets: string[];
  years: number[];
  annualRows: AnnualRow[];
  annualTotals: Record<number, number>;
  quarters: QuarterBarPoint[];
  legendCategories: CategoryKey[];
  extraLegendItems?: { label: string; style: 'dark' | 'outline' }[];
}

export interface FoundationRow {
  tt: string;
  name: string;
  quantity: string;
  months: string;
  avgPerUnit: string;
  totalValue: number;
  level: 'section' | 'group' | 'sub';
}
