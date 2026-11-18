import {
  ApplicationEvaluationReport,
  CompositeDataProvenance,
  CompositeFormulation,
  CompositeMechanicalProperties,
  CurvePoint,
  FeedstockCharacterisation,
  FibreOrientationId,
  InterfaceQualityId,
  ManufacturingMethodId,
  MatrixMaterialId,
  ProductFamilyId,
  ProductFamilySpec,
  PropertyModelBreakdown,
  RecyclingFeedstockId,
  SpecimenGeometry,
  TestSimulationResult,
  UploadedLabPoint,
} from '../types/composite';

export const FEEDSTOCK_CHARACTERISATIONS: Record<
  RecyclingFeedstockId,
  FeedstockCharacterisation
> = {
  mechanical: {
    pathwayId: 'mechanical',
    pathwayName: 'Mechanical Shredding & Milling',
    eligibleForCompositeProduct: true,
    fibreForm: 'Milled GFRP short-fiber bundles & resin-rich powder clusters',
    particleOrFibreSizeMm: '0.5 – 4.0 mm (granulated fraction)',
    avgAspectRatio: 12,
    strengthRetentionPct: 38,
    residualResinPct: 32,
    surfaceCondition: 'Uncoupled fracture surfaces with residual cured epoxy fragments',
    moistureSensitivity: 'Low–Moderate (micro-fissures at milled resin-fiber boundary)',
    recommendedProducts: ['composite_panel', 'cement_composite'],
    notes:
      'High mass yield (~88%) with low energy demand, but mechanical attrition cuts fiber length and leaves cured thermoset resin bonded to glass surfaces, limiting tensile reinforcement efficiency.',
  },
  thermal: {
    pathwayId: 'thermal',
    pathwayName: 'Thermal Pyrolysis / Fluidized Bed (450–500°C)',
    eligibleForCompositeProduct: true,
    fibreForm: 'Discontinuous clean reclaimed E-glass fibers (fluff / chopped)',
    particleOrFibreSizeMm: '6.0 – 15.0 mm (chopped fiber length)',
    avgAspectRatio: 380,
    strengthRetentionPct: 56,
    residualResinPct: 2.5,
    surfaceCondition: 'Sizing stripped by thermal decomposition; trace surface char (<3%)',
    moistureSensitivity: 'Moderate (requires silane re-sizing for optimal polymer wetting)',
    recommendedProducts: ['composite_panel', 'printed_3d_part', 'cement_composite'],
    notes:
      'Removes thermoset matrix to liberate discrete glass fibers suitable for polymer compounding and FDM filament extrusion, though high-temperature exposure reduces virgin E-glass tensile strength by 40–50%.',
  },
  cement_kiln: {
    pathwayId: 'cement_kiln',
    pathwayName: 'Cement-Kiln Co-Processing',
    eligibleForCompositeProduct: false,
    ineligibleReason:
      'Cement-kiln co-processing oxidizes the polymer resin for thermal energy and chemically fuses glass mineral oxides (SiO2, CaO, Al2O3) into Portland clinker at ~1,450°C. No discrete glass fibers or GFRP recyclate remain to formulate a composite product.',
    fibreForm: 'None (destroyed in rotary kiln; converted into clinker mineral phase)',
    particleOrFibreSizeMm: 'N/A (fused into clinker silicates)',
    avgAspectRatio: 1,
    strengthRetentionPct: 0,
    residualResinPct: 0,
    surfaceCondition: 'Mineralized clinker substitute — not a composite reinforcement',
    moistureSensitivity: 'N/A',
    recommendedProducts: [],
    notes:
      'Select Mechanical Recycling or Thermal Pyrolysis as the upstream feedstock to design and test a recycled composite end-product.',
  },
};

export interface MatrixSpec {
  id: MatrixMaterialId;
  name: string;
  densityGcm3: number;
  tensileStrengthMPa: number;
  tensileModulusGPa: number;
  compressiveStrengthMPa: number;
  flexuralStrengthMPa: number;
  elongationAtBreakPct: number;
  impactStrengthKJm2: number;
  waterAbsorption24hPct: number;
  shoreD: number;
  tgCelsius: number | null;
  defaultProcessTempC: number;
  defaultPressureMPa: number;
  defaultCycleMin: number;
}

export const MATRIX_SPECS: Record<MatrixMaterialId, MatrixSpec> = {
  epoxy_virgin: {
    id: 'epoxy_virgin',
    name: 'Virgin Epoxy Thermoset Resin (Infusion/Moulding Grade)',
    densityGcm3: 1.18,
    tensileStrengthMPa: 62,
    tensileModulusGPa: 3.1,
    compressiveStrengthMPa: 105,
    flexuralStrengthMPa: 96,
    elongationAtBreakPct: 3.4,
    impactStrengthKJm2: 14,
    waterAbsorption24hPct: 0.25,
    shoreD: 82,
    tgCelsius: 112,
    defaultProcessTempC: 120,
    defaultPressureMPa: 4.5,
    defaultCycleMin: 35,
  },
  unsaturated_polyester: {
    id: 'unsaturated_polyester',
    name: 'Unsaturated Polyester Resin (BMC/SMC Grade)',
    densityGcm3: 1.21,
    tensileStrengthMPa: 48,
    tensileModulusGPa: 3.3,
    compressiveStrengthMPa: 95,
    flexuralStrengthMPa: 82,
    elongationAtBreakPct: 2.1,
    impactStrengthKJm2: 10,
    waterAbsorption24hPct: 0.35,
    shoreD: 80,
    tgCelsius: 94,
    defaultProcessTempC: 135,
    defaultPressureMPa: 6.0,
    defaultCycleMin: 18,
  },
  pla_biopolymer: {
    id: 'pla_biopolymer',
    name: 'Polylactic Acid (PLA) Extrusion Biopolymer',
    densityGcm3: 1.24,
    tensileStrengthMPa: 50,
    tensileModulusGPa: 3.2,
    compressiveStrengthMPa: 68,
    flexuralStrengthMPa: 76,
    elongationAtBreakPct: 3.8,
    impactStrengthKJm2: 12,
    waterAbsorption24hPct: 0.55,
    shoreD: 79,
    tgCelsius: 60,
    defaultProcessTempC: 210,
    defaultPressureMPa: 0.2,
    defaultCycleMin: 95,
  },
  portland_cement_mortar: {
    id: 'portland_cement_mortar',
    name: 'CEM I 42.5R Portland Cement Mortar (w/c = 0.45)',
    densityGcm3: 2.12,
    tensileStrengthMPa: 3.8,
    tensileModulusGPa: 22.5,
    compressiveStrengthMPa: 42.0,
    flexuralStrengthMPa: 6.8,
    elongationAtBreakPct: 0.12,
    impactStrengthKJm2: 3.5,
    waterAbsorption24hPct: 4.2,
    shoreD: 88,
    tgCelsius: null,
    defaultProcessTempC: 23,
    defaultPressureMPa: 0.5,
    defaultCycleMin: 1440,
  },
};

export const PRODUCT_FAMILIES: Record<ProductFamilyId, ProductFamilySpec> = {
  composite_panel: {
    id: 'composite_panel',
    name: 'Recycled GFRP Composite Panel',
    subtitle: 'Compression-moulded flat structural/semi-structural sheet',
    manufacturingSummary:
      'Dry-blend or wet-impregnate recovered GFRP reinforcement with thermoset binder and hot-press compression mould at 120–140°C.',
    typicalApplications: [
      'Indoor non-structural partitions & acoustic backing boards',
      'Industrial equipment protective covers & electrical enclosures',
      'Modular temporary flooring & utility access covers',
    ],
    compatibleFeedstocks: ['mechanical', 'thermal'],
    defaultMatrix: 'epoxy_virgin',
    defaultMethod: 'compression_moulding',
    mandatoryTests: ['tensile', 'flexural', 'impact', 'water_absorption', 'hardness_density'],
    optionalTests: ['compression', 'shear', 'thermal_fatigue'],
    requirements: [
      {
        id: 'req-panel-tensile',
        label: 'Minimum Tensile Strength (ASTM D3039 / D638)',
        propertyKey: 'tensileStrengthMPa',
        operator: '>=',
        threshold: 40,
        unit: 'MPa',
        rationale: 'Ensures safe handling, fastener pull-through resistance, and partition rigidity.',
      },
      {
        id: 'req-panel-flex',
        label: 'Minimum Flexural Strength (ASTM D7264 / D790)',
        propertyKey: 'flexuralStrengthMPa',
        operator: '>=',
        threshold: 75,
        unit: 'MPa',
        rationale: 'Controls out-of-plane bending resistance for mounted panel spans.',
      },
      {
        id: 'req-panel-impact',
        label: 'Minimum Charpy/Izod Impact Strength (ASTM D256)',
        propertyKey: 'impactStrengthKJm2',
        operator: '>=',
        threshold: 12,
        unit: 'kJ/m²',
        rationale: 'Protects against accidental tool drops or maintenance impacts.',
      },
      {
        id: 'req-panel-water',
        label: 'Maximum 24h Water Absorption (ASTM D570)',
        propertyKey: 'waterAbsorption24hPct',
        operator: '<=',
        threshold: 1.5,
        unit: '% mass',
        rationale: 'Prevents dimensional swelling and interfacial hydrolysis in humid interiors.',
      },
      {
        id: 'req-panel-density',
        label: 'Maximum Bulk Density (ASTM D792)',
        propertyKey: 'densityGcm3',
        operator: '<=',
        threshold: 1.85,
        unit: 'g/cm³',
        rationale: 'Maintains lightweight installability compared to mineral fiberboard.',
      },
    ],
    referenceStudyNote:
      'Comparable to Dieffenbacher / PMC compression-moulded recycled GFRP panel formulations (30–45 wt% recyclate in thermoset resin).',
  },
  printed_3d_part: {
    id: 'printed_3d_part',
    name: '3D-Printed r-GFRP/PLA Composite Part',
    subtitle: 'FDM/FFF filament extruded with short recycled wind-blade fibers',
    manufacturingSummary:
      'Compound thermally reclaimed short glass fibers (10–25 wt%) into dried PLA pellets, extrude 1.75 mm filament, and print via 0.6 mm hardened steel nozzle at 210°C.',
    typicalApplications: [
      'Non-safety-critical drone/sensor brackets & tooling jigs',
      'Custom instrument housings & cable routing clips',
      'Rapid-prototyped aerodynamic fairings for low-load rigs',
    ],
    compatibleFeedstocks: ['thermal'],
    defaultMatrix: 'pla_biopolymer',
    defaultMethod: 'fdm_3d_printing',
    mandatoryTests: ['tensile', 'flexural', 'impact', 'hardness_density', 'thermal_fatigue'],
    optionalTests: ['compression', 'water_absorption'],
    requirements: [
      {
        id: 'req-3d-tensile',
        label: 'Minimum Tensile Strength (ASTM D638 Type I)',
        propertyKey: 'tensileStrengthMPa',
        operator: '>=',
        threshold: 45,
        unit: 'MPa',
        rationale: 'Required for functional mounting brackets and fastener boss integrity.',
      },
      {
        id: 'req-3d-mod',
        label: 'Minimum Tensile Modulus (Stiffness)',
        propertyKey: 'tensileModulusGPa',
        operator: '>=',
        threshold: 4.5,
        unit: 'GPa',
        rationale: 'Demonstrates measurable stiffening benefit over neat unreinforced PLA (~3.2 GPa).',
      },
      {
        id: 'req-3d-flex',
        label: 'Minimum Flexural Strength (ASTM D790)',
        propertyKey: 'flexuralStrengthMPa',
        operator: '>=',
        threshold: 70,
        unit: 'MPa',
        rationale: 'Supports cantilevered bracket geometries printed in XY raster.',
      },
      {
        id: 'req-3d-tg',
        label: 'Minimum Glass Transition Temp (ASTM D7028)',
        propertyKey: 'glassTransitionTempC',
        operator: '>=',
        threshold: 55,
        unit: '°C',
        rationale: 'Establishes safe upper indoor service temperature before PLA softening.',
      },
    ],
    referenceStudyNote:
      'Informed by Rahimizadeh et al. / MDPI studies on recycled wind turbine blade glass fibers compounded with PLA for FFF additive manufacturing.',
  },
  cement_composite: {
    id: 'cement_composite',
    name: 'GFRP-Reinforced Cementitious Paving / Precast Block',
    subtitle: 'Non-structural hydraulic mortar incorporating processed GFRP recyclate',
    manufacturingSummary:
      'Blend 5–20 wt% graded GFRP recyclate into Portland cement mortar (w/c = 0.45) with superplasticizer, vibrate-cast into moulds, and moist-cure for 28 days.',
    typicalApplications: [
      'Pedestrian walkway paving tiles & promenade blocks',
      'Non-structural precast drainage curbs & acoustic barriers',
      'Research concrete blocks for landfill diversion',
    ],
    compatibleFeedstocks: ['mechanical', 'thermal'],
    defaultMatrix: 'portland_cement_mortar',
    defaultMethod: 'wet_cast_curing',
    mandatoryTests: ['compression', 'flexural', 'water_absorption', 'hardness_density'],
    optionalTests: ['impact'],
    requirements: [
      {
        id: 'req-cem-comp',
        label: 'Minimum 28-Day Compressive Strength (ASTM C109 / D6641)',
        propertyKey: 'compressiveStrengthMPa',
        operator: '>=',
        threshold: 30,
        unit: 'MPa',
        rationale: 'Standard minimum compressive bearing capacity for light pedestrian paving blocks.',
      },
      {
        id: 'req-cem-flex',
        label: 'Minimum Flexural Modulus of Rupture',
        propertyKey: 'flexuralStrengthMPa',
        operator: '>=',
        threshold: 5.5,
        unit: 'MPa',
        rationale: 'Resists crack propagation under edge wheel or pedestrian point loading.',
      },
      {
        id: 'req-cem-water',
        label: 'Maximum 24h Water Absorption (ASTM D570 / C140)',
        propertyKey: 'waterAbsorption24hPct',
        operator: '<=',
        threshold: 6.0,
        unit: '% mass',
        rationale: 'Limits freeze-thaw spalling and alkali-silica moisture ingress.',
      },
    ],
    referenceStudyNote:
      'Formulation and test standards differ substantially from polymer composites; high recyclate loading (>15%) typically lowers compressive strength due to air entrainment.',
  },
};

export interface PublishedBenchmark {
  id: string;
  label: string;
  product: ProductFamilyId;
  feedstock: RecyclingFeedstockId;
  matrix: MatrixMaterialId;
  reinforcementPct: number;
  citation: string;
  conditions: string;
  properties: CompositeMechanicalProperties;
}

export const PUBLISHED_COMPOSITE_BENCHMARKS: PublishedBenchmark[] = [
  {
    id: 'bench-panel-mech',
    label: 'Published Benchmark: 35 wt% Milled r-GFRP / Epoxy Panel (Compression Moulded)',
    product: 'composite_panel',
    feedstock: 'mechanical',
    matrix: 'epoxy_virgin',
    reinforcementPct: 35,
    citation: 'Papadakis et al., Composites Part B (2024) & Palmer et al., Composites Part A',
    conditions: 'Granulate 0.5–3 mm, compression moulded 130°C at 5 MPa, 3.8% measured porosity',
    properties: {
      tensileStrengthMPa: 48.5,
      tensileModulusGPa: 7.4,
      elongationAtBreakPct: 0.72,
      compressiveStrengthMPa: 112,
      compressiveModulusGPa: 7.1,
      flexuralStrengthMPa: 88.0,
      flexuralModulusGPa: 7.8,
      impactStrengthKJm2: 14.5,
      impactEnergyJ: 0.75,
      shearStrengthMPa: 24.0,
      waterAbsorption24hPct: 0.92,
      densityGcm3: 1.54,
      shoreDHardness: 84,
      glassTransitionTempC: 110,
    },
  },
  {
    id: 'bench-3d-thermal',
    label: 'Published Benchmark: 20 wt% Thermal r-GFRP / PLA 3D-Printed Specimen (FDM)',
    product: 'printed_3d_part',
    feedstock: 'thermal',
    matrix: 'pla_biopolymer',
    reinforcementPct: 20,
    citation: 'Rahimizadeh et al., MDPI / Additive Manufacturing Wind Blade r-GF-PLA Studies',
    conditions: '480°C fluidized-bed reclaimed fiber (20 wt%), 0° raster orientation, 210°C nozzle',
    properties: {
      tensileStrengthMPa: 54.2,
      tensileModulusGPa: 5.6,
      elongationAtBreakPct: 1.35,
      compressiveStrengthMPa: 74.0,
      compressiveModulusGPa: 5.2,
      flexuralStrengthMPa: 84.5,
      flexuralModulusGPa: 5.4,
      impactStrengthKJm2: 11.8,
      impactEnergyJ: 0.61,
      shearStrengthMPa: null,
      waterAbsorption24hPct: 0.68,
      densityGcm3: 1.38,
      shoreDHardness: 82,
      glassTransitionTempC: 61,
    },
  },
  {
    id: 'bench-cement-mech',
    label: 'Published Benchmark: 10 wt% Milled r-GFRP / Portland Mortar Block (28-Day Cure)',
    product: 'cement_composite',
    feedstock: 'mechanical',
    matrix: 'portland_cement_mortar',
    reinforcementPct: 10,
    citation: 'Jensen & Thomas, Resources, Conservation & Recycling (2024) / GFRP Mortar Trials',
    conditions: 'CEM I 42.5R mortar, w/c = 0.45, 10 wt% fine milled GFRP (<2 mm), 28d moist cure',
    properties: {
      tensileStrengthMPa: 4.4,
      tensileModulusGPa: 20.1,
      elongationAtBreakPct: 0.08,
      compressiveStrengthMPa: 35.8,
      compressiveModulusGPa: 19.8,
      flexuralStrengthMPa: 7.4,
      flexuralModulusGPa: 19.5,
      impactStrengthKJm2: 5.2,
      impactEnergyJ: 0.27,
      shearStrengthMPa: null,
      waterAbsorption24hPct: 4.6,
      densityGcm3: 1.98,
      shoreDHardness: 86,
      glassTransitionTempC: null,
    },
  },
];

const ORIENTATION_FACTORS: Record<FibreOrientationId, { etaO: number; label: string }> = {
  random_2d: { etaO: 0.375, label: '2D In-Plane Random (Krenchel η₀ = 3/8)' },
  random_3d: { etaO: 0.2, label: '3D Random Dispersion (Krenchel η₀ = 1/5)' },
  quasi_isotropic: { etaO: 0.5, label: 'Quasi-Isotropic Layered Mat (η₀ = 0.50)' },
  aligned_raster: { etaO: 0.78, label: 'Flow/FDM Raster Aligned (η₀ = 0.78)' },
  particulate: { etaO: 0.14, label: 'Particulate / Low-AR Filler (η₀ = 0.14)' },
};

const INTERFACE_FACTORS: Record<InterfaceQualityId, { etaI: number; label: string }> = {
  poor_untreated: { etaI: 0.55, label: 'Untreated / Residual Resin Contamination (ηᵢ = 0.55)' },
  moderate_cleaned: { etaI: 0.76, label: 'Washed / Mechanically Clean Surface (ηᵢ = 0.76)' },
  good_silane_coupled: { etaI: 0.94, label: 'Silane Coupling Agent Re-Sized (ηᵢ = 0.94)' },
};

/**
 * Analytical Material Property Estimation Engine
 * Explicitly documents all assumptions, fiber volume fraction, Halpin-Tsai / Modified Rule-of-Mixtures,
 * void knockdown (1 - Vv)^2, and interface efficiency.
 */
export function estimateCompositeProperties(params: {
  feedstockId: RecyclingFeedstockId;
  matrixId: MatrixMaterialId;
  reinforcementMassPct: number;
  orientation: FibreOrientationId;
  voidContentPct: number;
  interfaceQuality: InterfaceQualityId;
  targetProduct: ProductFamilyId;
}): { properties: CompositeMechanicalProperties; breakdown: PropertyModelBreakdown } {
  const {
    feedstockId,
    matrixId,
    reinforcementMassPct,
    orientation,
    voidContentPct,
    interfaceQuality,
    targetProduct,
  } = params;

  const matrix = MATRIX_SPECS[matrixId];
  const feedstock = FEEDSTOCK_CHARACTERISATIONS[feedstockId];

  const wf = Math.max(0.05, Math.min(0.7, reinforcementMassPct / 100));
  const wm = 1 - wf;
  const vv = Math.max(0, Math.min(0.25, voidContentPct / 100));

  // Effective density of recovered reinforcement (milled GFRP ~2.05 due to 32% attached resin; clean pyrolyzed E-glass ~2.54)
  const fiberDensity = feedstockId === 'thermal' ? 2.54 : 2.05;
  const effectiveFiberModulusGPa = feedstockId === 'thermal' ? 68.0 : 32.0; // virgin E-glass is 72 GPa
  const effectiveFiberStrengthMPa =
    feedstockId === 'thermal' ? 1150 * (feedstock.strengthRetentionPct / 100) : 420 * (feedstock.strengthRetentionPct / 100);

  // Theoretical composite density and fiber volume fraction Vf
  const rhoTheoretical = 1 / (wf / fiberDensity + wm / matrix.densityGcm3);
  const rhoActual = rhoTheoretical * (1 - vv);
  const vf = ((wf / fiberDensity) / (wf / fiberDensity + wm / matrix.densityGcm3)) * (1 - vv);

  const etaO = ORIENTATION_FACTORS[orientation].etaO;
  const etaL = feedstockId === 'thermal' ? 0.82 : 0.42; // Cox shear-lag length efficiency
  const etaI = INTERFACE_FACTORS[interfaceQuality].etaI;
  const voidKnockdown = Math.pow(1 - vv, 2);

  // Special physical behavior for cementitious matrix (brittle hydraulic mortar)
  if (matrixId === 'portland_cement_mortar') {
    // Excessive polymer/GFRP recyclate entrains air & reduces cement hydration continuity
    const compressivePenalty = Math.max(0.52, 1 - wf * 1.45 - vv * 1.8);
    const compressiveStrength = Number((matrix.compressiveStrengthMPa * compressivePenalty).toFixed(1));
    const flexuralBoost = 1 + wf * 1.2 * etaI - vv * 1.5;
    const flexuralStrength = Number(Math.max(3.5, matrix.flexuralStrengthMPa * flexuralBoost).toFixed(2));
    const tensileStrength = Number((flexuralStrength * 0.58).toFixed(2));
    const modulusGPa = Number((matrix.tensileModulusGPa * (1 - wf * 0.65) * (1 - vv)).toFixed(2));
    const waterAbs = Number((matrix.waterAbsorption24hPct + wf * 4.5 + vv * 28).toFixed(2));

    return {
      properties: {
        tensileStrengthMPa: tensileStrength,
        tensileModulusGPa: modulusGPa,
        elongationAtBreakPct: Number(((tensileStrength / (modulusGPa * 1000)) * 100).toFixed(3)),
        compressiveStrengthMPa: compressiveStrength,
        compressiveModulusGPa: Number((modulusGPa * 0.98).toFixed(2)),
        flexuralStrengthMPa: flexuralStrength,
        flexuralModulusGPa: Number((modulusGPa * 0.96).toFixed(2)),
        impactStrengthKJm2: Number((matrix.impactStrengthKJm2 * (1 + wf * 3.8 * etaI)).toFixed(2)),
        impactEnergyJ: Number((matrix.impactStrengthKJm2 * (1 + wf * 3.8 * etaI) * 0.052).toFixed(2)),
        shearStrengthMPa: null,
        waterAbsorption24hPct: waterAbs,
        densityGcm3: Number(rhoActual.toFixed(3)),
        shoreDHardness: Math.round(matrix.shoreD - wf * 12),
        glassTransitionTempC: null,
      },
      breakdown: {
        modelName: 'Cementitious Composite Void-Entrainment & Fiber-Bridging Model',
        fiberDensityGcm3: fiberDensity,
        matrixDensityGcm3: matrix.densityGcm3,
        fiberVolumeFraction: Number(vf.toFixed(3)),
        orientationFactorEtaO: etaO,
        lengthFactorEtaL: etaL,
        interfaceFactorEtaI: etaI,
        voidKnockdownFactor: Number(voidKnockdown.toFixed(3)),
        equationsUsed: [
          'ρ_c = (1 - V_v) · [w_f/ρ_f + (1 - w_f)/ρ_m]⁻¹',
          'σ_c,comp = σ_m,comp · max(0.52, 1 - 1.45·w_f - 1.8·V_v)',
          'σ_f = σ_m,flex · (1 + 1.2·w_f·ηᵢ - 1.5·V_v)',
        ],
        limitations: [
          'Cementitious mixes do not follow polymer Rule-of-Mixtures.',
          'Alkali attack on unsized glass fibers may degrade long-term flexural toughness unless AR-glass or pozzolanic silica fume is added.',
        ],
      },
    };
  }

  // Polymer Matrix Composite: Modified Rule-of-Mixtures (MROM)
  const vm = Math.max(0, 1 - vf - vv);
  const tensileModulusGPa = Number(
    ((etaO * etaL * effectiveFiberModulusGPa * vf + matrix.tensileModulusGPa * vm) * voidKnockdown).toFixed(2)
  );

  // Modified Kelly-Tyson tensile strength with crowding penalty at high wf (>45%)
  const crowdingFactor = wf > 0.45 ? Math.max(0.65, 1 - (wf - 0.45) * 1.4) : 1.0;
  const fiberContributionMPa = etaO * etaL * etaI * effectiveFiberStrengthMPa * vf * crowdingFactor;
  const matrixAtFiberStrainMPa = matrix.tensileStrengthMPa * vm * 0.72;
  const tensileStrengthMPa = Number(
    Math.max(12, (fiberContributionMPa + matrixAtFiberStrainMPa) * voidKnockdown).toFixed(2)
  );

  const elongationAtBreakPct = Number(
    Math.max(0.25, ((tensileStrengthMPa / (tensileModulusGPa * 1000)) * 100) * 1.05).toFixed(3)
  );

  const flexuralStrengthMPa = Number((tensileStrengthMPa * 1.62 * (targetProduct === 'composite_panel' ? 1.05 : 0.96)).toFixed(2));
  const flexuralModulusGPa = Number((tensileModulusGPa * 0.95).toFixed(2));
  const compressiveStrengthMPa = Number((matrix.compressiveStrengthMPa * (1 + vf * 0.85 * etaI) * voidKnockdown).toFixed(2));
  const compressiveModulusGPa = Number((tensileModulusGPa * 0.94).toFixed(2));

  // Impact increases with fiber pull-out length (thermal) and decreases sharply with voids
  const pullOutGain = feedstockId === 'thermal' ? 1.45 : 1.15;
  const impactStrengthKJm2 = Number(
    (matrix.impactStrengthKJm2 * (1 + vf * pullOutGain * etaI) * voidKnockdown).toFixed(2)
  );
  const impactEnergyJ = Number((impactStrengthKJm2 * 0.052).toFixed(2)); // standard 13x4mm ASTM cross-section ~52 mm2

  const shearStrengthMPa =
    targetProduct === 'composite_panel'
      ? Number((tensileStrengthMPa * 0.48 * etaI).toFixed(2))
      : null; // Interlaminar shear is not applicable to FDM / particulate prints

  const waterAbsorption24hPct = Number(
    (matrix.waterAbsorption24hPct + vv * 16 + wf * (interfaceQuality === 'poor_untreated' ? 1.6 : 0.75)).toFixed(2)
  );

  const shoreDHardness = Math.min(95, Math.round(matrix.shoreD + vf * 12));

  return {
    properties: {
      tensileStrengthMPa,
      tensileModulusGPa,
      elongationAtBreakPct,
      compressiveStrengthMPa,
      compressiveModulusGPa,
      flexuralStrengthMPa,
      flexuralModulusGPa,
      impactStrengthKJm2,
      impactEnergyJ,
      shearStrengthMPa,
      waterAbsorption24hPct,
      densityGcm3: Number(rhoActual.toFixed(3)),
      shoreDHardness,
      glassTransitionTempC: matrix.tgCelsius,
    },
    breakdown: {
      modelName: 'Modified Rule-of-Mixtures (Krenchel + Kelly-Tyson + Void Knockdown)',
      fiberDensityGcm3: fiberDensity,
      matrixDensityGcm3: matrix.densityGcm3,
      fiberVolumeFraction: Number(vf.toFixed(3)),
      orientationFactorEtaO: etaO,
      lengthFactorEtaL: etaL,
      interfaceFactorEtaI: etaI,
      voidKnockdownFactor: Number(voidKnockdown.toFixed(3)),
      equationsUsed: [
        'V_f = [(w_f/ρ_f) / (w_f/ρ_f + (1 - w_f)/ρ_m)] · (1 - V_v)',
        'E_c = (η₀ · η_L · E_f · V_f + E_m · V_m) · (1 - V_v)²',
        'σ_c = (η₀ · η_L · ηᵢ · σ_f,eff · V_f + 0.72 · σ_m · V_m) · (1 - V_v)²',
      ],
      limitations: [
        'Analytical estimation only — assumes uniform dispersion and no resin-rich dry spots.',
        'True composite strength depends on fiber aspect ratio distribution, sizing chemistry, and mould consolidation.',
      ],
    },
  };
}

export function createDefaultFormulation(
  feedstockId: RecyclingFeedstockId = 'mechanical',
  productId: ProductFamilyId = 'composite_panel'
): CompositeFormulation {
  const effectiveFeedstock = feedstockId === 'cement_kiln' ? 'mechanical' : feedstockId;
  const product = PRODUCT_FAMILIES[productId];
  const matrixId = product.defaultMatrix;
  const matrix = MATRIX_SPECS[matrixId];
  const reinforcementMassPct =
    productId === 'composite_panel' ? 35 : productId === 'printed_3d_part' ? 20 : 10;
  const orientation: FibreOrientationId =
    productId === 'composite_panel'
      ? 'random_2d'
      : productId === 'printed_3d_part'
      ? 'aligned_raster'
      : 'particulate';
  const interfaceQuality: InterfaceQualityId =
    effectiveFeedstock === 'thermal' ? 'good_silane_coupled' : 'moderate_cleaned';
  const voidContentPct = productId === 'composite_panel' ? 3.5 : productId === 'printed_3d_part' ? 4.5 : 6.0;

  const est = estimateCompositeProperties({
    feedstockId: effectiveFeedstock,
    matrixId,
    reinforcementMassPct,
    orientation,
    voidContentPct,
    interfaceQuality,
    targetProduct: productId,
  });

  return {
    id: `form-${Date.now()}`,
    name: `${reinforcementMassPct}% r-GFRP ${product.name}`,
    sourcePathwayId: effectiveFeedstock,
    targetProduct: productId,
    matrixId,
    reinforcementMassPct,
    matrixMassPct: 100 - reinforcementMassPct,
    fibreOrientation: orientation,
    voidContentPct,
    interfaceQuality,
    manufacturingMethod: product.defaultMethod,
    processTempC: matrix.defaultProcessTempC,
    mouldingPressureMPa: matrix.defaultPressureMPa,
    cycleTimeMin: matrix.defaultCycleMin,
    propertyBasis: 'predicted',
    referenceLabel: est.breakdown.modelName,
    properties: est.properties,
    modelBreakdown: est.breakdown,
  };
}

/**
 * 1. Virtual Tensile Testing Machine (ASTM D3039 / D638)
 * Linear-elastic uniaxial model up to strength limit.
 */
export function simulateTensileTest(params: {
  geometry: SpecimenGeometry;
  modulusGPa: number;
  strengthLimitMPa: number;
  appliedLoadN: number;
  specimenId: string;
  provenance: CompositeDataProvenance;
  measuredPoints?: UploadedLabPoint[];
}): TestSimulationResult {
  const { geometry, modulusGPa, strengthLimitMPa, appliedLoadN, specimenId, provenance, measuredPoints } = params;
  const b = Math.max(1, geometry.widthMm);
  const h = Math.max(0.5, geometry.thicknessMm);
  const L0 = Math.max(10, geometry.gaugeLengthMm);
  const E_MPa = Math.max(0.1, modulusGPa) * 1000;
  const sigUlt = Math.max(1, strengthLimitMPa);

  const areaMm2 = b * h;
  const stressMPa = appliedLoadN / areaMm2;
  const strain = stressMPa / E_MPa;
  const strainPct = strain * 100;
  const elongationMm = strain * L0;
  const strengthLimitLoadN = sigUlt * areaMm2;
  const isFailure = stressMPa >= sigUlt;
  const safetyFactor = appliedLoadN > 0 ? strengthLimitLoadN / appliedLoadN : null;

  const maxStrainPct = (sigUlt / E_MPa) * 100;
  const modelCurve: CurvePoint[] = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    modelCurve.push({
      x: Number((maxStrainPct * frac).toFixed(4)),
      y: Number((sigUlt * frac).toFixed(2)),
    });
  }

  let measuredOverlayCurve: CurvePoint[] | undefined;
  let measuredSummary: TestSimulationResult['measuredSummary'];
  if (measuredPoints && measuredPoints.length >= 2) {
    measuredOverlayCurve = measuredPoints.map((p) => ({
      x: Number(p.strainPct.toFixed(4)),
      y: Number(p.stressMPa.toFixed(2)),
    }));
    const peak = Math.max(...measuredPoints.map((p) => p.stressMPa));
    const maxBreak = measuredPoints[measuredPoints.length - 1].strainPct;
    const midIdx = Math.max(1, Math.floor(measuredPoints.length * 0.4));
    const pMid = measuredPoints[midIdx];
    const p0 = measuredPoints[0];
    const dStrain = (pMid.strainPct - p0.strainPct) / 100;
    const modGPa = dStrain > 0 ? (pMid.stressMPa - p0.stressMPa) / dStrain / 1000 : modulusGPa;
    measuredSummary = {
      peakStrengthMPa: Number(peak.toFixed(2)),
      modulusGPa: Number(modGPa.toFixed(2)),
      breakStrainPct: Number(maxBreak.toFixed(3)),
      pointCount: measuredPoints.length,
    };
  }

  return {
    testId: 'tensile',
    testName: 'Uniaxial Tensile Test',
    astmStandard: b >= 20 ? 'ASTM D3039 (Polymer Composite)' : 'ASTM D638 (Molded Reinforced Plastic)',
    specimenId,
    provenance: measuredPoints && measuredPoints.length >= 2 ? 'measured' : provenance,
    modelDescription: 'Linear-elastic uniaxial Hookean stress–strain model (σ = F / A, ε = σ / E)',
    validityNote:
      'Idealized linear-elastic response up to the entered/modeled strength limit; does not simulate progressive matrix micro-cracking or post-failure fiber pull-out.',
    isApplicable: true,
    appliedLoadN,
    primaryMetricLabel: 'Tensile Stress (σₜ)',
    primaryMetricValue: Number(stressMPa.toFixed(2)),
    primaryMetricUnit: 'MPa',
    secondaryMetrics: [
      { label: 'Elastic Elongation (ΔL)', value: elongationMm.toFixed(3), unit: 'mm' },
      { label: 'Engineering Strain (ε)', value: strainPct.toFixed(3), unit: '%' },
      { label: 'Cross-Section Area (A)', value: areaMm2.toFixed(1), unit: 'mm²' },
      { label: 'Strength-Limit Load (Fₘₐₓ)', value: Math.round(strengthLimitLoadN).toLocaleString(), unit: 'N' },
    ],
    strengthLimitLoadN: Number(strengthLimitLoadN.toFixed(1)),
    safetyFactor: safetyFactor ? Number(safetyFactor.toFixed(2)) : null,
    statusText: isFailure ? 'FAILURE: Exceeds Tensile Strength Limit' : 'Below Strength Limit (Elastic Regime)',
    isFailure,
    predictedFailureMode: isFailure
      ? 'Brittle transverse matrix fracture with short-fiber pull-out across gauge section'
      : 'No failure — specimen remains within linear-elastic envelope',
    xAxisLabel: 'Engineering Strain (%)',
    yAxisLabel: 'Tensile Stress (MPa)',
    modelCurve,
    operatingPoint: {
      x: Number(Math.min(strainPct, maxStrainPct * 1.15).toFixed(4)),
      y: Number(stressMPa.toFixed(2)),
      label: isFailure ? 'Post-Limit State' : 'Current Load',
    },
    limitLineY: sigUlt,
    limitLineLabel: `Strength Limit: ${sigUlt.toFixed(1)} MPa`,
    measuredOverlayCurve,
    measuredSummary,
  };
}

/**
 * 2. Virtual Compression Testing Machine (ASTM D6641)
 * Evaluates crushing stress vs Euler buckling stability.
 */
export function simulateCompressionTest(params: {
  geometry: SpecimenGeometry;
  compressiveModulusGPa: number;
  compressiveStrengthMPa: number;
  appliedLoadN: number;
  specimenId: string;
  provenance: CompositeDataProvenance;
}): TestSimulationResult {
  const { geometry, compressiveModulusGPa, compressiveStrengthMPa, appliedLoadN, specimenId, provenance } = params;
  const b = Math.max(1, geometry.widthMm);
  const h = Math.max(0.5, geometry.thicknessMm);
  const L0 = Math.max(5, geometry.gaugeLengthMm);
  const E_MPa = Math.max(0.1, compressiveModulusGPa) * 1000;
  const sigC = Math.max(1, compressiveStrengthMPa);

  const areaMm2 = b * h;
  const minDim = Math.min(b, h);
  const maxDim = Math.max(b, h);
  const momentOfInertiaI = (maxDim * Math.pow(minDim, 3)) / 12;
  const K = 0.5; // Clamped-clamped ASTM D6641 hydraulic fixture factor
  const eulerBucklingLoadN = (Math.PI * Math.PI * E_MPa * momentOfInertiaI) / Math.pow(K * L0, 2);
  const crushingLoadN = sigC * areaMm2;
  const governingLimitLoadN = Math.min(crushingLoadN, eulerBucklingLoadN);
  const governingMode = eulerBucklingLoadN < crushingLoadN ? 'Euler Buckling' : 'Compressive Crushing / Kink-Band Shear';

  const stressMPa = appliedLoadN / areaMm2;
  const strain = stressMPa / E_MPa;
  const strainPct = strain * 100;
  const shorteningMm = strain * L0;
  const isFailure = appliedLoadN >= governingLimitLoadN;
  const limitStressMPa = governingLimitLoadN / areaMm2;
  const maxStrainPct = (limitStressMPa / E_MPa) * 100;

  const modelCurve: CurvePoint[] = [];
  for (let i = 0; i <= 20; i++) {
    const f = i / 20;
    modelCurve.push({
      x: Number((maxStrainPct * f).toFixed(4)),
      y: Number((limitStressMPa * f).toFixed(2)),
    });
  }

  return {
    testId: 'compression',
    testName: 'Combined Loading Compression Test',
    astmStandard: 'ASTM D6641 (Compressive Properties)',
    specimenId,
    provenance,
    modelDescription: 'Uniaxial compression paired with Euler column buckling check (P_cr = π²EI / (KL)²)',
    validityNote:
      'Monitors transition from material crushing (short unsupported gauge) to elastic global buckling (slender specimens).',
    isApplicable: true,
    appliedLoadN,
    primaryMetricLabel: 'Compressive Stress (σ_c)',
    primaryMetricValue: Number(stressMPa.toFixed(2)),
    primaryMetricUnit: 'MPa',
    secondaryMetrics: [
      { label: 'Axial Shortening (ΔL)', value: shorteningMm.toFixed(3), unit: 'mm' },
      { label: 'Compressive Strain', value: strainPct.toFixed(3), unit: '%' },
      { label: 'Crushing Limit Load', value: Math.round(crushingLoadN).toLocaleString(), unit: 'N' },
      { label: 'Euler Buckling Load (P_cr)', value: Math.round(eulerBucklingLoadN).toLocaleString(), unit: 'N' },
    ],
    strengthLimitLoadN: Number(governingLimitLoadN.toFixed(1)),
    safetyFactor: appliedLoadN > 0 ? Number((governingLimitLoadN / appliedLoadN).toFixed(2)) : null,
    statusText: isFailure ? `FAILURE: ${governingMode}` : 'Below Governing Compression Limit',
    isFailure,
    predictedFailureMode: isFailure
      ? `${governingMode} triggered at ${Math.round(governingLimitLoadN).toLocaleString()} N`
      : `Governing mechanism at limit would be ${governingMode}`,
    xAxisLabel: 'Compressive Strain (%)',
    yAxisLabel: 'Compressive Stress (MPa)',
    modelCurve,
    operatingPoint: {
      x: Number(Math.min(strainPct, maxStrainPct * 1.15).toFixed(4)),
      y: Number(stressMPa.toFixed(2)),
      label: 'Current Load',
    },
    limitLineY: Number(limitStressMPa.toFixed(2)),
    limitLineLabel: `${governingMode} Limit: ${limitStressMPa.toFixed(1)} MPa`,
  };
}

/**
 * 3. Virtual 3-Point Flexural Bending Machine (ASTM D7264 / D790)
 */
export function simulateFlexuralTest(params: {
  geometry: SpecimenGeometry;
  flexuralModulusGPa: number;
  flexuralStrengthMPa: number;
  appliedLoadN: number;
  specimenId: string;
  provenance: CompositeDataProvenance;
}): TestSimulationResult {
  const { geometry, flexuralModulusGPa, flexuralStrengthMPa, appliedLoadN, specimenId, provenance } = params;
  const b = Math.max(1, geometry.widthMm);
  const h = Math.max(0.5, geometry.thicknessMm);
  const L = Math.max(16, geometry.supportSpanMm);
  const E_MPa = Math.max(0.1, flexuralModulusGPa) * 1000;
  const sigF = Math.max(1, flexuralStrengthMPa);

  // 3-point bending: sigma_f = 3PL / (2bh^2), delta = PL^3 / (4Ebh^3)
  const flexStressMPa = (3 * appliedLoadN * L) / (2 * b * h * h);
  const deflectionMm = (appliedLoadN * Math.pow(L, 3)) / (4 * E_MPa * b * Math.pow(h, 3));
  const outerStrainPct = ((6 * deflectionMm * h) / (L * L)) * 100;

  const limitLoadN = (2 * b * h * h * sigF) / (3 * L);
  const maxDeflectionMm = (limitLoadN * Math.pow(L, 3)) / (4 * E_MPa * b * Math.pow(h, 3));
  const isFailure = appliedLoadN >= limitLoadN;

  const modelCurve: CurvePoint[] = [];
  for (let i = 0; i <= 20; i++) {
    const f = i / 20;
    modelCurve.push({
      x: Number((maxDeflectionMm * f).toFixed(3)),
      y: Number((limitLoadN * f).toFixed(1)),
    });
  }

  return {
    testId: 'flexural',
    testName: '3-Point Flexural Bending Test',
    astmStandard: 'ASTM D7264 / D790 (Flexural Properties)',
    specimenId,
    provenance,
    modelDescription: 'Euler–Bernoulli 3-point bending beam theory (σ_f = 3PL / 2bh², δ = PL³ / 4Ebh³)',
    validityNote:
      `Span-to-thickness ratio L/h = ${(L / h).toFixed(1)}:1 (ASTM recommends 16:1 or 32:1 to minimize transverse shear error).`,
    isApplicable: true,
    appliedLoadN,
    primaryMetricLabel: 'Max Flexural Stress (σ_f)',
    primaryMetricValue: Number(flexStressMPa.toFixed(2)),
    primaryMetricUnit: 'MPa',
    secondaryMetrics: [
      { label: 'Mid-Span Deflection (δ)', value: deflectionMm.toFixed(3), unit: 'mm' },
      { label: 'Outer-Fiber Strain (ε_f)', value: outerStrainPct.toFixed(3), unit: '%' },
      { label: 'Span-to-Thickness (L/h)', value: `${(L / h).toFixed(1)}:1`, unit: 'ratio' },
      { label: 'Failure Bending Load', value: Math.round(limitLoadN).toLocaleString(), unit: 'N' },
    ],
    strengthLimitLoadN: Number(limitLoadN.toFixed(1)),
    safetyFactor: appliedLoadN > 0 ? Number((limitLoadN / appliedLoadN).toFixed(2)) : null,
    statusText: isFailure ? 'FAILURE: Tensile-Face Flexural Fracture' : 'Elastic Beam Bending',
    isFailure,
    predictedFailureMode: isFailure
      ? 'Tensile-side bottom-face crack initiation propagating upward under central loading nose'
      : 'No fracture — neutral axis shear and outer-fiber bending remain elastic',
    xAxisLabel: 'Mid-Span Deflection δ (mm)',
    yAxisLabel: 'Applied Center Load P (N)',
    modelCurve,
    operatingPoint: {
      x: Number(Math.min(deflectionMm, maxDeflectionMm * 1.15).toFixed(3)),
      y: Number(appliedLoadN.toFixed(1)),
      label: 'Current Deflection',
    },
    limitLineY: Number(limitLoadN.toFixed(1)),
    limitLineLabel: `Flexural Failure Load: ${Math.round(limitLoadN)} N`,
  };
}

/**
 * 4. Virtual Impact Test (ASTM D256 Izod/Charpy / ASTM D7136 Drop-Weight)
 */
export function simulateImpactTest(params: {
  geometry: SpecimenGeometry;
  impactStrengthKJm2: number;
  strikerEnergyJ: number;
  specimenId: string;
  provenance: CompositeDataProvenance;
}): TestSimulationResult {
  const { geometry, impactStrengthKJm2, strikerEnergyJ, specimenId, provenance } = params;
  const b = Math.max(2, geometry.widthMm);
  const h = Math.max(1, geometry.thicknessMm);
  const notch = Math.min(b * 0.4, Math.max(0, geometry.notchDepthMm));

  const ligamentWidthMm = b - notch;
  const ligamentAreaMm2 = ligamentWidthMm * h;
  // Energy capacity (J) = impactStrength (kJ/m2) * Area (mm2) / 1000
  const specimenEnergyCapacityJ = (impactStrengthKJm2 * ligamentAreaMm2) / 1000;
  const absorbedEnergyJ = Math.min(strikerEnergyJ, specimenEnergyCapacityJ);
  const residualStrikerEnergyJ = Math.max(0, strikerEnergyJ - specimenEnergyCapacityJ);
  const isFractured = strikerEnergyJ >= specimenEnergyCapacityJ;
  const impactVelocityMs = Math.sqrt((2 * strikerEnergyJ) / 1.5); // assuming 1.5 kg effective striker mass

  // Impact energy vs ligament thickness curve
  const modelCurve: CurvePoint[] = [];
  for (let i = 0; i <= 20; i++) {
    const eIn = (Math.max(strikerEnergyJ, specimenEnergyCapacityJ * 1.5) * i) / 20;
    modelCurve.push({
      x: Number(eIn.toFixed(2)),
      y: Number(Math.min(eIn, specimenEnergyCapacityJ).toFixed(3)),
    });
  }

  return {
    testId: 'impact',
    testName: 'Pendulum / Drop-Weight Impact Test',
    astmStandard: notch > 0 ? 'ASTM D256 (Notched Izod/Charpy)' : 'ASTM D7136 (Unnotched Impact)',
    specimenId,
    provenance,
    modelDescription: 'Energy-balance impact fracture model (E_cap = a_cU · A_ligament)',
    validityNote:
      'Estimates total absorbed energy up to complete break; dynamic strain-rate stiffening and multi-delamination require instrumented drop-tower data.',
    isApplicable: true,
    appliedLoadN: strikerEnergyJ,
    primaryMetricLabel: 'Absorbed Impact Energy (E_abs)',
    primaryMetricValue: Number(absorbedEnergyJ.toFixed(2)),
    primaryMetricUnit: 'J',
    secondaryMetrics: [
      { label: 'Specific Impact Strength', value: impactStrengthKJm2.toFixed(1), unit: 'kJ/m²' },
      { label: 'Specimen Energy Capacity', value: specimenEnergyCapacityJ.toFixed(2), unit: 'J' },
      { label: 'Ligament Area (A_lig)', value: ligamentAreaMm2.toFixed(1), unit: 'mm²' },
      { label: 'Striker Velocity (1.5 kg)', value: impactVelocityMs.toFixed(2), unit: 'm/s' },
    ],
    strengthLimitLoadN: Number(specimenEnergyCapacityJ.toFixed(2)),
    safetyFactor: strikerEnergyJ > 0 ? Number((specimenEnergyCapacityJ / strikerEnergyJ).toFixed(2)) : null,
    statusText: isFractured
      ? `COMPLETE BREAK (Residual Energy: ${residualStrikerEnergyJ.toFixed(2)} J)`
      : 'NON-BREAK / Elastic-Damage Rebound',
    isFailure: isFractured,
    predictedFailureMode: isFractured
      ? 'Complete brittle fracture with fiber-matrix debonding energy dissipation'
      : 'Localized micro-cracking without through-thickness separation',
    xAxisLabel: 'Incident Striker Energy (J)',
    yAxisLabel: 'Absorbed Energy (J)',
    modelCurve,
    operatingPoint: {
      x: Number(strikerEnergyJ.toFixed(2)),
      y: Number(absorbedEnergyJ.toFixed(2)),
      label: 'Test Impact Energy',
    },
    limitLineY: Number(specimenEnergyCapacityJ.toFixed(2)),
    limitLineLabel: `Fracture Threshold: ${specimenEnergyCapacityJ.toFixed(2)} J`,
  };
}

/**
 * 5. Short-Beam Shear Test (ASTM D2344) — checks applicability
 */
export function simulateShearTest(params: {
  geometry: SpecimenGeometry;
  shearStrengthMPa: number | null;
  appliedLoadN: number;
  specimenId: string;
  provenance: CompositeDataProvenance;
  productId: ProductFamilyId;
}): TestSimulationResult {
  const { geometry, shearStrengthMPa, appliedLoadN, specimenId, provenance, productId } = params;
  const b = Math.max(1, geometry.widthMm);
  const h = Math.max(0.5, geometry.thicknessMm);
  const isApplicable = shearStrengthMPa !== null && productId === 'composite_panel';
  const effShearLimit = shearStrengthMPa ?? 18;
  const tauSBS = (0.75 * appliedLoadN) / (b * h);
  const limitLoadN = (effShearLimit * b * h) / 0.75;
  const isFailure = tauSBS >= effShearLimit;

  const modelCurve: CurvePoint[] = [];
  for (let i = 0; i <= 15; i++) {
    const f = i / 15;
    modelCurve.push({
      x: Number((limitLoadN * f).toFixed(1)),
      y: Number((effShearLimit * f).toFixed(2)),
    });
  }

  return {
    testId: 'shear',
    testName: 'Short-Beam Interlaminar Shear',
    astmStandard: 'ASTM D2344 (Short-Beam Shear)',
    specimenId,
    provenance,
    modelDescription: 'Parabolic mid-plane shear stress model (τ_SBS = 0.75 · P / (b · h))',
    validityNote:
      'Interlaminar shear testing is scientifically meaningful primarily for layered/compressed composite panels, not particulate cement or random FDM beads.',
    isApplicable,
    applicabilityWarning: !isApplicable
      ? 'ASTM D2344 interlaminar shear is not valid for particulate cement or unlaminated 3D-printed specimens.'
      : undefined,
    appliedLoadN,
    primaryMetricLabel: 'Max Shear Stress (τ_SBS)',
    primaryMetricValue: Number(tauSBS.toFixed(2)),
    primaryMetricUnit: 'MPa',
    secondaryMetrics: [
      { label: 'Allowable Shear Limit', value: isApplicable ? effShearLimit.toFixed(1) : 'N/A', unit: 'MPa' },
      { label: 'Limit Shear Load', value: Math.round(limitLoadN).toLocaleString(), unit: 'N' },
    ],
    strengthLimitLoadN: Number(limitLoadN.toFixed(1)),
    safetyFactor: appliedLoadN > 0 ? Number((limitLoadN / appliedLoadN).toFixed(2)) : null,
    statusText: !isApplicable
      ? 'Not Applicable to Selected Product'
      : isFailure
      ? 'FAILURE: Mid-Plane Interlaminar Delamination'
      : 'Below Interlaminar Shear Limit',
    isFailure: isApplicable && isFailure,
    predictedFailureMode: isApplicable && isFailure ? 'Mid-plane horizontal shear delamination' : 'Elastic shear transfer',
    xAxisLabel: 'Applied Load P (N)',
    yAxisLabel: 'Short-Beam Shear Stress (MPa)',
    modelCurve,
    operatingPoint: { x: appliedLoadN, y: Number(tauSBS.toFixed(2)) },
    limitLineY: effShearLimit,
    limitLineLabel: `Shear Limit: ${effShearLimit.toFixed(1)} MPa`,
  };
}

/**
 * 6. Water Absorption Immersion Test (ASTM D570)
 */
export function simulateWaterAbsorptionTest(params: {
  waterAbsorption24hPct: number;
  thicknessMm: number;
  immersionHours: number;
  specimenId: string;
  provenance: CompositeDataProvenance;
}): TestSimulationResult {
  const { waterAbsorption24hPct, thicknessMm, immersionHours, specimenId, provenance } = params;
  // Fickian diffusion projection: M(t) approaches M_inf (~2.2 * M_24h)
  const mInf = waterAbsorption24hPct * 2.2;
  const tauHours = Math.max(8, 22 * Math.pow(thicknessMm / 4, 2));
  const mCurrent = mInf * (1 - Math.exp(-immersionHours / tauHours));
  const threshold = 1.5;

  const modelCurve: CurvePoint[] = [];
  for (let h = 0; h <= 168; h += 12) {
    modelCurve.push({
      x: h,
      y: Number((mInf * (1 - Math.exp(-h / tauHours))).toFixed(3)),
    });
  }

  return {
    testId: 'water_absorption',
    testName: 'Moisture & Water Absorption',
    astmStandard: 'ASTM D570 (24h / 7-Day Immersion)',
    specimenId,
    provenance,
    modelDescription: 'Fickian moisture uptake kinetics scaled by specimen thickness and void content',
    validityNote: 'Accounts for capillary ingress along voids and exposed hydrophilic fiber-matrix interfaces.',
    isApplicable: true,
    appliedLoadN: immersionHours,
    primaryMetricLabel: `Mass Gain at ${immersionHours}h`,
    primaryMetricValue: Number(mCurrent.toFixed(2)),
    primaryMetricUnit: '%',
    secondaryMetrics: [
      { label: '24-Hour Standard Uptake', value: waterAbsorption24hPct.toFixed(2), unit: '%' },
      { label: 'Projected Saturation (M∞)', value: mInf.toFixed(2), unit: '%' },
    ],
    strengthLimitLoadN: null,
    safetyFactor: null,
    statusText: mCurrent > threshold ? 'Elevated Moisture Uptake (>1.5%)' : 'Low Moisture Ingress',
    isFailure: mCurrent > threshold,
    predictedFailureMode: mCurrent > threshold ? 'Interfacial capillary wicking along voids' : 'Matrix-controlled low diffusion',
    xAxisLabel: 'Immersion Time (hours)',
    yAxisLabel: 'Mass Gain (%)',
    modelCurve,
    operatingPoint: { x: immersionHours, y: Number(mCurrent.toFixed(2)) },
    limitLineY: threshold,
    limitLineLabel: 'Polymer Panel Max Target (1.5%)',
  };
}

/**
 * 7. Density, Void Fraction & Shore D Hardness (ASTM D792 & D2240)
 */
export function simulateHardnessDensityTest(params: {
  formulation: CompositeFormulation;
  specimenId: string;
}): TestSimulationResult {
  const { formulation, specimenId } = params;
  const rhoMeas = formulation.properties.densityGcm3;
  const rhoTheo = rhoMeas / Math.max(0.5, 1 - formulation.voidContentPct / 100);
  const shoreD = formulation.properties.shoreDHardness;

  const modelCurve: CurvePoint[] = [];
  for (let v = 0; v <= 15; v += 1.5) {
    modelCurve.push({
      x: v,
      y: Number((rhoTheo * (1 - v / 100)).toFixed(3)),
    });
  }

  return {
    testId: 'hardness_density',
    testName: 'Bulk Density, Void Content & Hardness',
    astmStandard: 'ASTM D792 (Density) & ASTM D2240 (Shore D)',
    specimenId,
    provenance: formulation.propertyBasis,
    modelDescription: 'Archimedes buoyancy density vs theoretical Rule-of-Mixtures density (V_v = 1 - ρ_meas / ρ_theo)',
    validityNote: 'Void fractions above 5% substantially degrade interlaminar shear and fatigue endurance.',
    isApplicable: true,
    appliedLoadN: formulation.voidContentPct,
    primaryMetricLabel: 'Measured Bulk Density',
    primaryMetricValue: rhoMeas,
    primaryMetricUnit: 'g/cm³',
    secondaryMetrics: [
      { label: 'Theoretical Zero-Void ρ', value: rhoTheo.toFixed(3), unit: 'g/cm³' },
      { label: 'Void Content (V_v)', value: formulation.voidContentPct.toFixed(1), unit: '%' },
      { label: 'Surface Hardness', value: shoreD.toString(), unit: 'Shore D' },
    ],
    strengthLimitLoadN: null,
    safetyFactor: null,
    statusText: formulation.voidContentPct > 5 ? 'High Porosity Warning (>5% Voids)' : 'Acceptable Consolidation',
    isFailure: formulation.voidContentPct > 7,
    predictedFailureMode: 'Micro-void coalescence under cyclic load',
    xAxisLabel: 'Void Content V_v (%)',
    yAxisLabel: 'Bulk Density (g/cm³)',
    modelCurve,
    operatingPoint: { x: formulation.voidContentPct, y: rhoMeas },
    limitLineY: 1.85,
    limitLineLabel: 'Lightweight Panel Target (1.85 g/cm³)',
  };
}

/**
 * 8. Thermal Tg & S-N Fatigue Endurance (ASTM D7028 & Basquin Law)
 */
export function simulateThermalFatigueTest(params: {
  formulation: CompositeFormulation;
  cyclicStressMPa: number;
  specimenId: string;
}): TestSimulationResult {
  const { formulation, cyclicStressMPa, specimenId } = params;
  const sigUlt = formulation.properties.tensileStrengthMPa;
  const tg = formulation.properties.glassTransitionTempC;
  const bSlope = -0.105; // typical GFRP Basquin exponent

  const ratio = Math.max(0.15, Math.min(0.98, cyclicStressMPa / Math.max(1, sigUlt)));
  const cyclesToFail = Math.round(0.5 * Math.pow(ratio, 1 / bSlope));

  const modelCurve: CurvePoint[] = [];
  for (let exp = 2; exp <= 7; exp += 0.5) {
    const N = Math.pow(10, exp);
    const sig = sigUlt * Math.pow(2 * N, bSlope);
    modelCurve.push({ x: exp, y: Number(sig.toFixed(2)) });
  }

  return {
    testId: 'thermal_fatigue',
    testName: 'Cyclic Fatigue (S–N) & Thermal Tg',
    astmStandard: 'ASTM D3479 (Tension Fatigue) & ASTM D7028 (DMA Tg)',
    specimenId,
    provenance: formulation.propertyBasis,
    modelDescription: 'Basquin power-law S–N fatigue model (σ_a = σ_ult · (2N_f)^b, b = −0.105)',
    validityNote:
      'Indicative S–N curve only; recycled short-fiber composites exhibit high scatter in fatigue life and require physical coupon verification.',
    isApplicable: true,
    appliedLoadN: cyclicStressMPa,
    primaryMetricLabel: 'Predicted Fatigue Life (N_f)',
    primaryMetricValue: cyclesToFail,
    primaryMetricUnit: 'cycles',
    secondaryMetrics: [
      { label: 'Applied Cyclic Stress', value: cyclicStressMPa.toFixed(1), unit: 'MPa' },
      { label: 'Stress Ratio (σ_a / σ_ult)', value: `${(ratio * 100).toFixed(0)}%`, unit: 'of UTS' },
      { label: 'Glass Transition (T_g)', value: tg !== null ? `${tg}` : 'N/A (Cement)', unit: tg !== null ? '°C' : '' },
    ],
    strengthLimitLoadN: null,
    safetyFactor: null,
    statusText: cyclesToFail < 100000 ? 'Low-Cycle Fatigue Regime (<10⁵)' : 'High-Cycle Regime (≥10⁵)',
    isFailure: cyclesToFail < 10000,
    predictedFailureMode: 'Matrix micro-crack accumulation leading to fiber debonding',
    xAxisLabel: 'log₁₀(Cycles to Failure N_f)',
    yAxisLabel: 'Cyclic Stress Amplitude (MPa)',
    modelCurve,
    operatingPoint: {
      x: Number(Math.max(2, Math.min(7, Math.log10(Math.max(100, cyclesToFail)))).toFixed(2)),
      y: cyclicStressMPa,
    },
    limitLineY: Number((sigUlt * 0.35).toFixed(1)),
    limitLineLabel: 'Endurance Estimate (~35% UTS)',
  };
}

/**
 * Parse user-uploaded or pasted CSV lab test data (FR-15)
 * Supports columns: extension_mm, load_N  OR  strain_pct, stress_MPa
 */
export function parseLabCSV(
  csvText: string,
  widthMm: number,
  thicknessMm: number,
  gaugeLengthMm: number
): UploadedLabPoint[] {
  const area = Math.max(1, widthMm * thicknessMm);
  const L0 = Math.max(1, gaugeLengthMm);
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const isStressStrain = header.includes('stress') || header.includes('strain');
  const points: UploadedLabPoint[] = [];

  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(/[,\t;]+/).map((c) => Number(c.trim()));
    if (cols.length >= 2 && Number.isFinite(cols[0]) && Number.isFinite(cols[1])) {
      if (isStressStrain) {
        const strainPct = cols[0];
        const stressMPa = cols[1];
        points.push({
          strainPct,
          stressMPa,
          extensionMm: (strainPct / 100) * L0,
          loadN: stressMPa * area,
        });
      } else {
        const extensionMm = cols[0];
        const loadN = cols[1];
        points.push({
          extensionMm,
          loadN,
          strainPct: (extensionMm / L0) * 100,
          stressMPa: loadN / area,
        });
      }
    }
  }
  return points;
}

export const SAMPLE_LAB_CSV = `extension_mm,load_N
0.00,0
0.08,410
0.16,845
0.24,1260
0.32,1680
0.40,2095
0.48,2460
0.56,2740
0.64,2910
0.70,2985`;

/**
 * Stage 7: Application Suitability Evaluation (FR-18)
 * Strict Scientific Rule: Without Measured lab evidence, product CANNOT be marked "Approved" or "Validated" —
 * it remains "Research Candidate — Requires Experimental Validation".
 */
export function evaluateApplicationSuitability(
  formulation: CompositeFormulation,
  hasMeasuredLabData: boolean
): ApplicationEvaluationReport {
  const feedstock = FEEDSTOCK_CHARACTERISATIONS[formulation.sourcePathwayId];
  const product = PRODUCT_FAMILIES[formulation.targetProduct];

  if (!feedstock.eligibleForCompositeProduct) {
    return {
      product,
      checks: [],
      passedCount: 0,
      totalCount: product.requirements.length,
      hasMeasuredEvidence: false,
      statusCategory: 'ineligible_feedstock',
      statusLabel: 'Ineligible Feedstock (Cement-Kiln Route)',
      recommendationSummary:
        feedstock.ineligibleReason ||
        'Cement-kiln co-processing does not recover composite-grade fibers.',
      limitations: ['No reusable GFRP reinforcement is produced by kiln co-processing.'],
      proposedImprovements: ['Switch upstream pathway to Mechanical Shredding or Thermal Pyrolysis.'],
    };
  }

  const effectiveProvenance: CompositeDataProvenance = hasMeasuredLabData
    ? 'measured'
    : formulation.propertyBasis;

  const checks = product.requirements.map((req) => {
    const rawVal = formulation.properties[req.propertyKey];
    const actualValue = typeof rawVal === 'number' ? rawVal : null;
    let passed: boolean | null = null;
    if (actualValue !== null) {
      passed = req.operator === '>=' ? actualValue >= req.threshold : actualValue <= req.threshold;
    }
    return {
      requirementId: req.id,
      label: req.label,
      targetText: `${req.operator} ${req.threshold} ${req.unit}`,
      actualValue,
      unit: req.unit,
      provenance: effectiveProvenance,
      passed,
      rationale: req.rationale,
    };
  });

  const passedCount = checks.filter((c) => c.passed === true).length;
  const allPassed = passedCount === checks.length && checks.length > 0;

  let statusCategory: ApplicationEvaluationReport['statusCategory'] = 'research_candidate';
  let statusLabel = 'Research Candidate — Requires Lab Validation';
  let recommendationSummary = '';

  if (!allPassed) {
    statusCategory = 'does_not_meet';
    statusLabel = `Does Not Meet Target Thresholds (${passedCount}/${checks.length} met)`;
    recommendationSummary = `Based on ${effectiveProvenance.replace('_', ' ')} properties, the current formulation falls short of ${checks.length - passedCount} documented requirement(s) for ${product.name}. Adjust reinforcement loading, reduce void content, or apply silane surface treatment before lab prototyping.`;
  } else if (hasMeasuredLabData) {
    statusCategory = 'preliminary_bench_pass';
    statusLabel = `Preliminary Bench-Scale Pass (${passedCount}/${checks.length} criteria met with Measured CSV data)`;
    recommendationSummary = `Uploaded laboratory measurements meet all ${checks.length} screening benchmarks for ${product.name}. Commercial deployment still requires statistical coupon replication (n ≥ 5 per ASTM), environmental aging, and fire-smoke-toxicity (FST) certification.`;
  } else {
    statusCategory = 'research_candidate';
    statusLabel = `Research Candidate (${passedCount}/${checks.length} analytical targets met — Not Lab Validated)`;
    recommendationSummary = `Analytical/reference estimates satisfy all ${checks.length} screening benchmarks for ${product.name}. However, because constituent percentages alone cannot guarantee real interfacial bonding or void-free moulding, this formulation remains a Research Candidate until physical coupons are tested.`;
  }

  const limitations: string[] = [
    ...formulation.modelBreakdown.limitations,
    'Screening evaluation excludes fire/smoke/toxicity (ASTM E84 / EN 13501-1) and UV weathering degradation.',
  ];

  const proposedImprovements: string[] = [];
  if (formulation.interfaceQuality === 'poor_untreated') {
    proposedImprovements.push('Apply amino-silane coupling agent (0.5–1.0 wt%) to improve fiber-matrix interfacial shear strength.');
  }
  if (formulation.voidContentPct > 4) {
    proposedImprovements.push('Introduce vacuum-assisted degassing or higher moulding pressure to lower void fraction below 3%.');
  }
  if (!hasMeasuredLabData) {
    proposedImprovements.push('Fabricate 5 ASTM test coupons and upload load–extension CSV data in the Virtual Lab to upgrade provenance to Measured.');
  }
  if (proposedImprovements.length === 0) {
    proposedImprovements.push('Conduct statistical batch repeatability testing (n ≥ 5) and accelerated hygrothermal aging (70°C / 85% RH).');
  }

  return {
    product,
    checks,
    passedCount,
    totalCount: checks.length,
    hasMeasuredEvidence: hasMeasuredLabData,
    statusCategory,
    statusLabel,
    recommendationSummary,
    limitations,
    proposedImprovements,
  };
}
