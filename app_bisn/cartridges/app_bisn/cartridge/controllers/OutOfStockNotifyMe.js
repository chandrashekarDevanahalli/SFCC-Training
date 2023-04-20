'use strict';

var Logger = require('dw/system/Logger');
var ArrayList = require('dw/util/ArrayList');
var server = require('server');

server.get('Save', function (req, res, next) {
    try {
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var pid = req.querystring.pid;
        var emailAddress = req.querystring.emailAddress;
        var NotifyMeForm = server.forms.getForm('notifyMe');
        var Transaction = require('dw/system/Transaction');
        var customerRecord = CustomObjectMgr.getCustomObject('NotifyMe', emailAddress);
        if (customerRecord) {
            var productIdList = new ArrayList(customerRecord.custom.productIDs);
            productIdList.add(pid);
            Transaction.wrap(function () {
                customerRecord.custom.productIDs = productIdList;
            });
        } else {
            // Create new custom Object when user add product to cart
            Transaction.wrap(function () {
                var customerRecord = CustomObjectMgr.createCustomObject('NotifyMe', emailAddress);
                customerRecord.custom.productIDs = new ArrayList(pid);
            });
        }

        Logger.info('outOfStock.js:Details stored in the customObject');
        res.json({
            Message: 'Thank you, for subscribing you will recieve an email once item is available'
        })
    } catch (error) {
        var e = error.message;
        Logger.error('Error in email Subscription- Save' + error.message)
    }

    next();
});

module.exports = server.exports();