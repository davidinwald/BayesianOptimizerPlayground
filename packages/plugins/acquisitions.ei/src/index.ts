/**
 * Expected Improvement (EI) Acquisition Plugin
 */

import type {
  PluginManifest,
  Posterior,
  RunContext,
} from '@bo/engine';

import manifestData from '../manifest.json';
const manifest: PluginManifest = manifestData as PluginManifest;

export interface EIParameters {
  xi: number;
}

/**
 * Score candidate points using Expected Improvement
 * EI(x) = σ(x) * [z * Φ(z) + φ(z)]
 * where z = (μ(x) - f* - ξ) / σ(x)
 */
export function score(
  Xstar: number[][],
  posterior: Posterior,
  context: RunContext,
  parameters: EIParameters
): number[] {
  const means = posterior.mean(Xstar);
  const variances = posterior.variance(Xstar);
  const best = posterior.bestObservation();
  const scores: number[] = [];

  for (let i = 0; i < Xstar.length; i++) {
    const mu = means[i];
    const sigma = Math.sqrt(Math.max(0, variances[i]));
    const bestY = best;

    // Handle zero variance
    if (sigma < 1e-10) {
      scores[i] = 0;
      continue;
    }

    // Compute z = (μ - f* - ξ) / σ
    const z = (mu - bestY - parameters.xi) / sigma;

    // Standard normal PDF: φ(z)
    const phi = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);

    // Standard normal CDF: Φ(z)
    const Phi = 0.5 * (1 + erf(z / Math.sqrt(2)));

    // EI = σ * [z * Φ(z) + φ(z)]
    scores[i] = sigma * (z * Phi + phi);
  }

  return scores;
}

/**
 * Error function approximation
 * Using Abramowitz and Stegun approximation
 */
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
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

export { manifest };

