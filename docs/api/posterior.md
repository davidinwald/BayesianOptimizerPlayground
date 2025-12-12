# Posterior Interface

The posterior interface abstracts the surrogate model, allowing acquisitions and visualizers to work with any kernel.

## Methods

### `mean(Xstar) → number[]`

Mean prediction at candidate points.

### `variance(Xstar) → number[]`

Variance prediction at candidate points.

### `covariance(Xstar, Xstar2?) → number[][]`

Optional: full covariance matrix.

### `sample(Xstar, n, seed?) → number[][]`

Optional: sample from posterior (for Thompson Sampling).

### `bestObservation() → number`

Current best observed value.

### `noise() → number | number[]`

Measurement noise estimate.

### `domain() → Domain`

Domain this posterior is defined over.

### `info() → PosteriorInfo`

Diagnostic information (lengthscales, conditioning, etc.).

