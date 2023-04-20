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
 * The hook validates all necessary values of billing address for creating an order with PayPal payment instrument
 * @param {dw.order.Basket} basket A current basket
 * @param {OrderAddress} billingAddress Document representing an order address.
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforePUT(basket, billingAddress) {
    const Resource = require('dw/web/Resource');
    const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
    const isBillingAddressValid = validateBillingAddress(billingAddress);

    if (!isBillingAddressValid) {
        return hooksHelper.createErrorStatus(
            Resource.msg('paypal.ocapi.error.billing.address.not.valid', 'locale', null)
        );
    }
}

exports.beforePUT = beforePUT;
