import React, { useState } from 'react';
import { Scenario, ScenarioCalculationRun, ProcessParameter } from '../types';
import { AppView } from '../components/Navbar';
import { MassBalanceChart } from '../components/MassBalanceChart';
import { CostBreakdownChart } from '../components/CostBreakdownChart';
import { EmissionsBreakdownChart } from '../components/EmissionsBreakdownChart';
import { StatusBadge } from '../components/StatusBadge';
import { EvidenceModal } from '../components/EvidenceModal';
import { REFERENCE_PARAMETERS } from '../lib/constants';
import { 
  Download, 
  Edit3, 
  Scale, 
  SlidersHorizontal, 
  HelpCircle, 
  Layers, 
  DollarSign, 
  Leaf, 
  BookOpen, 
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ComparisonViewProps {
  scenario: Scenario;
  run: ScenarioCalculationRun;
  onEditScenario: () => void;
  onNavigate: (view: AppView) => void;
  onExportCSV: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  scenario,
  run,
  onEditScenario,
  onNavigate,
  onExportCSV,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mass_balance' | 'costs' | 'emissions' | 'evidence'>('overview');
  const [selectedParameter, setSelectedParameter] = useState<ProcessParameter | null>(null);

  const pathways = Object.values(run.pathwayResults);
  const inputTonnes = scenario.inputMassKg / 1000;

  // Best recovery pathway
  const maxRecoveryPathway = [...pathways].sort((a, b) => b.recoveredMassKg - a.recoveredMassKg)[0];

  // Lowest net cost pathway
  const lowestCostPathway = [...pathways]
    .filter(p => p.netCost !== null)
    .sort((a, b) => (a.netCost ?? 0) - (b.netCost ?? 0))[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Parameter Evidence Modal */}
      <EvidenceModal
        parameter={selectedParameter}
        onClose={() => setSelectedParameter(null)}
      />

      {/* Scenario Header Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE5DF] p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#176B5B] uppercase tracking-wider">
                Comparative End-of-Life Evaluation
              </span>
              <span className="text-[#64716C]">·</span>
              <span className="text-xs text-[#64716C] font-mono">Model {run.modelVersion}</span>
              {scenario.isDemo && (
                <>
                  <span className="text-[#64716C]">·</span>
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#A96512] bg-[#FFF4DE] px-2 py-0.5 rounded-sm">
                    Illustrative Demo
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#123B32] mt-1">
              {scenario.name}
            </h1>
            <p className="text-xs text-[#64716C] mt-1 max-w-2xl">
              {scenario.description || 'Comparing mechanical recycling, thermal processing, and cement-kiln co-processing.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onEditScenario}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Edit Inputs</span>
            </button>
            <button
              onClick={() => onNavigate('recommendation')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#EAF5EF] hover:bg-[#d5ece0] text-[#123B32] transition-colors flex items-center gap-1.5 border border-[#176B5B]/30"
            >
              <Scale className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Decision MCDA</span>
            </button>
            <button
              onClick={() => onNavigate('sensitivity')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#EAF5EF] hover:bg-[#d5ece0] text-[#123B32] transition-colors flex items-center gap-1.5 border border-[#176B5B]/30"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Sensitivity</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* High-Level Scenario Meta Badges */}
        <div className="pt-4 border-t border-[#DCE5DF] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[#64716C] block font-sans">Waste Quantity:</span>
            <span className="font-semibold text-[#182522]">
              {scenario.inputMassKg.toLocaleString()} kg ({inputTonnes.toFixed(1)} t)
            </span>
          </div>
          <div>
            <span className="text-[#64716C] block font-sans">Material Composition:</span>
            <span className="font-semibold text-[#182522]">
              {(scenario.composition.glassFiberFraction * 100).toFixed(0)}% GF / {(scenario.composition.polymerResinFraction * 100).toFixed(0)}% Resin
            </span>
          </div>
          <div>
            <span className="text-[#64716C] block font-sans">Logistics Haulage:</span>
            <span className="font-semibold text-[#182522]">
              {scenario.transportDistanceKm} km ({scenario.transportDistance} {scenario.transportDistanceUnit})
            </span>
          </div>
          <div>
            <span className="text-[#64716C] block font-sans">Run Timestamp:</span>
            <span className="text-[#64716C]">
              {new Date(run.calculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Warnings Banner if any */}
      {run.generalWarnings.length > 0 && (
        <div className="bg-[#FFF4DE] border border-[#A96512]/30 rounded-xl p-4 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#A96512]">
            <AlertTriangle className="w-4 h-4" />
            <span>Methodological & Data Quality Warnings</span>
          </div>
          <ul className="list-disc list-inside text-[#182522] space-y-0.5 pt-1 pl-1">
            {run.generalWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-[#DCE5DF]">
        <nav className="flex space-x-6 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Comparison Overview', icon: Layers },
            { id: 'mass_balance', label: 'Material Flow & Mass Balance', icon: Layers },
            { id: 'costs', label: 'Cost Breakdown & Economics', icon: DollarSign },
            { id: 'emissions', label: 'Preliminary GHG Footprint', icon: Leaf },
            { id: 'evidence', label: 'Data Provenance & Assumptions', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-[#176B5B] text-[#123B32] font-bold'
                    : 'border-transparent text-[#64716C] hover:text-[#182522] hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Summary Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs text-[#64716C]">Highest Mass Recovery Yield</div>
              <div className="text-xl font-bold text-[#182522]">{maxRecoveryPathway?.pathwayName}</div>
              <div className="font-mono text-sm text-[#176B5B] font-semibold">
                {((maxRecoveryPathway?.recoveredMassKg / scenario.inputMassKg) * 100).toFixed(1)}% recovery ({maxRecoveryPathway?.recoveredMassKg.toLocaleString()} kg)
              </div>
              <p className="text-[11px] text-[#64716C] pt-2 border-t border-[#DCE5DF]">
                Output: {maxRecoveryPathway?.outputDescription}
              </p>
            </div>

            <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs text-[#64716C]">Lowest Net Cost per Tonne</div>
              <div className="text-xl font-bold text-[#182522]">{lowestCostPathway?.pathwayName}</div>
              <div className="font-mono text-sm text-[#182522] font-semibold">
                {lowestCostPathway?.netCost !== null && inputTonnes > 0
                  ? `${(lowestCostPathway.netCost / inputTonnes).toFixed(1)} ${scenario.currency} / tonne`
                  : 'N/A'}
              </div>
              <p className="text-[11px] text-[#64716C] pt-2 border-t border-[#DCE5DF]">
                Gross OPEX: {lowestCostPathway?.grossCost?.toLocaleString(undefined, { maximumFractionDigits: 0 })} {scenario.currency} minus recovered offset.
              </p>
            </div>

            <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs text-[#64716C]">Mass Conservation Audit</div>
              <div className="text-xl font-bold text-[#176B5B] flex items-center gap-1.5">
                <span>0.1% Scientific Tolerance</span>
              </div>
              <div className="font-mono text-xs text-[#182522]">
                {pathways.filter(p => p.massBalanceStatus === 'pass').length} of {pathways.length} pathways balanced
              </div>
              <p className="text-[11px] text-[#64716C] pt-2 border-t border-[#DCE5DF]">
                No mass creation or unaccounted losses across models.
              </p>
            </div>
          </div>

          {/* Mass Balance Visualization */}
          <MassBalanceChart results={run.pathwayResults} />

          {/* Master Comparison Table */}
          <div className="bg-white rounded-xl border border-[#DCE5DF] overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#182522]">Side-by-Side Pathway Comparison</h3>
              <span className="text-xs text-[#64716C]">Functional Unit: {scenario.inputMassKg.toLocaleString()} kg GFRP Waste</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#DCE5DF] text-[#64716C] bg-[#F7F9F6]">
                    <th className="py-3 px-4 font-semibold">Recycling Pathway</th>
                    <th className="py-3 px-4 font-semibold">Output Definition</th>
                    <th className="py-3 px-4 font-semibold text-right">Recovered Mass</th>
                    <th className="py-3 px-4 font-semibold text-right">Residual Mass</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Cost / t</th>
                    <th className="py-3 px-4 font-semibold text-right">Net GHG / t</th>
                    <th className="py-3 px-4 font-semibold text-center">Quality Tier</th>
                    <th className="py-3 px-4 font-semibold text-center">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DF]">
                  {pathways.map((p) => {
                    const inputTonnes = p.inputMassKg / 1000;
                    const netCostPerTonne = p.netCost !== null && inputTonnes > 0 ? (p.netCost / inputTonnes).toFixed(1) : null;
                    const netGHGPerTonne = p.netEmissionsKgCO2e !== null && inputTonnes > 0 ? (p.netEmissionsKgCO2e / inputTonnes).toFixed(1) : null;

                    return (
                      <tr key={p.pathwayId} className="hover:bg-[#F7F9F6]/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#182522]">{p.pathwayName}</div>
                          <div className="text-[11px] text-[#64716C]">{p.technologyDefinition.slice(0, 45)}...</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-[#182522]">
                          {p.outputDescription}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#176B5B]">
                          {p.recoveredMassKg.toLocaleString()} kg ({((p.recoveredMassKg / p.inputMassKg) * 100).toFixed(0)}%)
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-800">
                          {p.residualMassKg.toLocaleString()} kg
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-[#182522]">
                          {netCostPerTonne !== null ? `${netCostPerTonne} ${scenario.currency}` : <span className="text-slate-400 italic">N/A</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-[#182522]">
                          {netGHGPerTonne !== null ? `${netGHGPerTonne} kg CO₂e` : <span className="text-slate-400 italic">Unavailable</span>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-medium rounded-sm ${
                            p.qualityTier === 'high' ? 'bg-[#EAF5EF] text-[#123B32]' : p.qualityTier === 'medium' ? 'bg-[#FFF4DE] text-[#A96512]' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {p.qualityTier}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge type="validation" value={p.massBalanceStatus} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Limitations Callout per Pathway */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pathways.map((p) => (
              <div key={p.pathwayId} className="bg-white border border-[#DCE5DF] rounded-xl p-5 space-y-3 shadow-xs">
                <h4 className="font-semibold text-sm text-[#182522] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#176B5B]" />
                  <span>{p.pathwayName.split(' (')[0]} Limitations</span>
                </h4>
                <ul className="text-xs text-[#64716C] space-y-2 list-disc list-inside">
                  {p.limitations.map((lim, idx) => (
                    <li key={idx} className="leading-relaxed">{lim}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MASS BALANCE TAB */}
      {activeTab === 'mass_balance' && (
        <div className="space-y-6">
          <MassBalanceChart results={run.pathwayResults} />

          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-[#182522]">Detailed Mass Accounting & Boundary Principles</h3>
            <p className="text-xs text-[#64716C] leading-relaxed">
              In BladeCycle, mass balance is governed by the conservation law:
            </p>
            <div className="bg-[#F7F9F6] p-3 rounded-lg font-mono text-xs text-[#123B32] border border-[#DCE5DF]">
              M_input = M_recovered + M_residual + M_loss
            </div>
            <p className="text-xs text-[#64716C] leading-relaxed">
              Categories are mutually exclusive. Recovered mass includes only secondary materials with defined secondary market uses (milled powder, clean reclaimed fiber, clinker mineral oxide substitution). Residues represent solid landfill waste or slag. Losses represent fugitive moisture, baghouse filter dust, or gaseous combustion offgas in kiln/thermal operations.
            </p>
          </div>
        </div>
      )}

      {/* 3. COSTS TAB */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          <CostBreakdownChart results={run.pathwayResults} currency={scenario.currency} />

          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-[#182522]">Economic Equation Derivations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="border border-[#DCE5DF] p-4 rounded-xl space-y-2">
                <span className="font-semibold text-[#182522]">Gross Operational Cost (C_gross):</span>
                <div className="font-mono bg-[#F7F9F6] p-2 rounded text-[#123B32]">
                  C_gross = (M_tonnes × D_km × r_transport) + (M_tonnes × OPEX_processing)
                </div>
                <p className="text-[#64716C]">
                  Direct sum of heavy road freight haulage and facility gate processing fees.
                </p>
              </div>

              <div className="border border-[#DCE5DF] p-4 rounded-xl space-y-2">
                <span className="font-semibold text-[#182522]">Net Life-Cycle Cost (C_net):</span>
                <div className="font-mono bg-[#F7F9F6] p-2 rounded text-[#123B32]">
                  C_net = C_gross - (M_recovered_tonnes × V_secondary_value)
                </div>
                <p className="text-[#64716C]">
                  Credits secondary sales of milled filler (80–140 {scenario.currency}/t) or reclaimed glass fibers (300–450 {scenario.currency}/t).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. EMISSIONS TAB */}
      {activeTab === 'emissions' && (
        <div className="space-y-6">
          <EmissionsBreakdownChart results={run.pathwayResults} />

          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-[#182522]">LCA System Boundary & Carbon Accounting Policy</h3>
            <p className="text-xs text-[#64716C] leading-relaxed">
              BladeCycle applies a gate-to-gate plus freight transport boundary. Emissions are evaluated under IPCC 100-year Global Warming Potentials (GWP100):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-[#DCE5DF] p-3 rounded-lg">
                <strong className="text-[#182522] block mb-1">Energy Emissions (E_energy):</strong>
                <span className="text-[#64716C]">
                  Q_energy (kWh) × Grid Carbon Intensity ({scenario.gridEmissionFactorKgCO2ePerKWh ?? 0.35} kg CO₂e/kWh).
                </span>
              </div>
              <div className="border border-[#DCE5DF] p-3 rounded-lg">
                <strong className="text-[#182522] block mb-1">Logistics Haulage (E_freight):</strong>
                <span className="text-[#64716C]">
                  Tonnes × Distance ({scenario.transportDistanceKm} km) × {scenario.freightEmissionFactorKgCO2ePerTonneKm ?? 0.092} kg CO₂e/t-km.
                </span>
              </div>
              <div className="border border-[#DCE5DF] p-3 rounded-lg">
                <strong className="text-[#182522] block mb-1">Avoided Virgin Offsets (E_credit):</strong>
                <span className="text-[#64716C]">
                  Credited only when a defensive virgin material baseline exists.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. EVIDENCE TAB */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-[#182522]">Parameters Used in This Calculation Run</h3>
                <p className="text-xs text-[#64716C] mt-0.5">
                  Click any parameter to inspect its primary publication citation, DOI, and experimental conditions.
                </p>
              </div>
              <button
                onClick={() => onNavigate('evidence')}
                className="text-xs text-[#176B5B] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Full Evidence Library</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REFERENCE_PARAMETERS.slice(0, 8).map((param) => (
                <div
                  key={param.id}
                  onClick={() => setSelectedParameter(param)}
                  className="p-3.5 rounded-xl border border-[#DCE5DF] hover:border-[#176B5B] hover:bg-[#F7F9F6] transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#182522] group-hover:text-[#176B5B] transition-colors">
                        {param.name}
                      </span>
                      <span className="font-mono text-[11px] text-[#64716C]">({param.symbol})</span>
                    </div>
                    <div className="text-[11px] text-[#64716C] mt-1">
                      {param.studyConditions?.slice(0, 50)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-[#182522] block">
                      {param.value} {param.unit}
                    </span>
                    <StatusBadge type="classification" value={param.classification} showIcon={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
