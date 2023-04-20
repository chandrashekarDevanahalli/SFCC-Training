'use strict';

var Site = require('dw/system/Site');
var ProductMgr = require('dw/catalog/ProductMgr');
var ArrayList = require('dw/util/ArrayList');

var getProductID = function () {
    // Get ProductIDs from Sitepreference
    var productids = Site.current.getCustomPreferenceValue('ProductIDs');
    return productids
}

function getProductList(productidList) {
    var productArrayList = new ArrayList();
    for (let i = 0; i < productidList.length; i++) {
        //Get product object
        var product = ProductMgr.getProduct(productidList[i])
        if (!empty(product)) {
            var a = {
                ID: product.ID,
                name: product.name,
                brand: product.brand
            }
            productArrayList.add(a)
        }
    }
    return productArrayList
}

module.exports = {
    getProductID: getProductID,
    getProductList: getProductList
};