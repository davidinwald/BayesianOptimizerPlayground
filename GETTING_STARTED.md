# Getting Started Guide

## Quick Start (2 commands)

```bash
pnpm install && pnpm start
```

That's it! The app will be running at `http://localhost:3000`.

## Detailed Setup

### 1. Install Node.js

This project requires Node.js >= 18.0.0.

**Recommended**: Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions:

```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use the Node version specified in .nvmrc
nvm use
```

Or download Node.js directly from [nodejs.org](https://nodejs.org/).

### 2. Install pnpm (Recommended)

pnpm is faster and uses less disk space than npm:

```bash
npm install -g pnpm
```

Verify installation:
```bash
pnpm --version  # Should show 8.0.0 or higher
```

### 3. Install Dependencies

```bash
pnpm install
```

This installs all dependencies for all packages in the monorepo.

### 4. Start Development Server

```bash
pnpm start
# or
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 5. Build for Production

```bash
pnpm build
```

This builds all packages and creates a static export in `packages/app/out/` ready for deployment to Vercel or any static host.

## Alternative: Using npm

If you prefer npm:

```bash
npm install
npm run start
```

**Note**: npm workspaces (npm 7+) should work, but pnpm is recommended for better performance.

## Troubleshooting

### "pnpm: command not found"

Install pnpm globally:
```bash
npm install -g pnpm
```

### Port 3000 already in use

The dev server will try the next available port, or you can specify one:
```bash
PORT=3001 pnpm dev
```

### TypeScript errors

Make sure all packages are built:
```bash
pnpm build
```

### Workspace dependencies not found

Clear cache and reinstall:
```bash
pnpm clean
pnpm install
```

## Development Workflow

1. **Make changes** to any package
2. **TypeScript** will type-check automatically in watch mode
3. **Next.js** will hot-reload the app
4. **Turbo** orchestrates builds across packages

## Project Structure

```
.
├── packages/
│   ├── engine/      # Core BO engine
│   ├── ui/          # UI components
│   ├── app/         # Next.js app (start here)
│   ├── examples/    # Example scenarios
│   └── plugins/     # Plugin templates
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

## Next Steps

- Read [PROJECT_STATUS.md](./PROJECT_STATUS.md) to see what's implemented
- Check [docs/overview.md](./docs/overview.md) for architecture details
- See [docs/plugins.md](./docs/plugins.md) to create your first plugin
- Explore [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines

## Why No Docker?

This is a **client-side application**:
- Runs entirely in the browser
- No backend servers needed
- No databases
- Static files can be hosted anywhere (Vercel, Netlify, GitHub Pages)

Docker would add unnecessary complexity for a static site. If you need containerization for CI/CD, that's handled by GitHub Actions (see `.github/workflows/`).

