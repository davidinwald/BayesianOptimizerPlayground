# Plugin Development Guide

This guide explains how to build plugins for the Bayesian Optimizer Playground.

## Plugin Types

### 1. Kernel Plugin

Produces covariance matrices for Gaussian Process surrogates.

**Required Methods:**
- `cov(X, Xprime, hyperparameters)` → Matrix(n×m)
- `diag(X, hyperparameters)` → Vector(n)
- `hyperparameterHints()` → hints for stability

**Constraints:**
- Must be positive semi-definite
- Document scaling assumptions

### 2. Acquisition Plugin

Scores candidate points using the surrogate posterior.

**Required Methods:**
- `score(Xstar, posterior, context)` → Vector(m)

**Constraints:**
- Must handle zero variance gracefully
- Document scale expectations

### 3. Oracle Plugin

Evaluates the objective function.

**Required Methods:**
- `evaluate(x, options)` → { y, noiseStd?, info? }

**Types:**
- Analytic (Branin, Hartmann, etc.)
- Data-backed (CSV interpolation)
- User-defined JS (sandboxed)

### 4. Optimizer Strategy Plugin

Maximizes the acquisition function.

**Required Methods:**
- `ask(k)` → propose k candidates
- `tell(observation)` → optional feedback

**Constraints:**
- Must enforce domain bounds
- De-duplicate near-duplicates

### 5. Visualizer Plugin

Describes what to render (host renders with Vega-Lite).

**Required Methods:**
- `dataRequirements()` → list of needed artifacts
- `spec(data, meta)` → Vega-Lite chart spec
- `supports(dimensions)` → true/false

**Constraints:**
- Must provide alt text for screen readers

## Manifest

Every plugin must expose a `manifest.json`:

```json
{
  "kind": "kernel",
  "name": "rbf",
  "label": "RBF Kernel",
  "version": "1.0.0",
  "engine_min_version": "0.1.0",
  "description": "Radial Basis Function kernel",
  "parameters": [
    {
      "key": "lengthscale",
      "label": "Lengthscale",
      "type": "number",
      "default": 1.0,
      "bounds": { "min": 0.01, "max": 10.0 },
      "help": "Controls smoothness"
    }
  ],
  "capabilities": {},
  "deterministic": true
}
```

## Testing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for testing requirements.

## Examples

Check `packages/plugins/` for first-party plugin examples.

