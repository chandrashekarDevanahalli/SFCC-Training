'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Logger = require('dw/system/Logger');
var ContentMgr = require('dw/content/ContentMgr');

server.get('Show', server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    // Get Form Details
    var emailSubscriptionForm = server.forms.getForm('emailSubscription');
    // Checking that formfield should be clear
    emailSubscriptionForm.clear();
    // Render ISML Form with Meta Data
    res.render('emailSubscription/emailSubscribeForm', {
        emailSubscriptionForm: emailSubscriptionForm
    });
    next();
});




server.post('Save', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    try {
        //var content = {};
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var emailSubscriptionForm = server.forms.getForm('emailSubscription');
        if (emailSubscriptionForm.valid) {
            var subscriptionRecord = CustomObjectMgr.getCustomObject('EmailSubscription', emailSubscriptionForm.email.value);
            var Transaction = require('dw/system/Transaction');
            // emailSubscriptionForm Details store to customObject
            var contentAssetSubscribed = ContentMgr.getContent('ThankyouAlreadySubscribed')
            var Subscribed = contentAssetSubscribed.custom.body.source;
            if (subscriptionRecord) {
                res.json({
                    RecordAlreadyExists: true,
                    Subscribed: Subscribed
                });
            } else {
                var contentAssetAlreadySubscribed = ContentMgr.getContent('thankyouSubscribed')
                var Subscribed = contentAssetAlreadySubscribed.custom.body.source;
                Transaction.wrap(function () {
                    if (!subscriptionRecord) {
                        subscriptionRecord = CustomObjectMgr.createCustomObject('EmailSubscription', emailSubscriptionForm.email.value)
                    }
                    subscriptionRecord.custom.firstName = emailSubscriptionForm.firstName.value;
                    subscriptionRecord.custom.lastName = emailSubscriptionForm.lastName.value;
                });
                res.json({
                    Subscribed: Subscribed
                });
            }

        }
    } catch (error) {
        var e = error;
        Logger.error('Error in email Subscription- Save' + error.message)
    }

    next();
});

module.exports = server.exports();