import { Utils } from './utils.js';

/**
 * Represents a copper battery cable with a 3% voltage drop
 */
export class BatteryCable {
  private readonly int = Utils.int;

  // American Wire Gauge matrix
  private readonly awg: number[][] = [
    [16, 16, 14, 14, 12, 10, 8, 6, 6, 6, 4, 4, 4, 2, 1, -1],
    [16, 14, 12, 12, 10, 10, 8, 6, 6, 6, 4, 4, 4, 2, 1, -1],
    [16, 12, 10, 10, 8, 8, 6, 6, 4, 4, 4, 2, 2, 2, 1, -1],
    [14, 10, 10, 8, 6, 6, 6, 4, 4, 2, 2, 2, 2, 1, 0, -1],
    [12, 10, 8, 6, 6, 6, 4, 4, 2, 2, 2, 1, 1, 0, -1, -2],
    [12, 10, 8, 6, 6, 4, 4, 2, 2, 1, 1, 0, 0, -1, -2, -3],
    [10, 8, 6, 6, 4, 4, 2, 2, 1, 0, 0, -1, -1, -2, -3, -3],
    [10, 6, 6, 4, 4, 2, 2, 1, 0, -1, -2, -2, -2, -3, -3],
    [10, 6, 6, 4, 2, 2, 1, 0, -1, -2, -2, -3, -3, -3],
    [8, 6, 4, 2, 2, 1, 0, -1, -2, -2, -3, -3],
    [8, 6, 4, 2, 2, 1, 0, -1, -2, -3, -3],
    [8, 4, 2, 2, 1, 0, -1, -2, -3, -3],
    [6, 4, 2, 2, 1, 0, -1, -2, -3],
    [6, 4, 2, 1, 0, 0, -2, -3, -3],
    [6, 4, 2, 1, 0, -1, -2, -3],
    [6, 2, 2, 1, 0, -1, -2, -3]
  ];

  // Row labels: cable length in feet
  private readonly row: number[] = [6, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130];

  // Column labels: current flow in Amps
  private readonly col: number[] = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150, 200];

  // AWG wire size mapping to the closest available equivalent in metric
  private readonly metric: Record<string, number> = {
    '16': 1.5,
    '14': 2.5,
    '12': 4,
    '10': 6,
    '8': 10,
    '6': 16,
    '4': 25,
    '2': 35,
    '1': 50,
    '0': 60,
    '-1': 70,
    '-2': 95,
    '-3': 120
  };

  /**
   * Return an array of cable length options
   */
  getLengthOptions(callback?: (value: number) => any): number[] | any[] {
    if (callback) {
      return this.row.map(callback);
    }
    return this.row;
  }

  /**
   * Return an array of current flow options
   */
  getCurrentOptions(callback?: (value: number) => any): number[] | any[] {
    if (callback) {
      return this.col.map(callback);
    }
    return this.col;
  }

  /**
   * Replicate an array of length n, with x as the value of every element
   */
  private replicate(n: number, x: any): any[] {
    const a: any[] = [];
    for (let i = 0; i < n; i++) {
      a.push(x);
    }
    return a;
  }

  /**
   * Get wire gauge based on U.S. Coast Guard regulation
   */
  getWireGauge(length: string | number, amperage: string | number): string {
    const m = this.row.indexOf(this.int(length));
    const n = this.col.indexOf(this.int(amperage));
    const gauge = this.awg[m]?.[n];

    if (gauge === undefined) {
      return 'Not available';
    }

    const mm = ` (${this.metric[String(gauge)]} mm²)`;

    // Gauge 0 .. 16
    if (gauge >= 0) {
      return String(gauge) + mm;
    }

    // Gauge 2/0 .. 4/0
    return this.replicate(1 + Math.abs(gauge), 0).join('') + mm;
  }
}
