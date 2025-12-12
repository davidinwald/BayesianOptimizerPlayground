/**
 * RBF (Radial Basis Function) Kernel Plugin
 * Also known as squared exponential or Gaussian kernel
 */

import type {
  PluginManifest,
  HyperparameterHints,
  NumericsContext,
} from '@bo/engine';

import manifestData from '../manifest.json';
const manifest: PluginManifest = manifestData;

export interface RBFHyperparameters {
  lengthscale: number;
  variance: number;
}

/**
 * Compute covariance matrix K(X, X')
 * RBF: k(x, x') = variance * exp(-0.5 * ||x - x'||² / lengthscale²)
 */
export function cov(
  X: number[][],
  Xprime: number[][],
  hyperparameters: RBFHyperparameters,
  numerics: NumericsContext
): number[][] {
  const n = X.length;
  const m = Xprime.length;
  const { lengthscale, variance } = hyperparameters;
  const K: number[][] = [];

  for (let i = 0; i < n; i++) {
    K[i] = [];
    for (let j = 0; j < m; j++) {
      // Compute squared distance
      let distSq = 0;
      for (let d = 0; d < X[i].length; d++) {
        const diff = X[i][d] - Xprime[j][d];
        distSq += diff * diff;
      }

      // RBF kernel
      K[i][j] = variance * Math.exp(-0.5 * distSq / (lengthscale * lengthscale));
    }
  }

  return K;
}

/**
 * Compute diagonal (variance) of covariance matrix
 */
export function diag(
  X: number[][],
  hyperparameters: RBFHyperparameters
): number[] {
  const { variance } = hyperparameters;
  return X.map(() => variance);
}

/**
 * Provide hints for hyperparameter optimization
 */
export function hyperparameterHints(): HyperparameterHints {
  return {
    reparam: 'log', // Use log space for positive parameters
    bounds: {
      lengthscale: { min: 0.01, max: 10.0 },
      variance: { min: 0.01, max: 10.0 },
    },
  };
}

export { manifest };

