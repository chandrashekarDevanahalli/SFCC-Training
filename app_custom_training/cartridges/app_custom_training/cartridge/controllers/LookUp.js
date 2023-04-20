'use strict';

var server = require('server');


server.get('Show', function (req, res, next) {
    var message = require('app_custom_training');
    res.json({
        message: message.getMessage()
    });
    next();
});


module.exports = server.exports();