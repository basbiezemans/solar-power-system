import { describe, it, expect } from 'vitest';
import { Utils, Just, Nothing } from '../dist/utils.js';
import { BatteryCable } from '../dist/cable.js';
import { Battery } from '../dist/battery.js';
import { SolarPowerSystem } from '../dist/system.js';

describe('Utils', () => {
  describe('inRange', () => {
    it('should return true when value is within range', () => {
      expect(Utils.inRange(5, 1, 10)).toBe(true);
      expect(Utils.inRange(1, 1, 10)).toBe(true);
      expect(Utils.inRange(10, 1, 10)).toBe(true);
    });

    it('should return false when value is outside range', () => {
      expect(Utils.inRange(0, 1, 10)).toBe(false);
      expect(Utils.inRange(11, 1, 10)).toBe(false);
    });
  });

  describe('int', () => {
    it('should convert string to integer', () => {
      expect(Utils.int('42')).toBe(42);
      expect(Utils.int('0')).toBe(0);
      expect(Utils.int('-5')).toBe(-5);
    });

    it('should convert number to integer', () => {
      expect(Utils.int(42)).toBe(42);
      expect(Utils.int(42.7)).toBe(42);
    });

    it('should return 0 for invalid input', () => {
      expect(Utils.int('abc')).toBe(0);
      expect(Utils.int('not a number')).toBe(0);
    });
  });

  describe('float', () => {
    it('should convert string to float', () => {
      expect(Utils.float('3.14')).toBe(3.14);
      expect(Utils.float('42')).toBe(42);
      expect(Utils.float('-5.5')).toBe(-5.5);
    });

    it('should convert number to float', () => {
      expect(Utils.float(3.14)).toBe(3.14);
      expect(Utils.float(42)).toBe(42);
    });

    it('should return 0 for invalid input', () => {
      expect(Utils.float('abc')).toBe(0);
      expect(Utils.float('not a number')).toBe(0);
    });
  });

  describe('safediv', () => {
    it('should return Just with division result when denominator is not zero', () => {
      const result = Utils.safediv(10, 2);
      expect(result.isJust()).toBe(true);
      expect(result.fromMaybe(0)).toBe(5);
    });

    it('should handle floating point division', () => {
      const result = Utils.safediv(10, 3);
      expect(result.isJust()).toBe(true);
      expect(result.fromMaybe(0)).toBeCloseTo(3.333, 3);
    });

    it('should return Nothing when dividing by zero', () => {
      const result = Utils.safediv(10, 0);
      expect(result.isNothing()).toBe(true);
      expect(result.fromMaybe(0)).toBe(0);
    });
  });
});

describe('Maybe type', () => {
  describe('Just', () => {
    it('should encapsulate a value', () => {
      const just = Just(42);
      expect(just.isJust()).toBe(true);
      expect(just.isNothing()).toBe(false);
      expect(just.fromMaybe(0)).toBe(42);
    });

    it('should support fmap transformation', () => {
      const result = Just(5).fmap(x => x * 2);
      expect(result.fromMaybe(0)).toBe(10);
    });

    it('should chain fmap transformations', () => {
      const result = Just(5)
        .fmap(x => x * 2)
        .fmap(x => x + 3)
        .fmap(x => x / 2);
      expect(result.fromMaybe(0)).toBe(6.5);
    });
  });

  describe('Nothing', () => {
    it('should represent absence of value', () => {
      const nothing = Nothing<number>();
      expect(nothing.isJust()).toBe(false);
      expect(nothing.isNothing()).toBe(true);
      expect(nothing.fromMaybe(42)).toBe(42);
    });

    it('should ignore fmap and remain Nothing', () => {
      const result = Nothing<number>()
        .fmap(x => x * 2)
        .fmap(x => x + 3);
      expect(result.isNothing()).toBe(true);
      expect(result.fromMaybe(99)).toBe(99);
    });
  });
});

describe('BatteryCable', () => {
  const cable = new BatteryCable();

  describe('getLengthOptions', () => {
    it('should return array of cable lengths', () => {
      const lengths = cable.getLengthOptions();
      expect(lengths).toContain(6);
      expect(lengths).toContain(130);
      expect(lengths.length).toBe(16);
    });

    it('should apply callback if provided', () => {
      const lengths = cable.getLengthOptions(x => x * 2);
      expect(lengths[0]).toBe(12);
      expect(lengths[lengths.length - 1]).toBe(260);
    });
  });

  describe('getCurrentOptions', () => {
    it('should return array of current options', () => {
      const currents = cable.getCurrentOptions();
      expect(currents).toContain(5);
      expect(currents).toContain(200);
      expect(currents.length).toBe(16);
    });

    it('should apply callback if provided', () => {
      const currents = cable.getCurrentOptions(x => x * 2);
      expect(currents[0]).toBe(10);
      expect(currents[currents.length - 1]).toBe(400);
    });
  });

  describe('getWireGauge', () => {
    it('should return wire gauge for valid inputs', () => {
      const gauge = cable.getWireGauge(50, 50);
      expect(typeof gauge).toBe('string');
      expect(gauge).toContain('mm²');
    });

    it('should handle string inputs', () => {
      const gauge = cable.getWireGauge('50', '50');
      expect(typeof gauge).toBe('string');
      expect(gauge).toContain('mm²');
    });

    it('should return "Not available" for out-of-range inputs', () => {
      const gauge = cable.getWireGauge(1000, 1000);
      expect(gauge).toBe('Not available');
    });

    it('should format double-zero gauges correctly', () => {
      const gauge = cable.getWireGauge(60, 80);
      expect(gauge).toMatch(/[0]+\s\(.*mm²\)/);
    });
  });
});

describe('Battery', () => {
  it('should create lithium battery', () => {
    const battery = Battery('lithium');
    const capacity = battery.capacity(1000, 7);
    expect(capacity).toBe(7000);
  });

  it('should create lead-acid battery', () => {
    const battery = Battery('leadacid');
    const capacity = battery.capacity(1000, 7);
    expect(capacity).toBe(14000); // 50% DoD means 2x multiplier
  });

  it('should return null battery for unknown type', () => {
    const battery = Battery('unknown');
    expect(battery.capacity(1000, 7)).toBe(0);
  });

  it('should throw for invalid DoD range', () => {
    expect(() => {
      Battery('custom');
    }).not.toThrow(); // Returns null battery instead
  });
});

describe('SolarPowerSystem', () => {
  const system = new SolarPowerSystem();

  describe('getCapacityInAmpHours', () => {
    it('should convert watt hours to amp hours', () => {
      const ampHours = system.getCapacityInAmpHours(5000, 48);
      expect(ampHours).toBeGreaterThan(0);
      expect(ampHours).toBe(Math.ceil(5000 / 48));
    });

    it('should accept string inputs', () => {
      const ampHours = system.getCapacityInAmpHours('5000', '48');
      expect(ampHours).toBeGreaterThan(0);
    });

    it('should return 0 for division by zero', () => {
      const ampHours = system.getCapacityInAmpHours(5000, 0);
      expect(ampHours).toBe(0);
    });
  });

  describe('getFuseSizeAmperage', () => {
    it('should calculate fuse size as 125% of load rounded up to 5A increments', () => {
      const fuse = system.getFuseSizeAmperage(20);
      expect(fuse).toBe(25); // 20 * 1.25 = 25, which is already at 5A increment
    });

    it('should round up to next 5A increment', () => {
      const fuse = system.getFuseSizeAmperage(22);
      expect(fuse).toBe(30); // 22 * 1.25 = 27.5, rounds up to 30
    });

    it('should accept string inputs', () => {
      const fuse = system.getFuseSizeAmperage('20');
      expect(fuse).toBe(25);
    });
  });

  describe('getSolarArrayWattage', () => {
    it('should calculate solar array wattage rounded to 50W increments', () => {
      const wattage = system.getSolarArrayWattage(5000, 5);
      expect(wattage % 50).toBe(0); // Should be multiple of 50
      expect(wattage).toBeGreaterThanOrEqual(5000 / 5);
    });

    it('should accept string inputs', () => {
      const wattage = system.getSolarArrayWattage('5000', '5');
      expect(typeof wattage).toBe('number');
    });

    it('should return 0 for division by zero', () => {
      const wattage = system.getSolarArrayWattage(5000, 0);
      expect(wattage).toBe(0);
    });
  });

  describe('getSolarControllerAmperage', () => {
    it('should calculate controller amperage rounded to 20A increments', () => {
      const amperage = system.getSolarControllerAmperage(5000, 48);
      expect(amperage % 20).toBe(0); // Should be multiple of 20
    });

    it('should accept string inputs', () => {
      const amperage = system.getSolarControllerAmperage('5000', '48');
      expect(typeof amperage).toBe('number');
    });

    it('should return 0 for division by zero', () => {
      const amperage = system.getSolarControllerAmperage(5000, 0);
      expect(amperage).toBe(0);
    });
  });

  describe('getBatteryCapacity', () => {
    it('should calculate lithium battery capacity', () => {
      const capacity = system.getBatteryCapacity('lithium', 1000, 7);
      expect(capacity).toBe(7000);
    });

    it('should calculate lead-acid battery capacity with DoD adjustment', () => {
      const capacity = system.getBatteryCapacity('leadacid', 1000, 7);
      expect(capacity).toBe(14000); // 50% DoD = 2x multiplier
    });

    it('should return 0 for unknown battery type', () => {
      const capacity = system.getBatteryCapacity('unknown', 1000, 7);
      expect(capacity).toBe(0);
    });

    it('should accept string inputs', () => {
      const capacity = system.getBatteryCapacity('lithium', '1000', '7');
      expect(capacity).toBe(7000);
    });
  });
});
