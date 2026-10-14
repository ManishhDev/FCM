import React, { useState } from 'react';
import { Scenario } from '../types';
import { calculateScenario } from '../calculations';
import { GitCompare, Layers, ArrowRight } from 'lucide-react';

interface ScenarioCompareViewProps {
  scenarios: Scenario[];
  onSelectScenario: (id: string) => void;
}

export const ScenarioCompareView: React.FC<ScenarioCompareViewProps> = ({
  scenarios,
  onSelectScenario,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return scenarios.slice(0, 2).map(s => s.id);
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(prev => prev.filter(x => x !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  const comparedScenarios = scenarios.filter(s => selectedIds.includes(s.id));
  const runs = comparedScenarios.map(s => ({
    scenario: s,
    run: calculateScenario(s),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pb-6 border-b border-[#DCE5DF]">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-[#176B5B]" />
          <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
            Multi-Scenario Batch Comparison
          </h1>
        </div>
        <p className="text-xs text-[#64716C] mt-1">
          Select up to 3 saved scenarios to compare how project scale, transport haulage, or composition shifts alter comparative performance.
        </p>
      </div>

      {/* Scenario Checkbox Selector */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] p-4 shadow-xs">
        <span className="text-xs font-semibold text-[#182522] block mb-2">Select Scenarios to Compare:</span>
        <div className="flex flex-wrap gap-3">
          {scenarios.map(s => {
            const isSelected = selectedIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSelect(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${
                  isSelected
                    ? 'border-[#176B5B] bg-[#EAF5EF] text-[#123B32] font-semibold'
                    : 'border-[#DCE5DF] bg-white text-[#64716C] hover:bg-[#F7F9F6]'
                }`}
              >
                <span>{s.name}</span>
                <span className="font-mono text-[11px] text-[#64716C]">({s.inputMass} {s.inputMassUnit})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {runs.map(({ scenario, run }) => {
          const inputTonnes = scenario.inputMassKg / 1000;
          return (
            <div key={scenario.id} className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#DCE5DF]">
                <h3 className="font-bold text-base text-[#182522] truncate" title={scenario.name}>
                  {scenario.name}
                </h3>
                <span className="text-xs text-[#64716C] font-mono">
                  {scenario.inputMassKg.toLocaleString()} kg · {scenario.transportDistanceKm} km
                </span>
              </div>

              {/* Composition breakdown */}
              <div className="text-xs space-y-1">
                <span className="text-[#64716C] block font-semibold">Composition:</span>
                <div className="font-mono text-[#182522] bg-[#F7F9F6] p-2 rounded border border-[#DCE5DF]/60">
                  GF: {(scenario.composition.glassFiberFraction * 100).toFixed(0)}% ({((scenario.composition.glassFiberFraction) * scenario.inputMassKg).toLocaleString()} kg) · Resin: {(scenario.composition.polymerResinFraction * 100).toFixed(0)}%
                </div>
              </div>

              {/* Pathway Results */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-[#182522] block">Pathways Summary:</span>
                {Object.values(run.pathwayResults).map(p => (
                  <div key={p.pathwayId} className="border border-[#DCE5DF] p-3 rounded-lg text-xs space-y-1 bg-[#F7F9F6]/40">
                    <div className="font-semibold text-[#182522] flex justify-between">
                      <span>{p.pathwayName.split(' (')[0]}</span>
                      <span className="font-mono text-[#176B5B]">{((p.recoveredMassKg / p.inputMassKg) * 100).toFixed(0)}% Rec</span>
                    </div>
                    <div className="flex justify-between text-[#64716C] font-mono text-[11px]">
                      <span>Net: {p.netCost !== null ? `${(p.netCost / inputTonnes).toFixed(0)} ${scenario.currency}/t` : 'N/A'}</span>
                      <span>GHG: {p.netEmissionsKgCO2e !== null ? `${(p.netEmissionsKgCO2e / inputTonnes).toFixed(0)} kg/t` : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#DCE5DF]">
                <button
                  onClick={() => onSelectScenario(scenario.id)}
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-[#123B32] text-white hover:bg-[#176B5B] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Select as Active Scenario</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
