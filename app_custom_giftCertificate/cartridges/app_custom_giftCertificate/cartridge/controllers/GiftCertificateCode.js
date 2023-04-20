'use strict';


var server = require('server');
var GiftCertificateMgr = require('dw/order/GiftCertificateMgr');
var Transaction = require('dw/system/Transaction');
var BasketMgr = require('dw/order/BasketMgr');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
var Status = require('dw/system/Status');

server.post('Check', function (req, res, next) {
    var giftCertificateCode = req.form.giftCertificateCode;
    var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(giftCertificateCode);
    try {
        if (giftCertificate && giftCertificate.STATUS_ISSUED == 1) {
            var giftCertificateBalance = giftCertificate.balance.value;
            res.setViewData({
                Message: 'The Remaining balance of your giftCertificate is $' + giftCertificateBalance
            });
        } else {
            res.setViewData({
                Message: giftCertificateCode + 'your gift certificate code is invalid'
            });
        }
    } catch (error) {
        res.setViewData({
            Message: error.message
        });
    }
    res.json();
    next();
})


server.post('ApplyCode', function (req, res, next) {
    var Status = require('dw/system/Status');
    var GiftCertificateStatusCodes = require('dw/order/GiftCertificateStatusCodes');
    var GiftCertificate = require('dw/order/GiftCertificate');
    var Logger = require('dw/system/Logger');

    var currentBasket = BasketMgr.getCurrentBasket();
    var giftCertificateCode = req.form.giftCertificateCode;

    if (!giftCertificateCode) {
        res.setViewData({
            result: 'Please fill the above field....!'
        });
        res.json();
        return next();
    }



    if (currentBasket) {
        var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(giftCertificateCode);
    } else {
        var newGCPaymentInstrument = Transaction.wrap(function () {
            var gcPaymentInstrument = currentBasket.createGiftCertificatePaymentInstrument(giftCertificate); //need to add
            basketCalculationHelpers.calculateTotals(currentBasket);
            return gcPaymentInstrument;
        });

    }

    var giftCertificateBalance = giftCertificate.balance.value;
    var currentBasketGrossTotal = currentBasket.getTotalGrossPrice();
    var maskedGiftCertificateCode = giftCertificate.getMaskedGiftCertificateCode();

    if (giftCertificateBalance >= currentBasketGrossTotal) {
        giftCertificateBalance -= currentBasketGrossTotal;
        res.setViewData({
            flag: true,
            status: Status.OK,
            result: '$' + currentBasketGrossTotal + 'has been redeemed from gift certificate'
        });
        res.json();
        return next();

    } else {
        res.setViewData({
            flag: true,
            status: Status.OK,
            result: '$' + giftCertificateBalance + 'has been redeemed from gift certificate'
        });
        res.json();
        return next();
    }


});


server.post('Remove', function (req, res, next) {
    var giftCertificateCode = req.form.giftCertificateCode;
    var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(giftCertificateCode);
    var currentBasket = BasketMgr.getCurrentBasket();
    try {
        Transaction.wrap(function () {
            var giftPaymentInstruments = currentBasket.getGiftCertificatePaymentInstruments(giftCertificate);
            while (giftPaymentInstruments.hasNext()) {
                var gcPaymentInstrument = giftPaymentInstruments.next();
                currentBasket.removePaymentInstrument(gcPaymentInstrument)
            }
        });
        basketCalculationHelpers.calculateTotals(currentBasket);

    } catch (error) {
        var Message = error.message;
    }
    res.json();
    next();
})




module.exports = server.exports();