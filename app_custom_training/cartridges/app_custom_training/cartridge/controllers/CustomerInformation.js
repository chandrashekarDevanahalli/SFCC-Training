'use strict';

var server = require('server');
var Resource = require('dw/web/Resource');

server.post('Show', function (req, res, next) {
    var queryString = req.queryString;
    res.json({
        Message: Resource.msgf('customerInfo.authenticated.message', 'training', null, customer.getProfile().getFirstName(), customer
            .getProfile().getLastName())
    });
    next();
});

module.exports = server.exports();