# Tutorial 1: Introduction to Bayesian Optimization

## What is Bayesian Optimization?

Bayesian Optimization (BO) is a method for optimizing expensive black-box functions. It's particularly useful when:

- Function evaluations are costly (e.g., training a neural network)
- The function has no gradients
- You have a limited budget of evaluations

## Key Components

1. **Surrogate Model**: A probabilistic model (usually a Gaussian Process) that approximates the objective function
2. **Acquisition Function**: A utility function that balances exploration vs exploitation
3. **Optimizer**: Maximizes the acquisition function to choose the next point to evaluate

## Exploration vs Exploitation

- **Exploration**: Try points with high uncertainty (variance)
- **Exploitation**: Try points likely to be better than current best

Good acquisition functions balance both.

## Next Steps

- [Tutorial 2: Acquisition Functions](./02-ei-ucb-pi.md)
- [Tutorial 3: Batch BO](./03-batch-bo.md)

