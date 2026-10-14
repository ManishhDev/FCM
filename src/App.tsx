import React, { useState, useMemo, useEffect } from 'react';
import { Scenario } from './types';
import { Navbar, AppView } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { DashboardView } from './views/DashboardView';
import { ScenarioBuilder } from './views/ScenarioBuilder';
import { ComparisonView } from './views/ComparisonView';
import { RecommendationView } from './views/RecommendationView';
import { SensitivityView } from './views/SensitivityView';
import { ScenarioCompareView } from './views/ScenarioCompareView';
import { EvidenceLibraryView } from './views/EvidenceLibraryView';
import { MethodologyView } from './views/MethodologyView';
import { ReportView } from './views/ReportView';
import { TestSuiteView } from './views/TestSuiteView';
import { 
  getStoredScenarios, 
  saveScenario, 
  duplicateScenario, 
  deleteScenario, 
  generateCSVReport, 
  downloadCSV 
} from './lib/scenarioStorage';
import { DEMO_SCENARIO } from './lib/constants';
import { calculateScenario } from './calculations';
import { Wind, ShieldCheck, Heart } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [scenarios, setScenarios] = useState<Scenario[]>(() => getStoredScenarios());
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(() => {
    const list = getStoredScenarios();
    return list.length > 0 ? list[0].id : null;
  });
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);

  // Synchronize state with storage
  const reloadScenarios = () => {
    const fresh = getStoredScenarios();
    setScenarios(fresh);
    if (!activeScenarioId || !fresh.some(s => s.id === activeScenarioId)) {
      setActiveScenarioId(fresh.length > 0 ? fresh[0].id : null);
    }
  };

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId) || scenarios[0] || DEMO_SCENARIO;
  }, [scenarios, activeScenarioId]);

  // Active scenario calculation run
  const activeCalculationRun = useMemo(() => {
    return calculateScenario(activeScenario);
  }, [activeScenario]);

  // Handlers
  const handleSelectScenario = (id: string) => {
    setActiveScenarioId(id);
  };

  const handleNewAnalysis = () => {
    setEditingScenario(null);
    setCurrentView('builder');
  };

  const handleEditScenario = () => {
    setEditingScenario(activeScenario);
    setCurrentView('builder');
  };

  const handleSaveScenario = (scenario: Scenario) => {
    saveScenario(scenario);
    reloadScenarios();
    setActiveScenarioId(scenario.id);
    setEditingScenario(null);
    setCurrentView('compare');
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateScenario(id);
    if (dup) {
      reloadScenarios();
      setActiveScenarioId(dup.id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this scenario? This operation cannot be undone.')) {
      deleteScenario(id);
      reloadScenarios();
    }
  };

  const handleLoadDemo = () => {
    saveScenario(DEMO_SCENARIO);
    reloadScenarios();
    setActiveScenarioId(DEMO_SCENARIO.id);
    setCurrentView('compare');
  };

  const handleExportCSV = () => {
    const csvContent = generateCSVReport(activeScenario, activeCalculationRun);
    const safeName = activeScenario.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`bladecycle_${safeName}_${dateStr}.csv`, csvContent);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9F6] text-[#182522]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        scenarios={scenarios}
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        onLoadDemo={handleLoadDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartAnalysis={handleNewAnalysis}
            onExploreDemo={handleLoadDemo}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelectScenario={handleSelectScenario}
            onNewAnalysis={handleNewAnalysis}
            onLoadDemo={handleLoadDemo}
            onDuplicateScenario={handleDuplicate}
            onDeleteScenario={handleDelete}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'builder' && (
          <ScenarioBuilder
            initialScenario={editingScenario}
            onSaveScenario={handleSaveScenario}
            onCancel={() => setCurrentView(scenarios.length > 0 ? 'compare' : 'dashboard')}
          />
        )}

        {currentView === 'compare' && (
          <ComparisonView
            scenario={activeScenario}
            run={activeCalculationRun}
            onEditScenario={handleEditScenario}
            onNavigate={setCurrentView}
            onExportCSV={handleExportCSV}
          />
        )}

        {currentView === 'recommendation' && (
          <RecommendationView
            scenario={activeScenario}
            run={activeCalculationRun}
            onNavigateSensitivity={() => setCurrentView('sensitivity')}
          />
        )}

        {currentView === 'sensitivity' && (
          <SensitivityView
            scenario={activeScenario}
            onBackToComparison={() => setCurrentView('compare')}
          />
        )}

        {currentView === 'scenario_compare' && (
          <ScenarioCompareView
            scenarios={scenarios}
            onSelectScenario={(id) => {
              handleSelectScenario(id);
              setCurrentView('compare');
            }}
          />
        )}

        {currentView === 'evidence' && <EvidenceLibraryView />}

        {currentView === 'methodology' && <MethodologyView />}

        {currentView === 'report' && (
          <ReportView
            scenario={activeScenario}
            run={activeCalculationRun}
            onBack={() => setCurrentView('compare')}
          />
        )}

        {currentView === 'test_suite' && <TestSuiteView />}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#DCE5DF] bg-white py-10 mt-16 text-xs text-[#64716C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#DCE5DF]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#123B32]">
                <Wind className="w-5 h-5 text-[#53A878]" />
                <span className="font-bold text-base tracking-tight">BladeCycle</span>
              </div>
              <p className="text-[11px] text-[#64716C]">
                Make every blade's next life count. Evidence-based decisions for wind blade recycling.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-medium">
              <button onClick={() => setCurrentView('landing')} className="hover:text-[#182522]">Overview</button>
              <button onClick={() => setCurrentView('dashboard')} className="hover:text-[#182522]">Dashboard</button>
              <button onClick={() => setCurrentView('evidence')} className="hover:text-[#182522]">Evidence Library</button>
              <button onClick={() => setCurrentView('methodology')} className="hover:text-[#182522]">Methodology & Boundaries</button>
              <button onClick={() => setCurrentView('test_suite')} className="hover:text-[#182522]">Test Engine</button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              BladeCycle is an engineering decision-support tool. It is not an ISO 14040/44 certified LCA or commercial certification system.
            </div>
            <div className="font-mono text-[#176B5B]">
              v1.4.0 · Open Engineering Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
