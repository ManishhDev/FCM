import React, { useState } from 'react';
import { Scenario, ScenarioCalculationRun, RankingCriterion } from '../types';
import { DEFAULT_CRITERIA, calculateRanking } from '../calculations/ranking';
import { 
  Scale, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  SlidersHorizontal,
  Award,
  Filter
} from 'lucide-react';

interface RecommendationViewProps {
  scenario: Scenario;
  run: ScenarioCalculationRun;
  onNavigateSensitivity: () => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({
  scenario,
  run,
  onNavigateSensitivity,
}) => {
  const [criteria, setCriteria] = useState<RankingCriterion[]>(DEFAULT_CRITERIA);
  const [maxCostConstraint, setMaxCostConstraint] = useState<number | undefined>(undefined);
  const [minRecoveryConstraint, setMinRecoveryConstraint] = useState<number | undefined>(undefined);
  const [requireMassBalancePass, setRequireMassBalancePass] = useState<boolean>(true);
  const [showTeacherScript, setShowTeacherScript] = useState<boolean>(false);

  // Update a single weight
  const handleWeightChange = (id: string, newWeight: number) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, weight: newWeight } : c));
  };

  const handleReset = () => {
    setCriteria(DEFAULT_CRITERIA);
    setMaxCostConstraint(undefined);
    setMinRecoveryConstraint(undefined);
    setRequireMassBalancePass(true);
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  // Run MCDA ranking engine
  const rankingResult = calculateRanking(run.pathwayResults, criteria, {
    maxNetCostPerTonne: maxCostConstraint,
    minRecoveryYieldPercent: minRecoveryConstraint,
    requireMassBalancePass,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-[#DCE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#176B5B]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
              Explainable Decision Ranking (MCDA)
            </h1>
          </div>
          <p className="text-xs text-[#64716C] mt-1">
            Multi-Criteria Decision Analysis evaluating feasible end-of-life routes based on transparent engineering weights and constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowTeacherScript(!showTeacherScript)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1.5 shadow-2xs ${
              showTeacherScript
                ? 'bg-[#123B32] text-white border-[#123B32]'
                : 'bg-[#EAF5EF] hover:bg-[#d8ede1] text-[#123B32] border-[#53A878]/50'
            }`}
          >
            <span>🎓</span>
            <span>{showTeacherScript ? 'Hide Script' : 'What to Say to Teacher'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#64716C]" />
            <span>Reset Weights</span>
          </button>
        </div>
      </div>

      {/* Expandable Teacher Demo Script Card */}
      {showTeacherScript && (
        <div className="p-4 rounded-xl border border-[#53A878]/40 bg-[#EAF5EF]/80 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🎓</span>
              <span className="font-bold text-xs uppercase tracking-wider text-[#123B32]">
                Presentation Cue: Explaining MCDA (Multi-Criteria Decision Analysis)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#176B5B] font-semibold">
              45-Second Script
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#DCE5DF] text-xs space-y-2">
            <p className="font-semibold text-[#176B5B]">🗣️ Say this word-for-word to your teacher:</p>
            <p className="italic text-[#182522] leading-relaxed">
              "Professor, real-world engineering decisions involve trade-offs between economics, circularity, and carbon footprints. Rather than relying on gut feelings, BladeCycle uses Multi-Criteria Decision Analysis (MCDA). Watch what happens when I adjust these sliders: if we prioritize economics, Cement Kiln ranks #1. But if we increase the weight for Circular Mass Recovery and Output Quality (for instance under strict EU recycling directives), Pyrolysis and Mechanical recycling move up. Every score is mathematically normalized, and the software writes an automated defensibility justification for why each route placed where it did."
            </p>
            <div className="pt-2 border-t border-[#DCE5DF] flex flex-wrap items-center gap-4 text-[11px] text-[#64716C]">
              <span>👉 <strong>Demo Action:</strong> Slide 'Cost Efficiency' down to 10 and slide 'Circular Mass Recovery' up to 80 to demonstrate ranking changes in front of your teacher!</span>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Weight Editor & Constraints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Sliders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#182522]">Decision Criteria & Relative Importance</h3>
            <span className="text-xs font-mono text-[#64716C]">
              Sum of Raw Weights: <strong className="text-[#182522]">{totalWeight}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {criteria.map((c) => {
              const normalizedPct = totalWeight > 0 ? ((c.weight / totalWeight) * 100).toFixed(0) : '0';
              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-[#182522]">{c.label}</span>
                      <span className="text-[#64716C] block text-[11px]">{c.description}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-[#176B5B] text-sm">{c.weight}</span>
                      <span className="text-[#64716C] text-[11px] block">({normalizedPct}% share)</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={c.weight}
                    onChange={(e) => handleWeightChange(c.id, parseInt(e.target.value) || 0)}
                    className="w-full accent-[#176B5B]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Hard Constraints Filter Panel */}
        <div className="bg-white rounded-xl border border-[#DCE5DF] p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-[#176B5B]" />
              <h3 className="font-semibold text-sm text-[#182522]">Hard Constraints (Gatekeeping)</h3>
            </div>
            <p className="text-xs text-[#64716C] leading-relaxed">
              Pathways violating these limits are marked unfeasible and excluded from ranking scores.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireMassBalancePass}
                  onChange={(e) => setRequireMassBalancePass(e.target.checked)}
                  className="w-4 h-4 rounded text-[#176B5B] focus:ring-[#176B5B] border-[#DCE5DF]"
                />
                <span className="text-[#182522]">Enforce Mass Balance Pass (0.1% tolerance)</span>
              </label>

              <div>
                <label className="text-[#64716C] block mb-1">Max Allowable Net Cost ({scenario.currency}/t):</label>
                <input
                  type="number"
                  placeholder="No ceiling"
                  value={maxCostConstraint ?? ''}
                  onChange={(e) => setMaxCostConstraint(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2 font-mono text-xs text-[#182522]"
                />
              </div>

              <div>
                <label className="text-[#64716C] block mb-1">Minimum Recovery Yield (%):</label>
                <input
                  type="number"
                  placeholder="e.g. 50%"
                  value={minRecoveryConstraint ?? ''}
                  onChange={(e) => setMinRecoveryConstraint(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full bg-[#F7F9F6] border border-[#DCE5DF] rounded-lg p-2 font-mono text-xs text-[#182522]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE5DF]">
            <button
              onClick={onNavigateSensitivity}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-[#EAF5EF] text-[#123B32] hover:bg-[#d5ece0] flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#176B5B]" />
              <span>Sensitivity Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ranking Results List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm text-[#182522]">Ranked Pathway Outlay & Score Contribution</h3>

        <div className="space-y-4">
          {rankingResult.scores.map((score) => {
            const isTopRank = score.rank === 1 && score.isFeasible;

            return (
              <div
                key={score.pathwayId}
                className={`bg-white rounded-xl border p-6 shadow-xs transition-all ${
                  isTopRank ? 'border-[#176B5B] ring-1 ring-[#176B5B]/30' : 'border-[#DCE5DF]'
                } ${!score.isFeasible ? 'opacity-70 bg-slate-50' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DCE5DF] gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl font-bold font-mono text-sm flex items-center justify-center ${
                        isTopRank
                          ? 'bg-[#123B32] text-white'
                          : score.isFeasible
                          ? 'bg-[#EAF5EF] text-[#176B5B]'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      #{score.rank}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#182522] flex items-center gap-2">
                        <span>{score.pathwayName}</span>
                        {isTopRank && (
                          <span className="text-[11px] font-normal text-[#176B5B] bg-[#EAF5EF] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            Recommended under current weights
                          </span>
                        )}
                      </h4>
                      {!score.isFeasible && (
                        <span className="text-xs text-[#B42318] font-medium block mt-0.5">
                          Unfeasible: {score.unfeasibleReason}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right font-mono">
                    <span className="text-xs text-[#64716C] block">MCDA Composite Score</span>
                    <span className="text-2xl font-bold text-[#182522] tabular-nums">
                      {score.compositeScore !== null ? score.compositeScore.toFixed(1) : '—'}
                      <span className="text-xs font-normal text-[#64716C] font-sans"> / 100</span>
                    </span>
                  </div>
                </div>

                {/* Score Decomposition by Criterion */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {score.criterionScores.map((cs) => {
                    const criterionObj = criteria.find(c => c.id === cs.criterionId);
                    return (
                      <div key={cs.criterionId} className="bg-[#F7F9F6] p-3 rounded-lg border border-[#DCE5DF]/60">
                        <span className="text-[11px] text-[#64716C] block truncate">{criterionObj?.label}</span>
                        <div className="mt-1 flex items-baseline justify-between font-mono">
                          <span className="font-semibold text-[#182522]">
                            {cs.rawMetricValue !== null ? `${cs.rawMetricValue.toFixed(1)} ${cs.rawMetricUnit}` : 'N/A'}
                          </span>
                          <span className="text-[11px] text-[#176B5B] font-medium">
                            +{cs.weightedContribution?.toFixed(1) ?? 0} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Written Rationale & Caveat */}
                <div className="mt-4 pt-3 border-t border-[#DCE5DF] space-y-2 text-xs">
                  <p className="text-[#182522] leading-relaxed">
                    <strong>Rationale:</strong> {score.explanation}
                  </p>
                  <p className="text-[#64716C] italic text-[11px]">
                    {score.sensitivityCaveat}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Defensibility Notice */}
      {rankingResult.defensibilityNotes.length > 0 && (
        <div className="bg-[#EAF3FB] border border-[#245D8A]/30 p-4 rounded-xl text-xs space-y-1 text-[#182522]">
          <div className="font-semibold text-[#245D8A] flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>MCDA Scientific Defensibility Notice</span>
          </div>
          {rankingResult.defensibilityNotes.map((note, idx) => (
            <p key={idx}>{note}</p>
          ))}
        </div>
      )}
    </div>
  );
};
