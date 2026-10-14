import { Scenario, ScenarioCalculationRun, PathwayCalculationResult } from '../types';
import { calculateConstituentMasses, validateComposition } from './composition';
import { calculateMassBalance } from './massBalance';
import { calculateCosts } from './costs';
import { calculateEmissions } from './emissions';

export * from './composition';
export * from './massBalance';
export * from './costs';
export * from './emissions';
export * from './ranking';
export * from './sensitivity';

export const CURRENT_MODEL_VERSION = 'v1.4.0 (ISO 14044 preliminary boundary)';

export function calculateScenario(scenario: Scenario): ScenarioCalculationRun {
  const generalWarnings: string[] = [];

  // Validate composition
  const compValidation = validateComposition(scenario.composition);
  if (!compValidation.isValid) {
    generalWarnings.push(`Composition Warning: ${compValidation.errorMessage}`);
  }

  // Calculate constituent masses
  const constituentMassesKg = calculateConstituentMasses(scenario.inputMassKg, scenario.composition);

  // Check demo mode warning
  if (scenario.isDemo || scenario.dataSourceMode === 'demo') {
    generalWarnings.push('Demonstration Notice: Results use illustrative parameters for concept verification. Not certified industrial or commercial data.');
  }

  // Evaluate each pathway
  const pathwayResults: Record<string, PathwayCalculationResult> = {};

  for (const pathway of scenario.pathways) {
    if (!pathway.enabled) continue;

    // Mass balance
    const massBalance = calculateMassBalance(
      scenario.inputMassKg,
      pathway.recoveryYield,
      pathway.residualFraction,
      pathway.processLossFraction
    );

    // Costs
    const costResult = calculateCosts(
      scenario.inputMassKg,
      massBalance.recoveredMassKg,
      scenario.transportDistanceKm,
      scenario.transportCostPerTonneKm,
      pathway.processingCostPerTonne,
      pathway.revenuePerTonneRecovered
    );

    // Emissions
    const emissionsResult = calculateEmissions(
      scenario.inputMassKg,
      massBalance.recoveredMassKg,
      scenario.transportDistanceKm,
      pathway.processingEnergyKWhPerKg,
      scenario.gridEmissionFactorKgCO2ePerKWh,
      scenario.freightEmissionFactorKgCO2ePerTonneKm,
      pathway.directEmissionsKgCO2ePerKg,
      pathway.avoidedEmissionsKgCO2ePerKg
    );

    // Provenance tagging
    const parameterSources = [
      {
        parameter: 'Recovery Yield',
        source: scenario.dataSourceMode === 'demo' ? 'Illustrative Demo Dataset' : 'Literature Review (Composites Part B / Green Chem)',
        classification: scenario.dataSourceMode === 'demo' ? ('illustrative' as const) : ('published' as const),
      },
      {
        parameter: 'Processing Energy',
        source: scenario.dataSourceMode === 'demo' ? 'Illustrative Estimate' : 'Al-Lami et al. 2024 (PMC11770760)',
        classification: pathway.processingEnergyKWhPerKg ? (scenario.dataSourceMode === 'demo' ? ('illustrative' as const) : ('published' as const)) : ('unavailable' as const),
      },
      {
        parameter: 'Processing Cost',
        source: scenario.dataSourceMode === 'demo' ? 'Illustrative Benchmark' : 'Industry Average Benchmark',
        classification: pathway.processingCostPerTonne ? (scenario.dataSourceMode === 'demo' ? ('illustrative' as const) : ('published' as const)) : ('unavailable' as const),
      },
      {
        parameter: 'Transport Factors',
        source: 'EEA European Average Heavy Goods Vehicle (EN 16258)',
        classification: scenario.freightEmissionFactorKgCO2ePerTonneKm ? ('published' as const) : ('unavailable' as const),
      }
    ];

    pathwayResults[pathway.id] = {
      pathwayId: pathway.id,
      pathwayName: pathway.name,
      technologyDefinition: pathway.technologyDefinition,
      outputDescription: pathway.outputDescription,
      qualityTier: pathway.qualityTier,

      // Mass balance
      inputMassKg: massBalance.inputMassKg,
      recoveredMassKg: massBalance.recoveredMassKg,
      residualMassKg: massBalance.residualMassKg,
      lossMassKg: massBalance.lossMassKg,
      totalAccountedMassKg: massBalance.totalAccountedMassKg,
      massBalanceDifferenceKg: massBalance.differenceKg,
      massBalanceErrorPercent: massBalance.errorPercent,
      massBalanceStatus: massBalance.status,
      massBalanceNotes: massBalance.notes,

      // Costs
      transportCost: costResult.transportCost,
      processingCost: costResult.processingCost,
      otherCost: costResult.otherCost,
      grossCost: costResult.grossCost,
      recoveredValue: costResult.recoveredValue,
      netCost: costResult.netCost,
      costStatus: costResult.costStatus,
      costNotes: costResult.notes,

      // Emissions
      energyEmissionsKgCO2e: emissionsResult.energyEmissionsKgCO2e,
      transportEmissionsKgCO2e: emissionsResult.transportEmissionsKgCO2e,
      directProcessEmissionsKgCO2e: emissionsResult.directProcessEmissionsKgCO2e,
      avoidedEmissionsKgCO2e: emissionsResult.avoidedEmissionsKgCO2e,
      netEmissionsKgCO2e: emissionsResult.netEmissionsKgCO2e,
      emissionsStatus: emissionsResult.emissionsStatus,
      emissionsNotes: emissionsResult.notes,

      // Provenance
      dataQualityBadge: scenario.dataSourceMode === 'demo' ? 'illustrative' : 'published',
      parameterSources,
      limitations: pathway.limitations,
    };
  }

  return {
    scenarioId: scenario.id,
    calculatedAt: new Date().toISOString(),
    modelVersion: CURRENT_MODEL_VERSION,
    inputMassKg: scenario.inputMassKg,
    constituentMassesKg,
    pathwayResults,
    generalWarnings,
  };
}
