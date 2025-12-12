# Overview

## High-Level Architecture

The Bayesian Optimizer Playground is architected as a composable, plugin-based system that separates concerns cleanly:

- **Engine** (`@bo/engine`): Pure math, no UI dependencies
- **Plugins** (`@bo/plugins-*`): Swappable kernels, acquisitions, oracles, optimizers, visualizers
- **UI** (`@bo/ui`): Presentational components, charts, accessibility helpers
- **App** (`@bo/app`): Next.js host that wires everything together

## Design Rationale

### Why Gaussian Process over Random Forest?

GPs provide:
- **Uncertainty quantification**: Natural variance estimates for acquisition functions
- **Smoothness**: Well-suited for continuous optimization
- **Interpretability**: Hyperparameters (lengthscales, noise) have clear meaning
- **Flexibility**: Kernel choice encodes prior beliefs about function structure

Random forests are faster but lack principled uncertainty estimates without additional machinery.

### Why Event-Sourced State?

- **Replay**: Deterministic reproduction of runs from event log
- **Share links**: Compress events into URL for easy sharing
- **Time travel**: Step backward/forward through optimization history
- **Debugging**: Inspect state at any point in the run

### Why Declarative Visualizers?

- **Separation**: Visualizers describe *what* to show, host handles *how*
- **Accessibility**: Host can generate alt text, keyboard navigation
- **Testing**: Golden snapshots of chart specs, not rendered pixels
- **Extensibility**: New visualizers don't require engine changes

### Why Client-Only?

- **Privacy**: No data leaves the browser
- **Performance**: No network latency for interactions
- **Cost**: Free static hosting (Vercel)
- **Offline**: Works without internet after initial load

## Core Concepts

### Domain

The search space definition. Each dimension can be:
- **Continuous**: Real-valued in [min, max]
- **Integer**: Integer-valued in [min, max]
- **Categorical**: One of a finite set of labels

### Dataset

Observations collected so far: X (points), y (values), optional noise estimates.

### Posterior

The surrogate model's belief about the objective function. Exposes:
- Mean prediction μ(x)
- Variance prediction σ²(x)
- Optional: full covariance, samples

### Acquisition Function

Scores candidate points for evaluation. Common choices:
- **EI** (Expected Improvement): Balances exploration/exploitation
- **UCB** (Upper Confidence Bound): Optimistic exploration
- **PI** (Probability of Improvement): Exploitation-focused
- **TS** (Thompson Sampling): Sample-based exploration

### Optimizer Strategy

How to maximize the acquisition function:
- Multi-start local search
- Global random search
- Evolutionary methods
- Mixed discrete optimizers

## Plugin System

See [Plugins Guide](./plugins.md) for detailed API specifications.

## Performance Considerations

- **Web Workers**: Numerics run off main thread
- **WASM** (optional): Fast linear algebra for large problems
- **Caching**: Reuse factorizations, incremental updates
- **Downsampling**: Decimate plots for 60fps UI

## Accessibility

- Keyboard navigation for all controls
- Screen reader support with descriptive alt text
- High-contrast mode
- Reduced motion mode
- Color-safe encodings (never color-only meaning)

