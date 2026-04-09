import { Utils } from './utils.js';

/**
 * Represents a solar battery with a certain charge capacity
 */
export function Battery(type: string): BatteryType {
  switch (type) {
    case 'lithium':
      return SolarBattery(100);
    case 'leadacid':
      return SolarBattery(50);
    default:
      console.error('Unknown type: ' + type);
      return NullBattery();
  }
}

interface BatteryType {
  capacity(watts: number, backup: number): number;
}

/**
 * Represents a solar battery with a limited lifespan
 */
function SolarBattery(dod: number): BatteryType {
  const inRange = Utils.inRange;

  if (!inRange(dod, 1, 100)) {
    throw new RangeError('DoD must be between 1 and 100');
  }

  // Depth of discharge (DoD) is the discharge percentage for the longest possible lifespan.
  // 100% DoD means no reduction in charge capacity, 50% DoD means only half the capacity is available.
  // We'll have to compensate for reduced charge capacity.
  const multiplier = 100 / dod;

  /**
   * Calculate the required battery capacity for a given amount of watt hours and battery backup days
   */
  function capacity(watts: number, backup: number): number {
    return Math.round(watts * backup * multiplier);
  }

  return Object.freeze({ capacity });
}

/**
 * Null object pattern for battery
 */
function NullBattery(): BatteryType {
  return Object.freeze({
    capacity: (_watts: number, _backup: number): number => 0
  });
}
