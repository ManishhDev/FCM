import React, { useState } from 'react';
import { Scenario, MassUnit, DistanceUnit, CurrencyCode, CompositionModel, PathwayConfig } from '../types';
import { DEFAULT_PATHWAYS } from '../lib/constants';
import { convertMassToKg, convertDistanceToKm, validateComposition } from '../calculations/composition';
import { 
  PlusCircle, 
  Layers, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle,
  Save,
  Wind
} from 'lucide-react';

interface ScenarioBuilderProps {
  initialScenario?: Scenario | null;
  onSaveScenario: (scenario: Scenario) => void;
  onCancel: () => void;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({
  initialScenario,
  onSaveScenario,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState<string>(initialScenario?.name || 'Onshore GFRP Blade Decommissioning Batch');
  const [description, setDescription] = useState<string>(
    initialScenario?.description || 'Preliminary end-of-life assessment for decommissioned onshore wind turbine blades.'
  );
  const [location, setLocation] = useState<string>(initialScenario?.location || 'Central Europe Regional Wind Farm');
  
  // Mass & Composition
  const [inputMass, setInputMass] = useState<number>(initialScenario?.inputMass || 50);
  const [inputMassUnit, setInputMassUnit] = useState<MassUnit>(initialScenario?.inputMassUnit || 'tonnes');
  const [compositionType, setCompositionType] = useState<'simplified_two_component' | 'extended_blade'>(
    initialScenario?.composition.type || 'simplified_two_component'
  );
  const [glassFiberPct, setGlassFiberPct] = useState<number>(
    initialScenario?.composition.glassFiberFraction ? initialScenario.composition.glassFiberFraction * 100 : 65
  );
  const [resinPct, setResinPct] = useState<number>(
    initialScenario?.composition.polymerResinFraction ? initialScenario.composition.polymerResinFraction * 100 : 35
  );
  const [corePct, setCorePct] = useState<number>(
    initialScenario?.composition.coreMaterialFraction ? initialScenario.composition.coreMaterialFraction * 100 : 0
  );

  // Logistics & Cost
  const [transportDistance, setTransportDistance] = useState<number>(initialScenario?.transportDistance || 120);
  const [transportDistanceUnit, setTransportDistanceUnit] = useState<DistanceUnit>(initialScenario?.transportDistanceUnit || 'km');
  const [currency, setCurrency] = useState<CurrencyCode>(initialScenario?.currency || 'EUR');
  const [priceYear, setPriceYear] = useState<number>(initialScenario?.priceYear || 2024);
  const [transportCostPerTonneKm, setTransportCostPerTonneKm] = useState<number | null>(
    initialScenario?.transportCostPerTonneKm ?? 0.12
  );
  const [gridEmissionFactor, setGridEmissionFactor] = useState<number | null>(
    initialScenario?.gridEmissionFactorKgCO2ePerKWh ?? 0.35
  );
  const [freightEmissionFactor, setFreightEmissionFactor] = useState<number | null>(
    initialScenario?.freightEmissionFactorKgCO2ePerTonneKm ?? 0.092
  );

  // Pathways
  const [pathways, setPathways] = useState<PathwayConfig[]>(
    initialScenario?.pathways ? JSON.parse(JSON.stringify(initialScenario.pathways)) : JSON.parse(JSON.stringify(DEFAULT_PATHWAYS))
  );

  // Data Source Mode
  const [dataSourceMode, setDataSourceMode] = useState<'verified' | 'custom' | 'demo'>(
    initialScenario?.dataSourceMode || 'verified'
  );

  // Live Calculations & Validation
  const inputMassKg = convertMassToKg(inputMass, inputMassUnit);
  const transportDistanceKm = convertDistanceToKm(transportDistance, transportDistanceUnit);

  const activeComposition: CompositionModel = {
    type: compositionType,
    glassFiberFraction: glassFiberPct / 100,
    polymerResinFraction: resinPct / 100,
    coreMaterialFraction: compositionType === 'extended_blade' && corePct > 0 ? corePct / 100 : undefined,
  };

  const compValidation = validateComposition(activeComposition);

  // Handle Pathway Toggle
  const togglePathway = (id: string) => {
    setPathways(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleSaveAndRun = () => {
    if (!name.trim()) return;
    if (inputMass <= 0) return;
    if (!compValidation.isValid) return;

    const enabledCount = pathways.filter(p => p.enabled).length;
    if (enabledCount === 0) return;

    const newScenario: Scenario = {
      id: initialScenario?.id || `scenario-${Date.now()}`,
      name,
      description,
      location,
      createdAt: initialScenario?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: dataSourceMode === 'demo',
      inputMass,
      inputMassUnit,
      inputMassKg,
      composition: activeComposition,
      transportDistance,
      transportDistanceUnit,
      transportDistanceKm,
      currency,
      priceYear,
      transportCostPerTonneKm,
      freightEmissionFactorKgCO2ePerTonneKm: freightEmissionFactor,
      gridEmissionFactorKgCO2ePerKWh: gridEmissionFactor,
      pathways,
      dataSourceMode,
    };

    onSaveScenario(newScenario);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Stepper Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DF]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
              {initialScenario ? 'Edit Scenario Parameters' : 'Create New Recycling Scenario'}
            </h1>
            <p className="text-xs text-[#64716C] mt-1">
              Follow the 5-step engineering setup to define waste mass, material fractions, logistics, and pathway models.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-[#64716C] hover:text-[#182522] px-3 py-1.5 rounded-lg border border-[#DCE5DF]"
          >
            Cancel
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="mt-6 flex items-center justify-between border-b border-[#DCE5DF] pb-4 text-xs font-medium">
          {[
            { stepNum: 1, label: '1. Details' },
            { stepNum: 2, label: '2. Mass & Composition' },
            { stepNum: 3, label: '3. Logistics & Cost' },
            { stepNum: 4, label: '4. Pathways' },
            { stepNum: 5, label: '5. Review & Run' },
          ].map((item) => (
            <button
              key={item.stepNum}
              onClick={() => setStep(item.stepNum)}
              className={`pb-2 border-b-2 -mb-4 transition-colors flex items-center gap-1.5 ${
                step === item.stepNum
                  ? 'border-[#176B5B] text-[#123B32] font-bold'
                  : step > item.stepNum
                  ? 'border-transparent text-[#176B5B]'
                  : 'border-transparent text-[#64716C] hover:text-[#182522]'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: SCENARIO DETAILS */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 space-y-6 shadow-xs">
          <h3 className="font-semibold text-base text-[#182522]">Step 1: Scenario Identification</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#182522] block mb-1">
                Scenario Name <span className="text-[#B42318]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 50-tonne Repowering Blade Batch"
                className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522] focus:ring-1 focus:ring-[#176B5B] focus:border-[#176B5B]"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-[#182522] block mb-1">
                Description / Context Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Details on wind turbine model, blade length, commissioning year, and project objective."
                className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522] focus:ring-1 focus:ring-[#176B5B] focus:border-[#176B5B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Location / Wind Farm Region
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Northern Germany / Gujarat Wind Hub"
                  className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Data Source Mode
                </label>
                <select
                  value={dataSourceMode}
                  onChange={(e) => setDataSourceMode(e.target.value as any)}
                  className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522]"
                >
                  <option value="verified">Verified Literature Reference Parameters</option>
                  <option value="custom">Custom Industrial Plant Inputs</option>
                  <option value="demo">Illustrative Demo Data Mode</option>
                </select>
                <p className="text-[11px] text-[#64716C] mt-1">
                  {dataSourceMode === 'verified' && 'Uses peer-reviewed studies (PMC11770760, Green Chem 2023).'}
                  {dataSourceMode === 'custom' && 'Lets you enter facility-specific yields and operating cost data.'}
                  {dataSourceMode === 'demo' && 'Clearly marks all generated reports as illustrative test runs.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#DCE5DF]">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white flex items-center gap-1.5"
            >
              <span>Next: Waste Mass & Composition</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: WASTE QUANTITY & COMPOSITION */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-[#182522]">Step 2: Waste Mass & Constituent Model</h3>
            <span className="text-xs font-mono text-[#176B5B] bg-[#EAF5EF] px-2.5 py-1 rounded-md">
              Internal Mass: {inputMassKg.toLocaleString()} kg
            </span>
          </div>

          <div className="space-y-6 text-xs">
            {/* Input Mass */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF]">
              <div className="sm:col-span-2">
                <label className="font-semibold text-[#182522] block mb-1">
                  Waste Quantity <span className="text-[#B42318]">*</span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputMass}
                  onChange={(e) => setInputMass(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#DCE5DF] rounded-lg p-2.5 font-mono text-sm text-[#182522]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Input Unit
                </label>
                <select
                  value={inputMassUnit}
                  onChange={(e) => setInputMassUnit(e.target.value as MassUnit)}
                  className="w-full bg-white border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522]"
                >
                  <option value="tonnes">Metric Tonnes (t)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
            </div>

            {/* Composition Model Selector */}
            <div className="space-y-3">
              <label className="font-semibold text-[#182522] block">
                Material Composition Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCompositionType('simplified_two_component');
                    setCorePct(0);
                  }}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    compositionType === 'simplified_two_component'
                      ? 'border-[#176B5B] bg-[#EAF5EF]/50 text-[#123B32]'
                      : 'border-[#DCE5DF] bg-white text-[#64716C] hover:bg-[#F7F9F6]'
                  }`}
                >
                  <div className="font-semibold text-xs">Simplified Two-Component GFRP</div>
                  <div className="text-[11px] mt-1 text-[#64716C]">
                    Considers E-Glass Fiber Reinforcement + Thermoset Polymer Resin Matrix (<span className="font-mono">w_glass + w_resin = 1.0</span>).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCompositionType('extended_blade')}
                  className={`p-3 rounded-xl border text-left transition-colors ${
                    compositionType === 'extended_blade'
                      ? 'border-[#176B5B] bg-[#EAF5EF]/50 text-[#123B32]'
                      : 'border-[#DCE5DF] bg-white text-[#64716C] hover:bg-[#F7F9F6]'
                  }`}
                >
                  <div className="font-semibold text-xs">Extended Blade Constituents</div>
                  <div className="text-[11px] mt-1 text-[#64716C]">
                    Includes structural core materials (Balsa wood / PET foam) and coating adhesives.
                  </div>
                </button>
              </div>
            </div>

            {/* Fraction Sliders and Numbers */}
            <div className="bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF] space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#182522]">Glass Fiber Mass Fraction (w_glass):</span>
                  <span className="font-mono font-bold text-[#176B5B]">{glassFiberPct}% ({((glassFiberPct / 100) * inputMassKg).toLocaleString()} kg)</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="85"
                  value={glassFiberPct}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setGlassFiberPct(val);
                    if (compositionType === 'simplified_two_component') {
                      setResinPct(100 - val);
                    }
                  }}
                  className="w-full accent-[#176B5B]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#182522]">Polymer Resin Mass Fraction (w_resin):</span>
                  <span className="font-mono font-bold text-[#A96512]">{resinPct}% ({((resinPct / 100) * inputMassKg).toLocaleString()} kg)</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="70"
                  value={resinPct}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setResinPct(val);
                    if (compositionType === 'simplified_two_component') {
                      setGlassFiberPct(100 - val);
                    }
                  }}
                  className="w-full accent-[#A96512]"
                />
              </div>

              {compositionType === 'extended_blade' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#182522]">Core Material (Balsa / PVC Foam):</span>
                    <span className="font-mono font-bold text-[#245D8A]">{corePct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={corePct}
                    onChange={(e) => setCorePct(parseFloat(e.target.value))}
                    className="w-full accent-[#245D8A]"
                  />
                </div>
              )}

              {/* Live Mass Sum Check */}
              <div className="pt-2 border-t border-[#DCE5DF] flex items-center justify-between text-xs">
                <span>Sum of Mass Fractions:</span>
                <span className={`font-mono font-semibold ${compValidation.isValid ? 'text-[#176B5B]' : 'text-[#B42318]'}`}>
                  {(compValidation.sum * 100).toFixed(1)}% {compValidation.isValid ? '(Valid 100%)' : `(Discrepancy: ${(compValidation.difference * 100).toFixed(1)}%)`}
                </span>
              </div>
              {!compValidation.isValid && (
                <div className="text-[11px] text-[#B42318] bg-red-50 p-2 rounded-md">
                  {compValidation.errorMessage}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#DCE5DF]">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] text-[#182522] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!compValidation.isValid}
              className={`px-5 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 text-white ${
                compValidation.isValid ? 'bg-[#123B32] hover:bg-[#176B5B]' : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <span>Next: Logistics & Cost</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: LOGISTICS & COST BASIS */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 space-y-6 shadow-xs">
          <h3 className="font-semibold text-base text-[#182522]">Step 3: Transport Logistics & Economic Basis</h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Haulage Distance from Wind Park to Recycling Facility
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={transportDistance}
                    onChange={(e) => setTransportDistance(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 font-mono text-xs text-[#182522]"
                  />
                  <select
                    value={transportDistanceUnit}
                    onChange={(e) => setTransportDistanceUnit(e.target.value as DistanceUnit)}
                    className="bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522]"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Currency & Price Base Year
                </label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="flex-1 bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522]"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <input
                    type="number"
                    value={priceYear}
                    onChange={(e) => setPriceYear(parseInt(e.target.value) || 2024)}
                    className="w-24 bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 font-mono text-xs text-[#182522]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Road Freight Rate ({currency}/t-km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={transportCostPerTonneKm ?? ''}
                  onChange={(e) => setTransportCostPerTonneKm(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 0.12"
                  className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 font-mono text-xs text-[#182522]"
                />
                <span className="text-[10px] text-[#64716C] mt-0.5 block">Standard heavy articulated truck</span>
              </div>

              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Electricity Grid Carbon Factor
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={gridEmissionFactor ?? ''}
                  onChange={(e) => setGridEmissionFactor(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 0.35 kg CO2e/kWh"
                  className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 font-mono text-xs text-[#182522]"
                />
                <span className="text-[10px] text-[#64716C] mt-0.5 block">kg CO₂e per kWh grid electricity</span>
              </div>

              <div>
                <label className="font-semibold text-[#182522] block mb-1">
                  Freight Carbon Factor
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={freightEmissionFactor ?? ''}
                  onChange={(e) => setFreightEmissionFactor(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="e.g. 0.092"
                  className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 font-mono text-xs text-[#182522]"
                />
                <span className="text-[10px] text-[#64716C] mt-0.5 block">kg CO₂e per tonne-km (EN 16258)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#DCE5DF]">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] text-[#182522] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white flex items-center gap-1.5"
            >
              <span>Next: Pathway Models</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: PATHWAYS SELECTION */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="font-semibold text-base text-[#182522]">Step 4: Select Pathways & Operational Parameters</h3>
            <p className="text-xs text-[#64716C] mt-1">
              Select which pathways to include in the comparative evaluation. You can also customize processing costs and yields.
            </p>
          </div>

          <div className="space-y-4">
            {pathways.map((p, idx) => (
              <div
                key={p.id}
                className={`border rounded-xl p-4 transition-colors ${
                  p.enabled ? 'border-[#176B5B] bg-[#EAF5EF]/20' : 'border-[#DCE5DF] bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`chk-${p.id}`}
                      checked={p.enabled}
                      onChange={() => togglePathway(p.id)}
                      className="w-4 h-4 rounded-xs text-[#176B5B] focus:ring-[#176B5B] border-[#DCE5DF]"
                    />
                    <div>
                      <label htmlFor={`chk-${p.id}`} className="font-semibold text-sm text-[#182522] cursor-pointer">
                        {p.name}
                      </label>
                      <p className="text-xs text-[#64716C] mt-0.5">{p.technologyDefinition}</p>
                    </div>
                  </div>
                </div>

                {p.enabled && (
                  <div className="mt-4 pt-3 border-t border-[#DCE5DF]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[#64716C] block">Recovery Yield:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          max="1.0"
                          value={p.recoveryYield}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPathways(prev => prev.map(item => item.id === p.id ? { ...item, recoveryYield: val } : item));
                          }}
                          className="w-20 bg-white border border-[#DCE5DF] rounded-md p-1.5 font-mono text-xs text-[#182522]"
                        />
                        <span className="text-[#64716C]">({(p.recoveryYield * 100).toFixed(0)}%)</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#64716C] block">Residual Fraction:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0.0"
                          max="1.0"
                          value={p.residualFraction}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setPathways(prev => prev.map(item => item.id === p.id ? { ...item, residualFraction: val } : item));
                          }}
                          className="w-20 bg-white border border-[#DCE5DF] rounded-md p-1.5 font-mono text-xs text-[#182522]"
                        />
                        <span className="text-[#64716C]">({(p.residualFraction * 100).toFixed(0)}%)</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#64716C] block">Processing OPEX:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={p.processingCostPerTonne ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            setPathways(prev => prev.map(item => item.id === p.id ? { ...item, processingCostPerTonne: val } : item));
                          }}
                          className="w-20 bg-white border border-[#DCE5DF] rounded-md p-1.5 font-mono text-xs text-[#182522]"
                        />
                        <span className="text-[#64716C]">{currency}/t</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#64716C] block">Recovered Off-take Value:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          value={p.revenuePerTonneRecovered ?? ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : null;
                            setPathways(prev => prev.map(item => item.id === p.id ? { ...item, revenuePerTonneRecovered: val } : item));
                          }}
                          className="w-20 bg-white border border-[#DCE5DF] rounded-md p-1.5 font-mono text-xs text-[#182522]"
                        />
                        <span className="text-[#64716C]">{currency}/t</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-[#DCE5DF]">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] text-[#182522] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white flex items-center gap-1.5"
            >
              <span>Next: Review & Validation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & RUN */}
      {step === 5 && (
        <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="font-semibold text-base text-[#182522]">Step 5: Pre-Flight Scientific Review</h3>
            <p className="text-xs text-[#64716C] mt-1">
              Verify your scenario parameters prior to executing the comparative material balance and economic models.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF] space-y-2">
              <div className="flex justify-between py-1 border-b border-[#DCE5DF]/60">
                <span className="text-[#64716C]">Scenario Name:</span>
                <span className="font-semibold text-[#182522]">{name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE5DF]/60">
                <span className="text-[#64716C]">Modelled Input Waste Mass:</span>
                <span className="font-mono font-semibold text-[#182522]">
                  {inputMass.toLocaleString()} {inputMassUnit} ({inputMassKg.toLocaleString()} kg)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE5DF]/60">
                <span className="text-[#64716C]">Material Composition:</span>
                <span className="font-mono text-[#182522]">
                  GF: {glassFiberPct}% ({((glassFiberPct / 100) * inputMassKg).toLocaleString()} kg) · Resin: {resinPct}% ({((resinPct / 100) * inputMassKg).toLocaleString()} kg)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE5DF]/60">
                <span className="text-[#64716C]">Logistics Haulage:</span>
                <span className="font-mono text-[#182522]">
                  {transportDistance} {transportDistanceUnit} ({transportDistanceKm.toFixed(0)} km)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE5DF]/60">
                <span className="text-[#64716C]">Economic Currency:</span>
                <span className="font-mono text-[#182522]">{currency} ({priceYear} price basis)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64716C]">Active Comparative Pathways:</span>
                <span className="font-semibold text-[#176B5B]">
                  {pathways.filter(p => p.enabled).map(p => p.name.split(' (')[0]).join(', ')}
                </span>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="space-y-2 pt-2">
              <h4 className="font-semibold text-[#182522]">Validation Readiness Checklist</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#176B5B]">
                  <CheckCircle2 className="w-4 h-4 text-[#53A878]" />
                  <span>Input mass is positive and normalized to internal kilograms.</span>
                </div>
                <div className="flex items-center gap-2 text-[#176B5B]">
                  <CheckCircle2 className="w-4 h-4 text-[#53A878]" />
                  <span>Constituent fractions satisfy sum rule (<span className="font-mono">{(compValidation.sum * 100).toFixed(1)}%</span>).</span>
                </div>
                <div className="flex items-center gap-2 text-[#176B5B]">
                  <CheckCircle2 className="w-4 h-4 text-[#53A878]" />
                  <span>At least one supported recycling pathway is enabled.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#DCE5DF]">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] text-[#182522] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSaveAndRun}
              className="px-6 py-3 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Run Comparison & Open Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
