/**
 * Short Code Generator for URL Shortener
 * Uses Base62 encoding (0-9, a-z, A-Z) for generating short codes
 */

// Base62 alphabet: 0-9 (10) + a-z (26) + A-Z (26) = 62 characters
const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BASE62_ALPHABET.length;

/**
 * Convert a number to base62 string
 * @param num - The number to convert
 * @returns Base62 encoded string
 */
export function toBase62(num: number): string {
  if (num === 0) return BASE62_ALPHABET[0];

  let result = '';
  while (num > 0) {
    result = BASE62_ALPHABET[num % BASE] + result;
    num = Math.floor(num / BASE);
  }

  return result;
}

/**
 * Convert a base62 string back to number
 * @param str - Base62 encoded string
 * @returns Decoded number
 */
export function fromBase62(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE62_ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error(`Invalid base62 character: ${char}`);
    }
    result = result * BASE + value;
  }
  return result;
}

/**
 * Generate a short code based on a counter with optional salt
 * @param counter - The counter/ID to base the short code on
 * @param minLength - Minimum length of the short code (default: 4)
 * @returns Generated short code
 */
export function generateShortCode(counter: number, minLength: number = 4): string {
  // Add a salt to make codes less predictable
  // This helps avoid sequential codes being easily guessable
  const salt = 1000000; // Starting offset to ensure minimum length
  const salted = counter + salt;

  let shortCode = toBase62(salted);

  // Pad with random characters if needed to meet minimum length
  while (shortCode.length < minLength) {
    const randomIndex = Math.floor(Math.random() * BASE);
    shortCode = BASE62_ALPHABET[randomIndex] + shortCode;
  }

  return shortCode;
}

/**
 * Validate if a string is a valid custom alias
 * @param alias - The alias to validate
 * @returns true if valid, false otherwise
 */
export function isValidAlias(alias: string): boolean {
  if (!alias || alias.length < 3 || alias.length > 20) {
    return false;
  }

  // Allow alphanumeric characters, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(alias);
}

/**
 * Generate a random fallback code if collision occurs
 * @param length - Length of the random code (default: 6)
 * @returns Random short code
 */
export function generateRandomCode(length: number = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE);
    result += BASE62_ALPHABET[randomIndex];
  }
  return result;
}

/**
 * Check if a string looks like a base62 generated code or a custom alias
 * @param code - The code to check
 * @returns 'base62' | 'alias' | 'invalid'
 */
export function getCodeType(code: string): 'base62' | 'alias' | 'invalid' {
  if (!code || code.length === 0) return 'invalid';

  // Check if all characters are in base62 alphabet
  const isBase62 = code.split('').every(char => BASE62_ALPHABET.includes(char));

  if (!isBase62) return 'invalid';

  // If it contains special characters allowed in alias but not in pure base62
  if (code.includes('-') || code.includes('_')) {
    return isValidAlias(code) ? 'alias' : 'invalid';
  }

  // Pure alphanumeric - could be either, but we'll treat short ones as base62
  // and longer, more readable ones as potential aliases
  if (code.length <= 6 && /^[a-zA-Z0-9]+$/.test(code)) {
    return 'base62';
  }

  return isValidAlias(code) ? 'alias' : 'base62';
}