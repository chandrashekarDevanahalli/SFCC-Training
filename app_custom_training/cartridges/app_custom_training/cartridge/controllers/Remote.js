'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    res.render('display/main')
    next();
});

server.get('Start', server.middleware.include, function (req, res, next) {
    res.render('display/remote')

    next();
});

module.exports = server.exports();