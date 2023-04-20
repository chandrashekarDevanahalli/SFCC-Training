'use strict';

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var ArrayList = require('dw/util/ArrayList');
var Logger = require('dw/system/Logger');


function setCustomAttributes(currentBasket, customerInfo) {
    var customerEmail = customerInfo.email
    var allProductLineItems = currentBasket.getProductLineItems();
    var productIdList = new ArrayList();
    for (let i = 0; i < allProductLineItems.length; i++) {
        var pid = allProductLineItems[i].productID;
        productIdList.add(pid);
    }
    // if custom object with given email is already present
    var customerRecord = CustomObjectMgr.getCustomObject('email', customerEmail);
    try {
        if (customerRecord) {
            Transaction.wrap(function () {
                customerRecord.custom.productIDs = productIdList;
            });
        } else {
            // Create new custom Object when user add product to cart
            Transaction.wrap(function () {
                var customerRecord = CustomObjectMgr.createCustomObject('email', customerEmail);
                customerRecord.custom.productIDs = productIdList;
            });
        }
    } catch (error) {
        Logger.error(error.message);
    }

    return;
}


function removeCustomAttributes(currentBasket, customerInfo) {
    var customerEmail = customerInfo.email
    var allProductLineItems = currentBasket.getProductLineItems();
    var productIdList = new ArrayList();
    var fun = allProductLineItems.length;
    if (allProductLineItems) {
        for (let i = 0; i < allProductLineItems.length; i++) {
            var pid = allProductLineItems[i].productID;
            productIdList.add(pid);
        }
        // Delete custom object when user remove product from cart
        var cartRecord = CustomObjectMgr.getCustomObject('email', customerEmail);
        try {
            if (cartRecord) {
                if (allProductLineItems.length > 0) {
                    Transaction.wrap(function () {
                        cartRecord.custom.productIDs = productIdList;
                    });
                } else {
                    Transaction.wrap(function () {
                        CustomObjectMgr.remove(cartRecord)
                    });
                }
            }
        } catch (error) {
            Logger.error(error.message);
        }

    }
    return;
}

module.exports = {
    setCustomAttributes: setCustomAttributes,
    removeCustomAttributes: removeCustomAttributes
}