'use strict';

var server = require('server');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');


server.get('Show', userLoggedIn.validateLoggedIn, function (req, res, next) {
    var helper = require('*/cartridge/scripts/helpers/checkNewarrivalProductsHelper.js');
    try {
        var ProductDetails = helper.checkProductLineItem();
    } catch (error) {
        return next(Error('Add products to the cart to check '))
    }
    res.render('display/checkProductLineItem', {
        ProductDetails: ProductDetails
    });
    next();
});

module.exports = server.exports();