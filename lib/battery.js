'use strict';

/**
 * Represents a solar battery with a certain charge capacity
 * @constructor
 * @param {string} type Battery type
 * @returns {object} SolarBattery | NullBattery
 */
function Battery(type) {

    switch (type) {
        case 'lithium':
            return SolarBattery(100);
        case 'leadacid':
            return SolarBattery(50);
        default:
            console.error('Unknown type: ' + type);
            return NullBattery();
    }

    /**
     * Represents a solar battery with a limited lifespan
     * @param {integer} dod Depth of Discharge (DoD)
     * @returns {object} SolarBattery
     */
    function SolarBattery(dod) {
        const inRange = Utils().inRange;

        if (!inRange(dod, 1, 100)) {
            throw new RangeError('DoD must be between 1 and 100');
        }

        // Depth of discharge (DoD) is the discharge
        // percentage for the longest possible lifespan.
        // 100% DoD means no reduction in charge capacity,
        // 50% DoD means only half the capacity is available.
        // We'll have to compensate for reduced charge capacity.
        const multiplier = 100 / dod;

        /**
         * Calculate the required battery capacity for a certain load,
         * number of hours per day and battery backup days
         * @param {integer} watts 
         * @param {integer} hours 
         * @param {integer} backup 
         * @returns {integer} Watt hours
         */
        function capacity(watts, hours, backup) {
            return Math.round(watts * hours * backup * multiplier);
        }

        return Object.freeze({ capacity });
    }

    /**
     * Null object
     * @returns {object} NullBattery
     */
    function NullBattery() {
        return Object.freeze({
            capacity: (_watts, _hours, _backup) => 0
        });
    }
}