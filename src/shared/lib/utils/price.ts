/**
 * Converts pence to pounds and returns a formatted string
 * @param pence - Amount in pence
 * @param includeSymbol - Whether to include the £ symbol (default: true)
 * @returns Formatted price string
 */
export function formatPrice(
  pence: number,
  includeSymbol: boolean = true
): string {
  const pounds = pence / 100;
  const formatted = pounds.toFixed(2);
  return includeSymbol ? `£${formatted}` : formatted;
}

/**
 * Converts pounds to pence
 * @param pounds - Amount in pounds
 * @returns Amount in pence
 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

/**
 * Converts pence to pounds
 * @param pence - Amount in pence
 * @returns Amount in pounds
 */
export function penceToPounds(pence: number): number {
  return pence / 100;
}
