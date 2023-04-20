'use strict';

var URLUtils = require('dw/web/URLUtils');

function customerLogin(req, res, next) {
    //Check customer is a Vip group
    if (customer.isMemberOfCustomerGroup('VIP')) {
        res.redirect(URLUtils.url('Home-Show'));
        return next();
    } else if (customer.isAuthenticated()) {
        //if  non-vip customer logins redirecting to content asset page
        res.redirect(URLUtils.url('Page-Show', 'cid', 'customerLogin-vip'));
        return next();
    } else {
        //if user is not authenticated 
        return next(new Error('The page you are looking does not exist login first'));
    }
    next();
}

module.exports = {
    customerLogin: customerLogin
};