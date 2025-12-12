# Contributing to Bayesian Optimizer Playground

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. **Fork and clone** the repository
2. **Install dependencies**: `pnpm install`
3. **Read the docs**: Start with [docs/plugins.md](./docs/plugins.md) if you're adding a plugin
4. **Pick a plugin type** and copy the closest template from `packages/plugins/_template.*`

## Plugin Development

### Before You Start

- Read `docs/plugins.md` for detailed plugin API specifications
- Understand the plugin contract for your chosen type (kernel, acquisition, oracle, optimizer, or visualizer)
- Check existing plugins for examples

### What to Implement

1. **Manifest**: Fill out `manifest.json` with:
   - Name, label, version, engine_min_version
   - Clear description
   - Parameter schema (types, bounds, defaults, help text)
   - Capabilities flags
   - A11y information

2. **Contract Methods**: Implement the required methods exactly as documented in the plugin API spec

3. **Fixtures**: Provide:
   - A tiny deterministic example (for CI)
   - A real scenario (for docs)

### Testing Requirements

**Unit Tests:**
- Kernels: PSD checks, permutation invariance, diagonal positivity
- Acquisitions: Finite values, edge cases (σ²→0), monotonicity
- Optimizers: Bounds enforcement, de-duplication
- Oracles: Deterministic behavior when `withNoise=false`

**Property Tests:**
- Monotonicity (e.g., noise increases variance)
- Standardization invariance where promised

**Visual Tests:**
- Golden chart images for canonical scenarios
- Allow small pixel diffs for cross-platform rendering

### Documentation & A11y

- Add a README with intuition, equations, parameter guidance, pitfalls
- Provide a11y alt text and keyboard interactions
- Include examples in the docs

### Performance Budgets

- Kernel `cov` for n≤512: < 20ms on mid-range laptop
- Acquisition `score` for m≤10k candidates: < 25ms
- Optimizer `ask(k)`: < 100ms (configurable)

## Code Style

- Use TypeScript with strict mode
- Follow Prettier formatting (run `pnpm format`)
- Write self-documenting code with clear variable names
- Add JSDoc comments for public APIs

## Versioning & Stability

- **Engine**: SemVer. Breaking plugin APIs only on major releases
- **Plugins**: SemVer; include `engine_min_version` in manifest
- **Replay compatibility**: Event logs include versions for migration

## Quality Bar (Pre-Merge Checklist)

- [ ] Manifest complete with clear parameter descriptions
- [ ] Unit + property tests passing
- [ ] Golden visual snapshots updated & reviewed
- [ ] Docs page added with at least one figure and example
- [ ] A11y check: Descriptive alt text, visible focus order
- [ ] TypeScript compiles without errors
- [ ] Linter passes

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes with tests and docs
3. Ensure all checks pass (`pnpm test`, `pnpm lint`, `pnpm typecheck`)
4. Submit a pull request with a clear description

## Questions?

Open an issue or start a discussion. We're happy to help!

