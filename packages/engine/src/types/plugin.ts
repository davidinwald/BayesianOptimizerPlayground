/**
 * Plugin system types and interfaces
 */

import type { Domain } from './domain';

export type PluginKind = 'kernel' | 'acquisition' | 'oracle' | 'optimizer' | 'visualizer';

export type ParameterType = 'number' | 'integer' | 'categorical' | 'boolean';

export interface ParameterSchema {
  key: string; // kebab-case
  label: string;
  type: ParameterType;
  default: unknown;
  bounds?: { min: number; max: number };
  choices?: string[]; // for categorical
  help?: string;
}

export interface PluginManifest {
  kind: PluginKind;
  name: string; // kebab-case, machine-readable
  label: string; // human-readable
  version: string; // semver
  engine_min_version: string;
  description: string;
  parameters: ParameterSchema[];
  capabilities?: {
    'supports-batch'?: boolean;
    gradients?: boolean;
    'categorical-aware'?: boolean;
    [key: string]: boolean | undefined;
  };
  a11y?: {
    altText?: string;
    colorEncoding?: string;
  };
  references?: Array<{
    title: string;
    venue?: string;
    year?: number;
  }>;
  deterministic: boolean;
}

export interface HyperparameterHints {
  reparam?: 'log' | 'none';
  bounds?: Record<string, { min: number; max: number }>;
}

export interface NumericsContext {
  jitter: number;
  tolerance: number;
  maxCondition: number;
}

export interface RNGContext {
  seed: number;
  next(): number; // returns [0, 1)
}

export interface RunContext {
  step: number;
  budget: number;
  domain: Domain;
  rng: RNGContext;
  numerics: NumericsContext;
}

