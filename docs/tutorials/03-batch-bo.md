# Tutorial 3: Batch Bayesian Optimization

## Why Batch?

Sometimes you can evaluate multiple points in parallel (e.g., multiple GPUs, distributed systems).

## Challenges

- Standard acquisition functions are designed for sequential selection
- Need to account for information gain from pending evaluations

## Strategies

### Local Penalization

Penalize candidates near pending evaluations:

\[
a_{batch}(x) = a(x) \prod_{i} \left(1 - \exp\left(-\frac{||x - x_i||^2}{2\ell^2}\right)\right)
\]

### Kriging Believer

Assume pending evaluations equal their predicted mean, then re-fit GP.

## Implementation

Batch mode requires:
- Acquisition functions that support `scoreBatch()`
- Optimizers that propose k candidates
- Special handling in the optimizer loop

