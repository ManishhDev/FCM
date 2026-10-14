import React, { useState } from 'react';
import { Scenario, ScenarioCalculationRun, ProcessParameter } from '../types';
import { AppView } from '../components/Navbar';
import { MassBalanceChart } from '../components/MassBalanceChart';
import { CostBreakdownChart } from '../components/CostBreakdownChart';
import { EmissionsBreakdownChart } from '../components/EmissionsBreakdownChart';
import { StatusBadge } from '../components/StatusBadge';
import { EvidenceModal } from '../components/EvidenceModal';
import { REFERENCE_PARAMETERS } from '../lib/constants';
import { convertMassToKg, convertDistanceToKm } from '../calculations/composition';
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
  ExternalLink,
  Cpu,
  Flame,
  Factory,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ComparisonViewProps {
  scenario: Scenario;
  run: ScenarioCalculationRun;
  onEditScenario: () => void;
  onUpdateScenario?: (updated: Scenario) => void;
  onNavigate: (view: AppView) => void;
  onExportCSV: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  scenario,
  run,
  onEditScenario,
  onUpdateScenario,
  onNavigate,
  onExportCSV,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'mass_balance' | 'costs' | 'emissions' | 'evidence'>('cards');
  const [selectedParameter, setSelectedParameter] = useState<ProcessParameter | null>(null);
  const [focusPriority, setFocusPriority] = useState<'all' | 'cost' | 'recovery' | 'emissions'>('all');
  const [showTeacherScript, setShowTeacherScript] = useState<boolean>(false);

  const pathways = Object.values(run.pathwayResults);
  const inputTonnes = scenario.inputMassKg / 1000;

  // Best recovery pathway
  const maxRecoveryPathway = [...pathways].sort((a, b) => b.recoveredMassKg - a.recoveredMassKg)[0];

  // Lowest net cost pathway
  const lowestCostPathway = [...pathways]
    .filter(p => p.netCost !== null)
    .sort((a, b) => (a.netCost ?? 0) - (b.netCost ?? 0))[0];

  // Lowest carbon footprint pathway
  const lowestEmissionsPathway = [...pathways]
    .filter(p => p.netEmissionsKgCO2e !== null)
    .sort((a, b) => (a.netEmissionsKgCO2e ?? 0) - (b.netEmissionsKgCO2e ?? 0))[0];

  // Live quick adjustments
  const handleQuickMass = (mass: number) => {
    if (!onUpdateScenario) return;
    const kg = convertMassToKg(mass, scenario.inputMassUnit);
    onUpdateScenario({
      ...scenario,
      inputMass: mass,
      inputMassKg: kg,
    });
  };

  const handleQuickDistance = (dist: number) => {
    if (!onUpdateScenario) return;
    const km = convertDistanceToKm(dist, scenario.transportDistanceUnit);
    onUpdateScenario({
      ...scenario,
      transportDistance: dist,
      transportDistanceKm: km,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Parameter Evidence Modal */}
      <EvidenceModal
        parameter={selectedParameter}
        onClose={() => setSelectedParameter(null)}
      />

      {/* TOP LIVE QUICK-CONTROL BAR (EASY TO USE) */}
      <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#176B5B] uppercase tracking-wider bg-[#EAF5EF] px-2 py-0.5 rounded-sm">
                Interactive Workspace
              </span>
              <span className="text-xs text-[#64716C] font-mono">
                {scenario.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#123B32] mt-1">
              Compare End-of-Life Recycling Options
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTeacherScript(!showTeacherScript)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 shadow-2xs ${
                showTeacherScript
                  ? 'bg-[#123B32] text-white border-[#123B32]'
                  : 'bg-[#EAF5EF] hover:bg-[#d8ede1] text-[#123B32] border-[#53A878]/50'
              }`}
            >
              <span>🎓</span>
              <span>{showTeacherScript ? 'Hide Teacher Script' : 'What to Say to Teacher'}</span>
            </button>
            <button
              onClick={onEditScenario}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#DCE5DF] bg-[#F7F9F6] hover:bg-slate-100 text-[#182522] flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => onNavigate('recommendation')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#EAF5EF] hover:bg-[#d5ece0] text-[#123B32] flex items-center gap-1.5 transition-colors border border-[#176B5B]/30"
            >
              <Scale className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Decision Ranking</span>
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
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
                  Live Presentation Cue: What to Say on this Workspace Screen
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#176B5B] font-semibold">
                30-Second Script
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] text-xs space-y-2">
              <p className="font-semibold text-[#176B5B]">🗣️ Say this word-for-word to your teacher:</p>
              <p className="italic text-[#182522] leading-relaxed">
                "Professor, this is our main Comparison Workspace. Here we simulate decommissioning <strong>{inputTonnes} tonnes</strong> of glass-fiber blade scrap. The software evaluates the 3 primary pathways side-by-side: Mechanical Shredding, Pyrolysis, and Cement Kiln Co-processing. Notice how it instantly balances trade-offs: Cement Kiln is the most cost-effective option because the resin replaces fossil fuel in the kiln, whereas Mechanical Shredding preserves 72% of the physical material mass for downstream composite fillers."
              </p>
              <div className="pt-2 border-t border-[#DCE5DF] flex flex-wrap items-center gap-4 text-[11px] text-[#64716C]">
                <span>👉 <strong>Demo Action:</strong> Drag the 'Blade Scrap Mass' slider or click <strong>50t</strong> or <strong>350t</strong> to show real-time dynamic recalculations!</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Interactive Sliders & Presets */}
        <div className="pt-3 border-t border-[#DCE5DF] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Quick Mass Control */}
          <div className="bg-[#F7F9F6] p-3 rounded-xl border border-[#DCE5DF] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#182522]">1. Blade Scrap Mass:</span>
              <span className="font-mono font-bold text-sm text-[#176B5B]">
                {scenario.inputMass} {scenario.inputMassUnit} ({scenario.inputMassKg.toLocaleString()} kg)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={scenario.inputMass}
                onChange={(e) => handleQuickMass(parseFloat(e.target.value) || 10)}
                className="flex-1 accent-[#176B5B]"
              />
              <div className="flex gap-1 shrink-0">
                {[10, 50, 100, 350].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleQuickMass(m)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded-md border transition-colors ${
                      scenario.inputMass === m
                        ? 'bg-[#123B32] text-white border-[#123B32]'
                        : 'bg-white text-[#182522] border-[#DCE5DF] hover:bg-slate-100'
                    }`}
                  >
                    {m}t
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Distance Control */}
          <div className="bg-[#F7F9F6] p-3 rounded-xl border border-[#DCE5DF] space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[#182522]">2. Transport Distance:</span>
              <span className="font-mono font-bold text-sm text-[#245D8A]">
                {scenario.transportDistance} {scenario.transportDistanceUnit} ({scenario.transportDistanceKm.toFixed(0)} km)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="600"
                step="10"
                value={scenario.transportDistance}
                onChange={(e) => handleQuickDistance(parseFloat(e.target.value) || 10)}
                className="flex-1 accent-[#245D8A]"
              />
              <div className="flex gap-1 shrink-0">
                {[45, 100, 200, 400].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleQuickDistance(d)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded-md border transition-colors ${
                      scenario.transportDistance === d
                        ? 'bg-[#245D8A] text-white border-[#245D8A]'
                        : 'bg-white text-[#182522] border-[#DCE5DF] hover:bg-slate-100'
                    }`}
                  >
                    {d}km
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Priority Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-[#64716C]">Highlight Priority:</span>
          <button
            onClick={() => setFocusPriority('all')}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors ${
              focusPriority === 'all'
                ? 'bg-[#123B32] text-white border-[#123B32]'
                : 'bg-white text-[#182522] border-[#DCE5DF] hover:bg-slate-50'
            }`}
          >
            Show All Pathways
          </button>
          <button
            onClick={() => setFocusPriority('cost')}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              focusPriority === 'cost'
                ? 'bg-[#176B5B] text-white border-[#176B5B]'
                : 'bg-white text-[#182522] border-[#DCE5DF] hover:bg-slate-50'
            }`}
          >
            <span>💰 Lowest Net Cost</span>
            {lowestCostPathway && <span className="font-mono text-[10px] opacity-90">({lowestCostPathway.pathwayName.split(' (')[0]})</span>}
          </button>
          <button
            onClick={() => setFocusPriority('recovery')}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              focusPriority === 'recovery'
                ? 'bg-[#176B5B] text-white border-[#176B5B]'
                : 'bg-white text-[#182522] border-[#DCE5DF] hover:bg-slate-50'
            }`}
          >
            <span>♻️ Max Material Recovery</span>
            {maxRecoveryPathway && <span className="font-mono text-[10px] opacity-90">({maxRecoveryPathway.pathwayName.split(' (')[0]})</span>}
          </button>
          <button
            onClick={() => setFocusPriority('emissions')}
            className={`px-3 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              focusPriority === 'emissions'
                ? 'bg-[#176B5B] text-white border-[#176B5B]'
                : 'bg-white text-[#182522] border-[#DCE5DF] hover:bg-slate-50'
            }`}
          >
            <span>🌱 Lowest Carbon Footprint</span>
          </button>
        </div>
      </div>

      {/* PLAIN-ENGLISH EXECUTIVE SUMMARY (INSTANT ANSWER) */}
      <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A96512]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B32]">
            Executive Recommendation for this Scenario
          </h2>
        </div>
        <p className="text-sm text-[#182522] leading-relaxed">
          For <strong>{inputTonnes.toFixed(0)} tonnes</strong> of blade scrap hauled <strong>{scenario.transportDistanceKm} km</strong>:
          {lowestCostPathway?.pathwayId === 'mechanical' && (
            <span>
              {' '}<strong>Mechanical Recycling</strong> is the most cost-effective route at <strong>{(lowestCostPathway.netCost! / inputTonnes).toFixed(0)} {scenario.currency}/tonne</strong> with the highest mass recovery (<strong>{((maxRecoveryPathway.recoveredMassKg / scenario.inputMassKg) * 100).toFixed(0)}%</strong>), though the resulting milled composite is downcycled into BMC filler rather than structural fibers.
            </span>
          )}
          {' '}If you require <strong>clean structural glass fiber recovery</strong>, <strong>Thermal Pyrolysis</strong> yields <strong>{pathways.find(p => p.pathwayId === 'thermal')?.recoveredMassKg.toLocaleString()} kg</strong> of reusable discontinuous fibers, operating at ~<strong>{((pathways.find(p => p.pathwayId === 'thermal')?.netCost ?? 0) / inputTonnes).toFixed(0)} {scenario.currency}/t</strong>.
        </p>
      </div>

      {/* 3 BIG, CLEAR PATHWAY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {pathways.map((p) => {
          const netPerTonne = p.netCost !== null && inputTonnes > 0 ? p.netCost / inputTonnes : null;
          const netGHGPerTonne = p.netEmissionsKgCO2e !== null && inputTonnes > 0 ? p.netEmissionsKgCO2e / inputTonnes : null;
          const recPct = (p.recoveredMassKg / p.inputMassKg) * 100;

          const isHighlighted = 
            (focusPriority === 'cost' && p.pathwayId === lowestCostPathway?.pathwayId) ||
            (focusPriority === 'recovery' && p.pathwayId === maxRecoveryPathway?.pathwayId) ||
            (focusPriority === 'emissions' && p.pathwayId === lowestEmissionsPathway?.pathwayId);

          const isMech = p.pathwayId === 'mechanical';
          const isTherm = p.pathwayId === 'thermal';
          const Icon = isMech ? Cpu : isTherm ? Flame : Factory;

          return (
            <div
              key={p.pathwayId}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isHighlighted
                  ? 'border-[#176B5B] ring-2 ring-[#176B5B]/30 scale-[1.01]'
                  : 'border-[#DCE5DF]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#EAF5EF] text-[#176B5B] flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#182522]">{p.pathwayName.split(' (')[0]}</h3>
                      <span className="text-[11px] text-[#64716C] capitalize">{p.qualityTier} Quality</span>
                    </div>
                  </div>
                  {p.pathwayId === lowestCostPathway?.pathwayId && (
                    <span className="text-[10px] font-bold text-[#176B5B] bg-[#EAF5EF] px-2 py-0.5 rounded-full">
                      Cheapest
                    </span>
                  )}
                  {p.pathwayId === maxRecoveryPathway?.pathwayId && p.pathwayId !== lowestCostPathway?.pathwayId && (
                    <span className="text-[10px] font-bold text-[#245D8A] bg-[#EAF3FB] px-2 py-0.5 rounded-full">
                      Max Yield
                    </span>
                  )}
                </div>

                {/* Big Metric Tiles */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-[#F7F9F6] p-2.5 rounded-xl border border-[#DCE5DF]/60">
                    <span className="text-[10px] text-[#64716C] uppercase font-semibold block">Net Cost</span>
                    <span className="font-mono text-base font-bold text-[#182522]">
                      {netPerTonne !== null ? `${netPerTonne.toFixed(0)}` : 'N/A'}{' '}
                      <span className="text-[11px] font-normal text-[#64716C]">{scenario.currency}/t</span>
                    </span>
                  </div>

                  <div className="bg-[#F7F9F6] p-2.5 rounded-xl border border-[#DCE5DF]/60">
                    <span className="text-[10px] text-[#64716C] uppercase font-semibold block">Recovered</span>
                    <span className="font-mono text-base font-bold text-[#176B5B]">
                      {recPct.toFixed(0)}%{' '}
                      <span className="text-[11px] font-normal text-[#64716C]">({(p.recoveredMassKg / 1000).toFixed(0)}t)</span>
                    </span>
                  </div>
                </div>

                {/* Mass Yield Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-[#64716C]">
                    <span>Yield: {recPct.toFixed(0)}%</span>
                    <span>Residual: {((p.residualMassKg / p.inputMassKg) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ width: `${recPct}%` }} className="bg-[#176B5B]" />
                    <div style={{ width: `${(p.residualMassKg / p.inputMassKg) * 100}%` }} className="bg-[#A96512]" />
                    <div style={{ width: `${(p.lossMassKg / p.inputMassKg) * 100}%` }} className="bg-slate-300" />
                  </div>
                </div>

                {/* Output & Pros/Cons in Plain English */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="bg-[#EAF5EF]/40 p-2.5 rounded-lg border border-[#DCE5DF]/60">
                    <span className="text-[#64716C] text-[11px] block">Recovered Product:</span>
                    <span className="font-semibold text-[#182522]">{p.outputDescription}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-[#64716C]">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#53A878] shrink-0 mt-0.5" />
                      <span>
                        {isMech && 'Low energy shredding; highest total recovered mass.'}
                        {isTherm && 'Reclaims clean fibers for compounding; avoids virgin glass production.'}
                        {p.pathwayId === 'cement_kiln' && 'Zero landfill residues; substitutes coal and quarry limestone.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#A96512] shrink-0 mt-0.5" />
                      <span>
                        {isMech && 'Fiber length <1mm; cannot be used for structural parts.'}
                        {isTherm && 'High energy input; fiber tensile strength drops by ~50%.'}
                        {p.pathwayId === 'cement_kiln' && 'Completely destroys fiber morphology (no fiber reuse).'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carbon Footprint Tag */}
              <div className="mt-4 pt-3 border-t border-[#DCE5DF] flex items-center justify-between text-xs font-mono">
                <span className="text-[#64716C]">Carbon Balance:</span>
                <span className="font-semibold text-[#182522]">
                  {netGHGPerTonne !== null ? `${netGHGPerTonne.toFixed(0)} kg CO₂e/t` : 'Unavailable'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEEP DIVE ACCORDION / TABS (FOR ENGINEERING PROOFS) */}
      <div className="bg-white rounded-2xl border border-[#DCE5DF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#DCE5DF] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#182522]">Engineering Deep-Dive & Mathematical Proofs</h3>
            <p className="text-xs text-[#64716C]">Inspect mass conservation audits, cost line-items, and literature sources</p>
          </div>

          <div className="flex rounded-lg border border-[#DCE5DF] p-0.5 bg-[#F7F9F6] text-xs">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'cards' ? 'bg-white text-[#123B32] shadow-xs font-semibold' : 'text-[#64716C]'
              }`}
            >
              Summary Table
            </button>
            <button
              onClick={() => setActiveTab('mass_balance')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'mass_balance' ? 'bg-white text-[#123B32] shadow-xs font-semibold' : 'text-[#64716C]'
              }`}
            >
              Mass Balance
            </button>
            <button
              onClick={() => setActiveTab('costs')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'costs' ? 'bg-white text-[#123B32] shadow-xs font-semibold' : 'text-[#64716C]'
              }`}
            >
              Economics
            </button>
            <button
              onClick={() => setActiveTab('emissions')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'emissions' ? 'bg-white text-[#123B32] shadow-xs font-semibold' : 'text-[#64716C]'
              }`}
            >
              GHG Carbon
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'evidence' ? 'bg-white text-[#123B32] shadow-xs font-semibold' : 'text-[#64716C]'
              }`}
            >
              Evidence Citations
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'cards' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#DCE5DF] text-[#64716C] bg-[#F7F9F6]">
                    <th className="py-2.5 px-3 font-semibold">Pathway</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Recovered Mass</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Yield (%)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Net Cost / t</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Net GHG / t</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Mass Conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DF] font-mono">
                  {pathways.map((p) => (
                    <tr key={p.pathwayId} className="hover:bg-[#F7F9F6]/60">
                      <td className="py-3 px-3 font-sans font-semibold text-[#182522]">{p.pathwayName}</td>
                      <td className="py-3 px-3 text-right text-[#176B5B] font-bold">{p.recoveredMassKg.toLocaleString()} kg</td>
                      <td className="py-3 px-3 text-right text-[#176B5B] font-bold">{((p.recoveredMassKg / p.inputMassKg) * 100).toFixed(0)}%</td>
                      <td className="py-3 px-3 text-right font-medium text-[#182522]">
                        {p.netCost !== null && inputTonnes > 0 ? `${(p.netCost / inputTonnes).toFixed(0)} ${scenario.currency}` : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-[#182522]">
                        {p.netEmissionsKgCO2e !== null && inputTonnes > 0 ? `${(p.netEmissionsKgCO2e / inputTonnes).toFixed(0)} kg` : 'Unavailable'}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <StatusBadge type="validation" value={p.massBalanceStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'mass_balance' && <MassBalanceChart results={run.pathwayResults} />}
          {activeTab === 'costs' && <CostBreakdownChart results={run.pathwayResults} currency={scenario.currency} />}
          {activeTab === 'emissions' && <EmissionsBreakdownChart results={run.pathwayResults} />}

          {activeTab === 'evidence' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {REFERENCE_PARAMETERS.slice(0, 6).map((param) => (
                <div
                  key={param.id}
                  onClick={() => setSelectedParameter(param)}
                  className="p-3 rounded-xl border border-[#DCE5DF] hover:border-[#176B5B] hover:bg-[#F7F9F6] transition-all cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-[#182522] block">{param.name}</span>
                    <span className="font-mono text-[11px] text-[#64716C]">{param.symbol} · {param.studyConditions?.slice(0, 45)}...</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#182522]">{param.value} {param.unit}</span>
                    <span className="text-[10px] text-[#176B5B] block font-semibold hover:underline">View Source →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
