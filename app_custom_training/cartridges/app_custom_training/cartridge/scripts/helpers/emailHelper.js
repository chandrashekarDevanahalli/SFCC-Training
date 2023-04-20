'use strict';

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

var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var ArrayList = require('dw/util/ArrayList');
var ProductMgr = require('dw/catalog/ProductMgr');
var URLUtils = require('dw/web/URLUtils');
var Logger = require('dw/system/Logger');

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
    emailObj.to = ['Chandrashekar.devanahalli@merklecxm.com', 'chandrudp29@gmail.com'];
    emailObj.from = 'chandrudp29@gmail.com';
    emailObj.subject = 'Product In your Cart Order Fast';

    //template
    var template = 'display/emailtemplate';

    // Get custom object
    var CustomObject = CustomObjectMgr.getCustomObject('email', customerInfo.email)
    // Get productids from customobject
    var productids = CustomObject.custom.productIDs;
    var productArrayList = new ArrayList();
    var product;
    var productName;
    var productID;
    try {
        for (let i = 0; i < productids.length; i++) {
            if (productids) {
                Logger.info('ProductID found in the customObject {0}', productids)
                product = ProductMgr.getProduct(productids[i])
                productName = product.getName();
                productID = product.getID();
                productArrayList.push({
                    productName,
                    productID
                });
            } else {
                throw new Error('product with ID {0} NOT FOUND in BM', productids);
            }
        }
    } catch (error) {
        Logger.error(error.message);
    }

    //context
    var context = {};
    context.customerInfo = customerInfo
    context.productArrayList = productArrayList


    // Send Email
    emailHelpers.send(emailObj, 'display/emailtemplate', context)
    Logger.info('Email sent successfully')
}
module.exports = {
    sendMail: sendMail
}