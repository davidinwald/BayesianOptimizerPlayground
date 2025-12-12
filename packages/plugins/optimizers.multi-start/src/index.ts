/**
 * Multi-Start Local Search Optimizer Plugin
 */

import type {
  PluginManifest,
  Domain,
  Dataset,
  RunContext,
} from '@bo/engine';

import manifestData from '../manifest.json';
const manifest: PluginManifest = manifestData;

export interface MultiStartParameters {
  restarts: number;
  maxIterations: number;
}

export interface OptimizerState {
  // No persistent state needed for this optimizer
}

/**
 * Initialize optimizer
 */
export function initialize(
  dataset: Dataset,
  domain: Domain,
  context: RunContext,
  parameters: MultiStartParameters
): OptimizerState {
  return {};
}

/**
 * Propose k candidate points by optimizing acquisition function
 */
export function ask(
  k: number,
  acquisitionFn: (x: number[][]) => number[],
  domain: Domain,
  context: RunContext,
  parameters: MultiStartParameters,
  state: OptimizerState
): number[][] {
  const candidates: number[][] = [];
  const bestCandidates: Array<{ x: number[]; score: number }> = [];

  // Generate random starting points
  const starts: number[][] = [];
  for (let r = 0; r < parameters.restarts; r++) {
    const start: number[] = [];
    for (const dim of domain.dimensions) {
      if (dim.type === 'continuous') {
        const [min, max] = dim.bounds;
        start.push(min + context.rng.next() * (max - min));
      } else if (dim.type === 'integer') {
        const [min, max] = dim.bounds;
        start.push(Math.floor(min + context.rng.next() * (max - min + 1)));
      } else {
        const idx = Math.floor(context.rng.next() * dim.levels.length);
        start.push(idx);
      }
    }
    starts.push(start);
  }

  // Local search from each start
  for (const start of starts) {
    const optimized = localSearch(start, acquisitionFn, domain, context, parameters);
    const scores = acquisitionFn([optimized]);
    bestCandidates.push({ x: optimized, score: scores[0] });
  }

  // Sort by score and return top k
  bestCandidates.sort((a, b) => b.score - a.score);
  for (let i = 0; i < Math.min(k, bestCandidates.length); i++) {
    candidates.push(bestCandidates[i].x);
  }

  return candidates;
}

/**
 * Simple local search using coordinate descent
 */
function localSearch(
  start: number[],
  acquisitionFn: (x: number[][]) => number[],
  domain: Domain,
  context: RunContext,
  parameters: MultiStartParameters
): number[] {
  let current = [...start];
  const stepSize = 0.1; // Initial step size
  const minStepSize = 0.001;

  for (let iter = 0; iter < parameters.maxIterations; iter++) {
    let improved = false;
    const currentScore = acquisitionFn([current])[0];

    // Try moving in each dimension
    for (let d = 0; d < domain.dimensions.length; d++) {
      const dim = domain.dimensions[d];
      const [min, max] = dim.type === 'categorical' ? [0, dim.levels.length - 1] : dim.bounds;

      // Try positive direction
      const candidatePos = [...current];
      candidatePos[d] = Math.min(max, current[d] + stepSize);
      if (dim.type === 'integer') {
        candidatePos[d] = Math.round(candidatePos[d]);
      }
      candidatePos[d] = Math.max(min, Math.min(max, candidatePos[d]));

      const scorePos = acquisitionFn([candidatePos])[0];
      if (scorePos > currentScore) {
        current = candidatePos;
        improved = true;
        continue;
      }

      // Try negative direction
      const candidateNeg = [...current];
      candidateNeg[d] = Math.max(min, current[d] - stepSize);
      if (dim.type === 'integer') {
        candidateNeg[d] = Math.round(candidateNeg[d]);
      }
      candidateNeg[d] = Math.max(min, Math.min(max, candidateNeg[d]));

      const scoreNeg = acquisitionFn([candidateNeg])[0];
      if (scoreNeg > currentScore) {
        current = candidateNeg;
        improved = true;
      }
    }

    // Reduce step size if no improvement
    if (!improved && stepSize > minStepSize) {
      // Continue with smaller step size next iteration
    }
  }

  return current;
}

/**
 * Optional: Update internal state with observation
 */
export function tell(
  observation: { x: number[]; y: number },
  state: OptimizerState
): OptimizerState {
  return state; // No state to update
}

export { manifest };

