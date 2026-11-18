import React, { useState, useMemo } from 'react';
import { Scenario, ScenarioCalculationRun } from '../types';
import {
  CompositeDataProvenance,
  CompositeFormulation,
  FibreOrientationId,
  InterfaceQualityId,
  MaterialTestId,
  MatrixMaterialId,
  ProductFamilyId,
  RecyclingFeedstockId,
  SpecimenGeometry,
  UploadedLabPoint,
} from '../types/composite';
import {
  FEEDSTOCK_CHARACTERISATIONS,
  MATRIX_SPECS,
  PRODUCT_FAMILIES,
  PUBLISHED_COMPOSITE_BENCHMARKS,
  SAMPLE_LAB_CSV,
  createDefaultFormulation,
  estimateCompositeProperties,
  evaluateApplicationSuitability,
  parseLabCSV,
  simulateCompressionTest,
  simulateFlexuralTest,
  simulateHardnessDensityTest,
  simulateImpactTest,
  simulateShearTest,
  simulateTensileTest,
  simulateThermalFatigueTest,
  simulateWaterAbsorptionTest,
} from '../calculations/compositeEngine';
import { Specimen3DViewer } from '../components/Specimen3DViewer';
import { TestingCharts } from '../components/TestingCharts';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileSpreadsheet,
  FlaskConical,
  Hammer,
  Layers,
  Printer,
  ShieldAlert,
  Sliders,
  Upload,
  Wrench,
} from 'lucide-react';

interface CompositeLabViewProps {
  scenario: Scenario;
  run: ScenarioCalculationRun;
}

const PROVENANCE_LABELS: Record<
  CompositeDataProvenance,
  { text: string; toneClass: string }
> = {
  measured: {
    text: 'Measured (Lab CSV)',
    toneClass: 'text-[#123B32] bg-[#EAF5EF] border-[#53A878]/50',
  },
  published_reference: {
    text: 'Published Reference',
    toneClass: 'text-[#245D8A] bg-[#EFF6FC] border-[#245D8A]/30',
  },
  predicted: {
    text: 'Predicted (Analytical Model)',
    toneClass: 'text-[#A96512] bg-[#FFF4DE] border-[#A96512]/30',
  },
  illustrative: {
    text: 'Illustrative (Manual Input)',
    toneClass: 'text-[#64716C] bg-[#F1F5F2] border-[#DCE5DF]',
  },
  not_tested: {
    text: 'Not Tested',
    toneClass: 'text-[#991B1B] bg-[#FEE2E2] border-[#DC2626]/30',
  },
};

const TEST_TABS: { id: MaterialTestId; label: string; short: string }[] = [
  { id: 'tensile', label: 'Tensile (D3039 / D638)', short: 'Tensile' },
  { id: 'compression', label: 'Compression (D6641)', short: 'Compression' },
  { id: 'flexural', label: 'Flexural 3-Pt (D7264)', short: 'Flexural' },
  { id: 'impact', label: 'Impact (D256 / D7136)', short: 'Impact' },
  { id: 'shear', label: 'Shear (D2344)', short: 'Shear' },
  { id: 'water_absorption', label: 'Water Absorption (D570)', short: 'Water' },
  { id: 'hardness_density', label: 'Density & Hardness', short: 'Density/Shore' },
  { id: 'thermal_fatigue', label: 'Fatigue S–N & Tg', short: 'Fatigue/Tg' },
];

export const CompositeLabView: React.FC<CompositeLabViewProps> = ({
  scenario,
  run,
}) => {
  const [selectedFeedstock, setSelectedFeedstock] =
    useState<RecyclingFeedstockId>('mechanical');
  const [formulation, setFormulation] = useState<CompositeFormulation>(() =>
    createDefaultFormulation('mechanical', 'composite_panel')
  );
  const [activeStage, setActiveStage] = useState<
    'design' | 'testing' | 'suitability' | 'report'
  >('testing');
  const [activeTest, setActiveTest] = useState<MaterialTestId>('tensile');

  // Specimen Geometry
  const [specimenId, setSpecimenId] = useState<string>('R-GFRP-PANEL-01');
  const [geometry, setGeometry] = useState<SpecimenGeometry>({
    widthMm: 13,
    thicknessMm: 4,
    gaugeLengthMm: 100,
    supportSpanMm: 64,
    notchDepthMm: 2.5,
  });

  // Manual / Illustrative override properties for testing machine experimentation
  const [useManualMachineProps, setUseManualMachineProps] = useState<boolean>(false);
  const [manualModulusGPa, setManualModulusGPa] = useState<number>(8.0);
  const [manualStrengthMPa, setManualStrengthMPa] = useState<number>(60.0);

  // Applied Loading Controls per test
  const [appliedLoadN, setAppliedLoadN] = useState<number>(1500);
  const [strikerEnergyJ, setStrikerEnergyJ] = useState<number>(1.2);
  const [immersionHours, setImmersionHours] = useState<number>(24);
  const [cyclicStressMPa, setCyclicStressMPa] = useState<number>(25);

  // Experimental CSV Upload (FR-15)
  const [csvDrawerOpen, setCsvDrawerOpen] = useState<boolean>(false);
  const [csvText, setCsvText] = useState<string>('');
  const [uploadedPoints, setUploadedPoints] = useState<UploadedLabPoint[]>([]);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const feedstockSpec = FEEDSTOCK_CHARACTERISATIONS[selectedFeedstock];
  const upstreamPathwayResult = run.pathwayResults[selectedFeedstock];

  // Switch upstream feedstock
  const handleSelectFeedstock = (feedstockId: RecyclingFeedstockId) => {
    setSelectedFeedstock(feedstockId);
    if (feedstockId === 'cement_kiln') return;

    const currentProduct = PRODUCT_FAMILIES[formulation.targetProduct];
    const nextProduct: ProductFamilyId = currentProduct.compatibleFeedstocks.includes(
      feedstockId
    )
      ? formulation.targetProduct
      : 'composite_panel';

    const nextForm = createDefaultFormulation(feedstockId, nextProduct);
    setFormulation(nextForm);
    setSpecimenId(
      feedstockId === 'thermal' ? 'R-GFRP-THERM-01' : 'R-GFRP-MECH-01'
    );
  };

  // Switch target product family
  const handleSelectProduct = (productId: ProductFamilyId) => {
    const nextForm = createDefaultFormulation(selectedFeedstock, productId);
    setFormulation(nextForm);
    if (productId === 'cement_composite') {
      setGeometry({
        widthMm: 40,
        thicknessMm: 40,
        gaugeLengthMm: 40,
        supportSpanMm: 120,
        notchDepthMm: 0,
      });
      setAppliedLoadN(18000);
      setActiveTest('compression');
      setSpecimenId('R-GFRP-MORTAR-01');
    } else if (productId === 'printed_3d_part') {
      setGeometry({
        widthMm: 13,
        thicknessMm: 4,
        gaugeLengthMm: 50,
        supportSpanMm: 64,
        notchDepthMm: 2.5,
      });
      setAppliedLoadN(1400);
      setActiveTest('tensile');
      setSpecimenId('R-GFRP-PLA-3D-01');
    } else {
      setGeometry({
        widthMm: 13,
        thicknessMm: 4,
        gaugeLengthMm: 100,
        supportSpanMm: 64,
        notchDepthMm: 2.5,
      });
      setAppliedLoadN(1500);
      setActiveTest('tensile');
      setSpecimenId('R-GFRP-PANEL-01');
    }
  };

  // Recalculate analytical formulation properties when composition/process changes
  const updateFormulationParam = (patch: Partial<CompositeFormulation>) => {
    setFormulation((prev) => {
      const merged = { ...prev, ...patch };
      const reinforcementMassPct = merged.reinforcementMassPct;
      const matrixMassPct = 100 - reinforcementMassPct;
      const est = estimateCompositeProperties({
        feedstockId: merged.sourcePathwayId,
        matrixId: merged.matrixId,
        reinforcementMassPct,
        orientation: merged.fibreOrientation,
        voidContentPct: merged.voidContentPct,
        interfaceQuality: merged.interfaceQuality,
        targetProduct: merged.targetProduct,
      });
      return {
        ...merged,
        matrixMassPct,
        propertyBasis: 'predicted',
        referenceLabel: est.breakdown.modelName,
        properties: est.properties,
        modelBreakdown: est.breakdown,
      };
    });
  };

  // Load a published peer-reviewed benchmark dataset
  const handleLoadBenchmark = (benchmarkId: string) => {
    const b = PUBLISHED_COMPOSITE_BENCHMARKS.find((x) => x.id === benchmarkId);
    if (!b) return;
    setSelectedFeedstock(b.feedstock);
    setFormulation((prev) => ({
      ...prev,
      name: b.label,
      sourcePathwayId: b.feedstock,
      targetProduct: b.product,
      matrixId: b.matrix,
      reinforcementMassPct: b.reinforcementPct,
      matrixMassPct: 100 - b.reinforcementPct,
      propertyBasis: 'published_reference',
      referenceLabel: `${b.citation} (${b.conditions})`,
      properties: { ...b.properties },
    }));
    setUseManualMachineProps(false);
  };

  // Parse CSV upload or sample lab CSV
  const handleApplyCSV = (raw: string) => {
    setCsvText(raw);
    const parsed = parseLabCSV(
      raw,
      geometry.widthMm,
      geometry.thicknessMm,
      geometry.gaugeLengthMm
    );
    setUploadedPoints(parsed);
    if (parsed.length >= 2) {
      const peakStress = Math.max(...parsed.map((p) => p.stressMPa));
      const mid = parsed[Math.max(1, Math.floor(parsed.length * 0.4))];
      const first = parsed[0];
      const dStrain = (mid.strainPct - first.strainPct) / 100;
      const modGPa =
        dStrain > 0 ? (mid.stressMPa - first.stressMPa) / dStrain / 1000 : formulation.properties.tensileModulusGPa;
      const breakStrain = parsed[parsed.length - 1].strainPct;

      setFormulation((prev) => ({
        ...prev,
        propertyBasis: 'measured',
        referenceLabel: `Uploaded Lab CSV (${parsed.length} data points)`,
        properties: {
          ...prev.properties,
          tensileStrengthMPa: Number(peakStress.toFixed(2)),
          tensileModulusGPa: Number(modGPa.toFixed(2)),
          elongationAtBreakPct: Number(breakStrain.toFixed(3)),
        },
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleApplyCSV(reader.result);
      }
    };
    reader.readAsText(file);
  };

  // Active simulation calculation
  const effectiveProvenance: CompositeDataProvenance = useManualMachineProps
    ? 'illustrative'
    : formulation.propertyBasis;

  const activeTestResult = useMemo(() => {
    const props = formulation.properties;
    switch (activeTest) {
      case 'tensile':
        return simulateTensileTest({
          geometry,
          modulusGPa: useManualMachineProps ? manualModulusGPa : props.tensileModulusGPa,
          strengthLimitMPa: useManualMachineProps ? manualStrengthMPa : props.tensileStrengthMPa,
          appliedLoadN,
          specimenId,
          provenance: effectiveProvenance,
          measuredPoints: uploadedPoints,
        });
      case 'compression':
        return simulateCompressionTest({
          geometry,
          compressiveModulusGPa: useManualMachineProps ? manualModulusGPa : props.compressiveModulusGPa,
          compressiveStrengthMPa: useManualMachineProps ? manualStrengthMPa : props.compressiveStrengthMPa,
          appliedLoadN,
          specimenId,
          provenance: effectiveProvenance,
        });
      case 'flexural':
        return simulateFlexuralTest({
          geometry,
          flexuralModulusGPa: useManualMachineProps ? manualModulusGPa : props.flexuralModulusGPa,
          flexuralStrengthMPa: useManualMachineProps ? manualStrengthMPa : props.flexuralStrengthMPa,
          appliedLoadN,
          specimenId,
          provenance: effectiveProvenance,
        });
      case 'impact':
        return simulateImpactTest({
          geometry,
          impactStrengthKJm2: props.impactStrengthKJm2,
          strikerEnergyJ,
          specimenId,
          provenance: effectiveProvenance,
        });
      case 'shear':
        return simulateShearTest({
          geometry,
          shearStrengthMPa: props.shearStrengthMPa,
          appliedLoadN,
          specimenId,
          provenance: effectiveProvenance,
          productId: formulation.targetProduct,
        });
      case 'water_absorption':
        return simulateWaterAbsorptionTest({
          waterAbsorption24hPct: props.waterAbsorption24hPct,
          thicknessMm: geometry.thicknessMm,
          immersionHours,
          specimenId,
          provenance: effectiveProvenance,
        });
      case 'hardness_density':
        return simulateHardnessDensityTest({
          formulation,
          specimenId,
        });
      case 'thermal_fatigue':
        return simulateThermalFatigueTest({
          formulation,
          cyclicStressMPa,
          specimenId,
        });
    }
  }, [
    activeTest,
    geometry,
    formulation,
    useManualMachineProps,
    manualModulusGPa,
    manualStrengthMPa,
    appliedLoadN,
    strikerEnergyJ,
    immersionHours,
    cyclicStressMPa,
    specimenId,
    effectiveProvenance,
    uploadedPoints,
  ]);

  // Suitability Evaluation (Stage 7)
  const evaluationReport = useMemo(
    () => evaluateApplicationSuitability(formulation, uploadedPoints.length >= 2),
    [formulation, uploadedPoints.length]
  );

  // Copy simulation results to clipboard
  const handleCopyResults = () => {
    const lines = [
      `BladeCycle Virtual Material Testing Lab — ${activeTestResult.testName}`,
      `Specimen ID: ${activeTestResult.specimenId} | Standard: ${activeTestResult.astmStandard}`,
      `Provenance: ${PROVENANCE_LABELS[activeTestResult.provenance].text}`,
      `Geometry: ${geometry.widthMm} x ${geometry.thicknessMm} x ${geometry.gaugeLengthMm} mm`,
      `Primary Result: ${activeTestResult.primaryMetricLabel} = ${activeTestResult.primaryMetricValue} ${activeTestResult.primaryMetricUnit}`,
      ...activeTestResult.secondaryMetrics.map(
        (m) => `${m.label}: ${m.value} ${m.unit}`
      ),
      `Status: ${activeTestResult.statusText}`,
      `Failure Mode: ${activeTestResult.predictedFailureMode}`,
    ];
    navigator.clipboard?.writeText(lines.join('\n'));
    setCopiedNotice('Copied test summary to clipboard');
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  // Export CSV Test Report
  const handleDownloadLabCSV = () => {
    const rows = [
      ['BladeCycle Composite End-Product & Test Report'],
      ['Product', PRODUCT_FAMILIES[formulation.targetProduct].name],
      ['Upstream Recycling Pathway', feedstockSpec.pathwayName],
      ['Matrix', MATRIX_SPECS[formulation.matrixId].name],
      ['Reinforcement wt%', String(formulation.reinforcementMassPct)],
      ['Void Content %', String(formulation.voidContentPct)],
      ['Property Basis', PROVENANCE_LABELS[formulation.propertyBasis].text],
      ['Active Test', activeTestResult.testName],
      ['ASTM Standard', activeTestResult.astmStandard],
      [activeTestResult.xAxisLabel, activeTestResult.yAxisLabel],
      ...activeTestResult.modelCurve.map((pt) => [String(pt.x), String(pt.y)]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bladecycle_${specimenId.toLowerCase()}_${activeTest}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Compute load ratio for 3D viewer animation
  const loadRatioFor3D = useMemo(() => {
    if (
      activeTest === 'tensile' ||
      activeTest === 'compression' ||
      activeTest === 'flexural' ||
      activeTest === 'shear'
    ) {
      const lim = activeTestResult.strengthLimitLoadN || 1;
      return Math.min(1.2, appliedLoadN / lim);
    }
    if (activeTest === 'impact') {
      const lim = activeTestResult.strengthLimitLoadN || 1;
      return Math.min(1.2, strikerEnergyJ / lim);
    }
    return 0.55;
  }, [activeTest, activeTestResult.strengthLimitLoadN, appliedLoadN, strikerEnergyJ]);

  // True displacement in mm for 3D viewer label
  const trueDispMm = useMemo(() => {
    if (activeTest === 'tensile' || activeTest === 'compression') {
      return Number(activeTestResult.secondaryMetrics[0]?.value || 0);
    }
    if (activeTest === 'flexural') {
      return Number(activeTestResult.secondaryMetrics[0]?.value || 0);
    }
    return 0;
  }, [activeTest, activeTestResult.secondaryMetrics]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Workflow Context Header */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#64716C]">
              <span className="font-semibold text-[#176B5B]">
                Composite Product &amp; Testing Laboratory
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{scenario.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Input Batch: {(scenario.inputMassKg / 1000).toFixed(1)} t GFRP
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#123B32] mt-1">
              Recycled Composite Formulation, Virtual Testing &amp; Suitability Evaluation
            </h1>
          </div>

          {/* Stage Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F1F5F2] rounded-lg border border-[#DCE5DF] self-start">
            {[
              { id: 'design', label: '1. Feedstock & Formulation' },
              { id: 'testing', label: '2. Virtual Testing Lab' },
              { id: 'suitability', label: '3. Application Suitability' },
              { id: 'report', label: '4. Engineering Report' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStage(tab.id as typeof activeStage)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeStage === tab.id
                    ? 'bg-white text-[#123B32] font-semibold shadow-2xs'
                    : 'text-[#64716C] hover:text-[#182522]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upstream Recycling Feedstock Selector Strip (Stage 2) */}
        <div className="pt-3 border-t border-[#EFF4F1] grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['mechanical', 'thermal', 'cement_kiln'] as RecyclingFeedstockId[]).map(
            (id) => {
              const char = FEEDSTOCK_CHARACTERISATIONS[id];
              const res = run.pathwayResults[id];
              const isSelected = selectedFeedstock === id;
              return (
                <button
                  key={id}
                  onClick={() => handleSelectFeedstock(id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? id === 'cement_kiln'
                        ? 'bg-[#FEF2F2] border-[#DC2626]'
                        : 'bg-[#EAF5EF] border-[#176B5B]'
                      : 'bg-[#F7F9F6] border-[#DCE5DF] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#123B32]">
                      {char.pathwayName}
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-[#64716C]">
                      {res ? `${(res.recoveredMassKg / 1000).toFixed(1)} t` : '—'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64716C] mt-1 line-clamp-1">
                    {char.eligibleForCompositeProduct
                      ? `${char.fibreForm} · ${char.particleOrFibreSizeMm}`
                      : 'Clinker co-processing only — no fiber recovery'}
                  </p>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* CRITICAL SCIENTIFIC RULE: Cement-Kiln Feedstock Guard */}
      {!feedstockSpec.eligibleForCompositeProduct && (
        <div className="bg-white rounded-xl border border-[#DC2626]/40 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h2 className="text-base font-bold text-[#991B1B]">
                Composite Product Manufacturing Unavailable for Cement-Kiln Co-Processing
              </h2>
              <p className="text-sm text-[#182522] leading-relaxed">
                {feedstockSpec.ineligibleReason}
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => handleSelectFeedstock('mechanical')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] text-white hover:bg-[#176B5B] transition-colors"
                >
                  Switch to Mechanical Recycling Feedstock
                </button>
                <button
                  onClick={() => handleSelectFeedstock('thermal')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#DCE5DF] bg-[#F7F9F6] text-[#123B32] hover:bg-[#EAF5EF] transition-colors"
                >
                  Switch to Thermal Pyrolysis Feedstock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKFLOW STAGES (Active when Mechanical or Thermal is selected) */}
      {feedstockSpec.eligibleForCompositeProduct && (
        <>
          {/* STAGE 1/2/3/4: FEEDSTOCK CHARACTERISATION, PRODUCT & FORMULATION */}
          {activeStage === 'design' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Recovered Material Characterisation + End-Product Family */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-xl border border-[#DCE5DF] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#123B32] uppercase tracking-wider">
                      Recovered Material Characterisation
                    </h2>
                    <span className="text-xs font-mono text-[#176B5B] tabular-nums">
                      {upstreamPathwayResult
                        ? `${upstreamPathwayResult.recoveredMassKg.toLocaleString()} kg available`
                        : ''}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-xs border-t border-[#EFF4F1] pt-3">
                    <div>
                      <dt className="text-[#64716C]">Fibre Form</dt>
                      <dd className="font-medium text-[#182522] mt-0.5">
                        {feedstockSpec.fibreForm}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#64716C]">Particle / Fibre Size</dt>
                      <dd className="font-mono font-medium text-[#182522] mt-0.5">
                        {feedstockSpec.particleOrFibreSizeMm}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#64716C]">Tensile Strength Retention</dt>
                      <dd className="font-mono font-semibold text-[#176B5B] mt-0.5 tabular-nums">
                        {feedstockSpec.strengthRetentionPct}% of virgin E-glass
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#64716C]">Residual Resin Content</dt>
                      <dd className="font-mono font-medium text-[#A96512] mt-0.5 tabular-nums">
                        {feedstockSpec.residualResinPct}%
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[#64716C]">Surface &amp; Sizing Condition</dt>
                      <dd className="text-[#182522] mt-0.5">
                        {feedstockSpec.surfaceCondition}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Product Family Selector */}
                <div className="bg-white rounded-xl border border-[#DCE5DF] p-5 space-y-3">
                  <h2 className="text-sm font-bold text-[#123B32] uppercase tracking-wider">
                    Select End-Product Family
                  </h2>
                  <div className="space-y-2.5">
                    {(Object.keys(PRODUCT_FAMILIES) as ProductFamilyId[]).map(
                      (pid) => {
                        const prod = PRODUCT_FAMILIES[pid];
                        const compatible =
                          prod.compatibleFeedstocks.includes(selectedFeedstock);
                        const isSel = formulation.targetProduct === pid;
                        return (
                          <button
                            key={pid}
                            disabled={!compatible}
                            onClick={() => handleSelectProduct(pid)}
                            className={`w-full p-3.5 rounded-lg border text-left transition-colors ${
                              !compatible
                                ? 'bg-slate-50 border-slate-200 opacity-55 cursor-not-allowed'
                                : isSel
                                ? 'bg-[#EAF5EF] border-[#176B5B]'
                                : 'bg-white border-[#DCE5DF] hover:bg-[#F7F9F6]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#123B32]">
                                {prod.name}
                              </span>
                              {!compatible && (
                                <span className="text-[10px] font-mono text-[#991B1B]">
                                  Requires Thermal Reclaimed Fiber
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#64716C] mt-1">
                              {prod.subtitle}
                            </p>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Formulation Builder, Manufacturing Process & Property Engine */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-xl border border-[#DCE5DF] p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EFF4F1] pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-[#123B32] uppercase tracking-wider">
                        Composite Formulation &amp; Manufacturing Planner
                      </h2>
                      <p className="text-xs text-[#64716C] mt-0.5">
                        Configure reinforcement loading, new matrix, interface treatment, and process parameters.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleLoadBenchmark(e.target.value);
                        }}
                        defaultValue=""
                        className="text-xs bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 text-[#123B32] font-medium"
                      >
                        <option value="" disabled>
                          Load Published Study Benchmark...
                        </option>
                        {PUBLISHED_COMPOSITE_BENCHMARKS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Formulation Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-[#182522] block mb-1">
                        New Matrix Binder
                      </label>
                      <select
                        value={formulation.matrixId}
                        onChange={(e) =>
                          updateFormulationParam({
                            matrixId: e.target.value as MatrixMaterialId,
                          })
                        }
                        className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-3 py-2 text-[#182522]"
                      >
                        {(Object.keys(MATRIX_SPECS) as MatrixMaterialId[]).map(
                          (mid) => (
                            <option key={mid} value={mid}>
                              {MATRIX_SPECS[mid].name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-[#182522] block mb-1">
                        Fibre / Particle Orientation
                      </label>
                      <select
                        value={formulation.fibreOrientation}
                        onChange={(e) =>
                          updateFormulationParam({
                            fibreOrientation: e.target.value as FibreOrientationId,
                          })
                        }
                        className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-3 py-2 text-[#182522]"
                      >
                        <option value="random_2d">2D In-Plane Random (Compression Mat)</option>
                        <option value="quasi_isotropic">Quasi-Isotropic Layered</option>
                        <option value="aligned_raster">Aligned Flow / FDM Raster</option>
                        <option value="random_3d">3D Random Dispersion</option>
                        <option value="particulate">Particulate / Short Filler</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-[#182522]">
                          Recycled GFRP Loading
                        </span>
                        <span className="font-mono font-bold text-[#176B5B] tabular-nums">
                          {formulation.reinforcementMassPct}% r-GFRP / {formulation.matrixMassPct}% Matrix
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={60}
                        step={1}
                        value={formulation.reinforcementMassPct}
                        onChange={(e) =>
                          updateFormulationParam({
                            reinforcementMassPct: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#176B5B]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-[#182522]">
                          Estimated Moulded Void Content (V_v)
                        </span>
                        <span className="font-mono font-bold text-[#A96512] tabular-nums">
                          {formulation.voidContentPct.toFixed(1)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={12}
                        step={0.5}
                        value={formulation.voidContentPct}
                        onChange={(e) =>
                          updateFormulationParam({
                            voidContentPct: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#A96512]"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#182522] block mb-1">
                        Fibre–Matrix Interface Treatment
                      </label>
                      <select
                        value={formulation.interfaceQuality}
                        onChange={(e) =>
                          updateFormulationParam({
                            interfaceQuality: e.target.value as InterfaceQualityId,
                          })
                        }
                        className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-3 py-2 text-[#182522]"
                      >
                        <option value="poor_untreated">Untreated / Residual Resin Contamination (ηᵢ = 0.55)</option>
                        <option value="moderate_cleaned">Washed / Sieved Clean Surface (ηᵢ = 0.76)</option>
                        <option value="good_silane_coupled">Silane Coupling Re-Sized (ηᵢ = 0.94)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-[#64716C] block mb-1">
                          Temp (°C)
                        </label>
                        <input
                          type="number"
                          value={formulation.processTempC}
                          onChange={(e) =>
                            setFormulation((p) => ({
                              ...p,
                              processTempC: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2 py-1.5 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#64716C] block mb-1">
                          Press (MPa)
                        </label>
                        <input
                          type="number"
                          step={0.5}
                          value={formulation.mouldingPressureMPa}
                          onChange={(e) =>
                            setFormulation((p) => ({
                              ...p,
                              mouldingPressureMPa: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2 py-1.5 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#64716C] block mb-1">
                          Time (min)
                        </label>
                        <input
                          type="number"
                          value={formulation.cycleTimeMin}
                          onChange={(e) =>
                            setFormulation((p) => ({
                              ...p,
                              cycleTimeMin: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2 py-1.5 font-mono tabular-nums"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scientific Transparency Box: Why % alone is not enough */}
                  <div className="bg-[#F7F9F6] rounded-lg border border-[#DCE5DF] p-4 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[#123B32]">
                        Material Property Engine Basis: {formulation.modelBreakdown.modelName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-sm border text-[11px] font-semibold ${
                          PROVENANCE_LABELS[formulation.propertyBasis].toneClass
                        }`}
                      >
                        {PROVENANCE_LABELS[formulation.propertyBasis].text}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64716C]">
                      Constituent mass percentages alone cannot predict real composite strength without fiber volume fraction (V_f = {formulation.modelBreakdown.fiberVolumeFraction}), orientation factor (η₀ = {formulation.modelBreakdown.orientationFactorEtaO}), interface factor (ηᵢ = {formulation.modelBreakdown.interfaceFactorEtaI}), and void knockdown ({formulation.modelBreakdown.voidKnockdownFactor}).
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-[#176B5B] pt-1">
                      {formulation.modelBreakdown.equationsUsed.map((eq, idx) => (
                        <div key={idx} className="bg-white border border-[#DCE5DF] px-2.5 py-1.5 rounded-md">
                          {eq}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveStage('testing')}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white transition-colors"
                    >
                      Proceed to Virtual Material Testing Lab →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5 & 6: VIRTUAL MATERIAL TESTING LABORATORY */}
          {activeStage === 'testing' && (
            <div className="space-y-5">
              {/* Top Test Method Selector Ribbon */}
              <div className="bg-white rounded-xl border border-[#DCE5DF] p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1">
                  {TEST_TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTest(t.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        activeTest === t.id
                          ? 'bg-[#123B32] text-white font-semibold'
                          : 'bg-[#F7F9F6] text-[#64716C] hover:text-[#182522] hover:bg-[#EAF5EF]'
                      }`}
                    >
                      {t.short}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setCsvDrawerOpen((v) => !v)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#245D8A]/40 bg-[#EFF6FC] text-[#245D8A] hover:bg-[#e1effa] flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadedPoints.length >= 2
                        ? `Lab CSV Loaded (${uploadedPoints.length} pts)`
                        : 'Upload Lab CSV'}
                    </span>
                  </button>
                  <button
                    onClick={handleCopyResults}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <ClipboardCopy className="w-3.5 h-3.5 text-[#176B5B]" />
                    <span>{copiedNotice || 'Copy Results'}</span>
                  </button>
                </div>
              </div>

              {/* Optional Lab CSV Upload Drawer (FR-15) */}
              {csvDrawerOpen && (
                <div className="bg-white rounded-xl border border-[#245D8A]/40 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#123B32] uppercase tracking-wider">
                        Experimental Machine Data Import (CSV: extension_mm, load_N or strain_pct, stress_MPa)
                      </h3>
                      <p className="text-[11px] text-[#64716C]">
                        Uploading actual UTM test data overrides modeled tensile estimates and marks provenance as Measured.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApplyCSV(SAMPLE_LAB_CSV)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EFF6FC] text-[#245D8A] hover:bg-[#dcecf9]"
                      >
                        Load Sample r-GFRP Coupon CSV
                      </button>
                      <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#123B32] text-white cursor-pointer hover:bg-[#176B5B]">
                        Choose .CSV File
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => handleApplyCSV(e.target.value)}
                    placeholder="extension_mm,load_N&#10;0.00,0&#10;0.16,845&#10;..."
                    className="w-full font-mono text-xs bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5"
                  />
                  {activeTestResult.measuredSummary && (
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-[#245D8A]">
                      <span>Measured UTS: {activeTestResult.measuredSummary.peakStrengthMPa} MPa</span>
                      <span>Measured Secant Modulus: {activeTestResult.measuredSummary.modulusGPa} GPa</span>
                      <span>Break Strain: {activeTestResult.measuredSummary.breakStrainPct}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Asymmetric Split Testing Console */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Control Column (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-[#DCE5DF] p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#EFF4F1] pb-3">
                    <div>
                      <span className="text-[11px] font-mono text-[#176B5B] font-semibold">
                        {activeTestResult.astmStandard}
                      </span>
                      <h2 className="text-base font-bold text-[#123B32]">
                        {activeTestResult.testName}
                      </h2>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm border ${
                        PROVENANCE_LABELS[activeTestResult.provenance].toneClass
                      }`}
                    >
                      {PROVENANCE_LABELS[activeTestResult.provenance].text}
                    </span>
                  </div>

                  {/* Specimen Identification & Geometry */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-[#64716C] block mb-1">
                        Specimen ID
                      </label>
                      <input
                        type="text"
                        value={specimenId}
                        onChange={(e) => setSpecimenId(e.target.value)}
                        className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-3 py-1.5 font-mono text-[#182522]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#64716C] block mb-1">
                          Width b (mm)
                        </label>
                        <input
                          type="number"
                          min={2}
                          max={100}
                          value={geometry.widthMm}
                          onChange={(e) =>
                            setGeometry((g) => ({
                              ...g,
                              widthMm: Math.max(2, Number(e.target.value)),
                            }))
                          }
                          className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 font-mono tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#64716C] block mb-1">
                          Thickness h (mm)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          step={0.5}
                          value={geometry.thicknessMm}
                          onChange={(e) =>
                            setGeometry((g) => ({
                              ...g,
                              thicknessMm: Math.max(1, Number(e.target.value)),
                            }))
                          }
                          className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 font-mono tabular-nums"
                        />
                      </div>

                      {(activeTest === 'tensile' || activeTest === 'compression') && (
                        <div className="col-span-2">
                          <label className="text-[11px] font-semibold text-[#64716C] block mb-1">
                            Gauge Length L₀ (mm)
                          </label>
                          <input
                            type="number"
                            min={10}
                            max={250}
                            value={geometry.gaugeLengthMm}
                            onChange={(e) =>
                              setGeometry((g) => ({
                                ...g,
                                gaugeLengthMm: Math.max(10, Number(e.target.value)),
                              }))
                            }
                            className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 font-mono tabular-nums"
                          />
                        </div>
                      )}

                      {(activeTest === 'flexural' || activeTest === 'shear') && (
                        <div className="col-span-2">
                          <label className="text-[11px] font-semibold text-[#64716C] block mb-1">
                            Support Span L (mm)
                          </label>
                          <input
                            type="number"
                            min={16}
                            max={250}
                            value={geometry.supportSpanMm}
                            onChange={(e) =>
                              setGeometry((g) => ({
                                ...g,
                                supportSpanMm: Math.max(16, Number(e.target.value)),
                              }))
                            }
                            className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 font-mono tabular-nums"
                          />
                        </div>
                      )}

                      {activeTest === 'impact' && (
                        <div className="col-span-2">
                          <label className="text-[11px] font-semibold text-[#64716C] block mb-1">
                            V-Notch Depth (mm, 0 = unnotched)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={6}
                            step={0.5}
                            value={geometry.notchDepthMm}
                            onChange={(e) =>
                              setGeometry((g) => ({
                                ...g,
                                notchDepthMm: Math.max(0, Number(e.target.value)),
                              }))
                            }
                            className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg px-2.5 py-1.5 font-mono tabular-nums"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Material Property Source Toggle */}
                  <div className="pt-3 border-t border-[#EFF4F1] space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#123B32]">
                        Material Parameter Source
                      </span>
                      <button
                        type="button"
                        onClick={() => setUseManualMachineProps((v) => !v)}
                        className="text-[11px] font-semibold text-[#176B5B] underline"
                      >
                        {useManualMachineProps
                          ? 'Use Generated Composite'
                          : 'Manual Experiment Mode'}
                      </button>
                    </div>

                    {useManualMachineProps ? (
                      <div className="grid grid-cols-2 gap-3 bg-[#F7F9F6] p-3 rounded-lg border border-[#DCE5DF]">
                        <div>
                          <label className="text-[11px] text-[#64716C] block mb-1">
                            Modulus E (GPa)
                          </label>
                          <input
                            type="number"
                            step={0.5}
                            min={0.5}
                            max={100}
                            value={manualModulusGPa}
                            onChange={(e) =>
                              setManualModulusGPa(Math.max(0.5, Number(e.target.value)))
                            }
                            className="w-full bg-white border border-[#DCE5DF] rounded-md px-2 py-1 font-mono tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64716C] block mb-1">
                            Strength Limit (MPa)
                          </label>
                          <input
                            type="number"
                            step={1}
                            min={2}
                            max={800}
                            value={manualStrengthMPa}
                            onChange={(e) =>
                              setManualStrengthMPa(Math.max(2, Number(e.target.value)))
                            }
                            className="w-full bg-white border border-[#DCE5DF] rounded-md px-2 py-1 font-mono tabular-nums"
                          />
                        </div>
                        <p className="col-span-2 text-[10px] text-[#64716C]">
                          Manual inputs are marked Illustrative until linked to a validated composite dataset or measured lab CSV.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-[#F7F9F6] p-3 rounded-lg border border-[#DCE5DF] space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[#64716C]">Formulation:</span>
                          <span className="font-semibold text-[#123B32] truncate max-w-[170px]">
                            {formulation.name}
                          </span>
                        </div>
                        <div className="flex justify-between font-mono tabular-nums">
                          <span className="text-[#64716C]">Tensile E / UTS:</span>
                          <span className="text-[#182522]">
                            {formulation.properties.tensileModulusGPa} GPa / {formulation.properties.tensileStrengthMPa} MPa
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interactive Load / Stimulus Slider */}
                  <div className="pt-3 border-t border-[#EFF4F1] space-y-2.5 text-xs">
                    {(activeTest === 'tensile' ||
                      activeTest === 'compression' ||
                      activeTest === 'flexural' ||
                      activeTest === 'shear') && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#123B32]">
                            Applied Load (F)
                          </span>
                          <span className="font-mono font-bold text-sm text-[#176B5B] tabular-nums">
                            {appliedLoadN.toLocaleString()} N
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(
                            4000,
                            Math.round((activeTestResult.strengthLimitLoadN ?? 3000) * 1.25)
                          )}
                          step={50}
                          value={appliedLoadN}
                          onChange={(e) => setAppliedLoadN(Number(e.target.value))}
                          className="w-full accent-[#123B32]"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-[#64716C] tabular-nums">
                          <span>0 N</span>
                          <span>
                            Limit: {Math.round(activeTestResult.strengthLimitLoadN ?? 0).toLocaleString()} N
                          </span>
                        </div>
                      </>
                    )}

                    {activeTest === 'impact' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#123B32]">
                            Striker Impact Energy
                          </span>
                          <span className="font-mono font-bold text-sm text-[#176B5B] tabular-nums">
                            {strikerEnergyJ.toFixed(2)} J
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={5.0}
                          step={0.1}
                          value={strikerEnergyJ}
                          onChange={(e) => setStrikerEnergyJ(Number(e.target.value))}
                          className="w-full accent-[#123B32]"
                        />
                      </>
                    )}

                    {activeTest === 'water_absorption' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#123B32]">
                            Immersion Duration
                          </span>
                          <span className="font-mono font-bold text-sm text-[#176B5B] tabular-nums">
                            {immersionHours} hours
                          </span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={168}
                          step={2}
                          value={immersionHours}
                          onChange={(e) => setImmersionHours(Number(e.target.value))}
                          className="w-full accent-[#123B32]"
                        />
                      </>
                    )}

                    {activeTest === 'thermal_fatigue' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#123B32]">
                            Cyclic Stress Amplitude (σₐ)
                          </span>
                          <span className="font-mono font-bold text-sm text-[#176B5B] tabular-nums">
                            {cyclicStressMPa} MPa
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={Math.max(40, Math.round(formulation.properties.tensileStrengthMPa * 0.95))}
                          step={1}
                          value={cyclicStressMPa}
                          onChange={(e) => setCyclicStressMPa(Number(e.target.value))}
                          className="w-full accent-[#123B32]"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Main Right Viewport: 3D Specimen + Readouts + Graph (8 cols) */}
                <div className="lg:col-span-8 space-y-5">
                  {activeTestResult.applicabilityWarning && (
                    <div className="bg-[#FFF4DE] border border-[#A96512]/40 rounded-xl p-3.5 text-xs text-[#7E4609] flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{activeTestResult.applicabilityWarning}</span>
                    </div>
                  )}

                  {/* Primary Metric & Telemetry Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="col-span-2 sm:col-span-2 bg-white rounded-xl border border-[#DCE5DF] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64716C]">
                        {activeTestResult.primaryMetricLabel}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span
                          className={`text-2xl font-bold font-mono tabular-nums ${
                            activeTestResult.isFailure ? 'text-[#DC2626]' : 'text-[#123B32]'
                          }`}
                        >
                          {activeTestResult.primaryMetricValue.toLocaleString()}
                        </span>
                        <span className="text-xs font-mono text-[#64716C]">
                          {activeTestResult.primaryMetricUnit}
                        </span>
                      </div>
                      <div
                        className={`mt-1.5 text-[11px] font-semibold ${
                          activeTestResult.isFailure ? 'text-[#DC2626]' : 'text-[#176B5B]'
                        }`}
                      >
                        {activeTestResult.statusText}
                      </div>
                    </div>

                    {activeTestResult.secondaryMetrics.slice(0, 3).map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-[#DCE5DF] p-3.5 flex flex-col justify-between"
                      >
                        <span className="text-[11px] text-[#64716C] leading-tight">
                          {m.label}
                        </span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="text-lg font-bold font-mono text-[#182522] tabular-nums">
                            {m.value}
                          </span>
                          <span className="text-[10px] font-mono text-[#64716C]">
                            {m.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive 3D Specimen Testing Rig (Three.js) */}
                  <Specimen3DViewer
                    testId={activeTest}
                    geometry={geometry}
                    loadRatio={loadRatioFor3D}
                    isFailure={activeTestResult.isFailure}
                    failureMode={activeTestResult.predictedFailureMode}
                    trueDisplacementMm={trueDispMm}
                    displacementLabel={
                      activeTest === 'flexural'
                        ? 'Deflection δ'
                        : activeTest === 'compression'
                        ? 'Shortening ΔL'
                        : 'Elongation ΔL'
                    }
                    isBucklingMode={
                      activeTest === 'compression' &&
                      activeTestResult.predictedFailureMode.toLowerCase().includes('buckling')
                    }
                  />

                  {/* Interactive Engineering Response Graph */}
                  <TestingCharts result={activeTestResult} />
                </div>
              </div>
            </div>
          )}

          {/* STAGE 7: APPLICATION SUITABILITY EVALUATION */}
          {activeStage === 'suitability' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EFF4F1] pb-4">
                  <div>
                    <span className="text-xs font-semibold text-[#176B5B]">
                      Application Benchmark Evaluation
                    </span>
                    <h2 className="text-xl font-bold text-[#123B32] mt-0.5">
                      {evaluationReport.product.name}
                    </h2>
                    <p className="text-xs text-[#64716C] mt-1">
                      {evaluationReport.product.referenceStudyNote}
                    </p>
                  </div>

                  <div
                    className={`px-3.5 py-2 rounded-lg border text-xs font-bold self-start ${
                      evaluationReport.statusCategory === 'preliminary_bench_pass'
                        ? 'bg-[#EAF5EF] border-[#53A878] text-[#123B32]'
                        : evaluationReport.statusCategory === 'does_not_meet'
                        ? 'bg-[#FEE2E2] border-[#DC2626]/40 text-[#991B1B]'
                        : 'bg-[#FFF4DE] border-[#A96512]/40 text-[#7E4609]'
                    }`}
                  >
                    {evaluationReport.statusLabel}
                  </div>
                </div>

                <p className="text-sm text-[#182522] leading-relaxed">
                  {evaluationReport.recommendationSummary}
                </p>

                {/* Requirements Matrix */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-[#DCE5DF]">
                    <thead>
                      <tr className="bg-[#F7F9F6] text-[#64716C] border-b border-[#DCE5DF]">
                        <th className="p-3 border-r border-[#DCE5DF]">Application Requirement</th>
                        <th className="p-3 border-r border-[#DCE5DF]">Target</th>
                        <th className="p-3 border-r border-[#DCE5DF] text-right">Current Value</th>
                        <th className="p-3 border-r border-[#DCE5DF]">Evidence Basis</th>
                        <th className="p-3 text-center">Check</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFF4F1]">
                      {evaluationReport.checks.map((chk) => (
                        <tr key={chk.requirementId}>
                          <td className="p-3 border-r border-[#DCE5DF]">
                            <div className="font-semibold text-[#182522]">{chk.label}</div>
                            <div className="text-[11px] text-[#64716C] mt-0.5">{chk.rationale}</div>
                          </td>
                          <td className="p-3 border-r border-[#DCE5DF] font-mono tabular-nums">
                            {chk.targetText}
                          </td>
                          <td className="p-3 border-r border-[#DCE5DF] text-right font-mono font-bold tabular-nums">
                            {chk.actualValue !== null ? `${chk.actualValue} ${chk.unit}` : 'Not Tested'}
                          </td>
                          <td className="p-3 border-r border-[#DCE5DF]">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm border ${
                                PROVENANCE_LABELS[chk.provenance].toneClass
                              }`}
                            >
                              {PROVENANCE_LABELS[chk.provenance].text}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {chk.passed ? (
                              <span className="inline-flex items-center gap-1 text-[#176B5B] font-semibold">
                                <CheckCircle2 className="w-4 h-4" /> Pass
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#DC2626] font-semibold">
                                <AlertTriangle className="w-4 h-4" /> Below Target
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Limitations & Proposed Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="bg-[#F7F9F6] rounded-lg border border-[#DCE5DF] p-4 space-y-2">
                    <h3 className="text-xs font-bold text-[#123B32] uppercase tracking-wider">
                      Documented Engineering Limitations
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#64716C] list-disc pl-4">
                      {evaluationReport.limitations.map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#EAF5EF]/60 rounded-lg border border-[#DCE5DF] p-4 space-y-2">
                    <h3 className="text-xs font-bold text-[#123B32] uppercase tracking-wider">
                      Recommended Next Engineering Actions
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#182522] list-disc pl-4">
                      {evaluationReport.proposedImprovements.map((imp, i) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 8: COMPLETE COMPOSITE END-PRODUCT & TESTING REPORT (FR-19) */}
          {activeStage === 'report' && (
            <div className="space-y-4">
              <div className="no-print flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#64716C]">
                  Complete end-to-end documentation connecting BladeCycle recycling output to composite product qualification.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadLabCSV}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#176B5B]" />
                    <span>Export Test CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print End-Product Report</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#DCE5DF] p-8 space-y-7 text-[#182522] print:border-none print:p-0">
                <div className="border-b-2 border-[#123B32] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#176B5B] uppercase tracking-wider">
                      BladeCycle End-Product Qualification Dossier
                    </div>
                    <h2 className="text-2xl font-bold text-[#123B32] mt-1">
                      {PRODUCT_FAMILIES[formulation.targetProduct].name}
                    </h2>
                    <p className="text-xs text-[#64716C] mt-1 font-mono">
                      Scenario: {scenario.name} · Specimen ID: {specimenId}
                    </p>
                  </div>
                  <div className="text-xs font-mono text-right text-[#64716C]">
                    <div>Provenance: {PROVENANCE_LABELS[formulation.propertyBasis].text}</div>
                    <div>Status: {evaluationReport.statusLabel}</div>
                  </div>
                </div>

                {/* Section 1: Feedstock & Formulation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="space-y-2">
                    <h3 className="font-bold text-[#123B32] uppercase tracking-wider border-b border-[#DCE5DF] pb-1">
                      1. Upstream Recycling Source
                    </h3>
                    <p><strong>Route:</strong> {feedstockSpec.pathwayName}</p>
                    <p><strong>Recovered Mass:</strong> {upstreamPathwayResult ? `${upstreamPathwayResult.recoveredMassKg.toLocaleString()} kg` : 'N/A'}</p>
                    <p><strong>Fibre Form &amp; Size:</strong> {feedstockSpec.fibreForm} ({feedstockSpec.particleOrFibreSizeMm})</p>
                    <p><strong>Retention &amp; Surface:</strong> {feedstockSpec.strengthRetentionPct}% strength retention · {feedstockSpec.surfaceCondition}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-[#123B32] uppercase tracking-wider border-b border-[#DCE5DF] pb-1">
                      2. Composite Formulation &amp; Processing
                    </h3>
                    <p><strong>Composition:</strong> {formulation.reinforcementMassPct}% r-GFRP + {formulation.matrixMassPct}% {MATRIX_SPECS[formulation.matrixId].name}</p>
                    <p><strong>Orientation &amp; Voids:</strong> {formulation.fibreOrientation} · {formulation.voidContentPct}% porosity</p>
                    <p><strong>Process Conditions:</strong> {formulation.processTempC}°C · {formulation.mouldingPressureMPa} MPa · {formulation.cycleTimeMin} min</p>
                    <p><strong>Property Model:</strong> {formulation.referenceLabel}</p>
                  </div>
                </div>

                {/* Section 2: Property Summary Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#123B32] uppercase tracking-wider border-b border-[#DCE5DF] pb-1">
                    3. Composite Mechanical &amp; Physical Test Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">Tensile Strength</span>
                      <span className="font-bold text-sm">{formulation.properties.tensileStrengthMPa} MPa</span>
                    </div>
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">Tensile Modulus</span>
                      <span className="font-bold text-sm">{formulation.properties.tensileModulusGPa} GPa</span>
                    </div>
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">Flexural Strength</span>
                      <span className="font-bold text-sm">{formulation.properties.flexuralStrengthMPa} MPa</span>
                    </div>
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">Compressive Strength</span>
                      <span className="font-bold text-sm">{formulation.properties.compressiveStrengthMPa} MPa</span>
                    </div>
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">Impact Strength</span>
                      <span className="font-bold text-sm">{formulation.properties.impactStrengthKJm2} kJ/m²</span>
                    </div>
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">24h Water Uptake</span>
                      <span className="font-bold text-sm">{formulation.properties.waterAbsorption24hPct}%</span>
                    </div>
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">Bulk Density</span>
                      <span className="font-bold text-sm">{formulation.properties.densityGcm3} g/cm³</span>
                    </div>
                    <div className="p-3 bg-[#F7F9F6] rounded-lg border border-[#DCE5DF]">
                      <span className="font-sans text-[#64716C] block">Shore D / Tg</span>
                      <span className="font-bold text-sm">
                        {formulation.properties.shoreDHardness}D / {formulation.properties.glassTransitionTempC ?? 'N/A'}°C
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Suitability Decision */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold text-[#123B32] uppercase tracking-wider border-b border-[#DCE5DF] pb-1">
                    4. Application Suitability Conclusion &amp; Limitations
                  </h3>
                  <p className="leading-relaxed">{evaluationReport.recommendationSummary}</p>
                  <p className="text-[#64716C]">
                    <strong>Intended Applications:</strong>{' '}
                    {evaluationReport.product.typicalApplications.join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
