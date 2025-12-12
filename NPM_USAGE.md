# Using npm Instead of pnpm

⚠️ **This project is designed for pnpm and uses `workspace:*` protocol which npm doesn't support.**

## The Problem

When you run `npm install`, you'll see:
```
npm error Unsupported URL Type "workspace:": workspace:*
```

This is because npm doesn't support the `workspace:*` protocol that pnpm uses for monorepo workspace dependencies.

## Solution 1: Use pnpm (Recommended)

**This is the easiest and recommended approach:**

```bash
# Install pnpm
npm install -g pnpm

# Then use pnpm
pnpm install
pnpm start
```

## Solution 2: Convert to npm workspaces (Advanced)

If you absolutely must use npm, you'll need to:

1. **Change all `workspace:*` to `*`** in package.json files:
   - `packages/app/package.json`
   - Any other packages that reference workspace dependencies

2. **Ensure npm 7+** is installed (for workspaces support):
   ```bash
   npm --version  # Should be 7.0.0 or higher
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the app:**
   ```bash
   npm start
   ```

### Files to modify:

- `packages/app/package.json`: Change `"@bo/engine": "workspace:*"` to `"@bo/engine": "*"`
- `packages/app/package.json`: Change `"@bo/ui": "workspace:*"` to `"@bo/ui": "*"`
- `packages/app/package.json`: Change `"@bo/examples": "workspace:*"` to `"@bo/examples": "*"`
- Any plugin packages that reference `@bo/engine`

**Note**: You'll need to maintain these changes if you pull updates, as the project uses pnpm by default.

## Why pnpm?

- ✅ **Faster**: Parallel installs, better caching
- ✅ **Smaller**: Uses hard links, saves disk space
- ✅ **Better monorepo support**: Native workspace protocol
- ✅ **Strict**: Prevents phantom dependencies
- ✅ **Used by this project**: All tooling and CI/CD is set up for pnpm

## Recommendation

**Just use pnpm.** It's a one-time install (`npm install -g pnpm`) and you'll have a better development experience.

