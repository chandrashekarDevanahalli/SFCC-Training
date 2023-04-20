'use strict';

var server = require('server');
// Require middleware step
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
// Implemented Login middle step
server.get('Show', userLoggedIn.validateLoggedIn, function (req, res, next) {
    // Require helper
    var helper = require('../scripts/helpers/orderProductLineHelper');
    // call helper function
    var orderDetails = helper.getOrderDetails();
    res.render('display/orderProductLineitem', {
        data: orderDetails
    });
    next();
});
module.exports = server.exports();