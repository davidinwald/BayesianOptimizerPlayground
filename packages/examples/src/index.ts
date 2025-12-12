/**
 * @bo/examples - Example scenarios
 */

export interface Scenario {
  name: string;
  description: string;
  domain: unknown;
  oracle: string;
  kernel: string;
  acquisition: string;
  optimizer: string;
  initialDesign: {
    method: 'sobol' | 'lhs' | 'random';
    n: number;
  };
  budget: number;
  seed: number;
  parameters: Record<string, unknown>;
}

// Scenarios will be loaded from JSON files
export const scenarios: Scenario[] = [];

