import React, { useState, useMemo } from 'react';
import { Scenario } from '../types';
import { runTransportSensitivity, runMonteCarloSimulation } from '../calculations/sensitivity';
import { calculatePathwayBreakEven } from '../calculations/costs';
import { 
  SlidersHorizontal, 
  ArrowLeft, 
  TrendingUp, 
  Info, 
  Dices, 
  Activity, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface SensitivityViewProps {
  scenario: Scenario;
  onBackToComparison: () => void;
}

export const SensitivityView: React.FC<SensitivityViewProps> = ({
  scenario,
  onBackToComparison,
}) => {
  const [activeTab, setActiveTab] = useState<'distance' | 'breakeven' | 'monte_carlo'>('distance');
  const [minDist, setMinDist] = useState<number>(20);
  const [maxDist, setMaxDist] = useState<number>(800);
  const [metricToDisplay, setMetricToDisplay] = useState<'netCost' | 'netEmissions'>('netCost');
  const [showTeacherScript, setShowTeacherScript] = useState<boolean>(false);

  // Monte Carlo parameters
  const [mcIterations, setMcIterations] = useState<number>(500);
  const [mcSeed, setMcSeed] = useState<number>(42);
  const [mcRunning, setMcRunning] = useState<boolean>(false);

  const sensitivityResult = useMemo(() => {
    return runTransportSensitivity(scenario, minDist, maxDist, 8);
  }, [scenario, minDist, maxDist]);

  const monteCarloResult = useMemo(() => {
    return runMonteCarloSimulation(scenario, mcIterations, mcSeed);
  }, [scenario, mcIterations, mcSeed]);

  // Pairwise Break-Even Calculations
  const breakEvenResults = useMemo(() => {
    const pairs: any[] = [];
    const pathways = scenario.pathways.filter(p => p.enabled);

    for (let i = 0; i < pathways.length; i++) {
      for (let j = i + 1; j < pathways.length; j++) {
        const p1 = {
          ...pathways[i],
          transportCostPerTonneKm: scenario.transportCostPerTonneKm ?? 0.12,
          transportDistanceKm: scenario.transportDistanceKm,
        };
        const p2 = {
          ...pathways[j],
          transportCostPerTonneKm: scenario.transportCostPerTonneKm ?? 0.12,
          transportDistanceKm: scenario.transportDistanceKm,
        };
        pairs.push(calculatePathwayBreakEven(p1, p2, scenario.inputMassKg / 1000));
      }
    }
    return pairs;
  }, [scenario]);

  const pathwayIds = Object.keys(sensitivityResult.points[0]?.results || {});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#DCE5DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#176B5B]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
              Sensitivity & Uncertainty Analysis
            </h1>
          </div>
          <p className="text-xs text-[#64716C] mt-1">
            Evaluate how logistics distance, market prices, and process yield variations affect pathway economics, break-even thresholds, and ranking stability.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowTeacherScript(!showTeacherScript)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 shadow-2xs ${
              showTeacherScript
                ? 'bg-[#123B32] text-white border-[#123B32]'
                : 'bg-[#EAF5EF] hover:bg-[#d8ede1] text-[#123B32] border-[#53A878]/50'
            }`}
          >
            <span>🎓</span>
            <span>{showTeacherScript ? 'Hide Script' : 'What to Say to Teacher'}</span>
          </button>
          <button
            onClick={onBackToComparison}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </button>
        </div>
      </div>

      {/* Expandable Teacher Demo Script Card */}
      {showTeacherScript && (
        <div className="p-4 rounded-xl border border-[#53A878]/40 bg-[#EAF5EF]/80 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🎓</span>
              <span className="font-bold text-xs uppercase tracking-wider text-[#123B32]">
                Presentation Cue: Explaining Logistics Sensitivity & Break-Even
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#176B5B] font-semibold">
              40-Second Script
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] text-xs space-y-2">
            <p className="font-semibold text-[#176B5B]">🗣️ Say this word-for-word to your teacher:</p>
            <p className="italic text-[#182522] leading-relaxed">
              "Professor, wind farms are often located in remote coastal or mountainous areas. A recycling technology may look cheap in the laboratory, but road haulage for oversized composite blades can reach hundreds of kilometers. In this module, we conduct a parametric distance sweep from 20 km to 800 km and compute pairwise break-even tipping points. This proves to waste management planners that if a specialized pyrolysis facility is located more than 350 km away, local cement kiln co-processing is more economical and emits less net carbon due to diesel transport avoidance."
            </p>
            <div className="pt-2 border-t border-[#DCE5DF] flex flex-wrap items-center gap-4 text-[11px] text-[#64716C]">
              <span>👉 <strong>Demo Action:</strong> Click the 'Break-Even Tipping Points' tab or toggle between 'Net Cost' and 'Net GHG Emissions'!</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytical Mode Selector */}
      <div className="flex rounded-xl border border-[#DCE5DF] p-1 bg-white shadow-xs text-xs font-semibold max-w-md">
        <button
          onClick={() => setActiveTab('distance')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'distance' ? 'bg-[#123B32] text-white shadow-xs' : 'text-[#64716C] hover:text-[#182522]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Distance Sweep</span>
        </button>
        <button
          onClick={() => setActiveTab('breakeven')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'breakeven' ? 'bg-[#123B32] text-white shadow-xs' : 'text-[#64716C] hover:text-[#182522]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Break-Even Solver</span>
        </button>
        <button
          onClick={() => setActiveTab('monte_carlo')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'monte_carlo' ? 'bg-[#123B32] text-white shadow-xs' : 'text-[#64716C] hover:text-[#182522]'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>Monte Carlo (500)</span>
        </button>
      </div>

      {/* TAB 1: DISTANCE SWEEP */}
      {activeTab === 'distance' && (
        <div className="space-y-6">
          {/* Controls Bar */}
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

          {/* Sweep Table */}
          <div className="bg-white rounded-xl border border-[#DCE5DF] overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#182522]">
                Distance Parameter Sweep ({sensitivityResult.parameterUnit})
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
        </div>
      )}

      {/* TAB 2: ANALYTICAL BREAK-EVEN SOLVER */}
      {activeTab === 'breakeven' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#182522]">
                Pairwise Economic Break-Even & Crossover Points
              </h3>
              <p className="text-xs text-[#64716C] mt-1">
                Solves the analytical condition <span className="font-mono text-[#182522]">C_net,1(d₁) = C_net,2(d₂)</span> to determine exact logistics and secondary market price parity thresholds.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {breakEvenResults.map((be, idx) => (
                <div key={idx} className="border border-[#DCE5DF] rounded-xl p-5 bg-[#F7F9F6]/40 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCE5DF] gap-2">
                    <div className="font-bold text-sm text-[#182522]">
                      {be.pathwayNames[0]} <span className="text-[#64716C] font-normal">vs.</span> {be.pathwayNames[1]}
                    </div>
                    <div className="font-mono">
                      {be.hasCrossover && be.isDistancePhysicallyFeasible ? (
                        <span className="text-[#176B5B] bg-[#EAF5EF] px-2.5 py-1 rounded-md font-bold">
                          Break-Even Distance: {be.breakEvenDistanceKm} km
                        </span>
                      ) : (
                        <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          No Crossover in Modelled Range
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[#182522] leading-relaxed">
                    {be.explanation}
                  </p>

                  <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] font-mono text-[11px] text-[#123B32] space-y-1">
                    <div><strong>Mathematical Solution:</strong> {be.mathematicalDerivation}</div>
                    {be.breakEvenSecondaryPricePerTonne !== null && (
                      <div>
                        <strong>Secondary Market Parity:</strong> {be.pathwayNames[0]} would need a secondary material price of <strong>{be.breakEvenSecondaryPricePerTonne} {scenario.currency}/tonne</strong> to achieve net cost parity at baseline distances.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONTE CARLO UNCERTAINTY SIMULATION */}
      {activeTab === 'monte_carlo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DCE5DF] gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Dices className="w-5 h-5 text-[#176B5B]" />
                  <h3 className="text-base font-bold text-[#182522]">
                    Monte Carlo Uncertainty Simulation ({monteCarloResult.numIterations} Stochastic Runs)
                  </h3>
                </div>
                <p className="text-xs text-[#64716C] mt-1">
                  Samples literature-documented triangular probability distributions for process yields, freight rates, and secondary prices.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#64716C]">PRNG Seed:</span>
                <input
                  type="number"
                  value={mcSeed}
                  onChange={(e) => setMcSeed(parseInt(e.target.value) || 42)}
                  className="w-16 bg-[#F7F9F6] border border-[#DCE5DF] rounded p-1 text-center font-bold"
                />
              </div>
            </div>

            {/* Stochastic Output Percentile Distribution Table */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-[#182522]">
                Simulated Net Cost Percentiles ({scenario.currency} / tonne input)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F9F6] text-[#64716C] border-b border-[#DCE5DF]">
                      <th className="p-2.5 font-semibold">Pathway</th>
                      <th className="p-2.5 text-right font-semibold">P10 (Optimistic)</th>
                      <th className="p-2.5 text-right font-semibold">P50 (Median)</th>
                      <th className="p-2.5 text-right font-semibold">P90 (Conservative)</th>
                      <th className="p-2.5 text-right font-semibold">% Times Ranked #1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE5DF] font-mono">
                    {Object.entries(monteCarloResult.pathwayPercentiles).map(([id, stats]) => {
                      const inputTonnes = scenario.inputMassKg / 1000;
                      const pName = scenario.pathways.find(p => p.id === id)?.name.split(' (')[0] || id;

                      return (
                        <tr key={id} className="hover:bg-[#F7F9F6]/60">
                          <td className="p-2.5 font-sans font-semibold text-[#182522]">{pName}</td>
                          <td className="p-2.5 text-right text-[#176B5B] font-semibold">
                            {(stats.netCost.p10 / inputTonnes).toFixed(1)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-[#182522]">
                            {(stats.netCost.p50 / inputTonnes).toFixed(1)}
                          </td>
                          <td className="p-2.5 text-right text-amber-800">
                            {(stats.netCost.p90 / inputTonnes).toFixed(1)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-[#176B5B]">
                            {stats.rankProbabilities.rank1Pct.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parameter Distributions Sampled */}
            <div className="bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF] space-y-2 text-xs">
              <span className="font-semibold text-[#182522] block">Sampled Input Distributions (Literature Grounded):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#64716C]">
                {monteCarloResult.parameterDistributions.map((d, i) => (
                  <div key={i} className="bg-white p-2 rounded border border-[#DCE5DF]/60">
                    <span className="font-sans font-medium text-[#182522] block">{d.parameterName}:</span>
                    <span>Triangular(Min: {d.min}, Mode: {d.mode}, Max: {d.max}) {d.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulation Findings */}
            <div className="space-y-1 text-xs text-[#182522]">
              <span className="font-semibold block">Simulation Insights:</span>
              <ul className="list-disc list-inside space-y-1 text-[#64716C]">
                {monteCarloResult.insights.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
