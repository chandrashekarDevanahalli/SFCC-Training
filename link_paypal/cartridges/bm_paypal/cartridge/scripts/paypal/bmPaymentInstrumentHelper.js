'use strict';

var PaymentMgr = require('dw/order/PaymentMgr');

var allowedProcessorsIds = 'PAYPAL';

/**
 * Returns paypal payment method ID
 * @returns {string} active paypal payment method id
 */
function getPaypalPaymentMethodId() {
    var activePaymentMethods = PaymentMgr.getActivePaymentMethods();
    var paypalPaymentMethodID;

    Array.some(activePaymentMethods, function (paymentMethod) {
        if (paymentMethod.paymentProcessor.ID === allowedProcessorsIds) {
            paypalPaymentMethodID = paymentMethod.ID;

            return true;
        }

        return false;
    });

    return paypalPaymentMethodID;
}

/**
 * Returns PayPal order payment instrument
 * @param {dw.order.Order} order - The order object
 * @returns {dw.order.OrderPaymentInstrument} payment instrument with id PAYPAL
 */
function getPaypalPaymentInstrument(order) {
    var paymentInstruments = order.getPaymentInstruments(getPaypalPaymentMethodId());
    return !empty(paymentInstruments) && paymentInstruments[0];
}

/**
 * If the order has a payment instrument with the ID of the PayPal payment method, return true
 * @param {dw.order.Order} order - The order object
 * @returns {boolean} returns true, if the order has a payment instrument with PayPal ID
 */
function isPaypalPaymentInstrument(order) {
    return !empty(order.getPaymentInstruments(getPaypalPaymentMethodId()));
}

module.exports = {
    isPaypalPaymentInstrument: isPaypalPaymentInstrument,
    getPaypalPaymentInstrument: getPaypalPaymentInstrument
};
