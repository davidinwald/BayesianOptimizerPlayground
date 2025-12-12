/**
 * Template Visualizer Plugin
 * 
 * Copy this template to create a new visualizer plugin.
 * Implement the required methods according to the plugin API spec.
 */

import type { PluginManifest, Domain } from '@bo/engine';
import type { TopLevelSpec } from 'vega-lite';

const manifest: PluginManifest = require('../manifest.json');

export interface DataRequirements {
  posteriorMean?: boolean;
  posteriorVariance?: boolean;
  acquisition?: boolean;
  observations?: boolean;
  [key: string]: boolean | undefined;
}

export interface VisualizationData {
  posteriorMean?: number[][];
  posteriorVariance?: number[][];
  acquisition?: number[][];
  observations?: { x: number[][]; y: number[] };
  [key: string]: unknown;
}

export interface VisualizationMeta {
  domain: Domain;
  step: number;
  bestSoFar: number;
  [key: string]: unknown;
}

/**
 * Declare what data this visualizer needs
 */
export function dataRequirements(): DataRequirements {
  return {
    posteriorMean: true,
    observations: true,
  };
}

/**
 * Check if this visualizer supports the given dimensionality
 */
export function supports(dimensions: number): boolean {
  return dimensions === 1 || dimensions === 2;
}

/**
 * Generate Vega-Lite chart specification
 */
export function spec(
  data: VisualizationData,
  meta: VisualizationMeta
): TopLevelSpec {
  // Example: Simple line chart
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: 'Template visualization',
    data: {
      values: data.observations?.x.map((x, i) => ({
        x: x[0],
        y: data.observations?.y[i] || 0,
      })) || [],
    },
    mark: 'line',
    encoding: {
      x: { type: 'quantitative', field: 'x', title: 'X' },
      y: { type: 'quantitative', field: 'y', title: 'Y' },
    },
  };
}

/**
 * Generate alt text for screen readers
 */
export function altText(data: VisualizationData, meta: VisualizationMeta): string {
  return `Visualization showing ${data.observations?.x.length || 0} observations at step ${meta.step}`;
}

export { manifest };

