'use strict';

/**
 * @namespace  CheckoutServices
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');


server.extend(module.superModule);



server.prepend('SubmitPayment', function (req, res, next) {
    var GiftCertificateMgr = require('dw/order/GiftCertificateMgr');
    var BasketMgr = require('dw/order/BasketMgr');
    var paymentForm = server.forms.getForm('billing');
    var currentBasket = BasketMgr.getCurrentBasket();
    var basketTotalPrice = currentBasket.getTotalGrossPrice();
    var paymentInstrument = currentBasket.getGiftCertificatePaymentInstruments();

    if (paymentInstrument.length) {
        var giftCertificateCode = currentBasket.getGiftCertificatePaymentInstruments[0].giftCertificateCode;
        if (giftCertificateCode) {
            var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(giftCertificateCode);
            var giftCertificateBalance = giftCertificate.getBalance().value;
            if (giftCertificateBalance > basketTotalPrice) {
                paymentForm.paymentMethod.value = 'GIFT_CERTIFICATE'
            }
        }
    }
    next();
});

module.exports = server.exports();