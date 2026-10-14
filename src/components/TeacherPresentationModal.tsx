import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Play, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Scale, 
  SlidersHorizontal, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Flame, 
  Factory, 
  ShieldCheck, 
  AlertTriangle,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import { AppView } from './Navbar';
import { PRESET_SCENARIOS, DEMO_SCENARIO } from '../lib/constants';
import { Scenario } from '../types';

interface TeacherPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onLoadScenario: (scenario: Scenario) => void;
}

export const TeacherPresentationModal: React.FC<TeacherPresentationModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onLoadScenario,
}) => {
  const [activeTab, setActiveTab] = useState<'demo_script' | 'how_it_works' | 'teacher_qa' | 'quick_presets'>('demo_script');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleStepAction = (view: AppView, scenarioPresetIndex?: number) => {
    if (scenarioPresetIndex !== undefined && PRESET_SCENARIOS[scenarioPresetIndex]) {
      onLoadScenario(PRESET_SCENARIOS[scenarioPresetIndex]);
    }
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl border border-[#DCE5DF] max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DCE5DF] bg-[#F7F9F6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#123B32] text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5 text-[#53A878]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#123B32]">
                  Teacher Presentation & Live Demo Suite
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EAF5EF] text-[#176B5B] px-2 py-0.5 rounded-sm border border-[#176B5B]/20">
                  Ready to Present
                </span>
              </div>
              <p className="text-xs text-[#64716C]">
                Step-by-step demo script, scientific architecture explanation, and teacher viva defense answers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#64716C] hover:text-[#182522] hover:bg-slate-200 transition-colors"
            aria-label="Close presentation guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#DCE5DF] bg-white px-5 gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('demo_script')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'demo_script'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64716C] hover:text-[#182522]'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-[#53A878]" />
            <span>1. 3-Minute Live Demo Script</span>
          </button>
          <button
            onClick={() => setActiveTab('how_it_works')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'how_it_works'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64716C] hover:text-[#182522]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#176B5B]" />
            <span>2. How the Software Works (Architecture)</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher_qa')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'teacher_qa'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64716C] hover:text-[#182522]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#A96512]" />
            <span>3. Teacher Viva Q&A (Top Questions)</span>
          </button>
          <button
            onClick={() => setActiveTab('quick_presets')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'quick_presets'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64716C] hover:text-[#182522]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#245D8A]" />
            <span>4. 1-Click Demo Scenarios</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-[#182522] space-y-6">
          
          {/* TAB 1: 3-MINUTE LIVE DEMO SCRIPT */}
          {activeTab === 'demo_script' && (
            <div className="space-y-6">
              <div className="bg-[#EAF5EF] p-4 rounded-xl border border-[#176B5B]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#53A878]" />
                    <span>Quick Pitch for Your Teacher (Memorize or Read This):</span>
                  </div>
                  <p className="text-[#64716C] text-xs leading-relaxed">
                    "Wind turbine blades are made of thermoset composite plastic that cannot be simply melted down. By 2050, over 43 million tonnes of blade waste will accumulate. BladeCycle is an engineering decision-support tool that rigorously compares mechanical, thermal, and cement co-processing recycling pathways using verified mass balances, logistics costs, and GHG emission models."
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText(
                    "Wind turbine blades are made of thermoset composite plastic that cannot be simply melted down. By 2050, over 43 million tonnes of blade waste will accumulate. BladeCycle is an engineering decision-support tool that rigorously compares mechanical, thermal, and cement co-processing recycling pathways using verified mass balances, logistics costs, and GHG emission models.",
                    'pitch'
                  )}
                  className="px-3 py-1.5 rounded-lg border border-[#176B5B]/40 bg-white hover:bg-slate-50 text-[#123B32] font-semibold shrink-0 flex items-center gap-1.5"
                >
                  {copiedSection === 'pitch' ? <Check className="w-3.5 h-3.5 text-[#176B5B]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'pitch' ? 'Copied' : 'Copy Pitch'}</span>
                </button>
              </div>

              {/* Step by step demo guide */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#123B32] uppercase tracking-wider">
                  Follow These 4 Steps During Your Live Demo:
                </h3>

                {/* Step 1 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-[#F7F9F6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs">1</span>
                      Step 1: Open the Workspace & Load 100 Tonnes
                    </span>
                    <button
                      onClick={() => handleStepAction('compare', 0)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#123B32] text-white hover:bg-[#176B5B] flex items-center gap-1"
                    >
                      <span>Jump to Step 1</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] space-y-1">
                    <p className="font-semibold text-[#176B5B]">🗣️ What to say to your teacher:</p>
                    <p className="italic text-[#182522]">
                      "Here we define our decommissioning batch: 100 tonnes of blade composite waste (60% Glass Fiber, 35% Polymer Matrix). Notice the live slider: I can instantly simulate a 50t or 350t wind farm repowering, and the transport haulage distance."
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] space-y-1">
                    <p className="font-semibold text-[#123B32]">👀 What to show on screen:</p>
                    <p className="text-[#64716C]">
                      Drag the <strong>Blade Scrap Mass slider</strong> or click the <strong>50t / 100t / 350t</strong> buttons. Show the 3 pathway cards: Mechanical Milling, Pyrolysis, and Cement Kiln Co-processing.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-[#F7F9F6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs">2</span>
                      Step 2: Show Mass Balance Conservation Law
                    </span>
                    <button
                      onClick={() => handleStepAction('compare', 0)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#123B32] text-white hover:bg-[#176B5B] flex items-center gap-1"
                    >
                      <span>Show Material Flow</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] space-y-1">
                    <p className="font-semibold text-[#176B5B]">🗣️ What to say to your teacher:</p>
                    <p className="italic text-[#182522]">
                      "Every valid engineering model must obey the Law of Conservation of Mass: Input Mass equals Recovered Mass plus Residuals plus Losses. BladeCycle enforces an audit check with 0.1% tolerance. For 100 tonnes in Mechanical Recycling, we yield 72 tonnes of recovered recyclate, 23 tonnes of dust/fines, and 5 tonnes of baghouse loss."
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-[#F7F9F6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs">3</span>
                      Step 3: Multi-Criteria Decision Ranking (MCDA)
                    </span>
                    <button
                      onClick={() => handleStepAction('recommendation', 0)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#123B32] text-white hover:bg-[#176B5B] flex items-center gap-1"
                    >
                      <span>Show Decision Ranking</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] space-y-1">
                    <p className="font-semibold text-[#176B5B]">🗣️ What to say to your teacher:</p>
                    <p className="italic text-[#182522]">
                      "Engineers cannot optimize for only cost or only carbon. We built a Multi-Criteria Decision Analysis (MCDA) engine. If we prioritize cost, Cement Kiln ranks #1. But if we increase the weight for Circular Recovery Yield, Mechanical Milling overtakes it. The software explains the written scientific justification for why each pathway ranks where it does."
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-[#F7F9F6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs">4</span>
                      Step 4: Show Tipping Point Sensitivity Analysis & Report
                    </span>
                    <button
                      onClick={() => handleStepAction('sensitivity', 0)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#123B32] text-white hover:bg-[#176B5B] flex items-center gap-1"
                    >
                      <span>Show Sensitivity</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] space-y-1">
                    <p className="font-semibold text-[#176B5B]">🗣️ What to say to your teacher:</p>
                    <p className="italic text-[#182522]">
                      "Finally, in the Sensitivity module, we sweep transport haulage distance from 20 km to 800 km. This shows the logistics crossover tipping point where road transport emissions and freight freight costs overcome the benefits of centralized recycling facilities. We can then export a reproducible CSV audit or PDF report."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW THE SOFTWARE WORKS (ARCHITECTURE) */}
          {activeTab === 'how_it_works' && (
            <div className="space-y-6">
              <div className="bg-[#F7F9F6] p-4 rounded-xl border border-[#DCE5DF]">
                <h3 className="font-bold text-sm text-[#123B32] mb-1">
                  Core Engineering & Mathematical Architecture
                </h3>
                <p className="text-[#64716C] leading-relaxed">
                  BladeCycle is not just a UI form; it is a full-stack algorithmic decision model constructed from peer-reviewed literature (e.g. PMC11770760). Here are the 4 fundamental engineering components:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Module 1 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                  <div className="flex items-center gap-2 text-[#123B32]">
                    <Layers className="w-4 h-4 text-[#53A878]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">1. GFRP Blade Composition Engine</h4>
                  </div>
                  <p className="text-[#64716C] leading-relaxed">
                    Models the physical constituents of Glass-Fiber Reinforced Polymer:
                  </p>
                  <div className="bg-[#F7F9F6] p-2.5 rounded-lg font-mono text-[11px] text-[#123B32]">
                    M_in = M_fiber (60%) + M_matrix (35%) + M_other (5%)<br />
                    Enforces strict validation: Sum of fractions = 100.0%
                  </div>
                  <p className="text-[11px] text-[#64716C]">
                    Fiber provides mechanical tensile strength; polymer matrix is a crosslinked thermoset that cannot melt.
                  </p>
                </div>

                {/* Module 2 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                  <div className="flex items-center gap-2 text-[#123B32]">
                    <ShieldCheck className="w-4 h-4 text-[#176B5B]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">2. First Law Mass Conservation</h4>
                  </div>
                  <p className="text-[#64716C] leading-relaxed">
                    Audits mass flow across all process stages:
                  </p>
                  <div className="bg-[#F7F9F6] p-2.5 rounded-lg font-mono text-[11px] text-[#123B32]">
                    M_in = M_recovered + M_residual + M_loss<br />
                    Tolerance check: |M_in - M_accounted| / M_in &lt; 0.1%
                  </div>
                  <p className="text-[11px] text-[#64716C]">
                    Guarantees zero phantom material. If parameters violate conservation, an explicit alert is flagged.
                  </p>
                </div>

                {/* Module 3 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                  <div className="flex items-center gap-2 text-[#123B32]">
                    <Factory className="w-4 h-4 text-[#245D8A]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">3. Net Levelized Cost & LCA Emissions</h4>
                  </div>
                  <p className="text-[#64716C] leading-relaxed">
                    Computes gate fees, road freight logistics, and secondary market offset:
                  </p>
                  <div className="bg-[#F7F9F6] p-2.5 rounded-lg font-mono text-[11px] text-[#123B32]">
                    C_net = C_transport + C_processing - Value_recovered<br />
                    GHG_net = E_energy + E_transport - E_avoided
                  </div>
                  <p className="text-[11px] text-[#64716C]">
                    <strong>Scientific Honesty Policy:</strong> If published emission factors are not verified for a specific pathway, the software returns "Unavailable" rather than faking a 0 kg CO₂e value.
                  </p>
                </div>

                {/* Module 4 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                  <div className="flex items-center gap-2 text-[#123B32]">
                    <Scale className="w-4 h-4 text-[#A96512]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">4. Multi-Criteria Decision Analysis (MCDA)</h4>
                  </div>
                  <p className="text-[#64716C] leading-relaxed">
                    Combines conflicting engineering and environmental criteria:
                  </p>
                  <div className="bg-[#F7F9F6] p-2.5 rounded-lg font-mono text-[11px] text-[#123B32]">
                    Score_total = ∑ (w_i × Normalized_Score_i)<br />
                    Weights: Cost (35%) + Recovery (30%) + GHG (20%) + Quality (15%)
                  </div>
                  <p className="text-[11px] text-[#64716C]">
                    Includes automated sensitivity sweeps and defensibility checks to reveal why a pathway wins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEACHER VIVA Q&A */}
          {activeTab === 'teacher_qa' && (
            <div className="space-y-4">
              <div className="bg-[#FFF4DE] p-3 rounded-xl border border-[#A96512]/30 text-xs text-[#A96512]">
                <strong>Pro-Tip for Your Presentation:</strong> Teachers love asking about boundary conditions, assumptions, and why certain recycling pathways fail in real life. Here are the top answers to ace your viva!
              </div>

              {/* Question 1 */}
              <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                <h4 className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#123B32] text-white text-[10px] flex items-center justify-center font-bold">Q1</span>
                  Why can't wind blades just be melted down and re-molded like plastic bottles?
                </h4>
                <p className="text-[#64716C] leading-relaxed pl-7">
                  <strong>Answer:</strong> Thermoplastic bottles (like PET) have linear polymer chains that soften when heated. Wind turbine blades are made from <em>thermoset polymers</em> (crosslinked epoxy or vinyl ester) reinforced with glass fibers. Heating a thermoset does not melt it; it combusts and degrades. Therefore, we must use mechanical shredding, thermal pyrolysis, or cement co-processing to handle the composite matrix.
                </p>
              </div>

              {/* Question 2 */}
              <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                <h4 className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#123B32] text-white text-[10px] flex items-center justify-center font-bold">Q2</span>
                  How does Cement Kiln Co-Processing work, and why does it have negative net cost?
                </h4>
                <p className="text-[#64716C] leading-relaxed pl-7">
                  <strong>Answer:</strong> In a cement kiln (operating at &gt;1400°C), shredded blade scrap serves a dual purpose: the resin combusts as an alternative fuel replacing fossil coal, and the glass fiber mineralizes to replace sand and alumina in raw cement clinker. Because the cement manufacturer gets fuel and raw minerals, gate tipping fees are lower, resulting in the most economical pathway (~$124/tonne net cost).
                </p>
              </div>

              {/* Question 3 */}
              <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                <h4 className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#123B32] text-white text-[10px] flex items-center justify-center font-bold">Q3</span>
                  Why does your software show "Unavailable" instead of "0" for missing emissions?
                </h4>
                <p className="text-[#64716C] leading-relaxed pl-7">
                  <strong>Answer:</strong> In scientific LCA (Life Cycle Assessment), treating unverified or missing data as zero introduces massive bias, making unstudied pathways artificially look "zero emissions." Our software enforces a <em>Scientific Honesty Policy</em>: unless a verified peer-reviewed emission factor exists for that specific technology stage, it is flagged as "Unavailable" and excluded from ranking until verified data is entered.
                </p>
              </div>

              {/* Question 4 */}
              <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                <h4 className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#123B32] text-white text-[10px] flex items-center justify-center font-bold">Q4</span>
                  What is a "Tipping Point" in your Sensitivity Analysis?
                </h4>
                <p className="text-[#64716C] leading-relaxed pl-7">
                  <strong>Answer:</strong> A tipping point is the critical threshold of a variable (such as transport haulage distance in km) where the relative ranking of two pathways reverses. For instance, mechanical recycling may be optimal within 100 km, but past 380 km, the heavy diesel haulage emissions and freight costs tip the balance in favor of local cement kiln co-processing.
                </p>
              </div>

              {/* Question 5 */}
              <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white space-y-2">
                <h4 className="font-bold text-sm text-[#123B32] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#123B32] text-white text-[10px] flex items-center justify-center font-bold">Q5</span>
                  How is your software verified?
                </h4>
                <p className="text-[#64716C] leading-relaxed pl-7">
                  <strong>Answer:</strong> We have an automated built-in validation test suite (accessible via the <em>Test Engine</em> tab) that executes 11 automated test cases verifying unit conversions (tonnes to kg, miles to km), conservation of mass tolerances (&lt;0.1%), zero-division guards, and MCDA weight normalizations.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: 1-CLICK DEMO SCENARIOS */}
          {activeTab === 'quick_presets' && (
            <div className="space-y-4">
              <p className="text-[#64716C] leading-relaxed">
                Click any of these pre-configured engineering case studies to instantly load realistic data and jump directly to the comparison dashboard for your presentation:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Preset 1 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white hover:border-[#176B5B] transition-colors flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-2xl">🌱</span>
                    <h4 className="font-bold text-sm text-[#123B32] mt-2">100 t Standard Decommissioning</h4>
                    <p className="text-[#64716C] text-[11px] mt-1">
                      Baseline onshore decommissioning batch. 100 tonnes GFRP blade scrap with 150 km haulage distance.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStepAction('compare', 0)}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white transition-colors"
                  >
                    Load Standard 100t
                  </button>
                </div>

                {/* Preset 2 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white hover:border-[#176B5B] transition-colors flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-2xl">🌊</span>
                    <h4 className="font-bold text-sm text-[#123B32] mt-2">30 t Single Offshore Blade</h4>
                    <p className="text-[#64716C] text-[11px] mt-1">
                      High glass-content offshore blade (65% E-glass, 30% vinyl ester matrix) with 80 km coastal port transport.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStepAction('compare', 1)}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white transition-colors"
                  >
                    Load Offshore 30t
                  </button>
                </div>

                {/* Preset 3 */}
                <div className="p-4 rounded-xl border border-[#DCE5DF] bg-white hover:border-[#176B5B] transition-colors flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-2xl">🏭</span>
                    <h4 className="font-bold text-sm text-[#123B32] mt-2">350 t Large Wind Farm Repowering</h4>
                    <p className="text-[#64716C] text-[11px] mt-1">
                      Full commercial wind farm repowering project (20 turbines replaced), 350 tonnes scrap with 220 km haulage.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStepAction('compare', 2)}
                    className="w-full py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white transition-colors"
                  >
                    Load Commercial 350t
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-[#DCE5DF] bg-[#F7F9F6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#64716C] text-[11px] text-center sm:text-left">
            💡 Need to run the automated tests to prove calculations? Open <strong>Test Engine</strong>.
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onNavigate('test_suite');
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg border border-[#DCE5DF] bg-white hover:bg-slate-100 text-[#182522] font-semibold"
            >
              Open Test Suite
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white font-semibold transition-colors"
            >
              Close & Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
