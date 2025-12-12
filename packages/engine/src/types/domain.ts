/**
 * Domain (search space) definitions
 */

export type VariableType = 'continuous' | 'integer' | 'categorical';

export interface ContinuousDimension {
  type: 'continuous';
  bounds: [number, number]; // closed interval [min, max]
  name?: string;
}

export interface IntegerDimension {
  type: 'integer';
  bounds: [number, number]; // closed interval [min, max], integers
  name?: string;
}

export interface CategoricalDimension {
  type: 'categorical';
  levels: string[]; // finite set of labels
  name?: string;
}

export type Dimension = ContinuousDimension | IntegerDimension | CategoricalDimension;

export interface Domain {
  dimensions: Dimension[];
}

export function getDomainBounds(domain: Domain): Array<[number, number]> {
  return domain.dimensions.map((dim) => {
    if (dim.type === 'categorical') {
      return [0, dim.levels.length - 1];
    }
    return dim.bounds;
  });
}

export function getDomainDimensionality(domain: Domain): number {
  return domain.dimensions.length;
}

export function isContinuousDomain(domain: Domain): boolean {
  return domain.dimensions.every((dim) => dim.type === 'continuous');
}

