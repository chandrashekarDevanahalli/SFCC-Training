'use strict';

/**
 * The function is called before setting of customer information for the basket
 * The hook validates an email address that is required for creating order with Paypal payment instrument
 * @param {dw.order.Basket} _basket A current basket
 * @param {CustomerInfo} customerInfo Document representing information used to identify a customer
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforePUT(_basket, customerInfo) {
    const Resource = require('dw/web/Resource');
    const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
    const hooksHelper = require('*/cartridge/scripts/paypal/helpers/hooksHelper');
    const email = customerInfo.email;

    let errorMessage;

    // Validates an email address
    if (!email) {
        errorMessage = Resource.msg('paypal.ocapi.error.email.address.isrequired', 'locale', null);
    } else if (!paypalConstants.EMAIL_PATTERN.test(email)) {
        errorMessage = Resource.msg('paypal.ocapi.error.email.address.not.valid', 'locale', null);
    }

    if (errorMessage) {
        return hooksHelper.createErrorStatus(
            errorMessage
        );
    }
}

exports.beforePUT = beforePUT;
