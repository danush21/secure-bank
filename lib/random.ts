import crypto from "crypto";

/**
 * Generate a cryptographically secure random integer between min and max (inclusive).
 * Uses Node.js crypto.randomInt() which is suitable for security-sensitive operations.
 *
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer between min and max
 */
export function secureRandomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error("min must be less than or equal to max");
  }
  return crypto.randomInt(min, max + 1);
}

/**
 * Generate a cryptographically secure random string of specified length using hex characters.
 *
 * @param length - Length of the hex string to generate
 * @returns Random hex string
 */
export function secureRandomHex(length: number): string {
  if (length <= 0) {
    throw new Error("length must be greater than 0");
  }
  // randomBytes returns length bytes, which when converted to hex becomes 2 * length characters
  // So we need length/2 bytes to get 'length' hex characters
  const bytesNeeded = Math.ceil(length / 2);
  return crypto.randomBytes(bytesNeeded).toString("hex").slice(0, length);
}

/**
 * Generate a cryptographically secure random numeric string of specified length.
 * All characters are digits (0-9).
 *
 * @param length - Length of the numeric string to generate
 * @returns Random numeric string with specified length
 */
export function secureRandomNumeric(length: number): string {
  if (length <= 0) {
    throw new Error("length must be greater than 0");
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += secureRandomInt(0, 9);
  }
  return result;
}

/**
 * Generate a cryptographically secure account number.
 * Returns a 10-digit numeric string.
 *
 * @returns 10-digit account number
 */
export function generateSecureAccountNumber(): string {
  return secureRandomNumeric(10);
}

/**
 * Generate a cryptographically secure transaction ID.
 * Returns a 16-character hex string.
 *
 * @returns 16-character hex transaction ID
 */
export function generateSecureTransactionId(): string {
  return secureRandomHex(16);
}
