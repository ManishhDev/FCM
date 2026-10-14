import React, { useState } from 'react';
import { Scenario } from '../types';
import { runTransportSensitivity } from '../calculations/sensitivity';
import { SlidersHorizontal, ArrowLeft, TrendingUp, Info } from 'lucide-react';

interface SensitivityViewProps {
  scenario: Scenario;
  onBackToComparison: () => void;
}

export const SensitivityView: React.FC<SensitivityViewProps> = ({
  scenario,
  onBackToComparison,
}) => {
  const [minDist, setMinDist] = useState<number>(20);
  const [maxDist, setMaxDist] = useState<number>(800);
  const [metricToDisplay, setMetricToDisplay] = useState<'netCost' | 'netEmissions'>('netCost');

  const sensitivityResult = runTransportSensitivity(scenario, minDist, maxDist, 8);

  // Pathways present in results
  const pathwayIds = Object.keys(sensitivityResult.points[0]?.results || {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#DCE5DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#176B5B]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
              Logistics Distance Sensitivity Analysis
            </h1>
          </div>
          <p className="text-xs text-[#64716C] mt-1">
            Analyze how fluctuating road haulage distances (from near onshore farms to remote installations) alter net economics and emissions.
          </p>
        </div>

        <button
          onClick={onBackToComparison}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Comparison</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#182522]">Metric View:</span>
          <div className="flex rounded-lg border border-[#DCE5DF] p-0.5 bg-[#F7F9F6]">
            <button
              onClick={() => setMetricToDisplay('netCost')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                metricToDisplay === 'netCost' ? 'bg-white text-[#123B32] shadow-xs font-semibold' : 'text-[#64716C]'
              }`}
            >
              Net Cost ({scenario.currency})
            </button>
            <button
              onClick={() => setMetricToDisplay('netEmissions')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                metricToDisplay === 'netEmissions' ? 'bg-white text-[#123B32] shadow-xs font-semibold' : 'text-[#64716C]'
              }`}
            >
              Net Carbon Footprint (kg CO₂e)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[#64716C]">Distance Range:</span>
          <div className="flex items-center gap-2 font-mono">
            <input
              type="number"
              value={minDist}
              onChange={(e) => setMinDist(Math.max(10, parseInt(e.target.value) || 10))}
              className="w-20 bg-[#F7F9F6] border border-[#DCE5DF] rounded-md p-1.5 text-xs text-[#182522]"
            />
            <span>to</span>
            <input
              type="number"
              value={maxDist}
              onChange={(e) => setMaxDist(Math.max(minDist + 50, parseInt(e.target.value) || 500))}
              className="w-20 bg-[#F7F9F6] border border-[#DCE5DF] rounded-md p-1.5 text-xs text-[#182522]"
            />
            <span>km</span>
          </div>
        </div>
      </div>

      {/* Data Table of Sweep */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#182522]">
            Parameter Sweep: {sensitivityResult.parameterName} ({sensitivityResult.parameterUnit})
          </h3>
          <span className="text-xs text-[#64716C] font-mono">
            Freight rate: {scenario.transportCostPerTonneKm ?? 0.12} {scenario.currency}/t-km
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#DCE5DF] text-[#64716C] bg-[#F7F9F6]">
                <th className="py-3 px-4 font-semibold">Distance</th>
                {pathwayIds.map(id => {
                  const pName = scenario.pathways.find(p => p.id === id)?.name.split(' (')[0] || id;
                  return (
                    <th key={id} className="py-3 px-4 font-semibold text-right">
                      {pName}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DF] font-mono">
              {sensitivityResult.points.map((pt, idx) => (
                <tr key={idx} className="hover:bg-[#F7F9F6]/60">
                  <td className="py-2.5 px-4 font-sans font-medium text-[#182522]">
                    {pt.parameterValue} km
                  </td>
                  {pathwayIds.map(id => {
                    const val = metricToDisplay === 'netCost'
                      ? pt.results[id]?.netCost
                      : pt.results[id]?.netEmissions;

                    return (
                      <td key={id} className="py-2.5 px-4 text-right text-[#182522]">
                        {val !== null && val !== undefined
                          ? `${val.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${metricToDisplay === 'netCost' ? scenario.currency : 'kg'}`
                          : 'Unavailable'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Insights Card */}
      <div className="bg-[#EAF5EF]/40 border border-[#DCE5DF] rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-[#176B5B] font-semibold text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>Sensitivity Findings & Tipping Point Observations</span>
        </div>
        <ul className="text-xs text-[#182522] space-y-1.5 list-disc list-inside">
          {sensitivityResult.findings.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
