# Quick Start

## TL;DR

```bash
pnpm install && pnpm start
```

Open `http://localhost:3000` in your browser.

## What You Need

- **Node.js** 18+ (check: `node --version`)
- **pnpm** (required - install: `npm install -g pnpm`)

⚠️ **Note**: This project requires pnpm. npm will not work due to `workspace:*` protocol.

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm start` | Start dev server (http://localhost:3000) |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests |
| `pnpm verify` | Check your setup |

## No Docker Needed

This is a **client-side app** - runs entirely in your browser. No containers, databases, or servers required.

## Troubleshooting

**"pnpm: command not found"**
```bash
npm install -g pnpm
```

**Port 3000 in use?**
The dev server will automatically use the next available port.

**Need more help?**
See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions.

