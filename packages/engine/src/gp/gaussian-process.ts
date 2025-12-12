/**
 * Gaussian Process implementation
 */

import type { Domain, Dataset, Posterior, PosteriorInfo } from '../types';
import { cholesky, solveCholesky, matVecMul, addJitter } from '../math/linalg';

export interface KernelFunction {
  cov(X: number[][], Xprime: number[][], hyperparameters: Record<string, unknown>): number[][];
  diag(X: number[][], hyperparameters: Record<string, unknown>): number[];
}

export interface GPConfig {
  kernel: KernelFunction;
  hyperparameters: Record<string, unknown>;
  noise: number;
  jitter: number;
  domain: Domain;
}

export class GaussianProcess implements Posterior {
  private dataset: Dataset;
  private config: GPConfig;
  private L?: number[][]; // Cholesky factor
  private alpha?: number[]; // Cached solution: K^-1 * y

  constructor(dataset: Dataset, config: GPConfig) {
    this.dataset = dataset;
    this.config = config;
    this.fit();
  }

  /**
   * Fit the GP to the data
   */
  fit(): void {
    const { X, y } = this.dataset;
    const n = X.length;

    if (n === 0) {
      this.L = undefined;
      this.alpha = undefined;
      return;
    }

    // Compute covariance matrix K(X, X)
    let K = this.config.kernel.cov(X, X, this.config.hyperparameters);

    // Add noise to diagonal: K + σ²I
    const noiseMatrix = Array(n)
      .fill(0)
      .map((_, i) =>
        Array(n)
          .fill(0)
          .map((_, j) => (i === j ? this.config.noise ** 2 : 0))
      );

    for (let i = 0; i < n; i++) {
      K[i][i] += this.config.noise ** 2;
    }

    // Add jitter for numerical stability
    K = addJitter(K, this.config.jitter);

    // Cholesky decomposition: K = L * L^T
    this.L = cholesky(K);

    // Solve: L * L^T * alpha = y
    this.alpha = solveCholesky(this.L, y);
  }

  /**
   * Update with new observation (rank-1 update would be more efficient, but this is simpler)
   */
  update(newX: number[], newY: number): void {
    this.dataset.X.push(newX);
    this.dataset.y.push(newY);
    this.fit(); // Re-fit (inefficient but correct)
  }

  mean(Xstar: number[][]): number[] {
    if (!this.alpha || this.dataset.X.length === 0) {
      // Prior mean (zero)
      return Xstar.map(() => 0);
    }

    // K(X*, X)
    const Kstar = this.config.kernel.cov(Xstar, this.dataset.X, this.config.hyperparameters);

    // μ* = K(X*, X) * α
    return matVecMul(Kstar, this.alpha);
  }

  variance(Xstar: number[][]): number[] {
    if (!this.L || this.dataset.X.length === 0) {
      // Prior variance
      const diagK = this.config.kernel.diag(Xstar, this.config.hyperparameters);
      return diagK;
    }

    const n = this.dataset.X.length;
    const m = Xstar.length;
    const variances: number[] = [];

    // K(X*, X)
    const Kstar = this.config.kernel.cov(Xstar, this.dataset.X, this.config.hyperparameters);

    // K(X*, X*)
    const Kstarstar = this.config.kernel.cov(Xstar, Xstar, this.config.hyperparameters);

    // For each test point
    for (let i = 0; i < m; i++) {
      // Solve: L^T * v = K(X*, X)[i, :]^T
      const kstar_i = Kstar[i];
      const v = solveLowerTriangular(this.L!, kstar_i);

      // Variance: K(X*, X*)[i, i] - v^T * v
      let variance = Kstarstar[i][i];
      for (let j = 0; j < v.length; j++) {
        variance -= v[j] * v[j];
      }

      variances.push(Math.max(0, variance));
    }

    return variances;
  }

  bestObservation(): number {
    if (this.dataset.y.length === 0) {
      return Infinity; // No observations yet
    }
    return Math.min(...this.dataset.y);
  }

  noise(): number {
    return this.config.noise;
  }

  domain(): Domain {
    return this.config.domain;
  }

  info(): PosteriorInfo {
    // Estimate lengthscale from hyperparameters (if available)
    const lengthscales =
      typeof this.config.hyperparameters.lengthscale === 'number'
        ? [this.config.hyperparameters.lengthscale]
        : undefined;

    return {
      lengthscales,
      noise: this.config.noise,
      conditioning: this.estimateConditioning(),
    };
  }

  private estimateConditioning(): number | undefined {
    if (!this.L) return undefined;

    // Rough estimate: max diagonal / min diagonal of L
    const diagVals = this.L.map((row, i) => Math.abs(row[i])).filter((v) => v > 0);
    if (diagVals.length === 0) return undefined;

    const maxDiag = Math.max(...diagVals);
    const minDiag = Math.min(...diagVals);
    return (maxDiag / minDiag) ** 2; // Condition number estimate
  }
}

// Helper function for solveLowerTriangular (used in variance)
function solveLowerTriangular(L: number[][], b: number[]): number[] {
  const n = L.length;
  const x: number[] = Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * x[j];
    }
    if (L[i][i] !== 0) {
      x[i] = (b[i] - sum) / L[i][i];
    }
  }

  return x;
}

