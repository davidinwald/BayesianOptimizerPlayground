import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get absolute path
const resolvePath = (relativePath: string) => path.resolve(__dirname, relativePath);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve workspace packages - point to src directories
      '@bo/engine': resolvePath('../engine/src'),
      '@bo/ui': resolvePath('../ui/src'),
      '@bo/examples': resolvePath('../examples/src'),
      '@bo/plugin-kernel-rbf': resolvePath('../plugins/kernels.rbf/src'),
      '@bo/plugin-acquisition-ei': resolvePath('../plugins/acquisitions.ei/src'),
      '@bo/plugin-oracle-branin': resolvePath('../plugins/oracles.branin/src'),
      '@bo/plugin-optimizer-multi-start': resolvePath('../plugins/optimizers.multi-start/src'),
    },
    // Don't preserve symlinks - resolve to actual files
    preserveSymlinks: false,
    // Ensure extensions are resolved
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: [
      '@bo/engine',
      '@bo/ui',
      '@bo/examples',
      '@bo/plugin-kernel-rbf',
      '@bo/plugin-acquisition-ei',
      '@bo/plugin-oracle-branin',
      '@bo/plugin-optimizer-multi-start',
    ],
    // Force re-optimization to pick up changes
    force: true,
  },
  server: {
    fs: {
      // Allow serving files from workspace root
      allow: ['..'],
    },
  },
});

