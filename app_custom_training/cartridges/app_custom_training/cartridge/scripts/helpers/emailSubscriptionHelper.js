'use strict';

var Logger = require('dw/system/Logger');
var ArrayList = require('dw/util/ArrayList');

function emailSubscriptions(req) {
    var categoryList = new ArrayList();
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var subscriptionRecord = CustomObjectMgr.getCustomObject('EmailSubscription', req.form.email)
    var Transaction = require('dw/system/Transaction');
    // Get selected Category preference checkbox details
    const categoryItems = [
        req.form.Womens ? req.form.Womens : null,
        req.form.Mens ? req.form.Mens : null,
        req.form.Electronics ? req.form.Electronics : null
    ]
    for (let i = 0; i < categoryItems.length; i++) {
        if (categoryItems[i] !== null) {
            categoryList.add(categoryItems[i]);
        }
    }
    //save details in CustomObject
    Transaction.wrap(function () {
        if (!subscriptionRecord) {
            subscriptionRecord = CustomObjectMgr.createCustomObject('EmailSubscription', req.form.email)
        }
        subscriptionRecord.custom.firstName = req.form.fname;
        subscriptionRecord.custom.lastName = req.form.lname;
        subscriptionRecord.custom.categoryPeferences = categoryList;
    })
    var customerInfo = {
        email: req.form.email,
        firstName: req.form.fname,
        lastName: req.form.lname,
        categoryPreference: categoryList
    };
    return customerInfo;
}




function sendMail(customerInfo) {
    // call email helper function
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

    //emailObj
    var emailObj = {};
    emailObj.cc = ['chandrudp58@gmail.com'];
    emailObj.to = [customerInfo.email, 'Chandrashekar.devanahalli@merkle.com', 'ranjithasp77@gmail.com'];
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