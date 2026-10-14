import React from 'react';
import { AppView } from '../components/Navbar';
import { 
  Wind, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Leaf, 
  Scale, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Factory,
  Cpu
} from 'lucide-react';
import { EVIDENCE_SOURCES } from '../lib/constants';

interface LandingPageProps {
  onStartAnalysis: () => void;
  onExploreDemo: () => void;
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onExploreDemo,
  onNavigate,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-[#DCE5DF] bg-radial from-[#EAF5EF]/60 via-[#F7F9F6] to-[#F7F9F6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#176B5B] bg-[#EAF5EF] px-3.5 py-1.5 rounded-full border border-[#DCE5DF]">
            <Wind className="w-3.5 h-3.5" />
            <span>GFRP Wind Blade End-of-Life Decision Support</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#123B32] max-w-3xl mx-auto leading-[1.15]">
            Compare wind blade recycling pathways with evidence—not guesswork.
          </h1>

          <p className="text-lg text-[#64716C] max-w-2xl mx-auto leading-relaxed">
            Model material flows for glass-fiber-reinforced polymer (GFRP) wind turbine blades, audit mass balances, compare supported cost and GHG indicators, and generate transparent engineering reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl bg-[#123B32] hover:bg-[#176B5B] text-white shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start an Analysis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl bg-white hover:bg-slate-50 text-[#123B32] border border-[#DCE5DF] shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Illustrative Demo (100 t)</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#64716C]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#53A878]" />
              <span>Strict Mass Conservation (<span className="font-mono">M_in = M_out</span>)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#53A878]" />
              <span>Transparent Literature Provenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#53A878]" />
              <span>Explainable Multi-Criteria Ranking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Three Pathways Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#123B32]">
            Three Evaluated End-of-Life Routes
          </h2>
          <p className="text-sm text-[#64716C]">
            BladeCycle evaluates the three primary commercial and pilot recycling pathways currently viable for thermoset composite blades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pathway 1: Mechanical Recycling */}
          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs hover:border-[#176B5B]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#EAF5EF] text-[#176B5B] flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#182522]">Mechanical Recycling</h3>
              <p className="text-xs text-[#64716C] mt-1 font-mono">Shredding, Hammer Milling & Granulation</p>

              <p className="text-xs text-[#182522] mt-4 leading-relaxed">
                Blades are cut, shredded, and hammer-milled into fine powder and short fiber aggregates. Fibers and matrix remain bonded; primary product is secondary filler replacing calcium carbonate or talc in bulk molding compounds.
              </p>

              <div className="mt-4 space-y-2 border-t border-[#DCE5DF]/60 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Typical Mass Yield:</span>
                  <span className="font-mono font-semibold text-[#182522]">84% – 90%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Output Quality:</span>
                  <span className="font-medium text-amber-700">Downcycled Filler</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Specific Energy:</span>
                  <span className="font-mono text-[#182522]">~0.28 kWh / kg</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCE5DF] text-[11px] text-[#64716C] italic">
              Key limitation: Drastic fiber length shortening (&lt;1 mm) eliminates structural reinforcement value.
            </div>
          </div>

          {/* Pathway 2: Thermal Processing */}
          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs hover:border-[#176B5B]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#FFF4DE] text-[#A96512] flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#182522]">Thermal Processing</h3>
              <p className="text-xs text-[#64716C] mt-1 font-mono">Fluidized-Bed Pyrolysis (450°C–500°C)</p>

              <p className="text-xs text-[#182522] mt-4 leading-relaxed">
                Thermal degradation of the polymer resin matrix releases clean, discontinuous E-glass fibers. Polymer matrix volatilizes into pyrolytic gas/oil fuel, leaving char and recovered chopped glass fibers.
              </p>

              <div className="mt-4 space-y-2 border-t border-[#DCE5DF]/60 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Typical Mass Yield:</span>
                  <span className="font-mono font-semibold text-[#182522]">60% – 65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Output Quality:</span>
                  <span className="font-medium text-[#176B5B]">Reclaimed Glass Fiber</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Specific Energy:</span>
                  <span className="font-mono text-[#182522]">~2.15 kWh / kg</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCE5DF] text-[11px] text-[#64716C] italic">
              Key limitation: Fiber tensile strength reduced by 45–55%; high thermal energy input required.
            </div>
          </div>

          {/* Pathway 3: Cement-Kiln Co-Processing */}
          <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs hover:border-[#176B5B]/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#EAF3FB] text-[#245D8A] flex items-center justify-center mb-4">
                <Factory className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#182522]">Cement-Kiln Co-Processing</h3>
              <p className="text-xs text-[#64716C] mt-1 font-mono">High-Temperature Rotary Kiln (1450°C)</p>

              <p className="text-xs text-[#182522] mt-4 leading-relaxed">
                Composite scrap is pre-shredded and injected into a cement kiln. The polymer resin combusts, substituting coal/petcoke fuels, while glass minerals (silica, alumina) incorporate into Portland cement clinker.
              </p>

              <div className="mt-4 space-y-2 border-t border-[#DCE5DF]/60 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Mineral Clinker Offset:</span>
                  <span className="font-mono font-semibold text-[#182522]">~60% of mass</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Solid Landfill Residual:</span>
                  <span className="font-medium text-[#176B5B]">0% (Zero Landfill)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64716C]">Energy Contribution:</span>
                  <span className="font-mono text-[#182522]">~13–18 MJ / kg</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#DCE5DF] text-[11px] text-[#64716C] italic">
              Key limitation: Completely destroys fiber morphology; relies on commercial agreements with regional kilns.
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Workflow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-[#123B32] text-white rounded-2xl p-8 sm:p-12 shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold text-[#53A878] uppercase tracking-wider">
              Transparent Engineering Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">
              From Waste Scenario to Actionable Engineering Report
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#53A878] text-[#123B32] font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-semibold text-sm">Define Scenario</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter blade waste mass (kg or tonnes), validate constituent glass/resin fractions, and set transport distance.
              </p>
            </div>

            <div className="bg-white/10 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#53A878] text-[#123B32] font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-semibold text-sm">Audit Mass Balance</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our calculation engine verifies mass conservation within 0.1% tolerance, tracking recovered products, residuals, and losses.
              </p>
            </div>

            <div className="bg-white/10 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#53A878] text-[#123B32] font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-semibold text-sm">Compare Indicators</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspect gate-to-gate costs, logistics freight expenses, and preliminary GHG footprints with explicit source traceability.
              </p>
            </div>

            <div className="bg-white/10 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#53A878] text-[#123B32] font-bold text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-semibold text-sm">Explainable Decision</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adjust multi-criteria weights, explore sensitivity tipping points, and download reproducible CSV & formatted HTML reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology & Limitations Callout (PRD Section 1.2 & 16) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="border border-[#DCE5DF] bg-white rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-[#A96512]">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-semibold text-base text-[#182522]">
              Academic & Preliminary Engineering Disclaimer
            </h3>
          </div>
          <p className="text-xs text-[#64716C] leading-relaxed">
            BladeCycle is a preliminary decision-support tool designed for university engineering students, academic researchers, and early-stage waste planners. 
            <strong> It is not a certified industrial process model, regulatory compliance tool, or complete ISO 14040/44 life-cycle assessment (LCA).</strong>
          </p>
          <p className="text-xs text-[#64716C] leading-relaxed">
            All numerical parameters in the reference library are extracted from published literature (e.g. PMC11770760, Green Chemistry 2023, Composites Part B 2024). Demo values are visibly tagged as illustrative. Missing values are never silently replaced with zero.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs">
            <button
              onClick={() => onNavigate('methodology')}
              className="text-[#176B5B] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Read Full Methodology & Equations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('evidence')}
              className="text-[#176B5B] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Inspect Literature Evidence Library</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
