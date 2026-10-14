import React from 'react';
import { Scenario } from '../types';
import { AppView } from '../components/Navbar';
import { getExportedReportsCount } from '../lib/scenarioStorage';
import { 
  PlusCircle, 
  Sparkles, 
  Layers, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Scale, 
  SlidersHorizontal,
  Clock,
  ArrowRight,
  Database,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onSelectScenario: (id: string) => void;
  onNewAnalysis: () => void;
  onLoadDemo: () => void;
  onDuplicateScenario: (id: string) => void;
  onDeleteScenario: (id: string) => void;
  onNavigate: (view: AppView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onNewAnalysis,
  onLoadDemo,
  onDuplicateScenario,
  onDeleteScenario,
  onNavigate,
}) => {
  const exportedReports = getExportedReportsCount();
  const totalMassTonnes = scenarios.reduce((acc, s) => acc + (s.inputMassKg / 1000), 0);
  const mostRecent = scenarios[0];

  const handleOpenScenario = (id: string) => {
    onSelectScenario(id);
    onNavigate('compare');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE5DF]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">Scenario Dashboard</h1>
          <p className="text-xs text-[#64716C] mt-1">
            Manage your GFRP wind blade waste analysis projects, review mass balances, and run multi-criteria evaluations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLoadDemo}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A96512]" />
            <span>Load Demo (100 t)</span>
          </button>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Real Realized Metric Cards (Never fabricated zeros or generic AI stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64716C]">
            <span>Saved Scenarios</span>
            <Layers className="w-4 h-4 text-[#176B5B]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#182522] tabular-nums">
            {scenarios.length}
          </div>
          <div className="mt-1 text-[11px] text-[#64716C]">
            {scenarios.filter(s => s.isDemo).length} demo · {scenarios.filter(s => !s.isDemo).length} custom
          </div>
        </div>

        <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64716C]">
            <span>Total Blade Mass</span>
            <BarChart3 className="w-4 h-4 text-[#176B5B]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#182522] tabular-nums">
            {totalMassTonnes.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-sans font-normal text-[#64716C]">t</span>
          </div>
          <div className="mt-1 text-[11px] text-[#64716C] font-mono">
            {(totalMassTonnes * 1000).toLocaleString()} kg modelled
          </div>
        </div>

        <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64716C]">
            <span>Latest Calculation</span>
            <Clock className="w-4 h-4 text-[#176B5B]" />
          </div>
          <div className="mt-2 text-sm font-semibold text-[#182522] truncate" title={mostRecent?.name}>
            {mostRecent ? mostRecent.name : 'None'}
          </div>
          <div className="mt-1 text-[11px] text-[#64716C] truncate">
            {mostRecent ? new Date(mostRecent.updatedAt).toLocaleDateString() : '—'}
          </div>
        </div>

        <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64716C]">
            <span>Reports Exported</span>
            <Database className="w-4 h-4 text-[#176B5B]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#182522] tabular-nums">
            {exportedReports}
          </div>
          <div className="mt-1 text-[11px] text-[#64716C]">
            CSV & Printable HTML runs
          </div>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#182522]">Your Scenarios</h3>
          <span className="text-xs text-[#64716C]">Click any row to open full comparison</span>
        </div>

        {scenarios.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-sm text-[#182522]">No Scenarios Saved Yet</h4>
            <p className="text-xs text-[#64716C] max-w-sm mx-auto">
              Create your first end-of-life wind blade scenario to analyze mass balance, logistics costs, and recycling routes.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onLoadDemo}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] text-[#182522] hover:bg-slate-50"
              >
                Load Demo Scenario
              </button>
              <button
                onClick={onNewAnalysis}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] text-white hover:bg-[#176B5B]"
              >
                Create New Scenario
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DCE5DF] text-[#64716C] bg-[#F7F9F6]">
                  <th className="py-3 px-4 font-semibold">Scenario Name</th>
                  <th className="py-3 px-4 font-semibold text-right">Input Mass</th>
                  <th className="py-3 px-4 font-semibold">Composition</th>
                  <th className="py-3 px-4 font-semibold text-right">Distance</th>
                  <th className="py-3 px-4 font-semibold">Pathways</th>
                  <th className="py-3 px-4 font-semibold">Data Mode</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5DF]">
                {scenarios.map((s) => {
                  const isActive = s.id === activeScenarioId;
                  const enabledCount = s.pathways.filter(p => p.enabled).length;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-[#F7F9F6]/80 transition-colors cursor-pointer ${
                        isActive ? 'bg-[#EAF5EF]/40' : ''
                      }`}
                      onClick={() => handleOpenScenario(s.id)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#182522] flex items-center gap-2">
                          <span>{s.name}</span>
                          {s.isDemo && (
                            <span className="text-[10px] uppercase font-mono text-[#A96512] bg-[#FFF4DE] px-1.5 py-0.5 rounded-sm">
                              Demo
                            </span>
                          )}
                          {isActive && (
                            <span className="text-[10px] uppercase font-mono text-[#176B5B] bg-[#EAF5EF] px-1.5 py-0.5 rounded-sm">
                              Active
                            </span>
                          )}
                        </div>
                        {s.description && (
                          <div className="text-[#64716C] text-[11px] truncate max-w-xs mt-0.5">
                            {s.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-[#182522]">
                        {s.inputMass.toLocaleString()} {s.inputMassUnit}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#64716C]">
                        GF: {(s.composition.glassFiberFraction * 100).toFixed(0)}% · Res: {(s.composition.polymerResinFraction * 100).toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#182522]">
                        {s.transportDistance} {s.transportDistanceUnit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#182522]">{enabledCount} / 3 active</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-[#64716C]">{s.dataSourceMode}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenScenario(s.id)}
                            className="p-1.5 rounded-md text-[#176B5B] hover:bg-[#EAF5EF] transition-colors"
                            title="Open comparison"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateScenario(s.id)}
                            className="p-1.5 rounded-md text-[#64716C] hover:text-[#182522] hover:bg-slate-100 transition-colors"
                            title="Duplicate scenario"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteScenario(s.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-[#B42318] hover:bg-red-50 transition-colors"
                            title="Delete scenario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analytical Quick Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#176B5B]">
            <Scale className="w-4 h-4" />
            <h4 className="font-semibold text-sm text-[#182522]">Explainable MCDA</h4>
          </div>
          <p className="text-xs text-[#64716C] leading-relaxed">
            Multi-criteria decision analysis prioritizing net cost, fiber recovery yield, carbon footprint, and circularity tiers.
          </p>
          <button
            onClick={() => onNavigate('recommendation')}
            className="text-xs font-semibold text-[#176B5B] hover:underline inline-flex items-center gap-1"
          >
            <span>Run Decision Ranking</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#176B5B]">
            <SlidersHorizontal className="w-4 h-4" />
            <h4 className="font-semibold text-sm text-[#182522]">Sensitivity & What-If</h4>
          </div>
          <p className="text-xs text-[#64716C] leading-relaxed">
            Vary transport logistics distance or secondary material off-take pricing to identify cost crossover tipping points.
          </p>
          <button
            onClick={() => onNavigate('sensitivity')}
            className="text-xs font-semibold text-[#176B5B] hover:underline inline-flex items-center gap-1"
          >
            <span>Explore Sensitivity Curves</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#176B5B]">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="font-semibold text-sm text-[#182522]">Automated Formula Audit</h4>
          </div>
          <p className="text-xs text-[#64716C] leading-relaxed">
            Execute the internal calculation verification test suite validating mass conservation, units, and missing data honesty.
          </p>
          <button
            onClick={() => onNavigate('test_suite')}
            className="text-xs font-semibold text-[#176B5B] hover:underline inline-flex items-center gap-1"
          >
            <span>Run Verification Tests</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
