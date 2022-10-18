'use strict';

/**
 * Represents a solar power system
 * @constructor
 * @returns {object} SolarPowerSystem
 */
function SolarPowerSystem() {
    const int = Utils().int;
    const safediv = Utils().safediv;

    /**
     * Convert Watt hours to Amp hours
     * @param {integer} capacity Watt hours
     * @param {integer} voltage 
     * @returns {integer} Amp hours
     */
    function wattHrsToAmpHrs(capacity, voltage) {
        return safediv(capacity, voltage).fmap(Math.ceil).fromMaybe(0);
    }

    /**
     * Fuse size amperage
     * @param {integer} amperage load
     * @returns {integer} Amp
     */
    function fuseSizeAmperage(amperage) {
        const inc5 = (x) => Math.ceil(x / 5) * 5;
        return inc5(amperage * 1.25); // 125% of the load
    }

    /**
     * Calculate solar array capacity
     * @param {integer} capacity Watt hours
     * @param {integer} hours 
     * @returns {integer} Watt (50W increments)
     */
    function solarArrayWattage(capacity, hours) {
        const inc50 = (x) => Math.ceil(x / 50) * 50;
        return safediv(capacity, hours).fmap(inc50).fromMaybe(0);
    }

    /**
     * Calculate solar charge controller amperage
     * @param {integer} watts 
     * @param {integer} voltage 
     * @returns {integer} Amp (20A increments)
     */
    function solarControllerAmperage(watts, voltage) {
        const inc20 = (x) => Math.ceil(x / 20) * 20;
        return safediv(watts, voltage).fmap(inc20).fromMaybe(0);
    }

    /**
     * Return fuse size amperage
     * @param {string} amperage load
     * @returns {integer} amperage
     */
    function getFuseSizeAmperage(amperage) {
        return fuseSizeAmperage(int(amperage));
    }

    /**
     * Return capacity in Amp hours
     * @param {string} capacity 
     * @param {string} voltage 
     * @returns {integer} Amp hours
     */
    function getCapacityInAmpHours(capacity, voltage) {
        return wattHrsToAmpHrs(int(capacity), int(voltage));
    }

    /**
     * Return solar array wattage
     * @param {string} capacity 
     * @param {string} hours 
     * @returns {integer}
     */
    function getSolarArrayWattage(capacity, hours) {
        return solarArrayWattage(int(capacity), int(hours));
    }

    /**
     * Return solar charge controller amperage
     * @param {string} capacity 
     * @param {string} voltage 
     * @returns {integer}
     */
    function getSolarControllerAmperage(capacity, voltage) {
        return solarControllerAmperage(int(capacity), int(voltage));
    }

    /**
     * Return battery charge capacity
     * @param {string} type 
     * @param {string} watts 
     * @param {string} hours 
     * @param {string} backup 
     * @returns {integer} Watt hours
     */
    function getBatteryCapacity(type, watts, hours, backup) {
        return Battery(type).capacity(int(watts), int(hours), int(backup));
    }

    return Object.freeze({
        getBatteryCapacity,
        getFuseSizeAmperage,
        getCapacityInAmpHours,
        getSolarArrayWattage,
        getSolarControllerAmperage
    });
}
