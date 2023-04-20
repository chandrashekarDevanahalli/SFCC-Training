'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var URLUtils = require('dw/web/URLUtils');



server.get('Show', function (req, res, next) {
    // Get helper
    var helper = require('../scripts/helpers/getCartproductsHelper')
    // Call helper function getCartProductLineItems
    var productDetails = helper.getCartProductLineItems();
    res.render('display/cartProducts', {
        productDetails: productDetails
    });
    next();
});
module.exports = server.exports();