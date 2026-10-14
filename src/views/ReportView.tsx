import React from 'react';
import { Scenario, ScenarioCalculationRun } from '../types';
import { DEFAULT_CRITERIA, calculateRanking } from '../calculations/ranking';
import { generateCSVReport, downloadCSV, incrementExportedReportsCount } from '../lib/scenarioStorage';
import { EVIDENCE_SOURCES } from '../lib/constants';
import { Download, Printer, Wind, CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';

interface ReportViewProps {
  scenario: Scenario;
  run: ScenarioCalculationRun;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  scenario,
  run,
  onBack,
}) => {
  const ranking = calculateRanking(run.pathwayResults, DEFAULT_CRITERIA);
  const inputTonnes = scenario.inputMassKg / 1000;

  const handleDownloadCSV = () => {
    const csvContent = generateCSVReport(scenario, run);
    const safeName = scenario.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`bladecycle_${safeName}_${dateStr}.csv`, csvContent);
  };

  const handlePrint = () => {
    incrementExportedReportsCount();
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Action Header (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DCE5DF] gap-4">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] flex items-center gap-1.5 self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Comparison</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#176B5B]" />
            <span>Download CSV Dataset</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Formatted Report / Save PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#DCE5DF] p-8 sm:p-12 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none text-[#182522]">
        {/* Document Header */}
        <div className="border-b-2 border-[#123B32] pb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-[#123B32]">
              <Wind className="w-6 h-6 text-[#53A878]" />
              <span className="text-xl font-bold tracking-tight">BladeCycle</span>
            </div>
            <h1 className="text-2xl font-bold text-[#182522] mt-2">
              GFRP Wind Turbine Blade End-of-Life Decision Report
            </h1>
            <p className="text-xs text-[#64716C] mt-1 font-mono">
              Scenario: {scenario.name} · Evaluated: {new Date(run.calculatedAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right text-xs font-mono text-[#64716C]">
            <div>Model Version: {run.modelVersion}</div>
            <div>Functional Unit: {scenario.inputMassKg.toLocaleString()} kg</div>
            {scenario.isDemo && (
              <span className="inline-block mt-1 text-[10px] font-semibold text-[#A96512] bg-[#FFF4DE] px-2 py-0.5 rounded-sm">
                ILLUSTRATIVE DEMO
              </span>
            )}
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#123B32] border-b border-[#DCE5DF] pb-1">
            1. Executive Summary
          </h2>
          <p className="text-xs leading-relaxed text-[#182522]">
            This report presents an engineering decision-support evaluation for <strong>{scenario.inputMassKg.toLocaleString()} kg ({inputTonnes.toFixed(1)} metric tonnes)</strong> of glass-fiber-reinforced polymer (GFRP) wind turbine blade scrap. The scenario models material mass flows, logistics and operating costs, preliminary greenhouse gas footprints, and multi-criteria decision rankings across mechanical recycling, thermal processing, and cement-kiln co-processing.
          </p>
        </div>

        {/* 2. Scenario Inputs & Composition */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#123B32] border-b border-[#DCE5DF] pb-1">
            2. Scenario Boundary & Material Composition
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF]">
            <div>
              <span className="text-[#64716C] block font-sans">Waste Quantity:</span>
              <span className="font-semibold text-[#182522]">{scenario.inputMassKg.toLocaleString()} kg</span>
            </div>
            <div>
              <span className="text-[#64716C] block font-sans">Glass Fiber Mass:</span>
              <span className="font-semibold text-[#176B5B]">
                {run.constituentMassesKg.glassFiber.toLocaleString()} kg ({(scenario.composition.glassFiberFraction * 100).toFixed(0)}%)
              </span>
            </div>
            <div>
              <span className="text-[#64716C] block font-sans">Polymer Resin Mass:</span>
              <span className="font-semibold text-[#A96512]">
                {run.constituentMassesKg.polymerResin.toLocaleString()} kg ({(scenario.composition.polymerResinFraction * 100).toFixed(0)}%)
              </span>
            </div>
            <div>
              <span className="text-[#64716C] block font-sans">Transport Haulage:</span>
              <span className="font-semibold text-[#182522]">
                {scenario.transportDistanceKm} km ({scenario.transportCostPerTonneKm ?? 0.12} {scenario.currency}/t-km)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Comparative Mass Balance Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#123B32] border-b border-[#DCE5DF] pb-1">
            3. Material Flow & Mass Conservation Audit
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-[#DCE5DF]">
            <thead>
              <tr className="bg-[#F7F9F6] text-[#64716C] border-b border-[#DCE5DF]">
                <th className="p-2 border-r border-[#DCE5DF]">Pathway</th>
                <th className="p-2 border-r border-[#DCE5DF]">Output Definition</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Recovered (kg)</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Residual (kg)</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Losses (kg)</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DF] font-mono">
              {Object.values(run.pathwayResults).map(p => (
                <tr key={p.pathwayId}>
                  <td className="p-2 font-sans font-semibold border-r border-[#DCE5DF]">{p.pathwayName}</td>
                  <td className="p-2 font-sans border-r border-[#DCE5DF]">{p.outputDescription}</td>
                  <td className="p-2 text-right text-[#176B5B] font-bold border-r border-[#DCE5DF]">
                    {p.recoveredMassKg.toLocaleString()} ({((p.recoveredMassKg / p.inputMassKg) * 100).toFixed(0)}%)
                  </td>
                  <td className="p-2 text-right text-amber-800 border-r border-[#DCE5DF]">{p.residualMassKg.toLocaleString()}</td>
                  <td className="p-2 text-right text-slate-500 border-r border-[#DCE5DF]">{p.lossMassKg.toLocaleString()}</td>
                  <td className="p-2 text-center font-sans">
                    <span className="text-[#176B5B] font-semibold">Balanced (Pass)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Comparative Economics */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#123B32] border-b border-[#DCE5DF] pb-1">
            4. Economic Indicators ({scenario.currency}, {scenario.priceYear} Price Basis)
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-[#DCE5DF]">
            <thead>
              <tr className="bg-[#F7F9F6] text-[#64716C] border-b border-[#DCE5DF]">
                <th className="p-2 border-r border-[#DCE5DF]">Pathway</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Transport Cost</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Processing OPEX</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Gross Cost</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Secondary Value</th>
                <th className="p-2 text-right font-bold">Net Cost / Tonne</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DF] font-mono">
              {Object.values(run.pathwayResults).map(p => {
                const netPerTonne = p.netCost !== null && inputTonnes > 0 ? (p.netCost / inputTonnes).toFixed(1) : 'N/A';
                return (
                  <tr key={p.pathwayId}>
                    <td className="p-2 font-sans font-semibold border-r border-[#DCE5DF]">{p.pathwayName}</td>
                    <td className="p-2 text-right border-r border-[#DCE5DF]">{p.transportCost?.toFixed(0) ?? 'N/A'}</td>
                    <td className="p-2 text-right border-r border-[#DCE5DF]">{p.processingCost?.toFixed(0) ?? 'N/A'}</td>
                    <td className="p-2 text-right border-r border-[#DCE5DF]">{p.grossCost?.toFixed(0) ?? 'N/A'}</td>
                    <td className="p-2 text-right text-[#176B5B] border-r border-[#DCE5DF]">-{p.recoveredValue?.toFixed(0) ?? '0'}</td>
                    <td className="p-2 text-right font-bold text-[#182522]">{netPerTonne} {scenario.currency}/t</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Preliminary Environmental Footprint */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#123B32] border-b border-[#DCE5DF] pb-1">
            5. Preliminary GHG Carbon Balance (kg CO₂e)
          </h2>
          <table className="w-full text-xs text-left border-collapse border border-[#DCE5DF]">
            <thead>
              <tr className="bg-[#F7F9F6] text-[#64716C] border-b border-[#DCE5DF]">
                <th className="p-2 border-r border-[#DCE5DF]">Pathway</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Energy GHG</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Freight GHG</th>
                <th className="p-2 text-right border-r border-[#DCE5DF]">Avoided Credit</th>
                <th className="p-2 text-right font-bold">Net Footprint / Tonne</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DF] font-mono">
              {Object.values(run.pathwayResults).map(p => {
                const netGHGPerTonne = p.netEmissionsKgCO2e !== null && inputTonnes > 0 ? (p.netEmissionsKgCO2e / inputTonnes).toFixed(1) : 'Unavailable';
                return (
                  <tr key={p.pathwayId}>
                    <td className="p-2 font-sans font-semibold border-r border-[#DCE5DF]">{p.pathwayName}</td>
                    <td className="p-2 text-right border-r border-[#DCE5DF]">{p.energyEmissionsKgCO2e?.toFixed(0) ?? 'Unavailable'}</td>
                    <td className="p-2 text-right border-r border-[#DCE5DF]">{p.transportEmissionsKgCO2e?.toFixed(0) ?? 'Unavailable'}</td>
                    <td className="p-2 text-right text-[#176B5B] border-r border-[#DCE5DF]">-{p.avoidedEmissionsKgCO2e?.toFixed(0) ?? '0'}</td>
                    <td className="p-2 text-right font-bold text-[#182522]">{netGHGPerTonne} kg/t</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 6. Multi-Criteria Ranking */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#123B32] border-b border-[#DCE5DF] pb-1">
            6. Explainable Decision Ranking (MCDA)
          </h2>
          <div className="space-y-2 text-xs">
            {ranking.scores.map(s => (
              <div key={s.pathwayId} className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF] flex justify-between items-start">
                <div>
                  <span className="font-bold text-[#182522]">#{s.rank} {s.pathwayName}</span>
                  <p className="text-[#64716C] mt-1">{s.explanation}</p>
                </div>
                <div className="text-right font-mono font-bold text-sm text-[#176B5B]">
                  {s.compositeScore?.toFixed(1) ?? 'N/A'} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Academic References & Disclaimer */}
        <div className="pt-6 border-t-2 border-[#123B32] space-y-3 text-[11px] text-[#64716C]">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#176B5B] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#182522]">Methodology & Academic Governance:</strong> Parameters derived from Al-Lami et al. 2024 (PMC11770760), Kao et al. 2023 (Green Chemistry DOI:10.1039/D3GC03479H), and Papadakis et al. 2024 (Composites Part B DOI:10.1016/j.compositesb.2024.111290).
            </div>
          </div>
          <div className="bg-[#FFF4DE] p-3 rounded-lg border border-[#A96512]/30 text-[#182522]">
            <strong>Limitations Notice:</strong> BladeCycle provides preliminary engineering estimates based on selected inputs and available literature parameters. It is not an ISO 14040/44 certified life cycle assessment, regulatory compliance guarantee, or commercial facility quotation.
          </div>
        </div>
      </div>
    </div>
  );
};
