/**
 * Plugin registry for discovery and validation
 */

import type {
  PluginKind,
  PluginManifest,
  ParameterSchema,
  RunContext,
} from '../types';

export interface PluginInstance {
  manifest: PluginManifest;
  // Methods depend on plugin kind - using any for now, will be typed per-kind
  [key: string]: unknown;
}

export class PluginRegistry {
  private plugins: Map<string, PluginInstance> = new Map();

  register(plugin: PluginInstance): void {
    const key = `${plugin.manifest.kind}:${plugin.manifest.name}`;
    this.validate(plugin);
    this.plugins.set(key, plugin);
  }

  get(kind: PluginKind, name: string): PluginInstance | undefined {
    const key = `${kind}:${name}`;
    return this.plugins.get(key);
  }

  list(kind?: PluginKind): PluginInstance[] {
    if (kind) {
      return Array.from(this.plugins.values()).filter(
        (p) => p.manifest.kind === kind
      );
    }
    return Array.from(this.plugins.values());
  }

  private validate(plugin: PluginInstance): void {
    const { manifest } = plugin;

    // Validate manifest structure
    if (!manifest.kind || !manifest.name || !manifest.version) {
      throw new Error('Plugin manifest missing required fields');
    }

    // Validate parameter schemas
    for (const param of manifest.parameters || []) {
      if (!param.key || !param.type || param.default === undefined) {
        throw new Error(`Invalid parameter schema for ${param.key}`);
      }
    }
  }

  validateCompatibility(plugin: PluginInstance, engineVersion: string): boolean {
    // Simple semver comparison (simplified)
    return true; // TODO: implement proper semver comparison
  }
}

