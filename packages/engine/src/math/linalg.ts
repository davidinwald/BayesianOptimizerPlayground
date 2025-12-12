/**
 * Linear algebra utilities
 * Simple implementations for now - can be replaced with WASM later
 */

/**
 * Cholesky decomposition: A = L * L^T
 * Returns lower triangular matrix L
 */
export function cholesky(A: number[][]): number[][] {
  const n = A.length;
  const L: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      if (j === i) {
        for (let k = 0; k < j; k++) {
          sum += L[j][k] * L[j][k];
        }
        L[j][j] = Math.sqrt(Math.max(0, A[j][j] - sum));
      } else {
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }
        if (L[j][j] !== 0) {
          L[i][j] = (A[i][j] - sum) / L[j][j];
        }
      }
    }
  }

  return L;
}

/**
 * Solve L * x = b where L is lower triangular
 */
export function solveLowerTriangular(L: number[][], b: number[]): number[] {
  const n = L.length;
  const x: number[] = Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * x[j];
    }
    if (L[i][i] !== 0) {
      x[i] = (b[i] - sum) / L[i][i];
    }
  }

  return x;
}

/**
 * Solve L^T * x = b where L is lower triangular
 */
export function solveUpperTriangular(L: number[][], b: number[]): number[] {
  const n = L.length;
  const x: number[] = Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += L[j][i] * x[j]; // Note: L^T access
    }
    if (L[i][i] !== 0) {
      x[i] = (b[i] - sum) / L[i][i];
    }
  }

  return x;
}

/**
 * Solve (L * L^T) * x = b using Cholesky
 */
export function solveCholesky(L: number[][], b: number[]): number[] {
  // Solve L * y = b
  const y = solveLowerTriangular(L, b);
  // Solve L^T * x = y
  return solveUpperTriangular(L, y);
}

/**
 * Matrix-vector multiplication: A * x
 */
export function matVecMul(A: number[][], x: number[]): number[] {
  return A.map((row) => row.reduce((sum, val, i) => sum + val * x[i], 0));
}

/**
 * Matrix multiplication: A * B
 */
export function matMul(A: number[][], B: number[][]): number[][] {
  const n = A.length;
  const m = B[0].length;
  const p = A[0].length;
  const C: number[][] = Array(n)
    .fill(0)
    .map(() => Array(m).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < p; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return C;
}

/**
 * Add jitter to diagonal for numerical stability
 */
export function addJitter(A: number[][], jitter: number): number[][] {
  return A.map((row, i) => row.map((val, j) => (i === j ? val + jitter : val)));
}

