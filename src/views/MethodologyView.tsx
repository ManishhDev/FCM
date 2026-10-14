import React from 'react';
import { 
  FileText, 
  Wind, 
  Layers, 
  Flame, 
  Factory, 
  Cpu, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { EVIDENCE_SOURCES } from '../lib/constants';

export const MethodologyView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Header */}
      <div className="pb-6 border-b border-[#DCE5DF]">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#176B5B]" />
          <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
            Methodology, Science & System Boundaries
          </h1>
        </div>
        <p className="text-xs text-[#64716C] mt-1">
          Detailed engineering documentation of GFRP composite wind blade constituents, thermodynamic pathway models, and calculation equations.
        </p>
      </div>

      {/* SECTION 1: GFRP Wind Turbine Blade Anatomy */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#182522] flex items-center gap-2">
          <Wind className="w-5 h-5 text-[#176B5B]" />
          <span>1. Anatomy & Material Science of Wind Turbine Blades</span>
        </h2>
        <p className="text-xs text-[#182522] leading-relaxed">
          Modern utility-scale wind turbine blades (45 m to over 107 m in length) are sophisticated composite sandwich structures engineered to withstand cyclic aerodynamic loading, moisture, UV radiation, and extreme tip velocities. Unlike thermoplastics which can be repeatedly remelted and reshaped, wind blades predominantly utilize <strong>thermosetting polymer matrices</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Glass Fiber Reinforcement (55% – 70% by mass)</span>
            <p className="text-[#64716C] leading-relaxed">
              Continuous electrical-grade (E-glass) or high-strength (S-glass) rovings provide structural stiffness and tensile load resistance along the spar caps and aerodynamic shells. Surface sizing (silane coupling agents) binds fibers to the resin matrix.
            </p>
          </div>

          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Thermoset Polymer Matrix (25% – 40% by mass)</span>
            <p className="text-[#64716C] leading-relaxed">
              Epoxy, vinyl ester, or unsaturated polyester resins cured with chemical hardeners form three-dimensional, highly crosslinked covalent polymer networks. Once cured, they cannot be melted without chemical or thermal decomposition.
            </p>
          </div>

          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Sandwich Core Materials (3% – 10% by mass)</span>
            <p className="text-[#64716C] leading-relaxed">
              End-grain balsa wood, polyethylene terephthalate (PET) foam, or polyvinyl chloride (PVC) foam are sandwiched between composite skins in the shear webs and trailing edges to resist buckling without excessive weight.
            </p>
          </div>

          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Adhesives, Coatings & Lightning Systems (&lt;5% by mass)</span>
            <p className="text-[#64716C] leading-relaxed">
              Epoxy/polyurethane bonding pastes along the leading and trailing edges, polyurethane leading edge protection (LEP) tapes/gelcoats, and copper lightning protection downconductors.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: The Three Recycling Routes */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#182522] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#176B5B]" />
          <span>2. End-of-Life Recycling Pathways</span>
        </h2>

        {/* Route A: Mechanical */}
        <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#176B5B]">
            <Cpu className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#182522]">Pathway A: Mechanical Recycling (Milling & Granulation)</h3>
          </div>
          <p className="text-xs text-[#182522] leading-relaxed">
            Mechanical comminution reduces large blade segments through low-speed high-torque shredders, followed by high-speed hammer mills or rotary granulators and pneumatic cyclone sieving (mesh cut-offs 0.5 mm to 10 mm).
          </p>
          <div className="text-xs text-[#64716C] bg-[#F7F9F6] p-3 rounded-lg border border-[#DCE5DF] space-y-1">
            <div><strong>Mechanism:</strong> Physical shear and impact crushing; fiber and resin matrix remain bonded.</div>
            <div><strong>Mass Recovery:</strong> 84%–90% coarse powder / filler fraction; 6%–10% fine baghouse dust; 3%–5% fugitive losses.</div>
            <div><strong>Downcycling limitation:</strong> Fiber aspect ratio is drastically reduced (&lt;1 mm). Cannot replace structural reinforcement; functions solely as low-value mineral filler.</div>
          </div>
        </div>

        {/* Route B: Thermal Pyrolysis */}
        <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#A96512]">
            <Flame className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#182522]">Pathway B: Thermal Pyrolysis / Fluidized Bed Decomposition</h3>
          </div>
          <p className="text-xs text-[#182522] leading-relaxed">
            In an oxygen-deficient nitrogen atmosphere at 450°C to 500°C, the crosslinked polymer resin depolymerizes and volatilizes into hydrocarbon gas (syngas) and liquid pyrolytic oil. Clean, discontinuous glass fibers are recovered from bed cyclones.
          </p>
          <div className="text-xs text-[#64716C] bg-[#F7F9F6] p-3 rounded-lg border border-[#DCE5DF] space-y-1">
            <div><strong>Mechanism:</strong> Pyrolytic thermolysis of ester/ether bonds in crosslinked polymer.</div>
            <div><strong>Mass Yield:</strong> ~60%–65% clean recovered fiber; 10%–15% char & reactor slag; 20%–26% condensable/non-condensable offgas.</div>
            <div><strong>Material Degradation:</strong> Heat burns off the silane sizing and weakens glass structure, causing a 45%–55% loss in virgin tensile strength. Requires chemical resizing for structural composite compounding.</div>
          </div>
        </div>

        {/* Route C: Cement Kiln */}
        <div className="bg-white border border-[#DCE5DF] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#245D8A]">
            <Factory className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#182522]">Pathway C: Cement-Kiln Co-Processing</h3>
          </div>
          <p className="text-xs text-[#182522] leading-relaxed">
            Blade scrap is pre-shredded to nominal &lt;50 mm chips and injected into industrial Portland cement rotary kilns operating at flame temperatures up to 1,450°C.
          </p>
          <div className="text-xs text-[#64716C] bg-[#F7F9F6] p-3 rounded-lg border border-[#DCE5DF] space-y-1">
            <div><strong>Dual Energy & Material Substitution:</strong> The organic thermoset resin combusts exothermically (calorific value ~13–18 MJ/kg), displacing coal and petcoke fuels in the calciner. The inorganic E-glass (composed of SiO₂, Al₂O₃, CaO) incorporates into clinker crystal phases (alite C₃S and belite C₂S).</div>
            <div><strong>Zero Solid Residue:</strong> 100% of non-combustible mineral content is absorbed into cement; eliminates landfill disposal.</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Governing Mathematical Equations */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#182522] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#176B5B]" />
          <span>3. Mathematical Formulation & Mass Conservation</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Constituent Mass Apportionment:</span>
            <div className="font-mono bg-[#F7F9F6] p-2.5 rounded-lg text-[#123B32]">
              M_i = M_input × w_i, &nbsp;&nbsp; where ∑ w_i = 1.0 ± 0.005
            </div>
            <p className="text-[#64716C]">
              Calculates mass of glass fiber (M_glass), polymer resin (M_resin), and optional core constituents based on validated mass fractions.
            </p>
          </div>

          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Mass Balance Conservation Law:</span>
            <div className="font-mono bg-[#F7F9F6] p-2.5 rounded-lg text-[#123B32]">
              M_input = M_recovered + M_residual + M_loss
            </div>
            <p className="text-[#64716C]">
              Output categories are strictly mutually exclusive. If the absolute discrepancy <span className="font-mono">|M_input - ∑ M_outputs| / M_input &gt; 0.1%</span>, a warning flag is triggered.
            </p>
          </div>

          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Life-Cycle Economic Cost:</span>
            <div className="font-mono bg-[#F7F9F6] p-2.5 rounded-lg text-[#123B32]">
              C_net = (M_tonnes × D_km × r_transport) + (M_tonnes × OPEX_processing) - (M_rec_tonnes × Val_secondary)
            </div>
            <p className="text-[#64716C]">
              Gross logistics and plant operations cost minus realized market revenue from sold secondary milled filler or reclaimed chopped glass fibers.
            </p>
          </div>

          <div className="bg-white border border-[#DCE5DF] rounded-xl p-4 space-y-2">
            <span className="font-semibold text-[#182522]">Preliminary GHG Carbon Intensity (GWP100):</span>
            <div className="font-mono bg-[#F7F9F6] p-2.5 rounded-lg text-[#123B32]">
              E_net = (Q_energy × EF_grid) + (M_tonnes × D_km × EF_freight) + E_direct - E_avoided
            </div>
            <p className="text-[#64716C]">
              Evaluated under gate-to-gate plus freight transport boundary. Missing emission factors are displayed as Unavailable; they are never treated as zero.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: Primary Scientific Literature References */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#182522]">
          4. Peer-Reviewed Academic Citations & Starting Data
        </h2>

        <div className="space-y-3">
          {EVIDENCE_SOURCES.map((source, idx) => (
            <div key={source.id} className="bg-white border border-[#DCE5DF] rounded-xl p-4 text-xs space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[#176B5B]">[{idx + 1}]</span>
                <span className="font-semibold text-[#182522]">{source.title}</span>
              </div>
              {source.authors && <div className="text-[#64716C] pl-6">{source.authors} ({source.publicationYear})</div>}
              <div className="text-[#64716C] pl-6">{source.publisher}</div>
              <div className="pl-6 pt-1 flex items-center gap-3 font-mono">
                {source.doi && <span className="text-[#245D8A]">DOI: {source.doi}</span>}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#176B5B] hover:underline inline-flex items-center gap-1 font-sans font-medium"
                >
                  <span>Publisher Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
