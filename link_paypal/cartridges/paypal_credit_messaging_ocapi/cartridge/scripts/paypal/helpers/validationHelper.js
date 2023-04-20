'use strict';

var validationHelper = {};

/**
 * Validates whether this value belongs to the string data type
 * @param {string} value we are checking
 * @returns {boolean} returns true if the current value belongs to the string data type
**/
validationHelper.validateRequestStringValue = function (value) {
    return value !== null && typeof value === 'string' && value.length !== 0;
};

/**
 * Validates an orderAddress document from Ocapi call
 * @param {OrderAddress} address Document representing an order address.
 * @returns {boolean} true/false
 */
validationHelper.validateOrderAddress = function (address) {
    return validationHelper.validateRequestStringValue(address.firstName) &&
        validationHelper.validateRequestStringValue(address.lastName) &&
        validationHelper.validateRequestStringValue(address.address1) &&
        validationHelper.validateRequestStringValue(address.city) &&
        validationHelper.validateRequestStringValue(address.countryCode) &&
        validationHelper.validateRequestStringValue(address.phone) &&
        validationHelper.validateRequestStringValue(address.postalCode) &&
        validationHelper.validateRequestStringValue(address.stateCode);
};

module.exports = validationHelper;
