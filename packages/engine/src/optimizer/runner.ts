/**
 * Bayesian Optimization runner/loop
 */

import type {
  Domain,
  Dataset,
  Posterior,
  RunContext,
} from '../types';
import { SeededRNG } from '../utils/rng';
import { GaussianProcess, type KernelFunction } from '../gp';
import { latinHypercubeSample } from '../utils';
import type { Event } from '../events';

export interface OracleFunction {
  evaluate(x: number[][], options?: Record<string, unknown>): Promise<{ y: number; noiseStd?: number }[]> | { y: number; noiseStd?: number }[];
  getDomain(): Domain;
}

export interface AcquisitionFunction {
  score(Xstar: number[][], posterior: Posterior, context: RunContext, parameters: Record<string, unknown>): number[];
}

export interface OptimizerFunction {
  ask(
    k: number,
    acquisitionFn: (x: number[][]) => number[],
    domain: Domain,
    context: RunContext,
    parameters: Record<string, unknown>,
    state: unknown
  ): number[][];
  initialize(dataset: Dataset, domain: Domain, context: RunContext, parameters: Record<string, unknown>): unknown;
  tell?(observation: { x: number[]; y: number }, state: unknown): unknown;
}

export interface BORunConfig {
  domain: Domain;
  kernel: KernelFunction;
  kernelParams: Record<string, unknown>;
  acquisition: AcquisitionFunction;
  acquisitionParams: Record<string, unknown>;
  optimizer: OptimizerFunction;
  optimizerParams: Record<string, unknown>;
  oracle: OracleFunction;
  initialDesign: {
    method: 'sobol' | 'lhs' | 'random';
    n: number;
  };
  budget: number;
  noise: number;
  jitter: number;
  seed: number;
}

export interface BORunState {
  dataset: Dataset;
  gp?: Posterior;
  step: number;
  bestSoFar: number;
  bestX?: number[];
  events: Event[];
  optimizerState: unknown;
}

export class BORunner {
  private config: BORunConfig;
  private state: BORunState;
  private rng: SeededRNG;

  constructor(config: BORunConfig) {
    this.config = config;
    this.rng = new SeededRNG(config.seed);

    // Initialize dataset with initial design
    const initialX = this.generateInitialDesign();
    this.state = {
      dataset: {
        X: [],
        y: [],
      },
      step: 0,
      bestSoFar: Infinity,
      events: [],
      optimizerState: undefined as unknown,
    };

    // Initialize optimizer state
    this.state.optimizerState = this.config.optimizer.initialize(
      this.state.dataset,
      this.config.domain,
      this.getContext(),
      this.config.optimizerParams
    );
  }

  /**
   * Generate initial design of experiments
   */
  private generateInitialDesign(): number[][] {
    const { method, n } = this.config.initialDesign;

    if (method === 'lhs') {
      return latinHypercubeSample(this.config.domain, n, this.rng);
    } else {
      // Random or Sobol (simplified to random for now)
      const samples: number[][] = [];
      for (let i = 0; i < n; i++) {
        const point: number[] = [];
        for (const dim of this.config.domain.dimensions) {
          if (dim.type === 'continuous') {
            const [min, max] = dim.bounds;
            point.push(min + this.rng.next() * (max - min));
          } else if (dim.type === 'integer') {
            const [min, max] = dim.bounds;
            point.push(Math.floor(min + this.rng.next() * (max - min + 1)));
          } else {
            const idx = Math.floor(this.rng.next() * dim.levels.length);
            point.push(idx);
          }
        }
        samples.push(point);
      }
      return samples;
    }
  }

  /**
   * Get current run context
   */
  private getContext(): RunContext {
    return {
      step: this.state.step,
      budget: this.config.budget,
      domain: this.config.domain,
      rng: {
        seed: this.config.seed,
        next: () => this.rng.next(),
      },
      numerics: {
        jitter: this.config.jitter,
        tolerance: 1e-6,
        maxCondition: 1e12,
      },
    };
  }

  /**
   * Run one step of Bayesian Optimization
   */
  async step(): Promise<boolean> {
    if (this.state.step >= this.config.budget) {
      return false; // Budget exhausted
    }

    // Initial design phase
    if (this.state.dataset.X.length < this.config.initialDesign.n) {
      const initialX = this.generateInitialDesign();
      const remaining = this.config.initialDesign.n - this.state.dataset.X.length;
      const toEvaluate = initialX.slice(0, remaining);

      for (const x of toEvaluate) {
        const results = await Promise.resolve(this.config.oracle.evaluate([x]));
        const resultArray = Array.isArray(results) ? results : [results];
        const y = resultArray[0].y;

        this.state.dataset.X.push(x);
        this.state.dataset.y.push(y);

        if (y < this.state.bestSoFar) {
          this.state.bestSoFar = y;
          this.state.bestX = x;
        }
      }

      this.state.step += toEvaluate.length;
      return true;
    }

    // Fit GP
    this.state.gp = new GaussianProcess(this.state.dataset, {
      kernel: this.config.kernel,
      hyperparameters: this.config.kernelParams,
      noise: this.config.noise,
      jitter: this.config.jitter,
      domain: this.config.domain,
    });

    // Optimize acquisition function
    const acquisitionFn = (Xstar: number[][]) => {
      return this.config.acquisition.score(
        Xstar,
        this.state.gp!,
        this.getContext(),
        this.config.acquisitionParams
      );
    };

    const candidates = this.config.optimizer.ask(
      1, // Get 1 candidate
      acquisitionFn,
      this.config.domain,
      this.getContext(),
      this.config.optimizerParams,
      this.state.optimizerState
    );

    if (candidates.length === 0) {
      return false;
    }

    const xNext = candidates[0];

    // Evaluate oracle
    const results = await Promise.resolve(this.config.oracle.evaluate([xNext]));
    const resultArray = Array.isArray(results) ? results : [results];
    const yNext = resultArray[0].y;

    // Update dataset
    this.state.dataset.X.push(xNext);
    this.state.dataset.y.push(yNext);

    // Update optimizer
    if (this.config.optimizer.tell) {
      this.state.optimizerState = this.config.optimizer.tell(
        { x: xNext, y: yNext },
        this.state.optimizerState
      );
    }

    // Update best
    if (yNext < this.state.bestSoFar) {
      this.state.bestSoFar = yNext;
      this.state.bestX = xNext;
    }

    this.state.step++;
    return true;
  }

  /**
   * Run full optimization loop
   */
  async run(): Promise<BORunState> {
    while (await this.step()) {
      // Continue until budget exhausted
    }
    return this.state;
  }

  /**
   * Get current state
   */
  getState(): BORunState {
    return { ...this.state };
  }
}

