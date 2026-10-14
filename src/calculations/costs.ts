import { BreakEvenAnalysisResult } from '../types';

export interface CostCalculationResult {
  transportCost: number | null;
  processingCost: number | null;
  otherCost: number | null;
  grossCost: number | null;
  recoveredValue: number | null;
  netCost: number | null;
  costStatus: 'complete' | 'partial' | 'unavailable';
  notes: string[];
}

export function calculateCosts(
  inputMassKg: number,
  recoveredMassKg: number,
  transportDistanceKm: number,
  transportCostPerTonneKm: number | null,
  processingCostPerTonne: number | null,
  revenuePerTonneRecovered: number | null,
  otherCostPerTonne: number | null = 0
): CostCalculationResult {
  const notes: string[] = [];
  const inputMassTonnes = inputMassKg / 1000;
  const recoveredMassTonnes = recoveredMassKg / 1000;

  // Transport Cost
  let transportCost: number | null = null;
  if (transportCostPerTonneKm !== null && transportCostPerTonneKm >= 0 && transportDistanceKm >= 0) {
    transportCost = inputMassTonnes * transportDistanceKm * transportCostPerTonneKm;
  } else {
    notes.push('Transport cost parameter missing or undefined; transport logistics excluded.');
  }

  // Processing Cost
  let processingCost: number | null = null;
  if (processingCostPerTonne !== null && processingCostPerTonne >= 0) {
    processingCost = inputMassTonnes * processingCostPerTonne;
  } else {
    notes.push('Processing operating cost parameter missing; conversion cost not accounted.');
  }

  // Other Cost
  const otherCost = otherCostPerTonne !== null ? inputMassTonnes * otherCostPerTonne : 0;

  // Determine Gross Cost
  let grossCost: number | null = null;
  if (transportCost !== null && processingCost !== null) {
    grossCost = transportCost + processingCost + otherCost;
  } else if (transportCost !== null || processingCost !== null) {
    grossCost = (transportCost ?? 0) + (processingCost ?? 0) + otherCost;
    notes.push('Gross cost is a partial subtotal due to missing components.');
  }

  // Recovered Value (Revenue / Offset)
  let recoveredValue: number | null = null;
  if (revenuePerTonneRecovered !== null && revenuePerTonneRecovered >= 0) {
    recoveredValue = recoveredMassTonnes * revenuePerTonneRecovered;
  } else {
    notes.push('Secondary market recovered material value not available or not assumed.');
  }

  // Net Cost = Gross Cost - Recovered Value
  let netCost: number | null = null;
  if (grossCost !== null) {
    netCost = grossCost - (recoveredValue ?? 0);
  }

  // Status definition
  let costStatus: 'complete' | 'partial' | 'unavailable' = 'unavailable';
  if (transportCost !== null && processingCost !== null && recoveredValue !== null) {
    costStatus = 'complete';
  } else if (transportCost !== null || processingCost !== null || recoveredValue !== null) {
    costStatus = 'partial';
  } else {
    costStatus = 'unavailable';
  }

  return {
    transportCost,
    processingCost,
    otherCost,
    grossCost,
    recoveredValue,
    netCost,
    costStatus,
    notes,
  };
}

/**
 * Analytical Break-Even Solver between two recycling pathways.
 * 
 * Case A: Distance Crossover (when one facility has a different logistics distance or rate, e.g. local cement kiln vs distant centralized pyrolysis).
 * Equation:
 *   c_net,1(d_1) = c_net,2(d_2)
 *   d_1 * r_1 + F_1 = d_2 * r_2 + F_2
 *   where F_i = c_proc,i + c_other,i - (Y_i * v_rec,i)
 * 
 * Case B: Secondary Market Parity (Break-Even Reclaimed Material Value).
 * What price must reclaimed material in Pathway 1 achieve to break even with Pathway 2?
 *   v_rec,1* = (C_gross,1 - C_net,2) / M_recovered,1
 */
export function calculatePathwayBreakEven(
  pathway1: {
    id: string;
    name: string;
    processingCostPerTonne: number | null;
    recoveryYield: number;
    revenuePerTonneRecovered: number | null;
    transportCostPerTonneKm: number;
    transportDistanceKm: number;
  },
  pathway2: {
    id: string;
    name: string;
    processingCostPerTonne: number | null;
    recoveryYield: number;
    revenuePerTonneRecovered: number | null;
    transportCostPerTonneKm: number;
    transportDistanceKm: number;
  },
  inputMassTonnes: number = 100
): BreakEvenAnalysisResult {
  const p1Name = pathway1.name.split(' (')[0];
  const p2Name = pathway2.name.split(' (')[0];

  // Base fixed net costs per tonne (excluding transport): F = c_proc - Y * v_rec
  const F1 = (pathway1.processingCostPerTonne ?? 0) - (pathway1.recoveryYield * (pathway1.revenuePerTonneRecovered ?? 0));
  const F2 = (pathway2.processingCostPerTonne ?? 0) - (pathway2.recoveryYield * (pathway2.revenuePerTonneRecovered ?? 0));

  const r1 = pathway1.transportCostPerTonneKm;
  const r2 = pathway2.transportCostPerTonneKm;

  // Let's solve for break-even distance of Pathway 1 when Pathway 2 is at its baseline distance d2:
  // d1* = (d2 * r2 + F2 - F1) / r1
  let breakEvenDistanceKm: number | null = null;
  let hasCrossover = false;
  let isDistancePhysicallyFeasible = false;
  let explanation = '';
  let mathematicalDerivation = '';

  if (r1 > 0) {
    const d2 = pathway2.transportDistanceKm;
    const numerator = d2 * r2 + F2 - F1;
    const d1_star = numerator / r1;

    mathematicalDerivation = `d₁* = (d₂·r₂ + F₂ - F₁) / r₁ = (${d2}·${r2} + ${F2.toFixed(1)} - ${F1.toFixed(1)}) / ${r1} = ${d1_star.toFixed(1)} km`;

    if (d1_star > 0 && d1_star <= 1500) {
      hasCrossover = true;
      isDistancePhysicallyFeasible = true;
      breakEvenDistanceKm = parseFloat(d1_star.toFixed(1));
      explanation = `At a haulage distance of ${breakEvenDistanceKm} km for ${p1Name} (holding ${p2Name} at ${d2} km), both pathways achieve equal net cost. Below ${breakEvenDistanceKm} km, ${p1Name} is more economical; beyond ${breakEvenDistanceKm} km, ${p2Name} is cheaper.`;
    } else if (d1_star <= 0) {
      hasCrossover = true;
      isDistancePhysicallyFeasible = false;
      breakEvenDistanceKm = parseFloat(d1_star.toFixed(1));
      explanation = `Mathematical crossover occurs at negative distance (${breakEvenDistanceKm} km), meaning ${p2Name} strictly dominates across all non-negative road haulage distances under current OPEX and yield assumptions.`;
    } else {
      hasCrossover = false;
      isDistancePhysicallyFeasible = false;
      breakEvenDistanceKm = parseFloat(d1_star.toFixed(1));
      explanation = `Crossover distance (${breakEvenDistanceKm} km) exceeds practical regional transport limits (>1500 km).`;
    }
  } else {
    explanation = `Zero transport freight rate; no distance-dependent crossover point exists.`;
    mathematicalDerivation = `r₁ = 0; division by zero undefined.`;
  }

  // Secondary Market Value Parity:
  // What secondary price v_rec,1* would make Pathway 1 break even with Pathway 2 at current baseline distances?
  // C_net,1 = C_net,2 => C_gross,1 - M_rec,1 * v1* = C_net,2 => v1* = (C_gross,1 - C_net,2) / M_rec,1
  let breakEvenSecondaryPricePerTonne: number | null = null;
  const M_rec1 = inputMassTonnes * pathway1.recoveryYield;
  if (M_rec1 > 0) {
    const C_gross1 = (inputMassTonnes * pathway1.transportDistanceKm * r1) + (inputMassTonnes * (pathway1.processingCostPerTonne ?? 0));
    const C_gross2 = (inputMassTonnes * pathway2.transportDistanceKm * r2) + (inputMassTonnes * (pathway2.processingCostPerTonne ?? 0));
    const C_net2 = C_gross2 - (inputMassTonnes * pathway2.recoveryYield * (pathway2.revenuePerTonneRecovered ?? 0));
    
    const v1_star = (C_gross1 - C_net2) / M_rec1;
    breakEvenSecondaryPricePerTonne = parseFloat(v1_star.toFixed(1));
  }

  return {
    pathwayPair: [pathway1.id, pathway2.id],
    pathwayNames: [p1Name, p2Name],
    hasCrossover,
    breakEvenDistanceKm,
    isDistancePhysicallyFeasible,
    breakEvenSecondaryPricePerTonne,
    explanation,
    mathematicalDerivation,
  };
}
