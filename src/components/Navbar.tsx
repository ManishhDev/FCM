import React, { useState } from 'react';
import { Scenario } from '../types';
import { 
  Wind, 
  BarChart3, 
  SlidersHorizontal, 
  BookOpen, 
  FileText, 
  PlusCircle, 
  Scale, 
  Activity, 
  GitCompare, 
  Layers, 
  Sparkles, 
  CheckSquare,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { UserGuideModal } from './UserGuideModal';

export type AppView = 
  | 'landing' 
  | 'dashboard' 
  | 'builder' 
  | 'compare' 
  | 'recommendation' 
  | 'sensitivity' 
  | 'scenario_compare' 
  | 'evidence' 
  | 'methodology' 
  | 'report'
  | 'test_suite';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onSelectScenario: (id: string) => void;
  onLoadDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onLoadDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const navItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: BarChart3 },
    { id: 'builder' as AppView, label: 'New Analysis', icon: PlusCircle },
    { id: 'compare' as AppView, label: 'Comparison', icon: Layers, requiresScenario: true },
    { id: 'recommendation' as AppView, label: 'Decision Ranking', icon: Scale, requiresScenario: true },
    { id: 'sensitivity' as AppView, label: 'Sensitivity', icon: SlidersHorizontal, requiresScenario: true },
    { id: 'scenario_compare' as AppView, label: 'Compare Batches', icon: GitCompare },
    { id: 'evidence' as AppView, label: 'Evidence Library', icon: BookOpen },
    { id: 'methodology' as AppView, label: 'Methodology', icon: FileText },
  ];

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE5DF]">
      {/* Top utility alert for illustrative demo if active scenario is demo */}
      {activeScenario?.isDemo && currentView !== 'landing' && (
        <div className="bg-[#FFF4DE] border-b border-[#A96512]/20 px-4 py-1.5 text-xs text-[#A96512] flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              <strong>Active Demo Scenario:</strong> Displaying illustrative sample data for demonstration. All calculations follow peer-reviewed equations.
            </span>
          </div>
          <button
            onClick={() => handleNavClick('builder')}
            className="hidden sm:inline-block underline font-medium hover:text-[#7e4609]"
          >
            Create Your Custom Scenario →
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#123B32] flex items-center justify-center text-white shadow-xs group-hover:bg-[#176B5B] transition-colors">
                <Wind className="w-5 h-5 text-[#53A878]" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-[#123B32] block leading-none">
                  BladeCycle
                </span>
                <span className="text-[10px] text-[#64716C] font-medium tracking-wide">
                  EVIDENCE-BASED RECYCLING ANALYSIS
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#EAF5EF] text-[#123B32] font-semibold'
                      : 'text-[#64716C] hover:text-[#182522] hover:bg-[#F7F9F6]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Scenario Quick Selector */}
            {scenarios.length > 0 && (
              <div className="relative">
                <select
                  value={activeScenarioId || ''}
                  onChange={(e) => onSelectScenario(e.target.value)}
                  className="text-xs bg-[#F7F9F6] border border-[#DCE5DF] text-[#182522] rounded-lg px-2.5 py-1.5 pr-8 focus:ring-1 focus:ring-[#176B5B] focus:border-[#176B5B] font-medium truncate max-w-[190px]"
                  aria-label="Active Scenario Selector"
                >
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.inputMass} {s.inputMassUnit})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* How to use Guide Trigger */}
            <button
              onClick={() => setGuideOpen(true)}
              className="p-2 text-xs rounded-lg border border-[#DCE5DF] bg-white hover:bg-[#F7F9F6] text-[#182522] transition-colors flex items-center gap-1.5 font-medium"
              title="How to use BladeCycle"
            >
              <HelpCircle className="w-4 h-4 text-[#176B5B]" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Test Suite Trigger */}
            <button
              onClick={() => handleNavClick('test_suite')}
              title="Run Automated Scientific Validation Tests"
              className={`p-2 text-xs rounded-lg border transition-colors flex items-center gap-1 ${
                currentView === 'test_suite'
                  ? 'bg-[#123B32] text-white border-[#123B32]'
                  : 'text-[#64716C] hover:text-[#182522] border-[#DCE5DF] bg-white'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-[#53A878]" />
              <span className="hidden xl:inline">Test Engine</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNavClick('builder')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#123B32] hover:bg-[#176B5B] text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#64716C] hover:text-[#182522] hover:bg-[#F7F9F6]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCE5DF] bg-white px-4 pt-3 pb-6 space-y-2">
          {scenarios.length > 0 && (
            <div className="pb-3 border-b border-[#DCE5DF]">
              <label className="text-[11px] font-semibold text-[#64716C] uppercase tracking-wider block mb-1">
                Active Scenario
              </label>
              <select
                value={activeScenarioId || ''}
                onChange={(e) => {
                  onSelectScenario(e.target.value);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs bg-[#F7F9F6] border border-[#DCE5DF] text-[#182522] rounded-lg p-2"
              >
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.inputMass} {s.inputMassUnit})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`p-2.5 text-xs font-medium rounded-lg text-left flex items-center gap-2 ${
                    isActive ? 'bg-[#EAF5EF] text-[#123B32] font-semibold' : 'text-[#64716C] hover:bg-[#F7F9F6]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#176B5B]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#DCE5DF] flex gap-2">
            <button
              onClick={() => handleNavClick('builder')}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#123B32] text-white text-center"
            >
              New Analysis
            </button>
            <button
              onClick={() => handleNavClick('test_suite')}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-[#DCE5DF] text-[#182522]"
            >
              Run Tests
            </button>
          </div>
        </div>
      )}

      {/* Interactive In-App User Guide Modal */}
      <UserGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onStartDemo={() => {
          onLoadDemo();
          handleNavClick('compare');
        }}
        onStartNew={() => {
          handleNavClick('builder');
        }}
      />
    </header>
  );
};
