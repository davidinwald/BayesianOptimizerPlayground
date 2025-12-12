# Template Optimizer Plugin

This is a template for creating optimizer strategy plugins. Copy this directory and modify it to create your own acquisition maximization strategy.

## Required Methods

- `initialize(dataset, domain, context, parameters)` → State
- `ask(k, acquisitionFn, domain, context, parameters, state)` → Candidates
- `tell(observation, state)` → State (optional)

## Example

See the multi-start optimizer implementation for a complete example.

