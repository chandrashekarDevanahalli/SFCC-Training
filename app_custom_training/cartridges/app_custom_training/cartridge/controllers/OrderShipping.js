'use strict';


/**
 * @param 0rderID
 * @returns object
 */
var server = require('server');
var OrderMgr = require('dw/order/OrderMgr');

server.get('Show', function (req, res, next) {
    var orderObj = OrderMgr.getOrder('00002545');
    var orderbillObj = orderObj.billingAddress;
    var ordershipObj = orderObj.shipments[0].shippingAddress;

    res.render('display/ordershipping', {
        ordershipObj: ordershipObj,
        orderbillObj: orderbillObj
    })

    next();
});

module.exports = server.exports();