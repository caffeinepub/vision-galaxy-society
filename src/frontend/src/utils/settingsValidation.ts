/**
 * Validation utilities for Secretary Settings page
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates maintenance amount input
 * Must be a positive integer greater than 0
 */
export function validateMaintenanceAmount(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Maintenance amount is required' };
  }

  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (num <= 0) {
    return { isValid: false, error: 'Must be greater than 0' };
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Must be a whole number' };
  }

  return { isValid: true };
}

/**
 * Validates UPI ID input
 * Must not be empty
 */
export function validateUpiId(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'UPI ID is required' };
  }

  return { isValid: true };
}

/**
 * Validates guard mobile number input
 * Must not be empty
 */
export function validateGuardMobileNumber(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: 'Guard mobile number is required' };
  }

  return { isValid: true };
}

/**
 * Validates all settings fields at once
 */
export function validateAllSettings(
  maintenanceAmount: string,
  upiId: string,
  guardMobileNumber: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const amountResult = validateMaintenanceAmount(maintenanceAmount);
  if (!amountResult.isValid) {
    errors.maintenanceAmount = amountResult.error!;
  }

  const upiResult = validateUpiId(upiId);
  if (!upiResult.isValid) {
    errors.upiId = upiResult.error!;
  }

  const mobileResult = validateGuardMobileNumber(guardMobileNumber);
  if (!mobileResult.isValid) {
    errors.guardMobileNumber = mobileResult.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
