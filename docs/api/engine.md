# Engine API

## Core Classes

### `PluginRegistry`

Manages plugin discovery and validation.

```typescript
const registry = new PluginRegistry();
registry.register(kernelPlugin);
const kernel = registry.get('kernel', 'rbf');
```

### `SeededRNG`

Deterministic random number generator.

```typescript
const rng = new SeededRNG(42);
const value = rng.next(); // [0, 1)
```

## Domain Utilities

### `validateDomain(domain)`

Validates domain structure and bounds.

### `validatePoint(x, domain)`

Checks if point is within domain bounds.

### `getDomainBounds(domain)`

Returns bounds array for each dimension.

## Design of Experiments

### `sobolSample(domain, n, rng)`

Generates Sobol sequence samples.

### `latinHypercubeSample(domain, n, rng)`

Generates Latin Hypercube samples.

