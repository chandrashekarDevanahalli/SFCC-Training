'use strict';

var server = require('server');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var customCartHelper = require('*/cartridge/scripts/helpers/customCartHelper.js');
var BasketMgr = require('dw/order/BasketMgr');
var currentBasket = BasketMgr.getCurrentBasket();


server.get('Show', userLoggedIn.validateLoggedIn, function (req, res, next) {
    if (customer.isAuthenticated()) {
        var customerInfo = {
            email: customer.profile.email
        };
        customCartHelper.setCustomAttributes(currentBasket, customerInfo);
    }
    res.json();

    next();
});

module.exports = server.exports();