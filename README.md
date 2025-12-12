# Bayesian Optimizer Playground

An interactive, client-side tool to optimize unknown functions (real or simulated) under a budget of evaluations, while teaching Bayesian Optimization (BO) concepts: priors, posteriors, kernels, acquisition functions, and exploration vs exploitation.

## Features

- **Client-only**: Runs entirely in the browser, deployable to Vercel static hosting
- **Composable**: Engine (math) separated from UI (charts & controls)
- **Pluggable**: Kernels, acquisitions, optimizers, and oracles are plugins
- **Deterministic**: Seeds, versioned engine, serializable runs for reproducibility
- **Educational**: Step mode, slow-mo, hover explanations, uncertainty bands
- **Accessible**: A11y-first, responsive, low-latency interactions

## Architecture

This is a monorepo containing:

- `@bo/engine` - Math core (Gaussian Process, acquisitions, optimizer loop)
- `@bo/plugins-*` - First-party kernel/acquisition/oracle plugins
- `@bo/ui` - Presentational components (charts, inspectors, panels)
- `@bo/app` - Next.js app that wires the engine + UI
- `@bo/examples` - Saved scenarios (JSON), used for docs and demos

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 (use [nvm](https://github.com/nvm-sh/nvm) with `.nvmrc`: `nvm use`)
- **pnpm** >= 8.0.0 (recommended) or npm

### Quick Start

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server (runs on http://localhost:3000)
pnpm start

# Build for production
pnpm build

# Run tests
pnpm test

# Verify setup
pnpm verify
```

### ⚠️ Important: pnpm is Required

This project uses pnpm's `workspace:*` protocol which **npm does not support**. 

If you try `npm install`, you'll get an error. **Please use pnpm:**

```bash
npm install -g pnpm  # One-time install
pnpm install
pnpm start
```

If you absolutely must use npm, see [NPM_USAGE.md](./NPM_USAGE.md) for conversion instructions (not recommended).

### No Docker Needed

This is a **client-side application** that runs entirely in the browser. No containers, databases, or servers required. Just install dependencies and start the dev server!

## Documentation

See the [docs](./docs/) directory for:
- [Overview](./docs/overview.md) - High-level architecture and design rationale
- [Plugins](./docs/plugins.md) - How to build plugins
- [API Reference](./docs/api/) - Engine, posterior, events, serialization
- [Tutorials](./docs/tutorials/) - Step-by-step guides

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

