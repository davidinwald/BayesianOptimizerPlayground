/**
 * Domain utilities and validation
 */

export * from '../types/domain';

export function validateDomain(domain: import('../types/domain').Domain): void {
  if (!domain.dimensions || domain.dimensions.length === 0) {
    throw new Error('Domain must have at least one dimension');
  }

  for (const dim of domain.dimensions) {
    if (dim.type === 'continuous' || dim.type === 'integer') {
      const [min, max] = dim.bounds;
      if (min >= max) {
        throw new Error(`Invalid bounds for dimension: [${min}, ${max}]`);
      }
    } else if (dim.type === 'categorical') {
      if (!dim.levels || dim.levels.length === 0) {
        throw new Error('Categorical dimension must have at least one level');
      }
    }
  }
}

export function validatePoint(x: number[], domain: import('../types/domain').Domain): void {
  if (x.length !== domain.dimensions.length) {
    throw new Error(`Point dimension mismatch: expected ${domain.dimensions.length}, got ${x.length}`);
  }

  for (let i = 0; i < domain.dimensions.length; i++) {
    const dim = domain.dimensions[i];
    const value = x[i];

    if (dim.type === 'continuous') {
      const [min, max] = dim.bounds;
      if (value < min || value > max) {
        throw new Error(`Value ${value} out of bounds [${min}, ${max}] for dimension ${i}`);
      }
    } else if (dim.type === 'integer') {
      const [min, max] = dim.bounds;
      if (!Number.isInteger(value) || value < min || value > max) {
        throw new Error(`Value ${value} must be integer in [${min}, ${max}] for dimension ${i}`);
      }
    } else if (dim.type === 'categorical') {
      const index = Math.round(value);
      if (index < 0 || index >= dim.levels.length) {
        throw new Error(`Categorical index ${index} out of range [0, ${dim.levels.length})`);
      }
    }
  }
}

