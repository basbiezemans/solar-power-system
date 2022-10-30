'use strict';

/**
 * Represents a copper battery cable with a 3% voltage drop
 * @constructor
 * @returns {object} BatteryCable
 */
function BatteryCable() {
    const int = Utils().int;

    // American Wire Gauge matrix
    const awg = [
          [16, 16, 14, 14, 12, 10,  8,  6,  6,  6,  4,  4,  4,  2,  1, -1]
        , [16, 14, 12, 12, 10, 10,  8,  6,  6,  6,  4,  4,  4,  2,  1, -1]
        , [16, 12, 10, 10,  8,  8,  6,  6,  4,  4,  4,  2,  2,  2,  1, -1]
        , [14, 10, 10,  8,  6,  6,  6,  4,  4,  2,  2,  2,  2,  1,  0, -1]
        , [12, 10,  8,  6,  6,  6,  4,  4,  2,  2,  2,  1,  1,  0, -1, -2]
        , [12, 10,  8,  6,  6,  4,  4,  2,  2,  1,  1,  0,  0, -1, -2, -3]
        , [10,  8,  6,  6,  4,  4,  2,  2,  1,  0,  0, -1, -1, -2, -3, -3]
        , [10,  6,  6,  4,  4,  2,  2,  1,  0, -1, -2, -2, -2, -3, -3]
        , [10,  6,  6,  4,  2,  2,  1,  0, -1, -2, -2, -3, -3, -3]
        , [ 8,  6,  4,  2,  2,  1,  0, -1, -2, -2, -3, -3]
        , [ 8,  6,  4,  2,  2,  1,  0, -1, -2, -3, -3]
        , [ 8,  4,  2,  2,  1,  0, -1, -2, -3, -3]
        , [ 6,  4,  2,  2,  1,  0, -1, -2, -3]
        , [ 6,  4,  2,  1,  0,  0, -2, -3, -3]
        , [ 6,  4,  2,  1,  0, -1, -2, -3]
        , [ 6,  2,  2,  1,  0, -1, -2, -3]
    ];

    // Row labels: cable length in feet
    const row = [
        6, 10, 15, 20, 25, 30, 40, 50,
        60, 70, 80, 90, 100, 110, 120, 130
    ];

    // Column labels: current flow in Amps
    const col = [
        5, 10, 15, 20, 25, 30, 40, 50,
        60, 70, 80, 90, 100, 120, 150, 200
    ];

    // AWG wire size mapping to the closest available equivalent in metric
    const metric = {
        '16': 1.5, '14': 2.5, '12':   4, '10':  6, '8': 10,
         '6':  16,  '4':  25,  '2':  35,  '1': 50, '0': 60,
        '-1':  70, '-2':  95, '-3': 120
    }

    /**
     * Return an array of cable length options
     * @param {function(any): any} [callback]
     * @returns {array}
     */
    function getLengthOptions(callback) {
        if (callback) {
            return row.map(callback);
        }
        return row;
    }

    /**
     * Return an array of current flow options
     * @param {function(any): any} [callback]
     * @returns {array}
     */
     function getCurrentOptions(callback) {
        if (callback) {
            return col.map(callback);
        }
        return col;
    }

    /**
     * Replicate an array of length n, with x as the value of every element
     * @param {integer} n positive integer
     * @param {any} x value
     * @returns {array}
     */
    function replicate(n, x) {
        var a = [];
        for (var i = 0; i < n; i++) {
            a.push(x);
        }
        return a;
    }

    /**
     * Get wire gauge based on U.S. Coast Guard regulation
     * @param {string} length cable length
     * @param {string} amperage load amperage
     * @returns {string} gauge
     */
    function getWireGauge(length, amperage) {
        const m = row.indexOf(int(length));
        const n = col.indexOf(int(amperage));
        const gauge = awg[m][n];
        if (gauge === undefined) {
            return 'Not available';
        }
        const mm = ` (${metric[gauge]} mm²)`;
        // Gauge 0 .. 16
        if (gauge >= 0) {
            return String(gauge) + mm;
        }
        // Gauge 2/0 .. 4/0
        return replicate(1 + Math.abs(gauge), 0).join('') + mm;
    }

    return Object.freeze({
        getWireGauge,
        getLengthOptions,
        getCurrentOptions
    });
}
