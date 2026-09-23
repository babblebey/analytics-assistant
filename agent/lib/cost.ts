// Illustrative: a real warehouse exposes a dry-run byte estimate.
export function estimateScanGb(sql: string): number {
  return /\bwhere\b/i.test(sql) ? 1 : 200; // unfiltered scans are the expensive ones
}