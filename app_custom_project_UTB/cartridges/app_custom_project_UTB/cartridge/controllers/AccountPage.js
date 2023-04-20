'use strict';


var server = require('server');

/**
 * Account_page
 * @route Show
 */
server.get('Show', function (req, res, next) {
    res.render('Account_Page')
    next();
});

module.exports = server.exports();


/**
 * Login
 * @route save
 */
server.post('login', function (req, res, next) {

})