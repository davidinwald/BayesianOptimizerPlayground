/**
 * Dataset types for observations
 */

export interface Dataset {
  X: number[][]; // n×d matrix
  y: number[]; // n vector
  noise?: number[]; // optional per-point noise std
  meta?: Record<string, unknown>;
}

export interface Observation {
  x: number[];
  y: number;
  noise?: number;
  step?: number;
  timestamp?: number;
}

