export type MassUnit = 'kg' | 'tonnes';
export type DistanceUnit = 'km' | 'miles';
export type CurrencyCode = 'EUR' | 'USD' | 'INR' | 'GBP';

export type DataClassification = 
  | 'verified_against_source' // Audited against original paper/table
  | 'published'               // Extracted from peer-reviewed source
  | 'derived'                 // Calculated deterministically from other parameters
  | 'user_assumption'         // User entered or configured
  | 'illustrative'            // Marked for demonstration only
  | 'unverified'              // Awaiting verification
  | 'unavailable';            // Required parameter missing / not reported

export type ValidationStatus = 'pass' | 'warning' | 'fail' | 'incomplete';

export interface EvidenceSource {
  id: string;
  title: string;
  authors?: string;
  doi?: string;
  url: string;
  publicationYear: number;
  publisher: string;
  verified: boolean;
  verificationNotes?: string;
  originalReportedUnits?: string;
  notes?: string;
}

export interface ProcessParameter {
  id: string;
  name: string;
  symbol: string;
  value: number | null;
  unit: string;
  pathwayId: string;
  classification: DataClassification;
  sourceId?: string;
  studyConditions?: string;
  functionalUnit?: string;
  systemBoundary?: string;
  originalReportedValue?: string;
  conversionFormula?: string;
  uncertaintyNotes?: string;
  version: string;
}

export interface CompositionModel {
  type: 'simplified_two_component' | 'extended_blade';
  glassFiberFraction: number; // 0..1
  polymerResinFraction: number; // 0..1
  coreMaterialFraction?: number; // 0..1 (balsa wood / PET / PVC foam)
  coatingsAndAdhesivesFraction?: number; // 0..1 (gelcoat, structural adhesive)
  metallicInsertsFraction?: number; // 0..1 (lightning receptor, root bolts)
}

export interface PathwayConfig {
  id: 'mechanical' | 'thermal' | 'cement_kiln';
  name: string;
  technologyDefinition: string;
  enabled: boolean;
  recoveryYield: number; // fraction 0..1
  residualFraction: number; // fraction 0..1
  processLossFraction: number; // fraction 0..1
  outputDescription: string;
  qualityTier: 'high' | 'medium' | 'downcycled';
  processingEnergyKWhPerKg: number | null; // electricity/thermal energy per kg waste
  processingCostPerTonne: number | null;
  revenuePerTonneRecovered: number | null;
  avoidedEmissionsKgCO2ePerKg: number | null; // documented substitution credit
  directEmissionsKgCO2ePerKg: number | null; // direct process emissions
  notes: string;
  limitations: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;

  // Waste inputs
  inputMass: number; // in inputMassUnit
  inputMassUnit: MassUnit;
  inputMassKg: number; // normalized internal unit

  // Material composition
  composition: CompositionModel;

  // Logistics & Cost basis
  transportDistance: number;
  transportDistanceUnit: DistanceUnit;
  transportDistanceKm: number;
  currency: CurrencyCode;
  priceYear: number;
  transportCostPerTonneKm: number | null; // e.g. 0.12 EUR / tonne-km
  freightEmissionFactorKgCO2ePerTonneKm: number | null; // e.g. 0.092 kg CO2e / t-km
  gridEmissionFactorKgCO2ePerKWh: number | null; // e.g. 0.38 kg CO2e / kWh

  // Selected pathways configuration
  pathways: PathwayConfig[];

  // Data source mode
  dataSourceMode: 'verified' | 'custom' | 'demo';
}

export interface PathwayCalculationResult {
  pathwayId: string;
  pathwayName: string;
  technologyDefinition: string;
  outputDescription: string;
  qualityTier: 'high' | 'medium' | 'downcycled';

  // Mass balance results (in kg)
  inputMassKg: number;
  recoveredMassKg: number;
  residualMassKg: number;
  lossMassKg: number;
  totalAccountedMassKg: number;
  massBalanceDifferenceKg: number;
  massBalanceErrorPercent: number;
  massBalanceStatus: ValidationStatus;
  massBalanceNotes: string[];

  // Cost results
  transportCost: number | null;
  processingCost: number | null;
  otherCost: number | null;
  grossCost: number | null;
  recoveredValue: number | null;
  netCost: number | null;
  costStatus: 'complete' | 'partial' | 'unavailable';
  costNotes: string[];

  // Environmental emissions (in kg CO2e)
  energyEmissionsKgCO2e: number | null;
  transportEmissionsKgCO2e: number | null;
  directProcessEmissionsKgCO2e: number | null;
  avoidedEmissionsKgCO2e: number | null;
  netEmissionsKgCO2e: number | null;
  emissionsStatus: 'complete' | 'partial' | 'unavailable';
  emissionsNotes: string[];

  // Provenance & Quality
  dataQualityBadge: DataClassification;
  parameterSources: { parameter: string; source: string; classification: DataClassification }[];
  limitations: string[];
}

export interface ScenarioCalculationRun {
  scenarioId: string;
  calculatedAt: string;
  modelVersion: string;
  inputMassKg: number;
  constituentMassesKg: {
    glassFiber: number;
    polymerResin: number;
    coreMaterial?: number;
    coatingsAndAdhesives?: number;
    metallicInserts?: number;
  };
  pathwayResults: Record<string, PathwayCalculationResult>;
  generalWarnings: string[];
}

export interface RankingCriterion {
  id: 'cost' | 'recovery' | 'emissions' | 'quality';
  label: string;
  description: string;
  weight: number; // 0 to 100
  direction: 'minimize' | 'maximize';
}

export interface PathwayRankScore {
  pathwayId: string;
  pathwayName: string;
  rank: number;
  compositeScore: number | null; // 0..100
  isFeasible: boolean;
  unfeasibleReason?: string;
  criterionScores: {
    criterionId: string;
    rawMetricValue: number | null;
    rawMetricUnit: string;
    normalizedScore: number | null; // 0..100
    weightedContribution: number | null;
    status: 'valid' | 'missing' | 'incompatible';
  }[];
  explanation: string;
  sensitivityCaveat: string;
}

export interface RankingResult {
  scores: PathwayRankScore[];
  isDefensible: boolean;
  defensibilityNotes: string[];
  weightsUsed: Record<string, number>;
  policyUsed: string;
}

export interface BreakEvenAnalysisResult {
  pathwayPair: [string, string];
  pathwayNames: [string, string];
  hasCrossover: boolean;
  breakEvenDistanceKm: number | null;
  isDistancePhysicallyFeasible: boolean;
  breakEvenSecondaryPricePerTonne: number | null;
  explanation: string;
  mathematicalDerivation: string;
}

export interface MonteCarloSimulationRun {
  numIterations: number;
  seed: number;
  parameterDistributions: {
    parameterName: string;
    distribution: 'triangular' | 'uniform';
    min: number;
    mode: number;
    max: number;
    unit: string;
  }[];
  pathwayPercentiles: Record<string, {
    netCost: { p10: number; p50: number; p90: number };
    recoveredMassKg: { p10: number; p50: number; p90: number };
    rankProbabilities: { rank1Pct: number; rank2Pct: number; rank3Pct: number };
  }>;
  insights: string[];
}
