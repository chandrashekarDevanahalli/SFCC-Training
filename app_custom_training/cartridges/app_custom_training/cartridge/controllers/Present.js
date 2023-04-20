'use strict';


var server = require('server');

server.get('Show', function (req, res, next) {
    var Helpers = require('*/cartridge/scripts/helpers/presentHelper');
    var data = Helpers.evenlyDivides();
    res.render('display/present', {
        data: data
    });
    next();
});

module.exports = server.exports();