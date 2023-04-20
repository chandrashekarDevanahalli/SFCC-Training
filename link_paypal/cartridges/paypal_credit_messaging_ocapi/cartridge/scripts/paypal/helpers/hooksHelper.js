'use strict';

let hooksHelper = {};

/**
 * Returns an object from request query strings
 * @returns {Object} An object
 */
hooksHelper.createObjectFromQueryString = function () {
    let resultObj = {};

    if (request.httpQueryString !== null) {
        request.httpQueryString.split('&').forEach(function (queryParam) {
            let queryParamArray = queryParam.split('=');

            resultObj[queryParamArray[0]] = queryParamArray[1];
        });
    }

    return resultObj;
};

/**
 * Creates a status object for failed OCAPI flow
 * @param {Object|string} error An error
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
hooksHelper.createErrorStatus = function (error) {
    const Status = require('dw/system/Status');
    const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
    const payPalUtils = require('~/cartridge/scripts/paypal/paypalUtils');

    const message = error.message || error;
    const code = error.code || paypalConstants.CUSTOM_ERROR_TYPE;

    payPalUtils.createErrorLog(message);

    return new Status(Status.ERROR, code, message);
};

module.exports = hooksHelper;
