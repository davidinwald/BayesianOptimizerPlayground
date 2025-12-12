/**
 * Seeded RNG for deterministic reproducibility
 * Simple LCG (Linear Congruential Generator)
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    // LCG parameters (from Numerical Recipes)
    this.state = (this.state * 1664525 + 1013904223) % 2 ** 32;
    return this.state / 2 ** 32;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  getSeed(): number {
    return this.state;
  }
}

