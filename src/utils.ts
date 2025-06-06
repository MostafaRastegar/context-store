// Optimized deep equality check
export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => isEqual(v, b[i]));
  }

  // If one is array and other isn't, they're not equal
  if (Array.isArray(a) || Array.isArray(b)) {
    return false;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // If one is date and other isn't, they're not equal
  if (a instanceof Date || b instanceof Date) {
    return false;
  }

  // Handle objects
  if (typeof a === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return (
      keysA.length === keysB.length &&
      keysA.every(
        (k) => Object.prototype.hasOwnProperty.call(b, k) && isEqual(a[k], b[k])
      )
    );
  }

  return false;
};
