'use strict';

/**
 *
function emailSubscriptions(emailSubscriptionForm) {
 * @returns Email Subscription Form
 *
 */
var Logger = require('dw/system/Logger');
var ArrayList = require('dw/util/ArrayList');

function emailSubscriptions(emailSubscriptionForm) {

    var categoryList = new ArrayList();
    var formObj = emailSubscriptionForm.toObject();
    //getting all the keys of category 
    Object.keys(formObj.category).forEach(function (key) {
        var d = formObj.category[key]
        if (formObj.category[key] === true) {
            categoryList.add(key)
        }
    });

    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var subscriptionRecord = CustomObjectMgr.getCustomObject('EmailSubscription', emailSubscriptionForm.email.value);
    var Transaction = require('dw/system/Transaction');
    // emailSubscriptionForm Details store to customObject
    Transaction.wrap(function () {
        if (!subscriptionRecord) {
            subscriptionRecord = CustomObjectMgr.createCustomObject('EmailSubscription', emailSubscriptionForm.email.value)
        }
        subscriptionRecord.custom.firstName = emailSubscriptionForm.firstName.value;
        subscriptionRecord.custom.lastName = emailSubscriptionForm.lastName.value;
        subscriptionRecord.custom.categoryPeferences = categoryList;
        subscriptionRecord.custom.country = emailSubscriptionForm.country.countryCode.value;
    });

    var customerInfo = {
        email: emailSubscriptionForm.email.value,
        firstName: emailSubscriptionForm.firstName.value,
        lastName: emailSubscriptionForm.lastName.value,
        categoryPreference: categoryList,
        country: emailSubscriptionForm.country.countryCode.value
    };
    return customerInfo;
}
/**
 * Helper that sends an email to a customer. This will only get called if hook handler is not registered
 * @param {obj} emailObj - An object that contains information about email that will be sent
 * @param {string} emailObj.to - Email address to send the message to (required)
 * @param {string} emailObj.subject - Subject of the message to be sent (required)
 * @param {string} emailObj.from - Email address to be used as a "from" address in the email (required)
 * @param {int} emailObj.type - Integer that specifies the type of the email being sent out. See export from emailHelpers for values.
 * @param {string} template - Location of the ISML template to be rendered in the email.
 * @param {obj} context - Object with context to be passed as pdict into ISML template.
 */
/**
 *
 * @param {object} customerInfo 
 *
 */

function sendMail(customerInfo) {
    // call email helper function
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

    //emailObj
    var emailObj = {};
    emailObj.cc = ['chandrudp58@gmail.com'];
    emailObj.to = [customerInfo.email, 'Chandrashekar.devanahalli@merkle.com', 'chandrudp29@gmail'];
    emailObj.from = customerInfo.email;
    emailObj.subject = 'Category Subscribed';

    //template
    var template = 'display/emailSubscriptionTemplate';

    //context
    var context = {};
    context.customerInfo = customerInfo;

    // Send Email
    emailHelpers.send(emailObj, 'display/emailSubscriptionTemplate', context)
    Logger.info('Email sent successfully')
}
module.exports = {
    sendMail: sendMail,
    emailSubscriptions: emailSubscriptions
}