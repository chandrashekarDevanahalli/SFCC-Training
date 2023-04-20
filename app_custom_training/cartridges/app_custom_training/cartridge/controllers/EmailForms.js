'use strict';

var server = require('server')
var URLUtils = require('dw/web/URLUtils');
var emailhelper = require('*/cartridge/scripts/helpers/emailSubscriptionHelper');
var ArrayList = require('dw/util/ArrayList');

server.get('EmailSubscription', function (req, res, next) {
    res.render('display/emailSubscriptionForm', {
        actionURL: URLUtils.url('EmailForms-SaveEmailSubscription')
    })
    next();
});

//SaveForm details
server.post('SaveEmailSubscription', function (req, res, next) {
    var EmailDetails = emailhelper.emailSubscriptions(req);
    res.render('display/emailSubscriptionNotification', {
        values: req.form
    });

    //send details to mailhelper
    emailhelper.sendMail(EmailDetails);
    next();
});
module.exports = server.exports();