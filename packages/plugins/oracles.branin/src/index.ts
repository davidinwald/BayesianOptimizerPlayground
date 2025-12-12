/**
 * Branin Function Oracle Plugin
 * Classic 2D test function with 3 global minima
 */

import type {
  PluginManifest,
  Domain,
  SeededRNG,
} from '@bo/engine';

import manifestData from '../manifest.json';
const manifest: PluginManifest = manifestData;

export interface OracleOptions {
  withNoise?: boolean;
  seed?: number;
  scale?: number;
  [key: string]: unknown;
}

export interface OracleResult {
  y: number;
  noiseStd?: number;
  info?: Record<string, unknown>;
}

/**
 * Branin function: f(x1, x2) = a(x2 - b*x1² + c*x1 - r)² + s(1-t)*cos(x1) + s
 * where a=1, b=5.1/(4π²), c=5/π, r=6, s=10, t=1/(8π)
 */
export function evaluate(
  x: number | number[] | number[][],
  options: OracleOptions = {},
  domain: Domain,
  rng?: SeededRNG
): OracleResult | OracleResult[] {
  // Normalize input
  const points: number[][] = Array.isArray(x[0]) ? (x as number[][]) : [[x as number | number[]].flat() as number[]];

  const results: OracleResult[] = [];

  for (const point of points) {
    if (point.length < 2) {
      throw new Error('Branin function requires 2D input');
    }

    const x1 = point[0];
    const x2 = point[1];

    // Branin parameters
    const a = 1;
    const b = 5.1 / (4 * Math.PI * Math.PI);
    const c = 5 / Math.PI;
    const r = 6;
    const s = 10;
    const t = 1 / (8 * Math.PI);

    // Compute Branin function
    const term1 = a * Math.pow(x2 - b * x1 * x1 + c * x1 - r, 2);
    const term2 = s * (1 - t) * Math.cos(x1);
    const value = term1 + term2 + s;

    let noiseStd = 0;
    let finalValue = value;

    if (options.withNoise && rng) {
      noiseStd = 0.1 * value; // 10% relative noise
      finalValue = value + (rng.next() - 0.5) * 2 * noiseStd;
    }

    results.push({
      y: finalValue,
      noiseStd: options.withNoise ? noiseStd : undefined,
      info: {
        trueValue: value,
        evaluatedAt: point,
      },
    });
  }

  return results.length === 1 ? results[0] : results;
}

/**
 * Get domain for Branin function
 */
export function getDomain(): Domain {
  return {
    dimensions: [
      {
        type: 'continuous',
        bounds: [-5, 10],
        name: 'x1',
      },
      {
        type: 'continuous',
        bounds: [0, 15],
        name: 'x2',
      },
    ],
  };
}

/**
 * Get true optimum (one of three global minima)
 */
export function getTrueOptimum(): { x: number[]; y: number } {
  // One of the three global minima (all have f ≈ 0.397887)
  return {
    x: [-Math.PI, 12.275],
    y: 0.397887,
  };
}

export { manifest };

