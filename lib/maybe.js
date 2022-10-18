'use strict';

/**
 * Represents an encapsulated value (Just something)
 * @constructor
 * @param {any} value 
 * @returns {object} Just
 */
function Just(value) {
    function fromMaybe(_defaultValue) {
        return value;
    }
    function isJust() {
        return true;
    }
    function isNothing() {
        return false;
    }
    function fmap(func) {
        return Just(func(value));
    }
    return Object.freeze({
        isJust,
        isNothing,
        fmap,
        fromMaybe
    });
}

/**
 * Represents a missing value (Nothing)
 * @constructor
 * @returns {object} Nothing
 */
function Nothing() {
    function fromMaybe(defaultValue) {
        return defaultValue;
    }
    function isJust() {
        return false;
    }
    function isNothing() {
        return true;
    }
    function fmap(_func) {
        return this;
    }
    return Object.freeze({
        isJust,
        isNothing,
        fmap,
        fromMaybe
    });
}