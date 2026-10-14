import { Scenario, ScenarioCalculationRun, RankingResult } from '../types';
import { DEMO_SCENARIO } from './constants';

const STORAGE_KEY = 'bladecycle_scenarios_v1';
const REPORT_COUNTER_KEY = 'bladecycle_report_counter';

export function getStoredScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with default demo scenario
      localStorage.setItem(STORAGE_KEY, JSON.stringify([DEMO_SCENARIO]));
      return [DEMO_SCENARIO];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([DEMO_SCENARIO]));
      return [DEMO_SCENARIO];
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load scenarios from localStorage:', err);
    return [DEMO_SCENARIO];
  }
}

export function saveScenario(scenario: Scenario): void {
  try {
    const scenarios = getStoredScenarios();
    const existingIndex = scenarios.findIndex(s => s.id === scenario.id);
    const updated = { ...scenario, updatedAt: new Date().toISOString() };

    if (existingIndex >= 0) {
      scenarios[existingIndex] = updated;
    } else {
      scenarios.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (err) {
    console.error('Failed to save scenario:', err);
  }
}

export function getScenarioById(id: string): Scenario | null {
  const scenarios = getStoredScenarios();
  return scenarios.find(s => s.id === id) || null;
}

export function duplicateScenario(id: string): Scenario | null {
  const target = getScenarioById(id);
  if (!target) return null;

  const newScenario: Scenario = {
    ...target,
    id: `scenario-${Date.now()}`,
    name: `${target.name} (Copy)`,
    isDemo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveScenario(newScenario);
  return newScenario;
}

export function deleteScenario(id: string): boolean {
  try {
    const scenarios = getStoredScenarios();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete scenario:', err);
    return false;
  }
}

export function getExportedReportsCount(): number {
  try {
    return parseInt(localStorage.getItem(REPORT_COUNTER_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

export function incrementExportedReportsCount(): void {
  try {
    const count = getExportedReportsCount() + 1;
    localStorage.setItem(REPORT_COUNTER_KEY, count.toString());
  } catch {
    // Ignore storage errors
  }
}

export function generateCSVReport(scenario: Scenario, run: ScenarioCalculationRun): string {
  incrementExportedReportsCount();

  const lines: string[] = [];
  lines.push('BladeCycle — Wind Turbine Blade End-of-Life Analysis Report');
  lines.push(`Scenario Name,"${scenario.name}"`);
  lines.push(`Run Timestamp,"${run.calculatedAt}"`);
  lines.push(`Model Version,"${run.modelVersion}"`);
  lines.push(`Data Source Mode,"${scenario.dataSourceMode}"`);
  lines.push(`Total Input Mass,"${scenario.inputMassKg} kg (${(scenario.inputMassKg / 1000).toFixed(2)} tonnes)"`);
  lines.push(`Glass Fiber Mass Fraction,"${(scenario.composition.glassFiberFraction * 100).toFixed(1)}%"`);
  lines.push(`Polymer Resin Mass Fraction,"${(scenario.composition.polymerResinFraction * 100).toFixed(1)}%"`);
  lines.push(`Transport Distance,"${scenario.transportDistanceKm} km"`);
  lines.push(`Currency,"${scenario.currency}"`);
  lines.push('');

  // Table headers
  lines.push([
    'Pathway ID',
    'Pathway Name',
    'Output Definition',
    'Quality Tier',
    'Input Mass (kg)',
    'Recovered Mass (kg)',
    'Recovery Yield (%)',
    'Residual Mass (kg)',
    'Process Losses (kg)',
    'Mass Balance Diff (kg)',
    'Mass Balance Status',
    `Transport Cost (${scenario.currency})`,
    `Processing Cost (${scenario.currency})`,
    `Gross Cost (${scenario.currency})`,
    `Recovered Revenue (${scenario.currency})`,
    `Net Cost (${scenario.currency})`,
    `Net Cost Per Tonne (${scenario.currency}/t)`,
    'Energy GHG (kg CO2e)',
    'Transport GHG (kg CO2e)',
    'Avoided GHG Credit (kg CO2e)',
    'Net GHG (kg CO2e)',
    'Net GHG Per Tonne (kg CO2e/t)',
    'Data Classification',
  ].join(','));

  for (const p of Object.values(run.pathwayResults)) {
    const inputTonnes = p.inputMassKg / 1000;
    const netCostPerTonne = p.netCost !== null && inputTonnes > 0 ? (p.netCost / inputTonnes).toFixed(2) : 'N/A';
    const netGHGPerTonne = p.netEmissionsKgCO2e !== null && inputTonnes > 0 ? (p.netEmissionsKgCO2e / inputTonnes).toFixed(2) : 'N/A';

    lines.push([
      `"${p.pathwayId}"`,
      `"${p.pathwayName}"`,
      `"${p.outputDescription.replace(/"/g, '""')}"`,
      `"${p.qualityTier}"`,
      p.inputMassKg.toFixed(1),
      p.recoveredMassKg.toFixed(1),
      ((p.recoveredMassKg / p.inputMassKg) * 100).toFixed(1),
      p.residualMassKg.toFixed(1),
      p.lossMassKg.toFixed(1),
      p.massBalanceDifferenceKg.toFixed(3),
      `"${p.massBalanceStatus}"`,
      p.transportCost !== null ? p.transportCost.toFixed(2) : 'N/A',
      p.processingCost !== null ? p.processingCost.toFixed(2) : 'N/A',
      p.grossCost !== null ? p.grossCost.toFixed(2) : 'N/A',
      p.recoveredValue !== null ? p.recoveredValue.toFixed(2) : 'N/A',
      p.netCost !== null ? p.netCost.toFixed(2) : 'N/A',
      `"${netCostPerTonne}"`,
      p.energyEmissionsKgCO2e !== null ? p.energyEmissionsKgCO2e.toFixed(2) : 'N/A',
      p.transportEmissionsKgCO2e !== null ? p.transportEmissionsKgCO2e.toFixed(2) : 'N/A',
      p.avoidedEmissionsKgCO2e !== null ? p.avoidedEmissionsKgCO2e.toFixed(2) : 'N/A',
      p.netEmissionsKgCO2e !== null ? p.netEmissionsKgCO2e.toFixed(2) : 'N/A',
      `"${netGHGPerTonne}"`,
      `"${p.dataQualityBadge}"`,
    ].join(','));
  }

  lines.push('');
  lines.push('LIMITATIONS AND SCIENTIFIC DISCLAIMER:');
  lines.push('"BladeCycle provides preliminary engineering estimates based on selected inputs and literature parameters. It is not a certified industrial process model or ISO 14040/44 life-cycle assessment."');

  return lines.join('\n');
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportScenarioToJSON(scenario: Scenario): string {
  incrementExportedReportsCount();
  return JSON.stringify(scenario, null, 2);
}

export function downloadJSON(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

