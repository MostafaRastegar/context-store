// src/utils/errorHandler.ts
import {
  StoreError,
  SubscriptionError,
  StateUpdateError,
  getErrorMessage,
  getErrorName,
  isError,
} from "./logger";

/**
 * Centralized error handler for store operations
 */
export class ErrorHandler {
  /**
   * Handle errors in setState operations
   */
  static handleSetStateError(error: unknown, context?: any): never {
    const message = getErrorMessage(error);
    const errorName = getErrorName(error);

    // If it's already our custom error, re-throw it
    if (error instanceof StateUpdateError) {
      throw error;
    }

    // Create appropriate error based on error type
    if (errorName.includes("TypeError")) {
      throw new StateUpdateError(`Invalid state update: ${message}`, context);
    }

    if (errorName.includes("RangeError")) {
      throw new StateUpdateError(
        `State update out of range: ${message}`,
        context
      );
    }

    // Generic state update error
    throw new StateUpdateError(`setState failed: ${message}`, context);
  }

  /**
   * Handle errors in subscription operations
   */
  static handleSubscriptionError(error: unknown, context?: any): never {
    const message = getErrorMessage(error);

    // If it's already our custom error, re-throw it
    if (error instanceof SubscriptionError) {
      throw error;
    }

    // Create subscription error
    throw new SubscriptionError(
      `Subscription failed: ${message}`,
      context?.key
    );
  }

  /**
   * Handle general store errors
   */
  static handleStoreError(
    error: unknown,
    action: string,
    context?: any
  ): never {
    const message = getErrorMessage(error);

    // If it's already our custom error, re-throw it
    if (error instanceof StoreError) {
      throw error;
    }

    // Create general store error
    throw new StoreError(
      `Store operation '${action}' failed: ${message}`,
      action,
      context
    );
  }

  /**
   * Safe error logging helper
   */
  static logError(error: unknown, context?: string): void {
    const message = getErrorMessage(error);
    const name = getErrorName(error);

    console.error(`[${context || "Store"}] ${name}: ${message}`, {
      originalError: error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Try-catch wrapper with automatic error handling
   */
  static async tryAsync<T>(
    operation: () => Promise<T>,
    errorHandler: (error: unknown) => never,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (context) {
        ErrorHandler.logError(error, context);
      }
      errorHandler(error);
    }
  }

  /**
   * Try-catch wrapper for synchronous operations
   */
  static try<T>(
    operation: () => T,
    errorHandler: (error: unknown) => never,
    context?: string
  ): T {
    try {
      return operation();
    } catch (error) {
      if (context) {
        ErrorHandler.logError(error, context);
      }
      errorHandler(error);
    }
  }
}
