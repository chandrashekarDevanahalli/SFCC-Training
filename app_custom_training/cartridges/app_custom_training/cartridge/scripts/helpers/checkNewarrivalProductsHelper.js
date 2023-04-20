'use strict';

var BasketMgr = require('dw/order/BasketMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

function checkProductLineItem() {
    var currentBasket = BasketMgr.getCurrentBasket()
    if (!empty(currentBasket)) {
        // Get CurrentBasket AllproductLineItems
        var currentBasketProductList = currentBasket.getProductLineItems();
        // Get Shipment of current Basket
        var shipment = currentBasket.getShipments()[0];
        var newarrivals = `Checked in ProductLineItem, Shipment, Basket and order level 
        attributes ID 'containsNewArrivals' updated`
        var rrr = currentBasketProductList.length;
        for (let i = 0; i < currentBasketProductList.length; i++) {
            // 
            var productID = currentBasketProductList[i].productID;
            var product = ProductMgr.getProduct(productID);
            var result = product.variant ? product.variationModel.master.getPrimaryCategory() : product.getPrimaryCategory();
            while (!result.topLevel) {
                result = result.getParent();
            }
            var L1Category = result.displayName;
            // var x = currentBasketProductList.custom.containsNewArrivals;
            // var xc = shipment.custom.containsNewArrivals;
            // var xcv = currentBasket.custom.containsNewArrivals;
            if (L1Category === 'Mens') {
                try {
                    Transaction.wrap(function () {
                        currentBasketProductList.custom.containsNewArrivals = true;
                        shipment.custom.containsNewArrivals = true;
                        currentBasket.custom.containsNewArrivals = true;

                    });
                } catch (error) {
                    Logger.error(error.message);
                    //return newarrivals = "Error in transaction update attribute value";
                }
                break;
            }
            return newarrivals = "Unable able to update attribute value";
        }
    } else {
        res.redirect(URLUtils.url('Home-Show'));
    }

    return newarrivals;
}

module.exports = {
    checkProductLineItem: checkProductLineItem
}