import React from 'react';
import { ArrowUpRight, Maximize2 } from 'lucide-react';
import { ProjectGroupId, ScenarioPlan } from '../types/report';
import { formatBillion } from '../utils/reportUtils';

interface ConsolidatedMapGridProps {
  componentScenarios: ScenarioPlan[];
  totalValue: number;
  onJumpToScenario: (groupId: ProjectGroupId, scenarioId: string) => void;
  onZoomMap: (scenario: ScenarioPlan) => void;
}

export const ConsolidatedMapGrid: React.FC<ConsolidatedMapGridProps> = ({
  componentScenarios,
  totalValue,
  onJumpToScenario,
  onZoomMap,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold tracking-wide text-[#8C621F] uppercase">
            MẶT BẰNG PHẠM VI & CƠ CẤU CÁC DỰ ÁN THÀNH PHẦN
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhấn vào từng dự án thành phần để chuyển thẳng đến chi tiết phương án
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500 tabular-nums">
          {componentScenarios.length} khu vực
        </span>
      </div>

      {/* Grid of Component Site Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {componentScenarios.map((sc) => {
          const sharePct = totalValue > 0 ? (sc.totalValue / totalValue) * 100 : 0;
          return (
            <div
              key={sc.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col group hover:border-[#A47128] transition-colors"
            >
              <div className="relative bg-slate-100 aspect-[1158/855] overflow-hidden border-b border-slate-200">
                <img
                  src={sc.mapImage}
                  alt={`Mặt bằng ${sc.title}`}
                  className="w-full h-full object-contain bg-white"
                />
                <button
                  type="button"
                  onClick={() => onZoomMap(sc)}
                  title="Phóng to mặt bằng"
                  aria-label={`Phóng to mặt bằng ${sc.title}`}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-slate-700 border border-slate-200 rounded-md shadow-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onJumpToScenario(sc.groupId, sc.id)}
                className="p-3 text-left flex-1 flex flex-col justify-between gap-2 hover:bg-[#FAF6EE]/60 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-[#9A1B0E] leading-snug group-hover:underline">
                    {sc.title}
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#9A1B0E] shrink-0 mt-0.5" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs tabular-nums">
                    <span className="font-bold text-[#1E3A8A] font-mono-num">
                      {formatBillion(sc.totalValue)} tỷ đồng
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 font-mono-num">
                      {sharePct.toFixed(1).replace('.', ',')}% tổng hợp
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#A47128] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, sharePct)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500">{sc.timeRange}</div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
