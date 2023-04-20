'use strict';


var server = require('server');
var URLUtils = require('dw/web/URLUtils');

server.get('Show', function (req, res, next) {
    // Require Helper function
    var customer = require('../scripts/helpers/customerAddressHelper')
    // call helper function 
    var authenticated = customer.customerAuthenticated();
    //check is customer authenticated
    if (authenticated) {
        // Get customer address
        var customerAddressesData = customer.customerAddress();
        res.render('display/customerAddress', {
            data: customerAddressesData
        });
    } else {
        // if customer is not authenticated redirecting to Login-Show
        res.redirect(URLUtils.url('Login-Show'))
    }
    next();
});


module.exports = server.exports();