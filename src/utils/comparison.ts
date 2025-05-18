// src/utils/comparison.ts

/**
 * Deeply compares two values to check if they're equal
 * Handles arrays, dates, regular expressions, and complex nested objects
 *
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} Whether values are equal
 */
export const isEqual = (a: any, b: any): boolean => {
  // Same reference or primitive equality
  if (a === b) return true;

  // Handle null/undefined cases
  if (a == null || b == null) return a === b;

  // Different types
  if (typeof a !== typeof b) return false;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle regular expressions
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Handle primitive types
  if (typeof a !== "object") return a === b;

  // Handle objects
  if (typeof a === "object" && typeof b === "object") {
    // Handle Map
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (!b.has(key) || !isEqual(value, b.get(key))) return false;
      }
      return true;
    }

    // Handle Set
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (const value of a) {
        if (!b.has(value)) return false;
      }
      return true;
    }

    // Handle plain objects
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    // Different number of properties
    if (keysA.length !== keysB.length) return false;

    // Check all keys recursively
    return keysA.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) && isEqual(a[key], b[key])
    );
  }

  return false;
};

/**
 * Shallow comparison for performance optimization
 * Use this when you know objects don't have nested structures
 */
export const isShallowEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => a[key] === b[key]);
};
