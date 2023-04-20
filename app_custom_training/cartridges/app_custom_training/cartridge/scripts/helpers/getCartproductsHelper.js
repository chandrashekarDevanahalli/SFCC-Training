'use strict';

var BasketMgr = require('dw/order/BasketMgr');
var ArrayList = require('dw/util/ArrayList');
var ProductMgr = require('dw/catalog/ProductMgr');

function getCartProductLineItems() {
    var basket = BasketMgr.getCurrentBasket().getAllProductLineItems();
    var productList = new ArrayList();
    var productItem;
    var product;
    var result;
    // check if basket is empty
    if (!empty(basket)) {
        for (let i = 0; i < basket.length; i++) {
            productItem = basket[i]
            product = basket[i].product
            result = product.variant ? product.variationModel.master.getPrimaryCategory() : product.getPrimaryCategory();
            while (!result.topLevel) {
                result = result.getParent();
            }
            // Get L1 Category
            var L1Category = result.displayName;
            var productLineItems = {
                productID: productItem.getProductID(),
                productName: productItem.getProductName(),
                price: productItem.getPrice(),
                category: L1Category,
                quantityValue: productItem.getQuantity()
            }
            productList.add(productLineItems);
        }
    } else {
        productList = null;
    }
    return productList;
}
module.exports = {
    getCartProductLineItems: getCartProductLineItems
}