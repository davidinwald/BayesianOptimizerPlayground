# Template Oracle Plugin

This is a template for creating oracle plugins. Copy this directory and modify it to create your own objective function.

## Required Methods

- `evaluate(x, options, domain, rng)` → Result | Result[]
- `getDomain()` → Domain
- `getTrueOptimum()` → Optimum | undefined

## Example

See the Branin oracle implementation for a complete example.

