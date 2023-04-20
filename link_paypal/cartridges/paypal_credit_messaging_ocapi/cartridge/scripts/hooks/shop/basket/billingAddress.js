'use string';

const validationHelper = require('~/cartridge/scripts/paypal/helpers/validationHelper');

/**
 * Validates a billing address
 * @param {OrderAddress} billingAddress Document representing an order address.
 * @returns {boolean} true/false
 */
function validateBillingAddress(billingAddress) {
    return validationHelper.validateOrderAddress(billingAddress);
}

/**
 * The function is called before setting of the billing address to the basket
 * The hook validates all necessary values of billing address for creating an order with Braintree payment instrument
 * @param {dw.order.Basket} _basket A current basket
 * @param {OrderAddress} billingAddress Document representing an order address.
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforePUT(_basket, billingAddress) {
    const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
    const Status = require('dw/system/Status');
    const Resource = require('dw/web/Resource');
    const Logger = require('dw/system/Logger');
    const isBillingAddressValid = validateBillingAddress(billingAddress);

    if (!isBillingAddressValid) {
        Logger.error(Resource.msg('paypal.ocapi.error.billing.address.not.valid', 'locale', null));
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, Resource.msg('paypal.ocapi.error.billing.address.not.valid', 'locale', null));
    }
}

exports.beforePUT = beforePUT;
