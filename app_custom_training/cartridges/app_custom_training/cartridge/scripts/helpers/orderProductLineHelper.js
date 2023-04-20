'use strict';

var ArrayList = require('dw/util/ArrayList');
var ProductMgr = require('dw/catalog/ProductMgr');
var Category = require('dw/catalog/Category');
var Product = require('dw/catalog/Product');


function getOrderDetails() {
    // Get Order History
    var orderHistory = customer.orderHistory.getOrders();
    // Converting seekableIterator to ArrayList or collection
    var orders = new ArrayList(orderHistory);
    //var orders = orderHistory.asList();
    var orderDetails = new ArrayList();
    var orderL1Category;
    // Each OrdersList have list of orders to get each order using first loop
    for (let j = 0; j < orders.length; j++) {
        var orderList = {};
        // productLineItems is collection of productLineItem
        var productLineItems = orders[j].productLineItems;
        var productLineItem; // Each ProductLineItem
        // Each Order have allProductLineItems to get each productDetails using second loop
        for (let i = 0; i < productLineItems.length; i++) {
            productLineItem = productLineItems[i];
            orderList.orderNo = orders[i].orderNo;
            orderList.orderProductID = productLineItem.productID;
            orderList.orderProductName = productLineItem.productName;
            orderList.orderGrossPrice = productLineItem.grossPrice;
            orderList.orderNetPrice = productLineItem.netPrice;
            orderList.orderTax = productLineItem.tax;
            //Get Product Object
            var product = ProductMgr.getProduct(productLineItem.productID);
            // Get L1 Category
            var result = product.variant ? product.variationModel.master.getPrimaryCategory() :
                product.getPrimaryCategory();
            while (!result.topLevel) {
                result = result.getParent();
            }
            orderList.orderL1Category = result.displayName;
            orderDetails.add(orderList);
        }
    }
    return orderDetails;
}
module.exports = {
    getOrderDetails: getOrderDetails
}







// var productID = ProductMgr.getProduct(productLineItem.productID);
// var res = productID.getPrimaryCategory()
// var result = productID.getPrimaryCategory();
// while (!result.topLevel) {
//     result = res.getParent();
// }
// var ab = result;
//var result = productID.variant ? productID.variationModel.master.getPrimaryCategory() : productID.getPrimaryCategory();


// orderL1Category = productLineItem.productLineItem.categories[0].ID;
// if (!orderL1Category.isTopLevel()) {
//     orderL1Category.getParent();
//
// }
// var category = CatalogMgr.getCategory(orderL1Category);
// var category = Catalog.getRoot()