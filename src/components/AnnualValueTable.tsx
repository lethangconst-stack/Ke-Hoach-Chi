import React from 'react';
import { AnnualRow } from '../types/report';
import { formatBillion } from '../utils/reportUtils';

interface AnnualValueTableProps {
  years: number[];
  rows: AnnualRow[];
  totals: Record<number, number>;
  grandTotal: number;
  headerRightAction?: React.ReactNode;
}

export const AnnualValueTable: React.FC<AnnualValueTableProps> = ({
  years,
  rows,
  totals,
  grandTotal,
  headerRightAction,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <h3 className="text-[11px] font-bold tracking-wide text-[#8C621F] uppercase">
          GIÁ TRỊ THEO NĂM
        </h3>
        <div className="flex items-center gap-3">
          {headerRightAction}
          <span className="text-[11px] italic text-slate-500">ĐVT: tỷ đồng</span>
        </div>
      </div>

      <div className="border border-[#D7C39B] rounded-md overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#A47128] text-white text-[11px] font-semibold">
                <th className="py-1.5 px-2.5 whitespace-nowrap">Hạng mục</th>
                {years.map((y) => (
                  <th
                    key={y}
                    className="py-1.5 px-2 text-right font-mono-num whitespace-nowrap"
                  >
                    {y}
                  </th>
                ))}
                <th className="py-1.5 px-2.5 text-right font-mono-num whitespace-nowrap">
                  Tổng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 text-[11.5px]">
              {rows.map((row, idx) => {
                const isSub = Boolean(row.isSubRow);
                return (
                  <tr
                    key={`${row.label}-${idx}`}
                    className={
                      isSub
                        ? 'bg-slate-50/50 text-slate-600'
                        : 'bg-white text-slate-900 font-medium'
                    }
                  >
                    <td
                      className={`py-1.5 px-2.5 whitespace-nowrap ${
                        isSub ? 'pl-6 italic text-[11px]' : ''
                      }`}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {row.swatchColor && (
                          <span
                            className={`w-2.5 h-2.5 rounded-[2px] inline-block shrink-0 ${
                              row.swatchBorder ? 'border border-slate-500' : ''
                            }`}
                            style={{ backgroundColor: row.swatchColor }}
                          />
                        )}
                        <span>{row.label}</span>
                      </div>
                    </td>
                    {years.map((y) => (
                      <td
                        key={y}
                        className="py-1.5 px-2 text-right font-mono-num whitespace-nowrap"
                      >
                        {formatBillion(row.values[y])}
                      </td>
                    ))}
                    <td
                      className={`py-1.5 px-2.5 text-right font-mono-num whitespace-nowrap ${
                        isSub ? 'font-normal text-slate-700' : 'font-bold text-slate-900'
                      }`}
                    >
                      {formatBillion(row.total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#F7EFE1] border-t border-[#D7C39B] text-[12px] font-bold text-slate-900">
                <td className="py-1.5 px-2.5 whitespace-nowrap">Tổng cộng</td>
                {years.map((y) => (
                  <td
                    key={y}
                    className="py-1.5 px-2 text-right font-mono-num whitespace-nowrap"
                  >
                    {formatBillion(totals[y])}
                  </td>
                ))}
                <td className="py-1.5 px-2.5 text-right font-mono-num text-[#1E3A8A] whitespace-nowrap">
                  {formatBillion(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
