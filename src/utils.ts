export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  // Handle arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // If b is array but a isn't, they're not equal
  if (Array.isArray(b)) return false;

  // Handle dates
  if (a instanceof Date) {
    return b instanceof Date && a.getTime() === b.getTime();
  }
  if (b instanceof Date) return false;

  // Handle objects
  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    // Quick length check first
    if (keysA.length !== keysB.length) return false;

    // Use for loop instead of every() to allow early exit
    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];
      if (
        !Object.prototype.hasOwnProperty.call(b, key) ||
        !isEqual(a[key], b[key])
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
};
