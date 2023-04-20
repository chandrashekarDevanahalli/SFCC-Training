'use strict';

var BasketMgr = require('dw/order/BasketMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var Product = require('dw/catalog/Product');

function setCustomAttributes(currentBasket, personalizationObject) {
    var productObj = ProductMgr.getProduct(personalizationObject.pid);
    var hasPersonalization = false;
    if (personalizationObject.frontText || personalizationObject.backText) {
        hasPersonalization = True;
    }
    var allProductLineItems = currentBasket.getAllProductLineItems();
    for (var i = 0; i < allProductLineItems.length; i++) {
        var currentProductLineItems = allProductLineItems[i];
    }
    if (hasPersonalization) {
        Transaction.wrap(function () {
            currentProductLineItems.custom.frontText = personalizationObject.frontText;
            currentProductLineItems.custom.backText = personalizationObject.backText;
            currentProductLineItems.custom.containsPersonalizaion = personalizationObject.hasPersonalization;
        })
    }
}


function updateCustomAttributes() {


}

module.exports = {
    setCustomAttributes: setCustomAttributes,
    updateCustomAttributes: updateCustomAttributes
}