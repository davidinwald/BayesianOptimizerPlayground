# Template Visualizer Plugin

This is a template for creating visualizer plugins. Copy this directory and modify it to create your own visualization.

## Required Methods

- `dataRequirements()` → Requirements
- `supports(dimensions)` → boolean
- `spec(data, meta)` → Vega-Lite spec
- `altText(data, meta)` → string

## Example

See the posterior 1D/2D visualizer implementations for complete examples.

