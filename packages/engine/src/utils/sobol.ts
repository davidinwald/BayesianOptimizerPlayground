/**
 * Sobol sequence generator for space-filling designs
 * Simplified implementation - full version would use precomputed direction numbers
 */

import type { SeededRNG } from './rng';
import type { Domain } from '../types/domain';

export function sobolSample(
  domain: Domain,
  n: number,
  rng: SeededRNG
): number[][] {
  const d = domain.dimensions.length;
  const samples: number[][] = [];

  for (let i = 0; i < n; i++) {
    const point: number[] = [];
    for (let j = 0; j < d; j++) {
      const dim = domain.dimensions[j];
      if (dim.type === 'continuous') {
        const [min, max] = dim.bounds;
        // Simplified: use LHS-like sampling for now
        const u = (i + rng.next()) / n;
        point.push(min + u * (max - min));
      } else if (dim.type === 'integer') {
        const [min, max] = dim.bounds;
        const u = (i + rng.next()) / n;
        point.push(Math.round(min + u * (max - min)));
      } else {
        // Categorical: uniform random
        const idx = Math.floor(rng.next() * dim.levels.length);
        point.push(idx);
      }
    }
    samples.push(point);
  }

  return samples;
}

export function latinHypercubeSample(
  domain: Domain,
  n: number,
  rng: SeededRNG
): number[][] {
  const d = domain.dimensions.length;
  const samples: number[][] = [];

  // Generate LHS permutation for each dimension
  const permutations: number[][] = [];
  for (let j = 0; j < d; j++) {
    const perm = Array.from({ length: n }, (_, i) => i);
    // Shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    permutations.push(perm);
  }

  for (let i = 0; i < n; i++) {
    const point: number[] = [];
    for (let j = 0; j < d; j++) {
      const dim = domain.dimensions[j];
      const permIdx = permutations[j][i];
      const u = (permIdx + rng.next()) / n;

      if (dim.type === 'continuous') {
        const [min, max] = dim.bounds;
        point.push(min + u * (max - min));
      } else if (dim.type === 'integer') {
        const [min, max] = dim.bounds;
        point.push(Math.round(min + u * (max - min)));
      } else {
        const idx = Math.floor(u * dim.levels.length);
        point.push(idx);
      }
    }
    samples.push(point);
  }

  return samples;
}

