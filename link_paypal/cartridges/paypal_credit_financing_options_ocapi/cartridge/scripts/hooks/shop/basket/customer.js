'use strict';

/**
 * The function is called before setting of customer information for the basket
 * The hook validates an email address that is required for creating order with Paypal payment instrument
 * @param {dw.order.Basket} _ A current basket
 * @param {CustomerInfo} customerInfo Document representing information used to identify a customer
 * @returns {Status} new Status. Depends of hook execution OK/ERROR
 */
function beforePUT(_, customerInfo) {
    const paypalConstants = require('~/cartridge/scripts/util/paypalConstants');
    const Status = require('dw/system/Status');
    const Resource = require('dw/web/Resource');

    const email = customerInfo.email;

    if (!email) {
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, Resource.msg('paypal.ocapi.error.email.address.isrequired', 'locale', null));
    } else if (!paypalConstants.EMAIL_PATTERN.test(email)) {
        return new Status(Status.ERROR, paypalConstants.CUSTOM_ERROR_TYPE, Resource.msg('paypal.ocapi.error.email.address.not.valid', 'locale', null));
    }
}

exports.beforePUT = beforePUT;
