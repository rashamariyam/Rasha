/**
 * Universal Validation and Sanitization Utilities
 * Enforces strict numeric constraints and Indian mobile number validation (10 digits, starts with 6-9).
 */

/**
 * Sanitizes phone input:
 * - Strips all non-digit characters (rejects alphabets A-Z, symbols @, #, $, etc.)
 * - Handles pasting with +91 or 91 country code prefix (e.g. +91 9876543210 -> 9876543210)
 * - Restricts length to at most 10 digits
 */
export function sanitizePhone(input: string): string {
  if (!input) return '';
  // 1. Remove all non-digits
  let digits = input.replace(/\D/g, '');

  // 2. If user pasted with India country code prefix (+91 or 0), strip it
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.slice(1);
  }

  // 3. Limit to max 10 digits
  return digits.slice(0, 10);
}

/**
 * Validates an Indian 10-digit mobile number:
 * - Exactly 10 numeric digits
 * - Must start with 6, 7, 8, or 9
 */
export function validatePhone(phone: string, required: boolean = false): { isValid: boolean; error: string | null } {
  const clean = sanitizePhone(phone);

  if (!clean) {
    if (required) {
      return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true, error: null };
  }

  if (clean.length < 10) {
    return {
      isValid: false,
      error: `Please enter a valid 10-digit mobile number (${clean.length}/10 digits entered)`,
    };
  }

  if (!/^[6-9]/.test(clean)) {
    return {
      isValid: false,
      error: 'Mobile number must begin with 6, 7, 8, or 9',
    };
  }

  if (!/^[6-9]\d{9}$/.test(clean)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit mobile number',
    };
  }

  return { isValid: true, error: null };
}

/**
 * Sanitizes integer input (rejects alphabets, symbols, negative signs, decimals):
 * Clamps within min and optional max bounds.
 */
export function sanitizeInteger(raw: unknown, min: number = 1, max: number = 1000): number {
  if (typeof raw === 'number' && !isNaN(raw)) {
    return Math.min(max, Math.max(min, Math.floor(raw)));
  }
  const cleanStr = String(raw || '').replace(/\D/g, '');
  const parsed = parseInt(cleanStr, 10);
  if (isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

/**
 * Validates an integer field (e.g. capacity, floor):
 * Returns clear error message or null.
 */
export function validateInteger(
  val: unknown,
  fieldName: string = 'Field',
  min: number = 1,
  max: number = 1000
): { isValid: boolean; error: string | null } {
  if (val === '' || val === null || val === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const str = String(val).trim();
  if (!/^\d+$/.test(str)) {
    return { isValid: false, error: `${fieldName} must contain numbers only (no alphabets or symbols)` };
  }

  const num = Number(str);
  if (num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { isValid: true, error: null };
}

