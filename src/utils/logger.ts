// src/utils/logger.ts

/**
 * Logger utility for development debugging
 */
export class StoreLogger {
  private static isDev =
    typeof process !== "undefined" && process.env.NODE_ENV === "development";
  private static isEnabled = StoreLogger.isDev;

  static enable() {
    StoreLogger.isEnabled = true;
  }

  static disable() {
    StoreLogger.isEnabled = false;
  }

  static log(action: string, data?: any) {
    if (!StoreLogger.isEnabled) return;

    console.group(`🏪 Store: ${action}`);
    if (data !== undefined) {
      console.log("Data:", data);
    }
    // console.trace("Stack trace");
    console.groupEnd();
  }

  static warn(message: string, data?: any) {
    if (!StoreLogger.isEnabled) return;

    console.warn(`🏪 Store Warning: ${message}`, data || "");
  }

  static error(message: string, error?: any) {
    if (!StoreLogger.isEnabled) return;

    console.error(`🏪 Store Error: ${message}`, error || "");
  }
}

/**
 * Type guard to check if value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return String(error);
}

/**
 * Safely extract error name from unknown error
 */
export function getErrorName(error: unknown): string {
  if (isError(error)) {
    return error.name;
  }

  if (error && typeof error === "object" && "name" in error) {
    return String(error.name);
  }

  return "Unknown Error";
}

/**
 * Error classes for better error handling
 */
export class StoreError extends Error {
  constructor(message: string, public action?: string, public data?: any) {
    super(message);
    this.name = "StoreError";
  }
}

export class SubscriptionError extends StoreError {
  constructor(message: string, key?: string) {
    super(message, "subscription", { key });
    this.name = "SubscriptionError";
  }
}

export class StateUpdateError extends StoreError {
  constructor(message: string, updates?: any) {
    super(message, "setState", { updates });
    this.name = "StateUpdateError";
  }
}
