import { Utils } from './utils.js';
import { Battery } from './battery.js';

/**
 * Represents a solar power system
 */
export class SolarPowerSystem {
  private readonly int = Utils.int;
  private readonly safediv = Utils.safediv;

  /**
   * Convert Watt hours to Amp hours
   */
  private wattHrsToAmpHrs(capacity: number, voltage: number): number {
    return this.safediv(capacity, voltage).fmap(Math.ceil).fromMaybe(0);
  }

  /**
   * Fuse size amperage
   */
  private fuseSizeAmperage(amperage: number): number {
    const inc5 = (x: number) => Math.ceil(x / 5) * 5;
    return inc5(amperage * 1.25); // 125% of the load
  }

  /**
   * Calculate solar array capacity
   */
  private solarArrayWattage(capacity: number, hours: number): number {
    const inc50 = (x: number) => Math.ceil(x / 50) * 50;
    return this.safediv(capacity, hours).fmap(inc50).fromMaybe(0);
  }

  /**
   * Calculate solar charge controller amperage
   */
  private solarControllerAmperage(watts: number, voltage: number): number {
    const inc20 = (x: number) => Math.ceil(x / 20) * 20;
    return this.safediv(watts, voltage).fmap(inc20).fromMaybe(0);
  }

  /**
   * Return fuse size amperage
   */
  getFuseSizeAmperage(amperage: string | number): number {
    return this.fuseSizeAmperage(this.int(amperage));
  }

  /**
   * Return capacity in Amp hours
   */
  getCapacityInAmpHours(capacity: string | number, voltage: string | number): number {
    return this.wattHrsToAmpHrs(this.int(capacity), this.int(voltage));
  }

  /**
   * Return solar array wattage
   */
  getSolarArrayWattage(capacity: string | number, hours: string | number): number {
    return this.solarArrayWattage(this.int(capacity), this.int(hours));
  }

  /**
   * Return solar charge controller amperage
   */
  getSolarControllerAmperage(capacity: string | number, voltage: string | number): number {
    return this.solarControllerAmperage(this.int(capacity), this.int(voltage));
  }

  /**
   * Return battery charge capacity
   */
  getBatteryCapacity(type: string, watts: string | number, backup: string | number): number {
    return Battery(type).capacity(this.int(watts), this.int(backup));
  }
}
