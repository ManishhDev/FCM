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
