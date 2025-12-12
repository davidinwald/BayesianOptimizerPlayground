# Template Kernel Plugin

This is a template for creating kernel plugins. Copy this directory and modify it to create your own kernel.

## Required Methods

- `cov(X, Xprime, hyperparameters, numerics)` → Matrix
- `diag(X, hyperparameters)` → Vector
- `hyperparameterHints()` → Hints

## Example

See the RBF kernel implementation for a complete example.

