import React from 'react';
import {
  FOUNDATION_LEFT_ROWS,
  FOUNDATION_RIGHT_ROWS,
} from '../data/reportScenarios';
import { FoundationRow } from '../types/report';
import { formatDecimalBillion } from '../utils/reportUtils';

const FoundationTableCard: React.FC<{ rows: FoundationRow[] }> = ({ rows }) => (
  <div className="border border-[#D7C39B] rounded-lg overflow-hidden bg-white">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#A47128] text-white text-[11px] font-semibold">
            <th className="py-2 px-2.5 whitespace-nowrap">TT</th>
            <th className="py-2 px-2.5 min-w-[140px]">Nội dung</th>
            <th className="py-2 px-2.5 text-right whitespace-nowrap">Số lượng</th>
            <th className="py-2 px-2.5 text-right whitespace-nowrap">Số tháng</th>
            <th className="py-2 px-2.5 text-right whitespace-nowrap">
              Giá trị TB 1 CT
            </th>
            <th className="py-2 px-2.5 text-right whitespace-nowrap">Tổng giá trị</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/80 text-xs">
          {rows.map((row, idx) => {
            if (row.level === 'section') {
              return (
                <tr
                  key={`${row.tt}-${idx}`}
                  className="bg-[#F5EBD7] font-bold text-slate-900"
                >
                  <td className="py-2 px-2.5 font-mono-num whitespace-nowrap">
                    {row.tt}
                  </td>
                  <td colSpan={5} className="py-2 px-2.5">
                    {row.name}
                  </td>
                </tr>
              );
            }
            const isGroup = row.level === 'group';
            return (
              <tr
                key={`${row.tt}-${idx}`}
                className={
                  isGroup
                    ? 'bg-white font-semibold text-slate-900'
                    : 'bg-slate-50/50 italic text-slate-700'
                }
              >
                <td className="py-1.5 px-2.5 font-mono-num whitespace-nowrap">
                  {row.tt}
                </td>
                <td className="py-1.5 px-2.5 whitespace-nowrap">{row.name}</td>
                <td className="py-1.5 px-2.5 text-right font-mono-num whitespace-nowrap">
                  {row.quantity}
                </td>
                <td className="py-1.5 px-2.5 text-right font-mono-num whitespace-nowrap">
                  {row.months}
                </td>
                <td className="py-1.5 px-2.5 text-right font-mono-num whitespace-nowrap">
                  {row.avgPerUnit}
                </td>
                <td
                  className={`py-1.5 px-2.5 text-right font-mono-num whitespace-nowrap ${
                    isGroup ? 'font-bold text-[#1E3A8A]' : ''
                  }`}
                >
                  {formatDecimalBillion(row.totalValue)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export const FoundationView: React.FC = () => {
  // Quick executive totals (counting each project once: Thư Lâm + Đông Anh + Lĩnh Nam ĐMT + Lĩnh Nam ĐC)
  const thuLamTotal = 2579.04 + 1920.92;
  const dongAnhTotal = 827.61 + 1516.31;
  const linhNamDmtTotal = 8002.04;
  const linhNamDcTotal = 4907.18;
  const grandFoundation = thuLamTotal + dongAnhTotal + linhNamDmtTotal + linhNamDcTotal;

  return (
    <div className="space-y-5">
      {/* Executive Title */}
      <div className="border-b border-amber-500/40 pb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#9A1B0E] uppercase tracking-tight">
            THỜI GIAN THI CÔNG HOÀN THÀNH VÀ GIÁ TRỊ HẠNG MỤC KẾT CẤU MÓNG VÀ SÀN ĐÁY HẦM (NẾU CÓ)
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Tổng hợp chi phí phần ngầm (kết cấu móng & sàn đáy hầm) theo từng khu vực dự án
          </p>
        </div>
        <span className="text-xs italic text-slate-500">
          ĐVT: tỷ đồng (giá trị gồm VAT 10%)
        </span>
      </div>

      {/* 4-Column Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-[#D7C39B] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[#EADCC0]">
        <div className="p-4">
          <div className="text-xs text-slate-500 font-medium">Tổng giá trị 03 khu vực</div>
          <div className="text-xl font-bold text-[#1E3A8A] font-mono-num mt-1">
            {formatDecimalBillion(grandFoundation)} tỷ
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Gồm VAT 10%</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500 font-medium">I. Thư Lâm (9 CC · 4.962 LK)</div>
          <div className="text-xl font-bold text-slate-900 font-mono-num mt-1">
            {formatDecimalBillion(thuLamTotal)} tỷ
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">CC 6 tháng · LK 15 tháng</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500 font-medium">II. Đông Anh (4 CC · 3.273 LK)</div>
          <div className="text-xl font-bold text-slate-900 font-mono-num mt-1">
            {formatDecimalBillion(dongAnhTotal)} tỷ
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">CC 5 tháng · LK 3 tháng</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500 font-medium">III & IV. Lĩnh Nam (35 CC)</div>
          <div className="text-xl font-bold text-slate-900 font-mono-num mt-1">
            {formatDecimalBillion(linhNamDmtTotal + linhNamDcTotal)} tỷ
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Đa mục tiêu 8.002 · Định cư 4.907</div>
        </div>
      </div>

      {/* Exact 2-Column PDF Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        <FoundationTableCard rows={FOUNDATION_LEFT_ROWS} />
        <FoundationTableCard rows={FOUNDATION_RIGHT_ROWS} />
      </div>
    </div>
  );
};
