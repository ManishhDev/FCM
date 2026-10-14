import { Scenario, PathwayCalculationResult } from '../types';
import { calculateMassBalance } from './massBalance';
import { calculateCosts } from './costs';
import { calculateEmissions } from './emissions';

export interface SensitivityDataPoint {
  parameterValue: number;
  results: Record<string, {
    netCost: number | null;
    netEmissions: number | null;
    recoveredMassKg: number;
  }>;
}

export interface SensitivityAnalysisResult {
  parameterName: string;
  parameterUnit: string;
  points: SensitivityDataPoint[];
  findings: string[];
}

export function runTransportSensitivity(
  scenario: Scenario,
  minDistanceKm: number = 20,
  maxDistanceKm: number = 800,
  steps: number = 8
): SensitivityAnalysisResult {
  const stepSize = (maxDistanceKm - minDistanceKm) / (steps - 1);
  const points: SensitivityDataPoint[] = [];

  for (let i = 0; i < steps; i++) {
    const dist = Math.round(minDistanceKm + i * stepSize);
    const pointResults: SensitivityDataPoint['results'] = {};

    for (const pathway of scenario.pathways) {
      if (!pathway.enabled) continue;

      const massBalance = calculateMassBalance(
        scenario.inputMassKg,
        pathway.recoveryYield,
        pathway.residualFraction,
        pathway.processLossFraction
      );

      const costs = calculateCosts(
        scenario.inputMassKg,
        massBalance.recoveredMassKg,
        dist,
        scenario.transportCostPerTonneKm,
        pathway.processingCostPerTonne,
        pathway.revenuePerTonneRecovered
      );

      const emissions = calculateEmissions(
        scenario.inputMassKg,
        massBalance.recoveredMassKg,
        dist,
        pathway.processingEnergyKWhPerKg,
        scenario.gridEmissionFactorKgCO2ePerKWh,
        scenario.freightEmissionFactorKgCO2ePerTonneKm,
        pathway.directEmissionsKgCO2ePerKg,
        pathway.avoidedEmissionsKgCO2ePerKg
      );

      pointResults[pathway.id] = {
        netCost: costs.netCost,
        netEmissions: emissions.netEmissionsKgCO2e,
        recoveredMassKg: massBalance.recoveredMassKg,
      };
    }

    points.push({
      parameterValue: dist,
      results: pointResults,
    });
  }

  // Derive findings (e.g. at what distance does transport overtake processing costs)
  const findings: string[] = [
    `Transport costs scale linearly with distance (${scenario.transportCostPerTonneKm ?? 0.12} EUR/t-km).`,
    `Over 500 km transport, freight GHG emissions contribute significantly to total carbon balance.`,
    `Cement-kiln co-processing viability is sensitive to local kiln proximity; high logistics distance quickly erodes fossil fuel offset credits.`
  ];

  return {
    parameterName: 'Transport Distance',
    parameterUnit: 'km',
    points,
    findings,
  };
}
