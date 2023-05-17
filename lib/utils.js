'use strict';

/**
 * Represents a collection of utility functions
 * @constructor
 * @returns {object} Utils
 */
function Utils() {
    /**
     * Determine if a number is within a certain range
     * @param {number} x 
     * @param {number} min 
     * @param {number} max 
     * @returns {boolean}
     */
    function inRange(x, min, max) {
        return (x >= min && x <= max);
    }

    /**
     * Convert a numeric string to an integer
     * @param {string} value Numeric string
     * @returns {integer}
     */
    function int(value) {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            console.error('parseInt: not a number');
            return 0;
        }
        return parsed;
    }

    /**
     * Convert a numeric string to a float
     * @param {string} value Numeric string
     * @returns {float}
     */
    function float(value) {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            console.error('parseFloat: not a number');
            return 0;
        }
        return parsed;
    }

    /**
     * Safe division
     * @param {number} a 
     * @param {number} b 
     * @returns {Maybe} Maybe number
     */
    function safediv(a, b) {
        if (b == 0) {
            console.error('Division by zero');
            return Nothing();
        }
        return Just(a / b);
    }

    return Object.freeze({
        int,
        float,
        safediv,
        inRange        
    });
}