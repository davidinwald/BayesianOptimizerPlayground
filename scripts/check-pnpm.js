#!/usr/bin/env node

/**
 * Check if pnpm is available, fail early with helpful message if not
 */

const { execSync } = require('child_process');

// Check if we're being run by npm
const isNpm = process.env.npm_execpath && process.env.npm_execpath.includes('npm');

try {
  const version = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
  // Check version
  const major = parseInt(version.split('.')[0]);
  if (major < 8) {
    console.error(`
❌ pnpm version ${version} is too old. This project requires pnpm >= 8.0.0.

Please update pnpm:
  npm install -g pnpm@latest

Then run:
  pnpm install
`);
    process.exit(1);
  }
  process.exit(0);
} catch (error) {
  if (isNpm) {
    console.error(`
❌ ERROR: This project requires pnpm, not npm.

The "workspace:*" protocol is pnpm-specific and not supported by npm.

📦 Quick fix - Install pnpm:
  npm install -g pnpm

Then run:
  pnpm install
  pnpm start

💡 Why pnpm?
  - Faster installs
  - Less disk space
  - Better monorepo support
  - Required for this project's workspace setup

If you must use npm, you'll need to manually change all "workspace:*" 
references to "*" in package.json files, but this is not recommended.
`);
  } else {
    console.error(`
❌ pnpm is not installed or not in PATH.

This project uses pnpm workspaces with the "workspace:*" protocol.

📦 Install pnpm:
  npm install -g pnpm

Then run:
  pnpm install
  pnpm start
`);
  }
  process.exit(1);
}

