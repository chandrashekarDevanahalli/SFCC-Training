'use strict';


var server = require('server');


server.get('Show', function (req, res, next) {
    res.render('main/loreal_paris_html_copy');
    next();
});

module.exports = server.exports();