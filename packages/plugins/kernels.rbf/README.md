# RBF Kernel Plugin

Radial Basis Function (RBF) kernel, also known as squared exponential or Gaussian kernel.

## Formula

k(x, x') = variance * exp(-0.5 * ||x - x'||² / lengthscale²)

## Parameters

- **lengthscale**: Controls smoothness (smaller = more wiggly, larger = smoother)
- **variance**: Controls magnitude/scale of function values

## Properties

- Infinitely differentiable (very smooth)
- Stationary (depends only on distance)
- Universal approximator

