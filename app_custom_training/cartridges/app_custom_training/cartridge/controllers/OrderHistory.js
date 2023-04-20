'use strict';

var server = require('server');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var ArrayList = require('dw/util/ArrayList');

server.get('Show', userLoggedIn.validateLoggedIn, function (req, res, next) {
    // Get order history of customer
    var orderHistory = customer.orderHistory.getOrders();
    // convert orderHistory to Array or List
    var productList = new ArrayList(orderHistory);
    //var san = orderHistorys.asList();
    var orderDetails = new ArrayList();
    var productLineItem;
    // Create object
    var product = {};
    for (let i = 0; i < productList.length; i++) {
        productLineItem = productList[i]
        product.orderNo = productLineItem.orderNo;
        product.orderBillingFirstName = productLineItem.billingAddress.getFirstName();
        product.orderBillingLastName = productLineItem.billingAddress.getLastName();
        product.orderSubtotal = productLineItem.adjustedMerchandizeTotalNetPrice;
        product.orderTax = productLineItem.totalTax;
        product.orderShippingCost = productLineItem.shippingTotalPrice;
        product.orderTotal = productLineItem.totalGrossPrice;
        orderDetails.add(product);
    }
    res.render('display/orderHistory', {
        data: orderDetails
    });
    next();
});

module.exports = server.exports();


//var product = array.push(res);
//var OrderHistory = require('dw/customer/OrderHistory');
// var f = orderHistory.getOrders(
//     'status!={0}',
//     'creationDate desc',
//     Order.ORDER_STATUS_REPLACED
// );
// var orderHelpers = require('*/cartridge/scripts/order/orderHelpers');
// var orderModel = orderHelpers.getOrderDetails(req);
// var Order = require('dw/order/Order');
// var o = Order.getCurrentOrder();
//var orders = OrderHistory.getOrders(req.currentCustomer);
//var order = OrderMgr.getOrder(req.currentCustomer);