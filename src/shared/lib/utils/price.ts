// Types for monetary amounts
export type PenceAmount = number;
export type DisplayAmount = string;

/**
 * Converts pence to pounds and returns a formatted string
 * @param pence - Amount in pence
 * @param includeSymbol - Whether to include the £ symbol (default: true)
 * @returns Formatted price string
 */
export function formatPrice(
  pence: PenceAmount,
  includeSymbol: boolean = true
): DisplayAmount {
  if (typeof pence !== "number") {
    console.warn("Invalid amount passed to formatPrice:", pence);
    return includeSymbol ? "£0.00" : "0.00";
  }

  const pounds = pence / 100;
  const formatted = pounds.toFixed(2);
  return includeSymbol ? `£${formatted}` : formatted;
}

/**
 * Converts pounds to pence
 * @param pounds - Amount in pounds
 * @returns Amount in pence
 */
export function poundsToPence(pounds: number): PenceAmount {
  if (typeof pounds !== "number") {
    console.warn("Invalid amount passed to poundsToPence:", pounds);
    return 0;
  }
  return Math.round(pounds * 100);
}

/**
 * Converts pence to pounds
 * @param pence - Amount in pence
 * @returns Amount in pounds
 */
export function penceToPounds(pence: PenceAmount): number {
  if (typeof pence !== "number") {
    console.warn("Invalid amount passed to penceToPounds:", pence);
    return 0;
  }
  return pence / 100;
}

/**
 * Validates if a value is a valid pence amount
 * @param value - Value to validate
 * @returns boolean
 */
export function isValidPenceAmount(value: unknown): value is PenceAmount {
  return typeof value === "number" && !isNaN(value) && value >= 0;
}
