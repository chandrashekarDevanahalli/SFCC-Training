'use string';

/**
 * Validates a billing address
 * @param {OrderAddress} billingAddress Document representing an order address.
 * @returns {boolean} true/false
 */
function validateBillingAddress(billingAddress) {
    const validationHelper = require('~/cartridge/scripts/paypal/helpers/validationHelper');

    return validationHelper.validateOrderAddress(billingAddress);
}

/**
 * The function is called before setting of the billing address to the basket
 * The hook validates all necessary values of billing address for creating an order with Braintree payment instrument
 * @param {dw.order.Basket} _ A current basket
 * @param {OrderAddress} billingAddress Document representing an order address.
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforePUT(_, billingAddress) {
    const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
    const Status = require('dw/system/Status');
    const Resource = require('dw/web/Resource');
    const isBillingAddressValid = validateBillingAddress(billingAddress);

    if (!isBillingAddressValid) {
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, Resource.msg('paypal.ocapi.error.billing.address.not.valid', 'locale', null));
    }
}

exports.beforePUT = beforePUT;
