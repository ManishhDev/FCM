export type CompositeDataProvenance =
  | 'measured'
  | 'published_reference'
  | 'predicted'
  | 'illustrative'
  | 'not_tested';

export type RecyclingFeedstockId = 'mechanical' | 'thermal' | 'cement_kiln';

export type ProductFamilyId =
  | 'composite_panel'
  | 'printed_3d_part'
  | 'cement_composite';

export type ManufacturingMethodId =
  | 'compression_moulding'
  | 'fdm_3d_printing'
  | 'wet_cast_curing';

export type MatrixMaterialId =
  | 'epoxy_virgin'
  | 'unsaturated_polyester'
  | 'pla_biopolymer'
  | 'portland_cement_mortar';

export type FibreOrientationId =
  | 'random_2d'
  | 'random_3d'
  | 'quasi_isotropic'
  | 'aligned_raster'
  | 'particulate';

export type InterfaceQualityId =
  | 'poor_untreated'
  | 'moderate_cleaned'
  | 'good_silane_coupled';

export type MaterialTestId =
  | 'tensile'
  | 'compression'
  | 'flexural'
  | 'impact'
  | 'shear'
  | 'water_absorption'
  | 'hardness_density'
  | 'thermal_fatigue';

export interface FeedstockCharacterisation {
  pathwayId: RecyclingFeedstockId;
  pathwayName: string;
  eligibleForCompositeProduct: boolean;
  ineligibleReason?: string;
  fibreForm: string;
  particleOrFibreSizeMm: string;
  avgAspectRatio: number;
  strengthRetentionPct: number;
  residualResinPct: number;
  surfaceCondition: string;
  moistureSensitivity: string;
  recommendedProducts: ProductFamilyId[];
  notes: string;
}

export interface ProductFamilySpec {
  id: ProductFamilyId;
  name: string;
  subtitle: string;
  manufacturingSummary: string;
  typicalApplications: string[];
  compatibleFeedstocks: RecyclingFeedstockId[];
  defaultMatrix: MatrixMaterialId;
  defaultMethod: ManufacturingMethodId;
  mandatoryTests: MaterialTestId[];
  optionalTests: MaterialTestId[];
  requirements: {
    id: string;
    label: string;
    propertyKey: keyof CompositeMechanicalProperties;
    operator: '>=' | '<=';
    threshold: number;
    unit: string;
    rationale: string;
  }[];
  referenceStudyNote: string;
}

export interface CompositeMechanicalProperties {
  tensileStrengthMPa: number;
  tensileModulusGPa: number;
  elongationAtBreakPct: number;
  compressiveStrengthMPa: number;
  compressiveModulusGPa: number;
  flexuralStrengthMPa: number;
  flexuralModulusGPa: number;
  impactStrengthKJm2: number;
  impactEnergyJ: number;
  shearStrengthMPa: number | null;
  waterAbsorption24hPct: number;
  densityGcm3: number;
  shoreDHardness: number;
  glassTransitionTempC: number | null;
}

export interface PropertyModelBreakdown {
  modelName: string;
  fiberDensityGcm3: number;
  matrixDensityGcm3: number;
  fiberVolumeFraction: number;
  orientationFactorEtaO: number;
  lengthFactorEtaL: number;
  interfaceFactorEtaI: number;
  voidKnockdownFactor: number;
  equationsUsed: string[];
  limitations: string[];
}

export interface CompositeFormulation {
  id: string;
  name: string;
  sourcePathwayId: RecyclingFeedstockId;
  targetProduct: ProductFamilyId;
  matrixId: MatrixMaterialId;
  reinforcementMassPct: number;
  matrixMassPct: number;
  fibreOrientation: FibreOrientationId;
  voidContentPct: number;
  interfaceQuality: InterfaceQualityId;
  manufacturingMethod: ManufacturingMethodId;
  processTempC: number;
  mouldingPressureMPa: number;
  cycleTimeMin: number;
  propertyBasis: CompositeDataProvenance;
  referenceLabel: string;
  properties: CompositeMechanicalProperties;
  modelBreakdown: PropertyModelBreakdown;
}

export interface SpecimenGeometry {
  widthMm: number;
  thicknessMm: number;
  gaugeLengthMm: number;
  supportSpanMm: number;
  notchDepthMm: number;
}

export interface CurvePoint {
  x: number;
  y: number;
  label?: string;
}

export interface UploadedLabPoint {
  extensionMm: number;
  loadN: number;
  strainPct: number;
  stressMPa: number;
}

export interface TestSimulationResult {
  testId: MaterialTestId;
  testName: string;
  astmStandard: string;
  specimenId: string;
  provenance: CompositeDataProvenance;
  modelDescription: string;
  validityNote: string;
  isApplicable: boolean;
  applicabilityWarning?: string;
  appliedLoadN: number;
  primaryMetricLabel: string;
  primaryMetricValue: number;
  primaryMetricUnit: string;
  secondaryMetrics: {
    label: string;
    value: string;
    unit: string;
  }[];
  strengthLimitLoadN: number | null;
  safetyFactor: number | null;
  statusText: string;
  isFailure: boolean;
  predictedFailureMode: string;
  xAxisLabel: string;
  yAxisLabel: string;
  modelCurve: CurvePoint[];
  operatingPoint: CurvePoint | null;
  limitLineY: number | null;
  limitLineLabel: string | null;
  measuredOverlayCurve?: CurvePoint[];
  measuredSummary?: {
    peakStrengthMPa: number;
    modulusGPa: number;
    breakStrainPct: number;
    pointCount: number;
  };
}

export interface ApplicationSuitabilityCheck {
  requirementId: string;
  label: string;
  targetText: string;
  actualValue: number | null;
  unit: string;
  provenance: CompositeDataProvenance;
  passed: boolean | null;
  rationale: string;
}

export interface ApplicationEvaluationReport {
  product: ProductFamilySpec;
  checks: ApplicationSuitabilityCheck[];
  passedCount: number;
  totalCount: number;
  hasMeasuredEvidence: boolean;
  statusCategory:
    | 'ineligible_feedstock'
    | 'insufficient_data'
    | 'does_not_meet'
    | 'research_candidate'
    | 'preliminary_bench_pass';
  statusLabel: string;
  recommendationSummary: string;
  limitations: string[];
  proposedImprovements: string[];
}
