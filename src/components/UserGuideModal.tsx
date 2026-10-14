import React from 'react';
import { 
  X, 
  Sparkles, 
  PlusCircle, 
  Layers, 
  Scale, 
  SlidersHorizontal, 
  Download, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDemo: () => void;
  onStartNew: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onStartDemo,
  onStartNew,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl border border-[#DCE5DF] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DCE5DF] bg-[#F7F9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#123B32] text-[#53A878] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="guide-title" className="text-base font-bold text-[#123B32]">
                How to Use BladeCycle
              </h2>
              <p className="text-xs text-[#64716C]">
                A 3-minute guide to comparing wind blade recycling options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64716C] hover:text-[#182522] hover:bg-slate-200 transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content steps */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-[#182522]">
          {/* Quick Start Option */}
          <div className="bg-[#EAF5EF] p-4 rounded-xl border border-[#176B5B]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-sm text-[#123B32] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#A96512]" />
                <span>Want to see it in action immediately?</span>
              </div>
              <p className="text-[11px] text-[#64716C] mt-0.5">
                Load our preconfigured 100-tonne illustrative decommissioning scenario.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onStartDemo();
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white shrink-0 flex items-center gap-1.5"
            >
              <span>Load 100 t Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#182522]">Create or Edit a Scenario</h3>
                <p className="text-[#64716C] mt-1 leading-relaxed">
                  Click <strong>New Analysis</strong> in the top bar. Enter blade scrap weight (in kg or tonnes), adjust the Glass Fiber vs. Resin mass fractions (validates to 100%), specify haulage distance to the recycling facility, and choose your preferred currency (EUR, USD, INR, GBP).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#182522]">Inspect the Comparison Dashboard</h3>
                <p className="text-[#64716C] mt-1 leading-relaxed">
                  Navigate tabs to inspect:
                </p>
                <ul className="list-disc list-inside text-[#64716C] mt-1 space-y-1">
                  <li><strong>Material Flow:</strong> Checks mass conservation (<span className="font-mono">M_in = M_recovered + M_residual + M_loss</span>) within 0.1% tolerance.</li>
                  <li><strong>Costs:</strong> Evaluates road transport logistics, gate processing OPEX, and secondary off-take market value offsets.</li>
                  <li><strong>Emissions:</strong> Compares gate-to-gate electricity carbon intensity and road freight. Missing data is tagged <em>Unavailable</em>, never zero!</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#182522]">Run Decision Ranking (MCDA)</h3>
                <p className="text-[#64716C] mt-1 leading-relaxed">
                  Go to <strong>Decision Ranking</strong>. Adjust criteria sliders (Cost, Recovery Yield, Carbon Footprint, Quality Tier) to match your organizational priorities. Set hard constraints (e.g. max net cost or mandatory mass balance pass) and read the written rationale for each ranking.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#182522]">Explore What-If Sensitivity & Tipping Points</h3>
                <p className="text-[#64716C] mt-1 leading-relaxed">
                  Go to <strong>Sensitivity</strong> to slide transport distance from 20 km to 800 km and observe where transport haulage flips the ranking between mechanical milling and local cement kiln co-processing.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center font-bold text-xs shrink-0">
                5
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#182522]">Trace Evidence & Export Reports</h3>
                <p className="text-[#64716C] mt-1 leading-relaxed">
                  Click any parameter to inspect its peer-reviewed DOI citation in the <strong>Evidence Library</strong>. When ready, click <strong>Export Report</strong> to download a clean CSV spreadsheet or generate a printable engineering PDF report.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DCE5DF] bg-[#F7F9F6] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onStartNew();
            }}
            className="text-xs font-semibold text-[#176B5B] hover:underline"
          >
            Start Fresh Analysis →
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] text-white hover:bg-[#176B5B] transition-colors"
          >
            Got it, let's explore
          </button>
        </div>
      </div>
    </div>
  );
};
