import { PathwayCalculationResult, RankingCriterion, RankingResult, PathwayRankScore } from '../types';

export const DEFAULT_CRITERIA: RankingCriterion[] = [
  {
    id: 'cost',
    label: 'Cost Efficiency (Net Cost / t)',
    description: 'Prioritize lower net operational cost per tonne of blade waste processed.',
    weight: 35,
    direction: 'minimize',
  },
  {
    id: 'recovery',
    label: 'Material Recovery Yield (%)',
    description: 'Maximize the proportion of blade mass converted into defined secondary outputs.',
    weight: 30,
    direction: 'maximize',
  },
  {
    id: 'emissions',
    label: 'Carbon Footprint (Net GHG / t)',
    description: 'Minimize net gate-to-gate and transport greenhouse gas emissions.',
    weight: 20,
    direction: 'minimize',
  },
  {
    id: 'quality',
    label: 'Output Quality & Circularity Tier',
    description: 'Value structural reuse / higher-value fiber recovery over downcycled concrete filler or combustion.',
    weight: 15,
    direction: 'maximize',
  },
];

export function calculateRanking(
  pathwayResults: Record<string, PathwayCalculationResult>,
  criteria: RankingCriterion[],
  hardConstraints: {
    maxNetCostPerTonne?: number;
    minRecoveryYieldPercent?: number;
    requireMassBalancePass?: boolean;
  } = {}
): RankingResult {
  const activePathways = Object.values(pathwayResults);
  const defensibilityNotes: string[] = [];

  if (activePathways.length === 0) {
    return {
      scores: [],
      isDefensible: false,
      defensibilityNotes: ['No pathways selected or calculated.'],
      weightsUsed: {},
      policyUsed: 'No pathways to rank.',
    };
  }

  // Normalize total criteria weights to sum to 100%
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight <= 0) {
    return {
      scores: [],
      isDefensible: false,
      defensibilityNotes: ['Total criteria weight must be greater than zero.'],
      weightsUsed: {},
      policyUsed: 'Invalid weight distribution.',
    };
  }

  const normalizedWeights: Record<string, number> = {};
  for (const c of criteria) {
    normalizedWeights[c.id] = (c.weight / totalWeight) * 100;
  }

  // Extract raw metrics per pathway for normalization bounds
  // Metric units:
  // cost: EUR/tonne input (netCost / (inputMassKg / 1000))
  // recovery: fraction (recoveredMassKg / inputMassKg)
  // emissions: kg CO2e / tonne input (netEmissionsKgCO2e / (inputMassKg / 1000))
  // quality: 100 (high), 65 (medium), 35 (downcycled)
  const rawData: Record<string, {
    cost: number | null;
    recovery: number;
    emissions: number | null;
    quality: number;
  }> = {};

  for (const p of activePathways) {
    const inputTonnes = p.inputMassKg / 1000;
    const netCostPerTonne = p.netCost !== null && inputTonnes > 0 ? p.netCost / inputTonnes : null;
    const recoveryYield = p.inputMassKg > 0 ? p.recoveredMassKg / p.inputMassKg : 0;
    const netEmissionsPerTonne = p.netEmissionsKgCO2e !== null && inputTonnes > 0 ? p.netEmissionsKgCO2e / inputTonnes : null;
    const qualityScore = p.qualityTier === 'high' ? 100 : p.qualityTier === 'medium' ? 65 : 35;

    rawData[p.pathwayId] = {
      cost: netCostPerTonne,
      recovery: recoveryYield,
      emissions: netEmissionsPerTonne,
      quality: qualityScore,
    };
  }

  // Determine min and max for active metrics across available pathways
  const costValues = Object.values(rawData).map(d => d.cost).filter((v): v is number => v !== null);
  const recoveryValues = Object.values(rawData).map(d => d.recovery);
  const emissionsValues = Object.values(rawData).map(d => d.emissions).filter((v): v is number => v !== null);
  const qualityValues = Object.values(rawData).map(d => d.quality);

  const costCriterion = criteria.find(c => c.id === 'cost');
  const emissionsCriterion = criteria.find(c => c.id === 'emissions');

  // Check if user has non-zero weight on cost or emissions while data is missing
  if ((costCriterion?.weight ?? 0) > 0 && costValues.length < activePathways.length) {
    defensibilityNotes.push(
      'Notice: One or more pathways lack complete cost estimates. Missing costs are not treated as zero; scoring reflects only available parameters.'
    );
  }
  if ((emissionsCriterion?.weight ?? 0) > 0 && emissionsValues.length < activePathways.length) {
    defensibilityNotes.push(
      'Notice: Environmental emissions are unavailable for some pathways. Carbon criteria scores are restricted to pathways with verified emission factors.'
    );
  }

  const minCost = costValues.length > 0 ? Math.min(...costValues) : 0;
  const maxCost = costValues.length > 0 ? Math.max(...costValues) : 1;
  const minRecovery = Math.min(...recoveryValues);
  const maxRecovery = Math.max(...recoveryValues);
  const minEmissions = emissionsValues.length > 0 ? Math.min(...emissionsValues) : 0;
  const maxEmissions = emissionsValues.length > 0 ? Math.max(...emissionsValues) : 1;
  const minQuality = Math.min(...qualityValues);
  const maxQuality = Math.max(...qualityValues);

  const scores: PathwayRankScore[] = activePathways.map(p => {
    const raw = rawData[p.pathwayId];
    const criterionScores: PathwayRankScore['criterionScores'] = [];

    // Apply hard constraints
    let isFeasible = true;
    let unfeasibleReason: string | undefined;

    if (hardConstraints.requireMassBalancePass && p.massBalanceStatus !== 'pass') {
      isFeasible = false;
      unfeasibleReason = 'Mass balance check did not pass within required tolerance.';
    }

    if (hardConstraints.minRecoveryYieldPercent && (raw.recovery * 100) < hardConstraints.minRecoveryYieldPercent) {
      isFeasible = false;
      unfeasibleReason = `Recovery yield (${(raw.recovery * 100).toFixed(1)}%) is below required minimum threshold of ${hardConstraints.minRecoveryYieldPercent}%.`;
    }

    if (hardConstraints.maxNetCostPerTonne && raw.cost !== null && raw.cost > hardConstraints.maxNetCostPerTonne) {
      isFeasible = false;
      unfeasibleReason = `Net cost (${raw.cost.toFixed(1)} / t) exceeds budget constraint of ${hardConstraints.maxNetCostPerTonne} / t.`;
    }

    let compositeScore: number | null = 0;
    let totalFeasibleWeight = 0;

    // 1. Cost Criterion
    if (costCriterion && costCriterion.weight > 0) {
      if (raw.cost !== null) {
        // Lower is better: normalized = 100 * (max - v) / (max - min)
        const range = maxCost - minCost;
        const norm = range > 0.001 ? 100 * (maxCost - raw.cost) / range : 100;
        const weighted = norm * (normalizedWeights['cost'] / 100);
        criterionScores.push({
          criterionId: 'cost',
          rawMetricValue: raw.cost,
          rawMetricUnit: 'EUR/tonne',
          normalizedScore: norm,
          weightedContribution: weighted,
          status: 'valid',
        });
        compositeScore += weighted;
        totalFeasibleWeight += normalizedWeights['cost'];
      } else {
        criterionScores.push({
          criterionId: 'cost',
          rawMetricValue: null,
          rawMetricUnit: 'EUR/tonne',
          normalizedScore: null,
          weightedContribution: null,
          status: 'missing',
        });
      }
    }

    // 2. Recovery Criterion
    const recoveryCriterion = criteria.find(c => c.id === 'recovery');
    if (recoveryCriterion && recoveryCriterion.weight > 0) {
      const range = maxRecovery - minRecovery;
      const norm = range > 0.001 ? 100 * (raw.recovery - minRecovery) / range : 100;
      const weighted = norm * (normalizedWeights['recovery'] / 100);
      criterionScores.push({
        criterionId: 'recovery',
        rawMetricValue: raw.recovery * 100,
        rawMetricUnit: '%',
        normalizedScore: norm,
        weightedContribution: weighted,
        status: 'valid',
      });
      compositeScore += weighted;
      totalFeasibleWeight += normalizedWeights['recovery'];
    }

    // 3. Emissions Criterion
    if (emissionsCriterion && emissionsCriterion.weight > 0) {
      if (raw.emissions !== null) {
        // Lower is better: normalized = 100 * (max - v) / (max - min)
        const range = maxEmissions - minEmissions;
        const norm = range > 0.001 ? 100 * (maxEmissions - raw.emissions) / range : 100;
        const weighted = norm * (normalizedWeights['emissions'] / 100);
        criterionScores.push({
          criterionId: 'emissions',
          rawMetricValue: raw.emissions,
          rawMetricUnit: 'kg CO2e/t',
          normalizedScore: norm,
          weightedContribution: weighted,
          status: 'valid',
        });
        compositeScore += weighted;
        totalFeasibleWeight += normalizedWeights['emissions'];
      } else {
        criterionScores.push({
          criterionId: 'emissions',
          rawMetricValue: null,
          rawMetricUnit: 'kg CO2e/t',
          normalizedScore: null,
          weightedContribution: null,
          status: 'missing',
        });
      }
    }

    // 4. Quality Criterion
    const qualityCriterion = criteria.find(c => c.id === 'quality');
    if (qualityCriterion && qualityCriterion.weight > 0) {
      const range = maxQuality - minQuality;
      const norm = range > 0.001 ? 100 * (raw.quality - minQuality) / range : 100;
      const weighted = norm * (normalizedWeights['quality'] / 100);
      criterionScores.push({
        criterionId: 'quality',
        rawMetricValue: raw.quality,
        rawMetricUnit: 'index (0-100)',
        normalizedScore: norm,
        weightedContribution: weighted,
        status: 'valid',
      });
      compositeScore += weighted;
      totalFeasibleWeight += normalizedWeights['quality'];
    }

    // Re-scale composite score if any metrics were missing, but flag it
    if (totalFeasibleWeight > 0 && totalFeasibleWeight < 99) {
      compositeScore = (compositeScore / totalFeasibleWeight) * 100;
    } else if (totalFeasibleWeight === 0) {
      compositeScore = null;
    }

    // Generate explainable rationale
    let explanation = '';
    if (p.pathwayId === 'mechanical') {
      explanation = `Achieves highest mass recovery yield (${(raw.recovery * 100).toFixed(0)}%) with low pre-treatment energy, but yields downcycled filler rather than structural fibers.`;
    } else if (p.pathwayId === 'thermal') {
      explanation = `Recovers clean discontinuous glass fiber suitable for polymer compounding with substantial virgin offset potential, but requires significant heating energy (OPEX ~${raw.cost?.toFixed(0) ?? 'N/A'} EUR/t).`;
    } else if (p.pathwayId === 'cement_kiln') {
      explanation = `Solves residual disposal (0% landfill) by incorporating minerals into clinker and polymer into kiln fuel, though fiber structure is completely destroyed.`;
    }

    const sensitivityCaveat = `Sensitivity note: A ${(p.pathwayId === 'thermal' ? '15% drop in secondary fiber price' : '20% increase in transport distance')} or altered emission factors could change relative positioning.`;

    return {
      pathwayId: p.pathwayId,
      pathwayName: p.pathwayName,
      rank: 1, // temporary, assigned below
      compositeScore: isFeasible ? compositeScore : null,
      isFeasible,
      unfeasibleReason,
      criterionScores,
      explanation,
      sensitivityCaveat,
    };
  });

  // Sort by composite score descending
  scores.sort((a, b) => {
    if (!a.isFeasible && b.isFeasible) return 1;
    if (a.isFeasible && !b.isFeasible) return -1;
    if (a.compositeScore === null && b.compositeScore !== null) return 1;
    if (a.compositeScore !== null && b.compositeScore === null) return -1;
    return (b.compositeScore ?? 0) - (a.compositeScore ?? 0);
  });

  // Assign ranks
  scores.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return {
    scores,
    isDefensible: defensibilityNotes.length === 0,
    defensibilityNotes,
    weightsUsed: normalizedWeights,
    policyUsed: 'Proportional weight renormalization across verified available criteria (missing data is never assumed as zero).',
  };
}
