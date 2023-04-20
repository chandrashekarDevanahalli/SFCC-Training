'use strict';

var Status = require('dw/system/Status');

var run = function (args) {
    var Order = require('dw/order/Order');
    var OrderMgr = require('dw/order/OrderMgr');
    var OrderHistory = require('dw/customer/OrderHistory');
    var SystemObjectMgr = require('dw/object/SystemObjectMgr');

    var a = Order.getShippingOrders();

    var sysObj = SystemObjectMgr.getAllSystemObjects("Order");

    return new Status(Status.OK);
};

module.exports.run = run;