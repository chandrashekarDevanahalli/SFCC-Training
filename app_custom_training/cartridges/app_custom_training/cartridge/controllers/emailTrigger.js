'use strict';


var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var ArrayList = require('dw/util/ArrayList');
var ProductMgr = require('dw/catalog/ProductMgr');
var URLUtils = require('dw/web/URLUtils');

function sendMail(customerInfo) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    //emailObj
    var emailObj = {};
    emailObj.to = 'Chandrashekar.devanahalli@merklecxm.com';
    emailObj.from = 'chandrudp29@gmail.com';
    emailObj.subject = 'Product In your Cart Order Fast';

    //template
    var template = 'display/emailtemplate';


    var CustomObject = CustomObjectMgr.getCustomObject('email', customerInfo.email)
    // get the object type definition
    var
    var ObjectTypeDefinition = CustomObject.describe()
    // get the custom object attribute definition
    var ObjectAttributeDefinition = ObjectTypeDefinition.getCustomAttributeDefinition('productIDs');
    // get the collection of object attribute value definitions
    var Collection = ObjectAttributeDefinition.getValues();
    var len = Collection.length;
    var productArrayList = new ArrayList();
    try {
        for (let i = 0; i < Collection.length; i++) {
            var product = ProductMgr.getProduct(Collection[i])
            var name = product.getName();
            var productID = product.getID();
            productArrayList.push({
                name,
                productID
            });
        }
    } catch (error) {
        var a = error.Message;
    }

    //context
    var context = {};
    context.customerInfo = customerInfo
    //context.productArrayList = productArrayList



    emailHelpers.send(emailObj, 'display/emailtemplate', context)


}

module.exports = {
    sendMail: sendMail
}