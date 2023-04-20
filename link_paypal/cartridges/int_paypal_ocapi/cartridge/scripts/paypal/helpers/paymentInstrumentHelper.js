'use strict';

/**
 * Deprecated method, must to be modify.
 * Calculates the amount to be payed by a non-gift certificate payment instrument based
 * on the given basket. The method subtracts the amount of all redeemed gift certificates
 * from the order total and returns this value.
 *
 * @param {Object} lineItemCtnr - LineIteam Container (Basket or Order)
 * @returns {dw.value.Money} non gift certificate amount
 */
function calculateNonGiftCertificateAmount(lineItemCtnr) {
    const Money = require('dw/value/Money');
    let giftCertTotal = new Money(0.0, lineItemCtnr.currencyCode);
    let gcPaymentInstrs = lineItemCtnr.getGiftCertificatePaymentInstruments();
    let iter = gcPaymentInstrs.iterator();
    let orderPI = null;

    while (iter.hasNext()) {
        orderPI = iter.next();
        giftCertTotal = giftCertTotal.add(orderPI.getPaymentTransaction().getAmount());
    }

    let orderTotal = lineItemCtnr.totalGrossPrice;

    return orderTotal.subtract(giftCertTotal);
}

/**
 * Return PayPal order payment instrument
 *
 * @param {dw.order.LineItemCtnr} basket - Basket
 * @returns {dw.order.OrderPaymentInstrument} payment instrument with id PAYPAL
 */
function getPaypalPaymentInstrument(basket) {
    const payPalConstants = require('*/cartridge/scripts/util/paypalConstants');
    const paymentInstruments = basket.getPaymentInstruments(payPalConstants.PAYMENT_METHOD_ID_PAYPAL);

    return !empty(paymentInstruments) && paymentInstruments[0];
}

module.exports = {
    calculateNonGiftCertificateAmount: calculateNonGiftCertificateAmount,
    getPaypalPaymentInstrument: getPaypalPaymentInstrument
};
