/**
 * Accessibility helpers
 */

/**
 * Generate descriptive alt text for charts
 */
export function generateChartAltText(
  chartType: string,
  data: Record<string, unknown>
): string {
  // Placeholder - will generate descriptive text based on chart type and data
  return `${chartType} visualization`;
}

/**
 * Format numbers for screen readers
 */
export function formatForScreenReader(value: number, precision = 2): string {
  return value.toFixed(precision);
}

