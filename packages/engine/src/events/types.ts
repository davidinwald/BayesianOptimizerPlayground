/**
 * Event types for event-sourced state management
 */

export type EventType =
  | 'INIT_RUN'
  | 'FIT_SURROGATE'
  | 'ASK'
  | 'EVAL'
  | 'TELL'
  | 'DONE'
  | 'ANNOTATION';

export interface BaseEvent {
  type: EventType;
  timestamp: number;
  step?: number;
}

export interface InitRunEvent extends BaseEvent {
  type: 'INIT_RUN';
  domain: unknown; // Domain serialized
  seed: number;
  initialDesign: number[][];
  parameters: Record<string, unknown>;
}

export interface FitSurrogateEvent extends BaseEvent {
  type: 'FIT_SURROGATE';
  kernel: string;
  hyperparameters: Record<string, unknown>;
  diagnostics: Record<string, unknown>;
}

export interface AskEvent extends BaseEvent {
  type: 'ASK';
  acquisition: string;
  optimizer: string;
  candidates: number[][];
}

export interface EvalEvent extends BaseEvent {
  type: 'EVAL';
  oracle: string;
  x: number[];
  y: number;
  noise?: number;
}

export interface TellEvent extends BaseEvent {
  type: 'TELL';
  datasetSize: number;
  posteriorHash?: string;
}

export interface DoneEvent extends BaseEvent {
  type: 'DONE';
  reason: 'budget_exhausted' | 'convergence' | 'manual';
  finalBest: number;
}

export interface AnnotationEvent extends BaseEvent {
  type: 'ANNOTATION';
  note: string;
  metadata?: Record<string, unknown>;
}

export type Event =
  | InitRunEvent
  | FitSurrogateEvent
  | AskEvent
  | EvalEvent
  | TellEvent
  | DoneEvent
  | AnnotationEvent;

