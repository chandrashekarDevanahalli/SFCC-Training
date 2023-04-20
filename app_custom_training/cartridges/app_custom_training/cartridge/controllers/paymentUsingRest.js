'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var OrderMgr = require('dw/order/OrderMgr');
    var orderNumber = req.querystring.id;
    var orderDetails = OrderMgr.getOrder(orderNumber);
    var paymentInstrument = orderDetails.paymentInstrument;
    try {
        var merkleWalletValidate = require('*/cartridge/scripts/helpers/payment/merkleWalletWebservicePaymentHelper');
        // var good = merkleWalletValidate.good();
        var merkleWalletMessage = merkleWalletValidate.merkleWalletValidateCustomDetails(paymentInstrument);
    } catch (error) {
        var err = error.message;
        var a = '1';
    }

    res.json({
        merkleWalletMessage: merkleWalletMessage
    });
    next();
});

module.exports = server.exports();