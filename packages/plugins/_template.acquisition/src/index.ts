/**
 * Template Acquisition Plugin
 * 
 * Copy this template to create a new acquisition plugin.
 * Implement the required methods according to the plugin API spec.
 */

import type {
  PluginManifest,
  Posterior,
  RunContext,
} from '@bo/engine';

const manifest: PluginManifest = require('../manifest.json');

export interface AcquisitionParameters {
  xi: number;
}

/**
 * Score candidate points
 */
export function score(
  Xstar: number[][],
  posterior: Posterior,
  context: RunContext,
  parameters: AcquisitionParameters
): number[] {
  const means = posterior.mean(Xstar);
  const variances = posterior.variance(Xstar);
  const best = posterior.bestObservation();
  const scores: number[] = [];

  for (let i = 0; i < Xstar.length; i++) {
    const mu = means[i];
    const sigma = Math.sqrt(Math.max(0, variances[i]));
    const bestY = best;

    // Example: Expected Improvement
    if (sigma < 1e-10) {
      scores[i] = 0;
    } else {
      const z = (mu - bestY - parameters.xi) / sigma;
      const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
      const Phi = 0.5 * (1 + erf(z / Math.sqrt(2)));
      scores[i] = sigma * (z * Phi + phi);
    }
  }

  return scores;
}

// Helper: Error function approximation
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

export { manifest };

