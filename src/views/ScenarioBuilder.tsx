import React, { useState } from 'react';
import { Scenario, MassUnit, DistanceUnit, CurrencyCode, CompositionModel, PathwayConfig } from '../types';
import { DEFAULT_PATHWAYS, PRESET_SCENARIOS } from '../lib/constants';
import { convertMassToKg, convertDistanceToKm, validateComposition } from '../calculations/composition';
import { 
  PlusCircle, 
  Layers, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle,
  Save,
  Wind,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Factory
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
  // Preset selector
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>(initialScenario?.name || 'Onshore GFRP Blade Recycling Analysis');
  const [description, setDescription] = useState<string>(
    initialScenario?.description || 'Comparative recycling analysis for decommissioned wind turbine blades.'
  );
  const [location, setLocation] = useState<string>(initialScenario?.location || 'Regional Wind Farm');
  
  // Core Mass & Distance
  const [inputMass, setInputMass] = useState<number>(initialScenario?.inputMass || 100);
  const [inputMassUnit, setInputMassUnit] = useState<MassUnit>(initialScenario?.inputMassUnit || 'tonnes');
  const [transportDistance, setTransportDistance] = useState<number>(initialScenario?.transportDistance || 150);
  const [transportDistanceUnit, setTransportDistanceUnit] = useState<DistanceUnit>(initialScenario?.transportDistanceUnit || 'km');
  const [currency, setCurrency] = useState<CurrencyCode>(initialScenario?.currency || 'EUR');

  // Advanced toggles
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const [dataSourceMode, setDataSourceMode] = useState<'verified' | 'custom' | 'demo'>(
    initialScenario?.dataSourceMode || 'verified'
  );

  // Quick preset loader
  const handleLoadPreset = (preset: Scenario) => {
    setSelectedPresetId(preset.id);
    setName(preset.name);
    setDescription(preset.description || '');
    setLocation(preset.location || '');
    setInputMass(preset.inputMass);
    setInputMassUnit(preset.inputMassUnit);
    setTransportDistance(preset.transportDistance);
    setTransportDistanceUnit(preset.transportDistanceUnit);
    setCurrency(preset.currency);
    setPriceYear(preset.priceYear);
    setGlassFiberPct(preset.composition.glassFiberFraction * 100);
    setResinPct(preset.composition.polymerResinFraction * 100);
    setTransportCostPerTonneKm(preset.transportCostPerTonneKm);
    setGridEmissionFactor(preset.gridEmissionFactorKgCO2ePerKWh);
    setFreightEmissionFactor(preset.freightEmissionFactorKgCO2ePerTonneKm);
    setPathways(JSON.parse(JSON.stringify(preset.pathways)));
    setDataSourceMode(preset.dataSourceMode);
  };

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DCE5DF]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
            {initialScenario ? 'Edit Scenario' : 'Quick Scenario Setup'}
          </h1>
          <p className="text-xs text-[#64716C] mt-1">
            Pick a quick preset or enter your blade scrap tonnage to immediately compare recycling pathways.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-[#64716C] hover:text-[#182522] px-3 py-1.5 rounded-lg border border-[#DCE5DF]"
        >
          Cancel
        </button>
      </div>

      {/* Instant 1-Click Presets */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#123B32]">
          <Sparkles className="w-4 h-4 text-[#A96512]" />
          <span>Quick Start Presets (1-Click Fill)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#176B5B] bg-[#EAF5EF] ring-1 ring-[#176B5B]/30'
                    : 'border-[#DCE5DF] bg-[#F7F9F6] hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold text-xs text-[#182522] truncate">{preset.name.split(' (')[0]}</div>
                <div className="text-[11px] font-mono text-[#176B5B] mt-0.5">
                  {preset.inputMass} {preset.inputMassUnit} · {preset.transportDistance} {preset.transportDistanceUnit}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Single-Screen Form */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-6">
        {/* Core Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#182522] block mb-1">
              Scenario Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2.5 text-xs text-[#182522] focus:ring-1 focus:ring-[#176B5B]"
              placeholder="e.g. 100t Blade Decommissioning Batch"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mass */}
            <div className="bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF] space-y-1">
              <label className="text-xs font-semibold text-[#182522] block">
                Total Blade Scrap Mass
              </label>
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputMass}
                  onChange={(e) => setInputMass(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-white border border-[#DCE5DF] rounded-lg p-2 font-mono text-sm font-semibold text-[#182522]"
                />
                <select
                  value={inputMassUnit}
                  onChange={(e) => setInputMassUnit(e.target.value as MassUnit)}
                  className="bg-white border border-[#DCE5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#182522]"
                >
                  <option value="tonnes">Tonnes (t)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
              <span className="text-[11px] font-mono text-[#64716C] block pt-1">
                = {inputMassKg.toLocaleString()} kg total
              </span>
            </div>

            {/* Distance */}
            <div className="bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF] space-y-1">
              <label className="text-xs font-semibold text-[#182522] block">
                Haulage Distance to Recycler
              </label>
              <div className="flex gap-2 pt-1">
                <input
                  type="number"
                  min="1"
                  value={transportDistance}
                  onChange={(e) => setTransportDistance(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-white border border-[#DCE5DF] rounded-lg p-2 font-mono text-sm font-semibold text-[#182522]"
                />
                <select
                  value={transportDistanceUnit}
                  onChange={(e) => setTransportDistanceUnit(e.target.value as DistanceUnit)}
                  className="bg-white border border-[#DCE5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#182522]"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles</option>
                </select>
              </div>
              <span className="text-[11px] font-mono text-[#64716C] block pt-1">
                = {transportDistanceKm.toFixed(0)} km highway freight
              </span>
            </div>
          </div>
        </div>

        {/* Pathway Checkbox Selector */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#182522] block">
            Select Pathways to Compare (Click to toggle)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pathways.map((p) => {
              const isMech = p.id === 'mechanical';
              const isTherm = p.id === 'thermal';
              const Icon = isMech ? Cpu : isTherm ? Flame : Factory;

              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => togglePathway(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    p.enabled
                      ? 'border-[#176B5B] bg-[#EAF5EF]/40 ring-1 ring-[#176B5B]/30 text-[#123B32]'
                      : 'border-[#DCE5DF] bg-[#F7F9F6] opacity-50 text-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${p.enabled ? 'text-[#176B5B]' : 'text-slate-400'}`} />
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-[#176B5B] pointer-events-none"
                      />
                    </div>
                    <div className="font-semibold text-xs text-[#182522]">{p.name.split(' (')[0]}</div>
                    <div className="text-[11px] text-[#64716C] mt-1 line-clamp-2">{p.outputDescription}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#DCE5DF]/60 text-[11px] font-mono font-medium text-[#176B5B]">
                    Yield: {(p.recoveryYield * 100).toFixed(0)}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Advanced Parameters */}
        <div className="border border-[#DCE5DF] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-4 bg-[#F7F9F6] hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-[#182522] transition-colors"
          >
            <span>Advanced Parameters (Composition, Currency, Freight & Grid Intensity)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="p-5 space-y-5 bg-white text-xs border-t border-[#DCE5DF]">
              {/* Material Composition Sliders */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#182522]">Material Composition:</span>
                  <span className="font-mono text-[#176B5B] font-bold">
                    {(compValidation.sum * 100).toFixed(0)}% Total ({compValidation.isValid ? 'Valid' : 'Discrepancy'})
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64716C]">Glass Fiber Fraction:</span>
                    <span className="font-mono font-bold text-[#176B5B]">{glassFiberPct}% ({((glassFiberPct / 100) * inputMassKg).toLocaleString()} kg)</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    value={glassFiberPct}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGlassFiberPct(val);
                      setResinPct(100 - val);
                    }}
                    className="w-full accent-[#176B5B]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64716C]">Polymer Resin Fraction:</span>
                    <span className="font-mono font-bold text-[#A96512]">{resinPct}% ({((resinPct / 100) * inputMassKg).toLocaleString()} kg)</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={resinPct}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setResinPct(val);
                      setGlassFiberPct(100 - val);
                    }}
                    className="w-full accent-[#A96512]"
                  />
                </div>
              </div>

              {/* Economic & Carbon Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#DCE5DF]">
                <div>
                  <label className="text-[#64716C] block mb-1">Currency:</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2 text-xs"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#64716C] block mb-1">Freight Rate ({currency}/t-km):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transportCostPerTonneKm ?? ''}
                    onChange={(e) => setTransportCostPerTonneKm(parseFloat(e.target.value) || null)}
                    className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[#64716C] block mb-1">Grid Carbon (kg CO₂e/kWh):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gridEmissionFactor ?? ''}
                    onChange={(e) => setGridEmissionFactor(parseFloat(e.target.value) || null)}
                    className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold rounded-lg border border-[#DCE5DF] text-[#182522] hover:bg-slate-100"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSaveAndRun}
            className="px-6 py-3 text-xs font-bold rounded-xl bg-[#123B32] hover:bg-[#176B5B] text-white shadow-md transition-all flex items-center gap-2"
          >
            <span>Compare Recycling Pathways Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
