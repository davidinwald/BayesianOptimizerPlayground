# Tutorial 2: Acquisition Functions (EI, UCB, PI)

## Expected Improvement (EI)

EI measures the expected improvement over the current best:

\[
EI(x) = \mathbb{E}[\max(0, f(x) - f^*)]
\]

Where \(f^*\) is the current best value.

**Properties:**
- Zero when variance is zero
- Increases with uncertainty
- Balances exploration and exploitation

## Upper Confidence Bound (UCB)

UCB uses an optimistic bound:

\[
UCB(x) = \mu(x) + \beta \sigma(x)
\]

Where \(\beta\) controls exploration.

**Properties:**
- Simple and interpretable
- \(\beta\) tunes exploration-exploitation tradeoff
- Good for theoretical guarantees

## Probability of Improvement (PI)

PI measures the probability that a point improves over the current best:

\[
PI(x) = \Phi\left(\frac{\mu(x) - f^*}{\sigma(x)}\right)
\]

**Properties:**
- More exploitation-focused than EI
- Can get stuck in local optima
- Useful when you want to quickly improve

## Choosing an Acquisition Function

- **EI**: Good default, balanced
- **UCB**: When you want explicit exploration control
- **PI**: When you want to exploit quickly

