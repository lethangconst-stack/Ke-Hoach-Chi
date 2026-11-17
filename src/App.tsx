import React, { useMemo, useState } from 'react';
import {
  Download,
  FileDown,
  Layers,
  Maximize2,
  Printer,
} from 'lucide-react';
import {
  CATEGORY_META,
  SCENARIOS,
  TOP_PROJECT_OPTIONS,
} from './data/reportScenarios';
import { ChartGranularity, ProjectGroupId, ScenarioPlan } from './types/report';
import {
  buildConsolidatedReport,
  buildConsolidatedTimeSeries,
  buildScenarioTimeSeries,
  ConsolidatedConfig,
  exportReportCsv,
  formatBillion,
} from './utils/reportUtils';
import { AnnualValueTable } from './components/AnnualValueTable';
import { QuarterlyStackedChart } from './components/QuarterlyStackedChart';
import { ConsolidatedMapGrid } from './components/ConsolidatedMapGrid';
import { FoundationView } from './components/FoundationView';
import { MapLightboxModal } from './components/MapLightboxModal';

export default function App() {
  // Primary top-level option: 'tong-hop' sits right alongside component project groups
  const [activeGroup, setActiveGroup] = useState<ProjectGroupId>('tong-hop');

  // Active scenario per component project group
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<Exclude<ProjectGroupId, 'tong-hop' | 'mong-ham'>, string>
  >({
    'thu-lam': 'tl-pa4',
    'dong-anh': 'da-b4',
    'linh-nam-dmt': 'ln-dmt-24t',
    'linh-nam-dc': 'ln-dc-24t',
  });

  // Configuration for Tổng hợp mode (user can combine any PA of each project)
  const [consolidatedConfig, setConsolidatedConfig] = useState<ConsolidatedConfig>({
    thuLamId: 'tl-pa4',
    dongAnhId: 'da-b4',
    linhNamDmtId: 'ln-dmt-24t',
    linhNamDcId: 'ln-dc-24t',
  });

  const [consolidatedTableMode, setConsolidatedTableMode] = useState<
    'category' | 'project'
  >('category');

  const [chartGranularity, setChartGranularity] =
    useState<ChartGranularity>('quarter');

  const [lightboxData, setLightboxData] = useState<{
    title: string;
    imageSrc: string;
    caption: string;
  } | null>(null);

  const groupScenarios = useMemo(() => {
    if (activeGroup === 'tong-hop' || activeGroup === 'mong-ham') return [];
    return SCENARIOS.filter((s) => s.groupId === activeGroup);
  }, [activeGroup]);

  const activeScenario: ScenarioPlan | null = useMemo(() => {
    if (activeGroup === 'tong-hop' || activeGroup === 'mong-ham') return null;
    const chosenId = selectedByGroup[activeGroup];
    return (
      SCENARIOS.find((s) => s.id === chosenId) ??
      SCENARIOS.find((s) => s.groupId === activeGroup) ??
      null
    );
  }, [activeGroup, selectedByGroup]);

  const consolidatedReport = useMemo(
    () => buildConsolidatedReport(consolidatedConfig),
    [consolidatedConfig]
  );

  const consolidatedChartPoints = useMemo(
    () => buildConsolidatedTimeSeries(consolidatedReport, chartGranularity),
    [consolidatedReport, chartGranularity]
  );

  const scenarioChartPoints = useMemo(
    () =>
      activeScenario
        ? buildScenarioTimeSeries(activeScenario, chartGranularity)
        : [],
    [activeScenario, chartGranularity]
  );

  const handleSelectGroup = (groupId: ProjectGroupId) => {
    setActiveGroup(groupId);
  };

  const handleSelectScenario = (
    groupId: Exclude<ProjectGroupId, 'tong-hop' | 'mong-ham'>,
    scenarioId: string
  ) => {
    setSelectedByGroup((prev) => ({ ...prev, [groupId]: scenarioId }));
  };

  const handleJumpFromConsolidated = (
    groupId: ProjectGroupId,
    scenarioId: string
  ) => {
    if (groupId !== 'tong-hop' && groupId !== 'mong-ham') {
      setSelectedByGroup((prev) => ({ ...prev, [groupId]: scenarioId }));
    }
    setActiveGroup(groupId);
  };

  const handleExportCurrentCsv = () => {
    if (activeGroup === 'tong-hop') {
      const rows =
        consolidatedTableMode === 'category'
          ? consolidatedReport.categoryAnnualRows
          : consolidatedReport.projectAnnualRows;
      exportReportCsv(
        consolidatedReport.title,
        consolidatedReport.years,
        rows,
        consolidatedReport.annualTotals,
        consolidatedReport.quarters
      );
    } else if (activeScenario) {
      exportReportCsv(
        activeScenario.title,
        activeScenario.years,
        activeScenario.annualRows,
        activeScenario.annualTotals,
        activeScenario.quarters
      );
    }
  };

  const thuLamScenarios = SCENARIOS.filter((s) => s.groupId === 'thu-lam');
  const lnDmtScenarios = SCENARIOS.filter((s) => s.groupId === 'linh-nam-dmt');
  const lnDcScenarios = SCENARIOS.filter((s) => s.groupId === 'linh-nam-dc');

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-slate-900 flex flex-col">
      {/* TOP HEADER BAR (Report Brand + Global Actions) */}
      <header className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2.5 h-7 bg-[#A47128] rounded-xs shrink-0" aria-hidden="true" />
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#1E3A8A] truncate">
              KẾ HOẠCH CHI GIẢI NGÂN – DỰ ÁN THƯ LÂM, ĐÔNG ANH, LĨNH NAM
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/assets/aistudio/261107_BaoCao_KeHoachChiGiaiNgan_TL-DA-LN_v14_ee2c2c74.pdf"
              download="BaoCao_KeHoachChiGiaiNgan_TL-DA-LN.pdf"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Tải PDF gốc</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>In trang</span>
            </button>

            {activeGroup !== 'mong-ham' && (
              <button
                type="button"
                onClick={handleExportCurrentCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172D6B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* TOP OPTIONS BAR (Các tùy chọn đặt phía trên đầu trang) */}
      <div className="bg-[#FDFBF6] border-b-2 border-[#E09F1F] sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 space-y-2.5">
          {/* Row 1: Primary Project Options (Tổng hợp + Từng dự án thành phần + Móng & Hầm) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {TOP_PROJECT_OPTIONS.map((opt) => {
              const isActive = activeGroup === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectGroup(opt.id)}
                  className={`px-3.5 py-2 rounded-lg text-left transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer border ${
                    isActive
                      ? 'bg-[#9A1B0E] text-white border-[#9A1B0E] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#A47128] hover:text-slate-900'
                  }`}
                >
                  {opt.id === 'tong-hop' && (
                    <Layers
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-amber-200' : 'text-[#A47128]'
                      }`}
                    />
                  )}
                  <span className="text-xs font-semibold">{opt.label}</span>
                  <span
                    className={`text-[11px] font-normal hidden xl:inline ${
                      isActive ? 'text-amber-100' : 'text-slate-400'
                    }`}
                  >
                    · {opt.subLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 2: Sub-options (Phương án của dự án đang chọn hoặc cấu hình tổ hợp Tổng hợp) */}
          {activeGroup === 'tong-hop' && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#EADCC0]">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-[#8C621F] whitespace-nowrap">
                  Tổ hợp phương án:
                </span>

                <label className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1">
                  <span className="text-slate-500 text-[11px]">Thư Lâm:</span>
                  <select
                    value={consolidatedConfig.thuLamId}
                    onChange={(e) =>
                      setConsolidatedConfig((prev) => ({
                        ...prev,
                        thuLamId: e.target.value,
                      }))
                    }
                    className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {thuLamScenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortLabel} ({formatBillion(s.totalValue)} tỷ)
                      </option>
                    ))}
                  </select>
                </label>

                <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1">
                  <span className="text-slate-500 text-[11px]">Đông Anh:</span>
                  <span className="text-xs font-semibold text-slate-900">
                    Khu B4 (24.677 tỷ)
                  </span>
                </div>

                <label className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1">
                  <span className="text-slate-500 text-[11px]">Lĩnh Nam ĐMT:</span>
                  <select
                    value={consolidatedConfig.linhNamDmtId}
                    onChange={(e) =>
                      setConsolidatedConfig((prev) => ({
                        ...prev,
                        linhNamDmtId: e.target.value,
                      }))
                    }
                    className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {lnDmtScenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortLabel} ({formatBillion(s.totalValue)} tỷ)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1">
                  <span className="text-slate-500 text-[11px]">Lĩnh Nam Định cư:</span>
                  <select
                    value={consolidatedConfig.linhNamDcId}
                    onChange={(e) =>
                      setConsolidatedConfig((prev) => ({
                        ...prev,
                        linhNamDcId: e.target.value,
                      }))
                    }
                    className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {lnDcScenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shortLabel} ({formatBillion(s.totalValue)} tỷ)
                      </option>
                    ))}
                    <option value="none">Không gộp khu ĐC</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setConsolidatedConfig({
                      thuLamId: 'tl-pa4',
                      dongAnhId: 'da-b4',
                      linhNamDmtId: 'ln-dmt-24t',
                      linhNamDcId: 'ln-dc-24t',
                    })
                  }
                  className="px-2.5 py-1 text-[11px] font-medium bg-white border border-[#D7C39B] text-[#8C621F] hover:bg-[#FAF1E0] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  Kịch bản 24 tháng
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConsolidatedConfig({
                      thuLamId: 'tl-pa4',
                      dongAnhId: 'da-b4',
                      linhNamDmtId: 'ln-dmt-36t',
                      linhNamDcId: 'ln-dc-36t',
                    })
                  }
                  className="px-2.5 py-1 text-[11px] font-medium bg-white border border-[#D7C39B] text-[#8C621F] hover:bg-[#FAF1E0] rounded-md transition-colors whitespace-nowrap cursor-pointer"
                >
                  Kịch bản 36 tháng
                </button>
              </div>
            </div>
          )}

          {activeGroup !== 'tong-hop' &&
            activeGroup !== 'mong-ham' &&
            groupScenarios.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EADCC0]">
                <span className="text-xs font-semibold text-[#8C621F] whitespace-nowrap mr-1">
                  Chọn phương án:
                </span>
                {groupScenarios.map((sc) => {
                  const isSelected = activeScenario?.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() =>
                        handleSelectScenario(sc.groupId, sc.id)
                      }
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border tabular-nums ${
                        isSelected
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#1E3A8A] hover:text-[#1E3A8A]'
                      }`}
                    >
                      <span>{sc.shortLabel}</span>
                      <span
                        className={`ml-1.5 font-mono-num ${
                          isSelected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        · {formatBillion(sc.totalValue)} tỷ
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* MAIN EXECUTIVE REPORT SHEET */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {activeGroup === 'mong-ham' ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <FoundationView />
          </div>
        ) : activeGroup === 'tong-hop' ? (
          <>
            {/* Executive Report Card matching PDF Slide Structure */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
              {/* Slide Title */}
              <div className="border-b border-[#EADCC0] pb-3 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-[#9A1B0E] tracking-tight">
                  {consolidatedReport.title}
                </h2>
                <span className="text-xs text-slate-500">
                  {consolidatedReport.subtitle} · {consolidatedReport.timeRange}
                </span>
              </div>

              {/* 2-Column Layout Matching PDF (7:5 Split) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Consolidated Maps + Component Breakdown */}
                <div className="lg:col-span-6 xl:col-span-7">
                  <ConsolidatedMapGrid
                    componentScenarios={consolidatedReport.componentScenarios}
                    totalValue={consolidatedReport.totalValue}
                    onJumpToScenario={handleJumpFromConsolidated}
                    onZoomMap={(sc) =>
                      setLightboxData({
                        title: sc.title,
                        imageSrc: sc.mapImage,
                        caption: sc.mapCaption,
                      })
                    }
                  />
                </div>

                {/* Right Column: Total Value + Thời gian + Giá trị theo Năm + Giá trị theo Quý */}
                <div className="lg:col-span-6 xl:col-span-5 space-y-5">
                  {/* Summary Block */}
                  <div className="pb-3.5 border-b border-[#D7C39B] space-y-1.5">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm text-slate-600">Tổng giá trị:</span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] font-mono-num tracking-tight">
                        {formatBillion(consolidatedReport.totalValue)}
                      </span>
                      <span className="text-sm text-slate-600">tỷ đồng</span>
                    </div>
                    <div className="text-xs text-slate-800">
                      <span className="text-slate-600">Thời gian tổng thể: </span>
                      <strong className="font-semibold">
                        {consolidatedReport.timeRange}
                      </strong>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-0.5 pt-1 list-disc pl-4">
                      {consolidatedReport.componentScenarios.map((sc) => (
                        <li key={sc.id}>
                          <span className="font-semibold">{sc.title}:</span>{' '}
                          <span className="font-mono-num font-semibold text-[#1E3A8A]">
                            {formatBillion(sc.totalValue)} tỷ
                          </span>{' '}
                          ({sc.timeRange})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Giá trị theo năm */}
                  <AnnualValueTable
                    years={consolidatedReport.years}
                    rows={
                      consolidatedTableMode === 'category'
                        ? consolidatedReport.categoryAnnualRows
                        : consolidatedReport.projectAnnualRows
                    }
                    totals={consolidatedReport.annualTotals}
                    grandTotal={consolidatedReport.totalValue}
                    headerRightAction={
                      <div className="inline-flex items-center p-0.5 bg-slate-100 rounded border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setConsolidatedTableMode('category')}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-xs cursor-pointer ${
                            consolidatedTableMode === 'category'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Hạng mục
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsolidatedTableMode('project')}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-xs cursor-pointer ${
                            consolidatedTableMode === 'project'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Theo dự án
                        </button>
                      </div>
                    }
                  />

                  {/* Biểu đồ giá trị theo Tháng / Quý / Năm */}
                  <QuarterlyStackedChart
                    points={consolidatedChartPoints}
                    legendCategories={consolidatedReport.legendCategories}
                    granularity={chartGranularity}
                    onGranularityChange={setChartGranularity}
                  />
                </div>
              </div>
            </section>

            {/* Detailed Cashflow Matrix Strip below matching selected granularity */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold tracking-wide text-[#8C621F] uppercase">
                  {chartGranularity === 'month'
                    ? 'BẢNG SỐ LIỆU DÒNG TIỀN CHI TIẾT THEO THÁNG (TỔNG HỢP)'
                    : chartGranularity === 'year'
                    ? 'BẢNG SỐ LIỆU DÒNG TIỀN CHI TIẾT THEO NĂM (TỔNG HỢP)'
                    : 'BẢNG SỐ LIỆU DÒNG TIỀN CHI TIẾT THEO QUÝ (TỔNG HỢP)'}
                </h3>
                <span className="text-xs italic text-slate-500">ĐVT: tỷ đồng</span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[420px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3 whitespace-nowrap">
                        {chartGranularity === 'month'
                          ? 'Kỳ tháng'
                          : chartGranularity === 'year'
                          ? 'Năm'
                          : 'Kỳ quý'}
                      </th>
                      {consolidatedReport.legendCategories.map((cat) => (
                        <th key={cat} className="py-2 px-3 text-right whitespace-nowrap">
                          {CATEGORY_META[cat].label}
                        </th>
                      ))}
                      <th className="py-2 px-3 text-right whitespace-nowrap text-[#1E3A8A]">
                        Tổng cộng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {consolidatedChartPoints.map((pt) => (
                      <tr key={pt.key} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono-num font-medium text-slate-900 whitespace-nowrap">
                          {pt.tooltipTitle}
                        </td>
                        {consolidatedReport.legendCategories.map((cat) => (
                          <td
                            key={cat}
                            className="py-2 px-3 text-right font-mono-num text-slate-600 whitespace-nowrap"
                          >
                            {formatBillion(pt.breakdown[cat])}
                          </td>
                        ))}
                        <td className="py-2 px-3 text-right font-mono-num font-bold text-[#1E3A8A] whitespace-nowrap">
                          {formatBillion(pt.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          activeScenario && (
            <>
              {/* SINGLE SCENARIO REPORT SHEET (EXACT PDF PAGE 2–11 REPLICA) */}
              <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
                {/* Scenario Banner Title */}
                <div className="border-b border-[#EADCC0] pb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-[#9A1B0E] tracking-tight">
                    {activeScenario.title}
                  </h2>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {activeScenario.timeRange}
                  </span>
                </div>

                {/* 2-Column PDF Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: Architectural Site Plan Map */}
                  <div className="lg:col-span-7 space-y-2.5">
                    <div className="relative bg-white border border-slate-200 rounded-lg overflow-hidden group">
                      <img
                        src={activeScenario.mapImage}
                        alt={`Mặt bằng ${activeScenario.title}`}
                        className="w-full h-auto block"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxData({
                            title: activeScenario.title,
                            imageSrc: activeScenario.mapImage,
                            caption: activeScenario.mapCaption,
                          })
                        }
                        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white/95 hover:bg-white text-slate-800 border border-slate-200 rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Phóng to mặt bằng</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Total Value + Duration Bullets + Annual Table + Quarterly Chart */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* Summary Block */}
                    <div className="pb-3.5 border-b border-[#D7C39B] space-y-1.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm text-slate-600">Tổng giá trị:</span>
                        <span className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] font-mono-num tracking-tight">
                          {formatBillion(activeScenario.totalValue)}
                        </span>
                        <span className="text-sm text-slate-600">tỷ đồng</span>
                      </div>

                      <div className="text-xs text-slate-800">
                        <span className="text-slate-600">Thời gian: </span>
                        <strong className="font-semibold">
                          {activeScenario.timeRange}
                        </strong>
                      </div>

                      <ul className="text-xs font-medium text-slate-800 space-y-0.5 pt-0.5 list-disc pl-4">
                        {activeScenario.durationBullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Giá trị theo năm */}
                    <AnnualValueTable
                      years={activeScenario.years}
                      rows={activeScenario.annualRows}
                      totals={activeScenario.annualTotals}
                      grandTotal={activeScenario.totalValue}
                    />

                    {/* Biểu đồ giá trị theo Tháng / Quý / Năm */}
                    <QuarterlyStackedChart
                      points={scenarioChartPoints}
                      legendCategories={activeScenario.legendCategories}
                      granularity={chartGranularity}
                      onGranularityChange={setChartGranularity}
                    />
                  </div>
                </div>
              </section>

              {/* Multi-scenario Comparison Table when project has multiple options */}
              {groupScenarios.length > 1 && (
                <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="text-xs font-bold tracking-wide text-[#8C621F] uppercase">
                      SO SÁNH NHANH CÁC PHƯƠNG ÁN TRONG CÙNG DỰ ÁN
                    </h3>
                    <span className="text-xs text-slate-500">
                      Nhấn vào một dòng để chuyển nhanh phương án
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                          <th className="py-2.5 px-3.5 whitespace-nowrap">Phương án</th>
                          <th className="py-2.5 px-3.5 whitespace-nowrap">Thời gian</th>
                          <th className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            Tổng giá trị (tỷ)
                          </th>
                          <th className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            Đỉnh giải ngân / Quý (tỷ)
                          </th>
                          <th className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            Số quý thực hiện
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groupScenarios.map((sc) => {
                          const isCurrent = sc.id === activeScenario.id;
                          const peakQ = sc.quarters.reduce(
                            (max, q) => (q.total > max.total ? q : max),
                            sc.quarters[0]
                          );
                          return (
                            <tr
                              key={sc.id}
                              onClick={() =>
                                handleSelectScenario(sc.groupId, sc.id)
                              }
                              className={`cursor-pointer transition-colors ${
                                isCurrent
                                  ? 'bg-[#FAF1E0]/70 font-semibold'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2.5 px-3.5 text-[#9A1B0E] whitespace-nowrap">
                                {sc.title}
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-700 whitespace-nowrap">
                                {sc.timeRange}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono-num font-bold text-[#1E3A8A] whitespace-nowrap">
                                {formatBillion(sc.totalValue)}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono-num text-slate-700 whitespace-nowrap">
                                {formatBillion(peakQ?.total)} ({peakQ?.quarter}/{peakQ?.year})
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono-num text-slate-600 whitespace-nowrap">
                                {sc.quarters.length} quý
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )
        )}
      </main>

      {/* Lightbox for Site Plan Zoom */}
      <MapLightboxModal
        isOpen={Boolean(lightboxData)}
        title={lightboxData?.title ?? ''}
        imageSrc={lightboxData?.imageSrc ?? ''}
        caption={lightboxData?.caption ?? ''}
        onClose={() => setLightboxData(null)}
      />
    </div>
  );
}
