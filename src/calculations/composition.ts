import { CompositionModel, MassUnit, DistanceUnit } from '../types';

export interface CompositionValidationResult {
  isValid: boolean;
  sum: number;
  difference: number;
  errorMessage?: string;
  warningMessage?: string;
}

export function convertMassToKg(mass: number, unit: MassUnit): number {
  if (isNaN(mass) || mass <= 0) return 0;
  return unit === 'tonnes' ? mass * 1000 : mass;
}

export function convertMassFromKg(massKg: number, targetUnit: MassUnit): number {
  return targetUnit === 'tonnes' ? massKg / 1000 : massKg;
}

export function convertDistanceToKm(distance: number, unit: DistanceUnit): number {
  if (isNaN(distance) || distance < 0) return 0;
  return unit === 'miles' ? distance * 1.609344 : distance;
}

export function validateComposition(composition: CompositionModel): CompositionValidationResult {
  if (composition.type === 'simplified_two_component') {
    const sum = composition.glassFiberFraction + composition.polymerResinFraction;
    const diff = Math.abs(sum - 1.0);
    const tolerance = 0.005; // 0.5% tolerance for floating point rounding

    if (composition.glassFiberFraction < 0 || composition.glassFiberFraction > 1) {
      return {
        isValid: false,
        sum,
        difference: diff,
        errorMessage: 'Glass fiber mass fraction must be between 0.0 and 1.0 (0% - 100%).',
      };
    }

    if (composition.polymerResinFraction < 0 || composition.polymerResinFraction > 1) {
      return {
        isValid: false,
        sum,
        difference: diff,
        errorMessage: 'Polymer resin mass fraction must be between 0.0 and 1.0 (0% - 100%).',
      };
    }

    if (diff > tolerance) {
      return {
        isValid: false,
        sum,
        difference: diff,
        errorMessage: `Simplified GFRP model requires Glass + Resin fractions to equal 1.0 (currently ${(sum * 100).toFixed(1)}%).`,
      };
    }

    return {
      isValid: true,
      sum,
      difference: diff,
    };
  }

  // Extended blade model
  const core = composition.coreMaterialFraction ?? 0;
  const coatings = composition.coatingsAndAdhesivesFraction ?? 0;
  const metals = composition.metallicInsertsFraction ?? 0;
  const sum = composition.glassFiberFraction + composition.polymerResinFraction + core + coatings + metals;
  const diff = Math.abs(sum - 1.0);

  if (diff > 0.01) {
    return {
      isValid: false,
      sum,
      difference: diff,
      errorMessage: `Total constituent mass fractions must equal 100% (currently ${(sum * 100).toFixed(1)}%).`,
    };
  }

  return {
    isValid: true,
    sum,
    difference: diff,
  };
}

export function calculateConstituentMasses(
  totalMassKg: number,
  composition: CompositionModel
): {
  glassFiber: number;
  polymerResin: number;
  coreMaterial?: number;
  coatingsAndAdhesives?: number;
  metallicInserts?: number;
} {
  return {
    glassFiber: totalMassKg * composition.glassFiberFraction,
    polymerResin: totalMassKg * composition.polymerResinFraction,
    coreMaterial: composition.coreMaterialFraction ? totalMassKg * composition.coreMaterialFraction : undefined,
    coatingsAndAdhesives: composition.coatingsAndAdhesivesFraction ? totalMassKg * composition.coatingsAndAdhesivesFraction : undefined,
    metallicInserts: composition.metallicInsertsFraction ? totalMassKg * composition.metallicInsertsFraction : undefined,
  };
}
