'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    // Get Form Details
    var giftCertificateForm = server.forms.getForm('giftCertificate');
    // Checking that formfield should be clear
    //giftCertificateForm.clear();
    // Render ISML Form with Meta Data
    res.render('giftCertificates/giftCertificateForm', {
        giftCertificateForm: giftCertificateForm
    });
    next();
});

var Transaction = require('dw/system/Transaction');
var BasketMgr = require('dw/order/BasketMgr');
var URLUtils = require('dw/web/URLUtils');
server.post('Save', function (req, res, next) {
    var giftCertificateForm = server.forms.getForm('giftCertificate');
    var giftCertificateLineItem = null;
    var amount = giftCertificateForm.base.amount.value;
    var recipientEmail = giftCertificateForm.base.friendsEmail.value;

    Transaction.wrap(function () {
        var currentBasket = BasketMgr.getCurrentOrNewBasket();
        giftCertificateLineItem = currentBasket.createGiftCertificateLineItem(amount, recipientEmail);;
        giftCertificateLineItem.setRecipientEmail(giftCertificateForm.base.friendsEmail.value);
        giftCertificateLineItem.setRecipientName(giftCertificateForm.base.friendsName.value);
        giftCertificateLineItem.setSenderName(giftCertificateForm.base.yourName.value);
        giftCertificateLineItem.setMessage('GiftCertificateForNewYear');
        return giftCertificateLineItem
    })






    res.redirect(URLUtils.url('Cart-Show'))
    next();
});

module.exports = server.exports();