import React, { useState } from 'react';
import { runCalculationTestSuite, TestResult } from '../calculations/tests';
import { CheckSquare, CheckCircle2, XCircle, RotateCcw, ShieldCheck, Terminal } from 'lucide-react';

export const TestSuiteView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>(() => runCalculationTestSuite());
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runCalculationTestSuite();
      setTestResults(results);
      setIsRunning(false);
    }, 200);
  };

  const totalPassed = testResults.filter(t => t.passed).length;
  const allPassed = totalPassed === testResults.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#DCE5DF] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#176B5B]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#123B32]">
              Automated Calculation & Unit Test Suite
            </h1>
          </div>
          <p className="text-xs text-[#64716C] mt-1">
            Validating input constraints, mass conservation tolerance, gross/net cost math, missing-data honesty, and MCDA ranking integrity.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Auditing Equations...' : 'Re-run Test Suite'}</span>
        </button>
      </div>

      {/* Test Suite Summary Banner */}
      <div
        className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          allPassed
            ? 'bg-[#EAF5EF] border-[#176B5B]/30 text-[#123B32]'
            : 'bg-[#FEECEB] border-[#B42318]/30 text-[#B42318]'
        }`}
      >
        <div className="flex items-center gap-3">
          {allPassed ? (
            <ShieldCheck className="w-8 h-8 text-[#53A878] shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-[#B42318] shrink-0" />
          )}
          <div>
            <h3 className="font-bold text-base">
              {allPassed ? 'All Automated Verification Tests Passed' : 'Test Discrepancy Detected'}
            </h3>
            <p className="text-xs mt-0.5 opacity-90">
              {totalPassed} of {testResults.length} test assertions verified against PRD specifications.
            </p>
          </div>
        </div>

        <div className="font-mono text-sm font-bold bg-white/70 px-4 py-2 rounded-xl border border-current self-start sm:self-auto">
          {totalPassed} / {testResults.length} PASSED
        </div>
      </div>

      {/* Tests Breakdown Table */}
      <div className="bg-white rounded-xl border border-[#DCE5DF] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#DCE5DF] flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[#182522] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#176B5B]" />
            <span>Executed Test Assertions</span>
          </h3>
          <span className="text-xs font-mono text-[#64716C]">PRD Section 11 Compliance</span>
        </div>

        <div className="divide-y divide-[#DCE5DF]">
          {testResults.map((t, idx) => (
            <div key={idx} className="p-4 flex items-start justify-between gap-4 text-xs hover:bg-[#F7F9F6]/60 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#53A878] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#B42318] shrink-0" />
                  )}
                  <span className="font-semibold text-[#182522]">{t.name}</span>
                  <span className="font-mono text-[10px] uppercase text-[#64716C] bg-[#F7F9F6] px-1.5 py-0.5 rounded border border-[#DCE5DF]/80">
                    {t.category}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#64716C] pl-6">
                  {t.message}
                </div>
              </div>

              <div className="shrink-0 font-mono font-bold">
                {t.passed ? (
                  <span className="text-[#176B5B]">PASS</span>
                ) : (
                  <span className="text-[#B42318]">FAIL</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
