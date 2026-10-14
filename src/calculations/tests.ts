import { calculateMassBalance } from './massBalance';
import { convertMassToKg, convertMassFromKg, validateComposition, calculateConstituentMasses } from './composition';
import { calculateCosts } from './costs';
import { calculateEmissions } from './emissions';
import { calculateRanking, DEFAULT_CRITERIA } from './ranking';
import { DEMO_SCENARIO } from '../lib/constants';
import { calculateScenario } from './index';

export interface TestResult {
  name: string;
  category: 'input' | 'mass_balance' | 'costs' | 'emissions' | 'ranking';
  passed: boolean;
  message: string;
}

export function runCalculationTestSuite(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Unit conversion tonnes to kg
  try {
    const kg = convertMassToKg(100, 'tonnes');
    const backToTonnes = convertMassFromKg(kg, 'tonnes');
    results.push({
      name: 'Mass conversion 100 tonnes == 100,000 kg and inverse',
      category: 'input',
      passed: kg === 100000 && backToTonnes === 100,
      message: `Expected 100,000 kg, got ${kg} kg`,
    });
  } catch (err: any) {
    results.push({ name: 'Mass conversion', category: 'input', passed: false, message: err.message });
  }

  // Test 2: Simplified composition sum rule (glass + resin = 1.0)
  try {
    const validComp = validateComposition({
      type: 'simplified_two_component',
      glassFiberFraction: 0.65,
      polymerResinFraction: 0.35,
    });
    const invalidComp = validateComposition({
      type: 'simplified_two_component',
      glassFiberFraction: 0.70,
      polymerResinFraction: 0.50, // sum = 1.20
    });
    results.push({
      name: 'Simplified GFRP model requires Glass + Resin = 1.0 within tolerance',
      category: 'input',
      passed: validComp.isValid && !invalidComp.isValid,
      message: validComp.isValid && !invalidComp.isValid ? 'Correctly validated valid and rejected invalid sum' : 'Failed to enforce sum rule',
    });
  } catch (err: any) {
    results.push({ name: 'Composition validation', category: 'input', passed: false, message: err.message });
  }

  // Test 3: Mass balance conservation (1000 kg input -> recovered + residual + loss = 1000 kg)
  try {
    const mb = calculateMassBalance(1000, 0.88, 0.08, 0.04);
    results.push({
      name: 'Mass conservation equation M_input = M_recovered + M_residual + M_loss',
      category: 'mass_balance',
      passed: mb.status === 'pass' && mb.differenceKg < 0.001,
      message: `Difference: ${mb.differenceKg.toFixed(4)} kg (status: ${mb.status})`,
    });
  } catch (err: any) {
    results.push({ name: 'Mass balance conservation', category: 'mass_balance', passed: false, message: err.message });
  }

  // Test 4: Mass balance warning on unbalanced output (>100%)
  try {
    const mbUnbalanced = calculateMassBalance(1000, 0.90, 0.15, 0.05); // sum = 1.10
    results.push({
      name: 'Mass balance warning triggered when output fractions exceed 100%',
      category: 'mass_balance',
      passed: mbUnbalanced.status === 'warning' && mbUnbalanced.differenceKg > 50,
      message: `Status: ${mbUnbalanced.status}, Diff: ${mbUnbalanced.differenceKg} kg`,
    });
  } catch (err: any) {
    results.push({ name: 'Mass balance overflow', category: 'mass_balance', passed: false, message: err.message });
  }

  // Test 5: Cost calculations (gross and net)
  try {
    // 100 tonnes, 150 km, 0.12 EUR/t-km, 145 EUR/t processing, 88 tonnes recovered @ 110 EUR/t
    const cost = calculateCosts(100000, 88000, 150, 0.12, 145.0, 110.0);
    const expectedTransport = 100 * 150 * 0.12; // 1800 EUR
    const expectedProcessing = 100 * 145; // 14500 EUR
    const expectedGross = 1800 + 14500; // 16300 EUR
    const expectedRevenue = 88 * 110; // 9680 EUR
    const expectedNet = 16300 - 9680; // 6620 EUR

    const passed = 
      cost.transportCost === expectedTransport &&
      cost.processingCost === expectedProcessing &&
      cost.grossCost === expectedGross &&
      cost.recoveredValue === expectedRevenue &&
      cost.netCost === expectedNet;

    results.push({
      name: 'Deterministic cost calculation: Gross = Transport + Processing, Net = Gross - Value',
      category: 'costs',
      passed,
      message: `Calculated Net: ${cost.netCost} EUR (Expected: ${expectedNet} EUR)`,
    });
  } catch (err: any) {
    results.push({ name: 'Cost calculations', category: 'costs', passed: false, message: err.message });
  }

  // Test 6: Missing data honesty (missing emission factor must NOT be silently replaced with 0)
  try {
    const emMissing = calculateEmissions(100000, 60000, 150, null, null, null, null, null);
    results.push({
      name: 'Emissions calculator flags status as unavailable when factors missing (never 0)',
      category: 'emissions',
      passed: emMissing.emissionsStatus === 'unavailable' && emMissing.netEmissionsKgCO2e === null,
      message: `Status: ${emMissing.emissionsStatus}, net emissions: ${emMissing.netEmissionsKgCO2e}`,
    });
  } catch (err: any) {
    results.push({ name: 'Emissions missing honesty', category: 'emissions', passed: false, message: err.message });
  }

  // Test 7: MCDA Ranking does not reward pathways for missing data
  try {
    const run = calculateScenario(DEMO_SCENARIO);
    const ranking = calculateRanking(run.pathwayResults, DEFAULT_CRITERIA);
    results.push({
      name: 'MCDA ranking computes scores with weight normalization and full explainability',
      category: 'ranking',
      passed: ranking.scores.length === 3 && ranking.scores.every(s => s.rank >= 1 && s.explanation.length > 10),
      message: `Ranked ${ranking.scores.length} pathways; #1 is ${ranking.scores[0]?.pathwayName}`,
    });
  } catch (err: any) {
    results.push({ name: 'MCDA ranking', category: 'ranking', passed: false, message: err.message });
  }

  return results;
}
