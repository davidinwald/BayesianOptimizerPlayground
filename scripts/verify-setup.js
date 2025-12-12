#!/usr/bin/env node

/**
 * Verify that the development environment is set up correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const checks = [];
let allPassed = true;

function check(name, fn) {
  try {
    const result = fn();
    checks.push({ name, status: '✓', message: result });
  } catch (error) {
    checks.push({ name, status: '✗', message: error.message });
    allPassed = false;
  }
}

console.log('🔍 Verifying development environment...\n');

// Check Node.js version
check('Node.js version', () => {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  if (major < 18) {
    throw new Error(`Node.js 18+ required, found ${version}`);
  }
  return `Node.js ${version} (✓ >= 18.0.0)`;
});

// Check pnpm
check('pnpm installed', () => {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    return `pnpm ${version} installed`;
  } catch {
    throw new Error('pnpm not found. Install with: npm install -g pnpm');
  }
});

// Check if node_modules exists
check('Dependencies installed', () => {
  const nodeModules = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    throw new Error('Run: pnpm install');
  }
  return 'node_modules found';
});

// Check package builds
check('Packages buildable', () => {
  const packages = ['engine', 'ui', 'app', 'examples'];
  const missing = packages.filter((pkg) => {
    const pkgPath = path.join(__dirname, '..', 'packages', pkg, 'package.json');
    return !fs.existsSync(pkgPath);
  });
  if (missing.length > 0) {
    throw new Error(`Missing packages: ${missing.join(', ')}`);
  }
  return `All ${packages.length} packages found`;
});

// Print results
console.log('\nResults:');
checks.forEach(({ name, status, message }) => {
  console.log(`  ${status} ${name}: ${message}`);
});

if (allPassed) {
  console.log('\n✅ All checks passed! You can run:');
  console.log('   pnpm start    # Start dev server');
  console.log('   pnpm dev      # Alternative dev command');
  console.log('   pnpm build    # Build for production');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}

