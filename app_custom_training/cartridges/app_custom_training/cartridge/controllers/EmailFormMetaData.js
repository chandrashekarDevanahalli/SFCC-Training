'use strict';

/**
 *
 * @namespace EmailFormMetaData
 * @route Show
 * @returns Email Subscription Form
 *
 */

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

server.get('Show', function (req, res, next) {
    // Get Form Details
    var emailSubscriptionForm = server.forms.getForm('emailSubscription');
    // Checking that formfield should be clear
    emailSubscriptionForm.clear();
    // Render ISML Form with Meta Data
    res.render('emailSubscription/emailSubscriptionFormMetadata', {
        emailSubscriptionForm: emailSubscriptionForm
    });
    next();
});

server.post('Save', function (req, res, next) {
    var emailSubscriptionForm = server.forms.getForm('emailSubscription');
    if (!emailSubscriptionForm.valid) {
        res.render('emailSubscription/emailSubscriptionFormMetadata', {
            emailSubscriptionForm: emailSubscriptionForm
        });
        return next();
    }

    res.render('display/emailSubscriptionNotification', {
        emailSubscriptionForm: emailSubscriptionForm
    });
    next();
});

server.getRoute('Save').on('route:BeforeComplete', function (req, res) {
    var emailSubscriptionForm = server.forms.getForm('emailSubscription');
    var emailSubscribeHelper = require('../scripts/helpers/emailSubscribeHelper')
    //Checking form is valid or not
    if (emailSubscriptionForm.valid) {
        var EmailDetails = emailSubscribeHelper.emailSubscriptions(emailSubscriptionForm)
        //send details to mailhelper
        emailSubscribeHelper.sendMail(EmailDetails);
    }
});
module.exports = server.exports();