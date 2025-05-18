// src/utils/comparison.ts

/**
 * Deeply compares two values to check if they're equal
 * More reliable than JSON.stringify for complex objects
 *
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} Whether values are equal
 */
export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  // Check if both are objects and not null
  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // Different number of properties
  if (keysA.length !== keysB.length) return false;

  // Check all keys recursively
  return keysA.every((key) => keysB.includes(key) && isEqual(a[key], b[key]));
};
