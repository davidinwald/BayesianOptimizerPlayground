# Events API

Events are append-only, ordered records of optimization steps.

## Event Types

- `INIT_RUN`: Run initialization
- `FIT_SURROGATE`: GP fitting
- `ASK`: Candidate selection
- `EVAL`: Oracle evaluation
- `TELL`: Dataset update
- `DONE`: Run completion
- `ANNOTATION`: User notes

## Serialization

Events are JSON-serializable for replay and share links.

## Replay

Given a seed and event log, the engine can reproduce a run deterministically.

