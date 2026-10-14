import React from 'react';
import { PathwayCalculationResult } from '../types';
import { Leaf, Info, AlertCircle, ArrowDown } from 'lucide-react';

interface EmissionsBreakdownChartProps {
  results: Record<string, PathwayCalculationResult>;
}

export const EmissionsBreakdownChart: React.FC<EmissionsBreakdownChartProps> = ({ results }) => {
  const pathways = Object.values(results);
  if (pathways.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#DCE5DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#176B5B]" />
            <h3 className="text-base font-semibold text-[#182522]">Preliminary GHG Balance & Carbon Intensity</h3>
          </div>
          <p className="text-xs text-[#64716C] mt-1">
            Boundary: <span className="font-semibold text-[#182522]">Gate-to-gate + road transport</span>. Preliminary indicator only; not an ISO 14040/44 certified LCA.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {pathways.map((p) => {
          const inputTonnes = p.inputMassKg / 1000;
          const netGHG = p.netEmissionsKgCO2e;
          const netPerTonne = netGHG !== null && inputTonnes > 0 ? netGHG / inputTonnes : null;

          return (
            <div key={p.pathwayId} className="border border-[#DCE5DF] rounded-xl p-4 flex flex-col justify-between bg-[#F7F9F6]/40">
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-sm text-[#182522]">{p.pathwayName}</h4>
                  {p.emissionsStatus === 'unavailable' ? (
                    <span className="text-[11px] text-slate-500 italic">No Factors</span>
                  ) : p.emissionsStatus === 'partial' ? (
                    <span className="text-[11px] text-[#A96512] font-medium">Partial Inventory</span>
                  ) : (
                    <span className="text-[11px] text-[#176B5B] font-medium">Calculated</span>
                  )}
                </div>

                {/* Net Carbon Footprint Display */}
                <div className="mt-4 pt-3 border-t border-[#DCE5DF]/60">
                  <div className="text-xs text-[#64716C]">Net Greenhouse Gas Balance</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    {netGHG !== null ? (
                      <>
                        <span className={`text-2xl font-bold font-mono ${netGHG <= 0 ? 'text-[#176B5B]' : 'text-[#182522]'}`}>
                          {netGHG.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e
                        </span>
                        {netPerTonne !== null && (
                          <span className="text-xs font-mono text-[#64716C]">
                            ({netPerTonne.toFixed(1)} kg/t)
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 italic py-1">
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        <span>Data Unavailable (Factor Missing)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emission Breakdown Elements */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#DCE5DF]/40">
                    <span className="text-[#64716C]">Electricity / Grid Energy:</span>
                    <span className="font-mono text-[#182522]">
                      {p.energyEmissionsKgCO2e !== null ? `${p.energyEmissionsKgCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DCE5DF]/40">
                    <span className="text-[#64716C]">Freight Transport:</span>
                    <span className="font-mono text-[#182522]">
                      {p.transportEmissionsKgCO2e !== null ? `${p.transportEmissionsKgCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e` : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#DCE5DF]/40">
                    <span className="text-[#64716C]">Direct Process / Stack:</span>
                    <span className="font-mono text-[#182522]">
                      {p.directProcessEmissionsKgCO2e !== null ? `${p.directProcessEmissionsKgCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e` : 'None / Unaccounted'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-[#176B5B]">
                    <span className="flex items-center gap-1 font-medium">
                      <ArrowDown className="w-3.5 h-3.5" />
                      Avoided Virgin Production Credit:
                    </span>
                    <span className="font-mono font-semibold">
                      {p.avoidedEmissionsKgCO2e !== null ? `-${p.avoidedEmissionsKgCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO₂e` : '0 (No credit)'}
                    </span>
                  </div>
                </div>
              </div>

              {p.emissionsNotes.length > 0 && (
                <div className="mt-4 text-[11px] text-[#64716C] bg-white p-2 rounded-md border border-[#DCE5DF]">
                  {p.emissionsNotes[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-[#DCE5DF] bg-[#FFF4DE]/40 p-3 rounded-lg flex items-start gap-3">
        <Info className="w-4 h-4 text-[#A96512] shrink-0 mt-0.5" />
        <p className="text-xs text-[#182522] leading-relaxed">
          <strong className="font-semibold text-[#A96512]">Scientific Rigor Notice:</strong> Avoided emissions credits represent hypothetical displacements of virgin glass fiber roving or quarried cement meal. In real industrial systems, secondary fibers do not substitute virgin materials at a 1:1 functional equivalence due to fiber degradation. BladeCycle transparently displays credits without treating incomplete inventories as zero emissions.
        </p>
      </div>
    </div>
  );
};
