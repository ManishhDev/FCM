import React from 'react';
import { PathwayCalculationResult, CurrencyCode } from '../types';
import { DollarSign, HelpCircle, ArrowDownRight, TrendingUp } from 'lucide-react';

interface CostBreakdownChartProps {
  results: Record<string, PathwayCalculationResult>;
  currency: CurrencyCode;
}

export const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ results, currency }) => {
  const pathways = Object.values(results);
  if (pathways.length === 0) return null;

  // Find max gross cost for relative scaling
  const maxGross = Math.max(...pathways.map(p => p.grossCost ?? 0), 100);

  return (
    <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#DCE5DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#176B5B]" />
            <h3 className="text-base font-semibold text-[#182522]">Cost Breakdown & Net Economics</h3>
          </div>
          <p className="text-xs text-[#64716C] mt-1">
            Accounting model: <span className="font-mono text-[#182522]">C_net = (C_transport + C_processing) - V_recovered</span>
          </p>
        </div>
        <div className="text-xs text-[#64716C] font-mono">
          Currency: <span className="font-semibold text-[#182522]">{currency}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {pathways.map((p) => {
          const inputTonnes = p.inputMassKg / 1000;
          const gross = p.grossCost ?? 0;
          const revenue = p.recoveredValue ?? 0;
          const net = p.netCost;
          const netPerTonne = net !== null && inputTonnes > 0 ? net / inputTonnes : null;

          const transportShare = gross > 0 && p.transportCost !== null ? (p.transportCost / gross) * 100 : 0;
          const processingShare = gross > 0 && p.processingCost !== null ? (p.processingCost / gross) * 100 : 0;

          return (
            <div key={p.pathwayId} className="border border-[#DCE5DF] rounded-xl p-4 flex flex-col justify-between bg-[#F7F9F6]/40">
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm text-[#182522]">{p.pathwayName}</h4>
                  {p.costStatus === 'partial' && (
                    <span className="text-[11px] text-[#A96512] flex items-center gap-1 font-medium" title="Incomplete cost parameters">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Partial
                    </span>
                  )}
                </div>

                {/* Net cost highlight */}
                <div className="mt-4 pt-3 border-t border-[#DCE5DF]/60">
                  <div className="text-xs text-[#64716C]">Net Cost</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-mono text-[#182522]">
                      {net !== null ? `${net.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}` : 'Unavailable'}
                    </span>
                    {netPerTonne !== null && (
                      <span className="text-xs font-mono text-[#64716C]">
                        ({netPerTonne.toFixed(1)} {currency}/t)
                      </span>
                    )}
                  </div>
                </div>

                {/* Relative stacked bar representation */}
                <div className="mt-4 space-y-2">
                  <div className="text-[11px] text-[#64716C] flex justify-between font-mono">
                    <span>Gross OPEX: {gross.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}</span>
                    <span className="text-[#176B5B]">Offset: -{revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}</span>
                  </div>

                  <div className="h-4 w-full bg-slate-200 rounded-md overflow-hidden flex">
                    <div
                      style={{ width: `${transportShare}%` }}
                      className="bg-[#245D8A]"
                      title={`Transport: ${p.transportCost?.toLocaleString()} ${currency} (${transportShare.toFixed(0)}%)`}
                    />
                    <div
                      style={{ width: `${processingShare}%` }}
                      className="bg-slate-700"
                      title={`Processing OPEX: ${p.processingCost?.toLocaleString()} ${currency} (${processingShare.toFixed(0)}%)`}
                    />
                  </div>
                </div>

                {/* Line items */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DCE5DF]/40">
                    <span className="text-[#64716C]">Transport Logistics:</span>
                    <span className="font-mono text-[#182522]">
                      {p.transportCost !== null ? `${p.transportCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DCE5DF]/40">
                    <span className="text-[#64716C]">Processing Operations:</span>
                    <span className="font-mono text-[#182522]">
                      {p.processingCost !== null ? `${p.processingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-[#176B5B]">
                    <span className="flex items-center gap-1 font-medium">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Secondary Value Offset:
                    </span>
                    <span className="font-mono font-semibold">
                      {p.recoveredValue !== null ? `-${p.recoveredValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}` : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {p.costNotes.length > 0 && (
                <div className="mt-4 text-[11px] text-[#64716C] bg-white p-2 rounded-md border border-[#DCE5DF]">
                  {p.costNotes[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-[#DCE5DF] flex flex-wrap items-center gap-6 text-xs text-[#64716C]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#245D8A] inline-block" />
          <span>Road Freight Transport Logistics</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-slate-700 inline-block" />
          <span>Plant Gate Operating Expenditure (OPEX)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#176B5B] inline-block" />
          <span>Secondary Recycled Material Market Offsets</span>
        </div>
      </div>
    </div>
  );
};
