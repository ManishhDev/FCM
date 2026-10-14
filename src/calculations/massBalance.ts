import { ValidationStatus } from '../types';

export interface MassBalanceResult {
  inputMassKg: number;
  recoveredMassKg: number;
  residualMassKg: number;
  lossMassKg: number;
  totalAccountedMassKg: number;
  differenceKg: number;
  errorPercent: number;
  status: ValidationStatus;
  notes: string[];
}

export function calculateMassBalance(
  inputMassKg: number,
  recoveryYield: number,
  residualFraction: number,
  lossFraction: number,
  tolerancePercent: number = 0.1 // 0.1% tolerance
): MassBalanceResult {
  const notes: string[] = [];

  // Protect against non-numeric or negative input
  if (inputMassKg <= 0 || isNaN(inputMassKg)) {
    return {
      inputMassKg: 0,
      recoveredMassKg: 0,
      residualMassKg: 0,
      lossMassKg: 0,
      totalAccountedMassKg: 0,
      differenceKg: 0,
      errorPercent: 0,
      status: 'fail',
      notes: ['Invalid or zero input waste mass.'],
    };
  }

  // Calculate mass for each mutually exclusive category
  const recoveredMassKg = inputMassKg * recoveryYield;
  const residualMassKg = inputMassKg * residualFraction;
  const lossMassKg = inputMassKg * lossFraction;

  const totalAccountedMassKg = recoveredMassKg + residualMassKg + lossMassKg;
  const differenceKg = Math.abs(inputMassKg - totalAccountedMassKg);
  const errorPercent = (differenceKg / inputMassKg) * 100;

  let status: ValidationStatus = 'pass';

  // Check validity constraints
  if (recoveryYield < 0 || residualFraction < 0 || lossFraction < 0) {
    status = 'fail';
    notes.push('Fraction yields cannot be negative.');
  }

  const fractionSum = recoveryYield + residualFraction + lossFraction;
  if (fractionSum > 1.005) {
    status = 'warning';
    notes.push(`Output fractions sum to ${(fractionSum * 100).toFixed(2)}%, exceeding 100% of input mass (apparent mass creation).`);
  } else if (fractionSum < 0.995) {
    status = 'warning';
    notes.push(`Output fractions sum to ${(fractionSum * 100).toFixed(2)}%, leaving ${((1 - fractionSum) * 100).toFixed(2)}% unaccounted for.`);
  }

  if (errorPercent > tolerancePercent) {
    if (status !== 'fail') status = 'warning';
    notes.push(`Mass balance discrepancy: ${differenceKg.toFixed(2)} kg (${errorPercent.toFixed(3)}%) exceeds the scientific tolerance threshold of ${tolerancePercent}%.`);
  } else {
    notes.push(`Mass conservation verified within ${tolerancePercent}% tolerance (discrepancy: ${differenceKg.toFixed(2)} kg).`);
  }

  return {
    inputMassKg,
    recoveredMassKg,
    residualMassKg,
    lossMassKg,
    totalAccountedMassKg,
    differenceKg,
    errorPercent,
    status,
    notes,
  };
}
