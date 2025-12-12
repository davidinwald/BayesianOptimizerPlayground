/**
 * Template Oracle Plugin
 * 
 * Copy this template to create a new oracle plugin.
 * Implement the required methods according to the plugin API spec.
 */

import type {
  PluginManifest,
  Domain,
  SeededRNG,
} from '@bo/engine';

const manifest: PluginManifest = require('../manifest.json');

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
 * Evaluate the objective function at point(s) x
 */
export function evaluate(
  x: number | number[] | number[][],
  options: OracleOptions = {},
  domain: Domain,
  rng?: SeededRNG
): OracleResult | OracleResult[] {
  // Handle single point
  if (typeof x === 'number') {
    x = [x];
  }
  if (Array.isArray(x[0]) && typeof x[0] === 'number') {
    // Single point as array
    x = [x as number[]];
  }

  const points = x as number[][];
  const results: OracleResult[] = [];

  for (const point of points) {
    // Example: Simple quadratic function
    let value = 0;
    for (let i = 0; i < point.length; i++) {
      value += point[i] * point[i];
    }

    let noiseStd = 0;
    if (options.withNoise && rng) {
      noiseStd = 0.1;
      value += rng.next() * noiseStd - noiseStd / 2;
    }

    results.push({
      y: value,
      noiseStd: options.withNoise ? noiseStd : undefined,
      info: {
        evaluatedAt: point,
      },
    });
  }

  return results.length === 1 ? results[0] : results;
}

/**
 * Get domain for this oracle
 */
export function getDomain(): Domain {
  return {
    dimensions: [
      {
        type: 'continuous',
        bounds: [-5, 5],
        name: 'x1',
      },
    ],
  };
}

/**
 * Get true optimum if known
 */
export function getTrueOptimum(): { x: number[]; y: number } | undefined {
  return {
    x: [0],
    y: 0,
  };
}

export { manifest };

