/**
 * Utility for managing valid flat numbers in the society.
 * Valid ranges: 101-123, 201-223, 301-323, 401-423, 501-523
 */

/**
 * Generates all valid flat numbers for the society
 * @returns Array of valid flat numbers as strings
 */
export function getValidFlatNumbers(): string[] {
  const flats: string[] = [];
  
  // Generate flats for floors 1-5, each with units 01-23
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 23; unit++) {
      const flatNumber = floor * 100 + unit;
      flats.push(flatNumber.toString());
    }
  }
  
  return flats;
}

/**
 * Validates if a flat number is within the valid ranges
 * @param flatNumber - The flat number to validate (string or number)
 * @returns true if valid, false otherwise
 */
export function isValidFlatNumber(flatNumber: string | number | bigint): boolean {
  const num = typeof flatNumber === 'bigint' ? Number(flatNumber) : Number(flatNumber);
  
  if (isNaN(num)) return false;
  
  // Check if it's in valid range: 101-523
  if (num < 101 || num > 523) return false;
  
  // Extract floor and unit
  const floor = Math.floor(num / 100);
  const unit = num % 100;
  
  // Floor must be 1-5, unit must be 1-23
  return floor >= 1 && floor <= 5 && unit >= 1 && unit <= 23;
}

/**
 * Formats a flat number for display
 * @param flatNumber - The flat number to format
 * @returns Formatted string like "Flat 101"
 */
export function formatFlatNumber(flatNumber: string | number | bigint): string {
  return `Flat ${flatNumber}`;
}

/**
 * Gets the next valid flat number from the current value
 * @param currentValue - The current flat number (may be empty, invalid, or valid)
 * @returns The next valid flat number as a string
 */
export function getNextFlatNumber(currentValue: string): string {
  const validFlats = getValidFlatNumbers();
  
  // If empty or invalid, return the first valid flat
  if (!currentValue || !isValidFlatNumber(currentValue)) {
    return validFlats[0];
  }
  
  const currentNum = Number(currentValue);
  const currentIndex = validFlats.findIndex(flat => Number(flat) === currentNum);
  
  // If at the end, wrap to the beginning
  if (currentIndex === -1 || currentIndex === validFlats.length - 1) {
    return validFlats[0];
  }
  
  return validFlats[currentIndex + 1];
}

/**
 * Gets the previous valid flat number from the current value
 * @param currentValue - The current flat number (may be empty, invalid, or valid)
 * @returns The previous valid flat number as a string
 */
export function getPreviousFlatNumber(currentValue: string): string {
  const validFlats = getValidFlatNumbers();
  
  // If empty or invalid, return the last valid flat
  if (!currentValue || !isValidFlatNumber(currentValue)) {
    return validFlats[validFlats.length - 1];
  }
  
  const currentNum = Number(currentValue);
  const currentIndex = validFlats.findIndex(flat => Number(flat) === currentNum);
  
  // If at the beginning, wrap to the end
  if (currentIndex === -1 || currentIndex === 0) {
    return validFlats[validFlats.length - 1];
  }
  
  return validFlats[currentIndex - 1];
}
