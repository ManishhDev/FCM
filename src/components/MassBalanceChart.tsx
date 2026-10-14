import React, { useState } from 'react';
import { PathwayCalculationResult } from '../types';
import { CheckCircle2, AlertTriangle, Layers, Table as TableIcon, BarChart2 } from 'lucide-react';

interface MassBalanceChartProps {
  results: Record<string, PathwayCalculationResult>;
}

export const MassBalanceChart: React.FC<MassBalanceChartProps> = ({ results }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');
  const pathways = Object.values(results);

  if (pathways.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#DCE5DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#176B5B]" />
            <h3 className="text-base font-semibold text-[#182522]">Mass Balance & Material Allocation</h3>
          </div>
          <p className="text-xs text-[#64716C] mt-1">
            Conservation check: <span className="font-mono text-[#182522]">M_input = M_recovered + M_residual + M_loss</span> within 0.1% tolerance
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#F7F9F6] p-1 rounded-lg border border-[#DCE5DF]">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'visual' ? 'bg-white text-[#123B32] shadow-xs' : 'text-[#64716C] hover:text-[#182522]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Allocation Bar</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'table' ? 'bg-white text-[#123B32] shadow-xs' : 'text-[#64716C] hover:text-[#182522]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Audit Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="mt-6 space-y-6">
          {pathways.map((p) => {
            const inputKg = p.inputMassKg;
            const recPct = inputKg > 0 ? (p.recoveredMassKg / inputKg) * 100 : 0;
            const resPct = inputKg > 0 ? (p.residualMassKg / inputKg) * 100 : 0;
            const lossPct = inputKg > 0 ? (p.lossMassKg / inputKg) * 100 : 0;

            return (
              <div key={p.pathwayId} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#182522]">{p.pathwayName}</span>
                    <span className="text-[#64716C]">·</span>
                    <span className="text-[#64716C] truncate max-w-xs">{p.outputDescription}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-[#176B5B] font-medium">Rec: {recPct.toFixed(1)}% ({p.recoveredMassKg.toLocaleString()} kg)</span>
                    <span className="text-amber-700">Res: {resPct.toFixed(1)}%</span>
                    <span className="text-slate-500">Loss: {lossPct.toFixed(1)}%</span>
                    {p.massBalanceStatus === 'pass' ? (
                      <span className="inline-flex items-center gap-1 text-[#176B5B] font-sans">
                        <CheckCircle2 className="w-3 h-3 text-[#53A878]" />
                        <span>Pass</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#A96512] font-sans">
                        <AlertTriangle className="w-3 h-3 text-[#A96512]" />
                        <span>{p.massBalanceDifferenceKg.toFixed(1)} kg diff</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Stacked bar chart */}
                <div className="h-8 w-full bg-[#EAF5EF]/40 rounded-lg overflow-hidden flex border border-[#DCE5DF]">
                  <div
                    style={{ width: `${recPct}%` }}
                    className="bg-[#176B5B] hover:bg-[#123B32] transition-colors relative group flex items-center justify-center text-white text-[11px] font-mono font-medium"
                    title={`Recovered Output: ${p.recoveredMassKg.toLocaleString()} kg (${recPct.toFixed(1)}%)`}
                  >
                    {recPct > 12 && <span>{recPct.toFixed(0)}%</span>}
                  </div>
                  <div
                    style={{ width: `${resPct}%` }}
                    className="bg-[#A96512] hover:bg-[#854d0c] transition-colors relative group flex items-center justify-center text-white text-[11px] font-mono font-medium"
                    title={`Residual Matrix / Dust: ${p.residualMassKg.toLocaleString()} kg (${resPct.toFixed(1)}%)`}
                  >
                    {resPct > 8 && <span>{resPct.toFixed(0)}%</span>}
                  </div>
                  <div
                    style={{ width: `${lossPct}%` }}
                    className="bg-slate-400 hover:bg-slate-500 transition-colors relative group flex items-center justify-center text-white text-[11px] font-mono font-medium"
                    title={`Process Losses / Offgas: ${p.lossMassKg.toLocaleString()} kg (${lossPct.toFixed(1)}%)`}
                  >
                    {lossPct > 8 && <span>{lossPct.toFixed(0)}%</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="pt-4 border-t border-[#DCE5DF] flex flex-wrap items-center gap-6 text-xs text-[#64716C]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-[#176B5B] inline-block" />
              <span>Recovered Secondary Material</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-[#A96512] inline-block" />
              <span>Solid Residual / Landfill Residue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-slate-400 inline-block" />
              <span>Process Losses / Flue Offgas</span>
            </div>
            <div className="ml-auto text-[11px] font-mono text-slate-500">
              Input functional unit: {pathways[0]?.inputMassKg.toLocaleString()} kg
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCE5DF] text-[#64716C] bg-[#F7F9F6]">
                <th className="py-2.5 px-3 font-semibold">Pathway</th>
                <th className="py-2.5 px-3 font-semibold text-right">Input Mass</th>
                <th className="py-2.5 px-3 font-semibold text-right">Recovered Mass</th>
                <th className="py-2.5 px-3 font-semibold text-right">Recovery Yield</th>
                <th className="py-2.5 px-3 font-semibold text-right">Residuals</th>
                <th className="py-2.5 px-3 font-semibold text-right">Losses</th>
                <th className="py-2.5 px-3 font-semibold text-right">Balance Error</th>
                <th className="py-2.5 px-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DF] font-mono">
              {pathways.map((p) => (
                <tr key={p.pathwayId} className="hover:bg-[#F7F9F6]/60">
                  <td className="py-2.5 px-3 font-sans font-medium text-[#182522]">{p.pathwayName}</td>
                  <td className="py-2.5 px-3 text-right">{p.inputMassKg.toLocaleString()} kg</td>
                  <td className="py-2.5 px-3 text-right text-[#176B5B] font-semibold">{p.recoveredMassKg.toLocaleString()} kg</td>
                  <td className="py-2.5 px-3 text-right text-[#176B5B] font-semibold">{((p.recoveredMassKg / p.inputMassKg) * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right text-amber-700">{p.residualMassKg.toLocaleString()} kg</td>
                  <td className="py-2.5 px-3 text-right text-slate-500">{p.lossMassKg.toLocaleString()} kg</td>
                  <td className="py-2.5 px-3 text-right">
                    {p.massBalanceDifferenceKg.toFixed(2)} kg ({p.massBalanceErrorPercent.toFixed(3)}%)
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    {p.massBalanceStatus === 'pass' ? (
                      <span className="text-[#176B5B] font-medium">Pass</span>
                    ) : (
                      <span className="text-[#A96512] font-medium">Review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
