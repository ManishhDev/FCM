export interface EmissionsCalculationResult {
  energyEmissionsKgCO2e: number | null;
  transportEmissionsKgCO2e: number | null;
  directProcessEmissionsKgCO2e: number | null;
  avoidedEmissionsKgCO2e: number | null;
  netEmissionsKgCO2e: number | null;
  emissionsStatus: 'complete' | 'partial' | 'unavailable';
  notes: string[];
}

export function calculateEmissions(
  inputMassKg: number,
  recoveredMassKg: number,
  transportDistanceKm: number,
  processingEnergyKWhPerKg: number | null,
  gridEmissionFactorKgCO2ePerKWh: number | null,
  freightEmissionFactorKgCO2ePerTonneKm: number | null,
  directEmissionsKgCO2ePerKg: number | null,
  avoidedEmissionsKgCO2ePerKg: number | null
): EmissionsCalculationResult {
  const notes: string[] = [];
  const inputMassTonnes = inputMassKg / 1000;

  // Energy emissions: Q_energy * EF_grid
  let energyEmissionsKgCO2e: number | null = null;
  if (processingEnergyKWhPerKg !== null && gridEmissionFactorKgCO2ePerKWh !== null) {
    const totalKWh = inputMassKg * processingEnergyKWhPerKg;
    energyEmissionsKgCO2e = totalKWh * gridEmissionFactorKgCO2ePerKWh;
  } else {
    notes.push('Electrical/thermal energy consumption or grid carbon intensity factor missing.');
  }

  // Transport emissions: mass (t) * distance (km) * freight EF
  let transportEmissionsKgCO2e: number | null = null;
  if (freightEmissionFactorKgCO2ePerTonneKm !== null && transportDistanceKm >= 0) {
    transportEmissionsKgCO2e = inputMassTonnes * transportDistanceKm * freightEmissionFactorKgCO2ePerTonneKm;
  } else {
    notes.push('Road freight emission factor missing or distance zero.');
  }

  // Direct process emissions (e.g. thermal resin combustion or off-gas incineration)
  let directProcessEmissionsKgCO2e: number | null = null;
  if (directEmissionsKgCO2ePerKg !== null) {
    directProcessEmissionsKgCO2e = inputMassKg * directEmissionsKgCO2ePerKg;
  } else {
    notes.push('Direct stack/chemical process emission factor not specified.');
  }

  // Avoided production emissions (credit for displacing virgin glass fiber, mineral filler, or fossil fuel)
  let avoidedEmissionsKgCO2e: number | null = null;
  if (avoidedEmissionsKgCO2ePerKg !== null && avoidedEmissionsKgCO2ePerKg > 0) {
    avoidedEmissionsKgCO2e = recoveredMassKg * avoidedEmissionsKgCO2ePerKg;
  } else {
    notes.push('Avoided displacement credits not granted or no virgin substitution baseline documented.');
  }

  // Calculate Net GHG emissions
  let netEmissionsKgCO2e: number | null = null;
  const emissionsTerms: number[] = [];

  if (energyEmissionsKgCO2e !== null) emissionsTerms.push(energyEmissionsKgCO2e);
  if (transportEmissionsKgCO2e !== null) emissionsTerms.push(transportEmissionsKgCO2e);
  if (directProcessEmissionsKgCO2e !== null) emissionsTerms.push(directProcessEmissionsKgCO2e);

  if (emissionsTerms.length > 0) {
    const grossEmissions = emissionsTerms.reduce((sum, val) => sum + val, 0);
    netEmissionsKgCO2e = grossEmissions - (avoidedEmissionsKgCO2e ?? 0);
  }

  // Status definition
  let emissionsStatus: 'complete' | 'partial' | 'unavailable' = 'unavailable';
  if (energyEmissionsKgCO2e !== null && transportEmissionsKgCO2e !== null && directProcessEmissionsKgCO2e !== null) {
    emissionsStatus = 'complete';
  } else if (emissionsTerms.length > 0) {
    emissionsStatus = 'partial';
    notes.push('Emissions inventory is partial; missing terms were NOT assumed to be zero.');
  } else {
    emissionsStatus = 'unavailable';
    notes.push('Insufficient emission factor inventory to compute GHG footprint.');
  }

  return {
    energyEmissionsKgCO2e,
    transportEmissionsKgCO2e,
    directProcessEmissionsKgCO2e,
    avoidedEmissionsKgCO2e,
    netEmissionsKgCO2e,
    emissionsStatus,
    notes,
  };
}
