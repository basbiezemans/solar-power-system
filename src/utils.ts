/**
 * Represents a collection of utility functions
 */
export class Utils {
  /**
   * Determine if a number is within a certain range
   */
  static inRange(x: number, min: number, max: number): boolean {
    return x >= min && x <= max;
  }

  /**
   * Convert a numeric string to an integer
   */
  static int(value: string | number): number {
    const parsed = parseInt(String(value), 10);
    if (isNaN(parsed)) {
      console.error('parseInt: not a number');
      return 0;
    }
    return parsed;
  }

  /**
   * Convert a numeric string to a float
   */
  static float(value: string | number): number {
    const parsed = parseFloat(String(value));
    if (isNaN(parsed)) {
      console.error('parseFloat: not a number');
      return 0;
    }
    return parsed;
  }

  /**
   * Safe division
   */
  static safediv(a: number, b: number): Maybe<number> {
    if (b === 0) {
      console.error('Division by zero');
      return Nothing<number>();
    }
    return Just<number>(a / b);
  }
}

/**
 * Maybe type - represents a value that may or may not exist
 */
export interface Maybe<T> {
  isJust(): boolean;
  isNothing(): boolean;
  fmap<U>(func: (value: T) => U): Maybe<U>;
  fromMaybe(defaultValue: T): T;
}

/**
 * Represents an encapsulated value (Just something)
 */
function Just<T>(value: T): Maybe<T> {
  return Object.freeze({
    isJust(): boolean {
      return true;
    },
    isNothing(): boolean {
      return false;
    },
    fmap<U>(func: (value: T) => U): Maybe<U> {
      return Just<U>(func(value));
    },
    fromMaybe(_defaultValue: T): T {
      return value;
    }
  });
}

/**
 * Represents a missing value (Nothing)
 */
function Nothing<T>(): Maybe<T> {
  return Object.freeze({
    isJust(): boolean {
      return false;
    },
    isNothing(): boolean {
      return true;
    },
    fmap<U>(_func: (value: T) => U): Maybe<U> {
      return Nothing<U>();
    },
    fromMaybe(defaultValue: T): T {
      return defaultValue;
    }
  });
}

export { Just, Nothing };
