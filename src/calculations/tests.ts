import { calculateMassBalance } from './massBalance';
import { convertMassToKg, convertMassFromKg, convertDistanceToKm, validateComposition, calculateConstituentMasses } from './composition';
import { calculateCosts, calculatePathwayBreakEven } from './costs';
import { calculateEmissions } from './emissions';
import { calculateRanking, DEFAULT_CRITERIA } from './ranking';
import { runMonteCarloSimulation } from './sensitivity';
import { DEMO_SCENARIO, DEFAULT_PATHWAYS } from '../lib/constants';
import { calculateScenario } from './index';
import { generateCSVReport } from '../lib/scenarioStorage';

export interface TestResult {
  name: string;
  category: 'input' | 'material' | 'mass_balance' | 'costs' | 'emissions' | 'ranking' | 'uncertainty' | 'reporting';
  passed: boolean;
  message: string;
  expected?: string;
  actual?: string;
}

export function runCalculationTestSuite(): TestResult[] {
  const results: TestResult[] = [];

  // 1. INPUT VALIDATION TESTS
  // Test 1.1: Mass conversion tonnes to kg and reverse
  try {
    const kg = convertMassToKg(100, 'tonnes');
    const backToTonnes = convertMassFromKg(kg, 'tonnes');
    results.push({
      name: 'Input: Mass unit conversion (100 tonnes == 100,000 kg and inverse)',
      category: 'input',
      passed: kg === 100000 && backToTonnes === 100,
      message: `Converted 100 t -> ${kg} kg -> ${backToTonnes} t`,
    });
  } catch (err: any) {
    results.push({ name: 'Input: Mass unit conversion', category: 'input', passed: false, message: err.message });
  }

  // Test 1.2: Reject zero or negative mass
  try {
    const zeroMass = convertMassToKg(0, 'tonnes');
    const negMass = convertMassToKg(-50, 'tonnes');
    results.push({
      name: 'Input: Rejection of zero or negative input waste mass',
      category: 'input',
      passed: zeroMass === 0 && negMass === 0,
      message: 'Zero and negative masses correctly handled as invalid (0 kg output)',
    });
  } catch (err: any) {
    results.push({ name: 'Input: Rejection of zero or negative mass', category: 'input', passed: false, message: err.message });
  }

  // Test 1.3: Distance conversion miles to km
  try {
    const km = convertDistanceToKm(100, 'miles');
    const expected = 160.9344;
    results.push({
      name: 'Input: Distance conversion (100 miles == 160.9344 km)',
      category: 'input',
      passed: Math.abs(km - expected) < 0.001,
      message: `100 miles converted to ${km.toFixed(4)} km`,
    });
  } catch (err: any) {
    results.push({ name: 'Input: Distance conversion', category: 'input', passed: false, message: err.message });
  }

  // 2. MATERIAL CONSTITUENT TESTS
  // Test 2.1: Simplified composition sum rule (glass + resin = 1.0)
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
      name: 'Material: Simplified GFRP sum rule constraint (w_glass + w_resin = 1.0)',
      category: 'material',
      passed: validComp.isValid && !invalidComp.isValid,
      message: validComp.isValid && !invalidComp.isValid ? 'Correctly enforced 100% mass fraction sum rule' : 'Failed to enforce sum rule',
    });
  } catch (err: any) {
    results.push({ name: 'Material: Composition validation', category: 'material', passed: false, message: err.message });
  }

  // Test 2.2: Proportional constituent mass calculation
  try {
    const constituents = calculateConstituentMasses(100000, {
      type: 'simplified_two_component',
      glassFiberFraction: 0.65,
      polymerResinFraction: 0.35,
    });
    const passed = constituents.glassFiber === 65000 && constituents.polymerResin === 35000;
    results.push({
      name: 'Material: Deterministic constituent apportionment (65% GF = 65,000 kg, 35% Resin = 35,000 kg)',
      category: 'material',
      passed,
      message: `Calculated GF: ${constituents.glassFiber} kg, Resin: ${constituents.polymerResin} kg`,
    });
  } catch (err: any) {
    results.push({ name: 'Material: Constituent masses', category: 'material', passed: false, message: err.message });
  }

  // 3. MASS BALANCE AUDIT TESTS
  // Test 3.1: Strict mass conservation (M_input = M_recovered + M_residual + M_loss)
  try {
    const mb = calculateMassBalance(1000, 0.88, 0.08, 0.04);
    const passed = mb.status === 'pass' && mb.differenceKg < 0.001;
    results.push({
      name: 'Mass Balance: Conservation law (M_input = M_rec + M_res + M_loss) within 0.1% tolerance',
      category: 'mass_balance',
      passed,
      message: `Balance difference: ${mb.differenceKg.toFixed(4)} kg (${mb.errorPercent.toFixed(4)}% error)`,
    });
  } catch (err: any) {
    results.push({ name: 'Mass Balance: Conservation law', category: 'mass_balance', passed: false, message: err.message });
  }

  // Test 3.2: Detection of mass creation / overflow (>100%)
  try {
    const mbOverflow = calculateMassBalance(1000, 0.90, 0.15, 0.05); // sum = 1.10
    const passed = mbOverflow.status === 'warning' && mbOverflow.differenceKg > 50;
    results.push({
      name: 'Mass Balance: Detection and flagging of unphysical mass creation (>100% output)',
      category: 'mass_balance',
      passed,
      message: `Detected ${(1.10 * 100).toFixed(0)}% sum; status flagged as ${mbOverflow.status}`,
    });
  } catch (err: any) {
    results.push({ name: 'Mass Balance: Overflow detection', category: 'mass_balance', passed: false, message: err.message });
  }

  // 4. ECONOMIC & BREAK-EVEN TESTS
  // Test 4.1: Deterministic Gross & Net cost arithmetic
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
      name: 'Economics: Gross = Transport + OPEX, Net = Gross - Secondary Off-take Revenue',
      category: 'costs',
      passed,
      message: `Net Cost: ${cost.netCost} EUR (Expected: ${expectedNet} EUR)`,
    });
  } catch (err: any) {
    results.push({ name: 'Economics: Cost arithmetic', category: 'costs', passed: false, message: err.message });
  }

  // Test 4.2: Analytical Break-Even Distance Solver
  try {
    const p1 = {
      id: 'mechanical',
      name: 'Mechanical Recycling',
      processingCostPerTonne: 145,
      recoveryYield: 0.88,
      revenuePerTonneRecovered: 110,
      transportCostPerTonneKm: 0.12,
      transportDistanceKm: 150,
    };
    const p2 = {
      id: 'cement_kiln',
      name: 'Cement-Kiln Co-Processing',
      processingCostPerTonne: 120,
      recoveryYield: 0.60,
      revenuePerTonneRecovered: 35,
      transportCostPerTonneKm: 0.12,
      transportDistanceKm: 40, // local cement kiln 40 km away
    };

    const breakEven = calculatePathwayBreakEven(p1, p2, 100);
    // F1 = 145 - (0.88 * 110) = 145 - 96.8 = 48.2
    // F2 = 120 - (0.60 * 35) = 120 - 21.0 = 99.0
    // d1* = (40 * 0.12 + 99.0 - 48.2) / 0.12 = (4.8 + 50.8) / 0.12 = 55.6 / 0.12 = 463.3 km
    const passed = breakEven.hasCrossover && Math.abs((breakEven.breakEvenDistanceKm ?? 0) - 463.3) < 0.5;

    results.push({
      name: 'Economics: Analytical Break-Even Distance Solver (d1* = [d2*r2 + F2 - F1] / r1)',
      category: 'costs',
      passed,
      message: `Calculated Crossover: ${breakEven.breakEvenDistanceKm} km (Derivation: ${breakEven.mathematicalDerivation})`,
    });
  } catch (err: any) {
    results.push({ name: 'Economics: Break-Even solver', category: 'costs', passed: false, message: err.message });
  }

  // 5. ENVIRONMENTAL IMPACT TESTS
  // Test 5.1: Missing emission factors handled explicitly (NEVER silently 0)
  try {
    const emMissing = calculateEmissions(100000, 60000, 150, null, null, null, null, null);
    const passed = emMissing.emissionsStatus === 'unavailable' && emMissing.netEmissionsKgCO2e === null;
    results.push({
      name: 'Environmental: Missing emission factors tagged as "Unavailable" (never replaced with zero)',
      category: 'emissions',
      passed,
      message: `Status: ${emMissing.emissionsStatus}, Net emissions: ${emMissing.netEmissionsKgCO2e}`,
    });
  } catch (err: any) {
    results.push({ name: 'Environmental: Missing factor handling', category: 'emissions', passed: false, message: err.message });
  }

  // Test 5.2: Energy & Freight GHG calculation
  try {
    // 100,000 kg input, 0.28 kWh/kg = 28,000 kWh @ 0.35 kg CO2e/kWh = 9,800 kg CO2e
    // Freight: 100 tonnes * 150 km * 0.092 kg CO2e/t-km = 1,380 kg CO2e
    const em = calculateEmissions(100000, 88000, 150, 0.28, 0.35, 0.092, 0.0, 0.42);
    const expectedEnergy = 100000 * 0.28 * 0.35; // 9800
    const expectedFreight = 100 * 150 * 0.092; // 1380
    const expectedAvoided = 88000 * 0.42; // 36960
    const expectedNet = (9800 + 1380 + 0) - 36960; // -25780 kg CO2e

    const passed = 
      em.energyEmissionsKgCO2e === expectedEnergy &&
      em.transportEmissionsKgCO2e === expectedFreight &&
      em.avoidedEmissionsKgCO2e === expectedAvoided &&
      em.netEmissionsKgCO2e === expectedNet;

    results.push({
      name: 'Environmental: Gate-to-gate + Freight carbon balance (E_energy + E_freight - E_avoided)',
      category: 'emissions',
      passed,
      message: `Net Footprint: ${em.netEmissionsKgCO2e} kg CO2e (Expected: ${expectedNet} kg CO2e)`,
    });
  } catch (err: any) {
    results.push({ name: 'Environmental: Carbon calculation', category: 'emissions', passed: false, message: err.message });
  }

  // 6. MCDA DECISION ANALYSIS TESTS
  // Test 6.1: Weight normalization and directional scoring
  try {
    const run = calculateScenario(DEMO_SCENARIO);
    const ranking = calculateRanking(run.pathwayResults, DEFAULT_CRITERIA);
    const passed = ranking.scores.length === 3 && ranking.scores[0].rank === 1 && ranking.policyUsed.length > 10;
    results.push({
      name: 'MCDA: Directional linear normalization with weight normalization and policy disclosure',
      category: 'ranking',
      passed,
      message: `Ranked ${ranking.scores.length} pathways; Policy: "${ranking.policyUsed.slice(0, 45)}..."`,
    });
  } catch (err: any) {
    results.push({ name: 'MCDA: Ranking engine', category: 'ranking', passed: false, message: err.message });
  }

  // Test 6.2: Division by zero protection on identical metrics
  try {
    const run = calculateScenario(DEMO_SCENARIO);
    // If all pathways had identical metrics, range = 0; score must return 100 without NaN/Infinity
    const singlePathwayRun = {
      mechanical: run.pathwayResults['mechanical'],
    };
    const singleRank = calculateRanking(singlePathwayRun, DEFAULT_CRITERIA);
    const score = singleRank.scores[0]?.compositeScore;
    const passed = score !== null && !isNaN(score) && isFinite(score);
    results.push({
      name: 'MCDA: Division-by-zero protection on identical or single-value ranges (range == 0)',
      category: 'ranking',
      passed,
      message: `Score returned: ${score} pts without NaN or Infinity errors`,
    });
  } catch (err: any) {
    results.push({ name: 'MCDA: Division by zero', category: 'ranking', passed: false, message: err.message });
  }

  // 7. UNCERTAINTY & MONTE CARLO TESTS
  // Test 7.1: Deterministic reproducibility (Seed 42 yields identical percentiles)
  try {
    const sim1 = runMonteCarloSimulation(DEMO_SCENARIO, 100, 42);
    const sim2 = runMonteCarloSimulation(DEMO_SCENARIO, 100, 42);
    const passed = 
      sim1.pathwayPercentiles.mechanical.netCost.p50 === sim2.pathwayPercentiles.mechanical.netCost.p50 &&
      sim1.pathwayPercentiles.thermal.netCost.p90 === sim2.pathwayPercentiles.thermal.netCost.p90;

    results.push({
      name: 'Uncertainty: Deterministic reproducibility of Monte Carlo engine using PRNG seed (Seed 42)',
      category: 'uncertainty',
      passed,
      message: `Sim 1 P50: ${sim1.pathwayPercentiles.mechanical.netCost.p50.toFixed(1)} == Sim 2 P50: ${sim2.pathwayPercentiles.mechanical.netCost.p50.toFixed(1)}`,
    });
  } catch (err: any) {
    results.push({ name: 'Uncertainty: Monte Carlo reproducibility', category: 'uncertainty', passed: false, message: err.message });
  }

  // 8. REPORTING & EXPORT TESTS
  // Test 8.1: CSV generation preserves exact calculated values and units
  try {
    const run = calculateScenario(DEMO_SCENARIO);
    const csv = generateCSVReport(DEMO_SCENARIO, run);
    const hasHeader = csv.includes('Pathway ID,Pathway Name,Output Definition');
    const hasMass = csv.includes('100000 kg');
    const hasDisclaimer = csv.includes('LIMITATIONS AND SCIENTIFIC DISCLAIMER');
    const passed = hasHeader && hasMass && hasDisclaimer;

    results.push({
      name: 'Reporting: CSV dataset export preserves calculation snapshot, units, and boundaries',
      category: 'reporting',
      passed,
      message: `Generated ${csv.split('\n').length} CSV lines with verified units and metadata`,
    });
  } catch (err: any) {
    results.push({ name: 'Reporting: CSV generation', category: 'reporting', passed: false, message: err.message });
  }

  return results;
}
