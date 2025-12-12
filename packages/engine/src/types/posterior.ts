/**
 * Posterior interface for surrogate models
 */

import type { Domain } from './domain';

export interface Posterior {
  /**
   * Mean prediction at points X*
   */
  mean(Xstar: number[][]): number[];

  /**
   * Variance prediction at points X*
   */
  variance(Xstar: number[][]): number[];

  /**
   * Optional: full covariance matrix
   */
  covariance?(Xstar: number[][], Xstar2?: number[][]): number[][];

  /**
   * Optional: sample from posterior
   */
  sample?(Xstar: number[][], n: number, seed?: number): number[][];

  /**
   * Best observed value so far
   */
  bestObservation(): number;

  /**
   * Measurement noise (scalar or per-point)
   */
  noise(): number | number[];

  /**
   * Domain this posterior is defined over
   */
  domain(): Domain;

  /**
   * Diagnostic information
   */
  info(): PosteriorInfo;
}

export interface PosteriorInfo {
  lengthscales?: number[];
  noise: number;
  conditioning?: number; // condition number of covariance matrix
  diagnostics?: Record<string, unknown>;
}

