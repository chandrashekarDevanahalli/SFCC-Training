'use strict';

var server = require('server');



server.get('Show', function (req, res, next) {
    // var data = customer.addressBook.preferredAddress;
    // var customerAddresses = customer.addressBook.addresses;
    res.render('display/tester');
    next();
});

module.exports = server.exports();